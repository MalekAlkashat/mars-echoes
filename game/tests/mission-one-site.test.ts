import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Vector3,Group,InstancedMesh,SphereGeometry,MeshStandardMaterial,Matrix4} from 'three';
import {Vehicle} from '../src/entities/rover/controller.ts';
import {SITE,SLABS,slabRadius,siteObstacles} from '../src/scenes/episodes/rover/missions/blueberry-clue/site.ts';
import {sampleHeight} from '../src/scenes/episodes/rover/missions/blueberry-clue/surface.ts';
import {fieldRockGeometry,placeFieldRock} from '../src/scenes/episodes/rover/missions/blueberry-clue/field-rocks.ts';
import {reconstructionFrame} from '../src/scenes/episodes/rover/missions/blueberry-clue/water-state.ts';
import {createReconstruction} from '../src/scenes/episodes/rover/missions/blueberry-clue/reconstruction.ts';
const metadata=JSON.parse(readFileSync(new URL('../public/assets/opportunity/rig-metadata.json',import.meta.url),'utf8'));
const config={wheelPoints:metadata.wheels.map((w:{center:number[]})=>new Vector3(...w.center)),wheelRadius:Math.max(...metadata.wheels.map((w:{radius:number})=>w.radius)),suspensionTravel:.065,collisionRadius:Math.hypot(metadata.normalizedBounds.max[0]-metadata.normalizedBounds.min[0],metadata.normalizedBounds.max[2]-metadata.normalizedBounds.min[2])*.5};
const obstacles=siteObstacles();
test('major slab render footprints stay inside the matching navigation/camera obstacles',()=>{
 for(const [i,s] of SLABS.entries()){
  const g=fieldRockGeometry(i%6),p=g.getAttribute('position'),pose=placeFieldRock(s,i,g,sampleHeight),v=new Vector3();
  for(let j=0;j<p.count;j++){
   v.fromBufferAttribute(p,j).applyMatrix4(pose.matrix);
   assert.ok(Math.hypot(v.x-s.x,v.z-s.z)<slabRadius(s),s.id);
   if(p.getY(j)<.001)assert.ok(v.y<sampleHeight(v.x,v.z)-.02,`${s.id}: buried base`);
  }
  assert.equal(obstacles[i].x,s.x);assert.equal(obstacles[i].z,s.z);g.dispose();
 }
});
test('fresh and legacy approaches have the planned 5.5 m corridor; turning pocket stays open',()=>{
 for(const route of [[[4,7],[3,4],[1.5,1],[0,-.25]],[[0,7],[0,-.25]]]){
  for(let j=1;j<route.length;j++)for(let i=0;i<=100;i++){
   const t=i/100,x=route[j-1][0]*(1-t)+route[j][0]*t,z=route[j-1][1]*(1-t)+route[j][1]*t;
   assert.ok(obstacles.every(o=>Math.hypot(x-o.x,z-o.z)-o.radius>=2.75),'5.5 m route');
   const slope=Math.hypot((sampleHeight(x+.1,z)-sampleHeight(x-.1,z))/.2,(sampleHeight(x,z+.1)-sampleHeight(x,z-.1))/.2);
   assert.ok(slope<Math.tan(10*Math.PI/180),'route slope under 10 degrees');
  }
 }
 assert.ok(obstacles.every(o=>Math.hypot(3.5-o.x,3-o.z)-o.radius>=4),'8 m turning envelope');
});
test('actual rover contact configuration drives both starts, stops at solid rock and reverses',()=>{
 for(const [x,z,heading] of [[...SITE.spawn,SITE.heading],[0,7,0]]){
  const v=new Vehicle(config);v.reset(x,z,heading);v.settle(.25,sampleHeight);
  let reached=false;
  for(let i=0;i<600;i++){
   v.update(1/60,{forward:1,turn:0},obstacles,sampleHeight);
   if(Math.hypot(v.position.x-SITE.work[0],v.position.z-SITE.work[1])<2.4){reached=true;break;}
   assert.ok(v.grounded.every(Boolean),'six-wheel support on approach');
  }assert.ok(reached,'work trigger reachable');
 }
 const v=new Vehicle(config);v.reset(.1,1,0);v.settle(.25,sampleHeight);
 for(let i=0;i<480;i++){v.update(1/60,{forward:1,turn:0},obstacles,sampleHeight);assert.ok(obstacles.every(o=>Math.hypot(v.position.x-o.x,v.position.z-o.z)>=o.radius+config.collisionRadius-.001));}
 assert.ok(Math.abs(v.speed)<.05);const stop=v.position.z;
 for(let i=0;i<150;i++)v.update(1/60,{forward:-1,turn:0},obstacles,sampleHeight);
 assert.ok(v.position.z>stop+1,'can back away');
});
test('water timeline dries before the evidence transition and every interrupt clears its state',()=>{
 assert.equal(reconstructionFrame(true,0).wetness,0);
 assert.ok(reconstructionFrame(true,5).wetness>.9);
 assert.equal(reconstructionFrame(true,11.6).wetness,0);
 assert.equal(reconstructionFrame(true,11.6).stage,'exposure');
 for(let t=0;t<=12;t+=.1){const s=reconstructionFrame(false,t);assert.equal(s.wetness,0);assert.equal(s.stage,'dry');}
 assert.deepEqual(reconstructionFrame(true,1,true),reconstructionFrame(true,9,true),'reduced-motion tableau is stationary');
});
test('reconstruction retains opaque original grains without extra stones, and resets wet material',()=>{
 const parent=new Group(),rock=new MeshStandardMaterial(),sand=new MeshStandardMaterial(),material=new MeshStandardMaterial();
 const grains=new InstancedMesh(new SphereGeometry(1,8,6),material,150);for(let i=0;i<150;i++)grains.setMatrixAt(i,new Matrix4().makeTranslation(i*.001,.026,0));
 parent.add(grains);const r=createReconstruction(parent,rock,sand,grains),before=Float32Array.from(grains.instanceMatrix.array),color=material.color.clone(),roughness=material.roughness;
 for(const reduced of [false,true])for(const t of [0,2,4,6,8,10,11.6]){
  r.update(true,t,reduced);assert.deepEqual(grains.instanceMatrix.array,before);assert.equal(grains.visible,true);assert.equal(material.opacity,1);assert.equal(material.transparent,false);assert.equal(parent.children.length,1);
 }
 r.update(false,5,false);assert.deepEqual(material.color,color);assert.equal(material.roughness,roughness);
 grains.dispose();grains.geometry.dispose();material.dispose();rock.dispose();sand.dispose();
});
