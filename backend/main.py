from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Request, Header
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, List
import shutil
import os
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

def cleanup_file(path: str):
    try:
        if os.path.exists(path):
            os.remove(path)
            logger.info(f"Cleaned up {path}")
    except Exception as e:
        logger.error(f"Cleaning up {path} failed: {e}")

def get_real_api_key(provider: str, user_key: Optional[str] = None) -> str:
    # 1. User provided key (BYOK)
    if user_key and user_key.strip():
        return user_key
    
    # 2. System ENV key
    env_key = getattr(settings, f"{provider.upper()}_API_KEY", None)
    if env_key:
        return env_key
        
    raise ValueError(f"No API Key found for {provider}. Please provide one.")

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
        if image_files and provider == "gemini":
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
            # Text-only generation
            cards = generator.generate_flashcards(text, config)
        
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
        # Log full error to GitHub with user context
        simple_error = log_error_to_github(
            e, 
            context=f"Deck Generation (Job {job_id})", 
            user_id=user_id
        )
        
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = simple_error


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
        "supabase_anon_key": settings.SUPABASE_KEY
    }

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
    try:
        check_quota(user.id)
    except HTTPException as e:
        # Re-raise quota exceeded errors with clear message
        raise e
    except Exception as e:
        logger.error(f"Quota check error for user {user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to verify quota. Please try again later."
        )

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
                     reader = PdfReader(tmp_path)
                     for page in reader.pages:
                         extract = page.extract_text()
                         if extract:
                            file_text += extract + "\n"
                else:
                    try:
                        with open(tmp_path, "r", encoding="utf-8") as f:
                            file_text = f.read()
                    except:
                         # Fallback for docx or other binary formats if added later, 
                         # or encoding issues. For now, strict utf-8 for txt
                         pass

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
        return queue_status
    
    # Fall back to regular jobs dict
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "error": job.get("error"),
        "position": 0,  # Not in queue
        "queue_length": 0
    }

@app.get("/download/{job_id}")
def download_deck(job_id: str, background_tasks: BackgroundTasks):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed")
    
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
