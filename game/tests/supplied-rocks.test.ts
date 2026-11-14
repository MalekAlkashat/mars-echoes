import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BufferGeometry,InstancedMesh,Matrix4,Mesh,Scene,Texture,Raycaster,Vector3,SRGBColorSpace} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {populateSuppliedRocks,suppliedRockMaterial} from '../src/environments/mars/supplied-rocks.ts';
import type {RockKit} from '../src/environments/mars/hub-outcrops.ts';
import {hubHeight} from '../src/environments/mars/hub-terrain.ts';
import {SpiritController} from '../src/entities/spirit/controller.ts';
import {disposeSceneResources} from '../src/environments/mars/resources.ts';

async function fixture(){
  const data=await readFile(new URL('../public/assets/rocks/user-mars-v1/mars-rocks.glb',import.meta.url));
  const source=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
  const kit={} as RockKit;
  source.scene.traverse(node=>{if(node instanceof Mesh)kit[node.name as keyof RockKit]=node.geometry.clone();});
  disposeSceneResources(source.scene);
  return kit;
}
test('supplied runtime kit preserves four UV-mapped source shapes within the geometry budget',async()=>{
  const kit=await fixture();
  try{
    assert.deepEqual(Object.keys(kit).sort(),['block','fragment','ridge','slab']);
    let triangles=0;
    for(const geometry of Object.values(kit)){
      assert.equal(geometry.attributes.uv.count,geometry.attributes.position.count);
      const positions=geometry.attributes.position;
      for(let i=0;i<positions.count;i++)assert.ok([positions.getX(i),positions.getY(i),positions.getZ(i)].every(Number.isFinite));
      geometry.computeBoundingBox();assert.ok(Math.abs(geometry.boundingBox!.min.y)<1e-5);
      triangles+=(geometry.index?.count??positions.count)/3;
    }
    assert.ok(triangles<1500,`unexpected kit cost ${triangles}`);
  }finally{Object.values(kit).forEach(g=>g.dispose());}
});
test('supplied rocks retain open exploration routes and collision only over visible outcrop',async()=>{
  const kit=await fixture(),scene=new Scene(),obstacles:Array<{x:number;z:number;radius:number}>=[];
  const height=(x:number,z:number)=>hubHeight(x,z,true);
  const material=suppliedRockMaterial(new Texture(),new Texture());
  try{
    populateSuppliedRocks(scene,obstacles,height,kit,material,[]);
    scene.updateMatrixWorld(true);
    const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
    for(const solid of obstacles){
      ray.ray.origin.set(solid.x,100,solid.z);
      const hit=ray.intersectObjects(scene.children.filter(mesh=>mesh.name.startsWith('hub-outcrops-')),false)
        .find(hit=>hit.point.y>height(solid.x,solid.z)+.20);
      assert.ok(hit,`invisible obstacle at ${solid.x},${solid.z}`);
    }
    const spirit=new SpiritController();spirit.reset(0,8,height);
    for(const [x,z] of [[0,-22.5],[-10,-14],[-10,8],[10,8],[12,-20],[12,-38],[0,-38]]){
      let reached=false;
      for(let i=0;i<1000;i++){
        const dx=x-spirit.position.x,dz=z-spirit.position.z,d=Math.hypot(dx,dz);
        if(d<.3){reached=true;break;}
        spirit.update(1/60,{moveX:dx/d,moveY:-dz/d,leapPressed:i===20},0,obstacles,height);
        assert.ok(spirit.position.y>=height(spirit.position.x,spirit.position.z)+.28-1e-6);
      }
      assert.ok(reached,`supplied rocks block route ${x},${z}`);
    }
  }finally{disposeSceneResources(scene);}
});
test('supplied rock material interprets source color and DirectX normals correctly',()=>{
  const color=new Texture(),normal=new Texture(),material=suppliedRockMaterial(color,normal);
  assert.equal(color.colorSpace,SRGBColorSpace);assert.ok(material.normalScale.y<0);
  assert.equal(material.map,color);assert.equal(material.normalMap,normal);assert.ok(material.roughness>.9);
  material.dispose();color.dispose();normal.dispose();
});
test('supplied scatter mixes half-metre stones with two-metre boulders and visible collision',async()=>{
  const kit=await fixture(),scene=new Scene(),obstacles:Array<{x:number;z:number;radius:number}>=[];
  const height=(x:number,z:number)=>hubHeight(x,z,true);
  const material=suppliedRockMaterial(new Texture(),new Texture());
  const scatter=Array.from({length:72},(_,i)=>({x:18+(i%9)*3,z:18+Math.floor(i/9)*3,size:.8,yaw:i*.73}));
  try{
    populateSuppliedRocks(scene,obstacles,height,kit,material,scatter);scene.updateMatrixWorld(true);
    assert.equal(scene.userData.suppliedRocks.scatter,36);
    const batches=scene.children.filter((mesh):mesh is InstancedMesh=>mesh instanceof InstancedMesh&&mesh.name.startsWith('supplied-mars-scatter'));
    const matrix=new Matrix4(),scale=new Vector3(),diameters:number[]=[];
    for(const batch of batches){
      batch.geometry.computeBoundingBox();const extent=batch.geometry.boundingBox!.getSize(new Vector3());
      for(let i=0;i<batch.count;i++){
        batch.getMatrixAt(i,matrix);scale.setFromMatrixScale(matrix);
        diameters.push(Math.max(extent.x*scale.x,extent.z*scale.z));
      }
    }
    assert.ok(diameters.filter(diameter=>diameter>=.4&&diameter<=.7).length>=20,'half-metre stones were lost');
    assert.ok(diameters.filter(diameter=>diameter>=1.7&&diameter<=2.3).length>=2,'missing two-metre boulders');
    assert.ok(diameters.filter(diameter=>diameter>=1.7).length<diameters.length*.2,'all scatter was enlarged');
    const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
    const scatterObstacles=obstacles.filter(solid=>solid.x>16&&solid.z>16);
    assert.ok(scatterObstacles.length>20,'large scatter boulders have no occupied collision columns');
    for(const solid of scatterObstacles){
      ray.ray.origin.set(solid.x,100,solid.z);
      const hit=ray.intersectObjects(batches,false)[0];
      assert.ok(hit&&hit.point.y>height(solid.x,solid.z)+.20,`invisible scatter proxy at ${solid.x},${solid.z}`);
    }
    assert.equal(scene.userData.suppliedRocks.sizes.diameters.length,diameters.length);
    assert.ok(scene.userData.suppliedRocks.sizes.halfMetre>=20);
    assert.ok(scene.userData.suppliedRocks.sizes.boulders>=2);
  }finally{disposeSceneResources(scene);}
});

