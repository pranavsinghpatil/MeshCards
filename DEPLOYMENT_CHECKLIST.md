# 🚀 Deployment Checklist for MeshCards v2.0

## Pre-Deployment Checks

### Code & Dependencies
- [ ] All changes committed to git
- [ ] `requirements.txt` includes `novita-client`
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Frontend built successfully (`npm run build`)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] No TypeScript/Python errors

### Environment Variables
- [ ] `.env` file configured (never commit this!)
- [ ] `GEMINI_API_KEY` set (required)
- [ ] `NOVITA_API_KEY` set (optional, for sponsors)
- [ ] `SUPABASE_URL` set (required)
- [ ] `SUPABASE_KEY` set (required - use service_role key)
- [ ] `GITHUB_TOKEN` set (optional, for error reporting)
- [ ] `GITHUB_REPO` set (e.g., `pranavsinghpatil/MeshCards`)
- [ ] `ENV=production` in production build

### Database Setup
- [ ] Supabase project created
- [ ] `profiles` table exists (from previous setup)
- [ ] `sponsors` table created (run `docs/database/sponsors_schema.sql`)
- [ ] Row Level Security (RLS) enabled on both tables
- [ ] Test user added to `sponsors` table for testing

### Testing
- [ ] App runs locally with `uvicorn backend.main:app --reload`
- [ ] Frontend runs with `npm run dev`
- [ ] Can sign in/sign out successfully
- [ ] Can generate a deck with Gemini
- [ ] API limit dialog appears (test by rapid generations)
- [ ] Can submit API key and continue
- [ ] Premium models appear for sponsor users
- [ ] Non-sponsors blocked from using Novita

---

## Vercel Deployment

### Step 1: Initial Setup
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Configure Project
- [ ] Run `vercel` to link project
- [ ] Select/create team
- [ ] Link to GitHub repo (optional but recommended)

### Step 3: Set Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:
```
ENV = production
APP_NAME = MeshCards Studio
GEMINI_API_KEY = your_gemini_key_here
NOVITA_API_KEY = your_novita_key_here
SUPABASE_URL = https://yourproject.supabase.co
SUPABASE_KEY = your_service_role_key_here
RATE_LIMIT_FREE = 2/hour
GITHUB_TOKEN = ghp_your_token_here
GITHUB_REPO = pranavsinghpatil/MeshCards
```

### Step 4: Deploy
```bash
# Deploy to production
vercel --prod
```

### Step 5: Custom Domain
- [ ] Go to Vercel Dashboard → Domains
- [ ] Click "Add Domain"
- [ ] Enter `meshcards.prnav.me`
- [ ] Update DNS records (see below)

### Step 6: DNS Configuration
In your domain registrar (e.g., Cloudflare, Namecheap):
```
Type: CNAME
Name: meshcards
Target: cname.vercel-dns.com
TTL: Auto
```

Wait 10-60 minutes for DNS propagation.

### Step 7: Verify
- [ ] Visit `https://meshcards.prnav.me`
- [ ] SSL certificate active (🔒 in browser)
- [ ] App loads correctly
- [ ] Can sign in
- [ ] Can generate deck

---

## Linux VPS Deployment

### Step 1: Server Setup
```bash
# Connect to server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx git

# Install PM2
sudo npm install -g pm2
```

### Step 2: Clone and Setup
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/pranavsinghpatil/MeshCards.git
sudo chown -R $USER:$USER MeshCards
cd MeshCards

# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
npm run build
cd ..

# Configure environment
cp .env.example .env
nano .env  # Add your credentials
```

### Step 3: Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/meshcards
```

Paste this:
```nginx
server {
    listen 80;
    server_name meshcards.prnav.me;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /var/www/MeshCards/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend root endpoints
    location ~ ^/(generate|status|download|feedback|config) {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:
```bash
sudo ln -s /etc/nginx/sites-available/meshcards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL Certificate
```bash
sudo certbot --nginx -d meshcards.prnav.me
```

Follow prompts, select redirect HTTP to HTTPS.

