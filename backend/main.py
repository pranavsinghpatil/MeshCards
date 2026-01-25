from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Request, Header
# Trigger reload
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List
import shutil
import os
import asyncio
import tempfile
import random
import uuid
from datetime import datetime
import time
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import urllib.request
import json
import traceback
from pypdf import PdfReader

# Suppress annoying warnings
import warnings
warnings.filterwarnings('ignore', category=DeprecationWarning, module='pypdf')
warnings.filterwarnings('ignore', category=UserWarning, module='pydantic')
warnings.filterwarnings('ignore', message='.*ARC4.*')
warnings.filterwarnings('ignore', message='.*model_.*')

from backend.core.llm import get_llm_client
from backend.core.generator import FlashcardGenerator
from backend.core.schemas import DeckConfig, FeedbackRequest


from backend.core.anki import AnkiDeckBuilder
from backend.core.images import get_image_generator
from backend.core.config import settings
from backend.core.logging import logger
from backend.core.auth import get_current_user, check_quota, increment_quota
from backend.core.error_reporter import report_error
from backend.core.storage import get_deck_storage
from backend.core.job_queue import job_queue
from backend.core.sponsor import check_sponsor
from backend.core.auth import get_admin_stats
from backend.core.webhook_handlers import handle_bmc_webhook, handle_github_webhook
from backend.core.supabase import get_supabase

# Setup Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.APP_NAME, version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Job Store (Note: Doesn't persist across restarts or serverless instances)
jobs: Dict[str, dict] = {}

# Status Callback for Job Queue
def update_job_status(job_id: str, status: str, error: str = None):
    if job_id in jobs:
        jobs[job_id]["status"] = status
        if error:
            jobs[job_id]["error"] = error

# Register callback
job_queue.set_status_callback(update_job_status)

@app.on_event("startup")
async def startup_event():
    # Start the job queue cleanup task (removes old completed/failed jobs after 24h)
    from backend.core.job_queue import cleanup_old_jobs_task
    asyncio.create_task(cleanup_old_jobs_task())
    
    # Start the global jobs dict and file cleanup task
    asyncio.create_task(cleanup_jobs_store_task())
    
    logger.info("Background cleanup tasks started")

async def cleanup_jobs_store_task():
    """Periodically cleans up the in-memory jobs dict and temp files"""
    while True:
        await asyncio.sleep(3600)  # Every hour
        
        now = time.time()
        max_age = 24 * 3600  # 24 hours
        
        to_delete = []
        for job_id, job in jobs.items():
            created_at = job.get("created_at", 0)
            if now - created_at > max_age:
                to_delete.append(job_id)
        
        for job_id in to_delete:
            job = jobs[job_id]
            # Cleanup physical file
            if "file_path" in job:
                cleanup_file(job["file_path"])
            # Remove from dict
            del jobs[job_id]
            
        if to_delete:
            logger.info(f"Cleaned up {len(to_delete)} expired jobs and files")

def cleanup_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
            logger.info(f"Cleaned up {path}")
    except Exception as e:
        logger.error(f"Cleaning up {path} failed: {e}")

def get_real_api_key(provider: str, user_key: Optional[str] = None) -> str:
    """
    Validates availability of an API key.
    Logic moved to main.py -> submit_job to handle Sponsor vs Free logic.
    This now simply returns the key if present, or tries system ENV.
    """
    if user_key and user_key.strip():
        return user_key
    
    # Fallback to system env if passed (usually for Sponsors)
    env_key = None
    if provider == "gemini":
        env_key = settings.GEMINI_API_KEY
    elif provider == "novita":
        env_key = settings.NOVITA_API_KEY
    elif provider == "openai":
        env_key = settings.OPENAI_API_KEY
    elif provider == "anthropic":
        env_key = settings.ANTHROPIC_API_KEY
        
    if env_key:
        return env_key

    # Failure case
    if provider == "gemini":
         raise ValueError("byok_required|Gemini API Key Required (Free users must provide own key)")
    else:
         raise ValueError(f"API Key Required for {provider}")

