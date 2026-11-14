import assert from 'node:assert/strict';
import test from 'node:test';
import {Vector3} from 'three';
import {SpiritCamera} from '../src/entities/spirit/camera.ts';
import {SpiritController} from '../src/entities/spirit/controller.ts';

Object.assign(globalThis,{innerWidth:1280,innerHeight:720});

test('first-person cuts to the spirit eye without chasing through its body and restores third-person framing',()=>{
  const camera=new SpiritCamera(),position=new Vector3(0,.28,8);
  camera.update(0,position,()=>0,[]);
  assert.ok(camera.camera.position.z>position.z+3);
  const distance=camera.distance,yaw=camera.yaw;
  camera.setFirstPerson(true);camera.update(1/60,position,()=>0,[]);
  assert.ok(camera.camera.position.distanceTo(new Vector3(0,1.36,8))<1e-8);
  assert.equal(camera.camera.fov,68);assert.equal(camera.camera.near,.06);
  camera.orbit(0,-1000,10000);camera.update(1/60,position,()=>0,[]);
  assert.ok(camera.camera.getWorldDirection(new Vector3()).y>.7,'first person can look up');
  assert.equal(camera.distance,distance,'zoom does not destroy the stored chase distance');
  camera.setFirstPerson(false);camera.update(1/60,position,()=>0,[]);
  assert.equal(camera.camera.fov,48);assert.equal(camera.camera.near,.1);assert.equal(camera.yaw,yaw);
  assert.ok(camera.camera.position.z>position.z+3,'return cuts to a valid external camera');
  assert.ok(camera.camera.position.y>=.35,'external camera stays above terrain');
});

test('first-person eye remains on the collision-constrained player during movement and leap',()=>{
  const controller=new SpiritController(),camera=new SpiritCamera(),height=()=>0;
  const solids=[{x:0,z:-1,radius:1}];
  controller.reset(0,2,height);camera.setFirstPerson(true);
  for(let i=0;i<180;i++){
    controller.update(1/60,{moveX:0,moveY:1,leapPressed:i===20},0,solids,height);
    camera.update(1/60,controller.position,height,solids);
    assert.ok(Math.abs(camera.camera.position.x-controller.position.x)<1e-8);
    assert.ok(Math.abs(camera.camera.position.z-controller.position.z)<1e-8);
    assert.ok(camera.camera.position.y>=height()+1.35,'eye never enters the ground');
    assert.ok(controller.position.z>0,'first-person movement does not phase through the boulder');
  }
  assert.equal(controller.grounded,true);
});
