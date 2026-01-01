# Gemini API Quota Management - Complete Solution

## 🚨 The Problem

Gemini API has rate limits:
- **Free Tier**: 250,000 tokens per minute
- **Issue**: Large documents or multiple users can hit this limit quickly
- **Error**: `429 ResourceExhausted`

## ✅ Multi-Layer Solution

### Layer 1: Request Queuing (Prevent Bursts)

**Create a queue system to space out requests:**

```python
# backend/core/queue_manager.py
import asyncio
from datetime import datetime, timedelta
from collections import deque

class RequestQueue:
    def __init__(self, max_per_minute=10):
        self.queue = deque()
        self.max_per_minute = max_per_minute
        self.lock = asyncio.Lock()
    
    async def wait_for_slot(self):
        async with self.lock:
            now = datetime.now()
            # Remove requests older than 1 minute
            while self.queue and self.queue[0] < now - timedelta(minutes=1):
                self.queue.popleft()
            
            # If at limit, wait
            if len(self.queue) >= self.max_per_minute:
                wait_time = (self.queue[0] + timedelta(minutes=1) - now).total_seconds()
                await asyncio.sleep(wait_time + 1)
            
            # Add current request
            self.queue.append(now)

# Global queue instance
request_queue = RequestQueue(max_per_minute=8)  # Conservative limit
```

**Use in generation:**
```python
# In generate_deck_task
async def generate_deck_task(...):
    # Wait for available slot
    await request_queue.wait_for_slot()
    
    # Now safe to call API
    cards = generator.generate_flashcards(text, config)
```

### Layer 2: Exponential Backoff (Handle Errors)

**Already implemented in `backend/core/llm.py`:**
```python
def generate_json(self, prompt: str) -> dict:
    max_retries = 3
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            response = self.model.generate_content(prompt)
            return safe_json_loads(response.text)
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)  # 2s, 4s, 8s
                    logger.warning(f"Rate limit hit, waiting {delay}s...")
                    time.sleep(delay)
                    continue
            raise e
```

### Layer 3: Token Estimation (Prevent Large Requests)

**Add token counting before generation:**

```python
# backend/core/token_counter.py
def estimate_tokens(text: str) -> int:
    """Rough estimate: 1 token ≈ 4 characters"""
    return len(text) // 4

def check_token_limit(text: str, max_tokens: int = 30000):
    """Check if text is within safe token limit"""
    estimated = estimate_tokens(text)
    if estimated > max_tokens:
        raise ValueError(
            f"Input too large: ~{estimated} tokens. "
            f"Maximum: {max_tokens} tokens. "
            f"Please reduce content size."
        )
    return estimated
```

**Use before generation:**
```python
# In submit_job endpoint
try:
    token_count = check_token_limit(text, max_tokens=30000)
    logger.info(f"Estimated tokens: {token_count}")
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
```

### Layer 4: Multiple API Keys (Load Balancing)

**Rotate between multiple API keys:**

```python
# backend/core/config.py
class Settings(BaseSettings):
    # Multiple API keys (comma-separated)
    GEMINI_API_KEYS: str = ""  # "key1,key2,key3"
    
    def get_api_keys(self) -> list:
        if not self.GEMINI_API_KEYS:
            return []
        return [k.strip() for k in self.GEMINI_API_KEYS.split(',')]

# backend/core/key_rotator.py
class APIKeyRotator:
    def __init__(self, keys: list):
        self.keys = keys
        self.current_index = 0
        self.lock = asyncio.Lock()
    
    async def get_next_key(self) -> str:
        async with self.lock:
            key = self.keys[self.current_index]
            self.current_index = (self.current_index + 1) % len(self.keys)
            return key

# Usage
rotator = APIKeyRotator(settings.get_api_keys())
api_key = await rotator.get_next_key()
```

### Layer 5: Caching (Reduce API Calls)

**Cache similar prompts:**

