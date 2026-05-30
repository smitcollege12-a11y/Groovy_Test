# EduPath — Adaptive Learning Platform with AI Tutor

**Project 29 | Groovy Web CHARUSAT 2026**

An intelligent online learning platform that uses AI to create personalized learning paths and provides a RAG-powered AI tutor grounded in course material.

## ✨ Key Features

- **Course & Content Management** (Admin/Instructor)
- **Student Dashboard** with progress tracking
- **Adaptive Learning Engine** — dynamically adjusts path based on quiz performance
- **AI Tutor Chatbot** (RAG + per-course vector store)
- **Smart Quiz Engine** — generates fresh questions on every attempt
- **Instructor Analytics Dashboard**

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: PostgreSQL + Prisma (optional) or SQLAlchemy
- **Vector DB**: ChromaDB
- **AI**: OpenAI (GPT-4o + embeddings) + LangChain
- **Auth**: JWT + HTTPOnly cookies
- **Deployment**: Vercel (Frontend) + Render/Railway (Backend + DB)

## Quick Start

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload