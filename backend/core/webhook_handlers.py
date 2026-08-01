import hmac
import hashlib
from datetime import datetime, timezone
from backend.core.supabase import get_supabase
from backend.core.logging import logger

async def handle_bmc_webhook(payload: dict, request_body: bytes = None, signature: str = None, secret: str = None):
    """
    Process Buy Me A Coffee webhook payload with HMAC signature verification.
    Expected payload includes user email and transaction status.
    """
    if secret:
        if not signature or not request_body:
            logger.warning("BMC Webhook rejected: missing signature or request body")
            return False
        expected_sig = hmac.new(secret.encode(), request_body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected_sig, signature):
            logger.warning("BMC Webhook rejected: invalid HMAC signature")
            return False

    data = payload.get("response", {}).get("data", {})
    email = data.get("supporter_email")
    name = data.get("supporter_name")
    support_id = data.get("support_id")
    
    if not email:
        logger.warning("BMC Webhook received but no email found in payload")
        return False
        
    sb = get_supabase()
    if not sb:
        return False
        
    try:
        # Find user ID by email in profiles
        user_res = sb.table('profiles').select('id').eq('email', email).maybe_single().execute()
        if not user_res.data:
            logger.info(f"Sponsor {email} not found in local profiles. Will sync upon their next login.")
            user_id = None
        else:
            user_id = user_res.data['id']
            
        # Update or Insert into sponsors table
        sponsor_data = {
            "email": email,
            "name": name,
            "coffee_id": str(support_id) if support_id else None,
            "is_active": True,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        if user_id:
            sponsor_data["user_id"] = user_id
            
        sb.table('sponsors').upsert(
            sponsor_data,
            on_conflict="email"
        ).execute()
        
        # Also update profiles table if user exists
        if user_id:
            sb.table('profiles').update({
                "is_sponsor": True
            }).eq('id', user_id).execute()
        
        logger.info(f"Successfully processed BMC sponsor: {email}")
        return True
    except Exception as e:
        logger.error(f"Error handling BMC webhook: {e}")
        return False

async def handle_github_webhook(payload: dict):
    """
    Process GitHub Sponsors webhook payload.
    """
    # ... placeholder for GitHub logic ...
    return True
