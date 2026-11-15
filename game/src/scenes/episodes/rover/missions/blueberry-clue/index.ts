import * as T from 'three';
import type { EpisodeEntry, GameScene, SceneContext, MissionPhase } from '../../../../../app/contracts';
import { Vehicle } from '../../../../../entities/rover/controller';
import { createOpportunityRover } from '../../../../../entities/rover/opportunity';
import { CameraRig } from '../../../../../entities/rover/camera';
import { WheelEffects } from '../../../../../entities/rover/wheel-effects';
import { element } from '../../../../../ui';
import { blueberryText as copy } from '../../../../../content/blueberry-clue';
import { createDiscoveryArt, sampleHeight, WORK, MACRO } from './art';
import { Discovery } from './progress';
import { MemoryOpening } from './cinematic';
import {SITE} from './site';
import './style.css';

export async function createBlueberryClue(context:SceneContext,entry:EpisodeEntry,signal:AbortSignal):Promise<GameScene>{
 const assets=await context.assets.load();signal.throwIfAborted();
 const art=await createDiscoveryArt(signal);
 try{
  signal.throwIfAborted();art.setup(context.renderer);
  const rover=createOpportunityRover(assets.opportunity);art.scene.add(rover.root);
  const vehicle=new Vehicle(rover.contactConfig),rig=new CameraRig(rover.opticalAnchor);
  const dust=new WheelEffects(art.scene,sampleHeight,.14);
  const progress=new Discovery(),effects={time:0,degraded:0};
  const contacts=Array.from({length:6},()=>new T.Vector3());
  const camera=rig.camera;
  const obstacles=art.obstacles;
  rig.setObstacles(obstacles);
  let active=false,paused=false,disposed=false,started=false,returning=false,lastPhase:MissionPhase='approach';
  let macroLast=false,actionQueued=false,withdrawing=0,skipOpening=false,exitTime=0,exitComplete=false;
  const opening=new MemoryOpening();
  const abort=new AbortController();
  opening.skip.addEventListener('click',()=>{skipOpening=true;},{signal:abort.signal});
  opening.pause.addEventListener('click',()=>element('pause-button').click(),{signal:abort.signal});
  const panel=document.createElement('section');panel.className='discovery-panel';panel.hidden=true;
  panel.setAttribute('aria-label','Mission 1 science and controls');
  panel.innerHTML='<p class="discovery-kicker"></p><h2></h2><p class="discovery-copy"></p><progress max="3" value="0" aria-label="Grinding progress"></progress><button class="discovery-action"></button><p class="discovery-hint"></p><details><summary>Sources & reconstruction</summary><p></p></details>';
  const label=panel.querySelector<HTMLElement>('.discovery-kicker')!,title=panel.querySelector('h2')!,body=panel.querySelector<HTMLElement>('.discovery-copy')!,meter=panel.querySelector('progress')!,button=panel.querySelector<HTMLButtonElement>('button')!,hint=panel.querySelector<HTMLElement>('.discovery-hint')!;
  const sources=panel.querySelector('details p')!;sources.append(document.createTextNode(copy.disclaimer+' '));
  for(const [name,url] of copy.sources){const a=document.createElement('a');a.textContent=name+' ';a.href=url;a.target='_blank';a.rel='noopener';sources.append(a);}
  button.addEventListener('click',()=>{actionQueued=true;},{signal:abort.signal});
  document.body.append(panel);
  const reduced=()=>document.body.classList.contains('reduced-menu-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pose=()=>{rover.root.position.copy(vehicle.position);rover.root.rotation.set(vehicle.pitch,vehicle.heading,vehicle.roll);rover.setSuspension(vehicle.wheelOffsets,vehicle.steer*.38);rover.root.updateMatrixWorld(true);};
  const near=()=>Math.hypot(vehicle.position.x-WORK.x,vehicle.position.z-WORK.z)<2.4;
  const returnHub=(complete:boolean)=>{
   if(entry.journey&&complete){context.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:entry.wreckId,chapter:'blueberry-clue',outcome:'completed'}});return;}
   if(returning)return;returning=true;exitTime=0;exitComplete=complete;opening.cancel();panel.hidden=true;element('touch-controls').style.visibility='hidden';progress.cancelHold();context.clearInput();
  };
  const text=(node:HTMLElement,value:string)=>{if(node.textContent!==value)node.textContent=value;};
  const renderUI=()=>{
   const phaseText=copy.phases[progress.phase];text(label,entry.journey&&progress.phase==='evidence'?'Discovery complete · GRIND is recorded when you continue':phaseText.label);text(title,phaseText.title);text(body,phaseText.body);if(progress.phase==='compare'&&progress.comparison===1){text(title,'Near Empty: the brushed comparison');text(body,'This relatively spherule-free surface provided a comparison for the cluster. The mineral result came from instrument measurements, not appearance alone.');}
   text(button,entry.journey&&progress.phase==='evidence'?'Continue · Purgatory':progress.phase==='compare'&&progress.comparison===1?copy.comparison:phaseText.action);
   button.hidden=progress.phase==='brush'||progress.phase==='grind';button.disabled=progress.phase==='approach'&&!near()||withdrawing>0;
   meter.hidden=progress.phase!=='grind';meter.value=progress.hold;
   text(hint,progress.phase==='approach'?`${Math.max(0,Math.hypot(vehicle.position.x-WORK.x,vehicle.position.z-WORK.z)).toFixed(1)} m to working area · WASD drive · arrows/drag look`:progress.phase==='grind'?'Keyboard: hold E · touch: hold the E control':'E or the button to continue · Esc pauses');
   if(progress.phase==='water')text(hint,reduced()?'Water through pores → minerals within rock → later exposure':progress.elapsed<4.5?'Long ago · water moves through connected pores':progress.elapsed<8.3?'Geological time · minerals accumulate within the rock':'Later · drying and erosion expose resistant grains');
   text(element('objective'),phaseText.title);text(element('chapter'),copy.location);
   element('mission-hold').hidden=progress.phase!=='grind';
   element('touch-controls').querySelector<HTMLElement>('.dpad')!.hidden=progress.phase!=='approach';
  };
  const show=()=>{
   context.ui.resetView();context.ui.setScene('episode-rover-01');element('restart-button').hidden=false;
   if(started){context.ui.playing();element('hud').hidden=true;element('touch-controls').hidden=opening.playing;element('touch-controls').style.visibility=opening.playing?'hidden':'visible';panel.hidden=opening.playing;element('topbar').hidden=opening.playing;}
   else{panel.hidden=true;context.ui.showIntro({eyebrow:copy.location,title:copy.title,copy:copy.intro,button:'Begin the discovery',controls:'WASD drive · E interact · hold E to grind',note:copy.disclaimer});}
   renderUI();
  };
  const reset=()=>{
   opening.cancel();skipOpening=false;exitTime=0;progress.comparison=0;progress.enter('approach');lastPhase='approach';macroLast=false;withdrawing=0;effects.time=0;returning=false;actionQueued=false;
   vehicle.reset(SITE.spawn[0],SITE.spawn[1],SITE.heading);vehicle.settle(.25,sampleHeight);rover.reset();dust.reset();rig.reset();pose();
   camera.clearViewOffset();art.showMacro(false);art.interpret(false,0,reduced());rover.root.visible=true;camera.near=.05;camera.far=250;camera.updateProjectionMatrix();
   rig.update(0,'drive',rover.root,rover.opticalAnchor,WORK,WORK,false,sampleHeight);
   context.clearInput();if(active)show();
  };
  reset();
  if(entry.resume?.kind==='blueberry-clue'){
   const saved=entry.resume;started=saved.started;progress.restore(saved.phase);vehicle.reset(saved.position[0],saved.position[1],saved.heading);vehicle.settle(.25,sampleHeight);rig.reset();rig.yaw=saved.cameraYaw;rig.pitch=saved.cameraPitch;rig.distance=saved.cameraDistance;pose();effects.time=saved.time;
  }
  const draw=(dt:number)=>{
   const macro=progress.phase!=='approach';art.showMacro(macro);rover.root.visible=!macro;
   const target=new T.Vector3(-.045,.025,0);
   if(progress.phase==='compare'&&progress.comparison===0)target.set(.055,.027,.025);
   if(progress.phase==='water'||progress.phase==='evidence')target.set(0,.025,0);
   if(macro){
    const workingView=progress.phase==='brush'||progress.phase==='grind';if(workingView)target.y=.065;
    target.add(MACRO);const wide=progress.phase!=='compare';
    const offset=new T.Vector3(wide?.17:.075,wide?.17:.085,wide?.23:.105);if(innerWidth<=650&&wide)offset.multiplyScalar(1.35);const desired=target.clone().add(offset);
    if(!macroLast||reduced())camera.position.copy(desired);else camera.position.lerp(desired,1-Math.exp(-dt*6));
    camera.near=.001;camera.far=100;camera.fov=42;camera.lookAt(target);camera.updateProjectionMatrix();
   }else{camera.near=.05;camera.far=250;camera.fov=44;rig.setMotion(vehicle);rig.update(dt,'drive',rover.root,rover.opticalAnchor,WORK,WORK,false,sampleHeight);}
   macroLast=macro;camera.setViewOffset(innerWidth,innerHeight,innerWidth>650?innerWidth*.10:0,innerWidth<=650?innerHeight*.08:0,innerWidth,innerHeight);
   const working=progress.phase==='brush'||progress.phase==='grind';
   art.tool.visible=working||withdrawing>0;art.brush.visible=working;
   const contact=progress.phase==='brush'?Math.min(progress.elapsed/.6,1):progress.hold>0?Math.min(progress.hold/.35,1):0;
   art.tool.position.y=.025+(1-contact)*.045;
   if(withdrawing>0)art.tool.position.y=.025+(1-withdrawing/.45)*.045;
   art.tool.rotation.y=2.35;
   art.patch.visible=progress.phase!=='brush'||progress.elapsed>1;
   const depth=progress.phase==='inspect'?1:Math.max(0,(progress.hold-.35)/2.65);
   const cutting=progress.phase==='grind'&&progress.hold>.35;art.abrade(depth);
   art.cut.visible=progress.phase==='inspect'||cutting;art.sample.visible=!art.cut.visible;
   art.patch.position.y=art.cut.visible?.02504-(progress.phase==='inspect'?1:Math.max(0,(progress.hold-.35)/2.65))*.0044:.02504;art.patch.scale.setScalar(['compare','water','evidence'].includes(progress.phase)?1.18:1);
   // Fade the observed brushed control out of the inferred past and back into the dry view.
   const observed=progress.phase==='water'?(reduced()?0:1-T.MathUtils.smoothstep(progress.elapsed,0,.45)+T.MathUtils.smoothstep(progress.elapsed,10.4,11.4)):1;
   (art.patch.material as T.MeshStandardMaterial).opacity=.72*observed;art.patch.castShadow=false;
   art.patch.visible=observed>.001&&(progress.phase!=='brush'||progress.elapsed>1);
   if(art.cut.visible)art.patch.visible=false;
   art.interpret(progress.phase==='water',progress.elapsed,reduced());
   art.tick(effects.time,progress.phase==='grind'&&progress.hold>.35||progress.phase==='brush',progress.phase==='grind'&&progress.hold>.35,depth);
  };
  return {
   id:'episode-rover-01',scene:art.scene,camera,effects,
   activate(){active=true;show();draw(0);},
   update(dt,input){
    if(!active||paused||disposed)return;
    const step=Math.min(Math.max(dt,0),.05);
    if(returning){exitTime+=step;opening.fadeOut(exitTime/.55);if(exitTime>=.55){context.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:entry.wreckId,chapter:'blueberry-clue',outcome:exitComplete?'completed':'aborted'}});}return;}
    if(input.returnPressed){returnHub(!entry.journey&&progress.phase==='evidence');return;}
    if(input.startPressed&&!started){started=true;draw(0);opening.start(camera,rover.root,reduced());show();context.clearInput();return;}
    if(!started)return;
    if(opening.playing){if(opening.update(step,camera,input.interactPressed||input.confirmPressed||input.startPressed||skipOpening)){skipOpening=false;show();context.clearInput();}return;}
    effects.time+=step;withdrawing=Math.max(0,withdrawing-step);
    if(input.replayPressed){reset();return;}
    if(progress.phase==='approach'){
     const oldHeading=vehicle.heading,oldDistance=vehicle.movedDistance;contacts.forEach((v,i)=>v.copy(vehicle.contactPositions[i]));
     vehicle.update(step,{forward:input.moveY,turn:-input.moveX},obstacles,sampleHeight);
     // Per-map boundary, without changing the shared controller's legacy limits.
     if(Math.abs(vehicle.position.x)>SITE.boundary||Math.abs(vehicle.position.z)>SITE.boundary){vehicle.reset(T.MathUtils.clamp(vehicle.position.x,-SITE.boundary,SITE.boundary),T.MathUtils.clamp(vehicle.position.z,-SITE.boundary,SITE.boundary),vehicle.heading);vehicle.settle(.25,sampleHeight);}
     pose();rover.roll(contacts,vehicle.contactPositions,vehicle.heading,Math.abs(vehicle.movedDistance-oldDistance)>.00001||Math.abs(vehicle.heading-oldHeading)>.00001);
     dust.update(step,effects.time,vehicle.contactPositions,vehicle.speed,vehicle.heading,vehicle.grounded);
     rig.orbit(input.dragX+input.lookX*step*100,input.dragY+input.lookY*step*100,input.zoom);
    }else dust.update(step,effects.time,vehicle.contactPositions,0,vehicle.heading,vehicle.grounded);
    const act=input.interactPressed||actionQueued;actionQueued=false;
    if(act&&progress.phase==='evidence'){returnHub(true);return;}
    if(act&&progress.phase!=='grind'&&withdrawing===0)progress.act(near());
    progress.update(step,input.interactHeld,input.interactPressed);
    if(progress.phase!==lastPhase){if(lastPhase==='grind'&&progress.phase==='inspect')withdrawing=.45;if(lastPhase==='approach')vehicle.speed=0;context.clearInput();actionQueued=false;lastPhase=progress.phase;}
    draw(step);renderUI();
   },
   journeyShot(direction){if(direction==='out'){art.abrade(1);art.cut.visible=true;art.sample.visible=false;art.patch.visible=false;}},
   resize(w,h){camera.aspect=w/h;camera.updateProjectionMatrix();},
   setPaused(value){paused=value;if(returning){returning=false;opening.cancel();element('touch-controls').style.visibility='visible';}actionQueued=false;skipOpening=false;progress.cancelHold();panel.hidden=value||!started||opening.playing;opening.root.hidden=value||!opening.playing;},
   restart(){started=true;paused=false;reset();draw(0);opening.start(camera,rover.root,reduced());show();},
   getSaveEntry(){return {scene:'episode-rover-01',wreckId:entry.wreckId,chapter:'blueberry-clue',resume:{kind:'blueberry-clue',phase:progress.phase,started:started&&!opening.playing,position:[vehicle.position.x,vehicle.position.z],heading:vehicle.heading,cameraYaw:rig.yaw,cameraPitch:rig.pitch,cameraDistance:rig.distance,time:effects.time}};},
   dispose(){if(disposed)return;disposed=true;active=false;abort.abort();panel.remove();opening.dispose();element('restart-button').hidden=true;element('mission-hold').hidden=true;element('touch-controls').style.visibility='';element('touch-controls').querySelector<HTMLElement>('.dpad')!.hidden=false;art.dispose();},
   debug(){return {phase:opening.playing?'arrival':started?progress.phase:'ready',arrivalTime:opening.elapsed.toFixed(2),chapter:'blueberry-clue',hold:progress.hold.toFixed(3),comparison:progress.comparison,position:`${vehicle.position.x.toFixed(2)},${vehicle.position.z.toFixed(2)}`,near:near(),contacts:vehicle.grounded.map(v=>v?'1':'0').join(''),berries:art.berries.count,wet:art.reconstruction.debug().wetness>0,waterStage:art.reconstruction.debug().stage,waterTime:progress.phase==='water'?progress.elapsed.toFixed(3):'0',heading:vehicle.heading.toFixed(3),speed:vehicle.speed.toFixed(3),pitch:vehicle.pitch.toFixed(3),roll:vehicle.roll.toFixed(3),returning};},
  };
 }catch(error){art.dispose();throw error;}
}
