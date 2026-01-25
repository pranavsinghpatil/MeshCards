# 🔍 Monitoring & User Transparency

MeshCards is built with a "Fail-Open" and "Transparent-First" philosophy. We believe that when users understand *why* a system is behaving a certain way, they are more patient and supportive.

## 🚨 Automatic Error Reporting

The backend includes a specialized `report_error` utility that automatically creates GitHub issues when unhandled exceptions occur in production.

### What is Reported?
- **Context**: Where the error happened (e.g., "Deck Generation").
- **Stack Trace**: The full technical traceback for debugging.
- **Environment**: Production vs Development settings.
- **User ID**: Anonymized (first 8 characters only) to preserve privacy.

### 🔒 Privacy-First Sanitization
To prevent sensitive data leaks, the system automatically redacts:
- API Keys (`GEMINI_API_KEY`, etc.)
- Authorization Headers (`Bearer token`)
- Passwords and PII.

---

## 💡 Educational User Experience

We avoid generic errors like "Something went wrong." Instead, we use **Educational Messaging**:

### 1. Quota Transparency
- **Message**: "You've used your 2 free decks for today."
- **Education**: Explain that AI APIs have per-request costs and limits ensure fair access for all students.
- **Call to Action**: Encouraging sponsorship as a way to "grow the pool" for everyone.

### 2. Queue Visibility
- **Message**: "Position 3 of 5 | Estimated Wait: 45s"
- **Education**: Explain that the queue exists to prevent hitting system-wide rate limits, ensuring a 100% success rate for everyone.

### 3. Rate Limit (429) Guidance
- Instead of showing a raw 429 error, we show an "API is Busy" status with a countdown, explaining that the system is automatically retrying on their behalf.

---

## 📈 Benefits of Transparency
- **Reduced Support Tickets**: Users don't report "bugs" that are actually just expected rate limits.
- **Trust**: Users appreciate knowing that their privacy is protected and that the system is working hard behind the scenes.
- **Community**: Transparent messaging often leads to increased project sponsorship and star-count on GitHub.
