from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_role
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.enrollment import EnrollmentOut

router = APIRouter()


@router.post("/courses/{course_id}/enroll", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll_in_course(
    course_id: UUID,
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> Enrollment:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    existing = db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already enrolled")

    enrollment = Enrollment(student_id=current_user.id, course_id=course_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.delete("/courses/{course_id}/enroll", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_from_course(
    course_id: UUID,
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> None:
    enrollment = db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
    )
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not enrolled")

    db.delete(enrollment)
    db.commit()


@router.get("/enrollments", response_model=list[EnrollmentOut])
def list_my_enrollments(
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> list[Enrollment]:
    enrollments = db.scalars(
        select(Enrollment).where(Enrollment.student_id == current_user.id)
    ).all()
    return list(enrollments)


@router.get("/courses/{course_id}/enrollment-status")
def enrollment_status(
    course_id: UUID,
    current_user: User = Depends(require_role("student", "admin")),
    db: Session = Depends(get_db),
) -> dict:
    enrollment = db.scalar(
        select(Enrollment).where(
            Enrollment.student_id == current_user.id,
            Enrollment.course_id == course_id,
        )
    )
    return {"enrolled": enrollment is not None, "enrollment_id": str(enrollment.id) if enrollment else None}
