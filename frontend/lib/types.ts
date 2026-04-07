// API payload returned by analyze endpoints and result lookup endpoint.
export interface DetectionResult {
  id: string;
  label: "REAL" | "AI_GENERATED";
  confidence: number;
  confidence_pct: string;
  explanation: string;
  heatmap_b64: string | null;
  source_type: "upload" | "url";
  source_url: string | null;
  original_filename: string | null;
  model_version: string;
  processing_ms: number;
  created_at: string;
}

// Standardized API error shape used across UI components.
export interface ApiError {
  error: string;
  detail?: string;
}
