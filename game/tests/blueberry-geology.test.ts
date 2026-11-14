import test from 'node:test';
import assert from 'node:assert/strict';
import {specimenGeometry,CUT_X,CUT_RADIUS,CUT_DEPTH} from '../src/scenes/episodes/rover/missions/blueberry-clue/geology.ts';
test('abrasion preserves the entire specimen except the 45.5 mm wide, 4.4 mm deep excavation',()=>{
 const original=specimenGeometry(),abraded=specimenGeometry(true),a=original.getAttribute('position'),b=abraded.getAttribute('position');
 assert.equal(a.count,b.count);assert.deepEqual(original.index!.array,abraded.index!.array);
 let changed=0;
 for(let i=0;i<a.count;i++){
  assert.equal(a.getX(i),b.getX(i));assert.equal(a.getZ(i),b.getZ(i));
  const depth=a.getY(i)-b.getY(i);
  if(Math.abs(depth)<1e-8)continue;
  changed++;assert.ok(Math.hypot(a.getX(i)-CUT_X,a.getZ(i))<=CUT_RADIUS+1e-8);assert.ok(Math.abs(depth-CUT_DEPTH)<1e-8);
 }
 assert.ok(changed>0);original.dispose();abraded.dispose();
});
