import test from 'node:test';
import assert from 'node:assert/strict';
import {EpilogueProgress,departureRoute} from '../src/scenes/mars-hub/epilogue-progress.ts';
import {parseSave} from '../src/app/save.ts';
import {GameSession} from '../src/app/session.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import type {GameScene,SceneEntry,SceneRequest} from '../src/app/contracts.ts';

const finish:SceneRequest={kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night',outcome:'completed'}};
test('finale is pending only after successful final return, survives failure/retry and is idempotent',async()=>{
  const session=new GameSession();let fail=false;
  const director=new SceneDirector({session,create:async(entry:SceneEntry)=>{
    if(fail&&entry.scene==='mars-hub')throw Error('hub unavailable');
    return {id:entry.scene,scene:{},camera:{},effects:{time:0,degraded:0},activate(){},dispose(){},setPaused(){},update(){},resize(){},restart(){},debug(){return {};}} as GameScene;
  },hooks:{switch(){},clearInput(){},loading(){},error(){}}});
  await director.open({scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night'});
  fail=true;assert.equal(await director.request(finish),false);assert.equal(session.finale,undefined);assert.equal(session.skills.size,0);
  fail=false;assert.equal(await director.retry(),true);assert.deepEqual(session.finale,{status:'pending',presentation:'slideshow-v2'});assert.deepEqual([...session.skills],['sunlight']);
  session.finale!.status='complete';
  await director.open({scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night'});await director.request(finish);
  assert.deepEqual(session.finale,{status:'complete',presentation:'slideshow-v2'});assert.equal(session.skills.size,1);
});
test('abort and unrelated chapters never initiate the finale',()=>{
  const s=new GameSession();s.record({...finish.result,outcome:'aborted'});assert.equal(s.finale,undefined);
  for(const chapter of ['blueberry-clue','purgatory'] as const)s.record({...finish.result,chapter});
  assert.equal(s.finale,undefined);
});
test('automatic sequence finishes once in 39 active seconds without input or questions',()=>{
  const state={status:'pending',presentation:'slideshow-v2'} as const;
  const p=new EpilogueProgress({...state});const seen=new Set([p.beat]);
  for(let i=0;i<780;i++){p.update(.05);seen.add(p.beat);}
  assert.deepEqual([...seen],['settle','discoveries','legacy','curiosity','closure','complete']);
  assert.equal(p.state.status,'complete');assert.ok(Math.abs(p.activeTime-39)<.001);
  for(let i=0;i<500;i++)p.update(.1);assert.equal(p.beat,'complete');assert.ok(Math.abs(p.activeTime-39)<.001);
});
test('Skip from every slide reaches the same completed outcome without a quiz gate',()=>{
  for(const seconds of [0,5,13,23,32]){
    const p=new EpilogueProgress({status:'pending',presentation:'slideshow-v2'});
    for(let i=0;i<seconds*20;i++)p.update(.05);p.skip();assert.equal(p.beat,'complete');assert.equal(p.state.status,'complete');
    p.update(.05);const time=p.elapsed;p.skip();assert.equal(p.elapsed,time);
  }
});
test('pause and invalid/background-sized deltas cannot consume a slideshow',()=>{
  const p=new EpilogueProgress({status:'pending',presentation:'slideshow-v2'});p.update(.05);const time=p.elapsed;
  for(let i=0;i<1000;i++)p.update(.05,true);
  for(const dt of [NaN,Infinity,-1,0,20,3600])p.update(dt);
  assert.equal(p.elapsed,time);assert.equal(p.activeTime,time);p.update(.05);assert.equal(p.elapsed,.1);
});
test('replay resets presentation without revoking legitimate completion',()=>{
  const p=new EpilogueProgress({status:'pending',presentation:'slideshow-v2'});p.skip();p.restart();assert.equal(p.beat,'settle');assert.equal(p.activeTime,0);assert.equal(p.state.status,'complete');
});
test('old valid quiz saves migrate safely and discard answers instead of inventing scores',()=>{
  const base={version:2,savedAt:0,entry:{scene:'mars-hub'},completed:[],chapters:['long-night'],skills:['sunlight']};
  assert.ok(parseSave(JSON.stringify(base)));
  for(const finale of [{status:'pending',answers:[]},{status:'pending',answers:[2]},{status:'complete',answers:[0,1,2]}]){
    assert.deepEqual(parseSave(JSON.stringify({...base,finale}))?.finale,{status:finale.status,presentation:'slideshow-v2'});
  }
  for(const status of ['pending','complete'])assert.deepEqual(parseSave(JSON.stringify({...base,finale:{status,presentation:'slideshow-v2'}}))?.finale,{status,presentation:'slideshow-v2'});
  for(const finale of [{status:'complete',answers:[]},{status:'pending',answers:[4]},{status:'pending',answers:[0,1,2,0]},{status:'complete',answers:[0,.1,2]},{status:'pending',presentation:'unknown'}])assert.equal(parseSave(JSON.stringify({...base,finale})),undefined);
  assert.equal(parseSave(JSON.stringify({...base,chapters:[],skills:[],finale:{status:'complete',presentation:'slideshow-v2'}})),undefined);
});
test('departure route respects collision clearance, slope and map bounds',()=>{
  const solids=[{x:0,z:-25,radius:1.4},{x:8,z:-24,radius:4}];
  const route=departureRoute(0,-22.3,solids,()=>0,{minX:-30,maxX:30,minZ:-30,maxZ:30});assert.ok(route.length>=12);
  for(let d=.25;d<=route.length;d+=.25){const x=route.dx*d,z=-22.3+route.dz*d;assert.ok(x>=-29.4&&x<=29.4&&z>=-29.4&&z<=29.4);assert.ok(solids.every(s=>Math.hypot(x-s.x,z-s.z)>=s.radius+.6));}
});
