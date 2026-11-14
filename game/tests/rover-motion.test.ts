import assert from 'node:assert/strict';
import test from 'node:test';
import { Euler, Quaternion } from 'three';
import { Vehicle, type Obstacle } from '../src/entities/rover/controller.ts';
import { WHEEL_POINTS, WHEEL_RADIUS, SUSPENSION_TRAVEL } from '../src/entities/rover/grounding.ts';

const flat = () => 0;
type DriveInput = { forward:number; turn:number };
function drive(vehicle:Vehicle, seconds:number, input:DriveInput, options:{
  height?:(x:number,z:number)=>number; obstacles?:readonly Obstacle[]; hz?:number;
} = {}):void {
  const {height=flat,obstacles=[],hz=120}=options;
  for(let frame=0;frame<Math.round(seconds*hz);frame++)vehicle.update(1/hz,input,obstacles,height);
}

test('rover accelerates progressively, stops within its braking envelope, and reverses', t=>{
  const rover=new Vehicle();rover.reset(0,10,0);
  drive(rover,.2,{forward:1,turn:0});
  const earlySpeed=rover.speed;
  assert.ok(earlySpeed>0&&earlySpeed<.5,'acceleration should not jump to cruising speed');
  drive(rover,2.5,{forward:1,turn:0});
  assert.ok(rover.speed>2.4&&rover.speed<=2.5,'forward speed should reach its bounded cruise');
  const startDistance=rover.movedDistance;
  drive(rover,1.2,{forward:0,turn:0});
  const brakingDistance=rover.movedDistance-startDistance;
  assert.equal(rover.speed,0);
  assert.ok(brakingDistance>1.05&&brakingDistance<1.16,`unexpected braking distance ${brakingDistance}`);
  drive(rover,2,{forward:-1,turn:0});
  assert.ok(rover.speed< -1.1&&rover.speed>= -1.2,'reverse should have a separate bounded speed');
  t.diagnostic(`Braking distance: ${brakingDistance.toFixed(6)} m`);
});

test('a curved driving route agrees at 30 Hz and 120 Hz', t=>{
  const low=new Vehicle();const high=new Vehicle();
  low.reset(0,10,0);high.reset(0,10,0);
  drive(low,4,{forward:1,turn:.5},{hz:30});
  drive(high,4,{forward:1,turn:.5},{hz:120});
  const difference=low.position.distanceTo(high.position);
  assert.ok(difference<.04,`frame-rate dependent route differs by ${difference} m`);
  assert.ok(Math.abs(low.heading-high.heading)<.02);
  t.diagnostic(`30/120 Hz route difference: ${difference.toFixed(6)} m`);
});

test('six physical wheel bottoms settle onto sloped terrain and unsupported travel is bounded', t=>{
  const height=(x:number,z:number)=>1.3+x*.12-z*.18;
  const rover=new Vehicle();rover.reset(2,1,.47);rover.settle(0,height);
  for(let frame=0;frame<120;frame++)rover.settle(1/120,height);
  const orientation=new Quaternion().setFromEuler(new Euler(rover.pitch,rover.heading,rover.roll,'YXZ'));
  const gaps=WHEEL_POINTS.map((point,index)=>{
    const wheel=point.clone();wheel.y+=rover.wheelOffsets[index];
    wheel.applyQuaternion(orientation).add(rover.position);
    return Math.abs(wheel.y-WHEEL_RADIUS-height(wheel.x,wheel.z));
  });
  assert.ok(Math.max(...gaps)<.001,`wheel contact gap ${Math.max(...gaps)} m`);
  assert.equal(rover.grounded.length,6);
  assert.ok(rover.grounded.every(Boolean));
  const atRest=rover.position.clone();
  for(let frame=0;frame<240;frame++)rover.settle(1/120,height);
  assert.ok(rover.position.distanceTo(atRest)<1e-5,'resting suspension must not drift');
  const discontinuity=(x:number,z:number)=>x<-.3&&z<-.3?.8:0;
  rover.reset(0,0,0);rover.settle(0,discontinuity);
  assert.ok(rover.wheelOffsets.every(offset=>Math.abs(offset)<=SUSPENSION_TRAVEL+1e-6));
  assert.ok(rover.grounded.some(grounded=>!grounded),'terrain outside suspension reach must not report full contact');
  t.diagnostic(`Maximum settled wheel gap: ${Math.max(...gaps)} m`);
});

test('collision blocks traversal without tire-path accumulation, then allows reverse and pivot escape', t=>{
  const rover=new Vehicle();rover.reset(0,0,0);
  const obstacles=[{x:0,z:-3,radius:.8}];
  let peakImpact=0;
  for(let frame=0;frame<360;frame++){
    rover.update(1/120,{forward:1,turn:0},obstacles,flat);
    peakImpact=Math.max(peakImpact,rover.impact);
    assert.ok(Math.hypot(rover.position.x,rover.position.z+3)>=1.55-.0005,'body must stay outside solid collision');
  }
  const blockedDistance=rover.movedDistance;
  const blockedWheelPaths=[...rover.wheelTravel];
  drive(rover,1,{forward:1,turn:0},{obstacles});
  const drift=rover.movedDistance-blockedDistance;
  const wheelPath=Math.max(...rover.wheelTravel.map((distance,index)=>Math.abs(distance-blockedWheelPaths[index])));
  assert.ok(drift<.003,`blocked body drifted ${drift} m`);
  assert.ok(wheelPath<.003,`blocked wheel paths accumulated ${wheelPath} m`);
  assert.ok(Math.abs(rover.speed)<.03);
  assert.ok(peakImpact>.2,'the impact should remain available for visual response');
  const blockedZ=rover.position.z;
  drive(rover,1,{forward:-1,turn:0},{obstacles});
  assert.ok(rover.position.z>blockedZ+.3,'reverse should release the blocked rover');
  const oldHeading=rover.heading;
  drive(rover,1.5,{forward:0,turn:1},{obstacles});
  assert.ok(Math.abs(rover.heading-oldHeading)>.25,'stationary steering should permit a pivot escape');
  t.diagnostic(`Blocked drift: ${drift} m; blocked wheel-path change: ${wheelPath} m`);
});
