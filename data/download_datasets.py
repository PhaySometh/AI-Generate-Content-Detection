"""
Download datasets from Kaggle.

Prerequisites:
  pip install kaggle
  Set up ~/.kaggle/kaggle.json with your API credentials.
  See: https://www.kaggle.com/docs/api

Usage:
  python data/download_datasets.py
"""

import subprocess
import sys
from pathlib import Path

RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)


def download(dataset: str, dest: Path) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {dataset} -> {dest}")
    result = subprocess.run(
        ["kaggle", "datasets", "download", "-d", dataset, "-p", str(dest), "--unzip"],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"[ERROR] Failed to download {dataset}", file=sys.stderr)
        sys.exit(1)
    print(f"Done: {dataset}")


if __name__ == "__main__":
    # CIFAKE: Real and AI-Generated Synthetic Images
    # https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images
    download("birdy654/cifake-real-and-ai-generated-synthetic-images", RAW_DIR / "cifake")

    # GenImage: A Million-Scale Benchmark for Detecting AI-Generated Image
    # https://www.kaggle.com/datasets/yangsibo/genimage
    download("yangsibo/genimage", RAW_DIR / "genimage")

    print("\nAll datasets downloaded to data/raw/")
    print("Next step: run  python data/prepare_dataset.py")
