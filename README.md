# 🎴 MeshCards

> **AI-Powered Flashcard Generator** - Transform any content into Anki-ready flashcards instantly

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

<div align="center">
  <img src="frontend/public/logo.png" alt="MeshCards Logo" width="200"/>
  
  **[Live Demo](https://meshcards.vercel.app)** • **[Documentation](docs/)** • **[Report Bug](https://github.com/pranavsinghpatil/MeshCards/issues)** • **[Request Feature](https://github.com/pranavsinghpatil/MeshCards/issues)**
</div>

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Multiple AI Models**: Gemini 2.0 Flash, Gemini 1.5 Pro, OpenAI GPT-4
- **Smart Extraction**: Automatically identifies key concepts and creates Q&A pairs
- **LaTeX Support**: Perfect for math, science, and technical subjects
- **Multimodal**: Generate flashcards from text, PDFs, and images

### 📚 Content Sources
- 📝 **Text Input**: Paste notes, articles, or study materials
- 📄 **PDF Upload**: Extract content from textbooks and papers
- 🖼️ **Image Upload**: Generate from diagrams, charts, and screenshots
- 📖 **Multiple Files**: Combine multiple sources in one deck

### 🎨 Customization
- **Difficulty Levels**: Beginner, Intermediate, Advanced
- **Card Styles**: Q&A, Cloze Deletion, Mixed
- **Deck Size**: 10-100 cards per generation
- **Custom Instructions**: Fine-tune generation with specific requirements

### 🔒 User Features
- **Authentication**: Secure sign-in with Supabase
- **Daily Quota**: 2 free decks per day (resets at 12 AM IST)
- **Usage Tracking**: Monitor your daily generation count
- **Instant Download**: Get `.apkg` files ready for Anki

### 🛡️ Security & Limits
- **4-Layer Protection**: Frontend validation, authentication, quota system, rate limiting
- **Privacy First**: No data stored, instant generation and download
- **API Protection**: Automatic error reporting and abuse prevention
- **IST Timezone**: Fair quota reset for all users

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account (for auth & quotas)
- Gemini API key (or OpenAI/Anthropic)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranavsinghpatil/MeshCards.git
   cd MeshCards
   ```

2. **Backend Setup**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Configure environment
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Configure environment
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend
   uvicorn backend.main:app --reload --port 8000

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:5173
   ```

---

## 📖 Usage

### Basic Workflow

1. **Sign In** - Authenticate with Google/Email
2. **Input Content** - Paste text or upload files
3. **Configure** - Choose model, difficulty, and style
4. **Generate** - AI creates flashcards in seconds
5. **Download** - Get `.apkg` file for Anki
6. **Import** - Open in Anki and start studying!

### Example: Generate from Text

```
Input: "Photosynthesis is the process by which plants convert light energy into chemical energy..."

Output: 
Q: What is photosynthesis?
A: The process by which plants convert light energy into chemical energy

Q: What are the main inputs of photosynthesis?
A: Light energy, water, and carbon dioxide

Q: What are the products of photosynthesis?
A: Glucose and oxygen
```

### Example: Generate from Image

Upload a diagram → AI analyzes visual content → Creates flashcards about the diagram

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- FastAPI (Python web framework)
- Supabase (Authentication & database)
- Google Gemini AI (Primary LLM)
- Genanki (Anki deck generation)
- SlowAPI (Rate limiting)

**Frontend:**
- React 18 + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- Shadcn/ui (Components)
- React Router (Navigation)

**Deployment:**
- Backend: Leapcell
- Frontend: Vercel
- Database: Supabase

### Project Structure

```
MeshCards/
├── backend/
│   ├── core/
│   │   ├── llm.py              # LLM client management
│   │   ├── generator.py        # Flashcard generation logic
│   │   ├── anki.py             # Anki deck builder
│   │   ├── auth.py             # Authentication & quota
│   │   ├── error_reporter.py  # Automatic error reporting
│   │   └── storage.py          # File storage management
│   └── main.py                 # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilities
│   └── public/                 # Static assets
├── docs/                       # Documentation
└── decks/                      # Generated decks (local dev)
```

---

## 🔧 Configuration

### Environment Variables

**Backend (`.env`):**
```env
# Environment
ENV=development  # or production

# AI Providers
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key  # Optional

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Rate Limiting
RATE_LIMIT_FREE=2/hour

# GitHub Integration (Optional)
GITHUB_TOKEN=ghp_your_token
GITHUB_REPO=username/repository
```

**Frontend (`.env`):**
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Maintenance Mode
VITE_MAINTENANCE_MODE=false
```

---

## 📊 Features in Detail

### Quota System
- **Limit**: 2 decks per user per day
- **Reset**: 12:00 AM IST (India Standard Time)
- **Tracking**: Stored in Supabase profiles table
- **Enforcement**: Strict in production, lenient in development

### Rate Limiting
- **Limit**: 2 requests per hour per IP address
- **Purpose**: Prevent abuse and bot attacks
- **Independent**: Works even without authentication
- **Bypass**: Difficult (requires IP change)

### Error Reporting
- **Automatic**: Creates GitHub issues for backend errors
- **Privacy**: Sanitizes API keys and sensitive data
- **Context**: Includes stack trace, user ID (anonymized), and request data
- **Labels**: Auto-categorized (bug, llm, quota, auth)

### Feedback System
- **File Upload**: Attach screenshots and files
- **GitHub Issues**: Automatically creates issues
- **Categories**: Bug, Feature Request, Praise, Other
- **Rating**: 1-5 star rating system

---

## 🚢 Deployment

### Backend (Leapcell)

1. **Create Project** on Leapcell
2. **Connect Repository**
3. **Set Environment Variables**
4. **Configure Build**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
5. **Deploy**

[Full Guide](docs/leapcell-deployment.md)

### Frontend (Vercel)

1. **Import Project** on Vercel
2. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend`
3. **Set Environment Variables**:
   - `VITE_API_URL=https://your-backend.leapcell.app`
4. **Deploy**

[Full Guide](docs/vercel-deployment.md)

### Supabase Setup

1. **Create Project** on Supabase
2. **Create `profiles` table**:
   ```sql
   CREATE TABLE profiles (
       id UUID PRIMARY KEY,
       daily_count INTEGER DEFAULT 0,
       last_reset DATE NOT NULL,
       created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. **Enable RLS Policies** ([Guide](docs/supabase-rls-policies.sql))
4. **Get API Keys** from Project Settings

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 Documentation

- [API Limit Protection](docs/api-limit-protection.md)
- [Authentication & Quota](docs/auth-quota-enforcement.md)
- [Automatic Error Reporting](docs/automatic-error-reporting.md)
- [Feedback System](docs/feedback-system-summary.md)
- [GitHub Integration](docs/github-feedback-setup.md)
- [IST Quota System](docs/quota-system-ist.md)
- [Maintenance Mode](docs/maintenance-mode-guide.md)
- [Leapcell Deployment](docs/leapcell-deployment.md)
- [Vercel Deployment](docs/vercel-deployment.md)
- [Vision API Integration](docs/vision-api-integration.md)

---

## 🐛 Known Issues

- LaTeX rendering may fail for complex equations (use `$$` delimiters)
- Large PDFs (>10MB) may timeout
- Image generation requires specific model selection

See [Issues](https://github.com/pranavsinghpatil/MeshCards/issues) for full list.

---

## 🗺️ Roadmap

### Short Term
- [ ] Add more AI models (Claude, Llama)
- [ ] Implement deck preview before download
- [ ] Add deck history and management
- [ ] Support for more file formats (DOCX, PPTX)

### Medium Term
- [ ] Premium tier with higher quotas
- [ ] Collaborative deck creation
- [ ] Deck sharing and marketplace
- [ ] Mobile app (React Native)

### Long Term
- [ ] Spaced repetition algorithm integration
- [ ] Study analytics and insights
- [ ] Community features
- [ ] Offline mode

---

## 💖 Support

If you find MeshCards helpful, consider supporting the project:

- ⭐ **Star this repository**
- ☕ **[Buy me a coffee](https://www.buymeacoffee.com/htclodkzgo)**
- 🐛 **Report bugs** and suggest features
- 📢 **Share** with fellow students

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - For powerful AI capabilities
- **Anki** - For the amazing spaced repetition system
- **Supabase** - For authentication and database
- **FastAPI** - For the excellent Python framework
- **React** - For the frontend framework
- **All Contributors** - For making this project better

---

## 📧 Contact

**Pranav Singh Patil**
- Email: talktopranav@cc.cc
- GitHub: [@pranavsinghpatil](https://github.com/pranavsinghpatil)
- Project: [MeshCards](https://github.com/pranavsinghpatil/MeshCards)

---

## 📈 Stats

- **Daily Active Users**: Growing!
- **Decks Generated**: Thousands
- **Success Rate**: 95%+
- **Average Generation Time**: 10-15 seconds

---

<div align="center">
  
  **Made with ❤️ for students worldwide**
  
  [⬆ Back to Top](#-meshcards)
  
</div>