def log_error_to_github(e: Exception, context: str = "", user_id: str = None, request_data: dict = None):
    """
    Logs full error details to a GitHub Issue and returns a simplified message.
    Now uses the enhanced error_reporter module with sanitization and better formatting.
    """
    # 1. Log locally/console
    tb_str = traceback.format_exc()
    error_type = type(e).__name__
    error_msg = str(e)
    logger.error(f"FATAL ERROR ({context}): {error_msg}\n{tb_str}")
    
    # 2. Use enhanced error reporter to create GitHub issue
    try:
        report_error(
            error=e,
            context=context,
            user_id=user_id,
            request_data=request_data,
            severity="critical" if "critical" in context.lower() else "error"
        )
    except Exception as report_err:
        logger.error(f"Error reporter failed: {report_err}")
    
    # 3. Return simplified info for frontend
    return f"Error Code: {error_type} | Title: {context} Failed"

def generate_deck_task(job_id: str, text: str, config_data: dict, provider: str, user_key: str, images_enabled: bool, user_id: str = None, image_files: list = None):
    try:
        jobs[job_id]["status"] = "processing"
        
        # 1. Initialize LLM
        api_key = get_real_api_key(provider, user_key)
        llm_client = get_llm_client(provider, api_key, config_data.get('model_name'))
        generator = FlashcardGenerator(llm_client)

        # 2. Generate Cards
        logger.info(f"Job {job_id}: Generating cards with {provider}...")
        config = DeckConfig(**config_data)
        
        # If we have images, create a multimodal prompt for vision models
        if image_files and provider in ["gemini", "novita"]:
            # Build prompt with images
            prompt_parts = []
            
            # Add text instruction first
            if text.strip():
                prompt_parts.append(text)
            else:
                prompt_parts.append("Analyze the following image(s) and create flashcards from the content:")
            
            # Add images
            for img_file in image_files:
                prompt_parts.append(img_file)  # Dict with type, path, filename
            
            logger.info(f"Job {job_id}: Processing {len(image_files)} image(s) with vision model")
            cards = generator.generate_flashcards_multimodal(prompt_parts, config)
        else:
            # Text-only generation with progress reporting
            def progress_callback(msg):
                if job_id in jobs:
                    jobs[job_id]["message"] = msg
            
            cards = generator.generate_flashcards(text, config, on_progress=progress_callback)
        
        if not cards:
            raise ValueError("No cards generated by AI.")

        # 3. Generate Images (if enabled)
        image_map = {}
        if images_enabled and settings.ENABLE_IMAGE_GEN:
            logger.info(f"Job {job_id}: Generating images...")
            img_key = api_key if provider == "gemini" else os.getenv("GEMINI_API_KEY") 
            if img_key:
                img_gen = get_image_generator("gemini", img_key)
                if img_gen:
                    temp_dir = tempfile.mkdtemp()
                    for i, card in enumerate(cards):
                        if card.image_prompt:
                            img_filename = f"card_{i}_{random.randint(1000,9999)}.png"
                            img_path = os.path.join(temp_dir, img_filename)
                            # Simulating basic concurrency here would be better, but sequential for safety
                            if img_gen.generate_image(card.image_prompt, img_path):
                                image_map[i] = img_path

        # 4. Create .apkg
        builder = AnkiDeckBuilder()
        output_filename = f"{config.name.replace(' ', '_')}.apkg"
        output_path = os.path.join(tempfile.gettempdir(), f"{job_id}_{output_filename}")
        
        if image_map:
            builder.create_apkg_with_images(cards, config.name, output_path, image_map)
        else:
            builder.create_apkg(cards, config.name, output_path)
            
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["file_path"] = output_path
        jobs[job_id]["filename"] = output_filename
        logger.info(f"Job {job_id}: Completed successfully. File at {output_path}")
        
        # Store deck (Supabase in prod, local in dev)
        storage = get_deck_storage()
        storage_path = storage.store_deck(output_path, output_filename, user_id or "anonymous")
        if storage_path:
            jobs[job_id]["storage_path"] = storage_path
        
        # 5. Increment quota ONLY after successful generation
        if user_id:
            increment_quota(user_id)
            logger.info(f"Job {job_id}: Incremented quota for user {user_id}")
        
        # 6. Clean up temporary image files
        if image_files:
            for img_file in image_files:
                try:
                    cleanup_file(img_file.get('path'))
                except Exception as e:
                    logger.warning(f"Failed to cleanup image file: {e}")
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Generation task failed: {error_msg}")
        
        # Check if it's an API limit or BYOK error
        if "API_LIMIT_EXCEEDED" in error_msg or "BYOK_REQUIRED" in error_msg:
            status = "api_limit_exceeded" if "API_LIMIT_EXCEEDED" in error_msg else "byok_required"
            msg = error_msg.split("|")[1] if "|" in error_msg else error_msg
            
            jobs[job_id]["status"] = status
            jobs[job_id]["error"] = msg
            logger.warning(f"Job {job_id}: {status} - {msg}")
            
            # Re-raise so job queue also knows it failed
            raise e
        
        # Log full error to GitHub with user context
        simple_error = log_error_to_github(
            e, 
            context=f"Deck Generation (Job {job_id})", 
            user_id=user_id
        )
        
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = simple_error
        
        # Re-raise so job queue also knows it failed
        raise e


