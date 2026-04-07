# AI-Generated Content Detection

An end-to-end web system that detects whether an image is **REAL** or **AI_GENERATED**.

The project includes:

- A training/evaluation workflow in notebooks (PyTorch + EfficientNet-B0)
- A FastAPI backend for inference and result storage
- A Next.js frontend for upload/URL analysis and result visualization
- PostgreSQL for persistence
- Grad-CAM heatmaps for explainability

## 1. Project Workflow Overview

1. Prepare environment and install dependencies
2. Download and prepare dataset manifests
3. Explore data and train the model in notebooks
4. Save trained weights to backend model folder
5. Start backend + frontend (+ database)
6. Use website to analyze uploaded images or URLs

## 2. Repository Structure

```text
backend/            FastAPI API, model inference, DB layer, utilities
frontend/           Next.js web app
data/               Dataset download and CSV preparation scripts
notebooks/          EDA, training, and evaluation notebooks
docs/               Design/planning reports
docker-compose.yml  Full-stack local deployment
```

## 3. Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- PostgreSQL 15 (if running locally without Docker)
- Optional for URL/video analysis: `yt-dlp` and `ffmpeg`
- Optional for dataset download: Kaggle API credentials

## 4. Setup (Local Development)

### 4.1 Clone and enter project

```bash
git clone <your-repo-url>
cd AI-Generate-Content-Detection
```

### 4.2 Backend setup

Create and activate virtual environment:

```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Create a root `.env` file (optional but recommended):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_detection
TEMP_DIR=/tmp/ai_detector
MODEL_VERSION=efficientnet-b0-v3
```

On Windows, you may prefer:

```env
TEMP_DIR=C:/temp/ai_detector
```

### 4.3 Frontend setup

```bash
cd frontend
npm install
cd ..
```

## 5. Data Preparation

This project currently uses **140k Real and Fake Faces** from Kaggle.

### 5.1 Configure Kaggle API

- Install Kaggle CLI:

```bash
pip install kaggle
```

- Place your Kaggle API file as:
  - Windows: `%USERPROFILE%/.kaggle/kaggle.json`
  - Linux/macOS: `~/.kaggle/kaggle.json`

### 5.2 Download dataset

From project root:

```bash
python data/download_datasets.py
```

### 5.3 Generate CSV manifests

```bash
python data/prepare_dataset.py
```

This creates:

- `data/processed/train.csv`
- `data/processed/val.csv`
- `data/processed/test.csv`

Each file has:

- `filepath`
- `label` (`0 = REAL`, `1 = AI_GENERATED`)

## 6. Train and Evaluate the Model

Open notebooks in this order:

1. `notebooks/01_eda.ipynb` (data inspection)
2. `notebooks/02_training.ipynb` or `notebooks/02b_improved_training.ipynb` (training)
3. `notebooks/03_evaluation.ipynb` (evaluation)

After training, save/export model weights to:

`backend/model/weights/efficientnet_b0_v3.pth`

This matches the backend loader path used by inference.

## 7. Run the Website (Local, without Docker)

You need 3 running services:

- PostgreSQL
- Backend API
- Frontend app

### 7.1 Start backend

From project root (with virtual environment active):

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Check health endpoint:

`http://localhost:8000/health`

### 7.2 Start frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Open website:

`http://localhost:3000`

## 8. Run with Docker Compose (Recommended)

From project root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

Stop services:

```bash
docker compose down
```

## 9. How to Use the Website

1. Open `http://localhost:3000`
2. Choose input mode:
   - **Upload File**: drag/drop or select `.jpg/.jpeg/.png/.webp`
   - **Paste URL**: image URL or supported media URL
3. Click analyze
4. View result page showing:
   - Label (`REAL` or `AI_GENERATED`)
   - Confidence score
   - Grad-CAM heatmap
   - Explanation text
   - Model version and processing time

## 10. API Endpoints

- `GET /health` health check
- `POST /analyze/image` image upload analysis
- `POST /analyze/url` URL/media analysis
- `GET /result/{id}` retrieve saved result by UUID

Base URL (local): `http://localhost:8000`

## 11. Common Issues and Fixes

### Frontend `npm run dev` fails

- Ensure dependencies are installed:

```bash
cd frontend
npm install
```

- Check Node version (`node -v`) is compatible with Next.js 14.

### Backend cannot load model

- Ensure file exists exactly at:

`backend/model/weights/efficientnet_b0_v3.pth`

### URL analysis fails

- Install `yt-dlp` and `ffmpeg` on your system, or use Docker setup where backend image includes ffmpeg.

### DB connection errors

- Verify `DATABASE_URL` is correct
- Confirm PostgreSQL service is running and credentials match
