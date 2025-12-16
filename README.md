# MeshCards 🎴
> **Turn your chaotic notes into structured knowledge instantly.**

![MeshCards Banner](assets/banner-meshcards.svg)

## 💡 Inspiration
We've all been there: drowning in PDFs, lecture notes, and documentation, knowing we need to study but dreading the hours it takes to make flashcards. We wanted to build a bridge between **passive reading** and **active recall**. MeshCards was born from the desire to make spaced repetition accessible to everyone, instantly.

## 🚀 What it does
MeshCards is an AI-powered Studio that converts any text or PDF into ready-to-use Anki decks (`.apkg`).

- **✨ MeshCards Studio**: A premium, glassmorphism web interface for creating decks.
- **🧠 Multi-Model Support**: Choose between **Gemini**, **OpenAI**, or local **Ollama** models.
- **📄 PDF & Text Support**: Drag & drop lecture slides or paste raw notes.
- **🎨 Visual Learning**: (Optional) Auto-generate AI illustrations for your cards.
- **⚡ Production Ready**: 
    - **Zero-Cost Scaling**: Runs efficiently on free-tier hosting.
    - **Dockerized**: Deploy anywhere with a single command.
    - **Rate Limiting**: Built-in safeguards for public demos.

## 🛠️ How we built it
- **Frontend**: **Vanilla JS + CSS Variables** for a lightweight "Studio" feel. No frameworks, just speed.
- **Backend**: **FastAPI** with `BackgroundTasks` for async deck generation.
- **Infrastructure**: Docker multi-stage build + internal queueing (no Redis required).

## 💻 Installation & Usage

### Prerequisites
- Python 3.11+ OR Docker
- API Key (Gemini or OpenAI)

### Quick Start
1. **Clone the repo**
   ```bash
   git clone https://github.com/pranavsinghpatil/MeshCards.git
   cd MeshCards
   ```

2. **Setup Environment**
   ```bash
   # Windows (Automated)
   setup_and_test.bat
   
   # Manual
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure API Key**
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the App**
   ```bash
   # Windows
   launch.bat
   
   # Manual
   uvicorn src.api.index:app --reload
   ```
   Visit `http://localhost:8080` to start generating!

## 🧠 Challenges we ran into
- **Prompt Engineering**: Getting the LLM to consistently output valid JSON for complex card types (like Cloze deletions) was tricky. We implemented a robust validation loop to ensure 100% success rate.
- **Image Integration**: Embedding generated images into the Anki package structure required careful handling of temporary file paths and media references.

## 🏅 Accomplishments that we're proud of
- Building a **full-stack application** from CLI to Web UI in a short timeframe.
- The **"Paste Text"** feature which allows for instant study sessions from clipboard content.
- The **Premium UI** that feels like a native app.

## ⏭️ What's next for MeshCards
- **YouTube Summary**: Generate cards directly from YouTube video transcripts.
- **MeshMemory**: A custom spaced-repetition algorithm to replace Anki dependency.
- **Mobile App**: A React Native companion app for studying on the go.

---
*Built with ❤️ for the Liquid Metal Hackathon.*