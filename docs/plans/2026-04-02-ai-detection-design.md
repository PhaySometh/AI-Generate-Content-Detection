# AI Content Generation Detection — Design Document

**Date:** 2026-04-02  
**Project:** CADT Year 3 Term 2 — Data Science Final Project  
**Phase:** 1 (Image detection only; video detection is Phase 2)

---

## Context

A web application that detects whether an image is AI-generated or real. Users upload a file or paste a URL. The system runs inference using a fine-tuned EfficientNet-B0 model and returns a label (REAL/AI_GENERATED), confidence score, Grad-CAM heatmap, and a brief explanation. Required as a full-stack course final project, running locally for demo.

---

## Architecture

**Stack:** Next.js (frontend) + FastAPI (backend) + PostgreSQL (results storage)  
**Dropped:** Redis (no benefit at single-user local scale), Cloudinary (replaced by local temp files + BackgroundTasks)  
**Deployment:** Local only — docker-compose or manual start

```
Browser
  └─▶ Next.js (:3000)
        └─▶ FastAPI (:8000)
              ├─▶ EfficientNet-B0 (PyTorch inference)
              ├─▶ Grad-CAM generator (hooks into features[8])
              ├─▶ PostgreSQL (:5432) — stores DetectionResult rows
              └─▶ /tmp/ai_detector/ — temp files, auto-deleted after 24hrs
```

**URL input:** yt-dlp fetches media → ffmpeg extracts one frame from video → frame analyzed as image.

**Project layout:**
```
/frontend        → Next.js app
/backend         → FastAPI app
  /api/routes    → analyze.py, results.py
  /model         → efficientnet_model.py, inference.py, weights/
  /utils         → preprocess.py, gradcam.py, url_fetcher.py
  /db            → database.py, models.py
  /core          → config.py, schemas.py
/notebooks       → 01_eda.ipynb, 02_training.ipynb, 03_evaluation.ipynb
/data            → download_datasets.py, prepare_dataset.py, processed/
```

---

## Database Schema

Table: `detections`

```sql
CREATE TABLE detections (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_type       VARCHAR(10)  NOT NULL,  -- 'upload' | 'url'
    source_url        TEXT,
    original_filename VARCHAR(255),
    label             VARCHAR(20)  NOT NULL,  -- 'REAL' | 'AI_GENERATED'
    confidence        FLOAT        NOT NULL,
    explanation       TEXT         NOT NULL,
    heatmap_b64       TEXT,                   -- base64 PNG
    model_version     VARCHAR(50)  NOT NULL DEFAULT 'efficientnet-b0-v1',
    processing_ms     INTEGER,
    deleted_at        TIMESTAMP WITH TIME ZONE
);
```

Tables auto-created at backend startup via `Base.metadata.create_all()`.

---

## ML Pipeline

**Datasets:** CIFAKE (Kaggle) + GenImage (Kaggle)  
**Labels:** 0 = REAL, 1 = AI_GENERATED  
**Split:** 70/15/15 stratified → `train.csv`, `val.csv`, `test.csv`  
**Target accuracy:** ~85%+ on test set

**Model:** EfficientNet-B0, ImageNet pretrained, fine-tuned for binary classification  
**Classifier head:** `Dropout(0.2) → Linear(in_features, 2)`

**Training:**
- Phase 1 (epochs 1–3): freeze backbone, train head only
- Phase 2 (epochs 4–15): unfreeze all, fine-tune end-to-end
- Optimizer: AdamW, lr=1e-4, weight_decay=1e-4
- Scheduler: CosineAnnealingLR, T_max=10
- Loss: CrossEntropyLoss
- Batch size: 32
- Early stopping: patience=3 on val loss
- Augmentation: RandomHorizontalFlip, RandomRotation(15°), ColorJitter

**Inference flow (`backend/model/inference.py`):**
```
image path
  → preprocess_image()     # OpenCV resize 224×224, BGR→RGB, ImageNet normalize
  → model forward pass     # softmax → label + confidence
  → GradCAM.generate()     # heatmap PNG as base64
  → build_explanation()    # template text by label + confidence tier
  → return dict
```

