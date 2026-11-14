import { emptyInput, type InputFrame } from '../app/contracts';

type Action = 'start' | 'interact' | 'confirm' | 'optical' | 'replay' | 'return' | 'leap';
export class Input {
  private readonly events = new AbortController();
  private readonly keys = new Set<string>();
  private frame = emptyInput();
  private pointer?: {id:number; x:number; y:number};
  private timers = new Set<ReturnType<typeof setTimeout>>();
  constructor(canvas: HTMLCanvasElement, hotkey: (key:string,event:KeyboardEvent) => boolean | void) {
    const signal = this.events.signal;
    const press = (code:string) => {
      if (this.keys.has(code)) return;
      this.keys.add(code);
      const actions:Record<string,Action> = {KeyE:'interact',KeyF:'optical',Enter:'confirm',Space:'leap'};
      const action = actions[code];
      if (action) this.trigger(action);
    };
    window.addEventListener('keydown', event => {
      if (hotkey(event.code,event) === true) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.target instanceof HTMLButtonElement && ['Enter','Space'].includes(event.code)) return;
      if (/^(Key[WASDQEF]|Shift(Left|Right)|Arrow(Left|Right|Up|Down)|Enter|Space)$/.test(event.code)) {
        event.preventDefault(); if (!event.repeat) press(event.code);
      }
    }, {signal});
    window.addEventListener('keyup', event => this.keys.delete(event.code), {signal});
    canvas.addEventListener('pointerdown', event => {
      canvas.focus(); canvas.setPointerCapture(event.pointerId);
      this.pointer = {id:event.pointerId,x:event.clientX,y:event.clientY};
    }, {signal});
    canvas.addEventListener('pointermove', event => {
      if(this.pointer?.id!==event.pointerId)return;
      this.frame.dragX += event.clientX-this.pointer.x;
      this.frame.dragY += event.clientY-this.pointer.y;
      this.pointer.x=event.clientX;this.pointer.y=event.clientY;
    }, {signal});
    const release = () => {this.pointer=undefined;};
    canvas.addEventListener('pointerup',release,{signal});
    canvas.addEventListener('pointercancel',release,{signal});
    canvas.addEventListener('lostpointercapture',release,{signal});
    canvas.addEventListener('wheel',event=>{event.preventDefault();this.frame.zoom+=event.deltaY;},{signal,passive:false});
    document.addEventListener('pointerdown',event=>{
      if(event.target!==canvas && !(event.target instanceof Element && event.target.closest('[data-key]')))this.clear();
    },{signal});
    for(const button of document.querySelectorAll<HTMLButtonElement>('[data-key]')) {
      const code=button.dataset.key!;
      button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);press(code);},{signal});
      const up=()=>this.keys.delete(code);
      for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,up,{signal});
      button.addEventListener('click',event=>{
        if(event.detail!==0)return;
        press(code);
        const timer=setTimeout(()=>{up();this.timers.delete(timer);},150);this.timers.add(timer);
      },{signal});
    }
  }
  trigger(action:Action):void {
    this.frame[`${action}Pressed`]=true;
  }
  take():InputFrame {
    const axis=(positive:string,negative:string)=>Number(this.keys.has(positive))-Number(this.keys.has(negative));
    const frame={...this.frame,moveX:axis('KeyD','KeyA'),moveY:axis('KeyW','KeyS'),rotate:axis('KeyE','KeyQ'),
      lookX:axis('ArrowRight','ArrowLeft'),lookY:axis('ArrowDown','ArrowUp'),boost:this.keys.has('ShiftLeft')||this.keys.has('ShiftRight')};
    this.frame=emptyInput();return frame;
  }
  clear():void {this.keys.clear();this.frame=emptyInput();this.pointer=undefined;}
  dispose():void {this.events.abort();this.clear();this.timers.forEach(clearTimeout);this.timers.clear();}
}
