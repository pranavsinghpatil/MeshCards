import os
from typing import Optional
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
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY

        if not url or not key:
            logger.warning("Supabase service-role credentials not found. Quotas and persistence will be disabled.")
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

def get_user_supabase(jwt_token: Optional[str] = None) -> Optional[Client]:
    """
    Get a user-scoped Supabase client that obeys Row Level Security (RLS) using the user's JWT.
    Falls back to service role client if no token is provided for background operations.
    """
    if not jwt_token:
        return get_supabase()

    url = settings.SUPABASE_URL
    anon_key = settings.SUPABASE_ANON_KEY or settings.SUPABASE_KEY
    if not url or not anon_key:
        return get_supabase()

    try:
        from supabase import ClientOptions
        options = ClientOptions(headers={"Authorization": f"Bearer {jwt_token}"})
        client = create_client(url, anon_key, options=options)
        return client
    except Exception:
        # Backward compatibility fallback for supabase versions without ClientOptions
        try:
            client = create_client(url, anon_key)
            client.postgrest.auth(jwt_token)
            return client
        except Exception as e:
            logger.error(f"Failed to initialize RLS Supabase client: {e}")
            return None

def get_supabase_client(jwt_token: Optional[str] = None) -> Optional[Client]:
    """
    Alias for get_user_supabase for per-request dynamic Supabase client instantiation.
    """
    return get_user_supabase(jwt_token)
