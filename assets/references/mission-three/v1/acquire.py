"""Bounded public-source acquisition and reference-pack validation. No game writes."""
from __future__ import annotations
import argparse, concurrent.futures, gzip, hashlib, html, json, re, subprocess, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
MAIN = Path("C:/Nasa 2026/mars-echoes")
ALLOWED = {"science.nasa.gov","assets.science.nasa.gov","www.nasa.gov","www.jpl.nasa.gov",
           "photojournal.jpl.nasa.gov","ntrs.nasa.gov","www.uahirise.org","uahirise.org",
           "static.uahirise.org","hirise-pds.lpl.arizona.edu","d2pn8kiwq2w21t.cloudfront.net"}
LIMIT = 30 * 1024 * 1024

def dump(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def safe(relative):
    dest = (ROOT / relative).resolve()
    if not dest.is_relative_to(ROOT) or relative.startswith(("/", "\\")):
        raise ValueError("Destination outside pack")
    dest.parent.mkdir(parents=True, exist_ok=True)
    return dest

def git(*args):
    return subprocess.check_output(["git", "-C", str(MAIN), *args]).decode("utf-8").strip()

def snapshot():
    changed = git("diff", "HEAD", "--name-only").splitlines()
    untracked = git("ls-files", "--others", "--exclude-standard").splitlines()
    files = {}
    for rel in sorted(set(changed + untracked)):
        p = (MAIN / rel).resolve()
        if not p.is_relative_to(MAIN) or not p.is_file():
            continue
        files[rel] = {"sha256":digest(p), "bytes":p.stat().st_size}
    return {"head":git("rev-parse","HEAD"),"status":git("status","--porcelain=v1"),
            "index_diff_sha256":hashlib.sha256(subprocess.check_output(
                ["git","-C",str(MAIN),"diff","--cached","--binary"])).hexdigest(),
            "stashes":git("stash","list","--format=%H %s").splitlines(),"files":files}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ignore=0; self.main=0; self.parts=[]; self.mainparts=[]; self.links=[]; self.a=None
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag in ("script","style","noscript"): self.ignore+=1
        if tag in ("main","article"): self.main+=1
        if tag in ("p","h1","h2","h3","li","br","div"): self.parts.append("\n"); self.mainparts.append("\n")
        if tag=="a" and d.get("href"):
            self.a={"url":d["href"],"label":""}; self.links.append(self.a)
        if tag=="img":
            for key in ("src","data-src"):
                if d.get(key): self.links.append({"url":d[key],"label":d.get("alt",""),"kind":"image"})
    def handle_endtag(self,tag):
        if tag in ("script","style","noscript"): self.ignore=max(0,self.ignore-1)
        if tag in ("main","article"): self.main=max(0,self.main-1)
        if tag=="a": self.a=None
    def handle_data(self,data):
        if self.ignore:return
        self.parts.append(data)
        if self.main:self.mainparts.append(data)
        if self.a:self.a["label"]+=data
    def text(self):
        lines = [" ".join(l.split()) for l in "".join(self.mainparts if any(s.strip() for s in self.mainparts) else self.parts).splitlines()]
        return "\n".join(l for l in lines if l)

class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if urllib.parse.urlsplit(newurl).hostname not in ALLOWED:
            raise ValueError("Unapproved redirect: "+newurl)
        return super().redirect_request(req,fp,code,msg,headers,newurl)

def fetch(url, dest, expected=None):
    if urllib.parse.urlsplit(url).hostname not in ALLOWED:
        raise ValueError("Unapproved source host")
    if dest.exists():
        if expected and digest(dest)!=expected:raise ValueError("Existing original hash changed")
        return {"url":url,"path":dest.relative_to(ROOT).as_posix(),"sha256":digest(dest),
                "bytes":dest.stat().st_size,"cached":True}
    request=urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0 (public NASA reference research)","Accept-Encoding":"identity"})
    with urllib.request.build_opener(SafeRedirect()).open(request,timeout=30) as response:
        if int(response.headers.get("Content-Length","0"))>LIMIT:raise ValueError("Oversized resource")
        data=response.read(LIMIT+1)
        if len(data)>LIMIT:raise ValueError("Resource exceeds 30 MiB")
        ct=response.headers.get("Content-Type","")
        final=response.url
        encoding=response.headers.get('Content-Encoding','')
    if data.startswith(b'\x1f\x8b'): data=gzip.decompress(data)
    if dest.suffix.lower() in (".jpg",".jpeg",".png",".gif"):
        if "html" in ct or data.lstrip().lower().startswith(b"<!doctype"):raise ValueError("HTML masquerading as image")
        import io
        with Image.open(io.BytesIO(data)) as im: im.verify()
    elif dest.suffix==".pdf" and not data.startswith(b"%PDF"):raise ValueError("Not a PDF")
    elif dest.suffix==".html" and b"<html" not in data.lower():raise ValueError('Not HTML: '+ct+' '+encoding+' '+repr(data[:60]))
    if expected and hashlib.sha256(data).hexdigest()!=expected:raise ValueError("Remote hash changed")
    dest.write_bytes(data)
    return {"url":url,"resolved_url":final,"content_type":ct,"path":dest.relative_to(ROOT).as_posix(),
            "sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),"acquired_utc":datetime.now(timezone.utc).isoformat()}

def pages():
    sources=json.loads((ROOT/"sources.json").read_text(encoding="utf-8"))["sources"]
    def one(s):
        if s.get('offline_mode')=='web_read_link_only': return dict(s,status='web_read_link_only')
        try:
            receipt=fetch(s["url"],safe("sources/"+s["id"]+".html"),s.get('sha256'))
            parser=Page();parser.feed(safe(receipt["path"]).read_text(encoding="utf-8",errors="replace"))
            safe("sources/"+s["id"]+".txt").write_text(s["title"]+"\n"+s["url"]+"\n\n"+parser.text()+"\n",encoding="utf-8")
            links=[]
            for link in parser.links:
                item=dict(link);item["url"]=urllib.parse.urljoin(s["url"],item["url"]);links.append(item)
            return dict(s,status="acquired",receipt=receipt,links=links)
        except Exception as e:return dict(s,status="failed",error=type(e).__name__+": "+str(e))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: output=list(pool.map(one,sources))
    dump(ROOT/"source-receipts.json",output)
    for s in output: print(s["id"],s["status"], s.get("error",""))
    return output

def assets():
    manifest=json.loads((ROOT/"manifest.json").read_text(encoding="utf-8"))
    output=[]
    for a in manifest["resources"]:
        if a.get("acquisition")!="download":continue
        try:
            receipt=fetch(a["download_url"],safe(a["path"]),a.get("sha256"))
            if Path(a["path"]).suffix in (".jpg",".png",".gif"):
                with Image.open(safe(a["path"])) as im:
                    receipt.update(format=im.format,dimensions=list(im.size),frames=getattr(im,"n_frames",1))
                    im.load()
            output.append(dict(id=a["id"],status="acquired",**receipt));print(a["id"],"acquired",receipt["bytes"])
        except Exception as e:
            output.append(dict(id=a["id"],status="failed",error=type(e).__name__+": "+str(e)));print(a["id"],"FAILED",str(e))
        dump(ROOT/"asset-receipts.json",output)
    return output

def validate():
    errors=[];checked=0
    for name in ("source-receipts.json","asset-receipts.json"):
        f=ROOT/name
        if not f.exists():continue
        for row in json.loads(f.read_text(encoding="utf-8")):
            if row['status']=='web_read_link_only':continue
            if row["status"]!="acquired":errors.append(row.get("id","unknown")+" acquisition failed");continue
            r=row.get("receipt",row);p=safe(r["path"])
            if digest(p)!=r["sha256"] or p.stat().st_size!=r["bytes"]:errors.append(str(p)+" hash/size mismatch")
            if p.suffix in (".jpg",".png",".gif"):
                with Image.open(p) as im:im.verify()
            checked+=1
    derivative_count=0
    mf=ROOT/'manifest.json'
    if mf.exists():
        manifest=json.loads(mf.read_text(encoding='utf-8'))
        for d in manifest.get('derivatives',[]):
            file=safe(d['path'])
            if digest(file)!=d['sha256'] or file.stat().st_size!=d['bytes']:errors.append(d['path']+' derivative mismatch')
            with Image.open(file) as im:im.verify()
            derivative_count+=1
    source_ids={s['id'] for s in json.loads((ROOT/'sources.json').read_text(encoding='utf-8'))['sources']}
    claims=json.loads((ROOT/'claims.json').read_text(encoding='utf-8'))['claims']
    if len({c['id'] for c in claims})!=len(claims):errors.append('Duplicate claim IDs')
    for c in claims:
        if c['status']=='verified' and not c['evidence']:errors.append(c['id']+' missing evidence')
        for e in c['evidence']:
            if e['source_id'] not in source_ids or not e['locator']:errors.append(c['id']+' invalid locator')
    out={"checked":checked,"derivatives_checked":derivative_count,"claims_checked":len(claims),"errors":errors,"passed":not errors,"checked_utc":datetime.now(timezone.utc).isoformat()}
    dump(ROOT/"validation.json",out);print(json.dumps(out))
    return not errors

if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--pages",action="store_true");p.add_argument("--assets",action="store_true")
    p.add_argument("--validate",action="store_true");p.add_argument("--snapshot-main",action="store_true");p.add_argument("--check-main",action="store_true")
    a=p.parse_args()
    if a.snapshot_main:
        if (ROOT/"preservation-before.json").exists():raise SystemExit("Baseline already exists")
        dump(ROOT/"preservation-before.json",snapshot());print("Main preservation baseline saved")
    if a.pages:pages()
    if a.assets:assets()
    if a.validate and not validate():raise SystemExit(1)
    if a.check_main:
        before=json.loads((ROOT/"preservation-before.json").read_text(encoding="utf-8"));after=snapshot()
        result={"head_unchanged":before["head"]==after["head"],"index_unchanged":before["index_diff_sha256"]==after["index_diff_sha256"],
                "stashes_unchanged":before["stashes"]==after["stashes"],"status_unchanged":before["status"]==after["status"],
                "protected_files":len(before["files"]),"changed_or_missing":[r for r,v in before["files"].items() if after["files"].get(r)!=v]}
        dump(ROOT/"preservation.json",result);print(json.dumps(result))

