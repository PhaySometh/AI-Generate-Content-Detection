### Basic Approach

This project implements a web-based inference system:

1. Frontend collects user input (upload or URL).
2. Backend validates input, preprocesses image, and runs EfficientNet-B0 inference.
3. Output includes class label, confidence, Grad-CAM heatmap, and explanation.
4. Results are stored and retrievable by UUID.

## 3. Problem Definition and Task

### 3.1 Task Definition

Inputs:

1. Raw image upload (`jpg`, `jpeg`, `png`, `webp`, up to 10 MB).
2. Public URL pointing to image or media.

Outputs:

1. Binary label: `REAL` or `AI_GENERATED`.
2. Confidence score in `[0, 1]` plus formatted percentage.
3. Grad-CAM heatmap (base64-encoded PNG).
4. Explanatory text and metadata (source type, processing time, model version).

Formal objective:
Given image tensor $x$, learn classifier $f_{\theta}(x) \rightarrow p(y=1|x)$ where $y \in \{0,1\}$ and $1=\text{AI_GENERATED}$. Final decision uses a calibrated threshold $\tau$ (currently $\tau=0.65$ for AI class) to reduce over-prediction.

Implementation note (verified): the FastAPI inference path applies $\tau=0.65$ in `backend/model/inference.py`, while the evaluation notebook (`notebooks/03_evaluation.ipynb`) reports metrics using `argmax` predictions.

## 4. Dataset Description

### Source and Collection

1. CIFAKE dataset (Kaggle) [1].
2. GenImage dataset (Kaggle) [2].
3. Data acquisition and merging scripts are implemented in project utilities.

### Size and Features

1. Image data consists of mixed real and AI-generated content from both sources.
2. Exact final sample count and class distribution depend on downloaded subset and folder availability at runtime.
3. Current repository does not include `data/processed` CSV manifests, so exact split counts must be regenerated locally.

### Data Splits

1. Stratified split: 70% training, 15% validation, 15% test.
2. Stratification preserves class ratio across splits and better reflects deployment behavior where both classes appear with variable prevalence.

Validation status: exact per-split counts require running local data preparation (`needs your execution and validation`).

---

## 5. Methodology and Implementation

### 5.1 Preprocessing and Feature Engineering

Implemented preprocessing:

1. Read image and convert BGR to RGB (OpenCV) [10].
2. Resize to 224x224.
3. Normalize with ImageNet mean/std.
4. Convert to tensor with batch dimension (PyTorch) [5].

Training-side augmentations (from notebook pipeline):

1. Random horizontal flip.
2. Random rotation.
3. Color jitter.

Specialized frequency-domain features:

1. FFT/frequency analysis is not yet implemented in current codebase.
2. This remains future work and is recommended for robustness against generator artifacts.

### 5.2 Algorithm Definition

High-level inference pseudocode:

```text
function DETECT(input):
  image_path <- acquire_image_from_upload_or_url(input)
  tensor <- preprocess(image_path)        # resize + normalize
  probs <- softmax(model(tensor))
  ai_prob <- probs[AI_CLASS]
  if ai_prob >= 0.65:
      label <- AI_GENERATED
      confidence <- ai_prob
  else:
      label <- REAL
      confidence <- probs[REAL_CLASS]
  heatmap <- GradCAM(model, target_layer="features.8", tensor, label)
  explanation <- template(label, confidence)
  persist_result_to_database(...)
  return {label, confidence, heatmap, explanation, metadata}
```

Trace example (single request):

1. User uploads image in frontend.
2. Frontend sends multipart request to backend.
3. Backend writes temp file and runs model inference.
4. Decision threshold maps probabilities to final class.
5. Grad-CAM overlay is generated and encoded.
6. Result is stored in PostgreSQL and returned.
7. Frontend redirects to result page and renders prediction + heatmap.

### 5.3 Model Architectures

Classical ML baselines:

1. Random Forest, Logistic Regression, SVM are not implemented in current repository.
2. Baseline rows are included in evaluation table as pending experiments.

Deep Learning (primary):

1. EfficientNet-B0 with custom binary head [3].
2. Dropout + linear classifier for two classes.
3. Inference with calibrated AI threshold (0.65).

RNN/LSTM:

1. Not used in current image-only pipeline.

