from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: str | None = None


class UserPublic(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}
