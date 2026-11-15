import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3 } from 'three';
import { MacroCamera } from '../src/scenes/episodes/rover/missions/blueberry-clue/macro-camera.ts';

test('tool withdrawal eases gaze as well as position; pause holds the exact viewing ray', () => {
  const camera=new PerspectiveCamera(), rig=new MacroCamera();
  const focus=new Vector3(-.045,.065,0), position=focus.clone().add(new Vector3(.17,.17,.23));
  rig.update(camera,position,focus,0,true);
  const before=camera.quaternion.clone();
  const nextFocus=new Vector3(-.045,.025,0),nextPosition=nextFocus.clone().add(new Vector3(.17,.17,.23));
  rig.update(camera,nextPosition,nextFocus,1/60,false);
  assert.ok(camera.quaternion.angleTo(before)<1e-6,'with equal shot offset, lowering the aim and position together preserves orientation');
  assert.ok(camera.position.distanceTo(nextPosition)>.03,'position must not jump to the next shot');
  camera.updateMatrixWorld(true);
  const paused=camera.matrixWorld.clone(), q=camera.quaternion.clone(), p=camera.position.clone();
  rig.update(camera,nextPosition,nextFocus,0,false);
  assert.ok(camera.position.equals(p));assert.ok(camera.quaternion.angleTo(q)<1e-6);
  camera.updateMatrixWorld(true);assert.ok(camera.matrixWorld.equals(paused));
});

test('macro reframing agrees at 30/60/120 Hz and repeated identical final shots have no boundary twitch', () => {
  const results=[30,60,120].map(hz=>{
    const camera=new PerspectiveCamera(),rig=new MacroCamera();
    rig.update(camera,new Vector3(.13,.195,.23),new Vector3(-.045,.065,0),0,true);
    for(let i=0;i<hz;i++)rig.update(camera,new Vector3(.17,.195,.23),new Vector3(0,.025,0),1/hz,false);
    const sample=camera.clone(),prior=camera.quaternion.clone();
    rig.update(camera,new Vector3(.17,.195,.23),new Vector3(0,.025,0),1/hz,false);
    assert.ok(camera.quaternion.angleTo(prior)<.001);
    return sample;
  });
  assert.ok(results[0].position.distanceTo(results[2].position)<.00001);
  assert.ok(results[0].quaternion.angleTo(results[2].quaternion)<.0001);
});
