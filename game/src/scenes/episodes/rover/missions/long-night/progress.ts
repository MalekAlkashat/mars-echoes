export const NIGHT_PHASES=['arrival','storm','silence','archive','recovery','legacy'] as const;
export type NightPhase=typeof NIGHT_PHASES[number];
export const STORM_SECONDS=16;
// Preserve the original checkpoint scale; only playback speed changes.
export const STORM_PROGRESS=40;
export const ENERGY_RATE=1.6*STORM_PROGRESS/STORM_SECONDS;
// Compatibility only: preserve the reserve previously displayed by a valid old save.
export function legacyNightReserve(phase:NightPhase,elapsed:number,imaging:boolean,science:boolean){
 const s=phase==='arrival'?0:phase==='storm'?Math.min(1,elapsed/STORM_PROGRESS):1;
 return 100-s*(imaging?23:38)-s*(science?22:37);
}
export class LongNight {
 phase:NightPhase='arrival'; elapsed=0; imaging=false; science=false; reserve=100;
 enter(phase:NightPhase){this.phase=phase;this.elapsed=0;}
 get obscuration(){return this.phase==='arrival'?0:this.phase==='storm'?Math.min(1,this.elapsed/STORM_PROGRESS):1;}
 // Authored, unitless teaching model. No watts, battery capacity, tau or fault threshold.
 get solarInput(){return .04+.31*(1-this.obscuration)**2;}
 get demand(){return 1-(this.imaging?.25:0)-(this.science?.25:0);}
 get drain(){return ENERGY_RATE*(this.demand-this.solarInput);}
 suspend(service:'imaging'|'science'){if(this.phase!=='storm'||this[service])return false;this[service]=true;return true;}
 update(dt:number){
  if(!Number.isFinite(dt)||dt<=0||this.phase!=='storm')return;
  const modelDt=dt*STORM_PROGRESS/STORM_SECONDS;
  const start=this.elapsed,end=Math.min(STORM_PROGRESS,start+modelDt);
  // Analytic integration of the authored solar curve makes 30/60/120 Hz agree.
  const solar=.04*modelDt+.31*STORM_PROGRESS/3*((1-start/STORM_PROGRESS)**3-(1-end/STORM_PROGRESS)**3);
  this.reserve=Math.max(0,this.reserve-1.6*(this.demand*modelDt-solar));
  this.elapsed=end;
  // The scene advances after peak, allowing recent service feedback to finish.
 }
 reset(){this.phase='arrival';this.elapsed=0;this.imaging=false;this.science=false;this.reserve=100;}
}
