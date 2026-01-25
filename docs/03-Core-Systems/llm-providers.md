# 🤖 LLM Providers & Model Strategy

MeshCards leverages a multi-provider strategy to provide high-quality AI flashcards while keeping costs low and availability high.

## 🌟 Core Provider: Google Gemini

The primary engine for MeshCards. It offers a massive context window (up to 2M tokens) and excellent reasoning.

- **Standard Models**: Gemini 1.5 Pro, 1.5 Flash.
- **Experimental**: Gemini 2.0 Flash-Lite (High speed).
- **Access Strategy**:
  - **Free Tier**: 2 decks per day via shared system keys.
  - **BYOK**: Unlimited generations if the user provides their own API key.
- **Best For**: Long PDFs (>50 pages) and general-purpose flashcards.

## 💎 Premium Models (Sponsor Tier)

We offer a "Premium Model" library for sponsors. While currently powered primarily by **Novita AI**, the system is designed to be provider-agnostic.

### Popular Premium Models
| Model | Provider | Strengths |
|-------|----------|-----------|
| **Llama 3.3 70B** | Novita | **Best Overall**: High-reasoning and extremely cost-efficient. |
| **Qwen 2.5 72B** | Novita | **Textbook Specialist**: Excellent at processing dense academic text. |
| **Mistral Large 2**| Novita | **Logic & Speed**: Strong performance for complex reasoning. |
| **Llama 3.1 405B**| Novita | **Max Power**: Highest quality generation available for specific topics. |

### Why Premium?
1. **Cost Efficiency**: Some premium models are **70% cheaper** than Gemini Pro per token.
2. **Specialization**: Certain models are better at STEM (Qwen) or creative writing (Claude/Llama).
3. **Redundancy**: If Gemini is down or rate-limited, premium models provide a reliable failover.

---

## ⚙️ Model Selection Logic

### 1. Intelligence Engine Toggle
In the **Configuration** panel, users can switch between:
- **Standard**: Core Gemini models.
- **Rare Models**: High-reasoning premium models (Requires Sponsor status or BYOK).

### 2. Requesting New Models
Users can request specific models (e.g., Claude 3.5 Sonnet, GPT-4o) via the **Feedback Form**. These are evaluated based on cost-per-token and API reliability before being added to the library.

### 3. Smart Fallback
The system validates API keys before generation. If a user is not a sponsor but provides their own personal API key for a premium provider, the system allows access, effectively enabling "Bring Your Own Model" (BYOM).
