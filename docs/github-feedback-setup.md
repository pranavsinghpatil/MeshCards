# GitHub Feedback Integration Setup Guide

## Overview
MeshCards can automatically create GitHub Issues from user feedback submissions. This allows you to track and manage user feedback directly in your repository.

## Setup Steps

### 1. Create a GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**:
   - Click "Generate new token (classic)"
   - Name: `MeshCards Feedback Integration`
   - Expiration: Choose your preference (90 days, 1 year, or no expiration)

3. **Select Scopes**:
   - ✅ **`repo`** - Full control of private repositories
     - This includes `public_repo` for public repos
   - ✅ **`write:discussion`** (optional) - If you want to create discussions

4. **Generate and Copy Token**:
   - Click "Generate token"
   - **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Configure Backend Environment Variables

#### For Local Development:

Edit `d:/pro/MeshCards/.env`:

```env
# GitHub Feedback Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=pranavsinghpatil/MeshCards
```

#### For Production (Leapcell):

1. Go to **Leapcell Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `GITHUB_TOKEN` | Your GitHub token | `ghp_xxxx...` |
| `GITHUB_REPO` | Your repo in format `owner/repo` | `pranavsinghpatil/MeshCards` |

3. **Redeploy** the backend

### 3. Test the Integration

1. **Submit feedback** through the app
2. **Check your GitHub repository**:
   - Go to: https://github.com/pranavsinghpatil/MeshCards/issues
   - You should see a new issue titled "User Feedback: [type]"
   - Labels: `feedback`, `user-submitted`

## Issue Format

Each feedback submission creates an issue with:

**Title**: `User Feedback: Bug` (or Feature Request, General, etc.)

**Body**:
```
**Rating:** 5/5
**Email:** user@example.com
**Type:** bug

**Message:**
The app crashes when I upload a large PDF file.

**Attachment:**
[filename.png](https://github.com/...)
```

**Labels**: `feedback`, `user-submitted`

## Security Notes

⚠️ **NEVER commit your GitHub token to Git!**

- The `.env` file is already in `.gitignore`
- Only set tokens in environment variables
- Use different tokens for dev and production
- Rotate tokens periodically

## Troubleshooting

### Issue Not Created

1. **Check token permissions**:
   - Token must have `repo` scope
   - Token must not be expired

2. **Check repository name**:
   - Format: `owner/repo`
   - Example: `pranavsinghpatil/MeshCards`
   - Case-sensitive!

3. **Check backend logs**:
   - Look for: `"Feedback posted to GitHub Issues"` (success)
   - Or: `"Failed to post feedback to GitHub"` (error)

### Permission Denied

- Make sure the token has `repo` access
- Verify you have write access to the repository

## Disabling GitHub Integration

To disable, simply remove or comment out the environment variables:

```env
# GITHUB_TOKEN=
# GITHUB_REPO=
```

Feedback will still be logged locally and in console.

## Rate Limits

- GitHub API: 5,000 requests/hour for authenticated requests
- This is more than enough for feedback submissions
- Each feedback = 1 API call

## Alternative: GitHub Discussions

If you prefer discussions over issues, you can modify the endpoint to use:
```
https://api.github.com/repos/{owner}/{repo}/discussions
```

Requires the `write:discussion` scope.
