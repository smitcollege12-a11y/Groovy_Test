from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.course import Course
from app.models.user import User
from app.schemas.adaptive import AdaptivePathResponse, ModuleMastery
from app.services.adaptive_service import recommend_next_module


router = APIRouter()


@router.get("/courses/{course_id}/adaptive-path", response_model=AdaptivePathResponse)
def get_adaptive_path(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student", "admin")),
) -> AdaptivePathResponse:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    next_module_id, modules = recommend_next_module(db, current_user.id, course_id)
    return AdaptivePathResponse(
        course_id=course_id,
        next_module_id=next_module_id,
        modules=[ModuleMastery(**module) for module in modules],
    )
