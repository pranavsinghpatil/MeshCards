# Vercel Deployment Guide for MeshCards Frontend

## Prerequisites
- Vercel account
- GitHub repository
- Backend deployed on Leapcell

## Deployment Steps

### 1. Push Frontend to GitHub
```bash
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 2. Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `MeshCards`

### 3. Configure Project Settings

**Framework Preset**: `Vite`

**Root Directory**: `frontend`

**Build Command**: `npm run build`

**Output Directory**: `dist`

**Install Command**: `npm install`

### 4. Environment Variables

Add these in Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_APP_NAME` | `MeshCards` | App name |
| `VITE_API_URL` | `https://your-backend.leapcell.app` | Your Leapcell backend URL |
| `GITHUB_TOKEN` | `your_github_token` | (Optional) For error reporting |
| `GITHUB_REPO` | `username/repo` | (Optional) Your repo |

**Important**: Replace `https://your-backend.leapcell.app` with your actual Leapcell backend URL!

### 5. Deploy

Click "Deploy" and wait for the build to complete.

### 6. Get Your Frontend URL

After deployment, Vercel will provide a URL like:
```
https://meshcards.vercel.app
```

### 7. Update Backend CORS (Important!)

After getting your Vercel URL, you need to update backend CORS settings.

Add this environment variable in **Leapcell**:
```
FRONTEND_URL=https://meshcards.vercel.app
```

Then update `backend/main.py` CORS origins to include your Vercel URL.

## Testing

1. Visit your Vercel URL
2. Try signing in with Google
3. Generate a test deck
4. Check if everything works!

## Troubleshooting

### API Calls Failing
- Check `VITE_API_URL` is correct
- Verify backend CORS allows your Vercel domain
- Check browser console for errors

### Build Fails
- Check `package.json` in frontend folder
- Verify all dependencies are listed
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Redeploy after adding/changing env vars
- Check Vercel project settings

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in backend

## Monitoring

- **Analytics**: Enable in Vercel project settings
- **Logs**: View in Vercel dashboard
- **Performance**: Check Web Vitals

## Cost

- **Vercel Hobby (Free)**: Perfect for personal projects
- **Vercel Pro**: $20/month for production apps
- **Bandwidth**: 100GB/month on free tier
