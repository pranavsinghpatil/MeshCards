# Leapcell Deployment Guide for MeshCards Backend

## Prerequisites
- Leapcell account
- GitHub repository connected to Leapcell
- Supabase project (for auth and storage)

## Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Deploy backend to Leapcell"
git push origin main
```

### 2. Create New Project in Leapcell
1. Go to [Leapcell Dashboard](https://leapcell.io)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `MeshCards` repository
5. Branch: `main`

### 3. Configure Build Settings
- **Framework**: Docker
- **Dockerfile Path**: `./Dockerfile`
- **Port**: `8000`

### 4. Set Environment Variables
Add these in Leapcell project settings:

```env
# Required
ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key_here

# Optional (if using OpenAI)
OPENAI_API_KEY=your_openai_key_here

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_FREE=5/hour
```

### 5. Deploy
Click "Deploy" and wait for the build to complete.

### 6. Get Your Backend URL
After deployment, Leapcell will provide a URL like:
```
https://your-app.leapcell.app
```

### 7. Update Frontend
Update your frontend `.env` file:
```env
VITE_API_URL=https://your-app.leapcell.app
```

## Testing the Deployment

Test the API:
```bash
curl https://your-app.leapcell.app/api/config
```

Should return:
```json
{
  "gemini_available": true,
  "openai_available": false,
  "supabase_url": "https://...",
  "supabase_anon_key": "..."
}
```

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Ensure all dependencies are in `requirements.txt`
- Check build logs in Leapcell dashboard

### App Crashes
- Check environment variables are set correctly
- View logs in Leapcell dashboard
- Ensure SUPABASE_KEY is the SERVICE ROLE key, not ANON key

### Quota System Not Working
- Verify SUPABASE_URL and SUPABASE_KEY are set
- Run RLS policies in Supabase (see `docs/supabase-rls-policies.sql`)
- Check logs for quota-related errors

## Monitoring

- **Logs**: View in Leapcell dashboard
- **Metrics**: Check request count, response time
- **Errors**: Monitor error rates

## Scaling

Leapcell auto-scales based on traffic. For heavy usage:
- Upgrade to paid plan for more resources
- Consider adding Redis for job queue
- Use Supabase Storage for deck files (already implemented!)

## Cost Estimate

- **Leapcell Free Tier**: Good for testing
- **Leapcell Pro**: ~$5-10/month for production
- **Supabase Free Tier**: 500MB storage, 2GB bandwidth
- **Total**: Can run for free initially, ~$5-15/month for production
