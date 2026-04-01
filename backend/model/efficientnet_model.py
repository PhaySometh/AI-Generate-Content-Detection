import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "weights" / "efficientnet_b0_finetuned.pth"
LABELS = {0: "REAL", 1: "AI_GENERATED"}


def build_model() -> nn.Module:
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.2, inplace=True),
        nn.Linear(in_features, 2),
    )
    return model


def load_model(device: str = "cpu") -> nn.Module:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model weights not found at {MODEL_PATH}. "
            "Train the model using notebooks/02_training.ipynb first, "
            "then copy the weights file to backend/model/weights/."
        )
    model = build_model()
    state_dict = torch.load(MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.eval()
    return model
