import uuid
from sqlalchemy import Column, String, Float, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    source_type = Column(String(10), nullable=False)
    source_url = Column(Text, nullable=True)
    original_filename = Column(String(255), nullable=True)
    label = Column(String(20), nullable=False)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    heatmap_b64 = Column(Text, nullable=True)
    model_version = Column(String(50), nullable=False, default="efficientnet-b0-v1")
    processing_ms = Column(Integer, nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
