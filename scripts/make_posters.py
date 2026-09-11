"""Extract first-frame JPG posters. Run with Walker's env (imageio-ffmpeg)."""
import json
from pathlib import Path
import subprocess
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1] / "dist"
data = json.loads((root / "content.json").read_text())
for entry in data["entries"]:
    clips = entry.get("videos", []) or ([{"src": entry["video"]}] if entry.get("video") else [])
    for clip in clips:
        source = (root / clip["src"]).resolve()
        assert source.is_relative_to((root / "media").resolve()) and source.suffix == ".mp4"
        poster = source.with_suffix(".jpg")
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
                        "-y", "-i", str(source), "-frames:v", "1", "-q:v", "2", str(poster)], check=True)
        print(f"Poster: {poster.name}")
