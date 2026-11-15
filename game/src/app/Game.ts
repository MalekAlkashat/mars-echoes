import { PerspectiveCamera, Scene } from 'three';
import { UI, element } from '../ui';
import { Input } from '../core/input';
import { AssetCache } from '../core/assets';
import { createPresentation, createRenderer, RENDER_FPS } from '../core/presentation';
import { disposeSurfaceTextureCache } from '../environments/mars/materials';
import { disposeRoverMaterialCache } from '../entities/rover/materials';
import { SceneDirector } from './SceneDirector';
import { GameSession } from './session';
import { createScene } from './registry';
import type { SceneEntry } from './contracts';
import { hasOpportunityEncounter } from '../content/robot-journal';
import { MainMenu } from '../ui/main-menu';
import { readSaveRecord, writeSave } from './save';

export class Game {
  private readonly ui = new UI();
  private readonly renderer = createRenderer(this.ui.canvas);
  private readonly presentation = createPresentation(this.renderer,new Scene(),new PerspectiveCamera());
  private readonly assets = new AssetCache();
  private readonly session = new GameSession();
  private readonly events = new AbortController();
  private readonly input: Input;
  private readonly director: SceneDirector;
  private menu?: MainMenu;
  private hasStarted = false;
  private readonly saveEnabled: boolean;
  private titlePending = false;
  private lastSaveAt = 0;
  private startupNotice = '';
  private readonly photoURLs = new Set<string>();
  private readonly photoTimers = new Set<ReturnType<typeof setTimeout>>();
  private faultInjected = false;
  private focusSuspended = false;
  private frame = 0;
  private disposed = false;
  private lastTime = 0;
  private nextFrameAt = 0;
  private needsRender = true;
  private frameWindowAt = 0;
  private renderedFrames = 0;
  private presentedFrames = 0;
  private renderedFps = 0;

