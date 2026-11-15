"""Restore macOS cloud placeholders from the current commit, with Git blob verification.
Run: python3 tools/restore_game_placeholders.py
Only tracked dataless files under game/src, game/public and game/tests are replaced.
Existing local files and untracked files are preserved. No dependencies required.
"""
import concurrent.futures,hashlib,os,subprocess,urllib.request,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1]
os.chdir(root)
sha=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
index={}
for entry in subprocess.check_output(['git','ls-files','--stage','-z']).split(b'\0'):
 if not entry:continue
 meta,name=entry.split(b'\t',1);index[name.decode()]=meta.split()[1].decode()
paths=[]
for folder in ['game/src','game/public','game/tests']:
 for p in Path(folder).rglob('*'):
  if p.is_file() and os.stat(p).st_flags&0x40000000 and str(p) in index:paths.append(p)
def restore(p):
 expected=index[str(p)]
 url='https://raw.githubusercontent.com/MalekAlkashat/mars-echoes/'+sha+'/'+urllib.parse.quote(str(p))
 data=urllib.request.urlopen(url,timeout=40).read()
 actual=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 if actual!=expected:raise RuntimeError('Hash mismatch: '+str(p))
 # A file edited or hydrated during download must not be overwritten.
 if not os.stat(p).st_flags&0x40000000:return 'already local'
 temp=p.with_name(p.name+'.recovered-tmp');temp.write_bytes(data);os.replace(temp,p)
 return str(p)
done=0
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
 for p,result in zip(paths,pool.map(lambda p:(p,restore(p)),paths)):
  done+=1
  if done%20==0:print('Restored',done,'/',len(paths),flush=True)
print('Verified and restored',done,'tracked game files at',sha,flush=True)
