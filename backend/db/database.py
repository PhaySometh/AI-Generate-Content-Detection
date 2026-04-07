# SQLAlchemy engine, session factory, and per-request DB dependency.

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.core.config import settings

# Shared DB engine used across the application.
engine = create_engine(settings.DATABASE_URL)
# Session factory used by request-scoped dependency below.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    # Yield a database session and guarantee cleanup after request handling.
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
