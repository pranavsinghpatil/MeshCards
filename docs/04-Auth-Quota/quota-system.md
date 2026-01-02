# Daily Quota System - Fixed Implementation

## Issues Fixed

### 1. **Quota Incremented Before Generation**
- **Problem**: The quota was being incremented immediately when a user submitted a generation request, even before the deck was created. If generation failed, the user still lost their quota.
- **Fix**: Moved `increment_quota()` call to AFTER successful deck generation in the `generate_deck_task()` function.

### 2. **No Daily Reset Mechanism**
- **Problem**: The code had comments about daily resets but didn't actually implement them. Users' quotas would never reset.
- **Fix**: Implemented automatic daily reset logic in `check_quota()`:
  - Compares `last_reset` date with current UTC date
  - Automatically resets `daily_count` to 0 when a new day is detected
  - Updates `last_reset` to current date

### 3. **Fail-Open Security Issue**
- **Problem**: If Supabase was not configured, the system would allow unlimited access (fail-open).
- **Fix**: Changed to fail-closed - if Supabase is unavailable, quota checks return HTTP 503 error.

### 4. **Race Condition During Reset**
- **Problem**: If the day changed during deck generation, quota could be incorrectly incremented.
- **Fix**: Added double-check in `increment_quota()` to handle day changes during generation.

## How It Works Now

### Flow:
1. User submits generation request
2. **Auth Check**: Verify user is signed in
3. **Quota Check**: 
   - Check if it's a new day → reset if needed
   - Check if `daily_count >= 2` → reject if exceeded
4. **Generate Deck**: Run the background task
5. **On Success**: Increment quota (only if generation succeeded)
6. **On Failure**: Quota remains unchanged

### Database Schema Required:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    daily_count INTEGER DEFAULT 0,
    last_reset DATE DEFAULT CURRENT_DATE
);
```

## Configuration

The quota system requires Supabase to be configured in `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
```

## Error Messages

- **Quota Exceeded**: HTTP 429 - "Daily quota exceeded (2/2 decks). Please try again tomorrow."
- **Not Authenticated**: HTTP 401 - "Please Sign In to generate flashcards."
- **System Unavailable**: HTTP 503 - "Quota system unavailable. Please contact support."

## Testing

To test the quota system:
1. Ensure Supabase is configured
2. Sign in with a user account
3. Generate 2 decks successfully
4. Try to generate a 3rd deck → should be rejected
5. Wait until next day (or manually reset in database)
6. Should be able to generate 2 more decks
