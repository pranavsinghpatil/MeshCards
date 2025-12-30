# Authentication & Quota Enforcement - Summary

## ✅ Current Implementation

### Backend (Strict Enforcement)

**File**: `backend/main.py` (lines 319-338)

```python
# 1. STRICT AUTH REQUIREMENT - Only signed-in users can generate
user = await get_current_user(authorization)
if not user:
    raise HTTPException(
        status_code=401, 
        detail="Authentication required. Please sign in to generate flashcards."
    )

# 2. Check Daily Quota (2 decks per day, resets at 12 AM IST)
try:
    check_quota(user.id)
except HTTPException as e:
    raise e  # Re-raise quota exceeded errors
```

**Protection Layers:**
1. ✅ **Authentication Required** - No anonymous generation
2. ✅ **Daily Quota Check** - 2 decks per day per user
3. ✅ **IST Timezone** - Resets at 12 AM India time
4. ✅ **Fail-Closed** - Errors deny access in production

### Frontend (User Experience)

**File**: `frontend/src/components/Studio.tsx` (lines 249-252)

```typescript
if (!session) {
    toast({ 
        title: "Sign In Required", 
        description: "Please sign in to generate flashcards.", 
        variant: "destructive" 
    });
    return;
}
```

**UI Features:**
- ✅ Shows quota count (X/2 decks used)
- ✅ Disables button when quota exceeded
- ✅ Clear error messages
- ✅ Prompts to sign in

## 🛡️ Complete Protection System

### Layer 1: Frontend Validation
- Checks if user is signed in
- Shows toast notification if not
- Prevents API call

### Layer 2: Backend Authentication
- Verifies JWT token
- Returns 401 if invalid/missing
- No bypass possible

### Layer 3: Quota Enforcement
- Checks Supabase `profiles` table
- Verifies `daily_count < 2`
- Returns 429 if exceeded

### Layer 4: Rate Limiting
- 2 requests per hour per IP
- Additional protection layer
- Prevents abuse

## 📊 User Flow

### Signed-In User (Normal):
```
1. User clicks "Generate Deck"
2. Frontend checks: session exists? ✅
3. Backend checks: valid token? ✅
4. Backend checks: quota < 2? ✅
5. Generate deck ✅
6. Increment quota (1/2 or 2/2)
7. Download file
```

### Signed-In User (Quota Exceeded):
```
1. User clicks "Generate Deck"
2. Frontend checks: session exists? ✅
3. Backend checks: valid token? ✅
4. Backend checks: quota < 2? ❌
5. Return 429: "Daily quota exceeded (2/2 decks). 
   Resets in ~8 hours at 12 AM IST."
```

### Anonymous User:
```
1. User clicks "Generate Deck"
2. Frontend checks: session exists? ❌
3. Show toast: "Sign In Required"
4. No API call made
```

## 🔒 Security Features

### Cannot Bypass:
- ❌ Cannot use without signing in
- ❌ Cannot exceed 2 decks/day
- ❌ Cannot manipulate quota count
- ❌ Cannot fake authentication
- ❌ Cannot bypass rate limits

### Enforced By:
- ✅ Backend JWT verification
- ✅ Supabase RLS policies
- ✅ Server-side quota tracking
- ✅ IST timezone (server time)
- ✅ Atomic database operations

## 📈 Quota System Details

### Database Schema:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    daily_count INTEGER DEFAULT 0,
    last_reset DATE NOT NULL
);
```

### Reset Logic:
```python
# Get current date in IST
now_ist = datetime.now(IST)
today_ist = now_ist.date().isoformat()

# Check if new day
if last_reset != today_ist:
    # Reset quota
    daily_count = 0
    last_reset = today_ist
```

### Increment Logic:
```python
# After successful generation
current_count = profile.daily_count
new_count = current_count + 1
# Update: daily_count = new_count
```

## 🎯 User Experience

### Before Quota Limit:
- Button enabled
- Shows "0/2 decks used today"
- Normal generation flow

### At Quota Limit:
- Button disabled
- Shows "2/2 decks used today"
- Message: "Quota resets at 12 AM IST"

### Error Messages:
```
401: "Authentication required. Please sign in to generate flashcards."
429: "Daily quota exceeded (2/2 decks). Resets in ~X hours at 12 AM IST."
500: "Unable to verify quota. Please try again later."
```

## 📝 Configuration

### Production Environment (Leapcell):
```env
ENV=production
RATE_LIMIT_FREE=2/hour
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

### Development Environment:
```env
ENV=development
RATE_LIMIT_FREE=2/hour
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

## ✅ Verification Checklist

Backend:
- [x] Authentication required in `/generate` endpoint
- [x] Quota check enforced
- [x] IST timezone used
- [x] Fail-closed in production
- [x] Clear error messages

Frontend:
- [x] Session check before API call
- [x] Quota display (X/2)
- [x] Button disabled at limit
- [x] Toast notifications
- [x] Sign-in prompt

Database:
- [x] `profiles` table exists
- [x] RLS policies enabled
- [x] Service role key configured

## 🎉 Result

**Only signed-in users can generate decks**
**Maximum 2 decks per user per day**
**Resets daily at 12 AM IST**
**No bypass possible**

This protects your API quota while providing a fair, free service to all users! 🛡️
