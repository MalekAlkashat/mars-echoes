import type { MapSnapshot } from '../app/contracts';
import { mapDistance, mapHeading, projectToMap } from './map-projection';
import './world-map.css';

const SIZE=896,SAMPLES=161;

function terrainImage(snapshot:MapSnapshot):string {
  const {bounds,heightAt}=snapshot;
  const spanX=bounds.maxX-bounds.minX,spanZ=bounds.maxZ-bounds.minZ;
  const stepX=spanX/(SAMPLES-1),stepZ=spanZ/(SAMPLES-1);
  const heights=new Float32Array(SAMPLES*SAMPLES);
  let low=Infinity,high=-Infinity;
  for(let y=0;y<SAMPLES;y++)for(let x=0;x<SAMPLES;x++){
    const height=heightAt(bounds.minX+x*stepX,bounds.minZ+y*stepZ);
    heights[y*SAMPLES+x]=height;low=Math.min(low,height);high=Math.max(high,height);
  }
  const sample=(x:number,y:number)=>heights[Math.max(0,Math.min(SAMPLES-1,y))*SAMPLES+Math.max(0,Math.min(SAMPLES-1,x))];
  const raster=document.createElement('canvas');raster.width=raster.height=SAMPLES;
  const rasterContext=raster.getContext('2d')!;
  const pixels=rasterContext.createImageData(SAMPLES,SAMPLES);
  const dark=[93,56,40],middle=[161,106,72],light=[224,180,126];
  for(let y=0;y<SAMPLES;y++)for(let x=0;x<SAMPLES;x++){
    const value=(sample(x,y)-low)/Math.max(1,high-low);
    const a=value<.53?dark:middle,b=value<.53?middle:light,t=value<.53?value/.53:(value-.53)/.47;
    const dx=(sample(x+1,y)-sample(x-1,y))/(2*stepX),dz=(sample(x,y+1)-sample(x,y-1))/(2*stepZ);
    const shade=.69+.44*Math.max(0,(.57*dx+.45*dz+.69)/Math.hypot(dx,1,dz));
    const grain=(Math.sin(x*127.1+y*311.7)*43758.5453)%1*2;
    const offset=(y*SAMPLES+x)*4;
    for(let c=0;c<3;c++)pixels.data[offset+c]=(a[c]+(b[c]-a[c])*t)*shade+grain;
    pixels.data[offset+3]=255;
  }
  rasterContext.putImageData(pixels,0,0);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;
  const context=canvas.getContext('2d')!;
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
  context.drawImage(raster,0,0,SIZE,SIZE);

  // March the sampled heightfield: contour lines describe the same actual valley.
  const contourInterval=2,cellScale=SIZE/(SAMPLES-1);
  for(let level=Math.ceil(low/contourInterval)*contourInterval;level<=high;level+=contourInterval){
    context.beginPath();
    for(let y=0;y<SAMPLES-1;y++)for(let x=0;x<SAMPLES-1;x++){
      const corners=[[x,y,sample(x,y)],[x+1,y,sample(x+1,y)],
        [x+1,y+1,sample(x+1,y+1)],[x,y+1,sample(x,y+1)]];
      const crossings:number[][]=[];
      for(let edge=0;edge<4;edge++){
        const a=corners[edge],b=corners[(edge+1)%4];
        if((a[2]<level)===(b[2]<level))continue;
        const f=(level-a[2])/(b[2]-a[2]);
        crossings.push([(a[0]+(b[0]-a[0])*f)*cellScale,(a[1]+(b[1]-a[1])*f)*cellScale]);
      }
      for(let i=0;i+1<crossings.length;i+=2){
        context.moveTo(crossings[i][0],crossings[i][1]);context.lineTo(crossings[i+1][0],crossings[i+1][1]);
      }
    }
    context.strokeStyle=level%4===0?'rgba(51,31,25,.39)':'rgba(59,35,25,.23)';
    context.lineWidth=level%4===0?1.7:1;context.stroke();
  }
  let seed=492711;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  context.fillStyle='rgba(39,25,20,.17)';
  for(let i=0;i<2300;i++){
    const x=random()*SIZE,y=random()*SIZE,r=.35+random()*.65;
    context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill();
  }
  const origin=projectToMap([0,0],bounds);
  const rx=snapshot.playableRadius/spanX*SIZE,ry=snapshot.playableRadius/spanZ*SIZE;
  context.save();
  context.beginPath();context.rect(0,0,SIZE,SIZE);
  context.ellipse(origin.x*SIZE,origin.y*SIZE,rx,ry,0,0,Math.PI*2,true);
  context.fillStyle='rgba(34,23,19,.49)';context.fill('evenodd');
  context.restore();
  context.beginPath();context.ellipse(origin.x*SIZE,origin.y*SIZE,rx,ry,0,0,Math.PI*2);
  context.setLineDash([6,9]);context.strokeStyle='rgba(241,207,157,.56)';context.lineWidth=1.5;context.stroke();context.setLineDash([]);
  const vignette=context.createRadialGradient(SIZE*.5,SIZE*.5,SIZE*.2,SIZE*.5,SIZE*.5,SIZE*.73);
  vignette.addColorStop(0,'rgba(36,21,16,0)');vignette.addColorStop(1,'rgba(36,21,16,.36)');
  context.fillStyle=vignette;context.fillRect(0,0,SIZE,SIZE);
  context.strokeStyle='rgba(228,185,125,.5)';context.lineWidth=2;context.strokeRect(1,1,SIZE-2,SIZE-2);
  return canvas.toDataURL('image/png');
}

