import test from 'node:test';
import assert from 'node:assert/strict';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import {GameSession} from '../src/app/session.ts';
import {parseSave} from '../src/app/save.ts';
import type {GameScene,SceneEntry,OpportunityChapter,SceneRequest} from '../src/app/contracts.ts';
const bookmark={position:[0,1,-22] as const,heading:.2,cameraYaw:.3,cameraPitch:.2,cameraDistance:5.8};
const request=(chapter:OpportunityChapter,kind:'chapter-boundary'|'return-to-hub'='return-to-hub',outcome:'completed'|'aborted'='completed'):SceneRequest=>({kind,result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',chapter,outcome}});
const start:SceneRequest={kind:'enter-memory',entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'blueberry-clue',journey:true},bookmark};
function harness(){
 const session=new GameSession(),events:{entry:SceneEntry;disposed:boolean}[]=[],saves:string[]=[];
 let fail='',block:Promise<void>|undefined;
 const director=new SceneDirector({session,create:async(entry)=>{
  if(block)await block;
  if((entry.scene==='episode-rover-01'?entry.chapter:entry.scene)===fail)throw Error('injected load failure');
  const state={entry,disposed:false};events.push(state);
  return {id:entry.scene,scene:{},camera:{},effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){state.disposed=true;},debug(){},getSaveEntry(){return entry;}} as unknown as GameScene;
 },hooks:{switch(){},loading(){},error(){},clearInput(){},settled(){saves.push(JSON.stringify({journey:session.journey,chapters:[...session.chapters]}));}}});
 return {director,session,events,saves,fail(v:string){fail=v;},block(v?:Promise<void>){block=v;}};
}
test('three boundaries form one story, with one original bookmark and no intervening hub',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 for(const chapter of ['blueberry-clue','purgatory','long-night'] as const){
  assert.equal(h.session.opportunityComplete,false);
  await h.director.request(request(chapter,'chapter-boundary'));
  assert.ok(h.session.chapters.has(chapter));
  await h.director.request(request(chapter));
 }
 assert.deepEqual(h.events.map(e=>e.entry.scene==='mars-hub'?'hub':e.entry.chapter),['hub','blueberry-clue','purgatory','long-night','hub']);
 assert.equal(h.session.opportunityComplete,true);assert.equal(h.session.journey,undefined);
 assert.deepEqual(h.director.entry,{scene:'mars-hub',bookmark,memoryReturn:true});
 assert.equal(h.session.skills.size,3);assert.equal(h.session.completed.size,0);
});
test('failed next chapter preserves durable outgoing reward, source and retry',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 await h.director.request(request('blueberry-clue','chapter-boundary'));
 const saved=JSON.parse(h.saves.at(-1)!);assert.deepEqual(saved.chapters,['blueberry-clue']);assert.equal(saved.journey.chapter,'purgatory');
 const source=h.director.active;h.fail('purgatory');assert.equal(await h.director.request(request('blueberry-clue')),false);
 assert.equal(h.director.active,source);assert.equal(h.events[1].disposed,false);assert.equal(h.session.skills.has('sand'),false);
 h.fail('');assert.equal(await h.director.retry(),true);assert.equal(h.session.chapters.size,1);assert.equal(h.session.journey?.boundary,undefined);
});
test('cancelled preparation and late factory resolution do not advance or award incoming chapter',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);await h.director.request(request('blueberry-clue','chapter-boundary'));
 let release!:()=>void;h.block(new Promise<void>(resolve=>release=resolve));const pending=h.director.request(request('blueberry-clue'));
 h.director.cancel();release();assert.equal(await pending,false);h.block();
 assert.equal(h.session.chapters.size,1);assert.equal(h.session.journey?.chapter,'purgatory');assert.equal(h.events.at(-1)?.disposed,true);
 await h.director.request(request('blueberry-clue','return-to-hub','aborted'));await h.director.request(start);
 assert.equal(h.director.entry?.scene==='episode-rover-01'&&h.director.entry.chapter,'purgatory');assert.deepEqual(h.session.journey?.bookmark,bookmark);
});
test('unplayed or mismatched chapter result cannot advance journey',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 assert.equal(await h.director.request(request('purgatory','chapter-boundary')),false);
 assert.equal(await h.director.request(request('blueberry-clue')),false);
 assert.equal(h.session.chapters.size,0);assert.equal(h.session.opportunityComplete,false);
});
test('standalone replay preserves unfinished journey and does not finish story',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 await h.director.request(request('blueberry-clue','return-to-hub','aborted'));
 const journey=structuredClone(h.session.journey);
 await h.director.request({...start,entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night'}} as SceneRequest);
 await h.director.request(request('long-night'));
 assert.deepEqual(h.session.journey,journey);assert.equal(h.session.opportunityComplete,false);assert.ok(h.session.skills.has('sunlight'));
});
test('failed final hub return retains earned sunlight but cannot mark story complete',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 for(const chapter of ['blueberry-clue','purgatory'] as const){await h.director.request(request(chapter,'chapter-boundary'));await h.director.request(request(chapter));}
 await h.director.request(request('long-night','chapter-boundary'));h.fail('mars-hub');
 assert.equal(await h.director.request(request('long-night')),false);assert.equal(h.session.opportunityComplete,false);assert.ok(h.session.skills.has('sunlight'));
 h.fail('');assert.equal(await h.director.retry(),true);assert.equal(h.session.opportunityComplete,true);
});
test('boundary saves roundtrip without requiring an unplayed chapter checkpoint',()=>{
 const save={version:2,savedAt:100,completed:[],chapters:['blueberry-clue'],skills:['grind'],bookmark,
 entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'purgatory',journey:true},journey:{chapter:'purgatory',bookmark,boundary:'next'},opportunityComplete:false};
 assert.deepEqual(parseSave(JSON.stringify(save)),save);
 assert.equal(parseSave(JSON.stringify({...save,chapters:[],skills:[]})),undefined);
 assert.equal(parseSave(JSON.stringify({...save,opportunityComplete:true})),undefined);
 assert.equal(parseSave(JSON.stringify({...save,journey:{...save.journey,chapter:'long-night'}})),undefined);
});


test('loading a boundary releases it so chapter checkpoints can resume saving',async()=>{
 const h=harness();h.session.chapters.add('blueberry-clue');h.session.skills.add('grind');h.session.journey={chapter:'purgatory',bookmark,boundary:'next'};
 await h.director.open({scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'purgatory',journey:true});
 assert.equal(h.session.journey.boundary,undefined);assert.equal(h.session.journey.chapter,'purgatory');
});
test('OVERTIME requires a recovered Purgatory and remains an exactly-once memory',async()=>{
 const h=harness();await h.director.open({scene:'mars-hub'});await h.director.request(start);
 assert.equal(await h.director.request({kind:'remember-overtime'}),false);
 await h.director.request(request('blueberry-clue','chapter-boundary'));await h.director.request(request('blueberry-clue'));
 assert.equal(await h.director.request({kind:'remember-overtime'}),false);
 await h.director.request(request('purgatory','chapter-boundary'));
 assert.equal(await h.director.request({kind:'remember-overtime'}),true);await h.director.request({kind:'remember-overtime'});
 assert.deepEqual([...h.session.skills],['grind','sand','overtime']);assert.equal(h.session.chapters.has('long-night'),false);
});
