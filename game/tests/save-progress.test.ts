import test from 'node:test';
import assert from 'node:assert/strict';
import {BACKUP_SAVE_KEY,LEGACY_SAVE_KEY,SAVE_KEY,parseSave,readSaveRecord,writeSave,type ExplorationSave,type SaveStorage} from '../src/app/save.ts';
import {SceneDirector} from '../src/app/SceneDirector.ts';
import {GameSession} from '../src/app/session.ts';
import type {GameScene,HubBookmark,SceneEntry} from '../src/app/contracts.ts';

class MemoryStorage implements SaveStorage {
  readonly values=new Map<string,string>();
  blocked=false;
  getItem(key:string){if(this.blocked)throw new Error('Storage disabled');return this.values.get(key)??null;}
  setItem(key:string,value:string){if(this.blocked)throw new Error('Quota exceeded');this.values.set(key,value);}
  removeItem(key:string){if(this.blocked)throw new Error('Storage disabled');this.values.delete(key);}
}
const bookmark:HubBookmark={position:[2,.5,-12],heading:.4,cameraYaw:.7,cameraPitch:.2,cameraDistance:5.8};
const hub=(savedAt=100):ExplorationSave=>({version:2,savedAt,entry:{scene:'mars-hub',bookmark},bookmark,completed:[]});

test('old exploration saves migrate without discarding bookmark or completion',()=>{
  const store=new MemoryStorage();
  store.setItem(LEGACY_SAVE_KEY,JSON.stringify({version:1,bookmark,completed:['wreck-rover-01','wreck-rover-01']}));
  const result=readSaveRecord(store);
  assert.equal(result.source,'legacy');assert.deepEqual(result.save?.entry,{scene:'mars-hub',bookmark});
  assert.deepEqual(result.save?.completed,['wreck-rover-01']);assert.equal(result.save?.version,2);
});
test('current Opportunity rover pose and optical/camera state round-trip in the active scene',()=>{
  const save:ExplorationSave={...hub(),entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',resume:{kind:'opportunity',
    position:[5,-24],heading:1.2,cameraYaw:.3,cameraPitch:.25,cameraDistance:6,started:true,time:52,optical:true}}};
  assert.deepEqual(parseSave(JSON.stringify(save)),save);
});

