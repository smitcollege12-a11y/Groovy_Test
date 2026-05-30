from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class EnrollmentOut(BaseModel):
    id: UUID
    student_id: UUID
    course_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class EnrollmentWithCourse(BaseModel):
    id: UUID
    course_id: UUID
    created_at: datetime
    course_title: str
    course_description: str | None

    model_config = {"from_attributes": True}
