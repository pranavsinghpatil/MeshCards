# Job Queue System - Complete Guide

## 🎯 Problem Solved

**Before:** Multiple users generating decks simultaneously → API rate limit hit → Requests fail ❌

**After:** Requests queue up and process one by one → No rate limit issues → All requests succeed ✅

## 🚀 How It Works

### Visual Flow:

```
User 1 submits → [Queue Position 1] → Processing... → ✅ Complete
User 2 submits → [Queue Position 2] → Waiting...
User 3 submits → [Queue Position 3] → Waiting...
User 4 submits → [Queue Position 4] → Waiting...

After User 1 completes (wait 6 seconds):
User 2 → [Queue Position 1] → Processing... → ✅ Complete
User 3 → [Queue Position 2] → Waiting...
User 4 → [Queue Position 3] → Waiting...
```

### Key Features:

1. **Sequential Processing** - One job at a time
2. **Position Tracking** - Users see their position (4 → 3 → 2 → 1)
3. **Wait Time Estimation** - Shows estimated wait time
4. **Automatic Retry** - Failed jobs retry automatically
5. **Rate Limit Prevention** - 6 second delay between jobs

## 📊 User Experience

### Frontend Display:

```tsx
// When job is queued
{
  "status": "queued",
  "position": 3,
  "queue_length": 5,
  "estimated_wait_seconds": 45
}

// Display to user:
"⏳ Your request is in queue
Position: 3 of 5
Estimated wait: 45 seconds
Please keep this tab open..."
```

### Status Updates:

```
1. Submit → "Queued (Position 4 of 4)"
2. Wait   → "Queued (Position 3 of 4)"
3. Wait   → "Queued (Position 2 of 4)"
4. Wait   → "Queued (Position 1 of 4)"
5. Start  → "Processing your deck..."
6. Done   → "✅ Complete! Downloading..."
```

## 🔧 Implementation

### Backend (Already Created):

**File:** `backend/core/job_queue.py`

**Key Classes:**
- `QueuedJob` - Represents a single job
- `JobQueue` - Manages the queue
- `JobStatus` - Enum for job states

**Features:**
- Async processing
- Thread-safe with locks
- Automatic cleanup of old jobs
- Position tracking
- Wait time estimation

### API Endpoints:

**1. Submit Job (Modified)**
```python
POST /generate
→ Returns job_id
→ Job added to queue
```

**2. Check Status (Enhanced)**
```python
GET /status/{job_id}
→ Returns:
{
  "status": "queued|processing|completed|failed",
  "position": 3,
  "queue_length": 5,
  "estimated_wait_seconds": 45,
  "error": null
}
```

**3. Download (Unchanged)**
```python
GET /download/{job_id}
→ Downloads completed deck
```

## 💻 Frontend Integration

### Update Studio.tsx:

```tsx
const pollJob = async (jobId: string) => {
  while (true) {
    const res = await fetch(`${API_URL}/status/${jobId}`);
    const data = await res.json();
    
    // Show queue position
    if (data.status === 'queued') {
      toast({
        title: `⏳ In Queue (Position ${data.position}/${data.queue_length})`,
        description: `Estimated wait: ${data.estimated_wait_seconds}s`
      });
    }
    
    // Show processing
    if (data.status === 'processing') {
      toast({
        title: "🔄 Processing",
        description: "Generating your flashcards..."
      });
    }
    
    // Complete
    if (data.status === 'completed') {
      return;
    }
    
    // Failed
    if (data.status === 'failed') {
      throw new Error(data.error);
    }
    
    await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
  }
};
```

### Enhanced UI:

```tsx
{status === 'queued' && (
  <div className="flex items-center gap-2">
    <Loader className="animate-spin" />
    <div>
      <p>Position in queue: {position}/{queueLength}</p>
      <p className="text-sm text-muted-foreground">
        Estimated wait: {Math.floor(estimatedWait / 60)}m {estimatedWait % 60}s
      </p>
    </div>
  </div>
)}
```

## ⚙️ Configuration

### Queue Settings:

```python
# backend/core/job_queue.py
job_queue = JobQueue(
    delay_between_jobs=6.0  # Seconds between jobs
)
```

**Adjust based on:**
- API rate limits
- Average processing time
- Number of concurrent users

### Recommended Settings:

**Development:**
```python
delay_between_jobs=3.0  # Faster for testing
```

**Production:**
```python
delay_between_jobs=6.0  # Safe for API limits
```

**High Traffic:**
```python
delay_between_jobs=10.0  # Very conservative
```

## 📈 Benefits

### For Users:
✅ **No failed requests** - Queue instead of fail  
✅ **Transparent** - See position and wait time  
✅ **Fair** - First come, first served  
✅ **Reliable** - Automatic retry on failure  

### For System:
✅ **No API limits** - Sequential processing  
✅ **Predictable** - Controlled rate  
✅ **Scalable** - Handles any number of users  
✅ **Robust** - Error handling built-in  

## 🎯 Example Scenarios

### Scenario 1: Low Traffic
```
User submits → Queue empty → Process immediately → Done in 15s
```

### Scenario 2: Medium Traffic
```
User submits → 2 people ahead → Wait 30s → Process → Done in 45s total
```

### Scenario 3: High Traffic
```
User submits → 10 people ahead → Wait 2.5 min → Process → Done in 3 min total
```

### Scenario 4: API Limit Hit
```
Job 1: Processing → API limit → Retry in 5s → Success ✅
Job 2: Waiting in queue (safe from limit)
Job 3: Waiting in queue (safe from limit)
```

## 🔍 Monitoring

### Check Queue Status:

```python
# In backend
print(f"Queue length: {len(job_queue.queue)}")
print(f"Current job: {job_queue.current_job}")
print(f"Processing: {job_queue.processing}")
```

### Metrics to Track:
- Average queue length
- Average wait time
- Success rate
- Failed jobs count

## 🚨 Edge Cases Handled

1. **Server Restart** - Jobs lost (acceptable for free tier)
2. **Long Wait** - User sees estimate and can decide to wait
3. **Failed Job** - Automatically retried, then marked as failed
4. **Concurrent Requests** - Lock ensures thread safety
5. **Old Jobs** - Auto-cleanup after 24 hours

## 🎉 Result

**Before Queue System:**
```
10 users submit simultaneously
→ 8 fail with API limit error
→ 2 succeed
→ Success rate: 20%
```

**After Queue System:**
```
10 users submit simultaneously
→ All queue up
→ Process one by one
→ All succeed (just takes longer)
→ Success rate: 100%
```

## 📝 Next Steps

1. ✅ Queue system created
2. ⏳ Integrate into main.py (in progress)
3. ⏳ Update frontend to show queue position
4. ⏳ Test with multiple concurrent users
5. ⏳ Deploy to production

**The queue system ensures NO user is left behind due to API limits!** 🎯
