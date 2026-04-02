import { ApiError, DetectionResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_INTERNAL = process.env.API_INTERNAL_URL ?? API_BASE;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ error: "Unknown error" }));
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function analyzeImage(file: File): Promise<DetectionResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/analyze/image`, {
    method: "POST",
    body: form,
  });
  return handleResponse<DetectionResult>(res);
}

export async function analyzeUrl(url: string): Promise<DetectionResult> {
  const res = await fetch(`${API_BASE}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return handleResponse<DetectionResult>(res);
}

export async function getResult(id: string): Promise<DetectionResult> {
  const res = await fetch(`${API_INTERNAL}/result/${id}`);
  return handleResponse<DetectionResult>(res);
}
