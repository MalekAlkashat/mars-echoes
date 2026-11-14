import bpy, bmesh, json, os
root='C:/Nasa 2026/mars-echoes'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=root+'/assets/vendor/polyhaven/boulder_01/boulder_01_1k.gltf')
report=[]
for obj in list(bpy.context.scene.objects):
    if obj.type!='MESH': continue
    before=sum(len(p.vertices)-2 for p in obj.data.polygons)
    bm=bmesh.new();bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=0.00001)
    bm.to_mesh(obj.data);bm.free()
    modifier=obj.modifiers.new('Preview budget, preserve broad fractures','DECIMATE')
    modifier.ratio=min(1,1200/before)
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    after=sum(len(p.vertices)-2 for p in obj.data.polygons)
    report.append(dict(name=obj.name,before=before,after=after,dimensions=list(obj.dimensions)))
out=root+'/game/public/assets/rocks/boulder-01-preview'
os.makedirs(out,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=out+'/boulder-01.glb',export_format='GLB',export_image_format='AUTO',export_texcoords=True,export_normals=True)
open(root+'/work/terrain-polish/rock-export.json','w').write(json.dumps(report,indent=2))
print(report)
