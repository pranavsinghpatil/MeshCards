from fastapi import Depends, HTTPException, Header
from typing import Optional
from backend.core.supabase import get_supabase
from backend.core.logging import logger
from backend.core.sponsor import check_sponsor
from datetime import datetime, timezone
import os

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verifies the JWT token from the Authorization header using Supabase.
    Returns the user object if valid.
    """
    supabase = get_supabase()
    
    # If Supabase is not configured, we might allow anonymous access or fail
    # For this strict quota feature, we should fail if Supabase is missing but intended
    if not supabase:
        # Fallback: connection failed or not configured.
        # If we demand quotas, we must fail. use ANON for dev if needed
        return None

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    try:
        # Expecting "Bearer <token>"
        token = authorization.split(" ")[1]
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid Token")
            
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication Failed: {str(e)}")

def check_quota(user_id: str):
    """
    Checks if the user has remaining quota for the day.
    Automatically resets quota if it's a new day (12 AM IST).
    """
    from datetime import datetime, timezone, timedelta
    
    # Define IST timezone (UTC+5:30)
    IST = timezone(timedelta(hours=5, minutes=30))
    
    supabase = get_supabase()
    if not supabase:
        # In production, quota check is REQUIRED
        if os.getenv("ENV") == "production":
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable. Please try again later."
            )
        # Development mode - allow but warn
        logger.warning("Quota check skipped - Supabase not configured (development mode)")
        return

    try:
        res = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        # Get current date in IST
        now_ist = datetime.now(IST)
        today_ist = now_ist.date().isoformat()
        
        if not res.data:
            # Profile doesn't exist, create it
            supabase.table('profiles').insert({
                'id': user_id,
                'daily_count': 0,
                'last_reset': today_ist
            }).execute()
            return  # New user, quota is 0, allow generation
        
        profile = res.data[0]
        count = profile.get('daily_count', 0)
        last_reset = profile.get('last_reset', '')
        
        # Check if we need to reset (new day in IST)
        if last_reset != today_ist:
            # Reset the quota for the new day
            supabase.table('profiles').update({
                'daily_count': 0,
                'last_reset': today_ist
            }).eq('id', user_id).execute()
            logger.info(f"Quota reset for user {user_id} - New day in IST: {today_ist}")
            return  # Quota reset, allow generation
        
        # Determine user limit based on sponsor status
        is_user_sponsor = check_sponsor(user_id)
        daily_limit = 10 if is_user_sponsor else 2
        
        # Check if quota exceeded (STRICT ENFORCEMENT)
        if count >= daily_limit:
            # Calculate time until next reset (12 AM IST)
            tomorrow_ist = now_ist.date() + timedelta(days=1)
            next_reset = datetime.combine(tomorrow_ist, datetime.min.time()).replace(tzinfo=IST)
            hours_until_reset = int((next_reset - now_ist).total_seconds() / 3600)
            
            sponsor_msg = "Sponsors get 10 decks/day!" if not is_user_sponsor else ""
            raise HTTPException(
                status_code=429, 
                detail=f"Daily quota exceeded ({count}/{daily_limit} decks). {sponsor_msg} Resets in ~{hours_until_reset} hours at 12 AM IST."
            )
                
    except HTTPException:
        # Re-raise quota exceeded errors
        raise
    except Exception as e:
        error_msg = str(e)
        
        # Check if it's an RLS policy error
        if 'row-level security policy' in error_msg.lower() or '42501' in error_msg:
            # Only log as error if in production, otherwise just info/debug to reduce noise
            if os.getenv("ENV") == "production":
                 logger.error(f"RLS policy error - profiles table not properly configured: {error_msg}")
            else:
                 logger.info(f"Supabase RLS policy restricted access (Active in Dev): {error_msg}")
            
            # In production, FAIL CLOSED (deny access)
            if os.getenv("ENV") == "production":
                raise HTTPException(
                    status_code=503,
                    detail="Service configuration error. Please contact support."
                )
            
            # Development mode - allow but warn
            logger.warning("Allowing access in development mode despite RLS error")
            return
        
        # Other errors
        logger.error(f"Quota check failed: {error_msg}")
        
        # In production, FAIL CLOSED (deny access)
        if os.getenv("ENV") == "production":
            raise HTTPException(
                status_code=500,
                detail="Unable to verify quota. Please try again later."
            )
        
        # Development mode - allow but warn
        logger.warning("Allowing access in development mode despite quota check failure")



def increment_quota(user_id: str):
    """
    Increments the user's daily quota count.
    Should only be called AFTER successful deck generation.
    Uses IST timezone for consistency with check_quota.
    """
    from datetime import datetime, timezone, timedelta
    
    # Define IST timezone (UTC+5:30)
    IST = timezone(timedelta(hours=5, minutes=30))
    
    supabase = get_supabase()
    if not supabase: 
        return

    try:
        # Use atomic increment with RPC or get current + update
        res = supabase.table('profiles').select('daily_count, last_reset').eq('id', user_id).execute()
        
        if res.data:
            current = res.data[0].get('daily_count', 0)
            today_ist = datetime.now(IST).date().isoformat()
            
            # Double-check date hasn't changed during generation
            if res.data[0].get('last_reset') != today_ist:
                # Reset happened during generation, start from 1
                supabase.table('profiles').update({
                    'daily_count': 1,
                    'last_reset': today_ist
                }).eq('id', user_id).execute()
                logger.info(f"Quota incremented to 1 for user {user_id} (reset during generation)")
            else:
                # Normal increment
                new_count = current + 1
                supabase.table('profiles').update({
                    'daily_count': new_count
                }).eq('id', user_id).execute()
                logger.info(f"Quota incremented to {new_count} for user {user_id}")
    except Exception as e:
        # Log but don't fail the request since deck was already generated
        logger.error(f"Failed to increment quota for user {user_id}: {e}")

async def get_admin_stats():
    """
    Get global statistics for the admin dashboard.
    """
    supabase = get_supabase()
    if not supabase:
        return {"error": "Supabase not configured"}
        
    try:
        # Get total users
        users = supabase.table('profiles').select('id', count='exact').execute()
        total_users = users.count if users.count is not None else 0
        
        # Get total sponsors
        sponsors = supabase.table('sponsors').select('id', count='exact').eq('is_active', True).execute()
        total_sponsors = sponsors.count if sponsors.count is not None else 0
        
        # Get total decks generated today (sum of daily_count)
        decks = supabase.table('profiles').select('daily_count').execute()
        total_today = sum([d.get('daily_count', 0) for d in decks.data]) if decks.data else 0
        
        return {
            "total_users": total_users,
            "total_active_sponsors": total_sponsors,
            "total_decks_today": total_today,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to fetch admin stats: {e}")
        return {"error": str(e)}

