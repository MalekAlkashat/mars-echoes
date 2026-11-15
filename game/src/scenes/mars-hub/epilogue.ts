import {AdditiveBlending,BufferAttribute,BufferGeometry,Matrix4,Points,Quaternion,ShaderMaterial,Vector3} from 'three';
import type {PerspectiveCamera} from 'three';
import type {SceneContext,HubBookmark} from '../../app/contracts';
import {newFinale} from '../../app/finale';
import type {SpiritController} from '../../entities/spirit/controller';
import type {createHubWorld} from './layout';
import {element} from '../../ui';
import {departureRoute,EpilogueProgress,ENDING_BEATS,type EpilogueBeat} from './epilogue-progress';
import {ENDING_ARCHIVE,ENDING_SOURCES,EARNED_MEMORIES} from './epilogue-content';
import './epilogue.css';

type Options={context:SceneContext;world:ReturnType<typeof createHubWorld>;controller:SpiritController;camera:PerspectiveCamera;bookmark:HubBookmark;exit:()=>void;resetAppearance:()=>void};
const ease=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const envelope=(time:number,duration:number)=>ease(time/.8)*ease((duration-time)/.8);

/** One app-driven clock owns slides, camera, fades and automatic departure. */
export class OpportunityEpilogue {
  readonly progress:EpilogueProgress;
  readonly bookmark:HubBookmark;
  private readonly o:Options;
  private readonly root=document.createElement('section');
  private readonly events=new AbortController();
  private readonly start=new Vector3();
  private readonly cameraStart=new Vector3();
  private readonly cameraEnd=new Vector3();
  private readonly orientationStart=new Quaternion();
  private readonly orientationEnd=new Quaternion();
  private readonly route:ReturnType<typeof departureRoute>;
  private readonly positions=new Float32Array(9);
  private readonly geometry=new BufferGeometry();
  private readonly material=new ShaderMaterial({transparent:true,depthWrite:false,blending:AdditiveBlending,
    uniforms:{alpha:{value:0},pixelRatio:{value:1}},
    vertexShader:'uniform float pixelRatio; void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(230.*pixelRatio/-p.z,8.,26.);}',
    fragmentShader:'uniform float alpha; void main(){float d=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(0.,1.,d));gl_FragColor=vec4(.32,.74,1.,a*a*alpha);}' });
  private readonly lights=new Points(this.geometry,this.material);
  private readonly drive={moveX:0,moveY:0,leapPressed:false,rushHeld:false};
  private readonly motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  private get reduced(){return this.motionPreference.matches||document.body.classList.contains('reduced-menu-motion');}
  private readonly earned:typeof EARNED_MEMORIES[number][];
  private paused=false;
  private disposed=false;
  private lastBeat:EpilogueBeat|undefined;
  private presentedComplete=false;
  get idle(){return this.progress.beat==='complete'&&this.presentedComplete;}
  private readonly shade:HTMLElement;
  private readonly panels:Map<EpilogueBeat,HTMLElement>;
  private readonly skip:HTMLButtonElement;
  private readonly chapterLabel:HTMLElement;
  private readonly live:HTMLElement;
  private readonly archive:HTMLImageElement;
  private readonly closureFirst:HTMLElement;
  private readonly closureLast:HTMLElement;

