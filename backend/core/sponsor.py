import time
import threading
from typing import Optional
from backend.core.supabase import get_supabase
from backend.core.logging import logger

class SponsorChecker:
    """
    Check if a user is a sponsor via Supabase 'sponsors' table or 'profiles' table.
    Includes a 5-minute TTL cache and combined database queries to prevent N+1 query latency.
    """
    _cache = {}
    _lock = threading.Lock()
    _CACHE_TTL = 300  # 5 minutes

    @classmethod
    def is_sponsor(cls, user_id: str, email: Optional[str] = None) -> bool:
        """
        Check if the user is an active sponsor.
        Checks both 'sponsors' table and 'is_sponsor' flag in 'profiles'.
        Can optionally check by email if user_id doesn't match.
        """
        cache_key = (user_id, email)
        now = time.time()
        
        with cls._lock:
            if cache_key in cls._cache:
                val, ts = cls._cache[cache_key]
                if now - ts < cls._CACHE_TTL:
                    return val
                else:
                    del cls._cache[cache_key]

        try:
            sb = get_supabase()
            if not sb:
                return False
            
            # 1. Check profiles table first (by user_id)
            profile_res = sb.table('profiles').select('is_sponsor').eq('id', user_id).execute()
            if profile_res.data and any(p.get('is_sponsor') for p in profile_res.data):
                logger.info(f"User {user_id} verified as sponsor via profiles table")
                with cls._lock:
                    cls._cache[cache_key] = (True, now)
                return True

            # 2. Check dedicated sponsors table by user_id or email in a single query
            filters = f"user_id.eq.{user_id}"
            if email:
                filters += f",email.eq.{email}"
            
            sponsor_res = (sb.table('sponsors')
                .select('is_active')
                .or_(filters)
                .eq('is_active', True)
                .execute())
            
            if sponsor_res.data:
                logger.info(f"User {user_id}/{email} verified as sponsor via sponsors table")
                with cls._lock:
                    cls._cache[cache_key] = (True, now)
                return True
            
            with cls._lock:
                cls._cache[cache_key] = (False, now)
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
