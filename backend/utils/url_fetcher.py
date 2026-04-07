# Download image/media from URL and convert to an inference-ready image file.

import os
import subprocess
import uuid
from pathlib import Path

import requests
from fastapi import HTTPException

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}
VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".avi", ".mov", ".flv"}


def fetch_media_from_url(url: str, temp_dir: Path) -> Path:
    # Fetch an image or video frame from a URL.
    # - Direct image URLs: download with requests.
    # - Other URLs: use yt-dlp, then extract one frame with ffmpeg for videos.
    # Returns a local image path ready for inference.
    # Raises HTTPException(422) on recoverable fetch/processing failures.
    temp_dir.mkdir(parents=True, exist_ok=True)
    stem = f"url_{uuid.uuid4().hex}"

    # Fast path: direct image URL
    url_lower = url.lower().split("?")[0]
    if any(url_lower.endswith(ext) for ext in IMAGE_EXTENSIONS):
        try:
            resp = requests.get(url, timeout=30, stream=True)
            resp.raise_for_status()
            suffix = Path(url_lower).suffix or ".jpg"
            out_path = temp_dir / f"{stem}{suffix}"
            out_path.write_bytes(resp.content)
            return out_path
        except requests.RequestException as e:
            raise HTTPException(422, detail=f"Failed to download image URL: {e}")

    # General path: yt-dlp
    out_template = str(temp_dir / f"{stem}.%(ext)s")
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "--max-filesize", "50m",
        "-o", out_template,
        url,
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            raise HTTPException(422, detail=f"yt-dlp failed: {result.stderr[:300]}")
    except subprocess.TimeoutExpired:
        raise HTTPException(422, detail="URL fetch timed out after 60 seconds")
    except FileNotFoundError:
        raise HTTPException(422, detail="yt-dlp is not installed on the server")

    downloaded = list(temp_dir.glob(f"{stem}.*"))
    if not downloaded:
        raise HTTPException(422, detail="yt-dlp produced no output file")

    media_file = downloaded[0]

    if media_file.suffix.lower() in VIDEO_EXTENSIONS:
        frame_path = temp_dir / f"{stem}_frame.jpg"
        # Try at 5 seconds, fall back to first frame
        for seek in ("5", "0"):
            ffmpeg_cmd = [
                "ffmpeg", "-ss", seek, "-i", str(media_file),
                "-frames:v", "1", "-q:v", "2",
                str(frame_path), "-y",
            ]
            subprocess.run(ffmpeg_cmd, capture_output=True, timeout=30)
            if frame_path.exists():
                break
        os.remove(media_file)
        if not frame_path.exists():
            raise HTTPException(422, detail="Could not extract a frame from the video")
        return frame_path

    return media_file
