import os
from supabase import create_client, Client
from backend.core.config import settings
from backend.core.logging import logger

class SupabaseManager:
    _instance = None
    client: Client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_KEY

        if not url or not key:
            logger.warning("Supabase credentials not found. Quotas and Persistence will be disabled.")
            self.client = None
            return

        try:
            self.client = create_client(url, key)
            logger.info("Connected to Supabase successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {e}")
            self.client = None

    def get_client(self) -> Client:
        return self.client

# Singleton Accessor
def get_supabase() -> Client:
    return SupabaseManager().get_client()
