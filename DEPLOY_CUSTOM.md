# Deployment Guide for meshcards.prnav.me

This guide covers deploying MeshCards to your custom domain `meshcards.prnav.me`.

## Prerequisites

- Domain name: `meshcards.prnav.me`
- Vercel account (or your preferred hosting platform)
- Supabase project for authentication and database
- API keys for AI providers

## Option 1: Deploy to Vercel (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Configure Environment Variables

Create a `.env.production` file or configure via Vercel dashboard:

```env
ENV=production
APP_NAME="MeshCards Studio"

# AI Providers
GEMINI_API_KEY=your_gemini_key_here
NOVITA_API_KEY=your_novita_key_here

# Rate Limiting
RATE_LIMIT_FREE="2/hour"

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# GitHub Feedback (Optional)
GITHUB_TOKEN=ghp_your_token_here
GITHUB_REPO=pranavsinghpatil/MeshCards

# Sponsor Verification (Optional)
BUYMEACOFFEE_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Deploy

```bash
# From project root
vercel --prod
```

### 5. Configure Custom Domain

In Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add `meshcards.prnav.me`
3. Update DNS records as instructed by Vercel

**DNS Configuration:**
- Type: `CNAME`
- Name: `meshcards` (or `@` if root domain)
- Target: `cname.vercel-dns.com`

## Option 2: Deploy to Linux VPS

### 1. Server Setup

```bash
# SSH into your server
ssh user@your-server-ip

# Install dependencies
sudo apt update
sudo apt install -y python3.10 python3-pip nodejs npm nginx certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Clone Repository

```bash
cd /var/www
git clone https://github.com/pranavsinghpatil/MeshCards.git
cd MeshCards
```

### 3. Setup Backend

```bash
# Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with your credentials
```

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

### 5. Configure Nginx

Create `/etc/nginx/sites-available/meshcards`:

```nginx
server {
    listen 80;
    server_name meshcards.prnav.me;

    # Frontend
    location / {
        root /var/www/MeshCards/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /assets {
        root /var/www/MeshCards/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/meshcards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate

```bash
sudo certbot --nginx -d meshcards.prnav.me
```

### 7. Start Backend with PM2

```bash
pm2 start "uvicorn backend.main:app --host 0.0.0.0 --port 8000" --name meshcards
pm2 save
pm2 startup
```

### 8. DNS Configuration

Point your domain to the server:
- Type: `A Record`
- Name: `meshcards`
- Value: `your-server-ip`

## Database Setup (Supabase)

### 1. Create Sponsors Table

Execute this SQL in Supabase SQL Editor:

```sql
-- Create sponsors table for premium features
CREATE TABLE sponsors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    tier TEXT DEFAULT 'supporter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Users can read their own sponsor status
CREATE POLICY "Users can view their sponsor status"
    ON sponsors FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update sponsors
CREATE POLICY "Service role can manage sponsors"
    ON sponsors FOR ALL
    USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX sponsors_user_id_idx ON sponsors(user_id);
CREATE INDEX sponsors_email_idx ON sponsors(email);
```

### 2. Add Sponsor Webhook (Optional)

If using Buy Me a Coffee, set up webhook endpoint:
- URL: `https://meshcards.prnav.me/api/sponsor-webhook`
- This will automatically add sponsors to the database

## Post-Deployment

### 1. Verify Services

```bash
# Check backend is running
curl https://meshcards.prnav.me/api/config

# Check database connection
# Login and try generating a deck
```

### 2. Monitor Logs

**Vercel:**
- View logs in Vercel Dashboard → Deployments → Logs

**VPS:**
```bash
pm2 logs meshcards
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Add Sponsors Manually

Until webhook is set up:

```sql
INSERT INTO sponsors (user_id, email, is_active, tier)
VALUES (
    'user-uuid-from-auth-users',
    'sponsor@example.com',
    true,
    'supporter'
);
```

## Updating the Application

### Vercel

```bash
git pull origin main
vercel --prod
```

### VPS

```bash
cd /var/www/MeshCards
git pull origin main

# Update backend
source venv/bin/activate
pip install -r requirements.txt

# Update frontend
cd frontend
npm install
npm run build
cd ..

# Restart services
pm2 restart meshcards
sudo systemctl reload nginx
```

## Troubleshooting

### API Errors

Check environment variables are set correctly:
```bash
# Vercel
vercel env ls

# VPS
cat .env
```

### Sponsor Features Not Working

1. Verify sponsors table exists in Supabase
2. Check user_id matches auth.users table
3. Verify is_active is true

### Domain Not Resolving

1. Check DNS propagation: `dig meshcards.prnav.me`
2. Verify Nginx configuration: `sudo nginx -t`
3. Check SSL certificate: `sudo certbot certificates`

## Security Checklist

- [ ] All API keys stored in environment variables (never in code)
- [ ] Supabase RLS policies enabled
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] GitHub tokens have minimal required scopes

## Support

For issues, please create an issue on GitHub:
https://github.com/pranavsinghpatil/MeshCards/issues
