# 🚀 Quick Setup Guide - Access Control

## What You Need to Add to Your `.env`

Add these two lines to your `.env` file:

```env
# Access Control Settings
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=shared
```

---

## Common Configurations

### Option 1: Current Setup (Recommended)
```env
# Sponsors get Novita, everyone gets Gemini with quotas
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=shared
GEMINI_API_KEY=AIzaSyA81hwLZpXzlfyMpNTzS4CptgT_KqoO1Ds  # NO QUOTES!
```

### Option 2: Open Access
```env
# Everyone gets everything
NOVITA_ACCESS_MODE=all
GEMINI_MODE=shared
GEMINI_API_KEY=AIzaSyA81hwLZpXzlfyMpNTzS4CptgT_KqoO1Ds
NOVITA_API_KEY=your_novita_key
```

### Option 3: Full BYOK (Bring Your Own Key)
```env
# Users must provide their own Gemini keys
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=byok
# No GEMINI_API_KEY needed!
NOVITA_API_KEY=your_novita_key
```

---

## How to Test

### Test Novita Access

**1. Test "all" mode:**
```bash
# In .env
NOVITA_ACCESS_MODE=all

# Restart
Ctrl+C
./launch.bat

# Try selecting Llama or Mistral model
# Should work for everyone! ✅
```

**2. Test "sponsors_only" mode:**
```bash
# In .env
NOVITA_ACCESS_MODE=sponsors_only

# Restart
Ctrl+C
./launch.bat

# Non-sponsor tries Novita → Gets error ❌
# Sponsor tries Novita → Works! ✅
```

### Test Gemini Mode

**1. Test "byok" mode:**
```bash
# In .env
GEMINI_MODE=byok
# Remove or comment out GEMINI_API_KEY

# Restart
Ctrl+C
./launch.bat

# Try to generate → Dialog asks for API key
# Provide key → Works! ✅
```

**2. Test "shared" mode:**
```bash
# In .env
GEMINI_MODE=shared
GEMINI_API_KEY=AIzaSyA81hwLZpXzlfyMpNTzS4CptgT_KqoO1Ds

# Restart
Ctrl+C
./launch.bat

# Generate without providing key → Uses system key ✅
# After quota exceeded → Prompts for key ✅
```

---

## Your Current .env Should Look Like:

```env
# API Keys (NO QUOTES!)
GEMINI_API_KEY=AIzaSyA81hwLZpXzlfyMpNTzS4CptgT_KqoO1Ds
OPENAI_API_KEY=will_be_added_later
ANTHROPIC_API_KEY=will_be_added_later
NOVITA_API_KEY=your_novita_key_here

# Access Control (NEW!)
NOVITA_ACCESS_MODE=sponsors_only
GEMINI_MODE=shared

# App Settings
ENV=production
APP_NAME=MeshCards Studio

# Supabase
SUPABASE_URL=https://easqdxwaisekccqeyekw.supabase.co
SUPABASE_KEY=eyJhbGci...your_service_role_key

# Rate Limiting
RATE_LIMIT_FREE=2/hour

# Frontend
VITE_MAINTENANCE_MODE=false
```

---

## Quick Reference

| Want to... | Set |
|-----------|-----|
| Everyone uses Novita | `NOVITA_ACCESS_MODE=all` |
| Only sponsors use Novita | `NOVITA_ACCESS_MODE=sponsors_only` |
| Provide free Gemini (with quotas) | `GEMINI_MODE=shared` + add key |
| Force users to provide Gemini key | `GEMINI_MODE=byok` |

---

## After Setup

1. **Update your .env** with the new settings
2. **Restart backend:** `Ctrl+C` then `./launch.bat`
3. **Test it:** Try generating to see if it works
4. **Check logs:** Watch the terminal for any errors

Done! 🎉

---

## Troubleshooting

**Problem:** "Invalid NOVITA_ACCESS_MODE"
**Fix:** Use exact value: `all` or `sponsors_only` (lowercase, underscore)

**Problem:** "BYOK_REQUIRED" error when you don't want it
**Fix:** Change to `GEMINI_MODE=shared` and add `GEMINI_API_KEY`

**Problem:** Everyone can use Novita but you want sponsors-only
**Fix:** Change to `NOVITA_ACCESS_MODE=sponsors_only`

---

For detailed documentation, see: `docs/ACCESS_CONTROL.md`
