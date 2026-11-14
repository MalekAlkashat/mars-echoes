"""Acquire the selected Mission 2 references. Run from any directory.

python acquire.py --download   # explicit network access, preserves existing bytes
python acquire.py --validate   # offline hashes/image decoding
No third-party code is downloaded or executed. Pillow is used for image validation.
"""
import argparse
import concurrent.futures
import hashlib
from html.parser import HTMLParser
import json
import time
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
ALLOWED = {"assets.science.nasa.gov", "www.jpl.nasa.gov", "science.nasa.gov",
           "www.nasa.gov", "api.polyhaven.com", "dl.polyhaven.org", "polyhaven.com"}


class ArticleText(HTMLParser):
    """Non-executable offline text; discard navigation, scripts and embedded data."""
    def __init__(self):
        super().__init__()
        self.hidden = 0
        self.parts = []
        self.started = False

    def handle_starttag(self, tag, attrs):
        if tag == "h1" and not self.started:
            self.parts = []
            self.started = True
        if tag in {"head", "script", "style", "nav", "header", "footer", "svg", "form"}:
            self.hidden += 1
        if not self.hidden and tag in {"p", "div", "h1", "h2", "h3", "li", "br"}:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in {"head", "script", "style", "nav", "header", "footer", "svg", "form"}:
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, value):
        if not self.hidden:
            self.parts.append(value)

    def article(self, title):
        text = "\n".join(" ".join(line.split()) for line in "".join(self.parts).splitlines() if line.strip())
        offset = text.lower().find(title.lower())
        if offset >= 0:
            text = text[offset:]
        for marker in ["Keep Exploring", "Related News", "Page Last Updated:", "Downloads\nThe Mars Report"]:
            text = text.split(marker)[0]
        return text.strip()


def fetch(url):
    if urlparse(url).scheme != "https" or urlparse(url).hostname not in ALLOWED:
        raise ValueError(f"Unapproved source: {url}")
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=45) as response:
                if urlparse(response.url).hostname not in ALLOWED:
                    raise ValueError(f"Unexpected redirect: {response.url}")
                data = response.read(30_000_001)
                if len(data) > 30_000_000:
                    raise ValueError("Resource exceeds the 30 MB per-file limit")
                return data, response.url, response.headers.get("Content-Type", "")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def inspect(path):
    data = path.read_bytes()
    result = {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    if path.suffix.lower() in {".jpg", ".png", ".gif", ".tif"}:
        from PIL import Image
        # The verified full NASA panorama is 136.68 MP; retain a bounded limit.
        Image.MAX_IMAGE_PIXELS = 150_000_000
        with Image.open(path) as img:
            result.update(width=img.width, height=img.height, format=img.format,
                          frames=getattr(img, "n_frames", 1))
            for frame in range(result["frames"]):
                img.seek(frame)
                img.load()
    elif path.suffix == ".json":
        json.loads(data)
    return result


def acquire(item):
    path = ROOT / item["file"]
    if not path.resolve().is_relative_to(ROOT):
        raise ValueError("Destination leaves resource pack")
    if path.exists() and not (item.get("kind") == "article-text" and not item.get("sha256")):
        actual = inspect(path)
        if item.get("sha256") and actual["sha256"] != item["sha256"]:
            raise ValueError(f"Existing source modified: {path.name}")
        return item | actual
    data, resolved, content_type = fetch(item["downloadUrl"])
    extra = {}
    if item.get("kind") == "article-text":
        extra["sourceHtmlSha256"] = hashlib.sha256(data).hexdigest()
        parser = ArticleText()
        parser.feed(data.decode("utf-8"))
        text = parser.article(item["title"])
        if len(text) < 120:
            raise ValueError(f"Article text missing: {item['id']}")
        data = (f"Source: {item['downloadUrl']}\nRetrieved: 2026-11-14\n"
                "Offline text extraction; navigation and scripts removed.\n\n" + text + "\n").encode("utf-8")
    if path.suffix.lower() in {".jpg", ".gif", ".png"} and "text/html" in content_type:
        raise ValueError(f"Image returned HTML: {path.name}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return item | inspect(path) | {"resolvedUrl": resolved, "contentType": content_type} | extra


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--download", action="store_true")
    parser.add_argument("--validate", action="store_true")
    args = parser.parse_args()
    path = ROOT / "manifest.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if args.download:
        failures = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            futures = {pool.submit(acquire, item): index for index, item in enumerate(manifest["resources"])}
            for future in concurrent.futures.as_completed(futures):
                index = futures[future]
                try:
                    manifest["resources"][index] = future.result()
                except Exception as error:
                    failures.append(manifest["resources"][index]["id"])
                    print(f"Failed {failures[-1]}: {error}")
        path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        if failures:
            raise RuntimeError(f"Acquisition incomplete: {', '.join(failures)}")
        print(f"Acquired {len(manifest['resources'])} resources")
    if args.validate:
        for item in manifest["resources"]:
            actual = inspect(ROOT / item["file"])
            for key in actual:
                if actual[key] != item[key]:
                    raise ValueError(f"{item['file']}: {key} mismatch")
        print(f"Validated {len(manifest['resources'])} resources; all hashes and image frames decode")
    if not args.download and not args.validate:
        parser.print_help()


if __name__ == "__main__":
    main()
