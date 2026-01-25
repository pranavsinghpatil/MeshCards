# 🔐 Auth, Quotas & Access Control

This document explains how MeshCards manages user authentication, daily limits, and access to premium models.

## 🚠 Access Control System

MeshCards uses a flexible access control system to manage features for different user tiers.

### 1. Configuration Options

| Variable | Options | Default | Description |
|----------|---------|---------|-------------|
| `NOVITA_ACCESS_MODE` | `all`, `sponsors_only` | `sponsors_only` | Who can use premium models |
| `GEMINI_MODE` | `shared`, `byok` | `shared` | Gemini API access strategy |

- **`sponsors_only`**: Premium models (Llama, Qwen, etc.) are restricted to verified sponsors.
- **`shared`**: Uses the system API key (with daily quotas) until exceeded.
- **`byok`**: "Bring Your Own Key" - Users must provide their own API key to generate content.

### 2. User Flows

#### Novita (Rare Models)
1. User requests a Rare Model (e.g., Llama 3.3).
2. If `sponsors_only`, system checks for sponsor status.
3. If user is NOT a sponsor but provides their **OWN** Novita API key, the check is bypassed.

#### Gemini (Standard Models)
1. User starts generation using Gemini.
2. If `shared`, system uses internal key with local quota check.
3. If quota is hit or mode is `byok`, user is prompted to provide their own key.

---

## 📊 Daily Quota System

We enforce strict daily limits to prevent API abuse and manage server load (OCR, PDF processing).

### 1. Limits (Reset at 12 AM IST)
- **Free Users**: 2 decks per day.
- **Sponsors**: 5 decks per day.

### 2. IST Timezone Enforcement
The system uses **India Standard Time (UTC+5:30)** for all resets, ensuring consistency for the core user base.
- **Fail-Closed in Production**: If the quota cannot be verified (e.g., database down), access is denied as a fallback.
- **Fail-Open in Development**: Allows continuous testing even without a database.

### 3. Database Schema (`profiles`)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    daily_count INTEGER DEFAULT 0,
    last_reset DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛡️ API Limit & Protection (429 Errors)

To handle Google/Novita rate limits, we implement a multi-layered protection system.

### 1. Layered Defense
- **Bursts Prevention**: Request queuing to space out generations.
- **Exponential Backoff**: Automatic retries (3s → 6s → 12s) when a `429 ResourceExhausted` error is hit.
- **Token Estimation**: Counts characters (1 token ≈ 4 chars) before sending to API to prevent exceeding context windows.

### 2. Load Balancing (Optional)
Supports rotation between multiple API keys via `GEMINI_API_KEYS` (comma-separated env variable) to increase aggregate throughput.

---

## 🛠️ Testing Locally

1. **Simulate Sponsor**: Update the `sponsors` table in Supabase with your user ID.
2. **Reset Quota**:
   ```sql
   UPDATE profiles SET daily_count = 0 WHERE id = 'your-user-id';
   ```
3. **Trigger BYOK**: Set `GEMINI_MODE=byok` in `.env`.
