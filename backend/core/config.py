import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "MeshCards"
    ENV: str = "development" # development, production
    DEBUG: bool = True
    
    # API Keys (System Level - for free tier)
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    NOVITA_API_KEY: Optional[str] = None  # For sponsors only
    
    # Sponsor Settings (Buy Me a Coffee Integration)
    BUYMEACOFFEE_WEBHOOK_SECRET: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_FREE: str = "2/hour"  # Reduced from 5/hour to prevent API abuse
    
    # Features
    ENABLE_OLLAMA: bool = True
    ENABLE_IMAGE_GEN: bool = False # Hidden as per user request
    
    # Supabase (Optional if not using persistence/auth)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # Feedback Integrations
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_REPO: Optional[str] = None # e.g. "username/repo"

    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()

# Logic to override settings based on ENV
if settings.ENV == "production":
    settings.DEBUG = False
    settings.ENABLE_OLLAMA = False # Disable local Ollama in prod
