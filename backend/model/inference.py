# Inference pipeline: preprocess image, run model, then build explanation and heatmap.

import time
import torch
import torch.nn.functional as F

from backend.model.efficientnet_model import load_model, LABELS
from backend.utils.preprocess import preprocess_image
from backend.utils.gradcam import GradCAM

_model = None
_gradcam = None


def get_model(device: str = "cpu") -> torch.nn.Module:
    # Lazily initialize and cache model + Grad-CAM objects per process.
    global _model, _gradcam
    if _model is None:
        _model = load_model(device)
        _gradcam = GradCAM(_model, target_layer_name="features.8")
    return _model


def run_inference(image_path: str) -> dict:
    # Run EfficientNet-B0 inference on one image and return a response-ready dict.
    # Returned keys:
    # - label: "REAL" | "AI_GENERATED"
    # - confidence: probability in range [0, 1]
    # - heatmap_b64: base64 PNG overlay
    # - explanation: human-readable explanation text
    # - processing_ms: end-to-end inference time in milliseconds
    t0 = time.time()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_model(device)

    tensor = preprocess_image(image_path).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)

    # Standard threshold — v3 trained on balanced REAL + CIFAKE AI data.
    AI_THRESHOLD = 0.50
    ai_prob = float(probs[0][1])
    pred_class = 1 if ai_prob >= AI_THRESHOLD else 0
    confidence = ai_prob if pred_class == 1 else float(probs[0][0])
    label = LABELS[pred_class]

    heatmap_b64 = _gradcam.generate(tensor, pred_class, image_path)

    explanation = _build_explanation(label, confidence)
    processing_ms = int((time.time() - t0) * 1000)

    return {
        "label": label,
        "confidence": confidence,
        "heatmap_b64": heatmap_b64,
        "explanation": explanation,
        "processing_ms": processing_ms,
    }


def _build_explanation(label: str, confidence: float) -> str:
    # Generate a human-readable explanation string from prediction confidence.
    pct = round(confidence * 100, 1)
    if label == "AI_GENERATED":
        if confidence >= 0.90:
            return (
                f"The model is highly confident ({pct}%) this image was AI-generated. "
                "Common indicators include unnatural textures, artifacts in fine details "
                "(hair, fingers, backgrounds), and overly smooth gradients."
            )
        elif confidence >= 0.70:
            return (
                f"The model suspects ({pct}%) this image is AI-generated. "
                "Some regions show statistical patterns typical of generative models."
            )
        else:
            return (
                f"The model leans toward AI-generated ({pct}%), but the result is uncertain. "
                "The image may be a heavily edited photograph or an unusually realistic AI image."
            )
    else:
        if confidence >= 0.90:
            return (
                f"The model is highly confident ({pct}%) this is a real photograph. "
                "Natural noise patterns, lens characteristics, and lighting are consistent "
                "with a camera-captured image."
            )
        elif confidence >= 0.70:
            return (
                f"The model believes ({pct}%) this is a real photograph, "
                "though some regions are ambiguous."
            )
        else:
            return (
                f"The model leans toward real ({pct}%), but confidence is low. "
                "The image may have been heavily post-processed."
            )
