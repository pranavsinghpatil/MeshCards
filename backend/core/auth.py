from fastapi import Depends, HTTPException, Header
from typing import Optional
from backend.core.supabase import get_supabase
from backend.core.logging import logger
from backend.core.sponsor import check_sponsor
from datetime import datetime, timezone, timedelta
import os

# Define IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Verifies the JWT token from the Authorization header using Supabase.
    Returns the user object if valid.
    """
    supabase = get_supabase()
    if not supabase:
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

def check_quota(user: any):
    """
    Checks if the user has remaining quota for the day.
    Automatically resets quota if it's a new day (12 AM IST).
    Also syncs user metadata (email, name) to the profile.
    """
    user_id = user.id
    email = getattr(user, 'email', None)
    full_name = getattr(user, 'user_metadata', {}).get('full_name') or getattr(user, 'user_metadata', {}).get('name')
    
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
                'email': email,
                'full_name': full_name,
                'daily_count': 0,
                'last_reset': today_ist
            }).execute()
            return  # New user, quota is 0, allow generation
        
        profile = res.data[0]
        count = profile.get('daily_count', 0)
        last_reset = profile.get('last_reset', '')
        
        # Check if we need to reset (new day in IST) or just sync metadata
        if last_reset != today_ist:
            # Reset the quota for the new day and sync metadata
            supabase.table('profiles').update({
                'daily_count': 0,
                'last_reset': today_ist,
                'email': email,
                'full_name': full_name
            }).eq('id', user_id).execute()
            logger.info(f"Quota reset for user {user_id} - New day in IST: {today_ist}")
            return  # Quota reset, allow generation
        else:
            # Just sync metadata if it's been a while (optional but good for data quality)
            # We'll do it on every check for now to ensure Admin page stays accurate
            supabase.table('profiles').update({
                'email': email,
                'full_name': full_name
            }).eq('id', user_id).execute()
        
        # Determine user limit based on sponsor status
        is_user_sponsor = check_sponsor(user_id)
        daily_limit = 5 if is_user_sponsor else 2
        
        # Check if quota exceeded (STRICT ENFORCEMENT)
        if count >= daily_limit:
            # Calculate time until next reset (12 AM IST)
            tomorrow_ist = now_ist.date() + timedelta(days=1)
            next_reset = datetime.combine(tomorrow_ist, datetime.min.time()).replace(tzinfo=IST)
            hours_until_reset = int((next_reset - now_ist).total_seconds() / 3600)
            
            if not is_user_sponsor:
                reason_msg = "Since we are running on limited infra, daily limits are tight. Sponsors get 5 decks/day!"
            else:
                reason_msg = ""

            raise HTTPException(
                status_code=429, 
                detail=f"Daily quota exceeded ({count}/{daily_limit} decks). {reason_msg} Resets in ~{hours_until_reset} hours at 12 AM IST."
            )
                
    except HTTPException:
        # Re-raise quota exceeded errors
        raise
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Quota check failed: {error_msg}")
        
        if os.getenv("ENV") == "production":
            raise HTTPException(
                status_code=500,
                detail="Unable to verify quota. Please try again later."
            )
        logger.warning("Allowing access in development mode despite quota check failure")

def increment_quota(user_id: str):
    """
    Increments the daily generation count for a user.
    Should only be called AFTER successful deck generation.
    """
    supabase = get_supabase()
    if not supabase:
        return

    try:
        # IST timezone for consistency
        today_ist = datetime.now(IST).date().isoformat()
        
        res = supabase.table('profiles').select('daily_count, last_reset').eq('id', user_id).execute()
        if res.data:
            profile = res.data[0]
            current_count = profile.get('daily_count', 0)
            
            # Double-check date hasn't changed during generation
            if profile.get('last_reset') != today_ist:
                # Reset happened during generation, set to 1
                supabase.table('profiles').update({
                    'daily_count': 1,
                    'last_reset': today_ist
                }).eq('id', user_id).execute()
            else:
                # Normal increment
                supabase.table('profiles').update({
                    'daily_count': current_count + 1
                }).eq('id', user_id).execute()
    except Exception as e:
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
        total_today = sum(p.get('daily_count', 0) for p in decks.data) if decks.data else 0
        
        # Get list of recent sponsors
        sponsors_list_res = supabase.table('sponsors').select('*').order('updated_at', desc=True).limit(20).execute()
        sponsors_list = sponsors_list_res.data if sponsors_list_res.data else []
        
        return {
            "total_users": total_users,
            "total_active_sponsors": total_sponsors,
            "total_decks_today": total_today,
            "sponsors": sponsors_list,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Admin stats failed: {e}")
        return {"error": str(e)}
