import os
from typing import Optional
from backend.core.supabase import get_supabase
from backend.core.logging import logger
from datetime import datetime

class DeckStorage:
    """
    Handles deck file storage.
    - Production: Uses Supabase Storage
    - Development: Uses local decks/ folder
    """
    
    def __init__(self):
        self.supabase = get_supabase()
        self.bucket_name = "deck-files"
        self.is_production = os.getenv("ENV", "development") == "production"
    
    def store_deck(self, file_path: str, deck_name: str, user_id: str) -> Optional[str]:
        """
        Store a deck file.
        Returns the storage path/URL on success, None on failure.
        """
        import re
        safe_deck_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', deck_name)
        safe_deck_name = safe_deck_name.replace('..', '_').lstrip('.')
        if not safe_deck_name:
            safe_deck_name = "deck.apkg"
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        storage_filename = f"{timestamp}_{safe_deck_name}"
        
        if self.is_production and self.supabase:
            return self._store_to_supabase(file_path, storage_filename, user_id)
        else:
            return self._store_locally(file_path, storage_filename)
    
    def _store_to_supabase(self, file_path: str, filename: str, user_id: str) -> Optional[str]:
        """Store file to Supabase Storage"""
        try:
            # Read file
            with open(file_path, 'rb') as f:
                file_data = f.read()
            
            # Upload to Supabase Storage
            # Path format: user_id/filename.apkg
            storage_path = f"{user_id}/{filename}"
            
            response = self.supabase.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_data,
                file_options={"content-type": "application/octet-stream"}
            )
            
            logger.info(f"Deck stored to Supabase: {storage_path}")
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to store deck to Supabase: {e}")
            return None
    
    def _store_locally(self, file_path: str, filename: str) -> Optional[str]:
        """Store file to local decks/ folder"""
        try:
            import shutil
            
            decks_dir = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..", "decks"))
            os.makedirs(decks_dir, exist_ok=True)
            
            storage_path = os.path.realpath(os.path.join(decks_dir, filename))
            if not os.path.commonpath([storage_path, decks_dir]) == decks_dir:
                raise ValueError("Security error: Invalid file path traversal attempt")
            shutil.copy2(file_path, storage_path)
            
            logger.info(f"Deck stored locally: {storage_path}")
            return storage_path
            
        except Exception as e:
            logger.error(f"Failed to store deck locally: {e}")
            return None
    
    def get_download_url(self, storage_path: str, user_id: str) -> Optional[str]:
        """
        Get a signed download URL for a stored deck.
        Only works for Supabase storage.
        """
        if not self.is_production or not self.supabase:
            return None
        
        try:
            # Create a signed URL valid for 1 hour
            response = self.supabase.storage.from_(self.bucket_name).create_signed_url(
                path=storage_path,
                expires_in=3600  # 1 hour
            )
            
            return response.get('signedURL')
            
        except Exception as e:
            logger.error(f"Failed to create signed URL: {e}")
            return None

# Singleton instance
_storage_instance = None

def get_deck_storage() -> DeckStorage:
    """Get the deck storage singleton instance"""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = DeckStorage()
    return _storage_instance
