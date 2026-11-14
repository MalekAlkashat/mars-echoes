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

export class Game {
  private readonly ui = new UI();
  private readonly renderer = createRenderer(this.ui.canvas);
  private readonly presentation = createPresentation(this.renderer,new Scene(),new PerspectiveCamera());
  private readonly assets = new AssetCache();
  private readonly session = new GameSession();
  private readonly events = new AbortController();
  private readonly input: Input;
  private readonly director: SceneDirector;
  private faultInjected = false;
  private frame = 0;
  private disposed = false;
  private lastTime = 0;
  private nextFrameAt = 0;
  private needsRender = true;
  private frameWindowAt = 0;
  private renderedFrames = 0;
  private presentedFrames = 0;
  private renderedFps = 0;

  constructor(entry:SceneEntry) {
    this.input=new Input(this.ui.canvas,(key,event)=>{
      if(key==='Tab'){this.ui.trapFocus(event);return;}
      if(key==='Escape'){
        if(!element('transition').hidden)this.cancelLoading();
        else this.pause(!this.director.paused);
      }
      if(key==='KeyR'){this.director.restart();this.ui.pause(false);}
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
          this.ui.loading(value);
          this.needsRender=true;
        },
        error:()=>this.ui.error('The scene could not load. Retry, or cancel to keep exploring.'),
        clearInput:()=>this.input.clear(),
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
    bind('restart-button',()=>{this.director.restart();this.ui.pause(false);});
    bind('cancel-button',()=>this.cancelLoading());
    bind('retry-button',()=>void this.director.retry());
    window.addEventListener('blur',()=>this.pause(true),{signal});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){
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
    window.addEventListener('pagehide',()=>this.dispose(),{signal,once:true});
    void this.director.open(entry);
    this.scheduleFrame();
  }
  private cancelLoading():void {
    this.director.cancel();
    if(this.director.active)this.ui.dismiss();
    else location.reload();
  }
  private pause(value:boolean):void {
    if(!this.director.active||this.director.transitioning)return;
    this.director.setPaused(value);this.ui.pause(value);
    this.lastTime=0;this.nextFrameAt=0;this.needsRender=true;
    this.frameWindowAt=0;this.renderedFrames=0;
  }
  private scheduleFrame():void {
    if(!this.disposed&&!document.hidden&&!this.frame)this.frame=requestAnimationFrame(time=>this.tick(time));
  }
  private tick(time:number):void {
    this.frame=0;
    if(this.disposed||document.hidden)return;
    const blocked=this.director.paused||this.director.transitioning||!element('transition').hidden;
    if((blocked&&!this.needsRender)||(time<this.nextFrameAt&&!this.needsRender)){
      if(blocked)this.lastTime=0;
      this.scheduleFrame();return;
    }
    const dt=this.lastTime===0?0:Math.min(Math.max((time-this.lastTime)/1000,0),.05);this.lastTime=time;
    const interval=1000/RENDER_FPS;
    this.nextFrameAt=this.nextFrameAt===0||time-this.nextFrameAt>interval*2?time+interval:this.nextFrameAt+interval;
    const input=this.input.take();
    const active=this.director.active;
    if(active){
      if(!blocked)active.update(dt,input);
      this.ui.setScene(active.id);
      this.presentation.film.uniforms.time.value=active.effects.time;
      this.presentation.film.uniforms.degraded.value=active.effects.degraded;
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
          paused:String(this.director.paused),completed:String(this.session.completed.size),activeLoops:'1',
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
    this.events.abort();this.input.dispose();this.director.dispose();this.presentation.dispose();
    this.assets.dispose();disposeSurfaceTextureCache();disposeRoverMaterialCache();this.renderer.dispose();
  }
}
