# 🚀 MeshCards v2.0 - Feature Update

## New Features Overview

This update introduces three major improvements to MeshCards:

1. **Smart API Limit Handling** - BYOK (Bring Your Own Key) support
2. **Premium Novita AI Models** - Sponsors-only access to Llama, Mistral, and Qwen
3. **Custom Domain Deployment** - Ready for meshcards.prnav.me

---

## 1. Smart API Limit Handling ⚡

### Problem Solved
Previously, when the free Gemini API quota was exhausted, users would get an error and couldn't continue. This was frustrating, especially for power users.

### Solution
After **2 failed attempts** due to API limits, the system now:
1. Shows a friendly dialog explaining the situation
2. Provides step-by-step instructions to get a free API key
3. Allows users to enter their own key and continue seamlessly
4. Never stores the user's API key (used only for that generation)

### User Experience

```
Generation Attempt 1 → Rate limit (retry in 5s)
Generation Attempt 2 → Rate limit (retry in 10s)
Generation Attempt 3 → ⚠️ Dialog appears:

┌─────────────────────────────────────────┐
│ 🔴 API Limit Reached                    │
├─────────────────────────────────────────┤
│ Our free Gemini quota is temporarily    │
│ exhausted. Continue by providing your   │
│ own API key (100% free from Google).    │
│                                         │
│ 📝 How to get your free key:           │
│   1. Visit Google AI Studio            │
│   2. Sign in with Google account        │
│   3. Click "Get API Key"                │
│   4. Copy and paste below               │
│                                         │
│ 🔑 Your Gemini API Key:                │
│ [________________________]              │
│                                         │
│ Your key is never stored, only used    │
│ for this generation.                    │
│                                         │
│     [Cancel]  [Continue with My Key]    │
└─────────────────────────────────────────┘
```

### Technical Details

**Backend Changes:**
- `backend/core/llm.py`: Reduced retry count from 5 to 2
- Error raises special `API_LIMIT_EXCEEDED|message` format
- `backend/main.py`: Detects exception and sets job status to `api_limit_exceeded`

**Frontend Changes:**
- `frontend/src/components/ApiKeyDialog.tsx`: New component for user-friendly key input
- `frontend/src/components/Studio.tsx`: 
  - Polls job status and detects `api_limit_exceeded`
  - Shows dialog instead of error toast
  - Retries generation with user key when submitted

---

## 2. Premium Novita AI Models 💎

### What is Novita?
Novita AI provides access to powerful open-source models (Llama, Mistral, Qwen) through a paid API. These models offer:
- **Larger context windows** (up to 128k tokens)
- **Better performance** on specialized tasks
- **Cost-effective** for high-volume users
- **More model choices** for sponsors

### Sponsor-Only Access
To keep MeshCards free for everyone while offering premium features, **Novita models are restricted to sponsors** who support the project.

### Available Models (Sponsors Only)

| Model | Size | Best For | Context |
|-------|------|----------|---------|
| **Llama 3.1 70B** | 70B params | General intelligence | 128K |
| **Llama 3.1 405B** | 405B params | Most powerful | 128K |
| **Mistral Large 2** | 123B params | Reasoning & multilingual | 128K |
| **Qwen 2.5 72B** | 72B params | Long documents | 128K |

### How to Become a Sponsor

1. Visit: https://buymeacoffee.com/htclodkzgo
2. Choose a tier:
   - **Supporter** ($5/month): Basic sponsor benefits
   - **Sponsor** ($15/month): Priority support
   - **Backer** ($50/month): Feature requests
3. Your account is automatically upgraded within 24 hours
4. Premium models appear in the AI Model dropdown

### User Experience

**Non-Sponsors:**
```
AI Model Dropdown:
├─ Gemini (Free)
│  ├─ Gemini 3 Pro
│  ├─ Gemini 3 Flash
│  ├─ Gemini 2.5 Pro
│  └─ Gemini 2.5 Flash Lite
└─ [Become a Sponsor to unlock Novita models] 💎
```

**Sponsors:**
```
AI Model Dropdown:
├─ Gemini (Free)
│  ├─ Gemini 3 Pro
│  ├─ Gemini 3 Flash
│  ├─ Gemini 2.5 Pro
│  └─ Gemini 2.5 Flash Lite
└─ Novita Premium (Sponsors Only) 💎
   ├─ Llama 3.1 70B — Best Open-Source
   ├─ Llama 3.1 405B — Most Powerful
   ├─ Mistral Large 2 — European Excellence
   └─ Qwen 2.5 72B — Long Context Master
```

