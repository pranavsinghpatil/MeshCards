# MeshCards Documentation

Welcome to the official documentation for **MeshCards** - An intelligent, AI-powered flashcard generation platform designed to bridge the gap between note-taking and long-term mastery.

---

## 📚 01. Overview
High-level project information, goals, and user guides.
- [**Mission & Purpose**](01-Overview/mission.md): The problem we solve and our core philosophy.
- [**Feature Capabilities**](01-Overview/feature_capabilities.md): Deep dive into the platform's features.
- [**Quick Start User Guide**](01-Overview/user-guide.md): How to use MeshCards effectively.
- [**Sponsorship & Support**](01-Overview/sponsorship.md): How our project remains sustainable.
- [**Product Roadmap**](01-Overview/roadmap.md): Future plans and upcoming features.

## 🏗️ 02. Architecture
Technical design, data flow, and system infrastructure.
- [**System Architecture**](02-Architecture/system-architecture.md): Overall block diagram and core modules.
- [**Generation Workflow**](02-Architecture/generation-workflow.md): Detailed end-to-end logic from login to .apkg.

## ⚙️ 03. Core Systems
Deep dives into the technical implementation of our unique engines.
- [**LLM Providers**](03-Core-Systems/llm-providers.md): How we use Gemini and Llama (Novita).
- [**Document Processing**](03-Core-Systems/document-processing.md): Semantic extraction and chunking strategies.
- [**Monitoring & Transparency**](03-Core-Systems/monitoring-transparency.md): Error reporting and user education.
- [**Feedback Loop**](03-Core-Systems/feedback-loop.md): GitHub integration for user insights.

## 🔐 04. Auth & Quotas
Security policies, access control, and usage limits.
- [**Auth & Quota Design**](04-Auth-Quota/system-design.md): IST resets, strictly enforced limits, and BYOK.
- [**Supabase RLS Policies**](04-Auth-Quota/supabase-rls-policies.sql): Database security configuration.

## 🚀 05. Deployment
Step-by-step guides for production environments.
- [**Production Guide**](05-Deployment/production-guide.md): Deploying to Vercel, Leapcell, and Supabase.

## 🛠️ 06. Guides & Debugging
Developer-focused resources for maintaining the stack.
- [**Developer & Debugging Guide**](06-Guides-Debugging/developer-guide.md): Local setup, common fixes, and testing.
