# Quota System - IST Timezone & Strict Enforcement

## 🔒 What Changed

### Before (Issues):
- ❌ Used UTC timezone (reset at 12 AM UTC, not IST)
- ❌ "Fail-open" mode allowed unlimited access on errors
- ❌ No strict enforcement in production
- ❌ Users could bypass limits by triggering errors

### After (Fixed):
- ✅ Uses **IST timezone** (UTC+5:30)
- ✅ Resets daily at **12 AM IST**
- ✅ **Strict enforcement** in production (fail-closed)
- ✅ Shows time until next reset in error message
- ✅ Better logging for quota tracking

## 📋 How It Works Now

### Daily Quota:
- **Limit**: 2 decks per user per day
- **Reset Time**: 12:00 AM IST (India Standard Time)
- **Timezone**: UTC+5:30

### Enforcement Modes:

#### Production (`ENV=production`):
- **Strict**: Quota check failures = Access denied
- **Fail-Closed**: Errors block access (secure)
- **Required**: Supabase must be configured

#### Development (`ENV=development`):
- **Lenient**: Quota check failures = Access allowed with warning
- **Fail-Open**: Errors don't block (for testing)
- **Optional**: Works without Supabase

## 🎯 User Experience

### When Quota Exceeded:
```
HTTP 429 Too Many Requests

Daily quota exceeded (2/2 decks). 
Resets in ~8 hours at 12 AM IST.
```

### When Service Error:
```
HTTP 503 Service Unavailable

Service temporarily unavailable. 
Please try again later.
```

## 🔧 Technical Details

### IST Timezone Implementation:
```python
from datetime import datetime, timezone, timedelta

# Define IST (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

# Get current time in IST
now_ist = datetime.now(IST)
today_ist = now_ist.date().isoformat()
```

### Reset Logic:
1. Check if `last_reset` date != today's date (IST)
2. If different → Reset `daily_count` to 0
3. Update `last_reset` to today (IST)
4. Allow generation

### Quota Check Flow:
```
User requests deck generation
    ↓
Check Supabase connection
    ↓ (if fails in production)
    → Deny access (503)
    ↓
Get user profile
    ↓
Check if new day (IST)
    ↓ (if yes)
    → Reset quota to 0
    ↓
Check if count >= 2
    ↓ (if yes)
    → Deny access (429) with reset time
    ↓
Allow generation
    ↓
Increment quota after success
```

## 📊 Database Schema

### `profiles` table:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    daily_count INTEGER DEFAULT 0,
    last_reset DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Example Data:
```
id: 123e4567-e89b-12d3-a456-426614174000
daily_count: 2
last_reset: 2025-12-30  (IST date)
```

## 🛡️ Security Features

### 1. Fail-Closed in Production
- Any error = Access denied
- Prevents quota bypass attacks
- Protects against abuse

### 2. Atomic Operations
- Check and increment are separate
- Prevents race conditions
- Ensures accurate counting

### 3. Date Validation
- Uses server time (IST)
- Client can't manipulate
- Consistent across all users

## 📝 Logging

### Quota Reset:
```
INFO: Quota reset for user abc123 - New day in IST: 2025-12-30
```

### Quota Increment:
```
INFO: Quota incremented to 1/2 for user abc123
INFO: Quota incremented to 2/2 for user abc123
```

### Quota Exceeded:
```
WARNING: User abc123 exceeded quota (2/2)
```

### Errors:
```
ERROR: Quota check failed: [error details]
ERROR: Failed to increment quota for user abc123: [error]
```

## 🔍 Monitoring

### Check User Quota:
```sql
SELECT id, daily_count, last_reset 
FROM profiles 
WHERE id = 'user-id-here';
```

### Reset User Quota Manually:
```sql
UPDATE profiles 
SET daily_count = 0, 
    last_reset = CURRENT_DATE 
WHERE id = 'user-id-here';
```

### View All Users at Limit:
```sql
SELECT id, daily_count, last_reset 
FROM profiles 
WHERE daily_count >= 2 
  AND last_reset = CURRENT_DATE;
```

## ⚙️ Configuration

### Environment Variables:
```env
# Required for quota system
ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

### Adjust Quota Limit:
Edit `backend/core/auth.py`:
```python
# Change from 2 to your desired limit
if count >= 2:  # Change this number
```

## 🚨 Troubleshooting

### Quota Not Resetting:
1. Check server timezone is correct
2. Verify `last_reset` column in database
3. Check logs for reset messages
4. Ensure IST timezone is properly defined

### Users Bypassing Quota:
1. Verify `ENV=production` in production
2. Check RLS policies are enabled
3. Review error logs for failures
4. Ensure Supabase connection is stable

### False Quota Exceeded:
1. Check if quota was actually used
2. Verify date comparison logic
3. Check for timezone mismatches
4. Review increment logs

## 📅 Reset Schedule

| Time (IST) | Action |
|------------|--------|
| 11:59 PM | Last chance to use quota |
| 12:00 AM | **Quota resets to 0** |
| 12:01 AM | Users can generate again |

## 🎉 Benefits

1. **Fair Usage**: Everyone gets 2 decks per day
2. **Predictable**: Resets at same time daily (12 AM IST)
3. **Secure**: Can't bypass in production
4. **User-Friendly**: Shows time until reset
5. **Reliable**: Strict enforcement prevents abuse
