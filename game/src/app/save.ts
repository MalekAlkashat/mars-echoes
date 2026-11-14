import type { HubBookmark, RoverCheckpoint, SceneEntry } from './contracts.ts';

export const SAVE_KEY = 'mars-echoes.save.v2';
export const BACKUP_SAVE_KEY = 'mars-echoes.save.v2.backup';
export const LEGACY_SAVE_KEY = 'mars-echoes.save.v1';
export type ExplorationSave = {version:2; savedAt:number; entry:SceneEntry; bookmark?:HubBookmark; completed:string[]; chapters?:string[]; skills?:string[]};
export type SaveStorage = Pick<Storage,'getItem'|'setItem'> & Partial<Pick<Storage,'removeItem'>>;
export type SaveRead = {save?:ExplorationSave; source:'primary'|'backup'|'legacy'|'empty'|'invalid'|'unavailable'};
const phases=['ready','drive','scan','extract','align','insert','calibrate','relay','transmit','end'];
const finite = (n:unknown):n is number => typeof n==='number'&&Number.isFinite(n);
const inRange=(n:unknown,min:number,max:number):n is number=>finite(n)&&n>=min&&n<=max;
const record=(n:unknown):n is Record<string,unknown>=>Boolean(n)&&typeof n==='object'&&!Array.isArray(n);

