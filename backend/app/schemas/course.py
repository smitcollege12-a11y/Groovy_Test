from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CourseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None


class CourseOut(BaseModel):
    id: UUID
    title: str
    description: str | None
    instructor_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
