# API Limit Protection - Complete Solution

## 🚨 Problem
Users are hitting API limits by generating too many decks, causing:
- Gemini API quota exhaustion
- Service disruption for other users
- Potential API key suspension

## ✅ Current Protections (Already Implemented)

### 1. Daily Quota System (IST-based)
**File**: `backend/core/auth.py`
- **Limit**: 2 decks per user per day
- **Reset**: 12:00 AM IST
- **Enforcement**: Strict in production (fail-closed)
- **Status**: ✅ Active

### 2. Rate Limiting
**File**: `backend/main.py` (line 302)
- **Current**: `5/hour` per IP address
- **Library**: SlowAPI
- **Status**: ✅ Active

## 🔧 Recommended Improvements

### Option 1: Stricter Rate Limits (Immediate)

**Change in `.env`:**
```env
# Current (too generous)
RATE_LIMIT_FREE=5/hour

# Recommended (more strict)
RATE_LIMIT_FREE=3/hour
```

**Or even stricter:**
```env
RATE_LIMIT_FREE=10/day  # 10 requests per day per IP
```

### Option 2: Multiple Rate Limit Tiers

**Update `backend/core/config.py`:**
```python
# Rate Limiting
RATE_LIMIT_ENABLED: bool = True
RATE_LIMIT_PER_MINUTE: str = "2/minute"  # Burst protection
RATE_LIMIT_PER_HOUR: str = "3/hour"      # Hourly limit
RATE_LIMIT_PER_DAY: str = "10/day"       # Daily limit
```

**Update `backend/main.py`:**
```python
@app.post("/generate")
@limiter.limit(settings.RATE_LIMIT_PER_MINUTE)  # Burst
@limiter.limit(settings.RATE_LIMIT_PER_HOUR)    # Hourly
@limiter.limit(settings.RATE_LIMIT_PER_DAY)     # Daily
async def submit_job(...):
```

### Option 3: User-Based Quota (Current System)

**Already Implemented!**
- 2 decks per user per day
- Resets at 12 AM IST
- Tracked in Supabase `profiles` table

**To verify it's working:**
```sql
-- Check user quotas
SELECT id, daily_count, last_reset 
FROM profiles 
WHERE daily_count >= 2;
```

## 🎯 Immediate Actions

### 1. Reduce Rate Limit (Quick Fix)

**In Leapcell Environment Variables:**
```
RATE_LIMIT_FREE=2/hour
```

**Or in local `.env`:**
```env
RATE_LIMIT_FREE=2/hour
```

### 2. Verify Quota System is Active

**Check Leapcell Environment Variables:**
- ✅ `ENV=production`
- ✅ `SUPABASE_URL` is set
- ✅ `SUPABASE_KEY` is set (SERVICE_ROLE key)

**If any are missing, quota system won't work!**

### 3. Monitor API Usage

**Gemini API Console:**
- https://aistudio.google.com/app/apikey
- Check "Usage" tab
- Set up quota alerts

### 4. Add Cost Protection

**In Google Cloud Console:**
1. Go to Gemini API
2. Set daily quota limit
3. Enable billing alerts
4. Set budget caps

## 📊 Current System Status

### Rate Limiting:
- **Per IP**: 5 requests/hour (too generous)
- **Recommendation**: Change to 2/hour or 10/day

### Quota System:
- **Per User**: 2 decks/day
- **Reset**: 12 AM IST
- **Enforcement**: Strict in production

### Combined Protection:
With both systems:
- Anonymous users: Limited by IP rate limit
- Signed-in users: Limited by daily quota (2/day)

## 🔒 Best Configuration

### For Production (Recommended):

**Environment Variables:**
```env
ENV=production
RATE_LIMIT_ENABLED=true
RATE_LIMIT_FREE=2/hour

# Supabase (REQUIRED for quota)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

**This gives:**
- Max 2 requests/hour per IP (rate limit)
- Max 2 decks/day per user (quota system)
- Strict enforcement (no bypass)

## 🚨 Emergency Actions

### If API Limit Hit Right Now:

1. **Enable Maintenance Mode:**
   ```env
   VITE_MAINTENANCE_MODE=true
   ```

2. **Rotate API Key:**
   - Generate new Gemini API key
   - Update `GEMINI_API_KEY` in Leapcell
   - Redeploy

3. **Reset User Quotas:**
   ```sql
   UPDATE profiles 
   SET daily_count = 0, 
       last_reset = CURRENT_DATE;
   ```

4. **Reduce Rate Limit:**
   ```env
   RATE_LIMIT_FREE=1/hour
   ```

## 📈 Long-Term Solutions

### 1. Implement Usage Tiers
- Free: 2 decks/day
- Supporter: 10 decks/day (Buy Me a Coffee)
- Premium: 50 decks/day (Paid)

### 2. Add BYOK (Bring Your Own Key)
- Already implemented!
- Users can use their own Gemini API key
- No limit for BYOK users

### 3. Queue System
- Implement job queue
- Process requests slowly
- Prevent burst usage

### 4. Caching
- Cache common prompts
- Reduce API calls
- Save costs

## 🔍 Monitoring

### Check Current Usage:

**Supabase Query:**
```sql
-- Users at quota limit today
SELECT COUNT(*) as users_at_limit
FROM profiles 
WHERE daily_count >= 2 
  AND last_reset = CURRENT_DATE;

-- Total decks generated today
SELECT SUM(daily_count) as total_today
FROM profiles 
WHERE last_reset = CURRENT_DATE;
```

**Backend Logs:**
```bash
# Search for quota exceeded
grep "quota exceeded" logs.txt

# Search for rate limit hits
grep "429" logs.txt
```

## ✅ Verification Checklist

- [ ] `ENV=production` in Leapcell
- [ ] `SUPABASE_URL` and `SUPABASE_KEY` set
- [ ] Rate limit reduced to 2/hour or less
- [ ] Quota system tested and working
- [ ] API usage monitoring enabled
- [ ] Billing alerts configured
- [ ] Maintenance page ready to deploy

## 📝 Summary

**Current Issue**: Users bypassing limits
**Root Cause**: Rate limit too generous (5/hour)
**Quick Fix**: Change to `RATE_LIMIT_FREE=2/hour`
**Long-term**: Quota system (2/day) + Rate limit (2/hour)

**Action Required**: Update environment variable in Leapcell!