@app.post("/api/feedback")
async def submit_feedback(
    type: str = Form(...),
    message: str = Form(...),
    email: Optional[str] = Form(None),
    rating: int = Form(0),
    file: Optional[UploadFile] = File(None)
):
    # 1. Log to console (Basis)
    log_msg = f"FEEDBACK [{type}]: {message} ({rating}/5) - {email}"
    if file:
        log_msg += f" [Attachment: {file.filename}]"
    logger.info(log_msg)
    
    # 2. Local Log (Dev)
    if settings.ENV != "production":
        try:
            with open("feedback.log", "a") as f:
                f.write(f"[{time.ctime()}] {log_msg}\n")
        except: pass
    
    # 3. Handle file upload if present
    file_url = None
    if file and settings.GITHUB_TOKEN and settings.GITHUB_REPO:
        try:
            # Read file content
            file_content = await file.read()
            import base64
            file_b64 = base64.b64encode(file_content).decode('utf-8')
            
            # Upload to GitHub as a gist or issue attachment
            # For now, we'll include it as base64 in the issue
            # In production, you might want to upload to a CDN or GitHub releases
            file_url = f"data:{file.content_type};base64,{file_b64[:100]}..." # Truncated for display
            logger.info(f"File uploaded: {file.filename} ({len(file_content)} bytes)")
        except Exception as e:
            logger.error(f"Failed to process file upload: {e}")
        
    # 4. GitHub Issue Integration
    if settings.GITHUB_TOKEN and settings.GITHUB_REPO:
        try:
            url = f"https://api.github.com/repos/{settings.GITHUB_REPO}/issues"
            
            # Build issue body
            body = f"**Rating:** {rating}/5\n**Email:** {email}\n**Type:** {type}\n\n**Message:**\n{message}"
            
            if file:
                body += f"\n\n**Attachment:** `{file.filename}` ({file.content_type})"
                if file_url:
                    body += f"\n*File size: {len(file_content)} bytes*"
            
            data = {
                "title": f"User Feedback: {type.title()}",
                "body": body,
                "labels": ["feedback", "user-submitted"]
            }
            
            req = urllib.request.Request(
                url, 
                data=json.dumps(data).encode("utf-8"), 
                headers={
                    "Authorization": f"token {settings.GITHUB_TOKEN}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": settings.APP_NAME
                }
            )
            with urllib.request.urlopen(req) as res:
                if res.status == 201:
                    logger.info("Feedback posted to GitHub Issues")
        except Exception as e:
            logger.error(f"Failed to post feedback to GitHub: {e}")

    return {"status": "received", "message": "Feedback submitted."}


@app.get("/api/config")
def get_config():
    """Returns public configuration for the frontend."""
    return {
        "enable_ollama": settings.ENABLE_OLLAMA,
        "enable_images": settings.ENABLE_IMAGE_GEN,
        "env": settings.ENV,
        # Frontend needs Supabase Config for Auth
        "supabase_url": settings.SUPABASE_URL,
        "supabase_anon_key": settings.SUPABASE_KEY,
        # Access Control Settings (NEW)
        "novita_access_mode": settings.NOVITA_ACCESS_MODE,
        "gemini_mode": settings.GEMINI_MODE
    }

# Health check endpoints for Leapcell
@app.get("/kaithheathcheck")
@app.get("/kaithhealthcheck")
@app.get("/health")
def health_check():
    """Health check endpoint for deployment platforms."""
    return {"status": "ok", "service": "meshcards"}

