import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSave} from '../src/app/save.ts';
import {journalRecords} from '../src/content/robot-journal.ts';

test('a final return checkpoint preserves journal progress without prematurely awarding sunlight or an ending',()=>{
  const bookmark={position:[0,1,-22],heading:0,cameraYaw:0,cameraPitch:.12,cameraDistance:5.8};
  const resume={kind:'long-night',phase:'legacy',position:[0,2],heading:0,cameraYaw:0,cameraPitch:.2,cameraDistance:5.8,started:true,time:40,elapsed:0,imaging:false,science:false,reserve:12};
  const save={version:2,savedAt:1,bookmark,completed:[],chapters:['blueberry-clue','purgatory'],skills:['grind','sand','overtime'],opportunityEncountered:true,opportunityComplete:false,
    entry:{scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night',journey:true,resume},journey:{chapter:'long-night',bookmark,boundary:'return',resume}};
  const restored=parseSave(JSON.stringify(save));
  assert.deepEqual(restored,save);
  assert.equal(restored.finale,undefined);
  const records=journalRecords({chapters:new Set(restored.chapters),opportunityEncountered:true});
  assert.equal(records[0].memories.length,2);
  assert.equal(records.find(record=>record.id==='ingenuity')!.available,false);
  assert.equal(parseSave(JSON.stringify({...save,finale:{status:'pending',presentation:'slideshow-v2'}})),undefined);
});
