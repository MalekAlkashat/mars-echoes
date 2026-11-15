import * as T from 'three';
import type {EpisodeEntry,GameScene,SceneContext} from '../../../../../app/contracts';
import {createOpportunityRover} from '../../../../../entities/rover/opportunity';
import {Vehicle} from '../../../../../entities/rover/controller';
import {CameraRig} from '../../../../../entities/rover/camera';
import {element} from '../../../../../ui';
import {nightCopy,nightSources} from '../../../../../content/long-night';
import {LongNight,NIGHT_PHASES,legacyNightReserve,STORM_PROGRESS,ENERGY_RATE} from './progress';
import {createNightWorld,height} from './world';
import './style.css';

export async function createLongNight(context:SceneContext,entry:EpisodeEntry,signal:AbortSignal):Promise<GameScene>{
 const assets=await context.assets.load();signal.throwIfAborted();
 const world=await createNightWorld(signal);
 try{
 const image=new Image();image.src=import.meta.env.BASE_URL+'assets/long-night/v1/last-message.jpg';await image.decode();signal.throwIfAborted();
 world.setup(context.renderer);
 const rover=createOpportunityRover(assets.opportunity);world.scene.add(rover.root);
 const vehicle=new Vehicle(rover.contactConfig,{minX:-30,maxX:30,minZ:-30,maxZ:30}),rig=new CameraRig(rover.opticalAnchor);
 rig.setObstacles(world.obstacles);
 const target=new T.Vector3(0,height(0,2),2),progress=new LongNight(),effects={time:0,degraded:0};
 const contacts=Array.from({length:6},()=>new T.Vector3());
 let active=false,paused=false,disposed=false,started=false,returning=false,queued=false;
 let feedbackUntil=0;
 const events=new AbortController(),panel=document.createElement('section');panel.className='night-panel';panel.hidden=true;panel.setAttribute('aria-label','The Long Night');
 panel.innerHTML=`<p class="night-kicker"></p><h2></h2><p class="night-copy"></p>
 <div class="night-energy"><small>Illustrative energy model · not telemetry</small>
 <dl><div><dt>Incoming solar</dt><dd class="night-solar"></dd></div><div><dt>Current demand</dt><dd class="night-demand"></dd></div><div><dt>Stored reserve</dt><dd class="night-reserve"></dd></div></dl>
 <progress max="100" aria-label="Illustrative stored reserve"></progress><p class="night-drain"></p></div>
 <div class="night-choices" aria-label="Simplified service controls">
 <div><span>Imaging: <strong data-state="imaging">RUNNING</strong></span><button data-choice="imaging">Suspend imaging</button></div>
 <div><span>Science activity: <strong data-state="science">RUNNING</strong></span><button data-choice="science">Suspend science</button></div></div>
 <p class="night-feedback" role="status" aria-live="polite" aria-atomic="true"></p>
 <figure hidden><figcaption>NASA/JPL-Caltech/Cornell/ASU · June 10, 2018</figcaption></figure>
 <div class="night-campaign" hidden><strong>1,000+</strong><span>commands to restore contact</span><div class="night-timeline"><time>JUNE 2018</time><span aria-hidden="true"></span><time>FEBRUARY 2019</time></div><small>Campaign total · not a live command log</small></div>
 <div class="night-legacy" hidden><span class="night-sun" aria-hidden="true">☼</span><strong>Shared sunlight</strong><div class="night-links"><span>Opportunity</span><span>Spirit</span><span>Ingenuity</span></div><small>A shared dependence on the Sun</small></div>
 <details><summary>Sources & reconstruction</summary><small>Authored terrain, compressed time and simplified service choices, not a historical command log. Local lighting helps you see the rover; it is an artistic aid, not charging sunlight. No exact final pose, battery history or shutdown threshold is implied. Spirit return is fiction. </small></details>
 <div class="night-footer"><p class="night-service-summary"></p><p class="night-distance"></p><button class="night-next"></button></div>`;
 image.alt='PIA22929: dark noisy partial solar-filter image, with black missing data below.';panel.querySelector('figure')!.prepend(image);
 const next=panel.querySelector<HTMLButtonElement>('.night-next')!,choices=panel.querySelector<HTMLElement>('.night-choices')!;
 next.addEventListener('click',()=>{if(!paused)queued=true;},{signal:events.signal});
 for(const key of ['imaging','science'] as const)panel.querySelector<HTMLButtonElement>('[data-choice="'+key+'"]')!.addEventListener('click',()=>{if(!paused&&progress.suspend(key)){feedbackUntil=effects.time+2.5;set('.night-feedback',(key==='imaging'?'Imaging':'Science activity')+' suspended — lower demand, slower reserve loss. Essential demand remains.');renderUI();}},{signal:events.signal});
 for(const [name,url]of nightSources){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=name+' · ';panel.querySelector('details')!.append(a);}
 document.body.append(panel);
 const set=(selector:string,value:string)=>{const node=panel.querySelector(selector)!;if(node.textContent!==value)node.textContent=value;};
 const near=()=>Math.hypot(vehicle.position.x,vehicle.position.z-2)<3;
 let lastUI=-1;
 function renderUI(force=true){
  if(!force&&panel.dataset.phase===progress.phase&&effects.time-lastUI<.1)return;
  lastUI=effects.time;
  const changed=panel.dataset.phase!==progress.phase;
  const story=progress.phase!=='arrival'&&progress.phase!=='storm';
  const c=nightCopy[progress.phase];panel.dataset.phase=progress.phase;
  panel.classList.toggle('night-story',story);
  element('topbar').querySelector<HTMLElement>('.objective')!.hidden=story;
  if(changed)panel.scrollTop=0;
  element('chapter').textContent='The Long Night';element('objective').textContent=c[1];
  set('.night-kicker',c[0]);set('h2',c[1]);set('.night-copy',c[2]);set('.night-next',c[3]);
  next.disabled=progress.phase==='arrival'&&!near();
  choices.hidden=progress.phase!=='storm';(panel.querySelector('.night-energy') as HTMLElement).hidden=choices.hidden;
  (panel.querySelector('.night-feedback') as HTMLElement).hidden=choices.hidden;
  (panel.querySelector('.night-service-summary') as HTMLElement).hidden=!['storm','silence'].includes(progress.phase);
  set('.night-service-summary','Your model · Imaging: '+(progress.imaging?'SUSPENDED':'RUNNING')+' · Science: '+(progress.science?'SUSPENDED':'RUNNING'));
  panel.querySelector('progress')!.value=progress.reserve;
  set('.night-solar',progress.phase==='silence'?'Unknown after contact':(progress.solarInput*ENERGY_RATE).toFixed(2)+' units/s · '+(progress.obscuration<.3?'falling':progress.obscuration<.7?'low':'very low'));
  set('.night-demand',(progress.demand*ENERGY_RATE).toFixed(2)+' units/s'+(progress.phase==='silence'?' · last choice':''));
  set('.night-reserve',progress.reserve.toFixed(1)+' / 100 model units');
  set('.night-drain',progress.phase==='silence'?'Model paused. This is not the final battery reading.':progress.reserve===0?'Illustrative reserve exhausted; demand still exceeds input.':'Reserve loss: '+progress.drain.toFixed(2)+' units/s · '+(progress.imaging||progress.science?'reduced demand':'full demand'));
  for(const key of ['imaging','science'] as const){const b=panel.querySelector<HTMLButtonElement>('[data-choice="'+key+'"]')!;b.disabled=progress[key]||progress.phase!=='storm';b.setAttribute('aria-pressed',String(progress[key]));set('[data-state="'+key+'"]',progress[key]?'SUSPENDED':'RUNNING');}
  (panel.querySelector('figure') as HTMLElement).hidden=progress.phase!=='archive';
  (panel.querySelector('.night-campaign') as HTMLElement).hidden=progress.phase!=='recovery';
  (panel.querySelector('.night-legacy') as HTMLElement).hidden=progress.phase!=='legacy';
  set('.night-distance',progress.phase==='arrival'?Math.hypot(vehicle.position.x,vehicle.position.z-2).toFixed(1)+' m · WASD drive · E observe':progress.phase==='storm'?'The storm unfolds in 16 seconds. Watch the reserve change.':progress.phase==='silence'?'Your choices slowed model drain; they could not change history.':'E or button to continue · Esc pauses');
  element('touch-controls').querySelector<HTMLElement>('.dpad')!.hidden=progress.phase!=='arrival';
 }
 const show=()=>{context.ui.resetView();context.ui.setScene('episode-rover-01');element('restart-button').hidden=false;if(started){context.ui.playing();element('hud').hidden=true;panel.hidden=false;element('touch-controls').hidden=false;element('touch-controls').style.visibility='visible';}else{panel.hidden=true;context.ui.showIntro({eyebrow:'A memory · 2018',title:'The Long Night',copy:'A solar-powered rover. A sky filling with dust. Follow the evidence through silence and the effort to restore contact.',button:'Enter the memory',controls:'WASD drive · E interact · Esc pause',note:'Reconstruction and simplified conservation model. The historical outcome is fixed.'});}renderUI();};
 const pose=()=>{rover.root.position.copy(vehicle.position);rover.root.rotation.set(vehicle.pitch,vehicle.heading,vehicle.roll);rover.setSuspension(vehicle.wheelOffsets,vehicle.steer*.38);rover.root.updateMatrixWorld(true);};
 const reset=()=>{progress.reset();feedbackUntil=0;set('.night-feedback','Suspend a service to lower demand. Some consumption always remains.');effects.time=0;vehicle.reset(0,10,0);vehicle.settle(.25,height);rover.reset();rig.reset();returning=false;queued=false;pose();rig.update(0,'drive',rover.root,rover.opticalAnchor,target,target,false,height);world.tick(0,0,vehicle.position);if(active){context.clearInput();show();}};
 reset();
 if(entry.resume?.kind==='long-night'){const s=entry.resume;started=s.started;progress.phase=s.phase;progress.elapsed=s.elapsed;progress.imaging=s.imaging;progress.science=s.science;progress.reserve=s.reserve??legacyNightReserve(s.phase,s.elapsed,s.imaging,s.science);set('.night-feedback','Saved service choices restored. Essential demand remains; the historical outcome is unchanged.');vehicle.reset(...s.position,s.heading);vehicle.settle(.25,height);rig.yaw=s.cameraYaw;rig.pitch=s.cameraPitch;rig.distance=s.cameraDistance;effects.time=s.time;pose();world.tick(effects.time,progress.obscuration,vehicle.position);}
 const leave=(complete:boolean)=>{if(returning)return;returning=true;queued=false;context.clearInput();context.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:entry.wreckId,chapter:'long-night',outcome:complete?'completed':'aborted'}});};
 return {id:'episode-rover-01',scene:world.scene,camera:rig.camera,effects,
 activate(){active=true;show();},
 update(dt,input){
  if(!active||paused||disposed)return;
  if(input.returnPressed){leave(false);return;}
  if(!started){if(input.startPressed){started=true;show();}return;}
  const step=Math.min(.05,Math.max(0,dt));effects.time+=step;
  if(input.interactPressed||queued){queued=false;if(progress.phase==='arrival'){if(near()){progress.enter('storm');vehicle.speed=0;}}else if(progress.phase==='legacy'){leave(true);return;}else{progress.enter(NIGHT_PHASES[NIGHT_PHASES.indexOf(progress.phase)+1]);}context.clearInput();}
  contacts.forEach((p,i)=>p.copy(vehicle.contactPositions[i]));
  if(progress.phase==='arrival')vehicle.update(step,{forward:input.moveY,turn:-input.moveX},world.obstacles,height);else vehicle.settle(step,height);
  pose();rover.roll(contacts,vehicle.contactPositions,vehicle.heading,progress.phase==='arrival'&&Math.abs(vehicle.speed)>.01);
  progress.update(step);
  if(progress.phase==='storm'&&progress.elapsed>=STORM_PROGRESS&&effects.time>=feedbackUntil){progress.enter('silence');queued=false;context.clearInput();}
  rig.orbit(input.dragX,input.dragY,input.zoom);rig.yaw-=input.lookX*step;rig.pitch=Math.max(.07,Math.min(.85,rig.pitch+input.lookY*step*.6));
  rig.update(step,'drive',rover.root,rover.opticalAnchor,target,target,false,height);
  world.tick(effects.time,progress.obscuration,vehicle.position);renderUI(false);
 },
 resize(w,h){rig.camera.aspect=w/h;rig.camera.zoom=w<650?.72:1;if(w<650)rig.camera.setViewOffset(w,h,0,h*.2,w,h);else rig.camera.clearViewOffset();rig.camera.updateProjectionMatrix();},
 setPaused(value){paused=value;queued=false;returning=false;renderUI();panel.hidden=value||!started;},
 restart(){started=true;reset();},
 getSaveEntry(){return {scene:'episode-rover-01',wreckId:entry.wreckId,chapter:'long-night',resume:{kind:'long-night',started,time:effects.time,position:[vehicle.position.x,vehicle.position.z],heading:vehicle.heading,cameraYaw:rig.yaw,cameraPitch:rig.pitch,cameraDistance:rig.distance,phase:progress.phase,elapsed:progress.elapsed,imaging:progress.imaging,science:progress.science,reserve:progress.reserve}};},
 dispose(){if(disposed)return;disposed=true;active=false;events.abort();panel.remove();image.removeAttribute('src');element('topbar').querySelector<HTMLElement>('.objective')!.hidden=false;element('touch-controls').querySelector<HTMLElement>('.dpad')!.hidden=false;element('touch-controls').style.visibility='';world.dispose();},
 debug(){return {phase:progress.phase,obscuration:progress.obscuration,reserve:progress.reserve,demand:progress.demand,solar:progress.solarInput,drain:progress.drain,position:vehicle.position.x.toFixed(2)+','+vehicle.position.z.toFixed(2),elapsed:progress.elapsed};}
 };
 }catch(error){world.dispose();throw error;}
}
