"""Validate only explicitly public files. No robot imports or dependencies."""
import json
from pathlib import Path
import re
from datetime import date

root = Path(__file__).resolve().parents[1] / "dist"
data = json.loads((root / "content.json").read_text())
assert set(data) == {"hardware", "software", "specifications", "entries"}
for section in ("hardware", "software", "specifications"):
    assert isinstance(data[section], list) and all(isinstance(x, str) for x in data[section])
assert isinstance(data["entries"], list)
slugs = set()
for entry in data["entries"]:
    assert set(entry) <= {"slug", "date", "context", "title", "text", "video", "videos", "images"}
    for field in ("slug", "date", "context", "title", "text"):
        assert isinstance(entry[field], str) and entry[field].strip(), field
    assert re.fullmatch(r"[a-z0-9-]+", entry["slug"])
    assert entry["slug"] not in slugs
    slugs.add(entry["slug"])
    date.fromisoformat(entry["date"])
    assert isinstance(entry.get("images", []), list)
    for picture in entry.get("images", []):
        assert set(picture) == {"src", "caption"}
        assert isinstance(picture["caption"], str) and picture["caption"].strip()
        assert re.fullmatch(r"media/[a-zA-Z0-9_/-]+\.(png|jpg|webp)", picture["src"])
        assert (root / picture["src"]).is_file()
    for field in ("video",):
        assert isinstance(entry.get(field, ""), str)
    if entry.get("video"):
        assert re.fullmatch(r"media/[a-zA-Z0-9_/-]+\.mp4", entry["video"])
        assert (root / entry["video"]).is_file()
    assert not (entry.get("video") and entry.get("videos")), "Choose video or videos"
    assert isinstance(entry.get("videos", []), list)
    for clip in entry.get("videos", []):
        assert set(clip) == {"src", "caption"}
        assert isinstance(clip["caption"], str) and clip["caption"].strip()
        assert re.fullmatch(r"media/[a-zA-Z0-9_/-]+\.mp4", clip["src"])
        assert (root / clip["src"]).is_file()
        assert (root / clip["src"]).with_suffix(".jpg").is_file(), "Missing first-frame poster"
for file in root.rglob("*"):
    assert not file.is_symlink(), f"Symlink not allowed: {file}"
    if file.is_file():
        assert file.suffix in {".html", ".css", ".js", ".json", ".mp4", ".png", ".jpg", ".webp"}
        assert file.stat().st_size < 20 * 1024 * 1024, "Select a smaller public asset"
        if file.suffix in {".html", ".css", ".js", ".json"}:
            assert "/Users/" not in file.read_text(), "Local path in public content"
for name in ("index.html", "style.css", "app.js", "content.json"):
    assert (root / name).is_file()
print(f"PASS: {len(data['entries'])} public entries; public files checked (not a secrets audit).")
