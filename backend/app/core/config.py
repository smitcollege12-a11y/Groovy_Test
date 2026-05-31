from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    env: str = "development"
    database_url: str
    jwt_secret: str
    jwt_expires_minutes: int = 60
    allowed_origins: str = "http://localhost:3000"
    openai_api_key: str = ""
    chroma_persist_dir: str = "./.chroma"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def model_post_init(self, __context) -> None:
        url = self.database_url
        if url.startswith("postgresql://"):
            object.__setattr__(self, "database_url", url.replace("postgresql://", "postgresql+psycopg://", 1))


settings = Settings()