  constructor(entry:SceneEntry, showMenu = true) {
    this.saveEnabled=showMenu;
    const saveRead=showMenu?readSaveRecord():{source:'empty' as const,save:undefined};
    const saved=saveRead.save;
    if(saved){
      this.hasStarted=true;this.session.bookmark=saved.bookmark;this.session.journey=saved.journey;this.session.opportunityComplete=saved.opportunityComplete??false;
      this.session.opportunityEncountered=hasOpportunityEncounter(saved);
      this.session.finale=saved.finale;
      for(const id of saved.completed)this.session.completed.add(id);
      for(const id of saved.chapters??[])this.session.chapters.add(id);
      for(const id of saved.skills??[])this.session.skills.add(id);
      entry=saved.entry;
    }
    this.input=new Input(this.ui.canvas,(key,event)=>{
      if(this.menu?.handleKey(event))return true;
      if(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement)return;
      if(key==='Tab'){this.ui.trapFocus(event);return true;}
      if(key==='Escape'){
        event.preventDefault();if(event.repeat)return true;
        if(this.director.transitioning||!element('transition').hidden)this.cancelLoading();
        else this.pause(!this.director.paused);
        return true;
      }
      // Restart is a deliberate menu action; ordinary typing must never reset a run.
    });
    this.director=new SceneDirector({
      session:this.session,
      create:(entry,signal,request)=>{
        if(import.meta.env.DEV && !this.faultInjected && new URLSearchParams(location.search).get('fail-once')===entry.scene){
          this.faultInjected=true;
          return Promise.reject(new Error('Development scene-load failure.'));
        }
        return createScene({assets:this.assets,ui:this.ui,renderer:this.renderer,
          session:this.session,request,clearInput:()=>this.input.clear()},entry,signal);
      },
      hooks:{
        switch:scene=>{
          scene.resize(innerWidth,innerHeight);
          this.presentation.bind(scene.scene,scene.camera);
          this.needsRender=true;
        },
        loading:value=>{
          element('cancel-button').textContent=this.director.active?'Cancel':'Reload';
          this.ui.loading(value,Boolean(value&&this.director.active?.isCinematicBoundary?.()));
          if(!value&&this.director.active&&(this.menu?.visible||this.titlePending)){
            this.titlePending=false;this.director.setPaused(true);this.ui.resetView();this.menu?.setReady(true);this.menu?.show();
            if(this.startupNotice){const status=this.menu?.root.querySelector<HTMLElement>('[data-menu="status"]');if(status)status.textContent=this.startupNotice;}
          }
          // A blur during asynchronous scene preparation must survive the switch.
          if(!value&&element('transition').hidden&&this.focusSuspended&&!this.menu?.visible&&!this.titlePending)this.pause(true);
          else if(!value&&element('transition').hidden&&this.director.paused&&!this.menu?.visible&&!this.titlePending)this.ui.pause(true);
          this.needsRender=true;
        },
        error:()=>{
          if(this.menu?.visible){this.titlePending=true;this.menu.hide();this.menu.setReady(false);}
          this.ui.error('The scene could not load. Retry, or cancel to keep exploring.');
        },
        clearInput:()=>this.input.clear(),
        settled:()=>this.saveProgress(),
      },
    });
    const signal=this.events.signal;
    const bind=(id:string,action:()=>void)=>element(id).addEventListener('click',action,{signal});
    bind('start-button',()=>this.input.trigger('start'));
    bind('interact-button',()=>this.input.trigger('interact'));
    bind('insert-button',()=>this.input.trigger('confirm'));
    bind('feed-button',()=>this.input.trigger('optical'));
    bind('replay-button',()=>this.input.trigger('replay'));
    const leave=()=>{this.pause(false);this.input.trigger('return');};
    bind('return-button',leave);bind('leave-button',leave);
    bind('pause-button',()=>this.pause(true));bind('resume-button',()=>this.pause(false));
    bind('settings-button',()=>this.menu?.openSettings());
    bind('save-game-button',()=>this.saveProgress(true));
    bind('main-menu-button',()=>{
      this.saveProgress();this.pause(true);this.ui.resetView();this.menu?.setSaveAvailable(this.hasStarted);this.menu?.show();
    });
    bind('restart-button',()=>{this.director.restart();this.ui.pause(false);});
    bind('cancel-button',()=>this.cancelLoading());
    bind('retry-button',()=>void this.director.retry());
    window.addEventListener('blur',()=>{this.focusSuspended=true;this.input.clear();this.pause(true);},{signal});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
        this.focusSuspended=true;this.input.clear();
        this.saveProgress();
        this.pause(true);
        cancelAnimationFrame(this.frame);this.frame=0;
      }else{
        this.lastTime=0;this.nextFrameAt=0;this.frameWindowAt=0;this.renderedFrames=0;
        this.needsRender=true;this.scheduleFrame();
      }
    },{signal});
    window.addEventListener('resize',()=>{
      this.renderer.setSize(innerWidth,innerHeight);this.presentation.resize();
      this.director.active?.resize(innerWidth,innerHeight);
      this.needsRender=true;
    },{signal});
    window.addEventListener('pagehide',event=>{
      this.saveProgress();
      if(event.persisted){this.pause(true);this.input.clear();cancelAnimationFrame(this.frame);this.frame=0;}
      else this.dispose();
    },{signal});
    window.addEventListener('pageshow',event=>{
      if(event.persisted){this.lastTime=0;this.nextFrameAt=0;this.needsRender=true;this.scheduleFrame();}
    },{signal});
    this.menu=new MainMenu({
      newGame:async()=>{
        this.focusSuspended=false;
        if(this.director.active?.id!=='mars-hub'&&!await this.director.open({scene:'mars-hub'}))return;
        this.session.completed.clear();this.session.chapters.clear();this.session.skills.clear();this.session.bookmark=undefined;this.session.journey=undefined;this.session.opportunityComplete=false;this.session.opportunityEncountered=false;this.menu?.resetJournal();this.session.finale=undefined;this.hasStarted=true;
        this.startupNotice='';
        this.director.restart();this.menu?.hide();this.ui.canvas.focus();
        this.menu?.setSaveAvailable(true);this.saveProgress(false,{replaceBackup:true});this.needsRender=true;
      },
      continueGame:()=>{
        this.focusSuspended=false;
        this.menu?.hide();this.director.setPaused(false);this.ui.playing();this.director.active?.activate();this.input.clear();
        // A valid save may precede the first checkpoint; start the existing hub without a second intro.
        this.input.trigger('start');this.needsRender=true;
      },
      settings:value=>{this.presentation.setQuality(value.graphics);this.needsRender=true;},
      pauseForSettings:()=>{if(!this.director.paused)this.pause(true);},
      captureTerrain:()=>this.captureTerrain(),
      journalProgress:()=>this.session,
    },showMenu);
    this.session.onJournalUpdate=()=>{this.menu?.journalUpdated();this.saveProgress();};
    this.menu.setSaveAvailable(Boolean(saved));
    const recoveryMessage=saveRead.source==='backup'?'A saved backup was recovered. Your journey can continue.':
      saveRead.source==='legacy'?'Your previous exploration save is ready to continue.':
      saveRead.source==='invalid'?'Saved progress could not be read. Choose New Game only if you want to start again.':
      saveRead.source==='unavailable'?'Browser storage is unavailable. Progress cannot be saved on this browser.':'';
    if(recoveryMessage){
      this.startupNotice=recoveryMessage;
      const status=this.menu.root.querySelector<HTMLElement>('[data-menu="status"]');
      if(status)status.textContent=recoveryMessage;
      this.setSaveStatus(recoveryMessage);
    }else if(saved)this.setSaveStatus('Saved journey ready.');
    if(!showMenu){element('main-menu-button').hidden=true;}
    void this.director.open(entry);
    this.scheduleFrame();
  }
  private cancelLoading():void {
    this.director.cancel();
    if(this.director.active){this.ui.dismiss();if(this.director.paused)this.ui.pause(true);}
    else location.reload();
  }
  private pause(value:boolean):void {
    if(!value)this.focusSuspended=false;
    if(this.menu?.visible||this.menu?.modalOpen)return;
    if(!this.director.active)return;
    if(value)this.saveProgress();
    this.director.setPaused(value);this.ui.pause(value);
    this.lastTime=0;this.nextFrameAt=0;this.needsRender=true;
    this.frameWindowAt=0;this.renderedFrames=0;
  }
  private setSaveStatus(message:string):void {
    const status=document.getElementById('save-status');
    if(status)status.textContent=message;
  }
  private saveProgress(manual=false,options:{replaceBackup?:boolean}={}):boolean {
    if(!this.saveEnabled){if(manual)this.setSaveStatus('Developer previews do not overwrite your saved journey.');return false;}
    if(!this.hasStarted||!this.director.active||this.director.transitioning){
      if(manual)this.setSaveStatus('Wait until the scene is ready before saving.');return false;
    }
    const checkpoint=this.director.active.getBookmark?.();
    if(checkpoint)this.session.bookmark=checkpoint;
    let entry=this.director.active.getSaveEntry?.()??
      (this.director.active.id==='mars-hub'?{scene:'mars-hub' as const,...(this.session.bookmark?{bookmark:this.session.bookmark}:{})}:undefined);
    if(entry?.scene==='episode-rover-01'&&this.director.entry?.scene==='episode-rover-01'&&this.director.entry.journey&&this.session.journey){
      const journey=this.session.journey;
      if(!journey.boundary)journey.resume=entry.resume;
      entry={scene:'episode-rover-01',wreckId:'wreck-rover-01',chapter:journey.chapter,journey:true,...(journey.resume?{resume:journey.resume}:{})};
    }
    if(!entry){if(manual)this.setSaveStatus('Waiting for a safe checkpoint. Your last save is unchanged.');return false;}
    const savedAt=Date.now();
    const saved=writeSave({version:2,savedAt,entry,bookmark:this.session.bookmark,completed:[...this.session.completed],chapters:[...this.session.chapters],skills:[...this.session.skills],journey:this.session.journey,opportunityComplete:this.session.opportunityComplete,opportunityEncountered:this.session.opportunityEncountered,finale:this.session.finale},undefined,options);
    if(!saved){
      this.menu?.storageWarning();this.setSaveStatus('Saving failed. Your last valid save has been kept. Check browser storage.');
    }else{
      this.setSaveStatus(`${manual?'Game saved':'Autosaved'} · ${new Date(savedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`);
    }
    return saved;
  }
  private async captureTerrain():Promise<boolean> {
    const active=this.director.active;
    if(!active||this.director.transitioning||this.disposed)return false;
    // Capture a fresh game frame: WebGL's drawing buffer is cleared between frames.
    this.presentation.film.uniforms.time.value=active.effects.time;
    this.presentation.film.uniforms.degraded.value=active.effects.degraded;
    this.presentation.film.uniforms.speed.value=active.effects.speed??0;
    this.presentation.composer.render();
    const blob=await new Promise<Blob|null>(resolve=>this.ui.canvas.toBlob(resolve,'image/png'));
    if(!blob||this.disposed)return false;
    const url=URL.createObjectURL(blob);this.photoURLs.add(url);
    const link=document.createElement('a');
    link.href=url;link.download=`abandoned-terrain-${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
    document.body.append(link);link.click();link.remove();
    const timer=setTimeout(()=>{URL.revokeObjectURL(url);this.photoURLs.delete(url);this.photoTimers.delete(timer);},5000);
    this.photoTimers.add(timer);
    return true;
  }
  private scheduleFrame():void {
    if(!this.disposed&&!document.hidden&&!this.frame)this.frame=requestAnimationFrame(time=>this.tick(time));
  }
  private tick(time:number):void {
    this.frame=0;
    if(this.disposed||document.hidden)return;
    const blocked=this.director.paused||this.director.transitioning||!element('transition').hidden||Boolean(this.director.active?.isPresentationIdle?.());
    const preparing=this.director.transitioning&&!this.director.paused&&!this.focusSuspended&&Boolean(this.director.active?.updatePreparation);
    if((blocked&&!preparing&&!this.needsRender)||(time<this.nextFrameAt&&!this.needsRender)){
      if(blocked&&!preparing)this.lastTime=0;
      this.scheduleFrame();return;
    }
    const dt=this.lastTime===0?0:Math.min(Math.max((time-this.lastTime)/1000,0),.05);this.lastTime=time;
    const interval=1000/RENDER_FPS;
    this.nextFrameAt=this.nextFrameAt===0||time-this.nextFrameAt>interval*2?time+interval:this.nextFrameAt+interval;
    const input=this.input.take();
    const active=this.director.active;
    if(active){
      if(preparing)active.updatePreparation?.(dt);
      // Waiting feedback uses the app clock, but the frozen world needs no new GPU frames.
      if(blocked&&!this.needsRender){this.scheduleFrame();return;}
      if(!blocked)active.update(dt,input);
      if(!blocked&&active.isPresentationIdle?.())this.saveProgress();
      if(!blocked&&time-this.lastSaveAt>1000){this.saveProgress();this.lastSaveAt=time;}
      this.ui.setScene(active.id);
      this.presentation.film.uniforms.time.value=active.effects.time;
      this.presentation.film.uniforms.degraded.value=active.effects.degraded;
      this.presentation.film.uniforms.speed.value=active.effects.speed??0;
      this.renderer.info.reset();
      const renderStart=performance.now();
      this.presentation.composer.render();
      const renderMs=performance.now()-renderStart;
      this.needsRender=false;
      this.renderedFrames++;
      this.presentedFrames++;
      if(!this.frameWindowAt)this.frameWindowAt=time;
      if(time-this.frameWindowAt>=1000){
        this.renderedFps=this.renderedFrames*1000/(time-this.frameWindowAt);
        this.renderedFrames=0;this.frameWindowAt=time;
      }
      if(import.meta.env.DEV){
        for(const [key,value] of Object.entries(active.debug()))this.ui.canvas.dataset[key]=String(value);
        Object.assign(this.ui.canvas.dataset,{sceneId:active.id,transitioning:String(this.director.transitioning),
          paused:String(this.director.paused),chapters:String(this.session.chapters.size),grindUnlocked:String(this.session.skills.has('grind')),completed:String(this.session.completed.size),activeLoops:'1',
          geometries:String(this.renderer.info.memory.geometries),textures:String(this.renderer.info.memory.textures),
          drawCalls:String(this.renderer.info.render.calls),triangles:String(this.renderer.info.render.triangles),
          renderCpuMs:renderMs.toFixed(2),renderedFps:this.renderedFps.toFixed(1),fpsCap:String(RENDER_FPS),
          pixelRatio:String(this.renderer.getPixelRatio()),renderedFrames:String(this.presentedFrames)});
      }
    }
    this.scheduleFrame();
  }
  dispose():void {
    if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.frame);
    for(const timer of this.photoTimers)clearTimeout(timer);
    for(const url of this.photoURLs)URL.revokeObjectURL(url);
    this.photoTimers.clear();this.photoURLs.clear();
    this.session.onJournalUpdate=undefined;
    this.events.abort();this.menu?.dispose();this.input.dispose();this.director.dispose();this.presentation.dispose();
    this.assets.dispose();disposeSurfaceTextureCache();disposeRoverMaterialCache();this.renderer.dispose();
  }
}
