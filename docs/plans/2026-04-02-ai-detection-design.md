# AI Content Generation Detection - Implementation Report

Date: 2026-04-04  
Project: CADT Year 3 Term 2 - Data Science Final Project  
Version: v1 (image detection and URL-based media frame detection)

---

## 1. Project Overview

This project delivers an end-to-end web system that predicts whether an image is AI-generated or real.  
The implementation combines a trained computer vision model, explainability visualization, REST APIs, persistent result storage, and a frontend interface for user interaction.

Unlike a concept-only design, this report focuses on the actual implementation decisions, code-level pipeline, runtime behavior, and operational constraints of the current system.

---

## 2. Problem Statement

AI-generated images are now widespread and visually convincing. Manual verification is slow, subjective, and difficult to scale. This project provides an automated detection workflow that:

1. Accepts image input from upload or URL.
2. Runs standardized preprocessing and model inference.
3. Produces classification output with confidence.
4. Generates a Grad-CAM explanation heatmap.
5. Stores results in a database for retrieval and audit.

---

## 3. Objectives and Success Criteria

### Primary Objective

Build a reliable AI-image detection system that supports full inference flow from user input to explainable result visualization.

### Technical Success Criteria

1. Functional API endpoints for image and URL analysis.
2. Stable integration between frontend, backend, model, and database.
3. Classification performance at or above project target benchmark (85 percent+ on held-out test data).
4. Result explainability via Grad-CAM heatmap.
5. Reproducible local deployment via Docker Compose.

---

## 4. Implemented System Architecture

### Stack

1. Frontend: Next.js + TypeScript + TailwindCSS
2. Backend: FastAPI + Pydantic + SQLAlchemy
3. ML Runtime: PyTorch + Torchvision
4. Explainability: OpenCV-based Grad-CAM rendering
5. Database: PostgreSQL
6. Containerization: Docker + Docker Compose

### Runtime Flow

```text
Browser
  -> Next.js frontend (port 3000)
    -> FastAPI backend (port 8000)
      -> Input validation and temporary file handling
      -> EfficientNet-B0 inference (PyTorch)
      -> Grad-CAM generation
      -> PostgreSQL insert into detections table
      -> JSON response to frontend
```

### Input Modes

1. File upload (`/analyze/image`): direct image files.
2. URL mode (`/analyze/url`):

- Direct image URL: downloaded with requests.
- Non-image URL (including video): downloaded with yt-dlp, one frame extracted with ffmpeg, then analyzed.

---

## 5. Codebase Structure and Responsibilities

### Backend

1. `api/routes/analyze.py`

- Handles upload and URL analysis endpoints.
- Validates extension and file size.
- Calls inference service.
- Persists detection result.

2. `api/routes/results.py`

- Exposes result retrieval by UUID.

3. `model/efficientnet_model.py`

- Defines model head for binary classification.
- Loads trained weights from `model/weights`.

4. `model/inference.py`

- Single-entry inference function.
- Runs preprocessing, prediction, threshold decision, Grad-CAM, explanation template, timing.

5. `utils/preprocess.py`

- Normalizes image into tensor format expected by EfficientNet.

6. `utils/gradcam.py`

- Registers forward/backward hooks and builds heatmap overlay.

7. `utils/url_fetcher.py`

- Handles URL download, media conversion to image frame, and failure mapping.

8. `db/models.py` and `db/database.py`

- Defines SQLAlchemy model and database session lifecycle.

### Frontend

1. `pages/index.tsx`

- Input UI, tab switch (upload or URL), request submit, loading/error state.

2. `pages/result/[id].tsx`

- Server-side fetch of stored result and presentation of prediction output.

3. `components/*`

- Reusable display blocks for upload, URL input, result card, heatmap, explanation, and errors.

4. `lib/api.ts`

- Encapsulates calls to backend endpoints and shared error handling.

---

## 6. Machine Learning Implementation

### Dataset Strategy

1. Source datasets: CIFAKE and GenImage.
2. Automated download script in `data/download_datasets.py`.
3. Merge and split script in `data/prepare_dataset.py`.
4. Labels:

- `0`: REAL
- `1`: AI_GENERATED

5. Stratified split: 70 percent train, 15 percent validation, 15 percent test.

### Model Design

1. Base architecture: EfficientNet-B0.
2. Final classifier head replaced for two-class output.
3. Regularization: dropout in classifier head.