If a non-sponsor tries to use Novita:
```
❌ Error
Novita premium models are only available to sponsors.
Please support the project at https://buymeacoffee.com/htclodkzgo
to unlock access to Llama, Mistral, Qwen, and more!
```

### Technical Details

**Database Schema:**
```sql
CREATE TABLE sponsors (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    tier TEXT DEFAULT 'supporter',
    created_at TIMESTAMP
);
```

**Backend Changes:**
- `backend/core/sponsor.py`: New module for sponsor verification
- `backend/core/llm.py`: Added `NovitaClient` class
- `backend/core/config.py`: Added `NOVITA_API_KEY` setting
- `backend/main.py`: Sponsor check before Novita generation

**Frontend Changes:**
- `frontend/src/components/Studio.tsx`: 
  - Fetches sponsor status on load
  - Conditionally shows Novita models
  - Tracks provider based on model selection

---

## 3. Custom Domain Deployment 🌐

### Deploy to meshcards.prnav.me

Full deployment guide in `DEPLOY_CUSTOM.md`, covering:

#### Option 1: Vercel (Recommended)
- One-command deployment: `vercel --prod`
- Custom domain setup via dashboard
- Automatic SSL/HTTPS
- Edge caching for performance
- Environment variables management

#### Option 2: Linux VPS
- Nginx configuration
- PM2 process management
- Let's Encrypt SSL
- DNS configuration
- Log monitoring

### Required Environment Variables

```env
# Production Settings
ENV=production
APP_NAME="MeshCards Studio"

# AI Providers
GEMINI_API_KEY=your_gemini_key
NOVITA_API_KEY=your_novita_key

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Rate Limiting
RATE_LIMIT_FREE="2/hour"

# Feedback
GITHUB_TOKEN=ghp_your_token
GITHUB_REPO=pranavsinghpatil/MeshCards
```

### Database Setup

Execute `docs/database/sponsors_schema.sql` in Supabase SQL Editor to create:
- `sponsors` table
- RLS policies
- Indexes for performance
- Triggers for auto-updates

---

## Migration Guide

### For Existing Installations

1. **Update Dependencies:**
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install
   ```

2. **Add Environment Variables:**
   ```bash
   # Add to .env
   NOVITA_API_KEY=your_novita_key_here
   BUYMEACOFFEE_WEBHOOK_SECRET=your_webhook_secret
   ```

3. **Create Sponsors Table:**
   ```bash
   # Run SQL from docs/database/sponsors_schema.sql in Supabase
   ```

4. **Rebuild Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

5. **Restart Backend:**
   ```bash
   # Development
   uvicorn backend.main:app --reload
   
   # Production (PM2)
   pm2 restart meshcards
   ```

### Breaking Changes

**None!** This update is fully backward compatible. New features are opt-in:
- API key dialog only appears when system quota is exhausted
- Novita models only visible to sponsors
- Existing users continue with Gemini as before

---

## Testing

### Test BYOK Flow
1. Use the app without providing a key
2. Generate 2-3 decks quickly to exhaust quota
3. Expected: Dialog should appear after 2 retries
4. Enter your Gemini API key
5. Expected: Generation continues successfully

### Test Sponsor Features
1. Add yourself to sponsors table:
   ```sql
   INSERT INTO sponsors (user_id, email, is_active)
   VALUES ('your-uuid', 'your@email.com', true);
   ```
2. Refresh app
3. Expected: Novita models appear in dropdown
4. Select a Novita model
5. Expected: Generation works (if NOVITA_API_KEY is set)

---

## FAQ

### Q: Is the user's API key stored?
**A:** No. The key is only used for that single generation request and never stored in the database or logs.

### Q: How long does sponsor verification take?
**A:** If manually added to database: instant. If via webhook: usually within 24 hours.

### Q: Can I use my own Novita key without sponsoring?
**A:** No, the sponsor check is enforced server-side. However, you can sponsor and then use your own Novita key for unlimited usage.

### Q: What happens if a sponsor's subscription expires?
**A:** Set `is_active = false` in the sponsors table. They'll immediately lose access to Novita models but can still use free Gemini.

### Q: Can I self-host and disable sponsor checks?
**A:** Yes, you can modify `backend/main.py` line 357-360 to remove the sponsor check. However, you'll still need your own Novita API key.

---

## Support

- **Issues**: https://github.com/pranavsinghpatil/MeshCards/issues
- **Sponsor**: https://buymeacoffee.com/htclodkzgo
- **Email**: pranavpatil@example.com

---

## Credits

- **Gemini API**: Google AI
- **Novita API**: Novita AI
- **Database**: Supabase
- **Frontend**: React + Vite + shadcn/ui
- **Backend**: FastAPI + Python

Built with ❤️ by Pranav Patil
