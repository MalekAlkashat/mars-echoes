import {LEVELS, ROVER, SITE} from './site.ts';
import {softness, TRENCH_CAP, type Ground} from './field.ts';

export const SAVED_PHASES = ['replay','recover','outro','sand','archive','end'] as const;
export type SavedPurgatoryPhase = typeof SAVED_PHASES[number];
export type PurgatoryCheckpointData = {
  phase: SavedPurgatoryPhase; phaseTime: number; wheelAngle: number;
  cameraMode: 'chase'|'wheel-lf'|'wheel-rf'|'wheel-rear'|'overview'|'lookback';
  wheelMetres: number; movedMetres: number;
  /** Sparse, bounded copies of the scene's actual soil grid: index, sink, berm. */
  deformation: [number,number,number][];
};
const level=LEVELS[LEVELS.length-1];
const nx=Math.round((level.rect[2]-level.rect[0])/level.cell);
const nz=Math.round((level.rect[3]-level.rect[1])/level.cell);
const between=(n:unknown,lo:number,hi:number):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=lo&&n<=hi;

export function poseInside(x:number,z:number,heading:number):boolean {
  const c=Math.cos(heading),s=Math.sin(heading),r=SITE.envelope;
  return z<=SITE.deepLimitZ&&[-ROVER.halfWidth,ROVER.halfWidth].every(lx=>[-ROVER.frontExtent,ROVER.rearExtent].every(lz=>{
    const px=x+lx*c+lz*s,pz=z-lx*s+lz*c;
    return px>=r[0]&&px<=r[2]&&pz>=r[1]&&pz<=r[3];
  }));
}
export function recoveredPose(x:number,z:number,heading:number):boolean {
  const c=Math.cos(heading),s=Math.sin(heading);
  return z<=SITE.escape.z+.9&&ROVER.wheels.every(([lx,lz])=>softness(x+lx*c+lz*s,z-lx*s+lz*c)===0);
}
export function parsePurgatoryData(v:Record<string,unknown>):PurgatoryCheckpointData|undefined {
  const p=v.position;
  if(!Array.isArray(p)||!between(p[0],-30,30)||!between(p[1],-34,26)||!between(v.heading,-1e10,1e10)||!poseInside(p[0],p[1],v.heading))return;
  if(!SAVED_PHASES.includes(v.phase as SavedPurgatoryPhase)||!between(v.phaseTime,0,1e9)||!between(v.wheelAngle,-1e10,1e10)||
    !between(v.wheelMetres,0,1e10)||!between(v.movedMetres,0,1e10)||
    !['chase','wheel-lf','wheel-rf','wheel-rear','overview','lookback'].includes(String(v.cameraMode))||
    !Array.isArray(v.deformation)||v.deformation.length>(nx+1)*(nz+1))return;
  if(['outro','sand','archive','end'].includes(String(v.phase))&&!recoveredPose(p[0],p[1],v.heading))return;
  if(v.phase==='replay'&&(v.phaseTime!==0||v.deformation.length||p[0]!==SITE.observe.x||p[1]!==SITE.observe.z||v.heading!==SITE.observe.heading))return;
  const seen=new Set<number>(),deformation:[number,number,number][]=[];
  for(const cell of v.deformation){
    if(!Array.isArray(cell)||cell.length!==3||!Number.isInteger(cell[0])||!between(cell[0],0,(nx+1)*(nz+1)-1)||
      !between(cell[1],0,TRENCH_CAP+1e-7)||!between(cell[2],0,TRENCH_CAP*.55+1e-7)||seen.has(cell[0]))return;
    const ix=cell[0]%(nx+1),iz=Math.floor(cell[0]/(nx+1));
    if(ix<2||ix>nx-2||iz<2||iz>nz-2)return;
    seen.add(cell[0]);deformation.push([cell[0],cell[1],cell[2]]);
  }
  return {phase:v.phase as SavedPurgatoryPhase,phaseTime:v.phaseTime,wheelAngle:v.wheelAngle,
    cameraMode:v.cameraMode as PurgatoryCheckpointData['cameraMode'],wheelMetres:v.wheelMetres,movedMetres:v.movedMetres,deformation};
}
export function saveSoil(ground:Ground):PurgatoryCheckpointData['deformation'] {
  const cells:PurgatoryCheckpointData['deformation']=[];
  for(let i=0;i<ground.sink.length;i++)if(ground.sink[i]||ground.berm[i])cells.push([i,ground.sink[i],ground.berm[i]]);
  return cells;
}
export function restoreSoil(ground:Ground,cells:PurgatoryCheckpointData['deformation']):void {
  ground.reset();
  for(const [index,sink,berm]of cells){ground.sink[index]=sink;ground.berm[index]=berm;}
}
