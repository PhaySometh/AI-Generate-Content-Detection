import { ApiError, DetectionResult } from "./types";

// Public browser URL for client-side API requests.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
// Internal service URL used by server-side rendering in Docker/networked setups.
const API_INTERNAL = process.env.API_INTERNAL_URL ?? API_BASE;

async function handleResponse<T>(res: Response): Promise<T> {
  // Normalize non-2xx responses into a typed ApiError object.
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ error: "Unknown error" }));
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function analyzeImage(file: File): Promise<DetectionResult> {
  // Send multipart upload for direct image analysis.
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze/image`, {
    method: "POST",
    body: form,
  });
  return handleResponse<DetectionResult>(res);
}

export async function analyzeUrl(url: string): Promise<DetectionResult> {
  // Send JSON payload for URL-based image/video analysis.
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return handleResponse<DetectionResult>(res);
}

export async function getResult(id: string): Promise<DetectionResult> {
  // Fetch stored analysis result by UUID.
  const res = await fetch(`${API_INTERNAL}/result/${id}`);
  return handleResponse<DetectionResult>(res);
}
