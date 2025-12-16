# 🚀 MeshCards Production Deployment Guide

## Prerequisites
- **Zero Cost**: Can run on any free tier (Render, Railway, Fly.io) or a cheap VPS (Hetzner, DigitalOcean).
- **Environment**: Requires Python 3.11+ or Docker.

## Configuration (.env)
Create a `.env` file in the root directory:
```env
# Application Settings
APP_NAME=MeshCards
ENV=production  # "development" enables Ollama, "production" hides it
DEBUG=False

# API Keys (System Level - Optional)
# If set, free users share this quota. If unset, users MUST provide their own key.
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_FREE="5/hour"
```

## Deployment Options

### Option 1: Docker (Recommended)
This is the easiest way to ensure consistency.
1. **Build the image**:
   ```bash
   docker build -t meshcards .
   ```
2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 --env-file .env meshcards
   ```

### Option 2: Manual (VPS/Server)
1. **Clone & Setup**:
   ```bash
   git clone https://github.com/your-repo/MeshCards.git
   cd MeshCards
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```
2. **Run Server**:
   ```bash
   # Using Gunicorn (Linux/Mac)
   pip install gunicorn
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.api.server:app --bind 0.0.0.0:8000
   
   # Using Uvicorn (Windows)
   python -m uvicorn src.api.index:app --host 0.0.0.0 --port 8000
   ```

## Scaling Strategy (Zero Cost)
- **Queue**: Uses in-memory `BackgroundTasks`. If the server restarts, pending jobs are lost (acceptable for free tier).
- **Rate Limit**: Tracks IP addresses in-memory. Restarting server resets limits.
- **File Storage**: Uses temporary directory `/tmp`. Files are auto-deleted after download.

### Option 3: Vercel (Free & Easy)
Vercel is great for this because it supports Python serverless functions and static files.

1. **Install Vercel CLI** (or connect GitHub):
   ```bash
   npm i -g vercel
   ```
2. **Deploy**:
   ```bash
   vercel
   ```
3. **Environment Variables**:
   Go to your Vercel Project Settings > Environment Variables and add:
   - `GEMINI_API_KEY`
   - `ENV=production`

**Note**: Vercel has a 10-second timeout on free tier. Large PDFs might time out. If so, recommend user to use the CLI or deploy on Render/Railway.
