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
    tier = data.get("support_tier") or "BMC Supporter"
    
    if not email:
        logger.warning("BMC Webhook received but no email found in payload")
        return False
        
    sb = get_supabase()
    if not sb:
        return False
        
    try:
        # Find user ID by email in profiles
        user_res = sb.table('profiles').select('id').eq('email', email).maybeSingle().execute()
        if not user_res.data:
            logger.info(f"Sponsor {email} not found in local profiles. Will sync upon their next login.")
            # Note: BMC webhooks can triggers even if user hasn't registered yet
            # We should still store it in 'sponsors' by email
            user_id = None
        else:
            user_id = user_res.data['id']
            
        # Update or Insert into sponsors table
        sponsor_data = {
            "email": email,
            "name": name,
            "coffee_id": str(support_id) if support_id else None,
            "is_active": True,
            "tier": tier,
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
                "is_sponsor": True,
                "sponsor_tier": tier
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
    action = payload.get("action")
    sponsorship = payload.get("sponsorship", {})
    tier = sponsorship.get("tier", {}).get("name")
    user_email = sponsorship.get("sponsor", {}).get("email") # Requires 'user' scope share
    
    if not user_email:
        # GitHub often doesn't share email in webhook for privacy
        # We might need to map by username or manual verification
        logger.warning("GitHub Webhook received but no email found. Mapping might require username.")
        return False
        
    if action in ["created", "edited", "tier_changed"]:
        # Logic similar to BMC
        pass
        
    return True