test('loose gravel is dense, patchy, source-textured and cheap enough to stay unshadowed',async()=>{
  const kit=await fixture(),scene=new Scene(),obstacles:Array<{x:number;z:number;radius:number}>=[];
  const material=suppliedRockMaterial(new Texture(),new Texture());
  try{
    populateSuppliedRocks(scene,obstacles,()=>0,kit,material,[]);scene.updateMatrixWorld(true);
    const gravel=scene.children.filter((mesh):mesh is InstancedMesh=>mesh instanceof InstancedMesh&&mesh.name.startsWith('supplied-mars-gravel-'));
    assert.equal(gravel.length,4);
    let count=0,triangles=0,smallest=Infinity,largest=0;
    const matrix=new Matrix4(),scale=new Vector3(),position=new Vector3();
    const cells=new Map<string,number>();
    for(const batch of gravel){
      assert.equal(batch.castShadow,false);assert.equal(batch.receiveShadow,true);assert.equal(batch.material,material);
      const geometry=batch.geometry,positions=geometry.getAttribute('position');
      assert.equal(geometry.getAttribute('uv').count,positions.count);
      assert.equal(geometry.getAttribute('rockGroundPlane').count,batch.count);
      const cost=(geometry.index?.count??positions.count)/3;
      assert.ok(cost<=8,`small gravel costs ${cost} triangles per chip`);
      triangles+=cost*batch.count;count+=batch.count;
      for(let i=0;i<batch.count;i++){
        batch.getMatrixAt(i,matrix);scale.setFromMatrixScale(matrix);position.setFromMatrixPosition(matrix);
        smallest=Math.min(smallest,scale.x);largest=Math.max(largest,scale.x);
        assert.ok(Math.hypot(position.x,position.z-8)>=.85,'gravel intrudes on spawn');
        assert.ok(Math.hypot(position.x,position.z+25)>=1.65,'gravel intrudes on rover entrance');
        const key=`${Math.floor(position.x/8)},${Math.floor(position.z/8)}`;
        cells.set(key,(cells.get(key)??0)+1);
      }
    }
    assert.ok(count>7000&&count<14000,`unexpected gravel population ${count}`);
    assert.ok(triangles<100000,`gravel triangle cost ${triangles}`);
    assert.ok(smallest>=.0299&&smallest<.04&&largest>.17&&largest<=.1801,'gravel lost its 3–18 cm range');
    const interiorCounts=[...cells].filter(([key])=>{const [x,z]=key.split(',').map(Number);return Math.hypot(x*8+4,z*8+4)<50;}).map(([,n])=>n);
    assert.ok(Math.max(...interiorCounts)>Math.min(...interiorCounts)*1.8,'deposits became an even grid');
    // Only authored outcrops block the controller; 3–18 cm gravel is passable dressing.
    const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
    const outcrops=scene.children.filter(mesh=>mesh.name.startsWith('hub-outcrops-'));
    for(const solid of obstacles){
      ray.ray.origin.set(solid.x,100,solid.z);
      assert.ok(ray.intersectObjects(outcrops,false).some(hit=>hit.point.y>.20),'tiny gravel created a blocker');
    }
    assert.equal(scene.userData.suppliedRocks.gravel.count,count);
    assert.equal(scene.userData.suppliedRocks.gravel.triangles,triangles);
  }finally{disposeSceneResources(scene);}
});

test('scatter and gravel dispose their instances, geometries and shared texture material once',async()=>{
  const kit=await fixture(),scene=new Scene(),material=suppliedRockMaterial(new Texture(),new Texture());
  populateSuppliedRocks(scene,[],()=>0,kit,material,[{x:20,z:20,size:.8,yaw:0}]);
  const resources=new Map<{addEventListener:(type:string,listener:()=>void)=>void},number>();
  const observe=(resource:Mesh['geometry']|Mesh['material']|Texture|InstancedMesh)=>{
    if(Array.isArray(resource)||resources.has(resource))return;
    resources.set(resource,0);resource.addEventListener('dispose',()=>resources.set(resource,resources.get(resource)!+1));
  };
  scene.traverse(node=>{if(node instanceof Mesh){observe(node.geometry);observe(node.material);}if(node instanceof InstancedMesh)observe(node);});
  observe(material.map!);observe(material.normalMap!);
  disposeSceneResources(scene);
  assert.equal(scene.children.length,0);
  for(const count of resources.values())assert.equal(count,1,'a scene-owned render resource leaked or was disposed twice');
});
