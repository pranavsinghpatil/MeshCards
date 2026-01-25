# 💬 Feedback Loop & GitHub Integration

We rely on a tightening feedback loop to improve MeshCards. Every user suggestion, bug report, or praise is automatically synthesized into our development workflow via GitHub.

## 🚀 How it Works

When a user submits the "Feedback Form" in the app:
1. **Frontend**: Captures the rating (1-5), category (Bug, Suggestion, etc.), and message. It also supports **file attachments** (screenshots/PDFs) up to 10MB.
2. **Backend**: Receives the multipart form data and uses the GitHub REST API to create a new issue.
3. **GitHub**: A new issue is raised with labels like `feedback` and `user-submitted`, containing all the context needed for developers to act.

---

## 📋 System Setup

To enable this integration, configure the following environment variables in your production environment (Leapcell/Vercel):

| Variable | Description |
|----------|-------------|
| `GITHUB_TOKEN` | A Personal Access Token (classic) with `repo` scope. |
| `GITHUB_REPO` | The target repository in `username/repo` format. |

### Creating a Token
1. Go to **GitHub Settings** → **Developer Settings** → **Personal Access Tokens**.
2. Generate a new token (classic) with the **`repo`** scope.
3. **Important**: Store this securely; it should never be committed to your codebase.

---

## 🎨 File Upload Support

The feedback system is designed to handle rich context:
- **Images**: PNG/JPG support for bug screenshots.
- **Documents**: PDF support for sharing specific files that caused parity issues.
- **Status**: Attachment info (filename, size) is appended to the GitHub issue body.

---

## 🛡️ Security & Rate Limits
- **Sanitization**: User emails are included for follow-up only if provided.
- **Minimal Scopes**: The token only requires `repo` permissions to create issues.
- **Throughput**: GitHub allows 5,000 authenticated API calls/hour, which is far beyond our typical feedback volume.
