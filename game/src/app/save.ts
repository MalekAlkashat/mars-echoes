import type { HubBookmark, RoverCheckpoint, SceneEntry, OpportunityJourney } from './contracts.ts';
import {parseFinale,type FinaleState} from './finale.ts';
import {parsePurgatoryData} from '../scenes/episodes/rover/missions/purgatory/checkpoint.ts';
import {legacyNightReserve,type NightPhase} from '../scenes/episodes/rover/missions/long-night/progress.ts';

export const SAVE_KEY = 'mars-echoes.save.v2';
export const BACKUP_SAVE_KEY = 'mars-echoes.save.v2.backup';
export const LEGACY_SAVE_KEY = 'mars-echoes.save.v1';
export type ExplorationSave = {version:2; savedAt:number; entry:SceneEntry; bookmark?:HubBookmark; completed:string[]; chapters?:string[]; skills?:string[]; journey?:OpportunityJourney; opportunityComplete?:boolean; opportunityEncountered?:boolean; finale?:FinaleState};
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
  if(value.kind==='purgatory'){
    const data=parsePurgatoryData(value);
    return data?{...common,kind:'purgatory',...data}:undefined;
  }
  if(value.kind==='long-night'){
    if(Math.abs(common.position[0])>30||Math.abs(common.position[1])>30||!['arrival','storm','silence','archive','recovery','legacy'].includes(String(value.phase))||!inRange(value.elapsed,0,40)||typeof value.imaging!=='boolean'||typeof value.science!=='boolean')return;
    if(value.phase!=='storm'&&value.elapsed!==0)return;
    if(value.reserve!==undefined&&!inRange(value.reserve,0,100))return;
    const phase=value.phase as NightPhase;
    return {...common,kind:'long-night',phase,elapsed:value.elapsed,imaging:value.imaging,science:value.science,
      reserve:value.reserve??legacyNightReserve(phase,value.elapsed,value.imaging,value.science)};
  }
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
  if(value.journey!==undefined&&value.journey!==true)return;
  if(!resume&&!(value.journey===true&&value.resume===undefined&&['blueberry-clue','purgatory','long-night'].includes(String(value.chapter))))return;
  if(value.chapter!==undefined&&value.chapter!=='blueberry-clue'&&value.chapter!=='purgatory'&&value.chapter!=='long-night')return;
  if(value.chapter==='blueberry-clue'&&resume&&resume.kind!=='blueberry-clue')return;
  if(value.chapter==='long-night'&&resume&&resume.kind!=='long-night')return;
  if(value.chapter==='purgatory'&&resume&&resume.kind!=='purgatory')return;
  return {scene:'episode-rover-01',wreckId:value.wreckId,...((resume?.kind==='blueberry-clue'||resume?.kind==='purgatory'||resume?.kind==='long-night')?{chapter:resume.kind}:value.journey===true?{chapter:value.chapter as OpportunityJourney['chapter']}:{}),...(value.journey===true?{journey:true as const}:{}),...(resume?{resume}:{})};
}
/** Parse and copy only known fields. Invalid runtime numbers never replace a good save. */
export function parseSave(raw:string|null):ExplorationSave|undefined {
  try {
    const value:unknown=JSON.parse(raw??'null');
    if(!record(value)||!Array.isArray(value.completed)||!value.completed.every(id=>id==='wreck-rover-01'))return;
    const b=value.bookmark===undefined?undefined:bookmark(value.bookmark);
    if(value.bookmark!==undefined&&!b)return;
    if(value.version===1)return {version:2,savedAt:0,entry:{scene:'mars-hub',...(b?{bookmark:b}:{})},bookmark:b,completed:[...new Set<string>(value.completed)]};
    if(value.chapters!==undefined&&(!Array.isArray(value.chapters)||!value.chapters.every(id=>id==='blueberry-clue'||id==='purgatory'||id==='long-night')))return;
    if(value.skills!==undefined&&(!Array.isArray(value.skills)||!value.skills.every(id=>id==='grind'||id==='sand'||id==='sunlight'||id==='overtime')))return;
    if(value.opportunityEncountered!==undefined&&typeof value.opportunityEncountered!=='boolean')return;
    const chapters=[...new Set<string>((value.chapters??[]) as string[])];
    const skills=[...new Set<string>((value.skills??[]) as string[])];
    if(skills.includes('overtime')&&!chapters.includes('purgatory'))return;
    if(chapters.includes('purgatory')!==skills.includes('sand'))return;
    if(chapters.includes('long-night')!==skills.includes('sunlight'))return;
    if(chapters.includes('blueberry-clue')!==skills.includes('grind'))return;
    const finale=value.finale===undefined?undefined:parseFinale(value.finale);
    if(value.finale!==undefined&&(!finale||!chapters.includes('long-night')))return;
    if(value.version!==2||!inRange(value.savedAt,0,1e15))return;
    const entry=sceneEntry(value.entry);
    if(!entry)return;
    let journey:OpportunityJourney|undefined;
    if(value.journey!==undefined){
      const j=value.journey;
      if(!record(j)||!['blueberry-clue','purgatory','long-night'].includes(String(j.chapter)))return;
      const jb=bookmark(j.bookmark),jr=j.resume===undefined?undefined:checkpoint(j.resume);
      if(!jb||(j.resume!==undefined&&(!jr||jr.kind!==j.chapter)))return;
      if(j.boundary!==undefined&&j.boundary!=='next'&&j.boundary!=='return')return;
      if(j.boundary==='return'&&(j.chapter!=='long-night'||!chapters.includes('long-night')&&!['blueberry-clue','purgatory'].every(id=>chapters.includes(id))))return;
      if(j.boundary==='next'&&(j.resume!==undefined||j.chapter==='blueberry-clue'||!chapters.includes(j.chapter==='purgatory'?'blueberry-clue':'purgatory')))return;
      journey={chapter:j.chapter as OpportunityJourney['chapter'],bookmark:jb,...(jr?{resume:jr}:{}),...(j.boundary?{boundary:j.boundary}:{})};
    }
    if(entry.scene==='episode-rover-01'&&entry.journey&&(!journey||entry.chapter!==journey.chapter))return;
    if(value.opportunityComplete!==undefined&&typeof value.opportunityComplete!=='boolean')return;
    if(value.opportunityComplete&&!['blueberry-clue','purgatory','long-night'].every(id=>chapters.includes(id)))return;
    return {version:2,savedAt:value.savedAt,entry,...(journey?{journey}:{}),...(value.opportunityComplete!==undefined?{opportunityComplete:value.opportunityComplete}:{}),bookmark:b,...(finale?{finale}:{}),...(value.opportunityEncountered!==undefined?{opportunityEncountered:value.opportunityEncountered}:{}),...(value.chapters!==undefined?{chapters,skills}:{}),completed:[...new Set<string>(value.completed)]};
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
