# Environment Variables for meshcards.prnav.me

## Required Variables

Copy these to Vercel Dashboard → Settings → Environment Variables

### Production Settings
```
ENV=production
APP_NAME=MeshCards Studio
```

### AI Provider Keys
```
GEMINI_API_KEY=your_gemini_api_key_here
NOVITA_API_KEY=your_novita_api_key_here
```

### Database (Supabase) - REQUIRED
```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your_service_role_key_here
```

### Rate Limiting
```
RATE_LIMIT_FREE=2/hour
```

### Feedback Integration (Optional)
```
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO=pranavsinghpatil/MeshCards
```

### Sponsor Webhook (Optional - Future)
```
BUYMEACOFFEE_WEBHOOK_SECRET=your_webhook_secret
```

---

## How to Set in Vercel

### Option 1: Via Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Select "Production" environment
6. Click "Save"

### Option 2: Via CLI
```bash
vercel env add GEMINI_API_KEY production
# Paste your key when prompted
# Repeat for each variable
```

---

## Getting Your Keys

### Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Get API Key" → "Create API Key"
4. Copy the key (starts with `AIzaSy...`)

### Novita API Key (Optional)
1. Visit: https://novita.ai
2. Sign up/Login
3. Go to API Keys section
4. Create new key
5. Copy the key

### Supabase Credentials
1. Go to your Supabase project
2. Settings → API
3. Copy "Project URL" → This is SUPABASE_URL
4. Copy "service_role" key (NOT anon key) → This is SUPABASE_KEY

### GitHub Token (Optional)
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `repo` (full control)
4. Copy the token (starts with `ghp_...`)

---

## Checklist

Before deploying, make sure you have:

- [ ] GEMINI_API_KEY (required)
- [ ] SUPABASE_URL (required)
- [ ] SUPABASE_KEY (required)
- [ ] NOVITA_API_KEY (optional, for sponsors)
- [ ] GITHUB_TOKEN (optional, for error reporting)
- [ ] All environment variables added to Vercel dashboard

---

## After Deployment

1. Add domain `meshcards.prnav.me` in Vercel dashboard
2. Update DNS:
   - Type: CNAME
   - Name: meshcards
   - Target: cname.vercel-dns.com
3. Wait for DNS propagation (10-60 minutes)
4. Test: https://meshcards.prnav.me

---

## Troubleshooting

### Build fails
- Check all environment variables are set
- Verify frontend built successfully locally
- Check Vercel build logs

### API errors
- Verify SUPABASE_URL and SUPABASE_KEY are correct
- Check Supabase project is active
- Verify sponsors table exists

### Domain not working
- Check DNS records are correct
- Wait for propagation (can take up to 24 hours)
- Verify domain is added in Vercel dashboard
