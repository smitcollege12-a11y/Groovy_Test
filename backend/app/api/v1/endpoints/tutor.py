from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_role
from app.models.course import Course
from app.models.user import User
from app.services.ai_service import generate_tutor_response, generate_quiz_questions

router = APIRouter()


class TutorChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    chat_history: list[dict] | None = None


class TutorChatResponse(BaseModel):
    response: str


class QuizGenerateRequest(BaseModel):
    lesson_id: UUID
    lesson_title: str
    lesson_content: str
    num_questions: int = Field(default=5, ge=3, le=10)


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correctIndex: int


class QuizGenerateResponse(BaseModel):
    questions: list[QuizQuestion]


class IngestRequest(BaseModel):
    lesson_id: UUID
    module_id: UUID
    title: str
    content: str


@router.post("/courses/{course_id}/tutor/chat", response_model=TutorChatResponse)
def tutor_chat(
    course_id: UUID,
    payload: TutorChatRequest,
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> TutorChatResponse:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    response = generate_tutor_response(
        query=payload.message,
        course_id=course_id,
        course_title=course.title,
        chat_history=payload.chat_history,
    )
    return TutorChatResponse(response=response)


@router.post("/courses/{course_id}/quiz/generate", response_model=QuizGenerateResponse)
def generate_quiz(
    course_id: UUID,
    payload: QuizGenerateRequest,
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> QuizGenerateResponse:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    questions = generate_quiz_questions(
        lesson_content=payload.lesson_content,
        lesson_title=payload.lesson_title,
        num_questions=payload.num_questions,
    )

    validated_questions = []
    for q in questions:
        validated_questions.append(QuizQuestion(
            question=q.get("question", ""),
            options=q.get("options", ["A", "B", "C", "D"]),
            correctIndex=q.get("correctIndex", 0),
        ))

    return QuizGenerateResponse(questions=validated_questions)


@router.post("/courses/{course_id}/ingest", status_code=status.HTTP_201_CREATED)
def ingest_lesson(
    course_id: UUID,
    payload: IngestRequest,
    current_user: User = Depends(require_role("instructor", "admin")),
    db: Session = Depends(get_db),
) -> dict:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    from app.services.ai_service import ingest_lesson_content
    ingest_lesson_content(
        course_id=course_id,
        module_id=payload.module_id,
        lesson_id=payload.lesson_id,
        title=payload.title,
        content=payload.content,
    )
    return {"status": "ingested", "lesson_id": str(payload.lesson_id)}