@app.post("/generate")
@limiter.limit(settings.RATE_LIMIT_FREE)
async def submit_job(
    request: Request,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    provider: str = Form("gemini"),
    model: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    deck_name: str = Form("MeshCards Deck"),
    difficulty: str = Form("Intermediate"),
    style: str = Form("Mixed"),
    max_cards: int = Form(20),
    images: bool = Form(False),
    custom_instructions: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    # 1. STRICT AUTH REQUIREMENT - Only signed-in users can generate
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Please sign in to generate flashcards."
        )
    
    # 2. Check Daily Quota (2 decks per day, resets at 12 AM IST)
    # Sponsors get 5 decks/day. Free users get 2 decks/day.
    # We enforce this limit regardless of API key usage to manage server load (OCR, PDF processing etc.)
    check_quota(user)
    
    is_sponsor = check_sponsor(user.id, email=user.email)

    # 3. Determine Execution Mode & API Key Requirements
    # Logic: Sponsors get "Shared" mode (System Key) for everything.
    #        Free users get "BYOK" mode (Must provide key) for everything.
    
    real_api_key = api_key # Default to what was sent
    
    if provider == "novita":
        if is_sponsor:
             # Sponsor: Use System Key (if they didn't provide one, or even if they did, prefer system?)
             # Actually, if they provided one, let them use it. If not, use system.
             if not real_api_key:
                 real_api_key = settings.NOVITA_API_KEY
                 logger.info(f"Sponsor {user.id} using System Novita Key.")
        else:
            # Free User: MUST provide key
            if not real_api_key:
                 raise HTTPException(
                    status_code=403,
                    detail=(
                        "💎 Rare Models (Llama 3.3, Qwen 2.5) are restricted.\n\n"
                        "Option 1: Become a Sponsor to use them for free.\n"
                        "Option 2: Provide your own Novita API Key in Settings."
                    )
                )
            logger.info(f"Free user {user.id} using OWN Novita Key.")

    elif provider == "gemini":
        if is_sponsor:
            # Sponsor: Use System Key if available
            if not real_api_key:
                real_api_key = settings.GEMINI_API_KEY
                logger.info(f"Sponsor {user.id} using System Gemini Key.")
        else:
            # Free User: MUST provide key (Enforce BYOK)
            if not real_api_key:
                # But wait, did we set GEMINI_MODE to 'shared' in .env?
                # The user wants "free accounts can generate 2 decks by there key only"
                # So we FORCE BYOK for free users irrespective of env setting
                 raise HTTPException(
                    status_code=403, 
                    detail="Free Tier requires you to provide your own Gemini API Key. Sponsors get free access."
                )

    # Update the key in the request arguments for the generator task
    api_key = real_api_key

    if not files and not text:
        raise HTTPException(status_code=400, detail="Either file or text must be provided")

    # Read Input
    input_text = ""
    image_files = []  # Store image file paths for vision models
    
    try:
        if text:
            input_text = text + "\n\n"
        
        if files:
            for file in files:
                suffix = os.path.splitext(file.filename)[1].lower()
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                    shutil.copyfileobj(file.file, tmp_file)
                    tmp_path = tmp_file.name
                
                # Check if it's an image file
                if suffix in ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']:
                    # Store image path for vision processing
                    image_files.append({
                        "type": "image",
                        "path": tmp_path,
                        "filename": file.filename
                    })
                    logger.info(f"Image file detected: {file.filename}")
                    continue
                
                # Process text-based files
                file_text = ""
                if suffix == ".pdf":
                     try:
                         # Use strict=False to be more lenient with malformed PDFs
                         reader = PdfReader(tmp_path, strict=False)
                         for page in reader.pages:
                             extract = page.extract_text()
                             if extract:
                                file_text += extract + "\n"
                     except Exception as e:
                         logger.error(f"Failed to read PDF {file.filename}: {e}")
                         # Don't fail the whole request, just skip this file or read what we can
                         file_text += f"\n[Error reading PDF {file.filename}: {str(e)}]\n"
                else:
                    try:
                        with open(tmp_path, "r", encoding="utf-8") as f:
                            file_text = f.read()
                    except:
                         # Fallback for docx or other binary formats if added later, 
                         # or encoding issues. For now, strict utf-8 for txt
                         pass

                # Log text extraction result
                logger.info(f"Extracted {len(file_text)} chars from {file.filename}")
                input_text += f"\n--- File: {file.filename} ---\n{file_text}\n"
                cleanup_file(tmp_path)

    except Exception as e:
        logger.error(f"Input reading failed: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to read input: {str(e)}")

    # Validate input: either text or images must be provided
    if not input_text.strip() and not image_files:
        raise HTTPException(status_code=400, detail="No input provided. Please provide text or upload files.")
    
    # Prepare job data for queue
    config_data = {
        "name": deck_name,
        "difficulty": difficulty,
        "style": style,
        "max_cards": max_cards,
        "model_name": model,
        "custom_instructions": custom_instructions
    }
    
    job_data = {
        "text": input_text,
        "config": config_data,
        "provider": provider,
        "user_key": api_key,
        "images_enabled": images,
        "image_files": image_files
    }
    
    logger.info(f"Adding job to queue. Provider={provider}, Images={len(image_files)}")
    
    # Add to queue instead of immediate execution
    job_id = await job_queue.add_job(user.id, job_data)
    
    # Also add to jobs dict for backward compatibility
    jobs[job_id] = {
        "status": "queued",
        "created_at": time.time()
    }
    
    logger.info(f"Job {job_id}: Added to queue for user {user.id}")
    
    return {"job_id": job_id, "status": "queued"}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    # First check if it's in the queue system
    queue_status = await job_queue.get_job_status(job_id)
    if queue_status:
        # If processing, try to attach progress message from main jobs dict
        if queue_status["status"] == "processing" and job_id in jobs:
            queue_status["message"] = jobs[job_id].get("message")
        return queue_status
    
    # Fall back to regular jobs dict
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "error": job.get("error"),
        "message": job.get("message"),  # Progress message
        "position": 0,  # Not in queue
        "queue_length": 0
    }

