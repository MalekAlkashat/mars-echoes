"""Create a geometry-only runtime copy; retain the textured candidate and source scan."""
from pathlib import Path
import json, struct, hashlib
root=Path(__file__).resolve().parents[4]
source=root/'game/public/assets/rocks/boulder-01-preview/boulder-01.glb'
target=source.with_name('boulder-01-shape.glb')
raw=source.read_bytes()
json_length=struct.unpack_from('<I',raw,12)[0]
doc=json.loads(raw[20:20+json_length])
binary_start=20+json_length+8
binary=raw[binary_start:]
used=sorted({a['bufferView'] for a in doc['accessors'] if 'bufferView' in a})
assert all('sparse' not in a for a in doc['accessors']), 'Sparse attributes need separate handling'
new_binary=bytearray(); views=[]; mapping={}
for old_index in used:
 view=doc['bufferViews'][old_index].copy()
 start=view.get('byteOffset',0); payload=binary[start:start+view['byteLength']]
 mapping[old_index]=len(views)
 view['byteOffset']=len(new_binary); view['buffer']=0
 new_binary.extend(payload); new_binary.extend(b'\0'*((-len(new_binary))%4)); views.append(view)
for accessor in doc['accessors']:
 if 'bufferView' in accessor: accessor['bufferView']=mapping[accessor['bufferView']]
for mesh in doc['meshes']:
 for primitive in mesh['primitives']: primitive.pop('material',None)
for key in ['images','textures','materials','samplers']: doc.pop(key,None)
doc['bufferViews']=views; doc['buffers']=[{'byteLength':len(new_binary)}]
encoded=json.dumps(doc,separators=(',',':')).encode(); encoded+=b' '*((-len(encoded))%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(new_binary))
result+=struct.pack('<II',len(encoded),0x4e4f534a)+encoded
result+=struct.pack('<II',len(new_binary),0x004e4942)+new_binary
target.write_bytes(result)
print({'file':str(target),'bytes':len(result),'sha256':hashlib.sha256(result).hexdigest()})
