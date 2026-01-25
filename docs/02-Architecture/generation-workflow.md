# 🔄 Generation Workflow & Logic

This document details the complete path of a request through the MeshCards backend, from authentication to final `.apkg` conversion.

## 🗺️ System Architecture

The following diagram illustrates the relationship between the client, API gateway, and the intelligence core.

```mermaid
graph TB
    subgraph "Client Layer (React)"
        JS[Studio Interface]
        AuthC[Supabase Auth Client]
    end

    subgraph "API & Orchestration (FastAPI)"
        GW[main.py: API Gateway]
        AUTH[auth.py: JWT & Quota Guard]
        SPON[sponsor.py: Verification Service]
        JQ[job_queue.py: Async Worker Pool]
    end

    subgraph "Intelligence & Processing"
        GEN[generator.py: The Orchestrator]
        CHUNK[chunker.py: Text Shredder]
        LLM[llm.py: Multi-Engine Router]
    end

    subgraph "Storage & Export"
        ANKI[anki.py: APKG Factory]
        DISK[storage.py: Temp File system]
        DB[(Supabase PostgreSQL)]
    end

    %% Key Connections
    JS -->|1. JWT + Payload| GW
    GW -->|2. Verify| AUTH
    AUTH -->|3. Permission| SPON
    GW -->|4. Push Task| JQ
    JQ -->|5. Execute| GEN
    GEN -->|6. Select Model| LLM
    GEN -->|7. Generate Binary| ANKI
    ANKI -->|8. Save| DISK
    SPON --- DB
```

---

## 🚦 End-to-End Logic Flow

### 1. Authentication & Access Tiering
Users authenticate via Supabase. The system immediately checks their tier:
*   **Tier: User (Free)**: Restricted to 1 deck per 24 hours. Uses Standard Engines (Gemini 1.5 Flash).
*   **Tier: Verified Sponsor**: Unlocks 5 decks/day and grants access to Frontier Engines (Llama 3.3, DeepSeek) via system-provided keys.

### 2. Document Ingestion & RAG
When a document is uploaded:
1.  **Extraction**: `chunker.py` normalizes formatting and strips non-text elements.
2.  **Semantic Chunking (RAG)**: The text is sliced into overlapping semantic blocks. This ensures that when the AI is prompted, the context bridge between sections isn't lost.
3.  **Context Injection**: Only the most relevant content is served to the prompt to maintain high signal-to-noise ratios.

### 3. Model Selection & Prompting
The `llm.py` client dynamically selects the engine based on the user's tier and requested complexity:
*   **Prompt Engineering**: Our system uses Capable Prompting—specifically optimized instructions that vary based on the model's architecture (Gemini vs OpenRouter/Novita).
*   **Structuring**: The prompt explicitly handles the conversion to JSON format, which is required for the downstream builder.

### 4. Generation & Conversion
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Front as Studio UI
    participant API as FastAPI Backend
    participant AI as Intelligence Core (LLM)
    participant Factory as Anki Factory

    User->>Front: Upload Material & Select Model
    Front->>API: POST /api/generate
    
    Note over API: Quota & Sponsor Check
    
    API->>AI: chunker.py: Semantic Context Shredding
    alt isSponsor
        API->>AI: llm.py: Frontier Engine (DeepSeek/Claude)
    else isFree
        API->>AI: llm.py: Standard Engine (Gemini Flash)
    end
    AI-->>API: returns Structured JSON
    
    API->>Factory: anki.py: Binary Conversion (.apkg)
    Factory-->>API: Bundle Complete
    
    API-->>Front: Job Status: Completed
    Front->>User: 🎉 Download Ready
```

## 🏗️ Technical Registry

| Component | Responsibility |
| :--- | :--- |
| **`generator.py`** | The "General" of the backend. Orchestrates the flow. |
| **`llm.py`** | Standardized interface for multi-engine communication. |
| **`chunker.py`** | Handles RAG-style text preparation for LLM ingestion. |
| **`anki.py`** | Packages JSON data into valid SQLite-based binary decks. |
| **`auth.py`** | Manages IST-based quota reset logic and session validation. |
