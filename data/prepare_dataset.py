"""
Merge CIFAKE + GenImage datasets, assign labels, stratified split 70/15/15.

Outputs CSV manifests to data/processed/:
  train.csv, val.csv, test.csv  (columns: filepath, label)
  Label: 0 = REAL, 1 = AI_GENERATED

Usage:
  python data/prepare_dataset.py
"""

import sys
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

RAW_DIR = Path(__file__).parent / "raw"
OUT_DIR = Path(__file__).parent / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def collect_images(folder: Path, label: int) -> list[dict]:
    records = []
    for f in folder.rglob("*"):
        if f.suffix.lower() in IMAGE_EXTS:
            records.append({"filepath": str(f), "label": label})
    return records


def main():
    records = []

    # --- CIFAKE ---
    cifake_real = RAW_DIR / "cifake" / "train" / "REAL"
    cifake_fake = RAW_DIR / "cifake" / "train" / "FAKE"
    cifake_real_test = RAW_DIR / "cifake" / "test" / "REAL"
    cifake_fake_test = RAW_DIR / "cifake" / "test" / "FAKE"

    for folder, label in [
        (cifake_real, 0), (cifake_fake, 1),
        (cifake_real_test, 0), (cifake_fake_test, 1),
    ]:
        if folder.exists():
            batch = collect_images(folder, label)
            print(f"  CIFAKE {folder.name}: {len(batch)} images (label={label})")
            records.extend(batch)
        else:
            print(f"  [WARN] Not found: {folder}")

    # --- GenImage ---
    # GenImage has subdirectories per generator; all are AI-generated
    genimage_ai = RAW_DIR / "genimage"
    genimage_real = RAW_DIR / "genimage" / "imagenet_ai_0419_biggan"  # adjust if needed
    # Real images are in a separate 'val' or 'imagenet' folder depending on version
    if not genimage_ai.exists():
        print("  [INFO] GenImage not found, skipping.")
    for folder in (genimage_ai.iterdir() if genimage_ai.exists() else []):
        if folder.is_dir() and "real" in folder.name.lower():
            batch = collect_images(folder, 0)
            print(f"  GenImage REAL {folder.name}: {len(batch)} images")
            records.extend(batch)
        elif folder.is_dir() and folder.name not in ("__pycache__",):
            batch = collect_images(folder, 1)
            print(f"  GenImage AI {folder.name}: {len(batch)} images")
            records.extend(batch)

    if not records:
        print("[ERROR] No images found. Run download_datasets.py first.", file=sys.stderr)
        sys.exit(1)

    df = pd.DataFrame(records)
    real_count = (df["label"] == 0).sum()
    ai_count = (df["label"] == 1).sum()
    print(f"\nTotal: {len(df)} images  |  REAL: {real_count}  |  AI: {ai_count}")

    ratio = max(real_count, ai_count) / min(real_count, ai_count)
    if ratio > 1.5:
        print(f"[WARN] Class imbalance detected (ratio {ratio:.2f}). "
              "Consider WeightedRandomSampler during training.")

    # Stratified split: 70 / 15 / 15
    train_df, temp_df = train_test_split(
        df, test_size=0.30, random_state=42, stratify=df["label"]
    )
    val_df, test_df = train_test_split(
        temp_df, test_size=0.50, random_state=42, stratify=temp_df["label"]
    )

    train_df.to_csv(OUT_DIR / "train.csv", index=False)
    val_df.to_csv(OUT_DIR / "val.csv", index=False)
    test_df.to_csv(OUT_DIR / "test.csv", index=False)

    print(f"\nSplit saved to data/processed/")
    print(f"  train: {len(train_df)}  |  val: {len(val_df)}  |  test: {len(test_df)}")
    print("Next step: open notebooks/02_training.ipynb")


if __name__ == "__main__":
    main()
