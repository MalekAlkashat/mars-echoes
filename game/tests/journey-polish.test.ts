import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {ReturnShot,RETURN_REVEAL_SECONDS} from '../src/scenes/mars-hub/return-shot.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import {GameSession} from '../src/app/session.ts';
import type {GameScene,SceneEntry} from '../src/app/contracts.ts';

test('return shot separates the actual subjects and ends at the exact saved lens and pose',()=>{
  for(const reduced of [false,true])for(const narrow of [false,true]){
    const camera=new PerspectiveCamera(48,narrow?390/844:1.6,.1,1600);
    const spirit=new Vector3(0,.28,-22.9),wreck=new Vector3(0,0,-25);
    camera.position.set(0,1.72,-17.1);camera.lookAt(0,.63,-22.9);camera.updateMatrixWorld();
    const before={p:camera.position.clone(),q:camera.quaternion.clone(),fov:camera.fov,zoom:camera.zoom,near:camera.near,far:camera.far};
    const shot=new ReturnShot(camera,spirit,wreck,()=>0);
    shot.apply(.7,reduced,narrow);
    const s=spirit.clone().add(new Vector3(0,.35,0)).project(camera),w=wreck.clone().add(new Vector3(0,.65,0)).project(camera);
    assert.ok(Math.abs(s.x-w.x)>.2,'spirit and rover centers must separate in the reveal');
    for(let time=0;time<RETURN_REVEAL_SECONDS;time+=1/60){shot.apply(time,reduced,narrow);assert.ok(camera.position.y>=.4);}
    shot.apply(RETURN_REVEAL_SECONDS,reduced,narrow);
    assert.deepEqual(camera.position,before.p);assert.ok(camera.quaternion.angleTo(before.q)<1e-7);
    assert.equal(camera.fov,before.fov);assert.equal(camera.zoom,before.zoom);assert.equal(camera.near,before.near);assert.equal(camera.far,before.far);assert.equal(camera.view?.enabled??false,false);
    assert.deepEqual(spirit.toArray(),[0,.28,-22.9]);assert.deepEqual(wreck.toArray(),[0,0,-25]);
  }
});

function pendingHarness(){
  const states:{preparing:boolean;paused:boolean;disposed:boolean}[]=[];
  let release!:()=>void,fail=false;
  const gate=new Promise<void>(resolve=>release=resolve);
  const director=new SceneDirector({session:new GameSession(),create:async(entry:SceneEntry)=>{
    if(states.length){await gate;if(fail)throw Error('injected preparation failure');}
    const state={preparing:false,paused:false,disposed:false};states.push(state);
    return {id:entry.scene,scene:{},camera:{},effects:{time:0,degraded:0},activate(){},update(){},resize(){},restart(){},debug(){return {};},setPaused(v:boolean){state.paused=v;},setPreparing(v:boolean){state.preparing=v;},dispose(){state.disposed=true;}} as GameScene;
  },hooks:{switch(){},loading(){},error(){},clearInput(){}}});
  return {director,states,release:()=>release(),fail:()=>fail=true};
}
test('user pause during preparation survives destination activation',async()=>{
  const h=pendingHarness();await h.director.open({scene:'mars-hub'});
  const pending=h.director.open({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
  assert.equal(h.states[0].preparing,true);h.director.setPaused(true);h.release();assert.equal(await pending,true);
  assert.equal(h.director.paused,true);assert.equal(h.states[1].paused,true);assert.equal(h.states[0].disposed,true);
});
test('failure and cancellation release preparation presentation without losing the paused source',async()=>{
  for(const cancel of [true,false]){
    const h=pendingHarness();await h.director.open({scene:'mars-hub'});
    const source=h.director.active;const pending=h.director.open({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
    h.director.setPaused(true);if(cancel)h.director.cancel();else h.fail();h.release();assert.equal(await pending,false);
    assert.equal(h.director.active,source);assert.equal(h.states[0].preparing,false);assert.equal(h.states[0].paused,true);assert.equal(h.states[0].disposed,false);
    if(cancel)assert.equal(h.states[1].disposed,true);
  }
});