test('first-person hub bookmarks persist while older saves remain valid and malformed modes are rejected',()=>{
  const firstPerson={...bookmark,firstPerson:true,cameraPitch:-.4};
  const save:ExplorationSave={...hub(),bookmark:firstPerson,entry:{scene:'mars-hub',bookmark:firstPerson}};
  assert.deepEqual(parseSave(JSON.stringify(save)),save);
  assert.deepEqual(parseSave(JSON.stringify(hub())),hub());
  assert.equal(parseSave(JSON.stringify({...save,entry:{scene:'mars-hub',bookmark:{...firstPerson,firstPerson:'yes'}}})),undefined);
});
test('legacy repair alignment, timer and partial progress round-trip without marking completion',()=>{
  const save:ExplorationSave={...hub(),entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',resume:{kind:'repair',
    position:[8,-4],heading:.6,cameraYaw:.3,cameraPitch:.1,cameraDistance:5.8,started:true,time:63,phase:'align',
    elapsed:4,offset:{x:.02,y:-.04,angle:.16},failedAttempts:2,repaired:false,serviceHeading:.2,opticalRemaining:0}}};
  assert.deepEqual(parseSave(JSON.stringify(save)),save);assert.deepEqual(parseSave(JSON.stringify(save))?.completed,[]);
});
test('a corrupted latest save recovers the previous valid save and reports its source',()=>{
  const store=new MemoryStorage();
  assert.equal(writeSave(hub(100),store),true);assert.equal(writeSave(hub(200),store),true);
  store.setItem(SAVE_KEY,'{incomplete');
  const result=readSaveRecord(store);assert.equal(result.source,'backup');assert.equal(result.save?.savedAt,100);
});
test('the first save has a recovery copy and malformed primary data cannot poison that copy',()=>{
  const store=new MemoryStorage();assert.equal(writeSave(hub(100),store),true);
  assert.deepEqual(parseSave(store.getItem(BACKUP_SAVE_KEY)),hub(100));
  store.setItem(SAVE_KEY,'broken');assert.equal(writeSave(hub(200),store),true);
  assert.deepEqual(parseSave(store.getItem(BACKUP_SAVE_KEY)),hub(100));
});
test('nonfinite or out-of-map runtime snapshots never overwrite the good primary or backup',()=>{
  const store=new MemoryStorage();assert.equal(writeSave(hub(),store),true);
  const primary=store.getItem(SAVE_KEY),backup=store.getItem(BACKUP_SAVE_KEY);
  assert.equal(writeSave({...hub(),entry:{scene:'mars-hub',bookmark:{...bookmark,heading:NaN}}},store),false);
  assert.equal(writeSave({...hub(),entry:{scene:'mars-hub',bookmark:{...bookmark,position:[70,0,0]}}},store),false);
  assert.equal(store.getItem(SAVE_KEY),primary);assert.equal(store.getItem(BACKUP_SAVE_KEY),backup);
});
test('confirmed New Game replaces recovery copies and retires legacy progress only after validation',()=>{
  const store=new MemoryStorage();
  store.setItem(LEGACY_SAVE_KEY,JSON.stringify({version:1,bookmark,completed:['wreck-rover-01']}));
  assert.equal(writeSave({...hub(100),completed:['wreck-rover-01']},store),true);
  const oldPrimary=store.getItem(SAVE_KEY),oldLegacy=store.getItem(LEGACY_SAVE_KEY);
  assert.equal(writeSave({...hub(200),entry:{scene:'mars-hub',bookmark:{...bookmark,heading:NaN}}},store,{replaceBackup:true}),false);
  assert.equal(store.getItem(SAVE_KEY),oldPrimary);assert.equal(store.getItem(LEGACY_SAVE_KEY),oldLegacy);
  assert.equal(writeSave(hub(200),store,{replaceBackup:true}),true);
  assert.equal(store.getItem(LEGACY_SAVE_KEY),null);
  store.setItem(SAVE_KEY,'broken latest');
  const recovery=readSaveRecord(store);assert.equal(recovery.source,'backup');assert.equal(recovery.save?.savedAt,200);
  assert.deepEqual(recovery.save?.completed,[]);
  store.setItem(BACKUP_SAVE_KEY,'broken backup');
  assert.equal(readSaveRecord(store).save,undefined);
});
test('unavailable or failed storage is explicit and preserves the last successful value',()=>{
  const store=new MemoryStorage();assert.equal(writeSave(hub(),store),true);
  const prior=store.values.get(SAVE_KEY);store.blocked=true;
  assert.equal(writeSave(hub(200),store),false);assert.equal(readSaveRecord(store).source,'unavailable');
  assert.equal(store.values.get(SAVE_KEY),prior);
});
test('unsupported versions, invalid chapter fields and incomplete rover saves are rejected',()=>{
  assert.equal(parseSave(JSON.stringify({...hub(),version:99})),undefined);
  assert.equal(parseSave(JSON.stringify({...hub(),completed:['made-up-mission']})),undefined);
  assert.equal(parseSave(JSON.stringify({...hub(),entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01'}})),undefined);
  assert.equal(readSaveRecord(new MemoryStorage()).source,'empty');
});
test('transition persistence hook observes committed return bookmark and completion',async()=>{
  const session=new GameSession();
  const snapshots:Array<{bookmark?:HubBookmark;completed:string[];scene?:string}>=[];
  let director:SceneDirector;
  const scene=(entry:SceneEntry):GameScene=>({id:entry.scene,scene:{} as GameScene['scene'],camera:{} as GameScene['camera'],effects:{time:0,degraded:0},
    activate(){},update(){},resize(){},setPaused(){},restart(){},dispose(){},debug(){return {};}});
  director=new SceneDirector({session,create:async entry=>scene(entry),hooks:{switch(){},loading(){},error(){},clearInput(){},
    settled(){snapshots.push({bookmark:session.bookmark,completed:[...session.completed],scene:director.active?.id});}}});
  await director.open({scene:'mars-hub'});
  await director.request({kind:'enter-memory',entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01'},bookmark});
  assert.deepEqual(snapshots.at(-1),{bookmark,completed:[],scene:'episode-rover-01'});
  await director.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',outcome:'completed'}});
  assert.deepEqual(snapshots.at(-1),{bookmark,completed:['wreck-rover-01'],scene:'mars-hub'});
});
