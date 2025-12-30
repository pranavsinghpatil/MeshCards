# Feedback System - Complete Setup Summary

## ✅ What's Been Implemented

### 1. File Upload in Feedback Form
- **Frontend**: Added file upload UI with drag-and-drop
- **Backend**: Updated endpoint to accept multipart form data
- **Features**:
  - Upload images (PNG, JPG) or PDFs
  - Max file size: 10MB
  - File preview with name and size
  - Remove file button
  - Attachment info included in GitHub issues

### 2. GitHub Issues Integration
- **Automatic Issue Creation**: Feedback submissions create GitHub issues
- **Issue Format**:
  - Title: "User Feedback: [type]"
  - Body: Rating, email, type, message, attachment info
  - Labels: `feedback`, `user-submitted`

## 📋 Setup Instructions

### Quick Start (5 minutes):

1. **Create GitHub Token**:
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Select scope: ✅ `repo`
   - Copy the token (starts with `ghp_`)

2. **Add to `.env`**:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_REPO=pranavsinghpatil/MeshCards
   ```

3. **For Production (Leapcell)**:
   - Dashboard → Settings → Environment Variables
   - Add `GITHUB_TOKEN` and `GITHUB_REPO`
   - Redeploy

4. **Test**:
   - Submit feedback through the app
   - Check: https://github.com/pranavsinghpatil/MeshCards/issues

## 📚 Full Documentation

See `docs/github-feedback-setup.md` for:
- Detailed token creation steps
- Security best practices
- Troubleshooting guide
- Rate limits and alternatives

## 🎨 UI Features

- **File Upload Zone**: Drag-and-drop or click to upload
- **File Preview**: Shows filename and size
- **Remove Button**: Easy to remove attached file
- **Validation**: 10MB size limit with user-friendly error

## 🔒 Security

- ⚠️ Never commit `GITHUB_TOKEN` to Git
- ✅ `.env` is in `.gitignore`
- ✅ Use different tokens for dev/prod
- ✅ Token only has `repo` scope (minimal permissions)

## 🚀 Usage

Users can now:
1. Select feedback type (Suggestion, Bug, Praise, Other)
2. Rate their experience (1-5 stars)
3. Write their message
4. **Attach screenshots or files** 📎
5. Submit → Creates GitHub issue automatically

## 🎯 Benefits

- **Centralized Tracking**: All feedback in GitHub Issues
- **Rich Context**: Screenshots help understand bugs
- **Organized**: Auto-labeled and categorized
- **Searchable**: Use GitHub's powerful search
- **Collaborative**: Team can discuss and assign issues

## 📝 Example GitHub Issue

```markdown
**Rating:** 5/5
**Email:** user@example.com
**Type:** bug

**Message:**
The app crashes when I upload a large PDF file.

**Attachment:** `screenshot.png` (image/png)
*File size: 245678 bytes*
```

## 🔧 Optional: Disable GitHub Integration

To disable, simply remove or comment out:
```env
# GITHUB_TOKEN=
# GITHUB_REPO=
```

Feedback will still be logged locally and in console.
