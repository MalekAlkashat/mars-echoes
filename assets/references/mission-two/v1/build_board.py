"""Build compact, explicitly derived previews and an offline resource index."""
import hashlib
import html
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent
Image.MAX_IMAGE_PIXELS = 150_000_000
manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
previews = ROOT / "previews"
previews.mkdir(exist_ok=True)
derived = []
cards = []
tiles = []
for item in manifest["resources"]:
    if item.get("format") not in {"JPEG", "GIF", "PNG"}:
        continue
    # Display static posters. Open the original GIF deliberately to inspect motion.
    with Image.open(ROOT / item["file"]) as source:
        source.seek(0)
        image = source.convert("RGB")
        image.thumbnail((1800, 650) if item["id"] == "PIA07216" else (640, 440))
    name = item["id"] + ".jpg"
    image.save(previews / name, quality=90)
    data = (previews / name).read_bytes()
    derived.append({"file": "previews/" + name, "source": item["file"],
                    "transform": "RGB static first frame; aspect-preserving downsample; JPEG q90",
                    "width": image.width, "height": image.height,
                    "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    if not item["id"].startswith("dense-sand-") or item["id"] == "dense-sand-diff":
        tile = Image.new("RGB", (520, 440), "#14222b")
        thumb = ImageOps.contain(image, (500, 360))
        tile.paste(thumb, ((520-thumb.width)//2, 40+(360-thumb.height)//2))
        ImageDraw.Draw(tile).text((12, 12), item["id"] + ' | ' + item["title"][:53], fill="white")
        tiles.append(tile)
    e = html.escape
    cards.append(f'''<article><a href="{e(item['file'])}"><img src="previews/{name}" alt="{e(item['title'])}" loading="lazy"></a>
<div><p class="tag">{e(item['classification'])}</p><h2>{e(item['title'])}</h2>
<p>{e(item.get('capture', 'Material candidate; not historical evidence'))}</p>
<p>{e(item['use'])}</p><p class="limit">{e(item['limits'])}</p>
<p class="meta">{e(item.get('credit',''))} · {item['width']} × {item['height']} · {item['bytes'] / 1e6:.2f} MB</p>
<a href="{e(item['file'])}">Open original{' animation (77 frames; time-lapse)' if item.get('frames',1)>1 else ''}</a> · <a href="{e(item['pageUrl'])}">Official source</a></div></article>''')
sheet = Image.new("RGB", (1560, 440*((len(tiles)+2)//3)), "#0b151d")
for i, tile in enumerate(tiles):
    sheet.paste(tile, ((i%3)*520, (i//3)*440))
sheet.save(previews / "contact-sheet.jpg", quality=90)
data = (previews / "contact-sheet.jpg").read_bytes()
derived.append({"file":"previews/contact-sheet.jpg", "transform":"Labeled review montage of the static previews", "bytes":len(data), "sha256":hashlib.sha256(data).hexdigest()})
(ROOT / "preview-manifest.json").write_text(json.dumps(derived,indent=2)+"\n",encoding="utf-8")
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mission 2 · Purgatory resource pack</title><style>
*{box-sizing:border-box}body{margin:0;background:#0c151c;color:#e6eced;font:16px/1.6 system-ui,sans-serif}main{max-width:1240px;margin:auto;padding:28px 22px}h1{font-size:clamp(28px,5vw,48px);line-height:1.15}h2{font-size:21px;line-height:1.3;margin:.3em 0}.intro{max-width:850px;color:#bdcad0}a{color:#9bdce8}a:focus-visible{outline:3px solid #ffd18a;outline-offset:4px}article{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;background:#15232c;border:1px solid #30424e;border-radius:12px;padding:18px;margin:24px 0}article img{max-width:100%;max-height:460px;display:block;margin:auto}article>a{display:flex;align-items:center;justify-content:center}p{margin:.55em 0}.tag{color:#edbf8d;font-size:13px}.limit{color:#d5bfa9}.meta{color:#a7b8c1;font-size:13px}@media(max-width:700px){article{grid-template-columns:1fr}main{padding:18px 12px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style><main><p class="tag">ECHOES OF MARS / RESEARCH PACK / 14 NOVEMBER 2026</p>
<h1>Mission 2: Stuck in Purgatory</h1><p class="intro">Historical references for Opportunity's April–June 2005 sand entrapment. Start with the true-color panorama for palette, grayscale wheel views for contact and the time-lapse for slip behavior. All previews below are derived, reduced static posters; originals remain unchanged. No animation plays automatically.</p>
<p><a href="README.md">Pack guide</a> · <a href="SOURCE.md">Credits and rights</a> · <a href="manifest.json">Original file manifest</a> · <a href="sources/recovery-notes.md">Recovery and engineering notes</a></p>'''
(ROOT / "index.html").write_text(page+"\n".join(cards)+"</main></html>\n",encoding="utf-8")
print(f"Built {len(cards)} cards and static review sheet")
