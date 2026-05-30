
---

## File 2: `docs/ROADMAP.md` (Main Orchestrator)

```markdown
# EduPath Development Roadmap

## Phase 0: Project Setup (Day 1)
- [ ] Initialize monorepo (frontend + backend)
- [ ] Setup Git + .gitignore
- [ ] Environment variables structure
- [ ] Basic README

## Phase 1: Core Backend & Database (Day 1-2)
- [ ] PostgreSQL schema (users, courses, modules, lessons, enrollments, quiz_attempts)
- [ ] User roles (student, instructor, admin)
- [ ] JWT Authentication + role guards
- [ ] CRUD for Courses, Modules, Lessons

## Phase 2: Frontend Foundation (Day 2-3)
- [ ] Next.js 15 setup with TypeScript
- [ ] shadcn/ui + Tailwind + dark theme (match project design)
- [ ] Authentication pages (Login, Register)
- [ ] Protected routes (middleware)

## Phase 3: Adaptive Learning Engine (Day 3-4)
- [ ] Quiz submission logic with scoring
- [ ] Mastery calculation algorithm
- [ ] Dynamic path recommendation service

## Phase 4: AI Integration (Day 4-5)
- [ ] Embeddings + ChromaDB per course
- [ ] RAG AI Tutor with strict grounding
- [ ] AI Quiz Generator (fresh questions)

## Phase 5: Analytics & Polish (Day 5-6)
- [ ] Instructor dashboard
- [ ] Student progress visualization
- [ ] Responsive UI + animations

## Phase 6: Deployment & Submission (Day 6)
- [ ] Deploy frontend on Vercel
- [ ] Deploy backend + DB
- [ ] Record demo video
- [ ] Final testing

**Mandatory Seed Data**: 2 courses × 3 modules each with rich text lessons.