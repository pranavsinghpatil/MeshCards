from fastapi import Depends, HTTPException, Header
from typing import Optional
from backend.core.supabase import get_supabase
from datetime import datetime, timezone

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
    Automatically resets quota if it's a new day.
    """
    supabase = get_supabase()
    if not supabase:
        # If Supabase is not configured, fail closed (deny access)
        raise HTTPException(status_code=503, detail="Quota system unavailable. Please contact support.")

    try:
        res = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        if not res.data:
            # Profile doesn't exist, create it
            today = datetime.now(timezone.utc).date().isoformat()
            supabase.table('profiles').insert({
                'id': user_id,
                'daily_count': 0,
                'last_reset': today
            }).execute()
            return  # New user, quota is 0, allow generation
        
        profile = res.data[0]
        count = profile.get('daily_count', 0)
        last_reset = profile.get('last_reset', '')
        
        # Check if we need to reset (new day)
        today = datetime.now(timezone.utc).date().isoformat()
        
        if last_reset != today:
            # Reset the quota for the new day
            supabase.table('profiles').update({
                'daily_count': 0,
                'last_reset': today
            }).eq('id', user_id).execute()
            return  # Quota reset, allow generation
        
        # Check if quota exceeded
        if count >= 2:
            raise HTTPException(
                status_code=429, 
                detail=f"Daily quota exceeded ({count}/2 decks). Please try again tomorrow."
            )
                
    except HTTPException:
        raise
    except Exception as e:
        # Log error and fail closed for security
        raise HTTPException(status_code=500, detail=f"Quota check failed: {str(e)}")

def increment_quota(user_id: str):
    """
    Increments the user's daily quota count.
    Should only be called AFTER successful deck generation.
    """
    supabase = get_supabase()
    if not supabase: 
        return

    try:
        # Use atomic increment with RPC or get current + update
        res = supabase.table('profiles').select('daily_count, last_reset').eq('id', user_id).execute()
        
        if res.data:
            current = res.data[0].get('daily_count', 0)
            today = datetime.now(timezone.utc).date().isoformat()
            
            # Double-check date hasn't changed during generation
            if res.data[0].get('last_reset') != today:
                # Reset happened during generation, start from 1
                supabase.table('profiles').update({
                    'daily_count': 1,
                    'last_reset': today
                }).eq('id', user_id).execute()
            else:
                # Normal increment
                supabase.table('profiles').update({
                    'daily_count': current + 1
                }).eq('id', user_id).execute()
    except Exception as e:
        # Log but don't fail the request since deck was already generated
        print(f"Warning: Failed to increment quota for user {user_id}: {e}")