### Step 5: Start Backend with PM2
```bash
cd /var/www/MeshCards
source venv/bin/activate
pm2 start "uvicorn backend.main:app --host 127.0.0.1 --port 8000 --workers 2" --name meshcards
pm2 save
pm2 startup
# Follow the command it prints
```

### Step 6: DNS Configuration
Point A record to your server:
```
Type: A
Name: meshcards
Target: your.server.ip.address
TTL: Auto
```

### Step 7: Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 8: Verify
- [ ] Visit `https://meshcards.prnav.me`
- [ ] Check SSL: `curl -I https://meshcards.prnav.me`
- [ ] Check backend: `pm2 status`
- [ ] Check logs: `pm2 logs meshcards`
- [ ] Test sign in and generation

---

## Post-Deployment Tasks

### Monitoring Setup
- [ ] Set up Vercel analytics (if using Vercel)
- [ ] Set up PM2 monitoring: `pm2 install pm2-logrotate`
- [ ] Configure log rotation
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### Database Maintenance
- [ ] Set up Supabase backups (automatic in most Supabase plans)
- [ ] Create database indexes if not already done
- [ ] Test sponsor table queries

### Sponsor Management
- [ ] Add yourself as test sponsor
- [ ] Test premium model access
- [ ] Set up Buy Me a Coffee webhook (optional)
- [ ] Document manual sponsor addition process

### Documentation
- [ ] Update README.md with new features
- [ ] Add v2.0 to CHANGELOG
- [ ] Update API documentation if needed
- [ ] Share deployment guide with team

### Testing in Production
- [ ] Sign in with real account
- [ ] Generate deck with Gemini (free)
- [ ] Generate 3 decks rapidly to trigger API limit
- [ ] Test BYOK flow with real API key
- [ ] Add sponsor status and test Novita models
- [ ] Test on mobile devices
- [ ] Test on different browsers

---

## Rollback Plan (If Something Goes Wrong)

### Vercel
```bash
# In Vercel Dashboard → Deployments → Previous deployment → Promote to Production
# OR via CLI:
vercel rollback
```

### VPS
```bash
# Stop current version
pm2 stop meshcards

# Revert git
cd /var/www/MeshCards
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>

# Rebuild
cd frontend && npm run build && cd ..
pm2 restart meshcards
```

---

## Maintenance Commands

### Update Application (Vercel)
```bash
git pull origin main
vercel --prod
```

### Update Application (VPS)
```bash
cd /var/www/MeshCards
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
cd frontend && npm install && npm run build && cd ..
pm2 restart meshcards
sudo systemctl reload nginx
```

### View Logs
```bash
# Vercel: Dashboard → Logs
# VPS:
pm2 logs meshcards
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Database Queries
```sql
-- Add sponsor manually
INSERT INTO sponsors (user_id, email, is_active, tier)
SELECT id, email, true, 'supporter'
FROM auth.users
WHERE email = 'user@example.com';

-- Check sponsors
SELECT email, tier, is_active, created_at FROM sponsors ORDER BY created_at DESC;

-- Deactivate sponsor
UPDATE sponsors SET is_active = false WHERE email = 'user@example.com';
```

---

## Success Criteria

✅ Deployment is successful when:
- [ ] Site loads at `https://meshcards.prnav.me`
- [ ] SSL certificate valid
- [ ] Users can sign in/sign up
- [ ] Gemini generation works
- [ ] API limit dialog appears and BYOK works
- [ ] Sponsors see premium models
- [ ] Non-sponsors blocked from Novita
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Mobile responsive
- [ ] Performance acceptable (< 3s load time)

---

## Support Contacts

- **Hosting Issues**: Your hosting provider support
- **DNS Issues**: Your domain registrar support
- **Supabase Issues**: https://supabase.com/support
- **Code Issues**: GitHub Issues
- **General Questions**: Check docs first!

---

🎉 **Ready to deploy!** Follow this checklist step-by-step and you'll have a smooth deployment.

*Last updated: 2026-01-06*
