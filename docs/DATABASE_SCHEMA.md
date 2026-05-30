# Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT CHECK (role IN ('student', 'instructor', 'admin')),
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title TEXT,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add tables for modules, lessons, enrollments, quiz_attempts...