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
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_FREE: str = "5/hour"
    
    # Features
    ENABLE_OLLAMA: bool = True
    ENABLE_IMAGE_GEN: bool = False # Hidden as per user request
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()

# Logic to override settings based on ENV
if settings.ENV == "production":
    settings.DEBUG = False
    settings.ENABLE_OLLAMA = False # Disable local Ollama in prod
