# Update Existing Vercel Deployment (meshcards.vercel.app)

## ✅ Changes Pushed to GitHub!

All new features are now in your GitHub repository.

---

## 🚀 Step-by-Step Deployment to meshcards.vercel.app

Since you already have the project deployed at **meshcards.vercel.app**, Vercel should auto-deploy from GitHub. Here's what to do:

### Option 1: Auto-Deploy (Recommended)

If your Vercel project is connected to GitHub:

1. **Check Vercel Dashboard**
   - Go to: https://vercel.com/pranavsingh/meshcards
   - You should see a new deployment starting automatically
   - Wait for it to complete (usually 2-5 minutes)

2. **If no auto-deploy happens:**
   - Go to: https://vercel.com/pranavsingh/meshcards
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment

### Option 2: Manual Deploy via CLI

```bash
cd c:\GitRepo\MeshCards
vercel --prod
```

Then just press Enter to accept defaults (it will use the existing project).

---

## ⚙️ Add Environment Variables (CRITICAL!)

**Before the new features work, you MUST add these environment variables:**

Go to: https://vercel.com/pranavsingh/meshcards/settings/environment-variables

### Required Variables:

```
ENV = production
GEMINI_API_KEY = your_gemini_api_key
SUPABASE_URL = https://yourproject.supabase.co
SUPABASE_KEY = your_supabase_service_role_key
RATE_LIMIT_FREE = 2/hour
```

### Optional (for premium features):

```
NOVITA_API_KEY = your_novita_api_key
GITHUB_TOKEN = ghp_your_github_token
GITHUB_REPO = pranavsinghpatil/MeshCards
APP_NAME = MeshCards Studio
```

**After adding variables:**
1. Go to Deployments tab
2. Click the three dots (•••) on latest deployment
3. Click "Redeploy" (or it will auto-deploy)

---

## 🗄️ Database Setup (Supabase)

Run this SQL in Supabase SQL Editor:

```sql
-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    tier TEXT DEFAULT 'supporter' CHECK (tier IN ('supporter', 'sponsor', 'backer')),
    coffee_email TEXT,
    coffee_name TEXT,
    coffee_supporter_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id),
    UNIQUE(coffee_supporter_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS sponsors_user_id_idx ON sponsors(user_id);
CREATE INDEX IF NOT EXISTS sponsors_email_idx ON sponsors(email);
CREATE INDEX IF NOT EXISTS sponsors_active_idx ON sponsors(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sponsor status"
    ON sponsors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sponsors"
    ON sponsors FOR ALL
    USING (auth.role() = 'service_role');

-- Update trigger
CREATE OR REPLACE FUNCTION update_sponsors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS sponsors_updated_at_trigger ON sponsors;
CREATE TRIGGER sponsors_updated_at_trigger
    BEFORE UPDATE ON sponsors
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsors_updated_at();
```

---

## 🌐 Add Custom Domain: meshcards.prnav.me

### In Vercel Dashboard:

1. Go to: https://vercel.com/pranavsingh/meshcards/settings/domains
2. Click "**Add Domain**"
3. Enter: `meshcards.prnav.me`
4. Click "**Add**"

Vercel will give you DNS instructions.

### In Your Domain Registrar (where you manage prnav.me):

Add this DNS record:

```
Type: CNAME
Name: meshcards
Target: cname.vercel-dns.com
TTL: Auto (or 3600)
```

**Wait 10-60 minutes** for DNS propagation.

---

## 🧪 Test Your Deployment

After environment variables are added and redeployed:

### 1. Visit meshcards.vercel.app

Check:
- ✅ Site loads without errors
- ✅ Can sign in with Supabase
- ✅ Can generate a deck (will use your GEMINI_API_KEY)

### 2. Test BYOK Feature

1. Generate 2-3 decks rapidly
2. Should see API limit dialog after 2 retries
3. Enter your Gemini API key
4. Generation should continue

### 3. Test Sponsor Features (Optional)

Add yourself as sponsor in Supabase:

```sql
INSERT INTO sponsors (user_id, email, is_active, tier)
SELECT id, email, true, 'supporter'
FROM auth.users WHERE email = 'your@email.com';
```

Then refresh the app:
- ✅ Should see premium sponsor badge
- ✅ Should see "Premium Models - Large Selection!" in dropdown
- ✅ Should see 4 premium models (Llama, Mistral, Qwen)

### 4. After DNS Propagates

Visit: https://meshcards.prnav.me

- ✅ Domain resolves
- ✅ SSL certificate active (🔒)
- ✅ Everything works same as meshcards.vercel.app

---

## 📋 Deployment Checklist

- [x] ✅ Changes committed to git
- [x] ✅ Changes pushed to GitHub
- [ ] ⏹️ Check Vercel auto-deployment or manually redeploy
- [ ] ⏹️ Add environment variables in Vercel
- [ ] ⏹️ Redeploy after adding env vars
- [ ] ⏹️ Run SQL to create sponsors table in Supabase
- [ ] ⏹️ Test basic functionality
- [ ] ⏹️ Test BYOK feature
- [ ] ⏹️ Add custom domain in Vercel
- [ ] ⏹️ Configure DNS records
- [ ] ⏹️ Wait for DNS propagation
- [ ] ⏹️ Test custom domain

---

## 🎯 Summary

**What we just did:**
1. ✅ Committed all new features
2. ✅ Pushed to GitHub (`main` branch)

**What you need to do:**
1. Add environment variables in Vercel
2. Create sponsors table in Supabase
3. Redeploy (or wait for auto-deploy)
4. Add custom domain `meshcards.prnav.me`
5. Configure DNS

**Timeline:**
- Deployment: 2-5 minutes
- DNS propagation: 10-60 minutes (can be up to 24 hours)

---

## 🆘 Quick Links

- **Vercel Dashboard:** https://vercel.com/pranavsingh/meshcards
- **Add Env Vars:** https://vercel.com/pranavsingh/meshcards/settings/environment-variables
- **Add Domain:** https://vercel.com/pranavsingh/meshcards/settings/domains
- **Supabase Console:** https://supabase.com/dashboard/project/yourproject

---

🎉 **You're almost there!** Just add the env vars and you'll be live with all new features!
