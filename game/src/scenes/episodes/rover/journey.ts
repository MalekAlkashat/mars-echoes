import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three';
import { emptyInput, type EpisodeResult, type GameScene, type SceneContext, type SceneEntry, type SceneFactory } from '../../../app/contracts';
import { element } from '../../../ui';
import './journey.css';

/** Bounded adapter: one chapter world, its camera, and the existing update lifecycle. */
export async function createJourneyScene(context:SceneContext,entry:SceneEntry,signal:AbortSignal,create:SceneFactory):Promise<GameScene>{
  const enabled=entry.scene==='episode-rover-01'&&entry.journey;
  const returning=entry.scene==='mars-hub'&&entry.memoryReturn;
  if(!enabled&&!returning)return create(context,entry,signal);
  let scene:GameScene;
  let mode:'play'|'in'|'out'|'waiting'='play',elapsed=0,paused=false,disposed=false,activated=false,skip=false,exit=false;
  let result:EpisodeResult|undefined;
  let preparing=false,waitTime=0;
  let width=innerWidth,height=innerHeight;
  const chapter=entry.scene==='episode-rover-01'?entry.chapter:undefined;
  const reduced=()=>document.body.classList.contains('reduced-menu-motion')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root=document.createElement('section');root.className='journey-bridge';root.hidden=true;root.setAttribute('aria-label','Opportunity journey transition');
  root.innerHTML='<div class="journey-mask"></div><div class="journey-caption"><p class="journey-date"></p><h2></h2><p class="journey-note"></p><a class="journey-source" href="https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/" target="_blank" rel="noopener" hidden>NASA / JPL · Endurance source ↗</a></div><p class="journey-wait" role="status" aria-live="polite"></p><div class="journey-actions"><button data-journey-skip>Skip camera movement</button><button data-journey-pause>Pause</button><button data-journey-exit>Leave memory</button><button data-journey-cancel hidden>Cancel preparation</button></div>';
  const mask=root.querySelector<HTMLElement>('.journey-mask')!,date=root.querySelector<HTMLElement>('.journey-date')!,title=root.querySelector('h2')!,note=root.querySelector<HTMLElement>('.journey-note')!,source=root.querySelector<HTMLElement>('.journey-source')!;
  const skipButton=root.querySelector<HTMLButtonElement>('[data-journey-skip]')!,events=new AbortController();
  const waitLabel=root.querySelector<HTMLElement>('.journey-wait')!,cancelButton=root.querySelector<HTMLButtonElement>('[data-journey-cancel]')!,caption=root.querySelector<HTMLElement>('.journey-caption')!;
  cancelButton.addEventListener('click',()=>element('cancel-button').click(),{signal:events.signal});
  const text=(node:HTMLElement,value:string)=>{if(node.textContent!==value)node.textContent=value;};
  skipButton.addEventListener('click',()=>{skip=true;},{signal:events.signal});
  root.querySelector('[data-journey-pause]')!.addEventListener('click',()=>element('pause-button').click(),{signal:events.signal});
  root.querySelector('[data-journey-exit]')!.addEventListener('click',()=>{exit=true;if(mode==='waiting')element('cancel-button').click();},{signal:events.signal});
  try{scene=await create({...context,request(request){
    if(request.kind==='return-to-hub'&&request.result.outcome==='completed'){
      if(mode!=='play')return;
      result=request.result;context.request({kind:'chapter-boundary',result});begin('out');
    }else context.request(request);
  }},entry,signal);}catch(error){events.abort();throw error;}
  const camera=scene.camera,from=new Vector3(),fromQ=new Quaternion(),target=new Vector3(),position=new Vector3(),rotation=new Quaternion(),matrix=new Matrix4();
  const wheelPosition=new Vector3(),offset=new Vector3(),forward=new Vector3(),endLook=new Vector3(),aimPoint=new Vector3();
  let fromFov=44,fromZoom=1,fromNear=.05,fromFar=900;
  const view={enabled:false,fullWidth:0,fullHeight:0,offsetX:0,offsetY:0,width:0,height:0};
  const rover=scene.scene.getObjectByName('opportunity-rover'),wheel=rover?.getObjectByName('steering-left-front');
  const specimen=scene.scene.getObjectByName('eagle-investigation-specimen');
  const wheelSpins=rover?['left-front','left-middle','left-rear','right-front','right-middle','right-rear'].map(id=>rover.getObjectByName('axle-'+id)).filter(x=>!!x):[];
  const angles=wheelSpins.map(w=>w.rotation.x);
  function snapshot(){from.copy(camera.position);fromQ.copy(camera.quaternion);fromFov=camera.fov;fromZoom=camera.zoom;fromNear=camera.near;fromFar=camera.far;if(camera.view)Object.assign(view,camera.view);else view.enabled=false;}
  function restore(){camera.position.copy(from);camera.quaternion.copy(fromQ);camera.fov=fromFov;camera.zoom=fromZoom;camera.near=fromNear;camera.far=fromFar;camera.clearViewOffset();if(view.enabled)camera.setViewOffset(view.fullWidth,view.fullHeight,view.offsetX,view.offsetY,view.width,view.height);camera.updateProjectionMatrix();wheelSpins.forEach((w,i)=>w.rotation.x=angles[i]);}
  function begin(next:'in'|'out'){
    mode=next;elapsed=0;skip=false;exit=false;preparing=false;waitTime=0;waitLabel.textContent='';snapshot();scene.setPaused(true);context.clearInput();
    document.body.classList.add('journey-cinema');root.hidden=false;element('topbar').hidden=false;skipButton.textContent='Skip camera movement';
    root.querySelector<HTMLButtonElement>('[data-journey-exit]')!.hidden=Boolean(returning);render();
  }
  function endIncoming(){
    if(chapter==='long-night'&&context.session.chapters.has('purgatory'))context.request({kind:'remember-overtime'});
    restore();mode='play';root.hidden=true;document.body.classList.remove('journey-cinema');scene.setPaused(false);context.clearInput();
  }
  function duration(){return mode==='out'?(chapter==='purgatory'?6:chapter==='long-night'?1.6:2):returning?3.4:2.2;}
  function render(dt=0){
    if(!returning)scene.journeyShot?.(mode==='in'?'in':'out',elapsed,reduced(),dt);
    const d=duration(),p=MathUtils.clamp(elapsed/d,0,1),incoming=mode==='in',calm=reduced();
    const travel=incoming?MathUtils.smoothstep(elapsed,.65,d):chapter==='blueberry-clue'?MathUtils.smoothstep(elapsed,0,1.15):p*p*(3-2*p);
    const t=calm?(incoming?1:0):travel;
    if(chapter==='blueberry-clue'&&!incoming){
      if(specimen){target.copy(specimen.position).add(offset.set(-.045,.021,0));position.copy(target).add(offset.set(.002,.19,.025));}
      text(date,'2004 · Eagle Crater');text(title,'Rock remembers.');text(note,'Dry evidence · the next memory is a different place and time.');
    }else if(chapter==='purgatory'&&!incoming){
      wheel?.getWorldPosition(wheelPosition);target.copy(wheelPosition);
      const cut=elapsed<2?0:elapsed<4?1:2;
      position.copy(target).add(offset.set(cut===0?-1.15:-2.4,cut===0?.12:1.1,cut===2?1.6:.1).applyAxisAngle(camera.up,rover?.rotation.y??0));
      text(date,cut===0?'2005 · Recovery':cut===1?'2010 · Exploration continues':'2018 · Thirteen years after Purgatory');text(title,'OVERTIME');
      text(note,'Designed for 90 Martian days. Exploration continued for years. Authored passage of time · F-03 / F-04');
      wheelSpins.forEach((w,i)=>w.rotation.x=angles[i]-(calm?0:elapsed*.9));
    }else if(!incoming){
      position.copy(from);target.copy(from).add(forward.set(0,0,-1).applyQuaternion(fromQ));
      text(date,'The memory ends');text(title,'');text(note,'');
    }else if(returning){
      position.copy(from);target.copy(from).add(forward.set(0,0,-1).applyQuaternion(fromQ));
      text(date,'Present day');text(title,'');text(note,'');
    }else{
      wheel?.getWorldPosition(wheelPosition);target.copy(wheelPosition);
      position.copy(target).add(offset.set(-1.15,.12,.1).applyAxisAngle(camera.up,rover?.rotation.y??0));
      text(date,chapter==='purgatory'?'26 April 2005 · Meridiani Planum':'2018 · Perseverance Valley');
      text(title,chapter==='purgatory'?'Stuck in Purgatory':'The Long Night');
      text(note,chapter==='long-night'&&!context.session.skills.has('overtime')?'OVERTIME · Designed for 90 Martian days. Exploration continued for years. F-03 / F-04. Authored reconstruction.':'A different time and place · authored reconstruction');
      wheelSpins.forEach((w,i)=>w.rotation.x=angles[i]-(calm?0:elapsed*.65*(1-p)));
    }
    matrix.lookAt(position,target,camera.up);rotation.setFromRotationMatrix(matrix);
    const blend=incoming?1-t:chapter==='purgatory'?1:t;
    camera.position.lerpVectors(from,position,blend);camera.quaternion.slerpQuaternions(fromQ,rotation,blend);
    if(incoming&&rover&&!returning&&!calm){
      // Orbit around the deck, never cut a chord through the rover body.
      const a=Math.atan2(position.x-rover.position.x,position.z-rover.position.z),b=Math.atan2(from.x-rover.position.x,from.z-rover.position.z);
      const angle=a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
      const radius=MathUtils.lerp(Math.hypot(position.x-rover.position.x,position.z-rover.position.z),Math.hypot(from.x-rover.position.x,from.z-rover.position.z),t);
      camera.position.set(rover.position.x+Math.sin(angle)*radius,MathUtils.lerp(position.y,from.y,t),rover.position.z+Math.cos(angle)*radius);
      endLook.copy(from).addScaledVector(forward.set(0,0,-1).applyQuaternion(fromQ),from.distanceTo(rover.position));
      aimPoint.lerpVectors(target,endLook,t);matrix.lookAt(camera.position,aimPoint,camera.up);camera.quaternion.setFromRotationMatrix(matrix);
    }
    camera.fov=MathUtils.lerp(fromFov,36,blend);camera.zoom=MathUtils.lerp(fromZoom,1,blend);camera.near=chapter==='blueberry-clue'?.001:.03;
    camera.clearViewOffset();if(view.enabled)camera.setViewOffset(view.fullWidth,view.fullHeight,view.offsetX*(1-blend),view.offsetY*(1-blend),view.width,view.height);
    if(width<=650)camera.setViewOffset(width,height,0,(view.enabled?view.offsetY*(1-blend):0)+height*.13*blend,width,height);
    camera.updateProjectionMatrix();
    // The hub owns its two-subject framing and cosmetic spirit motion.
    if(returning){restore();scene.journeyShot?.('in',elapsed,calm,dt);}
    mask.style.opacity=String(mode==='waiting'?1:incoming?1-MathUtils.smoothstep(elapsed,0,.3):MathUtils.smoothstep(elapsed,d-.55,d));
    source.hidden=!(chapter==='purgatory'&&!incoming||chapter==='long-night'&&incoming&&!context.session.skills.has('overtime'));
    caption.style.opacity=String(mode==='waiting'?0:incoming?MathUtils.smoothstep(elapsed,.2,.7)*(returning?1-MathUtils.smoothstep(elapsed,2.6,3.2):1):1-MathUtils.smoothstep(elapsed,d-.5,d));
    root.dataset.mode=mode;root.dataset.chapter=chapter??'present';root.dataset.elapsed=elapsed.toFixed(3);
  }
  document.body.append(root);
  return {
    ...scene,
    activate(){scene.activate();if(!activated){activated=true;
      if(enabled&&entry.scene==='episode-rover-01'&&!entry.resume)scene.update(0,{...emptyInput(),startPressed:true});
      if(returning||(enabled&&chapter!=='blueberry-clue'&&entry.scene==='episode-rover-01'&&!entry.resume))begin('in');
      else if(enabled&&context.session.journey?.boundary==='return'){
        result={episodeId:'episode-rover-01',wreckId:'wreck-rover-01',chapter:'long-night',outcome:'completed'};begin('out');
      }
    }else if(mode!=='play'){document.body.classList.add('journey-cinema');root.hidden=paused&&!preparing;render();}},
    update(dt,input){
      if(disposed||paused)return;
      if(mode==='play'){scene.update(dt,input);return;}
      if(exit||input.returnPressed){exit=false;context.request({kind:'return-to-hub',result:{episodeId:'episode-rover-01',wreckId:'wreck-rover-01',chapter,outcome:'aborted'}});return;}
      if(mode==='waiting'){if(skip||input.interactPressed){skip=false;if(result)context.request({kind:'return-to-hub',result});}return;}
      elapsed+=Math.min(Math.max(dt,0),.05);
      // Skip optional travel; retain essential date/place for 1.5 active seconds.
      if(skip||input.interactPressed){skip=true;if(elapsed>=1.5)elapsed=duration();}
      render(dt);
      if(elapsed>=duration()){
        if(mode==='in')endIncoming();
        else if(result){if(chapter==='purgatory')context.request({kind:'remember-overtime'});mode='waiting';render();skipButton.textContent='Continue journey';context.clearInput();context.request({kind:'return-to-hub',result});}
      }
    },
    isCinematicBoundary(){return mode==='waiting';},
    setPreparing(value){
      preparing=value;waitTime=0;waitLabel.textContent='';root.setAttribute('aria-busy',String(value));
      cancelButton.hidden=!value;skipButton.disabled=value;
      if(mode==='waiting'){
        root.hidden=false;skipButton.textContent=value?'Continuing…':'Continue journey';
        if(!value)text(waitLabel,'Your completed memories are safe. Continue when ready.');
      }
    },
    updatePreparation(dt){
      if(!preparing||disposed||mode!=='waiting')return;
      waitTime+=Math.max(0,Math.min(dt,.05));
      if(waitTime>=2.5)text(waitLabel,chapter==='long-night'?'Returning to the valley. You can wait or cancel.':'The next memory is taking a moment. You can wait or cancel.');
      root.dataset.wait=waitTime.toFixed(3);
    },
    setPaused(value){paused=value;scene.setPaused(value||mode!=='play');root.hidden=(value&&!preparing)||mode==='play';},
    resize(w,h){width=w;height=h;scene.resize(w,h);if(mode!=='play'&&!disposed)render();},
    restart(){
      if(mode==='out'||mode==='waiting'){elapsed=0;mode='out';skip=false;paused=false;render();context.clearInput();return;}
      root.hidden=true;document.body.classList.remove('journey-cinema');mode='play';paused=false;preparing=false;scene.restart();
    },
    getSaveEntry(){if(returning)return {scene:'mars-hub',bookmark:scene.getBookmark?.()};const saved=scene.getSaveEntry?.();return saved?.scene==='episode-rover-01'?{...saved,journey:true}:saved??entry;},
    dispose(){if(disposed)return;disposed=true;events.abort();root.remove();scene.dispose();if(!document.querySelector('.journey-bridge:not([hidden])'))document.body.classList.remove('journey-cinema');},
    debug(){return {...scene.debug(),journey:true,bridge:mode,bridgeTime:elapsed};},
  };
}
