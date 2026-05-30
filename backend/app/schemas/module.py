from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ModuleCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    position: int = 0


class ModuleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    position: int | None = None


class ModuleOut(BaseModel):
    id: UUID
    course_id: UUID
    title: str
    description: str | None
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}