Model loaded once at startup as module-level singleton.  
Weights saved to `backend/model/weights/efficientnet_b0_finetuned.pth` — in `.gitignore`, mounted as Docker volume.

---

## Grad-CAM

- Target layer: `model.features[8]` (final conv block before adaptive pool)
- Register forward + backward hooks
- Re-run forward with gradients → backprop on predicted class score
- Pool gradients over channels → weight activations → ReLU → normalize
- Resize to 224×224, apply COLORMAP_JET, blend 60/40 over original image
- Encode as base64 PNG
- Falls back to empty string on failure; frontend shows "Heatmap unavailable"

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/analyze/image` | Multipart file upload (JPEG/PNG/WEBP, max 10MB) |
| POST | `/analyze/url` | JSON `{ "url": "..." }` — yt-dlp fetch |
| GET | `/result/{id}` | Fetch stored DetectionResult by UUID |
| GET | `/health` | `{ "status": "ok" }` |

**DetectionResult response schema:**
```json
{
  "id": "uuid",
  "label": "AI_GENERATED",
  "confidence": 0.9341,
  "confidence_pct": "93.4%",
  "explanation": "...",
  "heatmap_b64": "<base64 PNG>",
  "source_type": "upload",
  "original_filename": "portrait.jpg",
  "processing_ms": 842,
  "created_at": "2026-04-02T10:30:00Z"
}
```

---

## Frontend Structure

```
pages/
  index.tsx            ← tabs: Upload File | Paste URL → redirect to /result/{id}
  result/[id].tsx      ← getServerSideProps fetches result, renders all components
components/
  UploadBox.tsx        ← drag-and-drop file input
  UrlInput.tsx         ← URL field + submit
  LoadingSpinner.tsx   ← full-screen loading
  ResultCard.tsx       ← label badge (green=REAL, red=AI) + confidence bar
  HeatmapViewer.tsx    ← base64 img with original/heatmap toggle
  ExplanationBox.tsx   ← explanation text
  ErrorBanner.tsx      ← error display
lib/
  api.ts               ← analyzeImage(), analyzeUrl(), getResult()
  types.ts             ← DetectionResult, ApiError interfaces
```

`NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`

---

## Local Setup

**With Docker:**
```bash
docker-compose up --build
# frontend: http://localhost:3000
# backend:  http://localhost:8000
```

**Manual:**
```bash
# Terminal 1
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## Key Risks

| Risk | Mitigation |
|------|-----------|
| `.pth` weights too large for git | `.gitignore *.pth`; mount as Docker volume; README documents download |
| Grad-CAM hooks wrong layer after fine-tuning | Print `model.named_modules()` in notebook; visually verify before deploy |
| yt-dlp fails on restrictive URLs | Pre-check direct image URLs with `requests.get`; 60s timeout; clear error messages |
| Dataset class imbalance | Check in EDA; use `WeightedRandomSampler` if >60/40 |
| Slow CPU inference (2–5s) | `torch.no_grad()` for classification pass; singleton model at startup |
| Base64 heatmaps bloating DB | Background thread deletes rows older than 24hrs using `deleted_at` |

---

## Implementation Order

**Week 1 — ML:** Download datasets → EDA → train → evaluate → save weights  
**Week 2 — Backend:** DB models → inference pipeline → Grad-CAM → API routes → test with curl  
**Week 3 — Frontend:** Scaffold → components → wire pages → end-to-end test  
**Week 4 — Polish:** Docker setup → edge cases → README  

---

## Verification

1. `POST /analyze/image` with a known AI image → returns `AI_GENERATED` label + heatmap
2. `POST /analyze/image` with a real photo → returns `REAL` label
3. `POST /analyze/url` with an image URL → same result schema
4. `GET /result/{id}` with the returned UUID → same data
5. Frontend: upload image → loading state → results page renders heatmap and explanation
6. Test set accuracy ≥ 85% (logged in `03_evaluation.ipynb`)
