import type { Preferences } from '../app/preferences';

type MusicVoice={source:AudioBufferSourceNode;gain:GainNode;startedAt:number;offset:number};

/** One app-owned context: warmed click buffer and a title-only looping music voice. */
export class MenuAudio {
  private readonly loading=new AbortController();
  private readonly clickFile:Promise<ArrayBuffer|undefined>;
  private readonly musicFile:Promise<ArrayBuffer|undefined>;
  private context?:AudioContext;
  private clickReady?:Promise<void>;
  private musicReady?:Promise<void>;
  private resumed:Promise<void>=Promise.resolve();
  private clickBuffer?:AudioBuffer;
  private musicBuffer?:AudioBuffer;
  private readonly clicks=new Map<AudioBufferSourceNode,GainNode>();
  private readonly retiredMusic=new Set<MusicVoice>();
  private music?:MusicVoice;
  private musicOffset=0;
  private clickLevel=.8;
  private musicLevel=.36;
  private titleActive=false;
  private foreground=true;
  private disposed=false;

  constructor(clickURL:string,musicURL:string){
    const load=(url:string)=>fetch(url,{signal:this.loading.signal}).then(response=>response.ok?response.arrayBuffer():undefined).catch(()=>undefined);
    this.clickFile=load(clickURL);this.musicFile=load(musicURL);
  }

  /** Pointer-down/key activation warms decoding before the later button click. */
  unlock():void {
    if(this.disposed)return;
    try{
      const context=this.context??=new AudioContext({latencyHint:'interactive'});
      if(context.state==='suspended')this.resumed=context.resume().then(()=>this.syncMusic()).catch(()=>undefined);
      this.clickReady??=this.clickFile.then(data=>data?context.decodeAudioData(data.slice(0)):undefined)
        .then(buffer=>{if(!this.disposed)this.clickBuffer=buffer;}).catch(()=>undefined);
      this.musicReady??=this.musicFile.then(data=>data?context.decodeAudioData(data.slice(0)):undefined)
        .then(buffer=>{if(!this.disposed){this.musicBuffer=buffer;this.syncMusic();}}).catch(()=>undefined);
      this.syncMusic();
    }catch{/* Browser audio support must never block an action. */}
  }

  setPreferences(value:Pick<Preferences,'volume'|'effectsVolume'|'musicVolume'|'muted'>):void {
    this.clickLevel=value.muted?0:value.volume*value.effectsVolume;
    this.musicLevel=value.muted?0:value.volume*value.musicVolume;
    for(const gain of this.clicks.values())gain.gain.value=this.clickLevel;
    if(this.music&&this.context){
      const gain=this.music.gain.gain,now=this.context.currentTime;
      gain.cancelAndHoldAtTime(now);
      if(this.musicLevel===0)gain.setValueAtTime(0,now);
      else gain.setTargetAtTime(this.musicLevel,now,.025);
    }
    if(this.musicLevel===0&&this.context)for(const voice of this.retiredMusic){
      voice.gain.gain.cancelAndHoldAtTime(this.context.currentTime);
      voice.gain.gain.setValueAtTime(0,this.context.currentTime);
    }
    this.syncMusic();
  }

  setTitleActive(value:boolean):void {this.titleActive=value;this.syncMusic();}
  setForeground(value:boolean):void {this.foreground=value;this.syncMusic();}

  playClick():void {
    if(this.disposed||this.clickLevel<=0)return;
    if(this.clickBuffer&&this.context?.state==='running'){this.startClick();return;}
    this.unlock();
    void Promise.all([this.clickReady,this.resumed]).then(()=>this.startClick()).catch(()=>undefined);
  }

  private startClick():void {
    const context=this.context;
    if(this.disposed||!this.clickBuffer||context?.state!=='running'||this.clickLevel<=0)return;
    if(this.clicks.size>=4)this.releaseClick(this.clicks.keys().next().value!,true);
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=this.clickBuffer;gain.gain.value=this.clickLevel;
    source.connect(gain);gain.connect(context.destination);this.clicks.set(source,gain);
    source.onended=()=>this.releaseClick(source,false);source.start();
  }

  private syncMusic():void {
    const context=this.context;
    const wanted=this.titleActive&&this.foreground&&!this.disposed;
    if(!wanted){this.stopMusic();return;}
    if(this.music||!this.musicBuffer||context?.state!=='running'||this.musicLevel<=0)return;
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=this.musicBuffer;source.loop=true;gain.gain.value=0;
    source.connect(gain);gain.connect(context.destination);
    const voice={source,gain,startedAt:context.currentTime,offset:this.musicOffset%this.musicBuffer.duration};
    this.music=voice;
    source.onended=()=>{source.disconnect();gain.disconnect();this.retiredMusic.delete(voice);};
    gain.gain.linearRampToValueAtTime(this.musicLevel,context.currentTime+.18);
    source.start(0,voice.offset);
  }

  private stopMusic():void {
    const voice=this.music,context=this.context;
    if(!voice||!context)return;
    this.music=undefined;
    this.musicOffset=(voice.offset+context.currentTime-voice.startedAt)%(this.musicBuffer?.duration??1);
    // Bound quick title/game/title switches to one fading tail plus the new voice.
    for(const retired of this.retiredMusic){retired.source.stop();retired.source.disconnect();retired.gain.disconnect();}
    this.retiredMusic.clear();this.retiredMusic.add(voice);
    voice.gain.gain.cancelAndHoldAtTime(context.currentTime);
    voice.gain.gain.linearRampToValueAtTime(0,context.currentTime+.15);
    voice.source.stop(context.currentTime+.16);
  }

  private releaseClick(source:AudioBufferSourceNode,stop:boolean):void {
    const gain=this.clicks.get(source);this.clicks.delete(source);source.onended=null;
    if(stop)try{source.stop();}catch{/* Voice may already have finished. */}
    source.disconnect();gain?.disconnect();
  }

  dispose():void {
    if(this.disposed)return;
    this.disposed=true;this.loading.abort();
    for(const source of this.clicks.keys())this.releaseClick(source,true);
    this.stopMusic();
    for(const voice of this.retiredMusic){try{voice.source.stop();}catch{/* Already stopped. */}voice.source.disconnect();voice.gain.disconnect();}
    this.retiredMusic.clear();void this.context?.close().catch(()=>undefined);
  }
}
