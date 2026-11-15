import type {FinaleState} from '../../app/finale.ts';

export const ENDING_BEATS=[
  {id:'settle',duration:4},{id:'discoveries',duration:8},{id:'legacy',duration:10},
  {id:'curiosity',duration:9},{id:'closure',duration:8},
] as const;
export type EpilogueBeat=typeof ENDING_BEATS[number]['id']|'complete';
/** Only active update time advances presentation. There is deliberately no input API. */
export class EpilogueProgress {
  beat:EpilogueBeat='settle';
  elapsed=0;
  activeTime=0;
  private index=0;
  readonly state:FinaleState;
  constructor(state:FinaleState){this.state=state;}
  restart(){this.index=0;this.beat='settle';this.elapsed=0;this.activeTime=0;}
  skip(){if(this.beat==='complete')return;this.beat='complete';this.elapsed=0;this.state.status='complete';}
  update(dt:number,paused=false){
    if(paused||!Number.isFinite(dt)||dt<=0||dt>.25)return;
    if(this.beat==='complete'){this.elapsed=Math.min(.8,this.elapsed+dt);return;}
    const step=Math.min(dt,.1),duration=ENDING_BEATS[this.index].duration;
    this.elapsed+=step;this.activeTime+=step;
    if(this.elapsed+1e-8<duration)return;
    this.index++;this.elapsed=0;
    if(this.index===ENDING_BEATS.length)this.skip();
    else this.beat=ENDING_BEATS[this.index].id;
  }
}
/** Setup-time clearance check against the SAME bounds/solids used by the controller. */
export function departureRoute(x:number,z:number,solids:readonly {x:number;z:number;radius:number}[],height:(x:number,z:number)=>number,bounds?:{minX:number;maxX:number;minZ:number;maxZ:number}) {
  let best={dx:0,dz:1,length:0};
  for(let i=0;i<32;i++){
    const angle=-.6+i*Math.PI*2/32,dx=Math.cos(angle),dz=Math.sin(angle);
    let length=0,previous=height(x,z);
    for(let d=.25;d<=18;d+=.25){
      const px=x+dx*d,pz=z+dz*d,h=height(px,pz);
      if(bounds?(px<bounds.minX+.6||px>bounds.maxX-.6||pz<bounds.minZ+.6||pz>bounds.maxZ-.6):Math.hypot(px,pz)>62)break;
      if(solids.some(s=>Math.hypot(px-s.x,pz-s.z)<s.radius+.6)||!Number.isFinite(h)||Math.abs(h-previous)>.25)break;
      length=d;previous=h;
    }
    if(length>best.length)best={dx,dz,length};
    if(length===18)break;
  }
  return best;
}
