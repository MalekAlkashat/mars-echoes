"""Build labeled static previews and an offline, dependency-free catalog."""
import hashlib, html, json, textwrap
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
manifest=json.loads((ROOT/"manifest.json").read_text(encoding="utf-8"))
receipts={r["id"]:r for r in json.loads((ROOT/"asset-receipts.json").read_text()) if r["status"]=="acquired"}
sources={s["id"]:s for s in json.loads((ROOT/"sources.json").read_text(encoding="utf-8"))["sources"]}
font=ImageFont.truetype("C:/Windows/Fonts/arial.ttf",19)
small=ImageFont.truetype("C:/Windows/Fonts/arial.ttf",15)
board=Image.new("RGB",(1680,1110),"#171b20");draw=ImageDraw.Draw(board)
cards=[];derivatives=[]
for i,r in enumerate(manifest["resources"]):
    rec=receipts[r["id"]]
    r.update({k:rec[k] for k in ("bytes","sha256","format","dimensions","frames") if k in rec})
    if r["id"]=="M3-R10":
        r["limits"]="PDF text read via web tool: p.4 section II.A and pp.5–7 atmospheric effects/conclusion; figure captions checked. PDF screenshot requests returned cache misses, so no graphical plot inspection is claimed."
        r["pages"]=8
    p=ROOT/r["path"]
    if p.suffix.lower()==".pdf":continue
    with Image.open(p) as im:
        thumb=im.convert("RGB");thumb.thumbnail((1000,650),Image.Resampling.LANCZOS)
        out=ROOT/"previews"/(r["id"]+".jpg");out.parent.mkdir(exist_ok=True)
        thumb.save(out,quality=90)
        r["preview"]=out.relative_to(ROOT).as_posix()
        derivatives.append({"path":r["preview"],"source":r["path"],"transform":"RGB conversion and aspect-preserving downsample only; no crop, enhancement or generative fill","dimensions":list(thumb.size),"sha256":sha(out),"bytes":out.stat().st_size})
        tile=thumb.copy();tile.thumbnail((530,250),Image.Resampling.LANCZOS)
        col=i%3;row=i//3;x=col*560;y=row*370
        draw.rectangle((x+8,y+8,x+552,y+360),fill="#232930")
        board.paste(tile,(x+15+(530-tile.width)//2,y+16+(250-tile.height)//2))
        draw.text((x+20,y+270),r["id"]+"  "+str(im.width)+" x "+str(im.height),font=font,fill="#efbc86")
        for j,line in enumerate(textwrap.wrap(r["title"],width=52)[:2]):
            draw.text((x+20,y+299+j*20),line,font=small,fill="#f3f0ea")
    esc=html.escape
    r['processing']='Publisher-provided orbital color product; natural-color calibration not established' if r['id'] in ('M3-R06','M3-R07') else r['category']
    badge="SIMULATION" if "simulation" in r["category"] else "OBSERVATION" if "observation" in r["category"] else "CHART / MAP"
    cards.append(f"""<article><div class="badge">{esc(badge)} · {esc(r['id'])}</div><a href="{esc(r['path'])}"><img loading="lazy" src="{esc(r['preview'])}" alt="{esc(r['title'])}"></a><h2>{esc(r['title'])}</h2><p class="meta">{r.get('dimensions')} · {r['bytes']:,} bytes · {esc(r['priority'])}</p><p>{esc(r['use'])}</p><p class="warning">{esc(r['limits'])}</p><dl><dt>Observation</dt><dd>{esc(r['observation'])}</dd><dt>Publication</dt><dd>{esc(r['publication'])}</dd><dt>Credit</dt><dd>{esc(r['credit'])}</dd></dl><p><a href="{esc(r['path'])}">Original file</a> · <a href="{esc(r['landing_page'])}">Primary source</a></p></article>""")
board.save(ROOT/"previews"/"contact-sheet.jpg",quality=93)
derivatives.append({"path":"previews/contact-sheet.jpg","transform":"Labeled contact sheet; originals unchanged","sha256":sha(ROOT/"previews"/"contact-sheet.jpg"),"bytes":(ROOT/"previews"/"contact-sheet.jpg").stat().st_size,"dimensions":list(board.size)})
manifest["derivatives"]=derivatives
manifest["resources"][-1]["body_review"]="Text read; figure screenshots unavailable."
dump(ROOT/"manifest.json",manifest)
source_links="\n".join(f'<li><a href="sources/{sid}.txt">{html.escape(s["title"])}</a></li>' if (ROOT/"sources"/(sid+".txt")).exists() else f'<li>{html.escape(s["title"])} — <a href="{html.escape(s["url"])}">link only</a></li>' for sid,s in sources.items())
page="""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Long Night · Mission 3 research</title><style>
*{box-sizing:border-box}body{margin:0;background:#15191e;color:#eeeae3;font:16px/1.55 system-ui,sans-serif}main{max-width:1240px;margin:auto;padding:36px 24px 64px}header{max-width:900px;margin-bottom:32px}h1{font-size:clamp(30px,6vw,54px);line-height:1.1;margin:10px 0 20px}h2{font-size:20px;line-height:1.3}a{color:#efbc86;overflow-wrap:anywhere}a:focus{outline:3px solid #fff;outline-offset:3px}.eyebrow,.badge{color:#efbc86;letter-spacing:.09em;font-size:12px;font-weight:700}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}article,aside,details{background:#232930;border:1px solid #3c434b;border-radius:12px;padding:20px;min-width:0}article img{width:100%;height:235px;object-fit:contain;background:#0d1014;margin-top:14px;display:block}.meta,dt{color:#bdbbb8;font-size:13px}.warning{border-left:3px solid #c99967;padding-left:12px;font-size:14px}dt{margin-top:8px}dd{margin:0;overflow-wrap:anywhere}aside{margin:24px 0}details{margin-top:24px}li{margin:8px 0}footer{margin-top:28px;color:#bdbbb8}@media(max-width:650px){main{padding:24px 16px}.grid{grid-template-columns:1fr}article img{height:210px}article{padding:16px}}
</style><main><header><div class="eyebrow">ECHOES OF MARS · PRIMARY-SOURCE REFERENCE PACK</div><h1>Mission 3: The Long Night</h1><p>Nine image/chart originals, one research paper and a checked evidence ledger. These are research references; no gameplay is implemented here.</p><p><a href="README.md">Start here</a> · <a href="../../../../outputs/planning/mission-three-research.md">Research and production handoff</a> · <a href="claims.json">39 claims</a> · <a href="manifest.json">Files, hashes and rights</a></p></header>
<aside><strong>Read the image labels carefully.</strong> Last transmitted ≠ last taken ≠ final panorama. PIA22521 is a simulation. PIA22929 contains missing data. The final-site true-color JPEG is only 900 × 201; it is suitable for overview color relationships, not microscopic detail or a game skybox. No archival image has been completed or enhanced.</aside><div class="grid">"""+ "\n".join(cards)+"""</div><aside><h2>Atmospheric research paper</h2><p><a href="papers/20190027303.pdf">Smith &amp; Guzewich, The Mars Global Dust Storm of 2018</a> · NASA Goddard / ICES 2019 · 8 pages. Text reviewed; PDF figure screenshots could not be retrieved. Curiosity and orbital curves must not be relabeled Opportunity telemetry.</p></aside><details><summary>Primary-source records and acquisition limits</summary><p>19 pages are retained offline. Five additional pages were read through the web tool; their direct HTTP responses were empty, so those remain link-only. See <a href="source-notes.md">source access notes</a>.</p><ul>"""+source_links+"""</ul></details><footer>Prepared 15 November 2026. NASA/partner credits accompany each item. HiRISE and NTRS have item-specific public-use statements; other NASA media follow NASA guidance and exact credits. No NASA endorsement or blanket CC0 license is implied. <a href="SOURCE.md">Rights and transformations</a>.</footer></main></html>"""
(ROOT/"index.html").write_text(page,encoding="utf-8")
print("Built 9 previews, labeled contact sheet and offline catalog")

