# 🎛️ Access Control System

## Overview

MeshCards now has a flexible access control system that allows you to configure:
- **Novita Access**: Who can use premium Novita AI models
- **Gemini Mode**: How users access Gemini API (shared key vs BYOK)

---

## Configuration Options

### 1. NOVITA_ACCESS_MODE

Controls access to Novita premium models (Llama, Mistral, Qwen, etc.)

**Options:**
- `sponsors_only` (default) - Only sponsors can use Novita models
- `all` - Everyone can use Novita models

**Example:**
```env
# In .env file
NOVITA_ACCESS_MODE=all          # Open to everyone
NOVITA_ACCESS_MODE=sponsors_only # Only sponsors
```

**Use Cases:**
- `all`: Perfect if you want to provide premium models to all users
- `sponsors_only`: Use when you want to reward sponsors with exclusive access

---

### 2. GEMINI_MODE

Controls how users access Gemini API

**Options:**
- `shared` (default) - Use system API key (with rate limits)
- `byok` - Bring Your Own Key - users MUST provide their own API key

**Example:**
```env
# In .env file
GEMINI_MODE=shared  # Use system key with quotas
GEMINI_MODE=byok    # Users must provide own key
```

**Use Cases:**
- `shared`: Good for providing free tier with quotas (2/hour default)
- `byok`: Perfect if you don't want to maintain a system API key, or want unlimited usage per user

---

## How It Works

### Novita Access Flow

```
User requests Novita model
    ↓
Check NOVITA_ACCESS_MODE
    ↓
┌────────────────┬─────────────────┐
│ "all"          │ "sponsors_only" │
│ ✅ Allow       │ Check sponsor   │
│                │ status          │
│                │  ├─ Sponsor: ✅ │
│                │  └─ Not: ❌     │
└────────────────┴─────────────────┘
```

### Gemini Mode Flow

```
User starts generation (Gemini)
    ↓
Check GEMINI_MODE
    ↓
┌────────────────┬─────────────────┐
│ "byok"         │ "shared"        │
│ User MUST      │ Try system key  │
│ provide key    │ with quotas     │
│  ├─ Has key: ✅│  ├─ In quota: ✅│
│  └─ No key: ❌ │  ├─ Exceeded: ❌│
│                │  └─ Prompt BYOK │
└────────────────┴─────────────────┘
```

---

## Configuration Examples

### Example 1: Fully Open System
```env
NOVITA_ACCESS_MODE=all
GEMINI_MODE=shared
GEMINI_API_KEY=your_system_key_here
NOVITA_API_KEY=your_novita_key_here
RATE_LIMIT_FREE=10/hour
```
**Result:** Everyone can use both Gemini and Novita with generous quotas

---

### Example 2: Strict BYOK System
```env
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=byok
# No system keys needed!
```
**Result:** 
- Users MUST provide their own Gemini key
- Only sponsors can use Novita (you still need NOVITA_API_KEY)

---

### Example 3: Hybrid Approach (Recommended)
```env
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=shared
GEMINI_API_KEY=your_system_key_here
NOVITA_API_KEY=your_novita_key_here
RATE_LIMIT_FREE=2/hour
```
**Result:**
- Free users get 2 Gemini generations/hour using system key
- Sponsors get access to premium Novita models
- Users can provide own Gemini key to bypass limits

---

## Error Messages

### BYOK Mode Errors

When `GEMINI_MODE=byok` and user doesn't provide key:
```
Error: BYOK_REQUIRED
This service requires you to use your own Gemini API key.
Get a free key at https://aistudio.google.com/app/apikey
```

### Sponsor-Only Novita Access

When `NOVITA_ACCESS_MODE=sponsors_only` and user is not a sponsor:
```
Error: 403 Forbidden
Premium AI models (Llama, Mistral, Qwen, and more) are only 
available to sponsors. Support the project to unlock access!
```

---

## Frontend Integration

