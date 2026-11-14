import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Euler, Quaternion, Raycaster, Vector3 } from 'three';
import { makeTerrain100, terrain100Height as height, TERRAIN_100 } from '../src/environments/mars/terrain-100.ts';
import { Vehicle } from '../src/entities/rover/controller.ts';
import { SpiritController } from '../src/entities/spirit/controller.ts';

const metadata=JSON.parse(readFileSync(new URL('../public/assets/opportunity/rig-metadata.json',import.meta.url),'utf8'));
const config={wheelRadius:metadata.wheels.reduce((s:number,w:{radius:number})=>s+w.radius,0)/6,
  wheelPoints:metadata.wheels.map((w:{center:number[]})=>new Vector3().fromArray(w.center)),suspensionTravel:.065,collisionRadius:1.18};

test('reference terrain is exactly100x100 and visible triangles agree with wheel heights',()=>{
  const meshes=makeTerrain100(),ground=meshes[0];ground.updateMatrixWorld(true);ground.geometry.computeBoundingBox();
  const bounds=ground.geometry.boundingBox!;
  assert.equal(bounds.max.x-bounds.min.x,100);assert.equal(bounds.max.z-bounds.min.z,100);
  const ray=new Raycaster(new Vector3(),new Vector3(0,-1,0));let error=0;
  for(let i=0;i<100;i++){
    const x=((i*17.329)%99)-49.5,z=((i*31.913)%99)-49.5;
    ray.ray.origin.set(x,100,z);const hit=ray.intersectObject(ground)[0];assert.ok(hit);
    error=Math.max(error,Math.abs(hit.point.y-height(x,z)));
  }
  assert.ok(error<2e-6);console.info('Reference100 maximum mesh/contact error',error);
  const edge=meshes[1].geometry.getAttribute('position');
  for(let i=0;i<800;i++)assert.ok(Math.abs(edge.getY(i)-height(edge.getX(i),edge.getZ(i)))<2e-6);
  const triangles=meshes.reduce((sum,m)=>sum+m.geometry.index!.count/3,0);assert.ok(triangles<100000);
  meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});
});

test('measured Opportunity contact geometry traverses both authored routes at30/60Hz',()=>{
  const routes=[TERRAIN_100.mainRoute,TERRAIN_100.sideRoute];
  for(const route of routes)for(const rate of [30,60]){
    const rover=new Vehicle(config,TERRAIN_100);rover.reset(route[0][0],route[0][1],0);rover.settle(.25,height);
    let target=1,minimumContacts=6,largestGap=0,maximumTilt=0;
    for(let frame=0;frame<rate*120&&target<route.length;frame++){
      const dx=route[target][0]-rover.position.x,dz=route[target][1]-rover.position.z;
      if(Math.hypot(dx,dz)<1.3){target++;continue;}
      const desired=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(desired-rover.heading),Math.cos(desired-rover.heading));
      rover.update(1/rate,{forward:Math.abs(delta)>.9?.2:1,turn:Math.max(-1,Math.min(1,delta*2.5))},[],height);
      minimumContacts=Math.min(minimumContacts,rover.grounded.filter(Boolean).length);
      maximumTilt=Math.max(maximumTilt,Math.abs(rover.pitch),Math.abs(rover.roll));
      assert.ok(rover.position.toArray().every(Number.isFinite));
      assert.ok(rover.wheelOffsets.every(v=>Math.abs(v)<=.065+1e-9));
      const rotation=new Quaternion().setFromEuler(new Euler(rover.pitch,rover.heading,rover.roll,'YXZ'));
      config.wheelPoints.forEach((point:Vector3,i:number)=>{
        const wheel=point.clone();wheel.y+=rover.wheelOffsets[i];wheel.applyQuaternion(rotation).add(rover.position);
        largestGap=Math.max(largestGap,Math.abs(wheel.y-config.wheelRadius-height(wheel.x,wheel.z)));
      });
    }
    assert.equal(target,route.length,'route must be reachable');assert.ok(minimumContacts>=4);
    assert.ok(largestGap<.045,`wheel gap ${largestGap}`);assert.ok(maximumTilt<.3);
    console.info('Reference100 route',route===routes[0]?'main':'side',rate,{minimumContacts,largestGap,maximumTilt});
  }
});

test('rover and spirit respect the100m square and rover can reverse out of rock contact',()=>{
  const rover=new Vehicle(config,TERRAIN_100),solid=[{x:0,z:25,radius:1}];
  rover.reset(0,36,0);rover.settle(.25,height);
  for(let i=0;i<600;i++)rover.update(1/60,{forward:1,turn:0},solid,height);
  assert.ok(rover.position.z>=27.18-1e-4);const stopped=rover.position.z;
  for(let i=0;i<180;i++)rover.update(1/60,{forward:-1,turn:0},solid,height);
  assert.ok(rover.position.z>stopped+2);
  rover.reset(100,-100,0);assert.ok(rover.position.x<=48.82&&rover.position.z>=-48.82);
  for(let i=0;i<2000;i++)rover.update(1/60,{forward:1,turn:0},[],height);
  assert.ok(rover.position.z>=-48.82-1e-8);
  const spirit=new SpiritController(TERRAIN_100);spirit.reset(80,-80,height);
  for(let i=0;i<120;i++)spirit.update(1/60,{moveX:1,moveY:1,leapPressed:i===0},0,[],height);
  assert.ok(spirit.position.x<=49.72&&spirit.position.z>=-49.72);
});
