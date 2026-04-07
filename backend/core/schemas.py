# Pydantic request/response schemas used by FastAPI routes.

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


class AnalyzeURLRequest(BaseModel):
    # Request body for URL-based media analysis.
    url: str = Field(..., description="Public URL of image or video")


class DetectionResult(BaseModel):
    # Standard response payload returned by analyze/result endpoints.
    id: UUID
    label: str                      # "REAL" | "AI_GENERATED"
    confidence: float               # 0.0 – 1.0
    confidence_pct: Optional[str] = None  # "87.3%" pre-formatted
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
    # Generic error payload format for API responses.
    error: str
    detail: Optional[str] = None
