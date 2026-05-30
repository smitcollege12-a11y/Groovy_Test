# AGENTS.md

## Monorepo layout

- `frontend/` — Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (base-nova style)
- `backend/` — FastAPI, SQLAlchemy 2, Alembic, PostgreSQL (psycopg driver), JWT cookie auth
- `docs/` — project documentation (mostly stubs)

## Frontend

### Running & building

```bash
cd frontend
npm install
npm run dev      # starts Next.js dev server
npm run build    # production build
npm run lint     # ESLint (next/core-web-vitals + typescript configs)
```

No dedicated typecheck script; `tsc` is implicit via `next build`.

### Key facts

- **Next.js 16 has breaking changes vs earlier versions.** Read relevant docs in `node_modules/next/dist/docs/` before modifying Next.js-specific code. See `frontend/AGENTS.md`.
- Uses App Router with route groups: `(auth)` for login/register, `(dashboard)` for student/instructor views.
- Auth middleware (`frontend/middleware.ts`) redirects unauthenticated users from `/student/*` and `/instructor/*` to `/login`.
- API calls go through `frontend/src/lib/api.ts` — uses `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`), sends credentials with every request.
- Component library: shadcn/ui. Add components via `npx shadcn add`. Config in `components.json`.
- Path alias: `@/*` maps to `src/*`.

## Backend

### Running

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows; on Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment

Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — PostgreSQL connection string (default: `postgresql+psycopg://postgres:postgres@localhost:5432/edupath`)
- `JWT_SECRET` — secret for JWT signing
- `OPENAI_API_KEY` — needed for AI tutor features
- `CHROMA_PERSIST_DIR` — vector store directory for RAG

### Key facts

- All API routes are under `/api/v1` (defined in `backend/app/api/v1/api.py`).
- Auth: JWT stored in `access_token` cookie, decoded in `backend/app/core/deps.py`. Use `get_current_user` or `require_role("student")` / `require_role("instructor")` as dependencies.
- Database session via `get_db()` dependency. Models in `backend/app/models/`, schemas in `backend/app/schemas/`.
- Alembic migrations in `backend/alembic/`. Config in `backend/alembic.ini` (note: `sqlalchemy.url` in `alembic.ini` is a placeholder — actual URL comes from env/DATABASE_URL).
- The `adaptive` endpoint (`backend/app/api/v1/endpoints/adaptive.py`) is the AI-powered adaptive learning / quiz logic.

## Gotchas

- No test suite exists yet. No CI workflows.
- Backend has no `lint` or `format` commands — follow existing code style (Black-compatible).
- Frontend linting (`npm run lint`) is the only automated check available.
- Windows paths: backend `.env` and activation scripts use Windows conventions; adjust for Unix.
- The `alembic.ini` `sqlalchemy.url` is a dummy — Alembic reads from `env.py` which uses `settings.database_url`.
