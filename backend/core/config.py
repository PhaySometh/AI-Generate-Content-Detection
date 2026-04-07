# Application configuration loaded from environment variables or .env.

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Centralized runtime settings used by API, DB, and inference layers.
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_detection"
    TEMP_DIR: str = "/tmp/ai_detector"
    MODEL_VERSION: str = "efficientnet-b0-v3"

    class Config:
        env_file = ".env"


settings = Settings()
