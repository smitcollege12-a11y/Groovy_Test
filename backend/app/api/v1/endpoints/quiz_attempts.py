from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.module import Module
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User
from app.schemas.quiz import QuizAttemptCreate, QuizAttemptOut


router = APIRouter()


@router.post("/modules/{module_id}/quiz-attempts", response_model=QuizAttemptOut, status_code=status.HTTP_201_CREATED)
def create_quiz_attempt(
    module_id: UUID,
    payload: QuizAttemptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student", "admin")),
) -> QuizAttempt:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    if payload.raw_score > payload.total_questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Raw score exceeds total questions")

    score = round((payload.raw_score / payload.total_questions) * 100, 2)

    attempt = QuizAttempt(
        student_id=current_user.id,
        module_id=module_id,
        raw_score=payload.raw_score,
        total_questions=payload.total_questions,
        score=score,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt
