# 🚀 Production Deployment Guide

This guide covers the end-to-end process of deploying MeshCards to a production environment.

## 🛠️ Infrastructure Stack
- **Frontend**: React (Vite) → **Vercel**
- **Backend**: FastAPI (Python) → **Leapcell** (or any Docker-capable VPS)
- **Database/Auth**: **Supabase**
- **Storage**: **Supabase Storage** (Private Buckets)

---

## 📦 1. Database & Storage Setup (Supabase)

### Auth Configuration
1. Enable **Google OAuth** in Supabase Auth settings.
2. Add your production URL (e.g., `https://meshcards.app`) to the **Redirect URLs**.

### Storage Configuration
1. Create a private bucket named `deck-files`.
2. Ensure RLS policies allow the `service_role` to manage all files and `authenticated` users to read/insert.

---

## 🧠 2. Backend Deployment (Leapcell)

### Environment Variables
Configure these in your Leapcell (or VPS) dashboard:
- `ENV=production`
- `SUPABASE_URL`: Your project URL.
- `SUPABASE_KEY`: Your **Service Role** key.
- `GEMINI_API_KEY`: System key for the free tier.
- `NOVITA_API_KEY`: System key for sponsors.
- `FRONTEND_URL`: URL of your deployed frontend.

### Deployment Path
- **Framework**: Docker
- **Dockerfile**: Located in the root directory.
- **Port**: `8000`

---

## 🎨 3. Frontend Deployment (Vercel)

### Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Output Directory**: `dist`

### Environment Variables
- `VITE_API_URL`: URL of your Leapcell backend.
- `VITE_MAINTENANCE_MODE`: `false` (set to `true` to lock the app).

## 💻 Linux VPS Deployment (Nginx + PM2)

For users hosting on their own hardware or specialized cloud providers.

### 1. Server Setup
```bash
# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.10 python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx git
sudo npm install -g pm2
```

### 2. Nginx Configuration
Create a site file at `/etc/nginx/sites-available/meshcards`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (React Build)
    location / {
        root /var/www/MeshCards/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Process Management (PM2)
```bash
pm2 start "uvicorn backend.main:app --host 127.0.0.1 --port 8000" --name meshcards
pm2 save
pm2 startup
```

---

## 🔧 4. Maintenance & Operations

### Toggle Maintenance Mode
To lock the application for updates:
1. Set `VITE_MAINTENANCE_MODE=true` in Vercel settings or `.env`.
2. Redeploy/Restart the service.
3. Users will see a beautiful, animated maintenance page.

### Rollback Plan
- **Vercel**: Use the "Rollback" button in the deployment history.
- **VPS**: 
  ```bash
  git checkout <previous-commit-hash>
  cd frontend && npm run build
  pm2 restart meshcards
  ```

---

## 📊 Deployment Checklist
- [ ] Supabase RLS policies applied.
- [ ] `deck-files` bucket created.
- [ ] `FRONTEND_URL` matches deployed domain.
- [ ] Production API keys verified.
- [ ] SSL Cert configured (Certbot for VPS).
