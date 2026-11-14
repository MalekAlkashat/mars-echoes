"""Offline fracture cuts of the preserved CC0 scan; no runtime deformation or textures."""
import bpy,bmesh,json,os,hashlib
from mathutils import Vector,Matrix
root='C:/Nasa 2026/mars-echoes'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=root+'/assets/vendor/polyhaven/boulder_01/boulder_01_1k.gltf')
source=next(o for o in bpy.context.scene.objects if o.type=='MESH')
source.data.transform(source.matrix_world);source.matrix_world=Matrix.Identity(4)
bm=bmesh.new();bm.from_mesh(source.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bm.to_mesh(source.data);bm.free()
lo=Vector([min(v.co[i] for v in source.data.vertices) for i in range(3)])
hi=Vector([max(v.co[i] for v in source.data.vertices) for i in range(3)])
size=hi-lo
print('Source bounds',list(lo),list(hi))
# Each cut keeps a different coherent piece of the scan, with a planar fracture cap.
variants=[('ridge',700,[( (0,0,1),(.5,.5,.10),False)]),
 ('slab',540,[((0,0,1),(.5,.5,.52),False),((0,1,.12),(.5,.80,.5),True)]),
 ('block',420,[((1,.15,0),(.48,.5,.5),False),((0,1,0),(.5,.78,.5),True),((0,0,1),(.5,.5,.10),False)]),
 ('fragment',120,[((1,0,0),(.52,.5,.5),True),((0,1,0),(.5,.54,.5),False),((0,0,1),(.5,.5,.28),False)])]
objects=[];report=[]
for name,target,cuts in variants:
 mesh=source.data.copy();obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
 bm=bmesh.new();bm.from_mesh(mesh)
 for normal,fraction,clear_outer in cuts:
  point=lo+Vector([size[i]*fraction[i] for i in range(3)]);normal=Vector(normal).normalized()
  result=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.00001,plane_co=point,plane_no=normal,clear_inner=not clear_outer,clear_outer=clear_outer)
  edges=[e for e in result['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_boundary]
  if edges:bmesh.ops.holes_fill(bm,edges=edges,sides=0)
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(mesh);bm.free();mesh.validate(verbose=True,clean_customdata=True)
 before=sum(len(p.vertices)-2 for p in mesh.polygons)
 bpy.context.view_layer.objects.active=obj
 mod=obj.modifiers.new('Preserve silhouette within kit budget','DECIMATE');mod.ratio=min(1,target/max(1,before))
 bpy.ops.object.modifier_apply(modifier=mod.name)
 mesh=obj.data;mesh.validate(verbose=True,clean_customdata=True);mesh.materials.clear()
 # Origin at footprint centre and underside, metres; GLB exports Blender Z-up to game Y-up.
 low=Vector([min(v.co[i] for v in mesh.vertices) for i in range(3)])
 high=Vector([max(v.co[i] for v in mesh.vertices) for i in range(3)])
 offset=Vector([(low.x+high.x)/2,(low.y+high.y)/2,low.z])
 for v in mesh.vertices:v.co-=offset
 obj.location=(0,0,0);objects.append(obj)
 report.append({'name':name,'triangles':sum(len(p.vertices)-2 for p in mesh.polygons),'sizeBlender':list(high-low)})
bpy.ops.object.select_all(action='DESELECT')
for o in objects:o.select_set(True)
out=root+'/game/public/assets/rocks/hub-kit-v1/rock-kit.glb'
bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_materials='NONE',export_texcoords=False,export_normals=True)
report={'source':'boulder_01','variants':report,'bytes':os.path.getsize(out),'sha256':hashlib.sha256(open(out,'rb').read()).hexdigest()}
open(root+'/game/public/assets/rocks/hub-kit-v1/manifest.json','w').write(json.dumps(report,indent=2))
print(json.dumps(report))
