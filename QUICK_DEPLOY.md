# ✅ Quick Action Checklist

## What Just Happened ✅

- ✅ All new features coded
- ✅ Changes committed to git
- ✅ Pushed to GitHub (main branch)

---

## What You Need to Do Now 🎯

### 1️⃣ Add Environment Variables (5 minutes)

**Go to:** https://vercel.com/pranavsingh/meshcards/settings/environment-variables

Click "**Add New**" and add these one by one:

```
Name: ENV
Value: production
---
Name: GEMINI_API_KEY  
Value: [your Gemini API key]
---
Name: SUPABASE_URL
Value: https://yourproject.supabase.co
---
Name: SUPABASE_KEY
Value: [your service_role key]
---
Name: RATE_LIMIT_FREE
Value: 2/hour
---
Name: NOVITA_API_KEY (optional)
Value: [your Novita key]
---
Name: GITHUB_TOKEN (optional)
Value: ghp_yourtoken
---
Name: GITHUB_REPO (optional)
Value: pranavsinghpatil/MeshCards
```

**Make sure to select "Production" environment for each!**

---

### 2️⃣ Redeploy (1 minute)

After adding env vars:

**Go to:** https://vercel.com/pranavsingh/meshcards

- Click "**Deployments**" tab
- Click the **three dots (•••)** on the latest deployment
- Click "**Redeploy**"

OR just wait - Vercel should auto-deploy from your GitHub push!

---

### 3️⃣ Create Sponsors Table (2 minutes)

**Go to:** Supabase Dashboard → SQL Editor

**Paste this and run:**

```sql
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    tier TEXT DEFAULT 'supporter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX sponsors_user_id_idx ON sponsors(user_id);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own status"
    ON sponsors FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage"
    ON sponsors FOR ALL
    USING (auth.role() = 'service_role');
```

---

### 4️⃣ Add Custom Domain (2 minutes)

**Go to:** https://vercel.com/pranavsingh/meshcards/settings/domains

- Click "**Add Domain**"
- Enter: `meshcards.prnav.me`
- Click "**Add**"

---

### 5️⃣ Configure DNS (2 minutes)

**In your domain registrar (where you manage prnav.me):**

Add this record:

```
Type: CNAME
Name: meshcards
Value: cname.vercel-dns.com
TTL: Auto
```

**Save** and wait 10-60 minutes for propagation.

---

## 🧪 Test Everything

### Test 1: Basic Functionality
Visit: **meshcards.vercel.app**

- [ ] Site loads
- [ ] Can sign in
- [ ] Can generate a deck

### Test 2: BYOK Feature
- [ ] Generate 3 decks rapidly
- [ ] Dialog appears asking for API key
- [ ] Can enter key and continue

### Test 3: Sponsor Features (Optional)
Add yourself in Supabase:

```sql
INSERT INTO sponsors (user_id, email, is_active)
SELECT id, email, true
FROM auth.users WHERE email = 'your@email.com';
```

Then check:
- [ ] Premium badge shows
- [ ] Premium models visible
- [ ] Can use premium models

### Test 4: Custom Domain
Visit: **meshcards.prnav.me**

- [ ] Domain loads
- [ ] SSL certificate active (🔒)
- [ ] Everything works

---

## 📞 Need Help?

Check these files:
- `UPDATE_VERCEL.md` - Detailed step-by-step
- `VERCEL_ENV_VARS.md` - All environment variables explained
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist

---

## ⏱️ Time Estimate

- Adding env vars: 5 min
- Redeploy wait: 3-5 min
- Create table: 2 min
- Add domain: 2 min
- DNS setup: 2 min
- **DNS propagation: 10-60 min (happens in background)**

**Total active time: ~15 minutes**

---

🎉 **That's it! You'll be live at meshcards.prnav.me soon!**