/** Paused local cartography. The application owns input listeners and modal inertness. */
export class WorldMap {
  readonly root=document.createElement('section');
  private readonly events=new AbortController();
  private readonly cache=new Map<string,string>();
  private readonly field:HTMLElement;
  private readonly player:HTMLElement;
  private readonly objective:HTMLElement;
  constructor(private readonly closeCallback:()=>void){
    this.root.className='world-map';this.root.hidden=true;
    this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-labelledby','world-map-title');
    this.root.innerHTML=`<div class="world-map-panel">
      <header class="world-map-header"><div><p class="world-map-kicker">Mars · field atlas</p><h2 id="world-map-title">Terrain map</h2></div><button class="world-map-close" aria-label="Close map"><span aria-hidden="true">×</span><span>Close map</span></button></header>
      <div class="world-map-body">
        <div class="world-map-figure"><div class="world-map-field" role="img" aria-label="Local terrain relief">
          <div class="world-map-north" aria-hidden="true"><span>N</span><i></i></div>
          <div class="world-map-objective" data-map-objective role="img" aria-label="Objective"><i></i></div>
          <div class="world-map-player" data-map-player role="img" aria-label="Your position"><i></i><span>You</span></div>
          <div class="world-map-scale" aria-hidden="true"><span>20 m</span><i></i></div>
        </div></div>
        <aside class="world-map-info"><div class="world-map-place"><p class="world-map-kicker">Local survey</p><h3></h3><p>Elevation contours · 2 m</p></div>
          <div class="world-map-legend"><p><i class="world-map-you-key"></i><span>Your position</span></p><p class="world-map-objective-key"><i></i><span>Objective</span></p></div>
          <div class="world-map-destination"><p class="world-map-kicker">Tracked destination</p><h4></h4><p class="world-map-distance"><strong></strong><span>m away</span></p></div>
          <p class="world-map-boundary"><i></i><span>Exploration boundary</span></p>
        </aside>
      </div>
      <footer class="world-map-footer"><span>Local terrain · north up</span><p><kbd>M</kbd> / <kbd>Esc</kbd> Return</p></footer>
    </div>`;
    this.field=this.root.querySelector<HTMLElement>('.world-map-field')!;
    this.player=this.root.querySelector<HTMLElement>('[data-map-player]')!;
    this.objective=this.root.querySelector<HTMLElement>('[data-map-objective]')!;
    this.root.querySelector('button')!.addEventListener('click',()=>this.closeCallback(),{signal:this.events.signal});
    document.body.append(this.root);
  }
  get visible():boolean { return !this.root.hidden; }

  show(snapshot:MapSnapshot):void {
    const key=JSON.stringify([snapshot.terrainId,snapshot.bounds,snapshot.playableRadius]);
    let image=this.cache.get(key);
    if(!image){
      image=terrainImage(snapshot);this.cache.set(key,image);
      if(this.cache.size>3)this.cache.delete(this.cache.keys().next().value!);
    }
    this.field.style.backgroundImage=`url("${image}")`;
    this.root.dataset.terrainId=snapshot.terrainId;
    this.field.dataset.bounds=JSON.stringify(snapshot.bounds);
    this.root.querySelector('.world-map-place h3')!.textContent=snapshot.title;
    const place=(marker:HTMLElement,position:readonly [number,number])=>{
      const point=projectToMap(position,snapshot.bounds);
      marker.style.left=`${point.x*100}%`;marker.style.top=`${point.y*100}%`;
      marker.dataset.worldX=String(position[0]);marker.dataset.worldZ=String(position[1]);
    };
    place(this.player,snapshot.player.position);
    this.player.style.setProperty('--map-heading',`${mapHeading(snapshot.player.heading)}deg`);
    this.player.dataset.heading=String(snapshot.player.heading);
    this.objective.hidden=!snapshot.objective;
    this.root.querySelector<HTMLElement>('.world-map-objective-key')!.hidden=!snapshot.objective;
    this.root.querySelector<HTMLElement>('.world-map-destination')!.hidden=!snapshot.objective;
    if(snapshot.objective){
      place(this.objective,snapshot.objective.position);
      this.objective.setAttribute('aria-label',snapshot.objective.label);
      this.root.querySelector('.world-map-destination h4')!.textContent=snapshot.objective.label;
      this.root.querySelector('.world-map-distance strong')!.textContent=String(Math.round(mapDistance(snapshot.player.position,snapshot.objective.position)));
    }
    this.field.setAttribute('aria-label',`${snapshot.title} terrain with your position${snapshot.objective?` and ${snapshot.objective.label}`:''}. North is up.`);
    const scale=this.root.querySelector<HTMLElement>('.world-map-scale')!;
    scale.style.width=`${20/(snapshot.bounds.maxX-snapshot.bounds.minX)*100}%`;
    this.root.hidden=false;
    this.root.querySelector<HTMLButtonElement>('button')!.focus({preventScroll:true});
  }
  hide():void { this.root.hidden=true; }

  handleKey(event:KeyboardEvent):boolean {
    if(!this.visible)return false;
    if(event.code==='KeyM'||event.code==='Escape'){
      event.preventDefault();if(!event.repeat)this.closeCallback();return true;
    }
    if(event.code==='Tab'){
      event.preventDefault();this.root.querySelector<HTMLButtonElement>('button')!.focus({preventScroll:true});return true;
    }
    if(event.code!=='Enter'&&event.code!=='Space')event.preventDefault();
    return true;
  }

  dispose():void {
    this.events.abort();this.cache.clear();this.field.style.backgroundImage='none';this.root.remove();
  }
}
