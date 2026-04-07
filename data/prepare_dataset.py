"""
Prepare dataset from 140k Real and Fake Faces (Kaggle: xhlulu/140k-real-and-fake-faces).

Folder structure expected under data/raw/faces/:
    real_vs_fake/
        train/real/   train/fake/
        valid/real/   valid/fake/
        test/real/    test/fake/

Outputs CSV manifests to data/processed/:
    train.csv, val.csv, test.csv  (columns: filepath, label)
    Label: 0 = REAL, 1 = AI_GENERATED
"""

import sys
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

RAW_DIR = Path(__file__).parent / "raw" / "faces" / "real_vs_fake"
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
    # The dataset already has train/valid/test splits — use them directly
    splits = {
        "train": (RAW_DIR / "train" / "real", RAW_DIR / "train" / "fake"),
        "val":   (RAW_DIR / "valid" / "real", RAW_DIR / "valid" / "fake"),
        "test":  (RAW_DIR / "test"  / "real", RAW_DIR / "test"  / "fake"),
    }

    for split_name, (real_folder, fake_folder) in splits.items():
        records = []

        if real_folder.exists():
            batch = collect_images(real_folder, 0)
            print(f"  [{split_name}] REAL : {len(batch)} images")
            records.extend(batch)
        else:
            print(f"  [WARN] Not found: {real_folder}")

        if fake_folder.exists():
            batch = collect_images(fake_folder, 1)
            print(f"  [{split_name}] FAKE : {len(batch)} images")
            records.extend(batch)
        else:
            print(f"  [WARN] Not found: {fake_folder}")

        if not records:
            print(f"[ERROR] No images found for split: {split_name}", file=sys.stderr)
            continue

        df = pd.DataFrame(records)
        real_count = (df["label"] == 0).sum()
        fake_count = (df["label"] == 1).sum()
        ratio = max(real_count, fake_count) / min(real_count, fake_count)
        print(f"  [{split_name}] Total: {len(df)} | REAL: {real_count} | FAKE: {fake_count} | Ratio: {ratio:.2f}")
        if ratio > 1.5:
            print(f"  [WARN] Class imbalance detected (ratio {ratio:.2f}). Consider WeightedRandomSampler.")

        out_file = OUT_DIR / f"{split_name}.csv"
        df.to_csv(out_file, index=False)
        print(f"  Saved -> {out_file}\n")

    print("Done. Next step: open notebooks/01_eda.ipynb")


if __name__ == "__main__":
    main()
