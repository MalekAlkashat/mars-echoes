import { Vector3 } from 'three';
import type { RockSurface } from '../../core/rock-surface.ts';
import type { RoverContactConfig } from './grounding.ts';

/** Wheel-envelope support plus conservative step/belly checks for the kinematic rover. */
export class StoneTraversal {
  heading=0;
  private readonly sample=new Vector3();
  readonly surface:RockSurface;
  private readonly config:RoverContactConfig;
  constructor(surface:RockSurface, config:RoverContactConfig) {this.surface=surface;this.config=config;}

  wheelHeight=(x:number,z:number):number=>{
    const r=this.config.wheelRadius,s=Math.sin(this.heading),c=Math.cos(this.heading);
    let support=this.surface.height(x,z);
    const base=this.surface.terrain(x,z);
    // A cubic profile with zero endpoint slopes spreads loading across the tyre approach.
    // Dense spatial samples avoid the old seven-sample support popping at grid edges.
    for(let i=-16;i<=16;i++){
      const d=2*r*i/16,t=1-Math.abs(i)/16;
      const weight=t*t*(3-2*t);
      const h=this.surface.height(x-s*d,z-c*d);
      if(h-base<=r*.78) support=Math.max(support,base+Math.max(0,h-base)*weight);
    }
    return support;
  };

  speedScale(x:number,z:number,heading:number,direction:number):number {
    if(!this.surface.cells||!direction)return 1;
    const sine=Math.sin(heading),cosine=Math.cos(heading);
    for(const point of this.config.wheelPoints){
      const px=x+point.x*cosine+point.z*sine,pz=z-point.x*sine+point.z*cosine;
      for(const distance of [0,.2,.45,.7]){
        const sx=px-sine*distance*direction,sz=pz-cosine*distance*direction;
        if(this.surface.height(sx,sz)-this.surface.terrain(sx,sz)>.025)return .28;
      }
    }
    return 1;
  }

  canMove(x:number,z:number,nextX:number,nextZ:number,heading:number,previousHeading=heading):boolean {
    if(Math.hypot(nextX-x,nextZ-z)<1e-9&&Math.abs(heading-previousHeading)<1e-9)return true;
    const r=this.config.wheelRadius,limit=r*.78;
    const sine=Math.sin(heading),cosine=Math.cos(heading);
    const oldSine=Math.sin(previousHeading),oldCosine=Math.cos(previousHeading);
    let supportedHeight=0;
    for(const point of this.config.wheelPoints){
      const px=x+point.x*oldCosine+point.z*oldSine,pz=z-point.x*oldSine+point.z*oldCosine;
      const nx=nextX+point.x*cosine+point.z*sine,nz=nextZ-point.x*sine+point.z*cosine;
      const dx=nx-px,dz=nz-pz,length=Math.hypot(dx,dz);
      // Sample the leading tyre edge: an oversized ledge stops the tyre before its axle enters it.
      const leadX=length>1e-9?px+dx/length*r:px,leadZ=length>1e-9?pz+dz/length*r:pz;
      const old=this.surface.height(px,pz),lead=this.surface.height(leadX,leadZ);
      const rise=lead-old;
      if(rise>limit)return false;
      for(let edge=0;edge<12;edge++){
        const angle=edge*Math.PI/6,ex=Math.sin(angle)*r,ez=Math.cos(angle)*r;
        if(this.surface.height(nx+ex,nz+ez)-this.surface.height(px+ex,pz+ez)>limit)return false;
      }
      const oldSupport=this.wheelHeight(px,pz),nextSupport=this.wheelHeight(nx,nz);
      if(nextSupport-oldSupport>limit)return false;
      supportedHeight+=nextSupport/6;
    }
    // A stone between the tracks can ground the belly even when all tyres miss it.
    for(const lateral of [-.2,0,.2])for(const longitudinal of [-.3,0,.3]){
      this.sample.set(nextX+lateral*cosine+longitudinal*sine,0,nextZ-lateral*sine+longitudinal*cosine);
      if(this.surface.height(this.sample.x,this.sample.z)>supportedHeight+r*1.7)return false;
    }
    return true;
  }
}
