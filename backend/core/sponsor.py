from typing import Optional
from backend.core.supabase import get_supabase_client
from backend.core.logging import logger

class SponsorChecker:
    """
    Check if a user is a sponsor via Supabase 'sponsors' table.
    
    Table schema expected:
        - id: uuid (primary key)
        - user_id: uuid (foreign key to profiles)
        - email: text
        - is_active: boolean
        - tier: text (optional: supporter, sponsor, etc.)
        - created_at: timestamp
    """
    
    @staticmethod
    def is_sponsor(user_id: str) -> bool:
        """
        Check if the user is an active sponsor.
        Returns True if sponsor, False otherwise.
        """
        try:
            sb = get_supabase_client()
            if not sb:
                logger.warning("Supabase not configured, sponsor check disabled")
                return False
            
            # Query sponsors table
            response = (sb.from_('sponsors')
                .select('is_active')
                .eq('user_id', user_id)
                .single())
            
            data = response.data
            
            if data and data.get('is_active', False):
                logger.info(f"User {user_id} verified as sponsor")
                return True
            
            logger.info(f"User {user_id} is not a sponsor")
            return False
            
        except Exception as e:
            logger.error(f"Sponsor check failed for {user_id}: {e}")
            return False
    
    @staticmethod
    def get_sponsor_tier(user_id: str) -> Optional[str]:
        """
        Get the sponsor tier for a user.
        Returns tier name or None if not a sponsor.
        """
        try:
            sb = get_supabase_client()
            if not sb:
                return None
            
            response = (sb.from_('sponsors')
                .select('tier, is_active')
                .eq('user_id', user_id')
                .single())
            
            data = response.data
            
            if data and data.get('is_active', False):
                return data.get('tier', 'supporter')
            
            return None
            
        except Exception as e:
            logger.error(f"Sponsor tier check failed for {user_id}: {e}")
            return None

def check_sponsor(user_id: str) -> bool:
    """
    Convenience function to check sponsor status.
    """
    return SponsorChecker.is_sponsor(user_id)
