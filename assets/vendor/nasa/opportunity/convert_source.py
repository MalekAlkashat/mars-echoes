# Local conversion source for the exact user-supplied Opportunity model.
from pxr import Usd, UsdGeom, UsdShade, Gf
from pathlib import Path
import json,struct,zipfile,hashlib,math
SOURCE=Path('assets/vendor/nasa/opportunity/24883_MER_static.usdz')
OUT=Path('game/public/assets/opportunity');OUT.mkdir(parents=True,exist_ok=True)
stage=Usd.Stage.Open(str(SOURCE));scale=UsdGeom.GetStageMetersPerUnit(stage)
# Run from the repository root with Python 3.11+ and usd-core installed.
# Welded connectivity is used only to identify parts; exported source vertices,
# normals, UVs, triangle order and material membership are retained.
from collections import defaultdict
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == 'ce21bd6ed7763e1e5cc893a60b53b99e3c3de77e989b75b0da1a18ad5652bcab'
mesh_rows=[]
cache=UsdGeom.BBoxCache(Usd.TimeCode.Default(),['default','render'])
for prim in stage.Traverse():
 if prim.IsA(UsdGeom.Mesh):
  mesh=UsdGeom.Mesh(prim);box=cache.ComputeWorldBound(prim).ComputeAlignedBox();material=UsdShade.MaterialBindingAPI(prim).ComputeBoundMaterial()[0]
  mesh_rows.append({'path':str(prim.GetPath()),'bounds':[list(box.GetMin()),list(box.GetMax())],'material':str(material.GetPath())})
susp=stage.GetPrimAtPath('/Meshes/panels_right_front/Cube_000_prim4');sm=UsdGeom.Mesh(susp)
si=list(sm.GetFaceVertexIndicesAttr().Get());sx=UsdGeom.Xformable(susp).ComputeLocalToWorldTransform(0)
sw=[tuple(sx.Transform(v)*scale) for v in sm.GetPointsAttr().Get()]
parents=list(range(len(sw)));lookup={}
def find(a):
 while parents[a]!=a:parents[a]=parents[parents[a]];a=parents[a]
 return a
def union(a,b):parents[find(a)]=find(b)
for i,v in enumerate(sw):
 key=tuple(round(t,5) for t in v)
 if key in lookup:union(i,lookup[key])
 else:lookup[key]=i
for a,b,c in zip(si[::3],si[1::3],si[2::3]):union(a,b);union(a,c)
parts=defaultdict(list)
for i in range(len(si)//3):parts[find(si[i*3])].append(i)
components=[]
for faces in parts.values():
 used={j for f in faces for j in si[f*3:f*3+3]}
 lo=[min(sw[j][a] for j in used) for a in range(3)];hi=[max(sw[j][a] for j in used) for a in range(3)]
 components.append({'triangles':len(faces),'min':lo,'max':hi,'center':[(a+b)/2 for a,b in zip(lo,hi)],'faceIndices':faces})

ground=min(v['bounds'][0][1] for v in mesh_rows)*scale
blob=bytearray();g={'asset':{'version':'2.0','generator':'Project local OpenUSD conversion of user-supplied MER_static.usdz; geometry preserved'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'name':'Opportunity','children':[],'extras':{'source':'24883_MER_static.usdz','sourceUnits':'centimetres','normalizedUnits':'metres','up':'+Y','forward':'-Z'}}],'meshes':[],'materials':[],'images':[],'textures':[],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],'bufferViews':[],'accessors':[]}
def buffer(data,target=None):
 while len(blob)%4:blob.append(0)
 idx=len(g['bufferViews']);v={'buffer':0,'byteOffset':len(blob),'byteLength':len(data)}
 if target:v['target']=target
 g['bufferViews'].append(v);blob.extend(data);return idx
def accessor(values,size,component=5126):
 data=[v for vec in values for v in (vec if size>1 else [vec])]
 fmt='f' if component==5126 else 'I';view=buffer(struct.pack('<'+fmt*len(data),*data),34962 if component==5126 else 34963)
 a={'bufferView':view,'componentType':component,'count':len(values),'type':{1:'SCALAR',2:'VEC2',3:'VEC3'}[size]}
 if size==3:a.update(min=[min(v[i] for v in values) for i in range(size)],max=[max(v[i] for v in values) for i in range(size)])
 g['accessors'].append(a);return len(g['accessors'])-1
textures={};zipin=zipfile.ZipFile(SOURCE)
def texture(path):
 if path not in textures:
  data=zipin.read(path);i=len(g['images']);g['images'].append({'bufferView':buffer(data),'mimeType':'image/jpeg','name':path});g['textures'].append({'sampler':0,'source':i});textures[path]=i
 return textures[path]
matmap={}
for prim in stage.Traverse():
 if not prim.IsA(UsdShade.Material):continue
 shader=stage.GetPrimAtPath(str(prim.GetPath())+'/pbr_shader')
 def val(n,default):
  a=shader.GetAttribute('inputs:'+n);v=a.Get() if a else None
  return default if v is None else v
 def tex(n):
  a=shader.GetAttribute('inputs:'+n)
  if not a or not a.GetConnections():return None
  target=stage.GetPrimAtPath(str(a.GetConnections()[0]).split('.outputs:')[0]);f=target.GetAttribute('inputs:file').Get();return texture(f.path)
 m={'name':prim.GetName(),'pbrMetallicRoughness':{'metallicFactor':float(val('metallic',0)),'roughnessFactor':float(val('roughness',.5))},'doubleSided':True}
 base=tex('diffuseColor');normal=tex('normal');pbr=m['pbrMetallicRoughness']
 if base is not None:pbr['baseColorTexture']={'index':base}
 else:pbr['baseColorFactor']=[*map(float,val('diffuseColor',(1,1,1))),1]
 if normal is not None:m['normalTexture']={'index':normal}
 emissive=list(map(float,val('emissiveColor',(0,0,0))))
 if any(emissive):m['emissiveFactor']=emissive
 matmap[str(prim.GetPath())]=len(g['materials']);g['materials'].append(m)

