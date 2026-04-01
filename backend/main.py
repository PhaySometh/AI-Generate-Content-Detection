from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import analyze, results
from backend.core.config import settings
from backend.db.database import Base, engine

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

# Ensure temp directory exists
Path(settings.TEMP_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="AI Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)
app.include_router(results.router)


@app.get("/health")
def health():
    return {"status": "ok"}