The frontend automatically detects these modes and:

1. **BYOK Mode**: Shows API key input dialog immediately
2. **Shared Mode**: Shows dialog only when quota exceeded
3. **Novita Models**: Shows sponsor badge if `sponsors_only`

---

## Testing Configuration

### Test NOVITA_ACCESS_MODE

**Test "all" mode:**
1. Set `NOVITA_ACCESS_MODE=all`
2. Restart backend
3. Select a Novita model (e.g., Llama)
4. Should work for any user ✅

**Test "sponsors_only" mode:**
1. Set `NOVITA_ACCESS_MODE=sponsors_only`
2. Restart backend
3. Non-sponsor tries Novita model → Should get 403 error ❌
4. Sponsor tries Novita model → Should work ✅

### Test GEMINI_MODE

**Test "byok" mode:**
1. Set `GEMINI_MODE=byok`
2. Remove or clear `GEMINI_API_KEY`
3. Restart backend
4. Try to generate without providing key → Should show BYOK dialog
5. Provide key → Should work ✅

**Test "shared" mode:**
1. Set `GEMINI_MODE=shared`
2. Add `GEMINI_API_KEY=your_key`
3. Restart backend
4. Generate without user key → Uses system key ✅
5. After quota exceeded → Shows BYOK dialog ✅

---

## Best Practices

### For Production

1. **Use `sponsors_only` for Novita**
   - Protects your Novita API costs
   - Gives sponsors exclusive value

2. **Use `shared` for Gemini**
   - Provides free tier with quotas
   - Allows BYOK for power users

3. **Set reasonable quotas**
   ```env
   RATE_LIMIT_FREE=2/hour  # Conservative
   ```

### For Development

1. **Use `all` for testing**
   - Easier to test all models
   - No sponsor checks needed

2. **Use `shared` for Gemini**
   - Test quota system
   - Test BYOK fallback

---

## Environment Variable Reference

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `NOVITA_ACCESS_MODE` | `all`, `sponsors_only` | `sponsors_only` | Who can use Novita models |
| `GEMINI_MODE` | `shared`, `byok` | `shared` | How Gemini API is accessed |
| `GEMINI_API_KEY` | Your API key | None | System Gemini key (for shared mode) |
| `NOVITA_API_KEY` | Your API key | None | System Novita key |
| `RATE_LIMIT_FREE` | `N/period` | `2/hour` | Free tier quota |

---

## Migration Guide

### From Old System

If you're upgrading from the old system:

**Old:**
```env
# Old: Hardcoded behavior
GEMINI_API_KEY=key
NOVITA_API_KEY=key
```

**New (Same behavior):**
```env
# New: Explicit configuration
GEMINI_API_KEY=key
NOVITA_API_KEY=key
NOVITA_ACCESS_MODE=sponsors_only  # Same as before
GEMINI_MODE=shared                 # Same as before
```

**No breaking changes!** The defaults match the old behavior.

---

## Troubleshooting

### Novita "403 Forbidden" for all users

**Problem:** `NOVITA_ACCESS_MODE=sponsors_only` but you want everyone to access

**Solution:**
```env
NOVITA_ACCESS_MODE=all
```

### Users forced to provide Gemini key

**Problem:** `GEMINI_MODE=byok` but you want to provide system key

**Solution:**
```env
GEMINI_MODE=shared
GEMINI_API_KEY=your_system_key_here
```

### Invalid mode warnings in logs

**Problem:** Typo in mode setting (e.g., `NOVITA_ACCESS_MODE=open`)

**Solution:** Use exact values:
- Novita: `all` or `sponsors_only`
- Gemini: `shared` or `byok`

---

## Summary

✅ **Flexible access control**
✅ **Support for BYOK (Bring Your Own Key)**
✅ **Sponsor-only premium features**
✅ **Easy configuration via .env**
✅ **Backward compatible**

Configure once in `.env`, restart backend, and you're done! 🚀
