from collections.abc import Iterable
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.module import Module
from app.models.quiz_attempt import QuizAttempt


def _average(scores: Iterable[float]) -> float:
    values = list(scores)
    return sum(values) / len(values) if values else 0.0


def get_module_mastery(db: Session, student_id: UUID, module_id: UUID) -> tuple[str, float | None]:
    attempts = db.scalars(
        select(QuizAttempt)
        .where(QuizAttempt.student_id == student_id, QuizAttempt.module_id == module_id)
        .order_by(QuizAttempt.created_at.desc())
        .limit(3)
    ).all()

    if not attempts:
        return "unattempted", None

    avg_score = _average(attempt.score for attempt in attempts)
    if avg_score > 85:
        return "mastered", avg_score
    if avg_score >= 60:
        return "needs_review", avg_score
    return "remedial", avg_score


def recommend_next_module(db: Session, student_id: UUID, course_id: UUID) -> tuple[UUID | None, list[dict]]:
    modules = db.scalars(
        select(Module).where(Module.course_id == course_id).order_by(Module.position)
    ).all()

    recommendations: list[dict] = []
    next_module_id: UUID | None = None

    for module in modules:
        status, avg_score = get_module_mastery(db, student_id, module.id)
        recommendations.append({
            "module_id": module.id,
            "status": status,
            "average_score": avg_score,
        })
        if next_module_id is None and status != "mastered":
            next_module_id = module.id

    return next_module_id, recommendations
