import test from 'node:test';
import assert from 'node:assert/strict';
import {mapDistance,mapHeading,projectToMap} from '../src/ui/map-projection.ts';

const bounds={minX:-80,maxX:80,minZ:-80,maxZ:80};

test('north-up local map places the real spawn and Opportunity target on the correct terrain coordinates',()=>{
  assert.deepEqual(projectToMap([0,8],bounds),{x:.5,y:.55});
  assert.deepEqual(projectToMap([0,-25],bounds),{x:.5,y:.34375});
  assert.ok(projectToMap([0,-10],bounds).y<projectToMap([0,10],bounds).y,'north must be above south');
  assert.ok(projectToMap([10,0],bounds).x>projectToMap([-10,0],bounds).x,'east must be right of west');
  assert.equal(mapDistance([0,8],[0,-25]),33);
});

test('map boundary and distance preserve world scale with asymmetric bounds and no hidden marker clipping',()=>{
  const rectangle={minX:-20,maxX:60,minZ:-50,maxZ:30};
  assert.deepEqual(projectToMap([-20,-50],rectangle),{x:0,y:0});
  assert.deepEqual(projectToMap([60,30],rectangle),{x:1,y:1});
  assert.deepEqual(projectToMap([20,-10],rectangle),{x:.5,y:.5});
  assert.ok(projectToMap([80,30],rectangle).x>1,'outside points remain detectable rather than silently moving to the edge');
  assert.equal(mapDistance([1,2],[4,6]),5);
  assert.throws(()=>projectToMap([0,0],{...rectangle,maxX:-20}),RangeError);
  assert.throws(()=>projectToMap([NaN,0],rectangle),RangeError);
});

test('map heading agrees with the controller forward vector for north, west, south and east',()=>{
  for(const heading of [0,Math.PI/2,Math.PI,-Math.PI/2]){
    const rotation=mapHeading(heading)*Math.PI/180;
    assert.ok(Math.abs(Math.sin(rotation)-(-Math.sin(heading)))<1e-12);
    assert.ok(Math.abs(-Math.cos(rotation)-(-Math.cos(heading)))<1e-12);
  }
});
