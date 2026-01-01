# Fix Local Sign-In Redirect Issue

## 🚨 Problem
When signing in locally, Supabase redirects to production URL (meshcards.vercel.app) which is in maintenance mode.

## ✅ Solution
Add localhost URLs to Supabase allowed redirect URLs.

## 📋 Steps to Fix

### 1. Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your MeshCards project
3. Go to **Authentication** → **URL Configuration**

### 2. Add Localhost URLs

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs (add these):**
```
http://localhost:5173
http://localhost:5173/**
http://localhost:5173/auth/callback
https://meshcards.vercel.app
https://meshcards.vercel.app/**
```

### 3. Save Changes
Click **Save** at the bottom of the page.

### 4. Test Local Sign-In
1. Go to http://localhost:5173
2. Click "Sign In"
3. Complete authentication
4. Should redirect back to http://localhost:5173 ✅

## 🔧 Alternative: Disable Maintenance Mode Locally

If you want to test with production backend but without maintenance:

**In `frontend/.env`:**
```env
VITE_MAINTENANCE_MODE=false
```

This will disable maintenance mode only on your local frontend.

## 📝 Environment Configuration

### Local Development (.env)
```env
VITE_APP_NAME=MeshCards
VITE_API_URL=http://localhost:8000
VITE_MAINTENANCE_MODE=false
```

### Production (Vercel)
```env
VITE_APP_NAME=MeshCards
VITE_API_URL=https://meshcards.leapcell.app
VITE_MAINTENANCE_MODE=true  # or false
```

## 🎯 How It Works

**Sign-In Flow:**
```
1. User clicks "Sign In"
   ↓
2. Supabase Auth opens
   ↓
3. User authenticates
   ↓
4. Supabase redirects to: window.location.origin
   - Local: http://localhost:5173 ✅
   - Production: https://meshcards.vercel.app ✅
```

## 🔒 Security Note

Localhost URLs are only for development. They won't work in production, which is correct for security.

## ✅ Verification

After adding localhost URLs to Supabase:

1. **Local sign-in** → Redirects to localhost ✅
2. **Production sign-in** → Redirects to vercel.app ✅
3. **No cross-origin issues** ✅

## 🚀 Quick Fix Summary

**Immediate action:**
1. Add `http://localhost:5173` to Supabase redirect URLs
2. Add `http://localhost:5173/**` to Supabase redirect URLs
3. Save changes
4. Test local sign-in

**Done!** 🎉
