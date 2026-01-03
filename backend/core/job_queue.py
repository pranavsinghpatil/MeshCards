"""
Job Queue System for MeshCards
Handles API rate limits by queuing requests and processing them sequentially
"""
import asyncio
from datetime import datetime, timedelta
from collections import deque
from typing import Optional, Dict, Any
import uuid
from enum import Enum

class JobStatus(Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class QueuedJob:
    def __init__(self, job_id: str, user_id: str, data: Dict[str, Any]):
        self.job_id = job_id
        self.user_id = user_id
        self.data = data
        self.status = JobStatus.QUEUED
        self.created_at = datetime.now()
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.result: Optional[Any] = None
        self.error: Optional[str] = None
        self.position: int = 0

class JobQueue:
    """
    Manages a queue of deck generation jobs to prevent API rate limit issues.
    
    Features:
    - Sequential processing (one at a time)
    - Position tracking
    - Estimated wait time
    - Automatic retry on failure
    """
    
    def __init__(self, delay_between_jobs: float = 6.0):
        self.queue: deque[QueuedJob] = deque()
        self.jobs: Dict[str, QueuedJob] = {}  # job_id -> QueuedJob
        self.current_job: Optional[QueuedJob] = None
        self.delay_between_jobs = delay_between_jobs  # seconds
        self.lock = asyncio.Lock()
        self.processing = False
        
    async def add_job(self, user_id: str, data: Dict[str, Any]) -> str:
        """Add a new job to the queue"""
        async with self.lock:
            job_id = str(uuid.uuid4())
            job = QueuedJob(job_id, user_id, data)
            job.position = len(self.queue) + 1
            
            self.queue.append(job)
            self.jobs[job_id] = job
            
            # Start processing if not already running
            if not self.processing:
                asyncio.create_task(self._process_queue())
            
            return job_id
    
    async def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get current status of a job"""
        job = self.jobs.get(job_id)
        if not job:
            return None
        
        # Update position in queue
        if job.status == JobStatus.QUEUED:
            job.position = self._get_position(job_id)
        
        return {
            "job_id": job.job_id,
            "status": job.status.value,
            "position": job.position if job.status == JobStatus.QUEUED else 0,
            "queue_length": len(self.queue),
            "estimated_wait_seconds": self._estimate_wait_time(job),
            "created_at": job.created_at.isoformat(),
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "result": job.result,
            "error": job.error
        }
    
    def _get_position(self, job_id: str) -> int:
        """Get current position in queue"""
        for i, job in enumerate(self.queue, 1):
            if job.job_id == job_id:
                return i
        return 0
    
    def _estimate_wait_time(self, job: QueuedJob) -> int:
        """Estimate wait time in seconds"""
        if job.status != JobStatus.QUEUED:
            return 0
        
        position = self._get_position(job.job_id)
        if position == 0:
            return 0
        
        # Estimate: position * (avg_processing_time + delay)
        # Assume avg processing time is 15 seconds
        avg_processing_time = 15
        return int((position - 1) * (avg_processing_time + self.delay_between_jobs))
    
    def set_status_callback(self, callback):
        """Set callback for status updates"""
        self.status_callback = callback

    async def _process_queue(self):
        """Process jobs in the queue one by one"""
        self.processing = True
        
        try:
            while self.queue:
                async with self.lock:
                    if not self.queue:
                        break
                    
                    job = self.queue.popleft()
                    self.current_job = job
                    job.status = JobStatus.PROCESSING
                    job.started_at = datetime.now()
                    
                    # Sync via callback
                    if hasattr(self, 'status_callback') and self.status_callback:
                        self.status_callback(job.job_id, "processing")
                
                # Process the job (outside lock to allow status checks)
                try:
                    result = await self._execute_job(job)
                    job.result = result
                    job.status = JobStatus.COMPLETED
                    job.completed_at = datetime.now()
                    
                    # Sync via callback
                    if hasattr(self, 'status_callback') and self.status_callback:
                        self.status_callback(job.job_id, "completed")
                        
                except Exception as e:
                    job.error = str(e)
                    job.status = JobStatus.FAILED
                    job.completed_at = datetime.now()
                    print(f"Job {job.job_id} failed: {e}")
                    
                    # Sync via callback
                    if hasattr(self, 'status_callback') and self.status_callback:
                        self.status_callback(job.job_id, "failed", str(e))
                
                self.current_job = None
                
                # Wait before processing next job (rate limiting)
                if self.queue:
                    await asyncio.sleep(self.delay_between_jobs)
        
        finally:
            self.processing = False
    
    async def _execute_job(self, job: QueuedJob) -> Any:
        """Execute the actual job (deck generation)"""
        # Import here to avoid circular dependency
        from backend.main import generate_deck_task
        
        # Extract job data
        text = job.data.get('text', '')
        config_data = job.data.get('config', {})
        provider = job.data.get('provider', 'gemini')
        user_key = job.data.get('user_key', '')
        images_enabled = job.data.get('images_enabled', False)
        user_id = job.user_id
        image_files = job.data.get('image_files', [])
        
        # Call the generation function
        # Note: This is synchronous, so we run it in executor
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            generate_deck_task,
            job.job_id,
            text,
            config_data,
            provider,
            user_key,
            images_enabled,
            user_id,
            image_files
        )
        
        return {"status": "completed"}
    
    async def cleanup_old_jobs(self, max_age_hours: int = 24):
        """Remove old completed/failed jobs"""
        async with self.lock:
            cutoff = datetime.now() - timedelta(hours=max_age_hours)
            to_remove = [
                job_id for job_id, job in self.jobs.items()
                if job.completed_at and job.completed_at < cutoff
            ]
            
            for job_id in to_remove:
                del self.jobs[job_id]
            
            return len(to_remove)

# Global queue instance
job_queue = JobQueue(delay_between_jobs=6.0)  # 6 seconds between jobs

# Cleanup task (run periodically)
async def cleanup_old_jobs_task():
    """Background task to cleanup old jobs (completed/failed)"""
    while True:
        await asyncio.sleep(3600)  # Every hour
        removed = await job_queue.cleanup_old_jobs(max_age_hours=24)
        if removed > 0:
            print(f"Cleaned up {removed} old jobs")
