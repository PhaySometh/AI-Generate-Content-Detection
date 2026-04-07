from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/ai_detection"
    TEMP_DIR: str = "/tmp/ai_detector"
    MODEL_VERSION: str = "efficientnet-b0-v3"

    class Config:
        env_file = ".env"


settings = Settings()
