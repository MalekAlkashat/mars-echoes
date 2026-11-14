import assert from 'node:assert/strict';
import test from 'node:test';
import { SceneDirector, type DirectorOptions } from '../src/app/SceneDirector.ts';
import { GameSession } from '../src/app/session.ts';
import type { GameScene, HubBookmark, SceneEntry, SceneRequest } from '../src/app/contracts.ts';

const bookmark: HubBookmark = {position:[1,2,3],heading:0.2,cameraYaw:0.4,cameraPitch:0.2,cameraDistance:5};
const enter: SceneRequest = {kind:'enter-memory',entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01'},bookmark};
const returning = (outcome: 'completed' | 'aborted' = 'completed'): SceneRequest => ({
  kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',outcome},
});

function makeScene(entry: SceneEntry, failActivation = false) {
  const state = {disposed:0,activated:0,restarted:0,paused:false};
  const scene: GameScene = {
    id:entry.scene,scene:{} as GameScene['scene'],camera:{} as GameScene['camera'],effects:{time:0,degraded:0},
    activate() {state.activated++;if(failActivation) throw new Error('activation failed');},
    update() {},resize() {},setPaused(value) {state.paused=value;},restart() {state.restarted++;},
    dispose() {state.disposed++;},debug() {return {};},
  };
  return {scene,state};
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res,rej)=>{resolve=res;reject=rej;});
  return {promise,resolve,reject};
}

function harness(factory?: DirectorOptions['create']) {
  const session = new GameSession();
  const scenes: ReturnType<typeof makeScene>[] = [];
  const callbacks: ((request:SceneRequest)=>void)[] = [];
  const events = {loading:[] as boolean[],errors:[] as string[],clears:0,bound:undefined as GameScene|undefined};
  const director = new SceneDirector({session,create: factory ?? (async(entry,_signal,request)=>{
    const candidate=makeScene(entry);scenes.push(candidate);callbacks.push(request);return candidate.scene;
  }),hooks:{
    switch(scene) {events.bound=scene;},loading(value) {events.loading.push(value);},
    error(message) {events.errors.push(message);},clearInput() {events.clears++;},
  }});
  return {director,session,scenes,callbacks,events};
}

test('ten visits preserve bookmarks, retire scene resources once and record completion once', async()=>{
  const h=harness();
  assert.equal(await h.director.open({scene:'mars-hub'}),true);
  for(let i=0;i<10;i++) {
    assert.equal(await h.director.request(enter),true);
    assert.deepEqual(h.session.bookmark,bookmark);
    assert.equal(await h.director.request(returning()),true);
    assert.deepEqual(h.director.entry,{scene:'mars-hub',bookmark});
    assert.equal(h.director.active?.id,'mars-hub');
  }
  assert.deepEqual([...h.session.completed],['wreck-rover-01']);
  assert.equal(h.scenes.filter(candidate=>candidate.state.disposed===0).length,1);
  assert.ok(h.scenes.slice(0,-1).every(candidate=>candidate.state.disposed===1));
  h.director.dispose();h.director.dispose();
  assert.ok(h.scenes.every(candidate=>candidate.state.disposed===1));
  assert.equal(h.director.active,undefined);
  assert.equal(h.events.errors.length,0);
});

test('aborting, invalid results and invalid entry source do not mark completion', async()=>{
  const h=harness();
  assert.equal(await h.director.request(enter),false);
  await h.director.open({scene:'mars-hub'});
  assert.equal(await h.director.request(returning()),false);
  await h.director.request(enter);
  assert.equal(await h.director.request(enter),false);
  assert.equal(await h.director.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'other',outcome:'completed'}}),false);
  assert.equal(await h.director.request(returning('aborted')),true);
  assert.equal(h.session.completed.size,0);
});

test('factory failure retains source, prior pause state and bookmark', async()=>{
  const source=makeScene({scene:'mars-hub'});
  const h=harness(async entry=>{
    if(entry.scene==='episode-rover-01') throw new Error('missing equipment asset');
    return source.scene;
  });
  await h.director.open({scene:'mars-hub'});
  h.director.setPaused(true);
  assert.equal(await h.director.request(enter),false);
  assert.equal(h.director.active,source.scene);
  assert.equal(h.events.bound,source.scene);
  assert.equal(source.state.paused,true);
  assert.equal(source.state.disposed,0);
  assert.equal(h.session.bookmark,undefined);
  assert.equal(h.director.transitioning,false);
  assert.match(h.events.errors[0],/missing equipment/);
});

