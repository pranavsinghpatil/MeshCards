# Quick Deployment Guide for meshcards.prnav.me

## Step 1: Build Frontend ✅ (Already Done!)
The frontend has been built successfully.

## Step 2: Deploy to Vercel

### A. Using Vercel CLI (Continue your current process)

The vercel command is running. Answer the prompts:

1. **Set up and deploy?** → Press `Y` or `Enter`
2. **Which scope?** → Select "PranavSingh's projects" (Press Enter)
3. **Link to existing project?** → If meshcards exists, select it. Otherwise, create new.
4. **Project name?** → Type: `meshcards` (or keep suggested name)
5. **Directory?** → Press `Enter` (use current directory)
6. **Override settings?** → Press `N` (use vercel.json)

The deployment will start automatically after answering these questions.

### B. Alternative: Use Vercel Dashboard (If CLI is problematic)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository (or import from local)
4. Project settings:
   - **Framework Preset:** Other
   - **Build Command:** `cd frontend && npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm install`
5. Click "Deploy"

## Step 3: Add Environment Variables

**CRITICAL: Do this immediately after deployment**

Go to: https://vercel.com/pranavsingh/meshcards/settings/environment-variables

Add these variables (one by one):

### Required:
```
ENV = production
GEMINI_API_KEY = your_gemini_key_here
SUPABASE_URL = your_supabase_url_here
SUPABASE_KEY = your_supabase_service_role_key_here
RATE_LIMIT_FREE = 2/hour
```

### Optional:
```
NOVITA_API_KEY = your_novita_key_here
GITHUB_TOKEN = your_github_token_here
GITHUB_REPO = pranavsinghpatil/MeshCards
APP_NAME = MeshCards Studio
```

**After adding env vars, redeploy:**
- Go to Deployments tab
- Click the three dots on latest deployment
- Click "Redeploy"

## Step 4: Add Custom Domain

1. Go to: https://vercel.com/pranavsingh/meshcards/settings/domains
2. Click "Add Domain"
3. Enter: `meshcards.prnav.me`
4. Click "Add"
5. Vercel will show DNS instructions

## Step 5: Configure DNS

In your domain registrar (where you bought prnav.me):

### Option A: CNAME (Recommended)
```
Type: CNAME
Name: meshcards
Target: cname.vercel-dns.com
TTL: Auto or 3600
```

### Option B: A Record (If CNAME doesn't work)
```
Type: A
Name: meshcards
Target: 76.76.21.21
TTL: Auto or 3600
```

**Save the DNS record and wait 10-60 minutes for propagation.**

## Step 6: Verify Deployment

After DNS propagation:

1. Visit: https://meshcards.prnav.me
2. Check SSL certificate (should show 🔒)
3. Test sign-in functionality
4. Try generating a deck
5. Check if API calls work

## Troubleshooting

### Build Fails
- Check if `frontend/dist` exists locally
- Verify vercel.json is correct
- Check build logs in Vercel dashboard

### API Errors
- Verify environment variables are set correctly
- Redeploy after adding env vars
- Check Vercel function logs

### Domain Not Working
- Wait longer (DNS can take 24 hours)
- Verify DNS records with: `nslookup meshcards.prnav.me`
- Check domain is added in Vercel dashboard

## Quick Commands

```bash
# If you need to start over
vercel --prod

# To check deployment status
vercel ls

# To see logs
vercel logs meshcards

# To pull environment variables
vercel env pull
```

## Current Status

✅ Frontend built successfully
⏳ Deployment in progress (answer the CLI prompts)
⏹️ Environment variables (do after deployment)
⏹️ Custom domain setup
⏹️ DNS configuration

---

**Need help?** Check the full guide: `DEPLOYMENT_CHECKLIST.md`
