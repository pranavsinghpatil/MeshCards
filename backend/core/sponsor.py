from typing import Optional
from backend.core.supabase import get_supabase
from backend.core.logging import logger

class SponsorChecker:
    """
    Check if a user is a sponsor via Supabase 'sponsors' table or 'profiles' table.
    """
    
    @staticmethod
    def is_sponsor(user_id: str, email: Optional[str] = None) -> bool:
        """
        Check if the user is an active sponsor.
        Checks both 'sponsors' table and 'is_sponsor' flag in 'profiles'.
        Can optionally check by email if user_id doesn't match.
        """
        try:
            sb = get_supabase()
            if not sb:
                return False
            
            # 1. Check profiles table first (by user_id)
            profile_res = sb.table('profiles').select('is_sponsor').eq('id', user_id).execute()
            if profile_res.data and any(p.get('is_sponsor') for p in profile_res.data):
                logger.info(f"User {user_id} verified as sponsor via profiles table")
                return True

            # 2. Check dedicated sponsors table by user_id
            sponsor_res = (sb.table('sponsors')
                .select('is_active')
                .eq('user_id', user_id)
                .eq('is_active', True)
                .execute())
            
            if sponsor_res.data:
                logger.info(f"User {user_id} verified as sponsor via sponsors table (ID)")
                return True
            
            # 3. Fallback: Check by email if provided
            if email:
                email_res = (sb.table('sponsors')
                    .select('is_active')
                    .eq('email', email)
                    .eq('is_active', True)
                    .execute())
                
                if email_res.data:
                    logger.info(f"User {user_id} verified as sponsor via email {email}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Sponsor check failed for {user_id}/{email}: {e}")
            return False
    
    @staticmethod
    def get_sponsor_tier(user_id: str, email: Optional[str] = None) -> Optional[str]:
        """
        Tier logic is deprecated. Returns 'Verified Sponsor' if active.
        """
        if SponsorChecker.is_sponsor(user_id, email):
            return "Verified Sponsor"
        return None

def check_sponsor(user_id: str, email: Optional[str] = None) -> bool:
    """
    Convenience function to check sponsor status.
    """
    return SponsorChecker.is_sponsor(user_id, email)
