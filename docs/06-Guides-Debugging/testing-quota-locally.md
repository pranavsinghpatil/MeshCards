# Testing Quota System Locally

## Problem
Quota limits don't work in local development because Supabase is not configured.

## Solutions

### Option 1: Force Production Mode Locally (Quick Test)

**In `backend/.env`:**
```env
ENV=production
```

**This will:**
- ✅ Enforce quota limits strictly
- ✅ Require Supabase to be configured
- ⚠️ Fail if Supabase credentials are missing

### Option 2: Configure Supabase Locally (Recommended)

**In `backend/.env`:**
```env
ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

**This will:**
- ✅ Enforce quota limits
- ✅ Work in development mode
- ✅ Use your production Supabase database

**Get credentials from:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy `URL` and `service_role` key

### Option 3: Keep Development Mode (No Limits)

**Current setup** - No `.env` changes needed

**This will:**
- ✅ Skip quota checks
- ✅ Allow unlimited generations
- ✅ Good for testing generation logic
- ⚠️ Won't test quota system

## Testing the Queue System

The queue system and improved error messages will work regardless of quota settings!

**To test:**
1. Generate a deck
2. You'll see toast messages:
   - "⏳ In Queue (Position X/Y)" if queued
   - "🔄 Processing Your Deck" when processing
   - Enhanced error messages if it fails

## Recommended Setup for Local Development

**backend/.env:**
```env
# Use development mode but with Supabase
ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-key-here
```

**This gives you:**
- ✅ Quota system works
- ✅ Can test limits
- ✅ Development-friendly error handling
- ✅ Full feature parity with production

## What Changed in Frontend

**Studio.tsx now shows:**
- Queue position: "⏳ In Queue (Position 3/5)"
- Wait time: "Estimated wait: 45s"
- Context: "MeshCards is FREE - we queue requests..."
- Better error messages with explanations

**You'll see these automatically when:**
- Jobs are queued
- Processing starts
- Errors occur (with educational context)

## Quick Test

1. **Restart your backend** (to load new code)
2. **Generate a deck**
3. **Watch for toast notifications** showing queue status
4. **Check console** for backend logs

The UI improvements work immediately - no configuration needed!