test('activation failure disposes destination and restores source presentation', async()=>{
  const source=makeScene({scene:'mars-hub'});
  const destination=makeScene({scene:'episode-rover-01',wreckId:'wreck-rover-01'},true);
  const h=harness(async entry=>entry.scene==='mars-hub'?source.scene:destination.scene);
  await h.director.open({scene:'mars-hub'});
  assert.equal(await h.director.request(enter),false);
  assert.equal(h.events.bound,source.scene);
  assert.equal(h.director.active,source.scene);
  assert.equal(source.state.activated,2);
  assert.equal(source.state.disposed,0);
  assert.equal(destination.state.disposed,1);
  assert.equal(source.state.paused,false);
});

test('failed return does not record completion or lose the active episode', async()=>{
  let hubLoads=0;
  const source=makeScene({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
  const h=harness(async entry=>{
    if(entry.scene==='mars-hub') {
      if(hubLoads++>0) throw new Error('hub load failed');
      return makeScene(entry).scene;
    }
    return source.scene;
  });
  await h.director.open({scene:'mars-hub'});
  await h.director.request(enter);
  assert.equal(await h.director.request(returning()),false);
  assert.equal(h.director.active,source.scene);
  assert.equal(h.session.completed.size,0);
  assert.deepEqual(h.session.bookmark,bookmark);
  assert.equal(source.state.disposed,0);
});

test('overlapping entry requests are locked and cancellation disposes late results', async()=>{
  const pending=deferred<GameScene>();
  const source=makeScene({scene:'mars-hub'});
  const late=makeScene({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
  let creates=0;
  let signal:AbortSignal|undefined;
  const h=harness(async(entry,currentSignal)=>{
    creates++;if(entry.scene==='mars-hub') return source.scene;
    signal=currentSignal;return pending.promise;
  });
  await h.director.open({scene:'mars-hub'});
  const loading=h.director.request(enter);
  assert.equal(source.state.paused,true);
  assert.equal(await h.director.request(enter),false);
  assert.equal(creates,2);
  h.director.cancel();
  assert.equal(signal?.aborted,true);
  assert.equal(h.director.transitioning,false);
  assert.equal(source.state.paused,false);
  pending.resolve(late.scene);
  assert.equal(await loading,false);
  assert.equal(late.state.activated,0);
  assert.equal(late.state.disposed,1);
  assert.equal(h.director.active,source.scene);
  assert.equal(h.session.bookmark,undefined);
});

test('cancelled old preparation cannot replace a newer successful scene', async()=>{
  const pending=deferred<GameScene>();
  const source=makeScene({scene:'mars-hub'});
  const late=makeScene({scene:'episode-rover-01',wreckId:'old'});
  const newer=makeScene({scene:'episode-rover-01',wreckId:'new'});
  const h=harness(async entry=>entry.scene==='mars-hub'?source.scene:entry.wreckId==='old'?pending.promise:newer.scene);
  await h.director.open({scene:'mars-hub'});
  const oldOpen=h.director.open({scene:'episode-rover-01',wreckId:'old'});
  h.director.cancel();
  assert.equal(await h.director.open({scene:'episode-rover-01',wreckId:'new'}),true);
  pending.resolve(late.scene);assert.equal(await oldOpen,false);
  assert.equal(h.director.active,newer.scene);
  assert.equal(newer.state.disposed,0);
  assert.equal(late.state.disposed,1);
});

test('callbacks from preparation or retired scenes cannot trigger transitions', async()=>{
  const scenes: ReturnType<typeof makeScene>[]=[];
  const callbacks: ((request:SceneRequest)=>void)[]=[];
  const h=harness(async(entry,_signal,request)=>{
    callbacks.push(request);request(enter);
    const candidate=makeScene(entry);scenes.push(candidate);return candidate.scene;
  });
  await h.director.open({scene:'mars-hub'});
  assert.equal(scenes.length,1);
  await h.director.request(enter);
  callbacks[0](enter);
  callbacks[0](returning());
  await Promise.resolve();
  assert.equal(scenes.length,2);
  assert.equal(h.director.active?.id,'episode-rover-01');
});

test('active scene callbacks can request entry and a successful return', async()=>{
  const h=harness();
  await h.director.open({scene:'mars-hub'});
  h.callbacks[0](enter);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.director.active?.id,'episode-rover-01');
  h.callbacks[1](returning());
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(h.director.active?.id,'mars-hub');
  assert.equal(h.session.completed.has('wreck-rover-01'),true);
});

test('restart cancels loading, clears input and resumes the existing scene', async()=>{
  const pending=deferred<GameScene>();
  const source=makeScene({scene:'mars-hub'});
  const h=harness(async entry=>entry.scene==='mars-hub'?source.scene:pending.promise);
  await h.director.open({scene:'mars-hub'});
  h.director.setPaused(true);
  const loading=h.director.request(enter);
  h.director.restart();
  assert.equal(source.state.restarted,1);
  assert.equal(source.state.paused,false);
  assert.equal(h.director.paused,false);
  assert.ok(h.events.clears>=4);
  const late=makeScene({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
  pending.resolve(late.scene);await loading;
  assert.equal(late.state.disposed,1);
});

test('destroy during preparation prevents activation and retires late resources', async()=>{
  const pending=deferred<GameScene>();
  const source=makeScene({scene:'mars-hub'});
  const h=harness(async entry=>entry.scene==='mars-hub'?source.scene:pending.promise);
  await h.director.open({scene:'mars-hub'});
  const loading=h.director.request(enter);
  h.director.dispose();h.director.dispose();
  assert.equal(source.state.disposed,1);
  const late=makeScene({scene:'episode-rover-01',wreckId:'wreck-rover-01'});
  pending.resolve(late.scene);assert.equal(await loading,false);
  assert.equal(late.state.disposed,1);
  assert.equal(late.state.activated,0);
  assert.equal(await h.director.open({scene:'mars-hub'}),false);
});

test('retrying a failed memory entry preserves the request bookmark', async()=>{
  let episodeAttempts=0;
  const h=harness(async entry=>{
    if(entry.scene==='episode-rover-01'&&episodeAttempts++===0)throw new Error('temporary asset failure');
    return makeScene(entry).scene;
  });
  await h.director.open({scene:'mars-hub'});
  assert.equal(await h.director.request(enter),false);
  assert.equal(h.session.bookmark,undefined);
  assert.equal(await h.director.retry(),true);
  assert.deepEqual(h.session.bookmark,bookmark);
  assert.equal(h.director.active?.id,'episode-rover-01');
  assert.equal(await h.director.request(returning('aborted')),true);
  assert.deepEqual(h.director.entry,{scene:'mars-hub',bookmark});
});

test('retrying a failed return records completion only once the hub has loaded', async()=>{
  let hubAttempts=0;
  const h=harness(async entry=>{
    if(entry.scene==='mars-hub'&&hubAttempts++===1)throw new Error('temporary hub failure');
    return makeScene(entry).scene;
  });
  await h.director.open({scene:'mars-hub'});
  await h.director.request(enter);
  assert.equal(await h.director.request(returning()),false);
  assert.equal(h.session.completed.size,0);
  assert.equal(h.director.active?.id,'episode-rover-01');
  assert.equal(await h.director.retry(),true);
  assert.equal(h.director.active?.id,'mars-hub');
  assert.deepEqual([...h.session.completed],['wreck-rover-01']);
  assert.deepEqual(h.director.entry,{scene:'mars-hub',bookmark});
  assert.equal(await h.director.retry(),false);
});

test('initial-load retry works and explicitly cancelling a failure discards its intent', async()=>{
  let attempts=0;
  const h=harness(async entry=>{
    if(attempts++===0)throw new Error('initial asset failure');
    return makeScene(entry).scene;
  });
  assert.equal(await h.director.open({scene:'mars-hub'}),false);
  assert.equal(h.director.active,undefined);
  assert.equal(await h.director.retry(),true);
  const failing=harness(async()=>{throw new Error('missing asset');});
  await failing.director.open({scene:'mars-hub'});
  failing.director.cancel();
  assert.equal(await failing.director.retry(),false);
});
