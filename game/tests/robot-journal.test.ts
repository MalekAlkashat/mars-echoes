import test from 'node:test';
import assert from 'node:assert/strict';
import { journalRecords, hasOpportunityEncounter } from '../src/content/robot-journal.ts';
import { GameSession } from '../src/app/session.ts';
import { parseSave } from '../src/app/save.ts';
import { SceneDirector } from '../src/app/SceneDirector.ts';
import type { GameScene, SceneEntry } from '../src/app/contracts.ts';

test('fresh knowledge hides all identities; encounter reveals only Opportunity once', () => {
  const session = new GameSession(); let notices = 0; session.onJournalUpdate = () => notices++;
  assert.deepEqual(journalRecords(session).map(r => r.available), [false, false, false]);
  session.encounterOpportunity(); session.encounterOpportunity();
  assert.equal(notices, 1);
  assert.deepEqual(journalRecords(session).map(r => r.available), [true, false, false]);
});
test('each committed chapter independently reveals only its supported connections', () => {
  for (const [chapter, ids, availability] of [
    ['blueberry-clue', ['rock-spirit'], [true,true,false]],
    ['purgatory', ['ground-spirit'], [true,true,false]],
    ['long-night', ['sun-spirit','sun-ingenuity'], [true,true,true]],
  ] as const) {
    const records = journalRecords({ opportunityEncountered: false, chapters: new Set([chapter]) });
    assert.deepEqual(records.map(r => r.available), availability);
    assert.deepEqual(records[0].connections.map(c => c.id), ids);
    assert.deepEqual(records[0].memories.map(m => m.id), [chapter]);
    assert.equal(records[1].memories.length, 0);
  }
});
test('old completed saves populate the journal without re-awards or a new schema version', () => {
  const raw = { version:2, savedAt:1, entry:{scene:'mars-hub'}, completed:[], chapters:['blueberry-clue','purgatory','long-night'], skills:['grind','sand','sunlight'] };
  const save = parseSave(JSON.stringify(raw))!; assert.ok(save);
  assert.equal(hasOpportunityEncounter(save), true);
  const records = journalRecords({opportunityEncountered:hasOpportunityEncounter(save), chapters:new Set(save.chapters)});
  assert.deepEqual(records.map(r => r.available), [true,true,true]);
  assert.equal(records[0].memories.length,3); assert.equal(records[0].connections.length,4);
  assert.deepEqual(save.skills, raw.skills); assert.deepEqual(save.completed,[]);
});
test('optional encounter marker round trips, rejects invalid types, and does not infer a roaming encounter', () => {
  const raw = {version:2,savedAt:1,entry:{scene:'mars-hub'},completed:[]};
  for (const value of [true,false]) assert.equal(parseSave(JSON.stringify({...raw,opportunityEncountered:value}))?.opportunityEncountered,value);
  for (const value of ['true',1,{},null]) assert.equal(parseSave(JSON.stringify({...raw,opportunityEncountered:value})),undefined);
  assert.equal(hasOpportunityEncounter(parseSave(JSON.stringify(raw))!),false);
  assert.equal(hasOpportunityEncounter({entry:{scene:'episode-rover-01'},completed:[]}),true);
  const old=parseSave(JSON.stringify({version:1,completed:['wreck-rover-01']}))!;
  assert.equal(hasOpportunityEncounter(old),true);
  assert.equal(journalRecords({opportunityEncountered:true,chapters:new Set(old.chapters)})[0].memories.length,0);
});
test('abort, failed return, retry and replay retain exactly-once journal discovery for all chapters', async () => {
  for (const chapter of ['blueberry-clue','purgatory','long-night'] as const) {
    const session=new GameSession(); let notices=0,fail=false; session.onJournalUpdate=()=>notices++;
    const scene=(e:SceneEntry):GameScene=>({id:e.scene,scene:{} as any,camera:{} as any,effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
    const d=new SceneDirector({session,create:async e=>{if(fail&&e.scene==='mars-hub')throw Error('return failure');return scene(e);},hooks:{switch(){},loading(){},error(){},clearInput(){}}});
    const entry={scene:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter};
    const result={episodeId:'episode-rover-01' as const,wreckId:'wreck-rover-01',chapter,outcome:'completed' as const};
    await d.open(entry);await d.request({kind:'return-to-hub',result:{...result,outcome:'aborted'}});
    assert.equal(notices,0);assert.equal(session.chapters.size,0);
    await d.open(entry);fail=true;await d.request({kind:'return-to-hub',result});
    assert.equal(notices,0);assert.equal(session.chapters.size,0);
    fail=false;await d.retry();assert.equal(notices,1);assert.equal(session.chapters.size,1);
    await d.open(entry);await d.request({kind:'return-to-hub',result});assert.equal(notices,1);
    assert.equal(journalRecords(session)[0].memories.length,1);assert.equal(session.completed.size,0);d.dispose();
  }
});
test('cancelling an in-flight completed return cannot add a discovery', async () => {
  const session=new GameSession(); let resolve!: (s:GameScene)=>void;
  const scene=(e:SceneEntry):GameScene=>({id:e.scene,scene:{} as any,camera:{} as any,effects:{time:0,degraded:0},activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
  const d=new SceneDirector({session,create:async e=>e.scene==='mars-hub'?new Promise(r=>resolve=r):scene(e),hooks:{switch(){},loading(){},error(){},clearInput(){}}});
  await d.open({scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night'});
  const pending=d.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night',outcome:'completed'}});
  d.cancel();resolve(scene({scene:'mars-hub'}));assert.equal(await pending,false);
  assert.equal(session.chapters.size,0);assert.equal(journalRecords(session)[2].available,false);d.dispose();
});
