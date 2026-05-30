from uuid import UUID

from pydantic import BaseModel


class ModuleMastery(BaseModel):
    module_id: UUID
    status: str
    average_score: float | None


class AdaptivePathResponse(BaseModel):
    course_id: UUID
    next_module_id: UUID | None
    modules: list[ModuleMastery]
