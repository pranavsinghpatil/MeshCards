# Reset Daily Quota - Testing Script

## Quick Reset via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your MeshCards project
3. Go to **Table Editor** → **profiles**
4. Find your user row
5. Set `daily_count` to **0**
6. Click **Save**

## Or Use SQL Editor

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
-- Reset quota for your user
UPDATE profiles 
SET daily_count = 0, 
    last_reset = CURRENT_DATE 
WHERE id = 'YOUR_USER_ID';
```

3. Replace `YOUR_USER_ID` with your actual user ID
4. Click **Run**

## Or Disable Quota Locally

**In `backend/.env`:**
```env
# Comment out or remove ENV variable
# ENV=production

# This will skip quota checks in development
```

**Restart backend** and quota checks will be skipped!

## Testing the Chunking System

### Test 1: Small Document (No Optimization)
- Upload: 5-10 page PDF
- Expected log: `Using direct generation (small text)`
- No chunking, no extraction

### Test 2: Medium Document (Extraction)
- Upload: 30-50 page PDF
- Expected log: `Using semantic extraction (medium text)`
- Expected log: `Extracted key content: ~8000 tokens (reduced by 78%)`
- Single API call with extracted content

### Test 3: Large Document (Extraction + Chunking)
- Upload: 100+ page PDF
- Expected log: `Using chunked generation (large text)`
- Expected log: `Extracted key content: ~30000 tokens (reduced by 80%)`
- Expected log: `Split into 2 chunks`
- Expected log: `Processing chunk 1/2`
- Expected log: `Processing chunk 2/2`

## Watch Backend Logs

The logs will show you exactly what's happening:

```
2026-01-01 17:36:00 - meshcards - INFO - Input text: 150000 chars, ~37500 tokens
2026-01-01 17:36:00 - meshcards - INFO - Using semantic extraction (medium text)
2026-01-01 17:36:01 - meshcards - INFO - Extracted key content: 32000 chars, ~8000 tokens (reduced by 78.7%)
2026-01-01 17:36:05 - meshcards - INFO - Generation complete
```

This shows:
- Original size: 150,000 chars (~37,500 tokens)
- Strategy: Semantic extraction
- Final size: 32,000 chars (~8,000 tokens)
- **Cost reduction: 78.7%** 💰

## Quick Test Without Quota Limits

**Easiest way:**

1. Stop your backend (Ctrl+C)
2. Edit `backend/.env` - remove or comment out `ENV=production`
3. Restart backend: `./launch.bat`
4. Generate as many decks as you want for testing!

The quota check will be skipped in development mode.