@app.get("/download/{job_id}")
def download_deck(job_id: str, background_tasks: BackgroundTasks):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job["status"] == "failed":
        raise HTTPException(status_code=400, detail=f"Job failed: {job.get('error', 'Unknown error')}")
        
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job not completed (Status: {job['status']})")
    
    if "file_path" not in job:
        raise HTTPException(status_code=500, detail="Deck file missing from job result")
        
    file_path = job["file_path"]
    filename = job["filename"]
    
    # Schedule cleanup after response - DISABLED for "Download Again" feature
    # background_tasks.add_task(cleanup_file, file_path)
    
    # Job cleanup is handled manually or by timeout, NOT on first download
    # if job_id in jobs:
    #     del jobs[job_id]
    logger.info(f"Serving download for Job {job_id}")
    return FileResponse(
        file_path, 
        media_type="application/octet-stream", 
        filename=filename
    )

# --- ADMIN & WEBHOOK ROUTES ---

@app.get("/api/admin/stats")
async def admin_stats(x_admin_key: Optional[str] = Header(None)):
    """
    Admin-only endpoint to view application usage stats.
    """
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    return await get_admin_stats()

@app.post("/api/webhooks/bmc")
async def bmc_webhook(request: Request):
    """
    Buy Me A Coffee Webhook for automated sponsor sync.
    """
    # Verify secret if provided
    signature = request.headers.get("X-Bmc-Signature")
    # if settings.BUYMEACOFFEE_WEBHOOK_SECRET and signature != settings.BUYMEACOFFEE_WEBHOOK_SECRET:
    #     raise HTTPException(status_code=403, detail="Invalid signature")
        
    payload = await request.json()
    success = await handle_bmc_webhook(payload)
    return {"status": "success" if success else "failed"}

@app.post("/api/webhooks/github")
async def github_webhook(request: Request):
    """
    GitHub Sponsors Webhook for automated sponsor sync.
    """
    payload = await request.json()
    success = await handle_github_webhook(payload)
    return {"status": "success" if success else "failed"}

# --- ADMIN CONTROL ROUTES ---

