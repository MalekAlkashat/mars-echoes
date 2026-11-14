import test from 'node:test';
import assert from 'node:assert/strict';
import {Discovery} from '../src/scenes/episodes/rover/missions/blueberry-clue/progress.ts';
import {GameSession} from '../src/app/session.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import {parseSave,writeSave,readSaveRecord,SAVE_KEY,type ExplorationSave} from '../src/app/save.ts';
import type {GameScene,SceneEntry} from '../src/app/contracts.ts';
const tick=(p:Discovery,n:number,held=false,pressed=false)=>{for(let i=0;i<n;i++)p.update(.05,held,pressed&&i===0);};
test('mission requires proximity, fresh held grind and two separate comparison actions',()=>{
 const p=new Discovery();p.act(false);assert.equal(p.phase,'approach');p.act(true);tick(p,51);assert.equal(p.phase,'grind');
 tick(p,100,true);assert.equal(p.hold,0);tick(p,30,true,true);p.update(.05,false,false);assert.equal(p.hold,0);
 tick(p,61,true,true);assert.equal(p.phase,'inspect');p.act();assert.equal(p.phase,'compare');p.act();assert.equal(p.phase,'compare');p.act();assert.equal(p.phase,'water');p.act();assert.equal(p.phase,'evidence');
});
test('pause clears held work; safe restores never resume moving tool or half-wet reconstruction',()=>{
 const p=new Discovery();p.enter('grind');tick(p,20,true,true);p.cancelHold();tick(p,100,true);assert.equal(p.hold,0);
 p.restore('brush');assert.equal(p.phase,'approach');p.restore('water');assert.equal(p.phase,'compare');assert.equal(p.comparison,0);
});
const save:ExplorationSave={version:2,savedAt:1,completed:[],chapters:[],skills:[],entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'blueberry-clue',resume:{kind:'blueberry-clue',phase:'compare',position:[0,-1],heading:0,cameraYaw:0,cameraPitch:.2,cameraDistance:6,started:true,time:10}}};
test('chapter saves round-trip, reject wrong-map positions and inconsistent rewards, recover backup',()=>{
 assert.deepEqual(parseSave(JSON.stringify(save)),{...save,bookmark:undefined});
 const bad=structuredClone(save);if(bad.entry.scene==='episode-rover-01')bad.entry.resume!.position=[30,0];assert.equal(parseSave(JSON.stringify(bad)),undefined);
 assert.equal(parseSave(JSON.stringify({...save,skills:['grind']})),undefined);
 const map=new Map<string,string>();const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 assert.equal(writeSave(save,storage),true);map.set(SAVE_KEY,'invalid');assert.equal(readSaveRecord(storage).source,'backup');
 assert.equal(writeSave(save,{getItem:()=>null,setItem:()=>{throw Error('quota');}}),false);
});
test('chapter reward commits only after successful return; retry and ten replays award once',async()=>{
 const session=new GameSession();let fail=false;
 const scene=(e:SceneEntry):GameScene=>({id:e.scene,scene:{} as any,camera:{} as any,effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
 const d=new SceneDirector({session,create:async e=>{if(fail&&e.scene==='mars-hub')throw Error('load');return scene(e);},hooks:{switch(){},loading(){},error(){},clearInput(){}}});
 const entry={scene:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'blueberry-clue' as const};
 const result={episodeId:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter:'blueberry-clue' as const,outcome:'completed' as const};
 await d.open(entry);fail=true;assert.equal(await d.request({kind:'return-to-hub',result}),false);assert.equal(session.skills.size,0);
 fail=false;await d.retry();assert.equal(session.skills.has('grind'),true);assert.equal(session.completed.size,0);
 for(let i=0;i<10;i++){await d.open(entry);await d.request({kind:'return-to-hub',result});}assert.equal(session.chapters.size,1);assert.equal(session.skills.size,1);
 const s=new GameSession();s.record({...result,outcome:'aborted'});assert.equal(s.skills.size,0);d.dispose();
});


import {Mesh,MeshBasicMaterial,Raycaster,Vector3} from 'three';
import {createGroundGeometry,sampleHeight} from '../src/scenes/episodes/rover/missions/blueberry-clue/surface.ts';
test('Eagle basin contacts match actual rendered triangles across the mission boundary',()=>{
 const geometry=createGroundGeometry(),material=new MeshBasicMaterial(),mesh=new Mesh(geometry,material);
 const ray=new Raycaster();let maxError=0;
 for(let i=0;i<300;i++){
  const x=Math.sin(i*14.31)*13,z=Math.cos(i*8.17)*13;
  ray.set(new Vector3(x,10,z),new Vector3(0,-1,0));const hit=ray.intersectObject(mesh)[0];assert.ok(hit);
  maxError=Math.max(maxError,Math.abs(hit.point.y-sampleHeight(x,z)));
 }
 assert.ok(maxError<1e-6,`contact/triangle error ${maxError}`);geometry.dispose();material.dispose();
});
