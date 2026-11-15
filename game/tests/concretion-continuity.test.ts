import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Matrix4,Vector3} from 'three';
import {hubConcretionPlacements} from '../src/scenes/mars-hub/concretions.ts';
import {terrain100Height,TERRAIN_100} from '../src/environments/mars/terrain-100.ts';
import {createConcretionField} from '../src/environments/mars/concretions.ts';
import {addConcretions} from '../src/scenes/episodes/rover/missions/blueberry-clue/geology.ts';

test('hub grains are deterministic, separated, seated, and include the initial navigation foreground',()=>{
 const height=terrain100Height,a=hubConcretionPlacements(height),b=hubConcretionPlacements(height);
 assert.deepEqual(a,b);assert.equal(a.length,640);assert.equal(new Set(a.map(p=>p.id)).size,a.length);
 assert.equal(a.filter(p=>Math.abs(p.z-TERRAIN_100.spawn[1])<4&&Math.abs(p.x)<3).length,90);
 for(let i=0;i<a.length;i++){
  const p=a[i];assert.ok(p.y-p.r*p.sy<height(p.x,p.z));assert.ok(p.y+p.r*p.sy>height(p.x,p.z));
  for(let j=0;j<i;j++)assert.ok(Math.hypot(p.x-a[j].x,p.z-a[j].z)>p.r+a[j].r);
 }
 const batch=createConcretionField('test',a),pos=batch.geometry.getAttribute('position'),m=new Matrix4(),v=new Vector3();
 for(let i=0;i<batch.count;i++){
  batch.getMatrixAt(i,m);let below=0,above=0;
  for(let j=0;j<pos.count;j++){v.fromBufferAttribute(pos,j).applyMatrix4(m);if(v.y<height(v.x,v.z))below++;else above++;}
  assert.ok(below>0&&above>0,`grain ${i} must intersect actual terrain`);
 }
 batch.dispose();batch.geometry.dispose();(batch.material as {dispose():void}).dispose();
});

test('specimen arrangement survives a world-to-magnified reframe without regeneration',()=>{
 const parent=new Group(),a=addConcretions(parent),b=addConcretions(new Group()),before=Float32Array.from(a.instanceMatrix.array),id=a.uuid;
 assert.deepEqual(a.instanceMatrix.array,b.instanceMatrix.array);assert.equal(a.count,150);
 for(const p of [[0,0,-1.5],[30,2,0],[0,0,-1.5]]){parent.position.set(...p as [number,number,number]);parent.updateMatrixWorld(true);assert.equal(a.uuid,id);assert.deepEqual(a.instanceMatrix.array,before);assert.equal(a.visible,true);}
 for(const mesh of [a,b]){mesh.dispose();mesh.geometry.dispose();(mesh.material as {dispose():void}).dispose();}
});
