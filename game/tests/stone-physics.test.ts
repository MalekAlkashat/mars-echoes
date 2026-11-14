import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { BoxGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { RockSurface } from '../src/core/rock-surface.ts';
import { Vehicle } from '../src/entities/rover/controller.ts';
import type { RoverContactConfig } from '../src/entities/rover/grounding.ts';

const metadata=JSON.parse(readFileSync(new URL('../public/assets/opportunity/rig-metadata.json',import.meta.url),'utf8'));
const config:RoverContactConfig={wheelPoints:metadata.wheels.map((wheel:{center:number[]})=>new Vector3(...wheel.center)),
  wheelRadius:Math.max(...metadata.wheels.map((wheel:{radius:number})=>wheel.radius)),suspensionTravel:.065,collisionRadius:1.4};
const flat=()=>0;
function stone(height:number,width=1.8,depth=1.4){
  const surface=new RockSurface(flat);
  const mesh=new Mesh(new BoxGeometry(width,height,depth),new MeshBasicMaterial());
  mesh.position.y=height/2;mesh.updateMatrixWorld(true);surface.add(mesh);
  mesh.geometry.dispose();mesh.material.dispose();
  return surface;
}
function cross(rate:number){
  const surface=stone(.085),car=new Vehicle(config,undefined,surface);
  car.reset(0,2.5,0);car.settle(.25,flat);
  let peak=0,maxOffset=0,unloaded=false,maxBodyStep=0,maxWheelStep=0;
  for(let i=0;i<rate*8;i++){
    const oldY=car.position.y,oldOffsets=[...car.wheelOffsets];
    car.update(1/rate,{forward:1,turn:0},[{x:0,z:0,radius:.9,kind:'rock'}],flat);
    maxBodyStep=Math.max(maxBodyStep,Math.abs(car.position.y-oldY));
    maxWheelStep=Math.max(maxWheelStep,...car.wheelOffsets.map((v,j)=>Math.abs(v-oldOffsets[j])));
    peak=Math.max(peak,car.position.y);
    maxOffset=Math.max(maxOffset,...car.wheelOffsets.map(Math.abs));
    unloaded ||= car.grounded.some(value=>!value);
    assert.ok(Number.isFinite(car.position.y));
  }
  return {car,peak,maxOffset,unloaded,maxBodyStep,maxWheelStep};
}

test('low-step loading and unloading remain continuous at gameplay frame rates',()=>{
  const result=cross(60);
  assert.ok(result.maxBodyStep<.006,'body movement must not snap by centimetres in one frame');
  assert.ok(result.maxWheelStep<.015,'suspension must progressively load and release');
});

test('Opportunity climbs a low stone rather than hitting its old keep-out proxy',()=>{
  const {car,peak,maxOffset}=cross(60);
  assert.ok(car.position.z < -3,'rover crosses the actual rock footprint');
  assert.ok(peak>.025,'wheel support must raise the chassis');
  assert.ok(maxOffset<=config.suspensionTravel+1e-8);
  for(let i=0;i<180;i++)car.settle(1/60,flat);
  assert.ok(Math.abs(car.position.y)<.002);
  assert.ok(car.grounded.every(Boolean));
});

test('low-stone traversal agrees at 30, 60 and 120 Hz',()=>{
  const routes=[30,60,120].map(cross);
  assert.ok(routes[0].car.position.distanceTo(routes[2].car.position)<.03);
  assert.ok(Math.abs(routes[0].peak-routes[2].peak)<.02);
});

test('a tall stone blocks the tyres, does not accumulate travel, and allows reversing away',()=>{
  const surface=stone(.6),car=new Vehicle(config,undefined,surface);
  car.reset(0,2.5,0);car.settle(.25,flat);
  for(let i=0;i<240;i++)car.update(1/60,{forward:1,turn:0},[],flat);
  const stop=car.position.clone(),travel=car.movedDistance;
  assert.ok(stop.z>1.3,'tyres stop outside the tall ledge');
  for(let i=0;i<120;i++)car.update(1/60,{forward:1,turn:0},[],flat);
  assert.ok(car.position.distanceTo(stop)<.002);
  assert.ok(car.movedDistance-travel<.002);
  for(let i=0;i<180;i++)car.update(1/60,{forward:-1,turn:0},[],flat);
  assert.ok(car.position.z>stop.z+2);
});

test('a narrow rock between the wheels is stopped by belly clearance',()=>{
  const surface=stone(.35,.3,.3),car=new Vehicle(config,undefined,surface);
  car.reset(0,2,0);car.settle(.25,flat);
  for(let i=0;i<180;i++)car.update(1/60,{forward:1,turn:0},[],flat);
  assert.ok(car.position.z>.4);
  assert.ok(car.position.z<1.2,'belly contact, not an oversized circular keep-out');
});

test('pivoting cannot rotate a tyre through a tall stone and turning away remains possible',()=>{
  const surface=new RockSurface(flat),mesh=new Mesh(new BoxGeometry(.25,.6,.35),new MeshBasicMaterial());
  mesh.position.set(-.9,.3,-.6);mesh.updateMatrixWorld(true);surface.add(mesh);
  const car=new Vehicle(config,undefined,surface);car.reset(0,0,0);car.settle(.25,flat);
  for(let i=0;i<180;i++)car.update(1/60,{forward:0,turn:1},[],flat);
  assert.ok(car.heading>.1&&car.heading<.6,`the outer tyre stops before rotating into the rock: ${car.heading}, y=${car.position.y}`);
  assert.ok(Math.abs(car.position.y)<.01,'a pivot must not lift the rover onto a tall stone');
  const blocked=car.heading;
  for(let i=0;i<180;i++)car.update(1/60,{forward:0,turn:-1},[],flat);
  assert.ok(car.heading<blocked-.4);
  mesh.geometry.dispose();mesh.material.dispose();
});

test('baking transformed rock instances gives independent contacts and clears cleanly',()=>{
  const surface=new RockSurface(flat),mesh=new InstancedMesh(new BoxGeometry(.5,.08,.5),new MeshBasicMaterial(),2);
  const a=new Matrix4().makeTranslation(-2,.04,0),b=new Matrix4().makeTranslation(2,.04,0);
  mesh.setMatrixAt(0,a);mesh.setMatrixAt(1,b);mesh.name='hub-instanced-scattered-bedrock';
  surface.bake(mesh);
  assert.ok(Math.abs(surface.height(-2,0)-.08)<1e-6);
  assert.ok(Math.abs(surface.height(2,0)-.08)<1e-6);
  assert.equal(surface.height(0,0),0);
  const cells=surface.cells;assert.ok(cells>0&&cells<1000);
  surface.clear();assert.equal(surface.cells,0);assert.equal(surface.height(2,0),0);
  mesh.geometry.dispose();mesh.material.dispose();mesh.dispose();
});
