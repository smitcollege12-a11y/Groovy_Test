# Backend Setup

## Prerequisites

- Python 3.11+
- PostgreSQL 14+

## Quick Start

```bash
cd backend

# Create virtual environment
python -m venv .venv
.\.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Unix

# Install dependencies
pip install -r requirements.txt

# Set up environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials and API keys

# Create database (PostgreSQL)
psql -U postgres -c "CREATE DATABASE edupath;"

# Run migrations
alembic upgrade head

# Seed sample data
python -m app.seed

# Start development server
uvicorn app.main:app --reload
```

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edupath.com | password123 |
| Instructor | instructor@edupath.com | password123 |
| Student | student@edupath.com | password123 |

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (sets cookie)
- `POST /api/v1/auth/logout` - Logout (clears cookie)
- `GET /api/v1/auth/me` - Get current user

### Courses
- `GET /api/v1/courses/` - List all courses
- `POST /api/v1/courses/` - Create course (instructor/admin)
- `GET /api/v1/courses/{id}` - Get course
- `PUT /api/v1/courses/{id}` - Update course (owner/admin)
- `DELETE /api/v1/courses/{id}` - Delete course (owner/admin)

### Modules
- `GET /api/v1/courses/{id}/modules` - List modules
- `POST /api/v1/courses/{id}/modules` - Create module (instructor/admin)
- `GET /api/v1/modules/{id}` - Get module
- `PUT /api/v1/modules/{id}` - Update module (owner/admin)
- `DELETE /api/v1/modules/{id}` - Delete module (owner/admin)

### Lessons
- `GET /api/v1/modules/{id}/lessons` - List lessons
- `POST /api/v1/modules/{id}/lessons` - Create lesson (instructor/admin)
- `GET /api/v1/lessons/{id}` - Get lesson
- `PUT /api/v1/lessons/{id}` - Update lesson (owner/admin)
- `DELETE /api/v1/lessons/{id}` - Delete lesson (owner/admin)

### Enrollment
- `POST /api/v1/courses/{id}/enroll` - Enroll in course (student)
- `DELETE /api/v1/courses/{id}/enroll` - Unenroll (student)
- `GET /api/v1/enrollments` - List my enrollments (student)
- `GET /api/v1/courses/{id}/enrollment-status` - Check enrollment (student)

### Quizzes
- `POST /api/v1/modules/{id}/quiz-attempts` - Submit quiz (student)
- `GET /api/v1/courses/{id}/adaptive-path` - Get adaptive path (student)

### AI Tutor
- `POST /api/v1/courses/{id}/tutor/chat` - Chat with AI tutor (student)
- `POST /api/v1/courses/{id}/quiz/generate` - Generate quiz questions (student)
- `POST /api/v1/courses/{id}/ingest` - Ingest lesson content (instructor/admin)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for JWT signing | - |
| `JWT_EXPIRES_MINUTES` | JWT expiration time | 60 |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `OPENAI_API_KEY` | OpenAI API key (for AI tutor) | - |
| `CHROMA_PERSIST_DIR` | ChromaDB storage directory | ./.chroma |
