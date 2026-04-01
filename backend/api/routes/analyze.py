import os
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.schemas import AnalyzeURLRequest, DetectionResult
from backend.db.database import get_db
from backend.db.models import Detection
from backend.model.inference import run_inference
from backend.utils.url_fetcher import fetch_media_from_url

router = APIRouter(prefix="/analyze", tags=["analyze"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB


def _cleanup_file(path: str) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass


def _to_response(record: Detection) -> dict:
    data = DetectionResult.model_validate(record).model_dump()
    data["confidence_pct"] = f"{round(record.confidence * 100, 1)}%"
    return data


@router.post("/image", response_model=DetectionResult, status_code=201)
async def analyze_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(422, detail="Unsupported file type. Only JPEG, PNG, and WEBP are accepted.")

    contents = await file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(413, detail="File too large. Maximum upload size is 10 MB.")

    temp_dir = Path(settings.TEMP_DIR)
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_path = temp_dir / f"upload_{uuid.uuid4().hex}{ext}"
    temp_path.write_bytes(contents)
    background_tasks.add_task(_cleanup_file, str(temp_path))

    try:
        result = run_inference(str(temp_path))
    except Exception as e:
        raise HTTPException(500, detail=f"Inference failed: {e}")

    record = Detection(
        source_type="upload",
        original_filename=file.filename,
        label=result["label"],
        confidence=result["confidence"],
        explanation=result["explanation"],
        heatmap_b64=result["heatmap_b64"] or None,
        model_version=settings.MODEL_VERSION,
        processing_ms=result["processing_ms"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_response(record)


@router.post("/url", response_model=DetectionResult, status_code=201)
async def analyze_url(
    payload: AnalyzeURLRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    temp_dir = Path(settings.TEMP_DIR)
    temp_path = fetch_media_from_url(payload.url, temp_dir)
    background_tasks.add_task(_cleanup_file, str(temp_path))

    try:
        result = run_inference(str(temp_path))
    except Exception as e:
        raise HTTPException(500, detail=f"Inference failed: {e}")

    record = Detection(
        source_type="url",
        source_url=payload.url,
        label=result["label"],
        confidence=result["confidence"],
        explanation=result["explanation"],
        heatmap_b64=result["heatmap_b64"] or None,
        model_version=settings.MODEL_VERSION,
        processing_ms=result["processing_ms"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_response(record)
