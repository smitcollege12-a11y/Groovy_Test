# AI Implementation Guide

## 1. RAG AI Tutor

**System Prompt**:
"You are an AI tutor for [Course Name]. Answer ONLY using the provided context. If the question is out of scope, politely redirect to course topics."

## 2. Quiz Generator

**Prompt Strategy**:
- Generate 5-8 questions (mix of MCQ, True/False, short answer)
- Vary questions each time using temperature + different seeds
- Include correct answers for auto-grading

## 3. Adaptive Engine

**Mastery Calculation**:
- Average score of last 3 attempts > 85% → Mastered
- 60-85% → Needs Review
- <60% → Remedial

**Path Adjustment**:
- Skip mastered modules
- Insert remedial lessons/quizzes for weak areas