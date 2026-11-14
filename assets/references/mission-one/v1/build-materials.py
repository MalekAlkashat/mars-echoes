from pathlib import Path
import numpy as np
from PIL import Image
import hashlib,json
p=Path('game/public/assets/missions/blueberry-clue/v1');p.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(4912);n=2048
for kind,base in [('laminated-rock',(157,141,119)),('fine-sand',(115,94,74))]:
 grain=rng.random((n,n)).astype(np.float32)
 coarse=np.asarray(Image.fromarray((rng.random((64,64))*255).astype('uint8')).resize((n,n),Image.Resampling.BICUBIC),dtype=np.float32)/255
 medium=np.asarray(Image.fromarray((rng.random((256,256))*255).astype('uint8')).resize((n,n),Image.Resampling.BICUBIC),dtype=np.float32)/255
 h=grain*.28+medium*.47+coarse*.25
 if kind=='laminated-rock':
  y,x=np.mgrid[:n,:n]; layers=np.sin(y*.11+np.sin(x*.006)*1.4+coarse*3)*.5+.5
  h=h*.9+layers*.10
  # Sparse small sheltered pits derive both colour and micro-normal relief.
  for _ in range(600):
   px,py=rng.integers(12,n-12,2); rx,ry=rng.integers(2,9,2)
   xx,yy=np.meshgrid(np.arange(-rx,rx+1),np.arange(-ry,ry+1))
   dent=np.maximum(0,1-(xx/rx)**2-(yy/ry)**2)*.24
   h[py-ry:py+ry+1,px-rx:px+rx+1]-=dent
 color=np.clip(np.array(base)[None,None,:]*(.87+h[:,:,None]*.26),0,255).astype('uint8')
 Image.fromarray(color).save(p/(kind+'-color.jpg'),quality=93)
 dy,dx=np.gradient(h); v=np.stack((-dx*1.5,-dy*1.5,np.ones_like(h)),axis=2);v/=np.linalg.norm(v,axis=2)[:,:,None]
 Image.fromarray(np.clip((v*.5+.5)*255,0,255).astype('uint8')).save(p/(kind+'-normal.png'))
 Image.fromarray(np.clip((.8+h*.18)*255,0,255).astype('uint8')).save(p/(kind+'-roughness.jpg'),quality=90)
manifest={'type':'authored procedural reconstruction, not NASA scan','seed':4912,'resolution':2048,'tileWidthMeters':.3,'normalConvention':'OpenGL +Y','colorSpace':'base color sRGB; normal and roughness linear','sources':['PIA05634 palette/layout','PIA18885 structure only'],'files':[]}
for f in p.iterdir():
 if f.suffix in ['.jpg','.png']:manifest['files'].append({'file':f.name,'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})
(p/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Authored six 2K material maps')
