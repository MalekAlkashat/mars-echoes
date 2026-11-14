import * as T from 'three';

/** Scene-owned clock: paused by the existing game loop, with no timers or listeners. */
export class MemoryOpening {
 readonly root=document.createElement('section');
 readonly skip=document.createElement('button');
 readonly pause=document.createElement('button');
 playing=false;
 elapsed=0;
 private duration=8;
 private reduced=false;
 private viewX=0;
 private viewY=0;
 private readonly from=new T.Vector3();
 private readonly to=new T.Vector3();
 private readonly fromRotation=new T.Quaternion();
 private readonly toRotation=new T.Quaternion();
 constructor(){
  this.root.className='memory-opening';this.root.hidden=true;
  this.root.setAttribute('aria-label','Opportunity memory introduction');
  this.root.innerHTML='<div class="memory-shade"></div><div class="memory-vignette"></div><div class="memory-letterbox top"></div><div class="memory-letterbox bottom"></div><div class="memory-titles"><p class="memory-date">February–March 2004</p><p class="memory-place">Eagle Crater · Meridiani Planum</p><h1>The Blueberry Clue</h1><p class="memory-caption">An Opportunity memory</p></div>';
  this.skip.className='memory-skip';this.skip.textContent='Skip introduction · E';
  this.pause.className='memory-pause';this.pause.textContent='Pause';
  this.root.append(this.skip,this.pause);document.body.append(this.root);
 }
 start(camera:T.PerspectiveCamera,rover:T.Object3D,reduced:boolean){
  this.playing=true;this.elapsed=0;this.reduced=reduced;this.duration=reduced?3.4:8;
  this.root.classList.remove('memory-exit');this.root.hidden=false;
  this.to.copy(camera.position);this.toRotation.copy(camera.quaternion);
  this.viewX=(camera.view?.offsetX??0)/innerWidth;this.viewY=(camera.view?.offsetY??0)/innerHeight;
  this.from.copy(rover.position).add(new T.Vector3(-4.3,1.65,4.3));
  if(camera.aspect<.8)this.from.sub(rover.position).multiplyScalar(1.35).add(rover.position);
  const shot=camera.clone();shot.position.copy(this.from);shot.lookAt(rover.position.clone().add(new T.Vector3(0,1,0)));
  this.fromRotation.copy(shot.quaternion);this.render(camera);
 }
 update(dt:number,camera:T.PerspectiveCamera,skip:boolean){
  if(!this.playing)return false;
  this.elapsed=Math.min(this.duration,this.elapsed+dt);
  if(skip)this.elapsed=this.duration;
  this.render(camera);
  if(this.elapsed<this.duration)return false;
  this.playing=false;this.root.hidden=true;return true;
 }
 private render(camera:T.PerspectiveCamera){
  const smooth=T.MathUtils.smoothstep;
  const t=this.elapsed,blend=this.reduced?1:smooth(t,1.8,7.7);
  camera.position.lerpVectors(this.from,this.to,blend);
  camera.quaternion.slerpQuaternions(this.fromRotation,this.toRotation,blend);
  // Keep the rover clear of the title, restoring the gameplay framing at handoff.
  camera.setViewOffset(innerWidth,innerHeight,innerWidth*T.MathUtils.lerp(innerWidth>650?-.18:0,this.viewX,blend),innerHeight*T.MathUtils.lerp(innerWidth>650?0:-.13,this.viewY,blend),innerWidth,innerHeight);
  this.root.style.setProperty('--black',String(1-smooth(t,this.reduced?2.5:.8,this.reduced?3.4:2.6)));
  this.root.style.setProperty('--titles',String(smooth(t,.15,.75)*(1-smooth(t,this.reduced?2:4.5,this.reduced?2.65:5.8))));
  this.root.style.setProperty('--bars',String(1-smooth(t,this.duration-1.3,this.duration)));
 }
 fadeOut(amount:number){this.root.classList.add('memory-exit');this.root.hidden=false;this.root.style.setProperty('--black',String(T.MathUtils.smoothstep(amount,0,1)));}
 cancel(){this.playing=false;this.root.hidden=true;this.root.classList.remove('memory-exit');}
 dispose(){this.root.remove();}
}
