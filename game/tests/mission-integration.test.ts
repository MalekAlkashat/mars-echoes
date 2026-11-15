import test from 'node:test';
import assert from 'node:assert/strict';
import {Ground} from '../src/scenes/episodes/rover/missions/purgatory/field.ts';
import {Driver} from '../src/scenes/episodes/rover/missions/purgatory/drive.ts';
import {SITE} from '../src/scenes/episodes/rover/missions/purgatory/site.ts';
import {RecoveryAssist} from '../src/scenes/episodes/rover/missions/purgatory/recovery-assist.ts';
import {saveSoil,restoreSoil} from '../src/scenes/episodes/rover/missions/purgatory/checkpoint.ts';
import {parseSave} from '../src/app/save.ts';
import {GameSession} from '../src/app/session.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import type {GameScene,SceneEntry} from '../src/app/contracts.ts';
const save=(resume:Record<string,unknown>)=>({version:2,savedAt:1,completed:[],chapters:['blueberry-clue','long-night'],skills:['grind','sunlight'],
 entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'purgatory',resume}});
const base={kind:'purgatory',started:true,time:8,position:[SITE.observe.x,SITE.observe.z],heading:0,cameraYaw:.3,cameraPitch:.22,cameraDistance:5.8,
 cameraMode:'chase',phase:'replay',phaseTime:0,wheelAngle:0,wheelMetres:0,movedMetres:0,deformation:[]};

test('Purgatory checkpoints round-trip actual soil/pose and continue recovery without saving commands',()=>{
 const ground=new Ground(),driver=new Driver(ground);driver.reset(SITE.observe);driver.startReplay();
 while(driver.busy)driver.step(1/60);
 const pose={...driver.state},sparse=saveSoil(ground);
 const parsed=parseSave(JSON.stringify(save({...base,phase:'recover',position:[pose.x,pose.z],heading:pose.heading,wheelAngle:pose.wheelAngle,deformation:sparse})))!;
 assert.ok(parsed);assert.deepEqual(parsed.skills,['grind','sunlight']);
 if(parsed.entry.scene!=='episode-rover-01'||parsed.entry.resume?.kind!=='purgatory')throw Error('wrong route');
 const s=parsed.entry.resume,restoredGround=new Ground();restoreSoil(restoredGround,s.deformation);
 assert.deepEqual(restoredGround.sink,ground.sink);assert.deepEqual(restoredGround.berm,ground.berm);
 const restored=new Driver(restoredGround);restored.reset({x:s.position[0],z:s.position[1],heading:s.heading});restored.state.wheelAngle=s.wheelAngle;
 assert.equal(restored.busy,false);assert.equal(restored.meanSink(),driver.meanSink());
 const assist=new RecoveryAssist();assist.reset(s.wheelAngle);
 for(let i=0;i<30*60&&!restored.free();i++)restored.manual(1/60,assist.forward(1/60,1,restored.state.wheelAngle,.131,restored.softnessUnder()>0),0);
 assert.ok(restored.free());
 assert.ok(parseSave(JSON.stringify(save({...base,phase:'end',position:[restored.state.x,restored.state.z],heading:restored.state.heading,deformation:saveSoil(restoredGround)}))));
});
test('Purgatory validation rejects wrong-map positions, malformed terrain, mismatched chapters and fake ending poses',()=>{
 assert.ok(parseSave(JSON.stringify(save(base))));
 for(const delta of [{phase:'unknown'},{phaseTime:-1},{position:[20,2]},{deformation:[[0,.1,0]]},{deformation:[[200,.3,0]]},
   {deformation:[[200,NaN,0]]},{phase:'end',position:[.3,2.2]},{cameraMode:'unknown'},{phase:'recover',deformation:[[200,.1,0],[200,.1,0]]}])
   assert.equal(parseSave(JSON.stringify(save({...base,...delta}))),undefined);
 assert.equal(parseSave(JSON.stringify({...save(base),entry:{...save(base).entry,chapter:'long-night'}})),undefined);
 assert.equal(parseSave(JSON.stringify({...save(base),skills:['grind','sunlight','sand']})),undefined);
 assert.ok(parseSave(JSON.stringify({...save(base),chapters:['blueberry-clue','purgatory','long-night'],skills:['grind','sand','sunlight']})));
});
test('Purgatory reward commits after successful return only, retries once, and rejects a different chapter result',async()=>{
 const session=new GameSession();session.chapters.add('long-night');session.skills.add('sunlight');let fail=true;
 const scene=(e:SceneEntry):GameScene=>({id:e.scene,scene:{} as any,camera:{} as any,effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
 const d=new SceneDirector({session,create:async e=>{if(fail&&e.scene==='mars-hub')throw Error('intentional');return scene(e);},hooks:{switch(){},loading(){},error(){},clearInput(){}}});
 const entry={scene:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'purgatory' as const};
 const result={episodeId:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'purgatory' as const,outcome:'completed' as const};
 await d.open(entry);assert.equal(await d.request({kind:'return-to-hub',result:{...result,chapter:'long-night'}}),false);
 assert.equal(await d.request({kind:'return-to-hub',result}),false);assert.deepEqual([...session.skills],['sunlight']);
 fail=false;assert.ok(await d.retry());assert.deepEqual([...session.skills],['sunlight','sand']);
 for(let i=0;i<3;i++){await d.open(entry);await d.request({kind:'return-to-hub',result});}
 assert.equal(session.chapters.size,2);assert.equal(session.completed.size,0);
 const fresh=new GameSession();fresh.record({...result,outcome:'aborted'});assert.equal(fresh.skills.size,0);d.dispose();
});
