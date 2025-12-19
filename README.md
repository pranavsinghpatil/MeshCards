# MeshCards 🎴
> **Turn your chaotic notes into structured knowledge instantly.**

![MeshCards Banner](assets/banner-meshcards.svg)

## 💡 Inspiration
We've all been there: drowning in PDFs, lecture notes, and documentation, knowing we need to study but dreading the hours it takes to make flashcards. We wanted to build a bridge between **passive reading** and **active recall**. MeshCards was born from the desire to make spaced repetition accessible to everyone, instantly.

## 🚀 What it does
MeshCards is an AI-powered Flashcard Studio that converts any text or PDF into ready-to-use Anki decks (`.apkg`).

- **✨ MeshCards Studio**: A modern **React + Vite** application with a premium glassmorphism design.
- **🧠 Multi-Model Support**: Supports **Gemini 2.5 Pro**, **Gemini 2.5 Flash**, and compatibility modes for **GPT-4.1** & **Claude Opus 4.5**.
- **📄 PDF & Text Support**: Drag & drop lecture slides or paste raw notes.
- **⚡ Smart Error Handling**: Automated error logging to GitHub Issues with simplified user-facing alerts.
- **Feedback Loop**: Integrated feedback system directly connected to development workflows.
- **Production Ready**: 
    - **Frontend**: Deployed on Vercel.
    - **Backend**: FastAPI on Python-capable hosting.
    - **Auth**: Supabase integration for user management and quotas.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), SlowAPI (Rate Limiting).
- **AI**: Google Gemini API (Primary), OpenAI/Anthropic (Compatible Clients).
- **Infrastructure**: Docker for containerization.

## 💻 Installation & Usage

### Prerequisites
- Python 3.11+
- Node.js 18+
- API Key (Gemini)

### Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/pranavsinghpatil/MeshCards.git
   cd MeshCards
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Create .env
   cp .env.example .env
   # Edit .env with your GEMINI_API_KEY
   
   # Run Server
   python main.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Run Dev Server
   npm run dev
   ```
   Visit `http://localhost:8080` (or the port shown in terminal).

## 🔧 Configuration
Create a `.env` file in the root/backend directory:

```env
# AI Keys
GEMINI_API_KEY=your_key_here

# GitHub Integration (Optional - for logging errors/feedback)
GITHUB_TOKEN=your_pat_token
GITHUB_REPO=username/repo

# Supabase (Optional - for auth)
SUPABASE_URL=your_db_url
SUPABASE_KEY=your_anon_key
```

## 🧠 Features & Challenges
- **Robust Error Logging**: We implemented a system that catches backend crashes, logs the full traceback to a private GitHub Issue, and presents a friendly error code to the user.
- **Model Fallbacks**: The system intelligently maps requested models (like "GPT-4.1") to available high-performance models (Gemini 2.5 Pro) to ensure service continuity without user configuration.
- **Prompt Engineering**: Ensuring consistent JSON output for complex flashcards (Cloze, Q&A) required extensive tuning of the system prompts.

## ⏭️ Roadmap
- **YouTube Summary**: Generate cards directly from Video transcripts.
- **MeshMemory**: A custom spaced-repetition algorithm to replace Anki dependency.
- **Mobile App**: A React Native companion app.

---
*Built with ❤️ for the Liquid Metal Hackathon.*