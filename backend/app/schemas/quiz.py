from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class QuizAttemptCreate(BaseModel):
    raw_score: int = Field(ge=0)
    total_questions: int = Field(gt=0)


class QuizAttemptOut(BaseModel):
    id: UUID
    student_id: UUID
    module_id: UUID
    raw_score: int
    total_questions: int
    score: float
    created_at: datetime

    model_config = {"from_attributes": True}
