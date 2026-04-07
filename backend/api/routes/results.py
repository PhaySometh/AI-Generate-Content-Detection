from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.schemas import DetectionResult
from backend.db.database import get_db
from backend.db.models import Detection

router = APIRouter(prefix="/result", tags=["results"])

# Fetch a stored detection result by UUID.
@router.get("/{result_id}", response_model=DetectionResult)
def get_result(result_id: UUID, db: Session = Depends(get_db)):
    # UUID lookup ensures users can fetch the exact stored analysis output.
    record = db.query(Detection).filter(Detection.id == result_id).first()
    if not record:
        raise HTTPException(404, detail=f"No result found with id {result_id}")

    # Keep response schema consistent with analyze endpoints.
    data = DetectionResult.model_validate(record).model_dump()
    data["confidence_pct"] = f"{round(record.confidence * 100, 1)}%"
    return data
