import test from 'node:test';
import assert from 'node:assert/strict';
import {LongNight,legacyNightReserve,STORM_SECONDS} from '../src/scenes/episodes/rover/missions/long-night/progress.ts';
import {parseSave} from '../src/app/save.ts';
import {GameSession} from '../src/app/session.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import type {GameScene,SceneEntry} from '../src/app/contracts.ts';
test('conservation improves illustrative reserve without changing historical outcome',()=>{
 const a=new LongNight(),b=new LongNight();a.enter('storm');b.enter('storm');b.suspend('imaging');b.suspend('science');
 a.update(STORM_SECONDS/2);b.update(STORM_SECONDS/2);assert.ok(b.reserve>a.reserve);assert.equal(a.obscuration,b.obscuration);
 const elapsed=a.elapsed;a.update(NaN);a.update(-1);assert.equal(a.elapsed,elapsed);
 a.update(STORM_SECONDS/2);b.update(STORM_SECONDS/2);assert.equal(a.phase,'storm');assert.equal(b.phase,'storm');assert.equal(a.elapsed,40);assert.equal(b.elapsed,40);
 a.enter('silence');b.enter('silence');assert.equal(a.phase,b.phase);assert.ok(a.reserve>0);assert.ok(b.reserve>0);
 a.reset();assert.equal(a.reserve,100);assert.equal(a.phase,'arrival');
});
test('each service changes future slope without recharging or removing essential drain',()=>{
 for(const service of ['imaging','science'] as const){
  const a=new LongNight(),b=new LongNight();a.enter('storm');b.enter('storm');a.update(7);b.update(7);
  const before=b.reserve,demand=b.demand,rate=b.drain;assert.ok(b.suspend(service));
  assert.equal(b.reserve,before);assert.ok(b.demand<demand);assert.ok(b.drain<rate);assert.ok(b.drain>0);
  a.update(5);b.update(5);assert.ok(b.reserve<before);assert.ok(b.reserve>a.reserve);
  assert.equal(b.suspend(service),false);
 }
 const n=new LongNight();n.enter('storm');n.update(40);n.suspend('imaging');n.suspend('science');assert.equal(n.demand,.5);assert.ok(n.drain>0);n.update(10000);assert.equal(n.reserve,0);assert.equal(n.phase,'storm');n.enter('silence');const value=n.reserve;n.update(10);assert.equal(n.reserve,value);
});
test('30/60/120 Hz agree across choices and the sky ramp boundary; zero delta freezes the model',()=>{
 const simulate=(hz:number)=>{const n=new LongNight();n.enter('storm');for(let i=0;i<20*hz;i++){if(i===4*hz)n.suspend('imaging');if(i===10*hz)n.suspend('science');const last=n.reserve;n.update(1/hz);assert.ok(n.reserve<=last);assert.ok(n.reserve>=0&&n.reserve<=100);}return n;};
 const a=simulate(30),b=simulate(60),c=simulate(120);assert.ok(Math.abs(a.reserve-b.reserve)<1e-9);assert.ok(Math.abs(a.reserve-c.reserve)<1e-9);assert.equal(a.elapsed,40);
 const state=[a.reserve,a.elapsed,a.phase];a.update(0);a.update(Infinity);a.update(NaN);assert.deepEqual([a.reserve,a.elapsed,a.phase],state);
});
test('the faster 16-second storm preserves the old endpoint and checkpoint fraction',()=>{
 const n=new LongNight();n.enter('storm');n.update(8);assert.equal(n.elapsed,20);assert.equal(n.obscuration,.5);n.update(8);assert.equal(n.obscuration,1);assert.ok(Math.abs(n.reserve-45.17333333333333)<1e-9);
 const restored=new LongNight();restored.phase='storm';restored.elapsed=20;restored.reserve=62;restored.update(8);assert.equal(restored.elapsed,40);assert.ok(restored.reserve<62);
 assert.equal(legacyNightReserve('storm',20,false,false),62.5);
});
const entry={scene:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'long-night' as const};
const save={version:2,savedAt:1,completed:[],chapters:['blueberry-clue'],skills:['grind'],entry:{...entry,resume:{kind:'long-night',phase:'storm',elapsed:21,imaging:true,science:false,position:[0,2],heading:0,cameraYaw:0,cameraPitch:.2,cameraDistance:6,started:true,time:25}}};
test('night checkpoints preserve prior progress and reject corrupt state',()=>{
 assert.ok(parseSave(JSON.stringify(save)));
 for(const delta of [{elapsed:41},{elapsed:-1},{phase:'unknown'},{position:[31,0]},{science:1},{phase:'legacy',elapsed:20},{reserve:-1},{reserve:101},{reserve:'55'},{reserve:null}]){
 assert.equal(parseSave(JSON.stringify({...save,entry:{...save.entry,resume:{...save.entry.resume,...delta}}})),undefined);}
 assert.equal(parseSave(JSON.stringify({...save,skills:['grind','sunlight']})),undefined);
 assert.ok(parseSave(JSON.stringify({...save,chapters:['blueberry-clue','long-night'],skills:['grind','sunlight']})));
});
test('old chapter saves retain displayed reserve; new Continue retains the accumulated causal state',()=>{
 for(const phase of ['arrival','storm','silence','archive','recovery','legacy'] as const){
  const elapsed=phase==='storm'?21:0;
  const parsed=parseSave(JSON.stringify({...save,entry:{...save.entry,resume:{...save.entry.resume,phase,elapsed}}}))!;
  assert.ok(parsed);if(parsed.entry.scene!=='episode-rover-01'||parsed.entry.resume?.kind!=='long-night')throw Error('wrong route');
  assert.equal(parsed.entry.resume.reserve,legacyNightReserve(phase,elapsed,true,false));
  assert.equal(parsed.entry.resume.imaging,true);assert.deepEqual(parsed.skills,['grind']);
 }
 const n=new LongNight();n.enter('storm');n.update(13);n.suspend('imaging');n.update(8);
 const parsed=parseSave(JSON.stringify({...save,entry:{...save.entry,resume:{...save.entry.resume,reserve:n.reserve,elapsed:n.elapsed}}}))!;
 if(parsed.entry.scene!=='episode-rover-01'||parsed.entry.resume?.kind!=='long-night')throw Error('wrong route');
 const restored=Object.assign(new LongNight(),parsed.entry.resume);assert.equal(restored.reserve,n.reserve);assert.equal(restored.drain,n.drain);n.update(5);restored.update(5);assert.equal(restored.reserve,n.reserve);
});
test('night reward waits for successful return, retry awards once, abort preserves prior chapter',async()=>{
 const session=new GameSession();session.chapters.add('blueberry-clue');session.skills.add('grind');let fail=true;
 const scene=(e:SceneEntry):GameScene=>({id:e.scene,scene:{} as any,camera:{} as any,effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
 const d=new SceneDirector({session,create:async e=>{if(fail&&e.scene==='mars-hub')throw Error('test');return scene(e);},hooks:{switch(){},loading(){},error(){},clearInput(){}}});
 const result={episodeId:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'long-night' as const,outcome:'completed' as const};
 await d.open(entry);assert.equal(await d.request({kind:'return-to-hub',result}),false);assert.deepEqual([...session.skills],['grind']);
 fail=false;await d.retry();for(let i=0;i<5;i++){await d.open(entry);await d.request({kind:'return-to-hub',result});}
 assert.deepEqual([...session.skills],['grind','sunlight']);assert.equal(session.completed.size,0);
 const fresh=new GameSession();fresh.record({...result,outcome:'aborted'});assert.equal(fresh.skills.size,0);fresh.record(result);assert.deepEqual([...fresh.chapters],['long-night']);d.dispose();
});