function bookmark(value:unknown):HubBookmark|undefined {
  if(!record(value)||!Array.isArray(value.position)||value.position.length!==3||!value.position.every(finite)||
    Math.hypot(value.position[0],value.position[2])>64||Math.abs(value.position[1])>100||
    !finite(value.heading)||!finite(value.cameraYaw)||!inRange(value.cameraPitch,-Math.PI,Math.PI)||!inRange(value.cameraDistance,1,30))return;
  return {position:[...value.position] as [number,number,number],heading:value.heading,
    cameraYaw:value.cameraYaw,cameraPitch:value.cameraPitch,cameraDistance:value.cameraDistance};
}
function checkpoint(value:unknown):RoverCheckpoint|undefined {
  if(!record(value)||!Array.isArray(value.position)||value.position.length!==2||!value.position.every(finite)||
    Math.hypot(...value.position as [number,number])>64||!finite(value.heading)||!finite(value.cameraYaw)||
    !inRange(value.cameraPitch,-Math.PI,Math.PI)||!inRange(value.cameraDistance,1,30)||
    typeof value.started!=='boolean'||!inRange(value.time,0,1e10))return;
  const common={position:[...value.position] as [number,number],heading:value.heading,cameraYaw:value.cameraYaw,
    cameraPitch:value.cameraPitch,cameraDistance:value.cameraDistance,started:value.started,time:value.time};
  if(value.kind==='blueberry-clue'){
    if(Math.abs(common.position[0])>12||Math.abs(common.position[1])>12||!['approach','brush','grind','inspect','compare','water','evidence'].includes(String(value.phase)))return;
    return {...common,kind:'blueberry-clue',phase:value.phase as Extract<RoverCheckpoint,{kind:'blueberry-clue'}>['phase']};
  }
  if(value.kind==='opportunity'&&typeof value.optical==='boolean')return {...common,kind:'opportunity',optical:value.optical};
  if(value.kind!=='repair'||!phases.includes(String(value.phase))||!inRange(value.elapsed,0,1e10)||
    !record(value.offset)||!inRange(value.offset.x,-.3,.3)||!inRange(value.offset.y,-.25,.25)||!inRange(value.offset.angle,-1.3,1.3)||
    !Number.isInteger(value.failedAttempts)||!inRange(value.failedAttempts,0,1e9)||typeof value.repaired!=='boolean'||
    !finite(value.serviceHeading)||!inRange(value.opticalRemaining,0,3))return;
  if(value.repaired!==['calibrate','relay','transmit','end'].includes(String(value.phase)))return;
  return {...common,kind:'repair',phase:value.phase as Extract<RoverCheckpoint,{kind:'repair'}>['phase'],elapsed:value.elapsed,
    offset:{x:value.offset.x,y:value.offset.y,angle:value.offset.angle},failedAttempts:value.failedAttempts,
    repaired:value.repaired,serviceHeading:value.serviceHeading,opticalRemaining:value.opticalRemaining};
}
function sceneEntry(value:unknown):SceneEntry|undefined {
  if(!record(value))return;
  if(value.scene==='mars-hub'){
    const b=value.bookmark===undefined?undefined:bookmark(value.bookmark);
    if(value.bookmark!==undefined&&!b)return;
    return {scene:'mars-hub',...(b?{bookmark:b}:{})};
  }
  if(value.scene!=='episode-rover-01'||value.wreckId!=='wreck-rover-01')return;
  const resume=checkpoint(value.resume);
  if(!resume)return;
  if(value.chapter!==undefined&&value.chapter!=='blueberry-clue')return;
  if(value.chapter==='blueberry-clue'&&resume.kind!=='blueberry-clue')return;
  return {scene:'episode-rover-01',wreckId:value.wreckId,...(resume.kind==='blueberry-clue'?{chapter:'blueberry-clue' as const}:{}),resume};
}
/** Parse and copy only known fields. Invalid runtime numbers never replace a good save. */
export function parseSave(raw:string|null):ExplorationSave|undefined {
  try {
    const value:unknown=JSON.parse(raw??'null');
    if(!record(value)||!Array.isArray(value.completed)||!value.completed.every(id=>id==='wreck-rover-01'))return;
    const b=value.bookmark===undefined?undefined:bookmark(value.bookmark);
    if(value.bookmark!==undefined&&!b)return;
    if(value.version===1)return {version:2,savedAt:0,entry:{scene:'mars-hub',...(b?{bookmark:b}:{})},bookmark:b,completed:[...new Set<string>(value.completed)]};
    if(value.chapters!==undefined&&(!Array.isArray(value.chapters)||!value.chapters.every(id=>id==='blueberry-clue')))return;
    if(value.skills!==undefined&&(!Array.isArray(value.skills)||!value.skills.every(id=>id==='grind')))return;
    const chapters=[...new Set<string>((value.chapters??[]) as string[])];
    const skills=[...new Set<string>((value.skills??[]) as string[])];
    if(chapters.includes('blueberry-clue')!==skills.includes('grind'))return;
    if(value.version!==2||!inRange(value.savedAt,0,1e15))return;
    const entry=sceneEntry(value.entry);
    if(!entry)return;
    return {version:2,savedAt:value.savedAt,entry,bookmark:b,...(value.chapters!==undefined?{chapters,skills}:{}),completed:[...new Set<string>(value.completed)]};
  }catch{return;}
}
export function readSaveRecord(storage?:SaveStorage):SaveRead {
  try {
    const target=storage??localStorage;
    const primary=target.getItem(SAVE_KEY);
    const current=parseSave(primary);
    if(current)return {save:current,source:'primary'};
    const backup=target.getItem(BACKUP_SAVE_KEY);
    const recovered=parseSave(backup);
    if(recovered)return {save:recovered,source:'backup'};
    const legacy=target.getItem(LEGACY_SAVE_KEY);
    const migrated=parseSave(legacy);
    if(migrated)return {save:migrated,source:'legacy'};
    return {source:primary||backup||legacy?'invalid':'empty'};
  }catch{return {source:'unavailable'};}
}
export function readSave(storage?:SaveStorage):ExplorationSave|undefined {return readSaveRecord(storage).save;}
export function writeSave(value:ExplorationSave,storage?:SaveStorage,options:{replaceBackup?:boolean}={}):boolean {
  try {
    const normalized=parseSave(JSON.stringify(value));
    if(!normalized||value.version!==2)return false;
    const target=storage??localStorage;
    const prior=target.getItem(SAVE_KEY);
    // Keep the last valid primary; a malformed primary must not poison the backup.
    if(options.replaceBackup)target.setItem(BACKUP_SAVE_KEY,JSON.stringify(normalized));
    else if(prior&&parseSave(prior))target.setItem(BACKUP_SAVE_KEY,prior);
    else if(!parseSave(target.getItem(BACKUP_SAVE_KEY)))target.setItem(BACKUP_SAVE_KEY,JSON.stringify(normalized));
    target.setItem(SAVE_KEY,JSON.stringify(normalized));
    // A confirmed New Game retires every older journey only AFTER a valid replacement was written.
    if(options.replaceBackup){
      if(target.removeItem)target.removeItem(LEGACY_SAVE_KEY);
      else target.setItem(LEGACY_SAVE_KEY,JSON.stringify(normalized));
    }
    return true;
  }catch{return false;}
}
