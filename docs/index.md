# MeshCards Documentation

Welcome to the official documentation for **MeshCards** - An intelligent, AI-powered flashcard generation platform.

This documentation is organized into the following sections:

## 📚 01. Overview
High-level project information, goals, and capabilities.
- [**Purpose**](01-Overview/purpose.md): Why MeshCards exists.
- [**Problem Statement**](01-Overview/problem_statement.md): The specific educational gaps we solve.
- [**Feature Capabilities**](01-Overview/feature_capabilities.md): What the platform can do right now.
- [**Impact**](01-Overview/impact.md): Value proposition for students.
- [**Methodology**](01-Overview/method.md): How we approach generation.
- [**Roadmap**](01-Overview/roadmap.md): Future plans and direction.

## 🏗️ 02. Architecture
Technical design and infrastructure.
- [**System Architecture**](02-Architecture/architecture.md): Overall block diagram and flow.
- [**Job Queue System**](02-Architecture/job-queue-system.md): Asynchronous processing design.
- [**Active Queue Logic**](02-Architecture/queue-system-active.md): How we handle load.
- [**Wireframes**](02-Architecture/wireframes.md): Initial UI concepts.

## ⚙️ 03. Core Systems
Deep dives into specific technical implementations.
- [**Token Limit Solutions**](03-Core-Systems/token-limit-solutions.md): Handling large documents via chunking.
- [**Cost Optimization**](03-Core-Systems/cost-optimization-implemented.md): Strategies used to reduce AI costs.
- [**Vision API Integration**](03-Core-Systems/vision-api-integration.md): How we process images.
- [**Error Reporting**](03-Core-Systems/automatic-error-reporting.md): Automated monitoring systems.
- [**User Education**](03-Core-Systems/user-education-transparency.md): How we inform users about limits.
- [**Feedback System**](03-Core-Systems/feedback-system-summary.md): Collecting user insights.
- [**GitHub Feedback Setup**](03-Core-Systems/github-feedback-setup.md): Integration details.

## 🔐 04. Auth & Quota
Security policies and usage limits.
- [**Quota Enforcement**](04-Auth-Quota/auth-quota-enforcement.md): Login-based limits.
- [**API Quota Management**](04-Auth-Quota/api-quota-management.md): Technical implementation.
- [**Quota System (IST)**](04-Auth-Quota/quota-system-ist.md): Timezone-specific resets.
- [**API Limit Protection**](04-Auth-Quota/api-limit-protection.md): Rate limiting.
- [Supabase RLS Policies](04-Auth-Quota/supabase-rls-policies.sql) (SQL File)

## 🚀 05. Deployment
Guides for deploying the stack.
- [**Vercel Deployment**](05-Deployment/vercel-deployment.md): Frontend hosting.
- [**Leapcell Deployment**](05-Deployment/leapcell-deployment.md): Backend hosting.
- [**Supabase Storage**](05-Deployment/supabase-storage-setup.md): Configuring buckets.
- [**Maintenance Mode**](05-Deployment/maintenance-mode-guide.md): Turning the system off/on.

## 🛠️ 06. Guides & Debugging
Internal developer guides.
- [**Debugging Generation Errors**](06-Guides-Debugging/debug-generate-error.md)
- [**Fixing Local Sign-in**](06-Guides-Debugging/fix-local-signin.md)
- [**Testing Quotas Locally**](06-Guides-Debugging/testing-quota-locally.md)
- [**Testing Chunking**](06-Guides-Debugging/testing-chunking-locally.md)
