# Image preprocessing utilities used before model inference.

import cv2
import torch
import numpy as np
from torchvision import transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


def preprocess_image(image_path: str) -> torch.Tensor:
    # Read image, resize to 224x224, convert BGR->RGB, then normalize.
    # Returns tensor with shape (1, 3, 224, 224).
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read image at {image_path}")
    img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_LANCZOS4)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = img.astype(np.float32) / 255.0
    tensor = _transform(img)
    return tensor.unsqueeze(0)  # add batch dimension -> (1, 3, 224, 224)
