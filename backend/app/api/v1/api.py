from fastapi import APIRouter

from app.api.v1.endpoints import adaptive, auth, courses, enrollments, lessons, modules, quiz_attempts, tutor


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(enrollments.router, tags=["enrollments"])
api_router.include_router(modules.router, tags=["modules"])
api_router.include_router(lessons.router, tags=["lessons"])
api_router.include_router(quiz_attempts.router, tags=["quizzes"])
api_router.include_router(adaptive.router, tags=["adaptive"])
api_router.include_router(tutor.router, tags=["tutor"])
