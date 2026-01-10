from datetime import datetime
from backend.core.supabase import get_supabase
from backend.core.logging import logger

async def handle_bmc_webhook(payload: dict):
    """
    Process Buy Me A Coffee webhook payload.
    Expected payload includes user email and transaction status.
    """
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
            "updated_at": datetime.now().isoformat()
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
