# 🏗️ System Architecture

MeshCards is built as a modular, asynchronous system designed for scalability and high-quality educational output.

## 🧱 Core Layers

### 1. Input & Processing Layer
- **`backend/core/chunker.py`**: Handles text extraction, semantic reduction, and logical chunking for large documents.
- **`backend/core/anki.py`**: Converts raw JSON data into a valid `.apkg` file using `genanki`.
- **`backend/core/storage.py`**: Orchestrates file storage between local `decks/` (Dev) and Supabase Storage (Prod).

### 2. Intelligent Generation Layer
- **`backend/core/llm.py`**: A provider-agnostic client that handles communication with Google Gemini and Novita AI (Sponsor models).
- **`backend/core/prompts.py`**: Contains the complex system instructions used to ensure the LLM returns structured, valid JSON.

### 3. Orchestration & Safety Layer
- **`backend/core/job_queue.py`**: The sequential engine that ensures only one deck is generated at a time globally to prevent API rate-limit exhaustion.
- **`backend/core/auth.py`**: Manages user sessions (Supabase) and enforces strictly-timed Daily Quotas (IST timezone).

## 🔄 Job Queue & Sequential Processing

MeshCards uses an asynchronous job queue to handle high-volume generation requests while respecting AI provider rate limits.

### 1. The RPM Problem
Google Gemini and Novita AI have strict **Requests Per Minute** limits. Simultaneous requests from multiple users would cause `429 ResourceExhausted` errors.

### 2. How the Queue Works
- **Lifecycle**: Submit → `queued` (Position X of Y) → `processing` → `completed`.
- **Global Lock**: The backend processes exactly **one job at a time** globally.
- **Delay Buffer**: A mandatory **6-second delay** is enforced between jobs to ensure the API rate window resets.
- **Fail-Safe**: If a job fails, the next person in line proceeds immediately after a log entry is created.

---

## 🧭 The Generation Flow

1. **Submission**: User uploads a file. The backend validates the user's session and daily quota.
2. **Queuing**: The request is assigned a `job_id` and enters the `JobQueue`.
3. **Processing**:
   - The system extracts text and runs **Semantic Extraction** to reduce tokens.
   - The LLM generates the flashcards.
   - The `AnkiBuilder` packages them into an `.apkg`.
4. **Storage**: The file is stored in Supabase, and a download URL is generated.
5. **Completion**: The frontend poller detects the `completed` status and triggers a browser download.

---

## 🗺️ Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion (Animations), Shadcn/UI.
- **Backend**: FastAPI (Python 3.10+), AsyncIO, Uvicorn.
- **Database**: Supabase (PostgreSQL) + Row Level Security (RLS).
- **AI**: Gemini 1.5/2.0, Llama 3.3, Qwen 2.5 (via Novita).
