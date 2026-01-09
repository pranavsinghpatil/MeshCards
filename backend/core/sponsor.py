from typing import Optional
from backend.core.supabase import get_supabase
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
        Checks both 'sponsors' table and 'is_sponsor' flag in 'profiles'.
        """
        try:
            sb = get_supabase()
            if not sb:
                return False
            
            # 1. Check profiles table first (common for manual edits)
            profile_res = sb.table('profiles').select('is_sponsor').eq('id', user_id).maybeSingle().execute()
            if profile_res.data and profile_res.data.get('is_sponsor'):
                logger.info(f"User {user_id} verified as sponsor via profiles table")
                return True

            # 2. Check dedicated sponsors table
            sponsor_res = (sb.table('sponsors')
                .select('is_active')
                .eq('user_id', user_id)
                .maybeSingle()
                .execute())
            
            if sponsor_res.data and sponsor_res.data.get('is_active'):
                logger.info(f"User {user_id} verified as sponsor via sponsors table")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Sponsor check failed for {user_id}: {e}")
            return False
    
    @staticmethod
    def get_sponsor_tier(user_id: str) -> Optional[str]:
        """
        Get the sponsor tier for a user.
        Checks both 'sponsors' table and 'sponsor_tier' in 'profiles'.
        """
        try:
            sb = get_supabase()
            if not sb:
                return None
            
            # 1. Check profiles first
            profile_res = sb.table('profiles').select('is_sponsor, sponsor_tier').eq('id', user_id).maybeSingle().execute()
            if profile_res.data and profile_res.data.get('is_sponsor'):
                return profile_res.data.get('sponsor_tier', 'Premium')

            # 2. Check sponsors table
            sponsor_res = (sb.table('sponsors')
                .select('tier, is_active')
                .eq('user_id', user_id)
                .maybeSingle()
                .execute())
            
            if sponsor_res.data and sponsor_res.data.get('is_active'):
                return sponsor_res.data.get('tier', 'supporter')
            
            return None
            
        except Exception as e:
            logger.error(f"Sponsor tier check failed for {user_id}: {e}")
            return None

def check_sponsor(user_id: str) -> bool:
    """
    Convenience function to check sponsor status.
    """
    return SponsorChecker.is_sponsor(user_id)
