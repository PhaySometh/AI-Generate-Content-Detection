import base64
import cv2
import numpy as np
import torch


class GradCAM:
    """
    Grad-CAM implementation for EfficientNet-B0.
    Target layer: model.features[8] (final conv block before adaptive pool).
    """

    def __init__(self, model: torch.nn.Module, target_layer_name: str = "features.8"):
        self.model = model
        self.gradients = None
        self.activations = None
        self._register_hooks(target_layer_name)

    def _get_target_layer(self, name: str):
        parts = name.split(".")
        layer = self.model
        for part in parts:
            if part.isdigit():
                layer = layer[int(part)]
            else:
                layer = getattr(layer, part)
        return layer

    def _register_hooks(self, layer_name: str):
        target = self._get_target_layer(layer_name)

        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        target.register_forward_hook(forward_hook)
        target.register_full_backward_hook(backward_hook)

    def generate(self, tensor: torch.Tensor, class_idx: int, original_image_path: str) -> str:
        """
        Returns base64-encoded PNG of Grad-CAM heatmap overlaid on the original image.
        Returns empty string on any failure.
        """
        try:
            self.model.zero_grad()
            tensor = tensor.clone().requires_grad_(True)
            logits = self.model(tensor)
            score = logits[0, class_idx]
            score.backward()

            # Pool gradients over spatial dims -> (C,)
            pooled_grads = self.gradients.mean(dim=[0, 2, 3])

            # Weight activations
            activations = self.activations[0]  # (C, H, W)
            for i, w in enumerate(pooled_grads):
                activations[i] *= w

            heatmap = activations.mean(dim=0).numpy()  # (H, W)
            heatmap = np.maximum(heatmap, 0)           # ReLU
            heatmap /= (heatmap.max() + 1e-8)          # normalize 0-1

            orig = cv2.imread(original_image_path)
            orig = cv2.resize(orig, (224, 224))

            heatmap_resized = cv2.resize(heatmap, (224, 224))
            heatmap_colored = cv2.applyColorMap(
                np.uint8(255 * heatmap_resized), cv2.COLORMAP_JET
            )
            overlaid = cv2.addWeighted(orig, 0.6, heatmap_colored, 0.4, 0)

            _, buffer = cv2.imencode(".png", overlaid)
            return base64.b64encode(buffer).decode("utf-8")

        except Exception as e:
            print(f"[GradCAM] Generation failed: {e}")
            return ""