Transformer fine-tuning:

1. ViT/BERT-based models are not currently implemented in code.
2. Recommended for future comparative experiments.

---

## 6. Experimental Evaluation

### 6.1 Methodology

Criteria:

1. Accuracy.
2. Precision, Recall, F1-score (classification report).
3. ROC-AUC.
4. Confusion matrix.

Hypothesis:

1. EfficientNet-B0 provides strong detection performance with favorable compute-performance trade-off.
2. Threshold calibration improves practical precision-recall balance for uncertain AI-like samples.

Experimental setup:

1. Evaluation script: `notebooks/03_evaluation.ipynb`.
2. Input manifest: `data/processed/test.csv`.
3. Preprocessing: resize to 224x224, ImageNet normalization.
4. Prediction rule in notebook: `pred = argmax(softmax(logits))`.
5. Hardware: local environment used in notebook execution; exact CPU/GPU specification is not recorded in repository.

### 6.2 Results

Observed metrics from evaluation notebook outputs:

1. Test Accuracy: 84.42%.
2. ROC-AUC: 0.9271.
3. Class-wise report (support = 9000 per class):

- REAL: Precision 0.89, Recall 0.79, F1-score 0.83.
- AI_GENERATED: Precision 0.81, Recall 0.90, F1-score 0.85.

4. Macro avg: Precision 0.85, Recall 0.84, F1-score 0.84.
5. Weighted avg: Precision 0.85, Recall 0.84, F1-score 0.84.
6. Confusion matrix and ROC curve images are generated in notebook artifacts.

Comparative table (current status):

| Model                      | Accuracy |       Precision |          Recall |        F1-score |
| -------------------------- | -------: | --------------: | --------------: | --------------: |
| Baseline (Random Forest)   |      N/A |             N/A |             N/A |             N/A |
| RNN / LSTM                 |      N/A |             N/A |             N/A |             N/A |
| EfficientNet-B0 (Proposed) |   84.42% | 0.85 (weighted) | 0.84 (weighted) | 0.84 (weighted) |
| Transformer (ViT/BERT)     |      N/A |             N/A |             N/A |             N/A |

Validation status notes:

1. Precision/Recall/F1 values above are taken from the executed output shown in `notebooks/03_evaluation.ipynb`.
2. Baseline and transformer metrics are still unavailable because those pipelines are not implemented in the current repository code.


## 7. Error Analysis

Current status:

1. Full quantitative false-positive/false-negative breakdown is not yet exported as a dedicated section in repository docs.
2. Confusion matrix artifact exists, but per-case failure cataloging is pending.

Likely failure causes (hypotheses from implementation characteristics; not yet validated by per-sample audit):

1. Heavy JPEG compression or resizing artifacts.
2. Very low-light or low-resolution images.
3. Highly post-processed real images.
4. New generation models with artifacts not present in training data.

Required next step (`needs your testing and validation`):

1. Save 20 to 50 misclassified samples with manual labels.
2. Group by failure mode and update this section with evidence images.


## Bibliography (IEEE Style)

[1] Birdy654, "CIFAKE: Real and AI-Generated Synthetic Images," Kaggle. [Online]. Available: https://www.kaggle.com/datasets/birdy654/cifake-real-and-ai-generated-synthetic-images

[2] Y. Sibo et al., "GenImage: A Million-Scale Benchmark for Detecting AI-Generated Image," Kaggle. [Online]. Available: https://www.kaggle.com/datasets/yangsibo/genimage

[3] M. Tan and Q. Le, "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks," in Proc. ICML, 2019.

[4] R. R. Selvaraju et al., "Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization," in Proc. ICCV, 2017.

[5] A. Paszke et al., "PyTorch: An Imperative Style, High-Performance Deep Learning Library," in Proc. NeurIPS, 2019.

[6] FastAPI Documentation. [Online]. Available: https://fastapi.tiangolo.com/

[7] SQLAlchemy Documentation. [Online]. Available: https://www.sqlalchemy.org/

[8] Next.js Documentation. [Online]. Available: https://nextjs.org/docs

[9] yt-dlp Documentation. [Online]. Available: https://github.com/yt-dlp/yt-dlp

[10] OpenCV Documentation. [Online]. Available: https://docs.opencv.org/
