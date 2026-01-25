# 🛠️ Developer & Debugging Guide

This guide is for developers maintaining or extending MeshCards.

## 🏁 Local Development Setup

1. **Environment**: Copy `.env.example` to `.env` in both `frontend/` and `backend/`.
2. **Supabase Redirects**: For local sign-in to work, ensure `http://localhost:5173/**` is added to your Supabase "Redirect URLs" under **Authentication** → **URL Configuration**.
3. **Launch**: Use `./launch.bat` (Windows) to start both the Vite dev server and the FastAPI backend concurrently.

---

## 🐞 Common Debugging Scenarios

### 1. `net::ERR_FAILED` or `401 Unauthorized`
- **Cause**: User is not signed in or the Supabase session has expired.
- **Fix**: Sign out and sign back in. Check the browser console to verify the `sb-access-token` is present in local storage.

### 2. Quota Check Failures
- **Cause**: The `profiles` table doesn't exist or `ENV=production` is set without a database connection.
- **Local Test**: Set `ENV=development` in your backend `.env`. This skips all quota checks and allows unlimited generation.
- **Manual Reset**: Run `UPDATE profiles SET daily_count = 0 WHERE id = 'your-uuid';` in the Supabase SQL editor.

### 3. Generation Process Hangs
- **Cause**: The `JobQueue` loop might have crashed or the backend worker is stuck.
- **Check**: Look at the terminal logs. You should see `INFO - Job abc: Added to queue` followed by `INFO - Processing...`.
- **Reset**: Restart the backend server. The queue lives in memory and will reset.

---

## 🧪 Testing Core Systems

### Document Processing (Chunking)
To verify semantic extraction and chunking:
1. Upload a 50+ page PDF.
2. Watch logs for `Using semantic extraction` or `Using chunked generation`.
3. Verify the final token count reduction (should be ~70-80%).

### Feedback Loop
- Submissions should create a new issue in your configured GitHub repo.
- If it fails, verify `GITHUB_TOKEN` has the `repo` scope and `GITHUB_REPO` is in `owner/repo` format.

---

## 🏗️ Technical Troubleshooting
- **CORS Errors**: If the frontend can't talk to the backend, ensure `FRONTEND_URL` in the backend `.env` matches your local URL (`http://localhost:5173`).
- **Storage Errors**: If files aren't saving, verify the `decks/` folder exists in the root (for dev) or the `deck-files` bucket is public/correctly-configured in Supabase (for prod).
