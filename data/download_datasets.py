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
        [sys.executable, "-m", "kaggle", "datasets", "download", "-d", dataset, "-p", str(dest), "--unzip"],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"[ERROR] Failed to download {dataset}", file=sys.stderr)
        sys.exit(1)
    print(f"Done: {dataset}")


if __name__ == "__main__":
    # 140k Real and Fake Faces (real human portraits vs StyleGAN-generated faces)
    # https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces
    # Expected structure after unzip:
    #   data/raw/faces/real_vs_fake/train/real/, train/fake/
    #   data/raw/faces/real_vs_fake/valid/real/, valid/fake/
    #   data/raw/faces/real_vs_fake/test/real/,  test/fake/
    download("xhlulu/140k-real-and-fake-faces", RAW_DIR / "faces")

    print("\nAll datasets downloaded to data/raw/")
    print("Next step: run  python data/prepare_dataset.py")
