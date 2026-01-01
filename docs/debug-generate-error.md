# Quick Debug Guide

## The Error: POST http://localhost:8000/generate net::ERR_FAILED

This means the request is failing completely. Here's how to debug:

### Step 1: Check Backend Logs

When you click "Generate", watch your terminal running `./launch.bat`.

You should see either:
- **Success**: `INFO - Job abc123: Added to queue`
- **Error**: A Python traceback showing what failed

### Step 2: Common Causes

**1. Authentication Error**
- Error: `401 Unauthorized`
- Fix: Make sure you're signed in

**2. Quota Exceeded**
- Error: `429 Daily quota exceeded`
- Fix: Wait until tomorrow OR reset quota in Supabase

**3. Syntax Error in Code**
- Error: Python traceback
- Fix: Check the error message

**4. Queue System Error**
- Error: Related to `job_queue` or `async`
- Fix: May need to adjust queue code

### Step 3: Quick Test

Try this in your browser console (F12):

```javascript
fetch('http://localhost:8000/api/config')
  .then(r => r.json())
  .then(console.log)
```

If this works, the server is running fine.

### Step 4: Test Generate Endpoint

```javascript
// Get your auth token first
const token = localStorage.getItem('sb-access-token');

fetch('http://localhost:8000/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: new FormData(document.querySelector('form'))
})
.then(r => r.text())
.then(console.log)
.catch(console.error)
```

### Step 5: Temporary Fix - Disable Queue

If the queue is causing issues, we can temporarily disable it:

**In `backend/main.py`, find this code (around line 400):**
```python
# Add to queue instead of immediate execution
job_id = await job_queue.add_job(user.id, job_data)
```

**Replace with:**
```python
# Temporary: Direct execution (no queue)
job_id = str(uuid.uuid4())
background_tasks.add_task(
    generate_deck_task,
    job_id,
    input_text,
    config_data,
    provider,
    api_key,
    images,
    user.id,
    image_files
)
```

This will bypass the queue system and use direct execution.

### Step 6: Check What's in Terminal

**Look for:**
- `ERROR` - Shows what failed
- `Traceback` - Shows where it failed
- `HTTPException` - Shows HTTP errors

**Copy the error and I can help fix it!**

## Most Likely Issue

Based on the symptoms, it's probably one of:
1. **Queue system async/sync mismatch**
2. **Quota check failing**
3. **Supabase not configured**

**Quick test:** Set `ENV=development` in `.env` and restart - this will skip quota checks.
