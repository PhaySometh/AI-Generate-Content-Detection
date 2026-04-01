from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class AnalyzeURLRequest(BaseModel):
    url: str = Field(..., description="Public URL of image or video")


class DetectionResult(BaseModel):
    id: UUID
    label: str                      # "REAL" | "AI_GENERATED"
    confidence: float               # 0.0 – 1.0
    confidence_pct: str             # "87.3%" pre-formatted
    explanation: str
    heatmap_b64: Optional[str]      # base64 PNG; None if generation failed
    source_type: str                # "upload" | "url"
    source_url: Optional[str]
    original_filename: Optional[str]
    model_version: str
    processing_ms: int
    created_at: datetime

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
