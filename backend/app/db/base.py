from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models import course, enrollment, lesson, module, quiz_attempt, user  # noqa: E402,F401