```python
# backend/core/cache.py
import hashlib
from functools import lru_cache

class PromptCache:
    def __init__(self, max_size=100):
        self.cache = {}
        self.max_size = max_size
    
    def get_hash(self, text: str, config: dict) -> str:
        content = f"{text}:{config}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, text: str, config: dict):
        key = self.get_hash(text, config)
        return self.cache.get(key)
    
    def set(self, text: str, config: dict, result):
        if len(self.cache) >= self.max_size:
            # Remove oldest
            self.cache.pop(next(iter(self.cache)))
        key = self.get_hash(text, config)
        self.cache[key] = result

# Global cache
prompt_cache = PromptCache()
```

### Layer 6: User Feedback (Better UX)

**Show helpful messages:**

```python
# In error handling
if "429" in str(error) or "quota" in str(error).lower():
    return {
        "status": "failed",
        "error": "⏳ API rate limit reached. Your request will retry automatically in a few seconds. Please wait..."
    }
```

## 🎯 Implementation Priority

### Immediate (Do Now):
1. ✅ **Add exponential backoff** (already done)
2. ✅ **Better error messages** (already done)
3. 🔧 **Add token limit check** (prevent huge requests)

### Short-term (This Week):
4. 🔧 **Implement request queue** (space out requests)
5. 🔧 **Add user feedback** (show wait time)

### Long-term (Optional):
6. 🔧 **Multiple API keys** (if you have them)
7. 🔧 **Caching system** (reduce duplicate calls)
8. 💰 **Upgrade to paid tier** (higher limits)

## 📊 Quota Limits Comparison

### Free Tier:
- **Requests**: 15 per minute
- **Tokens**: 250,000 per minute
- **Daily**: 1,500 requests

### Paid Tier (Pay-as-you-go):
- **Requests**: 1,000 per minute
- **Tokens**: 4,000,000 per minute
- **Daily**: Unlimited (pay per token)

## 🔧 Quick Fix (Right Now)

**Add to `backend/core/llm.py`:**

```python
import time

def generate_json(self, prompt: str) -> dict:
    max_retries = 5  # Increase retries
    base_delay = 3   # Longer initial delay
    
    for attempt in range(max_retries):
        try:
            response = self.model.generate_content(prompt)
            return safe_json_loads(response.text)
        except Exception as e:
            error_str = str(e).lower()
            
            # Check if it's a rate limit error
            if "429" in str(e) or "quota" in error_str or "rate" in error_str:
                if attempt < max_retries - 1:
                    # Exponential backoff: 3s, 6s, 12s, 24s, 48s
                    delay = base_delay * (2 ** attempt)
                    logger.warning(f"Rate limit hit (attempt {attempt+1}/{max_retries}), waiting {delay}s...")
                    time.sleep(delay)
                    continue
                else:
                    # All retries exhausted
                    raise HTTPException(
                        status_code=429,
                        detail=f"API rate limit exceeded. Please try again in a few minutes. "
                               f"If this persists, the service may be experiencing high load."
                    )
            
            # Not a rate limit error, raise immediately
            raise e
    
    raise HTTPException(status_code=500, detail="Max retries exceeded")
```

## 💡 Best Practices

1. **Limit input size**: Max 30,000 tokens (~120,000 characters)
2. **Space requests**: Wait 4-6 seconds between requests
3. **Retry with backoff**: 3s → 6s → 12s → 24s
4. **Monitor usage**: Check https://ai.dev/usage
5. **Upgrade if needed**: Consider paid tier for production

## 🎉 Result

With these solutions:
- ✅ Fewer 429 errors
- ✅ Automatic retries
- ✅ Better user experience
- ✅ Scalable for more users
- ✅ Cost-effective

## 📝 Environment Variables

```env
# .env
GEMINI_API_KEY=your_key_here

# Optional: Multiple keys for rotation
GEMINI_API_KEYS=key1,key2,key3

# Optional: Rate limit settings
MAX_REQUESTS_PER_MINUTE=8
MAX_TOKENS_PER_REQUEST=30000
```

## 🚀 Deploy

After implementing:
1. Test locally with large documents
2. Monitor for 429 errors
3. Adjust rate limits as needed
4. Consider upgrading to paid tier if usage grows

**This will make your API much more robust!** 💪