@app.get("/api/admin/users")
async def admin_list_users(x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    sb = get_supabase()
    users_res = sb.table('profiles').select('*').order('created_at', desc=True).limit(50).execute()
    users_data = users_res.data if users_res.data else []
    
    # Enrich with sponsor source info
    for user in users_data:
        if user.get('is_sponsor'):
            # Check for specific record in sponsors table
            sponsor_res = sb.table('sponsors').select('tier, email').eq('user_id', user['id']).maybe_single().execute()
            if sponsor_res.data:
                user['sponsor_source'] = sponsor_res.data.get('tier', 'Supporter')
            else:
                # Check by user email as well
                email = user.get('email')
                if email:
                    email_res = sb.table('sponsors').select('tier').eq('email', email).maybe_single().execute()
                    if email_res.data:
                        user['sponsor_source'] = email_res.data.get('tier', 'Supporter')
        else:
            user['sponsor_source'] = None
            
    return users_data

@app.post("/api/admin/users/{user_id}/toggle-sponsor")
async def admin_toggle_sponsor(user_id: str, tier: Optional[str] = Form(None), x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    sb = get_supabase()
    # Get current state
    profile = sb.table('profiles').select('is_sponsor, email, full_name').eq('id', user_id).maybe_single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_is_sponsor = profile.data.get('is_sponsor', False)
    new_state = not current_is_sponsor
    user_email = profile.data.get('email')
    
    update_data = {
        "is_sponsor": new_state
    }
    
    sb.table('profiles').update(update_data).eq('id', user_id).execute()
    
    # Also sync sponsors table
    if new_state:
        sb.table('sponsors').upsert({
            "user_id": user_id,
            "email": user_email,
            "name": profile.data.get('full_name'),
            "is_active": True,
            "updated_at": datetime.now().isoformat()
        }, on_conflict="user_id").execute()
    else:
        # Deactivate by ALL identifiers for maximum security
        # 1. By user_id
        sb.table('sponsors').update({"is_active": False}).eq('user_id', user_id).execute()
        # 2. By email (if known)
        if user_email:
            sb.table('sponsors').update({"is_active": False}).eq('email', user_email).execute()
            
    return {"status": "success", "is_sponsor": new_state}

@app.post("/api/admin/users/promote-by-email")
async def admin_promote_by_email(email: str = Form(...), x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    sb = get_supabase()
    
    # 1. Try to find user in profiles
    profile_res = sb.table('profiles').select('id, full_name').eq('email', email).maybe_single().execute()
    user_id = profile_res.data.get('id') if profile_res.data else None
    
    # 2. Update profile if found
    if user_id:
        sb.table('profiles').update({"is_sponsor": True}).eq('id', user_id).execute()
        logger.info(f"Admin promoted user {user_id} ({email}) to sponsor via profile")
        
    # 3. Always ensure record in sponsors table
    sb.table('sponsors').upsert({
        "email": email,
        "user_id": user_id,
        "name": profile_res.data.get('full_name') if profile_res.data else "Manual Promo",
        "is_active": True,
        "updated_at": datetime.now().isoformat()
    }, on_conflict="email").execute()
    
    return {"status": "success", "message": f"User {email} is now a sponsor.", "linked": bool(user_id)}

@app.post("/api/admin/users/{user_id}/reset-quota")
async def admin_reset_quota(user_id: str, x_admin_key: Optional[str] = Header(None)):
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    sb = get_supabase()
    sb.table('profiles').update({"daily_count": 0}).eq('id', user_id).execute()
    return {"status": "success"}


@app.post("/api/admin/sync-current")
async def admin_sync_current(request: Request, x_admin_key: Optional[str] = Header(None)):
    """Syncs the current requesting user into the profiles table."""
    if not x_admin_key or x_admin_key != settings.ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Invalid admin key")
        
    authorization = request.headers.get("Authorization")
    user = await get_current_user(authorization)
    if not user:
        raise HTTPException(status_code=401, detail="User not logged in")
        
    check_quota(user) # This automatically ensures the profile exists
    return {"status": "success", "user": user.email}

# Mount static files - MUST BE LAST
# Mount static files - MUST BE LAST
cwd = os.getcwd()
frontend_dist = os.path.join(cwd, "frontend", "dist")

if os.path.exists(frontend_dist):
    logger.info(f"Mounting React Frontend from {frontend_dist}")
    
    # 1. Mount assets explicitly so they are served correctly
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Explicit favicon route to prevent 404/fallback issues
    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        return FileResponse(
            os.path.join(frontend_dist, "favicon.ico"), 
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    # 2. Catch-all route for SPA (Single Page Application)
    # This serves existing files (favicon.ico, robots.txt) or falls back to index.html
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        potential_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(potential_path) and os.path.isfile(potential_path):
            return FileResponse(potential_path)
        
        # Disable caching for index.html so updates are seen immediately
        return FileResponse(
            os.path.join(frontend_dist, "index.html"), 
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

else:
    logger.warning("No frontend found! Run 'npm run build' in frontend/ directory")
