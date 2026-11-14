import type { MissionPhase } from '../../../../../app/contracts.ts';

export class Discovery {
  phase:MissionPhase='approach';
  elapsed=0;
  hold=0;
  comparison=0;
  private deliberateHold=false;
  enter(phase:MissionPhase){this.phase=phase;this.elapsed=0;this.cancelHold();}
  cancelHold(){this.hold=0;this.deliberateHold=false;}
  act(near=false){
    if(this.phase==='approach'&&near)this.enter('brush');
    else if(this.phase==='inspect')this.enter('compare');
    else if(this.phase==='compare'){if(++this.comparison>=2)this.enter('water');}
    else if(this.phase==='water')this.enter('evidence');
  }
  update(dt:number,held:boolean,pressed:boolean){
    if(!Number.isFinite(dt)||dt<0)return;
    const step=Math.min(dt,.05);this.elapsed+=step;
    if(this.phase==='brush'&&this.elapsed>=2.5)this.enter('grind');
    else if(this.phase==='grind'){
      if(pressed&&held)this.deliberateHold=true;
      if(!held)this.cancelHold();
      if(held&&this.deliberateHold){this.hold+=step;if(this.hold>=3)this.enter('inspect');}
    }else if(this.phase==='water'&&this.elapsed>=12)this.enter('evidence');
  }
  restore(phase:MissionPhase){this.comparison=0;this.enter(phase==='brush'?'approach':phase==='water'?'compare':phase);}
}
