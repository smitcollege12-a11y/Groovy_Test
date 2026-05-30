from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LessonCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    content: str = Field(min_length=10)
    position: int = 0


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    content: str | None = Field(default=None, min_length=10)
    position: int | None = None


class LessonOut(BaseModel):
    id: UUID
    module_id: UUID
    title: str
    content: str
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}