def normalized(v):return [-float(v[0])*scale,float(v[1])*scale-ground,-float(v[2])*scale]
rig=[];wheel_face_sets={};wheel_candidates=[c for c in components if c['triangles']>700 and c['min'][1]<.01 and c['max'][1]<.27]
assert len(wheel_candidates)==6
for c in wheel_candidates:
 center=c['center'];row='front' if center[2]>.3 else 'rear' if center[2]<-.3 else 'middle';side='left' if center[0]>0 else 'right';name='wheel-'+side+'-'+row
 faces=set(c['faceIndices'])
 # The outer circular hub cap is disconnected from the tread mesh but shares its axle.
 for cap in components:
  if cap['triangles']==112 and abs(cap['center'][2]-center[2])<.003 and cap['center'][0]*center[0]>0 and abs(cap['center'][1]-center[1])<.003:
   faces.update(cap['faceIndices'])
 wheel_face_sets[name]=faces
 position=[-center[0],center[1]-ground,-center[2]];radius=(c['max'][1]-c['min'][1]+c['max'][2]-c['min'][2])/4
 rig.append({'name':name,'center':position,'radius':radius,'triangles':len(faces),'spinAxis':'+X','sourceTriangleComponent':c['triangles']})
rig.sort(key=lambda r:(0 if 'left' in r['name'] else 1,{'front':0,'middle':1,'rear':2}[r['name'].split('-')[-1]]))
rigmap={r['name']:r for r in rig}
tri_count=0
for row in mesh_rows:
 prim=stage.GetPrimAtPath(row['path']);m=UsdGeom.Mesh(prim);matrix=UsdGeom.Xformable(prim).ComputeLocalToWorldTransform(0);nm=matrix.GetInverse().GetTranspose()
 points=[normalized(matrix.Transform(p)) for p in m.GetPointsAttr().Get()]
 normals=[]
 for n in m.GetNormalsAttr().Get():
  w=nm.TransformDir(Gf.Vec3d(*n));a=Gf.Vec3d(-w[0],w[1],-w[2]);a.Normalize();normals.append(list(a))
 uvvar=UsdGeom.PrimvarsAPI(prim).GetPrimvar('st0');uvs=uvvar.Get() if uvvar else None
 if uvs:uvs=[[float(v[0]),1-float(v[1])] for v in uvs]
 indices=list(m.GetFaceVertexIndicesAttr().Get());assert set(m.GetFaceVertexCountsAttr().Get())=={3}
 groups={}
 if row['path'].endswith('prim4'):
  taken=set().union(*wheel_face_sets.values());groups={**wheel_face_sets,'suspension-body':set(range(len(indices)//3))-taken}
 else:groups={row['material'].split('/')[-1]:set(range(len(indices)//3))}
 for name,faces in groups.items():
  flat=[j for face in sorted(faces) for j in indices[face*3:face*3+3]];used=sorted(set(flat));remap={old:i for i,old in enumerate(used)}
  center=rigmap[name]['center'] if name in rigmap else [0,0,0]
  pos=[[points[i][a]-center[a] for a in range(3)] for i in used];attrs={'POSITION':accessor(pos,3),'NORMAL':accessor([normals[i] for i in used],3)}
  if uvs:attrs['TEXCOORD_0']=accessor([uvs[i] for i in used],2)
  primitive={'attributes':attrs,'indices':accessor([remap[i] for i in flat],1,5125),'material':matmap[row['material']]}
  mi=len(g['meshes']);g['meshes'].append({'name':name,'primitives':[primitive]});node={'name':name,'mesh':mi,'extras':{'sourcePrim':row['path'],'sourceTriangles':len(faces)}}
  if name in rigmap:node['translation']=center;node['extras']['wheelRadius']=rigmap[name]['radius']
  g['nodes'][0]['children'].append(len(g['nodes']));g['nodes'].append(node);tri_count+=len(faces)
g['buffers']=[{'byteLength':len(blob)}];raw=json.dumps(g,separators=(',',':')).encode();raw+=b' ' *((-len(raw))%4);blob+=b'\0' *((-len(blob))%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(raw)+8+len(blob))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(blob),0x004e4942)+blob
(OUT/'opportunity-v1.glb').write_bytes(result)
metadata={'source':'24883_MER_static.usdz','sourceSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'runtime':'opportunity-v1.glb','runtimeSha256':hashlib.sha256(result).hexdigest(),'sourceMetersPerUnit':scale,'sourceUpAxis':'Y','normalization':'world transforms baked; centimetres to metres; rotate Y pi so source +Z front becomes -Z; ground bottom shifted to0','groundShift':-ground,'triangles':tri_count,'materials':len(g['materials']),'textures':len(g['textures']),'runtimeBytes':len(result),'wheels':rig,'wheelOrder':[r['name'] for r in rig],'staticParts':[n['name'] for n in g['nodes'][1:] if not n['name'].startswith('wheel-')],'notes':['All315? triangles retained; count authoritative in triangles field.','Wheels and outer axle caps split by welded connectivity without changing vertices/normals/UVs; steering/suspension arms remain body geometry.','Material UV V inverted for glTF top-left image convention.','No damage, anthropomorphic eyes, or invented parts added.']}
metadata['notes'][0]='All source triangles retained exactly; no decimation.'
(OUT/'rig-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
Path('assets/vendor/nasa/opportunity/inspection.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata,indent=2))