  constructor(o:Options){
    this.o=o;this.bookmark=o.bookmark;
    this.progress=new EpilogueProgress(o.context.session.finale??=newFinale());
    this.earned=EARNED_MEMORIES.filter(memory=>o.context.session.chapters.has(memory.id));
    this.start.copy(o.controller.position);
    this.route=departureRoute(this.start.x,this.start.z,o.world.obstacles,o.world.height,o.world.bounds);
    const {dx,dz}=this.route;
    this.cameraStart.copy(o.camera.position);this.orientationStart.copy(o.camera.quaternion);
    this.cameraEnd.set(this.start.x-dx*7-dz*2.5,0,this.start.z-dz*7+dx*2.5);
    this.cameraEnd.y=Math.max(o.world.height(this.cameraEnd.x,this.cameraEnd.z)+2.8,this.start.y+2.8);
    if(this.reduced)this.cameraEnd.copy(this.cameraStart);
    const target=new Vector3().lerpVectors(this.start,o.world.wreck.position,.4);
    target.addScaledVector(new Vector3(dx,0,dz),4);target.y=this.start.y+.55;
    this.orientationEnd.setFromRotationMatrix(new Matrix4().lookAt(this.cameraEnd,target,new Vector3(0,1,0)));
    this.geometry.setAttribute('position',new BufferAttribute(this.positions,3));
    this.lights.name='ending-fictional-memory-lights';this.lights.frustumCulled=false;this.lights.userData.excludeAO=true;this.lights.visible=false;o.world.scene.add(this.lights);
    this.root.className='epilogue';this.root.setAttribute('aria-label','Opportunity conclusion');
    this.root.innerHTML=`<div class="epilogue-shade"></div>
      <div class="epilogue-tools"><span>OPPORTUNITY / <b data-ending-label>RETURN</b></span><button type="button" data-end-skip>Skip ending</button></div>
      <p class="epilogue-sr" aria-live="polite" data-ending-live></p>
      <section class="ending-slide ending-caption" data-slide="settle"><span class="ending-kicker">BACK ON MARS</span><h2>The rover is silent.<br>The story remains.</h2><p>A return to the present · game reconstruction</p></section>
      <section class="ending-slide ending-memories" data-slide="discoveries" hidden><span class="ending-kicker">THE MEMORIES YOU CARRY</span><h2>More than a machine.</h2><ul>${this.earned.map(m=>`<li><span>${m.date}</span><div><h3>${m.title}</h3><p>${m.copy}</p></div></li>`).join('')}</ul></section>
      <section class="ending-slide ending-legacy" data-slide="legacy" hidden><figure><img width="1024" height="1024" alt="${ENDING_ARCHIVE.alt}"><figcaption><strong>NASA ARCHIVE · ${ENDING_ARCHIVE.caption}</strong><span>${ENDING_ARCHIVE.note}</span><span>${ENDING_ARCHIVE.credit} · <a href="${ENDING_SOURCES[3][1]}" target="_blank" rel="noopener noreferrer">Source</a></span></figcaption></figure><div class="ending-legacy-copy"><span class="ending-kicker">THE WORK OUTLASTS THE MISSION</span><h2>Almost 15 years<br>of discovery.</h2><p>NASA concluded Opportunity’s mission on 13 February 2019.</p><p class="ending-legacy-last">The observations remain.<br>So do the questions.</p></div></section>
      <section class="ending-slide ending-caption" data-slide="curiosity" hidden><span class="ending-kicker">CURIOSITY CONTINUES</span><h2>What else is waiting<br>to be understood?</h2><p>The spirit and distant echo are fictional.</p></section>
      <section class="ending-slide ending-closure" data-slide="closure" hidden><h2 data-ending-first>Missions end.<br>Discoveries don’t.</h2><h2 data-ending-last>Other echoes<br>are waiting.</h2></section>
      <section class="ending-slide ending-complete" data-slide="complete" hidden><span class="ending-kicker">OPPORTUNITY’S STORY · COMPLETE</span><h2>Other echoes are waiting.</h2><p>Missions end. Discoveries don’t.</p><p class="ending-save">Your earned memories have been kept.</p><div class="ending-actions"></div><details><summary>Credits &amp; sources</summary><p>Echoes of Mars · project team. Code and presentation developed with AI assistance. Opportunity’s mission is real; the spirit and echo are fictional. This is an authored landscape, not surveyed NASA geometry. No NASA endorsement is implied.</p><p>Opportunity model: NASA VTAD. Archival image: NASA/JPL-Caltech/Cornell/ASU. Surfaces and rocks: Poly Haven (CC0). Prototype assets: Kenney (CC0). Built with Three.js, TypeScript and Vite.</p><ul>${ENDING_SOURCES.map(([label,url])=>`<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`).join('')}</ul><p><a href="/assets/long-night/v1/SOURCE.md" target="_blank" rel="noopener noreferrer">Image provenance</a> · <a href="https://polyhaven.com/license" target="_blank" rel="noopener noreferrer">Poly Haven license</a> · <a href="https://kenney.nl/assets" target="_blank" rel="noopener noreferrer">Kenney assets</a></p></details></section>`;
    this.shade=this.root.querySelector('.epilogue-shade')!;
    this.panels=new Map([...this.root.querySelectorAll<HTMLElement>('[data-slide]')].map(p=>[p.dataset.slide as EpilogueBeat,p]));
    this.skip=this.root.querySelector('[data-end-skip]')!;
    this.chapterLabel=this.root.querySelector('[data-ending-label]')!;
    this.live=this.root.querySelector('[data-ending-live]')!;
    this.archive=this.root.querySelector('img')!;this.archive.src=ENDING_ARCHIVE.image;
    this.closureFirst=this.root.querySelector('[data-ending-first]')!;this.closureLast=this.root.querySelector('[data-ending-last]')!;
    const bind=(button:HTMLButtonElement,action:()=>void)=>button.addEventListener('click',()=>{if(!this.paused&&!this.disposed){o.context.clearInput();action();}},{signal:this.events.signal});
    bind(this.skip,()=>this.progress.skip());
    const actions=this.root.querySelector<HTMLElement>('.ending-actions')!;
    const action=(text:string,run:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=text;actions.append(b);bind(b,run);};
    action('Replay ending',()=>{o.controller.reset(this.start.x,this.start.z,o.world.height,this.bookmark.heading);o.resetAppearance();this.progress.restart();this.presentedComplete=false;this.lastBeat=undefined;this.showBeat();});
    action('Return to exploration',o.exit);
    if(!element('main-menu-button').hidden)action('Main menu',()=>element('main-menu-button').click());
    document.body.append(this.root);o.context.clearInput();this.show();
  }
  show(){
    document.body.classList.add('epilogue-active');this.root.hidden=false;
    this.o.context.ui.playing();element('hud').hidden=true;element('touch-controls').hidden=true;
    this.showBeat();
  }
  private showBeat(){
    const beat=this.progress.beat;if(beat===this.lastBeat)return;
    // Move focus only if its former control is about to disappear. Tab remains native.
    const focused=document.activeElement,oldPanel=this.lastBeat?this.panels.get(this.lastBeat):undefined;
    const losingFocus=focused===this.skip&&beat==='complete'||Boolean(oldPanel?.contains(focused));
    this.lastBeat=beat;this.presentedComplete=false;this.root.dataset.beat=beat;
    this.o.context.clearInput();for(const [id,panel] of this.panels)panel.hidden=id!==beat;
    this.skip.hidden=beat==='complete';
    this.chapterLabel.textContent=({settle:'RETURN',discoveries:'DISCOVERIES',legacy:'LEGACY',curiosity:'CURIOSITY',closure:'ONWARD',complete:'COMPLETE'} as const)[beat];
    this.live.textContent=this.panels.get(beat)!.querySelector('h2')?.textContent??'';
    if(losingFocus)(beat==='complete'?this.root.querySelector<HTMLButtonElement>('.ending-actions button'):this.skip)?.focus({preventScroll:true});
  }
  update(dt:number){
    if(this.paused||this.disposed)return;
    const p=this.progress;p.update(dt);this.showBeat();const beat=p.beat,time=p.elapsed;
    const {camera,controller,world}=this.o;
    const t=beat==='settle'?ease(time/4):1;
    camera.position.lerpVectors(this.cameraStart,this.cameraEnd,t);
    for(const solid of world.obstacles){const x=camera.position.x-solid.x,z=camera.position.z-solid.z,d=Math.hypot(x,z),r=solid.radius+.3;if(d<r){camera.position.x=solid.x+(d?x/d:0)*r;camera.position.z=solid.z+(d?z/d:1)*r;}}
    camera.position.y=Math.max(camera.position.y,world.height(camera.position.x,camera.position.z)+.5);
    camera.quaternion.slerpQuaternions(this.orientationStart,this.orientationEnd,t);
    const zoom=1+((camera.aspect<.9?.5:1)-1)*t;if(camera.fov!==48||camera.zoom!==zoom){camera.fov=48;camera.zoom=zoom;camera.updateProjectionMatrix();}
    this.drive.moveY=beat==='curiosity'&&time>1.4&&controller.position.distanceTo(this.start)<Math.max(0,this.route.length-.5)?1:0;
    controller.update(dt,this.drive,Math.atan2(-this.route.dx,-this.route.dz),world.obstacles,world.height);
    const duration=ENDING_BEATS.find(b=>b.id===beat)?.duration??.8;
    const alpha=beat==='complete'?ease(time/.8):envelope(time,duration);
    this.panels.get(beat)!.style.opacity=String(beat==='closure'?1:alpha);
    this.shade.style.opacity=String(beat==='legacy'?alpha*.97:beat==='curiosity'?ease((time-6)/3):beat==='closure'||beat==='complete'?1:0);
    if(beat==='closure'){
      this.closureFirst.style.opacity=String(envelope(time,4));this.closureLast.style.opacity=String(envelope(time-4,4));
      this.closureFirst.hidden=time>=4;this.closureLast.hidden=time<4;
    }
    this.lights.visible=beat==='curiosity'||!this.reduced&&beat==='discoveries';
    if(this.lights.visible){
      this.material.uniforms.pixelRatio.value=this.o.context.renderer.getPixelRatio();this.material.uniforms.alpha.value=alpha*.8;
      if(beat==='discoveries'){
        this.geometry.setDrawRange(0,this.earned.length);const radius=(1-ease(time/8))*1.4+.1;
        for(let i=0;i<this.earned.length;i++){const a=i*2.094+time*.2;this.positions[i*3]=this.start.x+Math.cos(a)*radius;this.positions[i*3+1]=this.start.y+.6+Math.sin(a)*radius*.5;this.positions[i*3+2]=this.start.z+Math.sin(a)*radius;}
      }else{
        this.geometry.setDrawRange(0,1);const x=this.start.x+this.route.dx*(this.route.length+2),z=this.start.z+this.route.dz*(this.route.length+2);this.positions[0]=x;this.positions[1]=world.height(x,z)+2.2;this.positions[2]=z;
      }
      this.geometry.attributes.position.needsUpdate=true;
    }
    camera.updateMatrixWorld();this.presentedComplete=beat==='complete'&&time>=.8;
  }
  setPaused(value:boolean){this.paused=value;this.root.inert=value;this.o.context.clearInput();}
  debug(){return {epilogueBeat:this.progress.beat,epilogueTime:this.progress.elapsed,epilogueActiveTime:this.progress.activeTime,endingAutomatic:true,earnedMemories:this.earned.length,departureLength:this.route.length,reducedMotion:this.reduced};}
  dispose(){if(this.disposed)return;this.disposed=true;this.events.abort();this.archive.removeAttribute('src');this.root.remove();this.lights.removeFromParent();this.geometry.dispose();this.material.dispose();document.body.classList.remove('epilogue-active');this.o.context.clearInput();}
}
