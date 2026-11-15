export function element<T extends HTMLElement>(id:string):T {
  const value=document.getElementById(id);
  if(!value)throw new Error(`Missing interface element: ${id}`);
  return value as T;
}
export class UI {
  readonly canvas=element<HTMLCanvasElement>('scene');
  private failed = false;
  resetView():void {
    for(const id of ['intro','pause','topbar','hud','repair-panel','feed','transmission','touch-controls','touch-rotate','hub-controls','return-button'])element(id).hidden=true;
    element('controls').hidden=false;
    element('interact-button').hidden=true;
    element('interaction').hidden=false;
    document.body.classList.remove('playing');
    document.body.classList.remove('game-paused');
  }
  showIntro(copy:{eyebrow:string;title:string;copy:string;button:string;controls:string;note:string}):void {
    element('intro').hidden=false;
    element('intro-eyebrow').textContent=copy.eyebrow;
    element('intro-title').textContent=copy.title;
    element('intro-copy').textContent=copy.copy;
    element('start-button').textContent=copy.button;
    element('intro-controls').textContent=copy.controls;
    element('prototype-note').textContent=copy.note;
    element('load-status').textContent='The scene is ready.';
    element<HTMLButtonElement>('start-button').disabled=false;
  }
  playing():void {
    document.body.classList.remove('game-paused');
    element('intro').hidden=true;element('pause').hidden=true;
    element('topbar').hidden=false;element('hud').hidden=false;
    document.body.classList.add('playing');this.canvas.focus();
  }
  pause(value:boolean):void {
    document.body.classList.toggle('game-paused',value);
    element('pause').hidden=!value;
    if(value)element('resume-button').focus();else this.canvas.focus();
  }
  loading(value:boolean):void {
    if(value)this.failed=false;
    element('transition').hidden=!value&&!this.failed;
    if(value){element('transition-text').textContent='Preparing the scene…';element('retry-button').hidden=true;element('cancel-button').focus();}
  }
  error(message:string):void {
    this.failed=true;
    element('transition').hidden=false;element('transition-text').textContent=message;
    element('retry-button').hidden=false;element('retry-button').focus();
  }
  dismiss():void {this.failed=false;element('transition').hidden=true;this.canvas.focus();}
  setScene(id:string):void {
    // Visibility belongs to the active scene, not the outgoing chapter's disposal.
    element('restart-button').hidden=id!=='episode-rover-01';
    element('leave-button').hidden=id!=='episode-rover-01';
    element('touch-leap').hidden=id!=='mars-hub';
    element('hub-controls').hidden=id!=='mars-hub';
    const labels=id==='mars-hub'?['Glide forward','Glide left','Glide backward','Glide right']:['Drive forward','Turn left','Drive backward','Turn right'];
    element('touch-controls').querySelectorAll<HTMLButtonElement>('.dpad button').forEach((button,i)=>button.setAttribute('aria-label',labels[i]));
  }
  trapFocus(event:KeyboardEvent):void {
    const panel=!element('transition').hidden?element('transition'):!element('pause').hidden?element('pause'):null;
    if(!panel||event.code!=='Tab')return;
    const buttons=[...panel.querySelectorAll<HTMLButtonElement>('button')].filter(button=>!button.hidden&&!button.disabled);
    const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next=(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length;
    event.preventDefault();buttons[next]?.focus();
  }
}