### Training Workflow

Implemented and documented through project notebooks:

1. EDA and data inspection.
2. Baseline training.
3. Improved training and evaluation.
4. Export best checkpoint for backend inference.

### Inference Decision Rule

Prediction is not a plain argmax only. A confidence threshold is applied for AI class decision to reduce false positives on uncertain cases.

---

## 7. Explainability Implementation (Grad-CAM)

To improve trust and interpretability, the system returns a heatmap that highlights influential regions for the predicted class.

Implementation steps:

1. Hook into target convolution block (`features.8`).
2. Forward pass and class-target backward pass.
3. Channel-wise gradient pooling and weighted activation map.
4. ReLU and normalization.
5. Overlay on original image and encode as base64 PNG.

Frontend displays this map directly without extra file storage.

---

## 8. API Contract

### Endpoints

1. `POST /analyze/image`

- Accepts multipart upload.
- Valid extensions: jpg, jpeg, png, webp.
- Maximum size: 10 MB.

2. `POST /analyze/url`

- Accepts JSON payload with URL.
- Supports direct image fetch and media frame extraction path.

3. `GET /result/{id}`

- Returns stored result by UUID.

4. `GET /health`

- Health probe endpoint.

### Response Content

Each successful detection includes:

1. Predicted label.
2. Numeric confidence and formatted confidence percent.
3. Human-readable explanation.
4. Heatmap base64 string.
5. Metadata (source, model version, processing time, created timestamp).

---

## 9. Database Implementation

Results are stored in PostgreSQL table `detections` with fields for:

1. Source metadata (upload filename or URL).
2. Prediction output and confidence.
3. Explainability artifact (heatmap as base64 text).
4. Model version and timing metrics.
5. Timestamps.

Schema is created automatically at backend startup using SQLAlchemy metadata initialization.

---

## 10. Deployment and Environment

### Docker Compose Services

1. `db`: PostgreSQL 15
2. `backend`: FastAPI with PyTorch dependencies and ffmpeg
3. `frontend`: Next.js production build

### Environment Variables

1. `DATABASE_URL`
2. `TEMP_DIR`
3. `MODEL_VERSION`
4. `NEXT_PUBLIC_API_URL`
5. `API_INTERNAL_URL`

### Operational Note

Model weight file must be present in the mounted weights directory for successful inference startup.

---

## 11. Validation and Testing Strategy

### Functional Testing

1. Upload path end-to-end validation.
2. URL path end-to-end validation.
3. Result retrieval by generated UUID.
4. Frontend rendering for success, loading, and error states.

### Model Evaluation

1. Accuracy on held-out test set.
2. Class-level behavior analysis using confusion patterns.
3. Qualitative review of Grad-CAM for sanity checking.

### Performance Tracking

1. API processing time (`processing_ms`) logged per detection.
2. Monitoring of latency differences between CPU and CUDA modes.

---

## 12. Risk Register and Mitigation

1. Missing model weights at runtime.

- Mitigation: explicit setup documentation and startup validation checks.

2. Blocking inference under concurrent requests.

- Mitigation: future migration to worker queue or threadpool offloading.

3. URL fetch instability (network, platform restrictions).

- Mitigation: timeout controls and clear HTTP error messages.

4. Class imbalance and domain shift.

- Mitigation: stratified splitting, augmentation, threshold tuning, periodic retraining.

5. Heatmap payload size in database.

- Mitigation: optional lifecycle cleanup policy for historical records.

---

## 13. Implementation Milestones (4 Weeks)

1. Week 1: Data acquisition, cleaning, split manifests, baseline notebook training.
2. Week 2: Improved model training, checkpoint export, evaluation and threshold calibration.
3. Week 3: FastAPI endpoints, DB persistence, Grad-CAM pipeline, local backend tests.
4. Week 4: Next.js interface, full integration test, Docker Compose packaging, final report.

---

## 14. Final Outcome

The project successfully implements an integrated AI-generated image detection platform with:

1. Practical user interface for upload and URL workflows.
2. Deployed inference API with stored result history.
3. Explainable predictions via Grad-CAM visualization.
4. Reproducible local deployment stack for demonstration and further iteration.

This implementation establishes a strong foundation for Phase 2 enhancements such as asynchronous processing, improved model robustness, and extended media analysis coverage.
