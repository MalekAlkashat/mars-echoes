import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { BufferAttribute, InstancedMesh, Mesh, MeshStandardMaterial, Raycaster, Scene, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { populateHubOutcrops, HUB_OUTCROPS, type RockKit } from '../src/environments/mars/hub-outcrops.ts';
import { hubHeight } from '../src/environments/mars/hub-terrain.ts';
import { SpiritController } from '../src/entities/spirit/controller.ts';
import { disposeSceneResources } from '../src/environments/mars/resources.ts';

const height = (x:number,z:number) => hubHeight(x,z,true);
async function fixture() {
  const bytes = await readFile(new URL('../public/assets/rocks/hub-kit-v1/rock-kit.glb', import.meta.url));
  const {scene:source} = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  const kit={} as RockKit;
  source.updateMatrixWorld(true);
  source.traverse(object=>{
    if (!(object instanceof Mesh)) return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    geometry.setAttribute('color',new BufferAttribute(new Float32Array(geometry.getAttribute('position').count*3).fill(1),3));
    kit[object.name as keyof RockKit]=geometry;
  });
  disposeSceneResources(source);
  const scene=new Scene(),stone=new MeshStandardMaterial();
  const obstacles:{x:number;z:number;radius:number}[]=[];
  const pieces=populateHubOutcrops(scene,obstacles,height,stone,kit);
  return {scene,stone,obstacles,pieces};
}

test('six outcrop sites share four batches and remain within the original +5000 triangle budget',async()=>{
  const {scene,stone,pieces}=await fixture();
  try {
    assert.equal(HUB_OUTCROPS.length,6);
    assert.equal(pieces.length,14);
    assert.equal(scene.children.length,4);
    for (const batch of scene.children) {
      assert.ok(batch instanceof InstancedMesh);
      assert.equal(batch.material,stone);
      assert.equal(batch.castShadow,batch.name!=='hub-outcrops-fragment');
    }
    const triangles=scene.userData.outcrops.triangles;
    assert.ok(triangles-6*80<=5000,`${triangles} exceeds the six-shelf replacement budget`);
    assert.equal(triangles,4278);
    assert.equal(new Set(pieces.map(p=>p.geometry)).size,4);
    for (const p of pieces) assert.equal(p.scale.x,p.scale.y);
    console.info(`Outcrops: ${triangles} triangles total; +${triangles-480} versus original shelves`);
  } finally {disposeSceneResources(scene);}
});

test('rotated underside contacts are buried and every blocking proxy sits on visible rock',async()=>{
  const {scene,obstacles,pieces}=await fixture();
  try {
    const point=new Vector3(),ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));
    const relief:number[]=[];
    for (const mesh of pieces) {
      const positions=mesh.geometry.getAttribute('position');
      let maximumRelief=-Infinity;
      const floor=mesh.geometry.boundingBox!.min.y;
      for (let i=0;i<positions.count;i++) {
        point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
        const gap=point.y-height(point.x,point.z);
        maximumRelief=Math.max(maximumRelief,gap);
        if(positions.getY(i)<floor+.002)assert.ok(gap<=-.06,`${mesh.name} has an exposed underside: ${gap}`);
        assert.ok(point.toArray().every(Number.isFinite));
      }
      relief.push(maximumRelief);
      if(mesh.userData.shape!=='fragment')assert.ok(maximumRelief>.4&&maximumRelief<1.6,`${mesh.name} relief ${maximumRelief}`);
      const own=obstacles.slice(mesh.userData.firstObstacle,mesh.userData.firstObstacle+mesh.userData.obstacleCount);
      for(const solid of own){
        ray.ray.origin.set(solid.x,100,solid.z);
        const hit=ray.intersectObject(mesh,false)[0];
        assert.ok(hit&&hit.point.y>height(solid.x,solid.z)+.22,'invisible collision zone');
      }
    }
    console.info(`Visible relief (m): ${relief.map(v=>v.toFixed(3)).join(', ')}; occupied columns: ${obstacles.length}`);
  } finally {disposeSceneResources(scene);}
});

test('primary and side routes remain open, and a leap cannot pass through any new outcrop',async()=>{
  const {scene,obstacles,pieces}=await fixture();
  try {
    const spirit=new SpiritController();
    spirit.reset(0,8,height);
    for(const [x,z] of [[0,-22.5],[-10,-14],[-10,8],[10,8],[12,-20],[12,-38],[0,-38]]){
      let reached=false;
      for(let i=0;i<900;i++){
        const dx=x-spirit.position.x,dz=z-spirit.position.z,d=Math.hypot(dx,dz);
        if(d<.3){reached=true;break;}
        spirit.update(1/60,{moveX:dx/d,moveY:-dz/d,leapPressed:i===20},0,obstacles,height);
      }
      assert.ok(reached,`blocked route ${x},${z}`);
    }
    for(const piece of pieces.slice(0,6)){
      const own=obstacles.slice(piece.userData.firstObstacle,piece.userData.firstObstacle+piece.userData.obstacleCount);
      assert.ok(own.length>0);
      const solid=own[Math.floor(own.length/2)];
      spirit.reset(solid.x,solid.z+3,height);
      for(let i=0;i<160;i++) {
        spirit.update(1/60,{moveX:0,moveY:1,leapPressed:i===30},0,obstacles,height);
        for(const column of own)assert.ok(Math.hypot(spirit.position.x-column.x,spirit.position.z-column.z)>=column.radius+.28-.03,
          `entered occupied rock column of ${piece.name} during traversal/leap`);
      }
      const distance=Math.hypot(spirit.position.x-solid.x,spirit.position.z-solid.z);
      assert.ok(distance>=solid.radius+.28-.03,`penetrated ${piece.name}`);
      const blocked=spirit.position.clone();
      for(let i=0;i<60;i++)spirit.update(1/60,{moveX:0,moveY:-1,leapPressed:false},0,obstacles,height);
      assert.ok(spirit.position.distanceTo(blocked)>1,`cannot back away from ${piece.name}`);
    }
  } finally {disposeSceneResources(scene);}
});
