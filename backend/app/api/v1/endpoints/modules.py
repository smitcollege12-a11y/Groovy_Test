from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_role
from app.models.course import Course
from app.models.module import Module
from app.models.user import User
from app.schemas.module import ModuleCreate, ModuleOut, ModuleUpdate


router = APIRouter()


@router.get("/courses/{course_id}/modules", response_model=list[ModuleOut])
def list_modules(
    course_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Module]:
    modules = db.scalars(select(Module).where(Module.course_id == course_id).order_by(Module.position)).all()
    return list(modules)


@router.post("/courses/{course_id}/modules", response_model=ModuleOut, status_code=status.HTTP_201_CREATED)
def create_module(
    course_id: UUID,
    payload: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("instructor", "admin")),
) -> Module:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role != "admin" and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not course owner")

    module = Module(
        course_id=course_id,
        title=payload.title,
        description=payload.description,
        position=payload.position,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.get("/modules/{module_id}", response_model=ModuleOut)
def get_module(
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Module:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@router.put("/modules/{module_id}", response_model=ModuleOut)
def update_module(
    module_id: UUID,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("instructor", "admin")),
) -> Module:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    course = db.get(Course, module.course_id)
    if current_user.role != "admin" and course and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not course owner")

    if payload.title is not None:
        module.title = payload.title
    if payload.description is not None:
        module.description = payload.description
    if payload.position is not None:
        module.position = payload.position

    db.commit()
    db.refresh(module)
    return module


@router.delete("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    module_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("instructor", "admin")),
) -> None:
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    course = db.get(Course, module.course_id)
    if current_user.role != "admin" and course and course.instructor_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not course owner")

    db.delete(module)
    db.commit()
    return None
