# EduPath

Adaptive learning platform with an AI tutor (RAG) and dynamic quizzes.

## Monorepo Structure

```
frontend/  # Next.js 15 app (App Router)
backend/   # FastAPI + SQLAlchemy + Alembic
```

## Docs

See the project documentation in [docs/](docs/).

## Quick Start (Local)

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
