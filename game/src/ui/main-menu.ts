import { readPreferences, writePreferences, type Preferences } from '../app/preferences';
import './main-menu.css';
import { RobotJournal } from './robot-journal';
import type { JournalProgress } from '../content/robot-journal';

type Actions = { newGame(): Promise<void>; continueGame(): void; settings(value: Preferences): void; pauseForSettings(): void; captureTerrain?():Promise<boolean>; journalProgress():JournalProgress };
/** Presentation-only overlays. The application owns scene lifetime and saves. */
export class MainMenu {
  readonly root = document.createElement('section');
  private readonly events = new AbortController();
  private preferences = readPreferences();
  private settingsPanel: HTMLElement;
  private confirmPanel: HTMLElement;
  private readonly journal: RobotJournal;
  private ready = false;
  private hasSave = false;
  private returnFocus?: HTMLElement;
  private readonly backgroundElements: HTMLElement[];
  constructor(private readonly actions: Actions, enabled: boolean) {
    this.root.className = 'mars-menu';
    this.root.setAttribute('aria-label','Main menu');
    this.root.innerHTML = `
      <svg class="mars-menu-landscape" viewBox="11 8 494 278" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><image href="${import.meta.env.BASE_URL}assets/ui/main-menu-reference.png" width="505" height="445" /></svg>
      <div class="mars-menu-shade"></div>
      <div class="mars-menu-content">
        <h1 class="challenge-title"><span>ABANDONED</span><span class="challenge-title-link">BUT NOT</span><span>FORGOTTEN</span></h1>
        <nav aria-label="Main menu"><button data-menu="continue" hidden disabled>Continue</button><button data-menu="new" disabled>New Game</button><button data-menu="settings">Settings</button></nav>
      </div>
      <div class="mars-menu-bottom"><p data-menu="status" role="status">Preparing Mars…</p></div>`;
    document.body.append(this.root);
    this.settingsPanel = document.createElement('section');
    this.settingsPanel.className = 'mars-modal';
    this.settingsPanel.hidden = true;
    this.settingsPanel.setAttribute('role','dialog');
    this.settingsPanel.setAttribute('aria-modal','true');
    this.settingsPanel.setAttribute('aria-labelledby','settings-title');
    this.settingsPanel.innerHTML = `<div class="mars-modal-content mars-settings">
      <header class="mars-settings-heading"><p class="mars-menu-kicker">Abandoned but not Forgotten</p><h2 id="settings-title">Settings</h2></header>
      <div class="mars-settings-tabs" role="tablist" aria-label="Settings categories">
        <button id="settings-tab-display" role="tab" data-settings-tab="display" aria-selected="true" aria-controls="settings-display">Display</button>
        <button id="settings-tab-sound" role="tab" data-settings-tab="sound" aria-selected="false" aria-controls="settings-sound" tabindex="-1">Sound</button>
        <button id="settings-tab-accessibility" role="tab" data-settings-tab="accessibility" aria-selected="false" aria-controls="settings-accessibility" tabindex="-1">Accessibility</button>
      </div>
      <div class="mars-settings-body">
        <section id="settings-display" role="tabpanel" aria-labelledby="settings-tab-display">
          <div class="mars-setting-row"><span id="menu-graphics-label">Graphics quality</span><div class="mars-stepper" role="group" aria-labelledby="menu-graphics-label"><button data-graphics-step="-1" aria-label="Previous graphics preset"><span class="mars-chevron mars-chevron-left" aria-hidden="true"></span></button><output id="menu-graphics" aria-live="polite">Balanced</output><button data-graphics-step="1" aria-label="Next graphics preset"><span class="mars-chevron" aria-hidden="true"></span></button></div></div>
          <div class="mars-setting-row"><span id="menu-fullscreen-label">Window mode</span><button id="menu-fullscreen" class="mars-setting-value" aria-describedby="menu-fullscreen-label">Fullscreen</button></div>
          <p id="graphics-description" class="mars-setting-description"></p><p id="fullscreen-status" class="mars-setting-note" role="status"></p>
        </section>
        <section id="settings-sound" role="tabpanel" aria-labelledby="settings-tab-sound" hidden>
          <div class="mars-setting-row"><label for="menu-volume">Master volume</label><div class="mars-volume-control"><input id="menu-volume" type="range" min="0" max="100" step="1"><output id="menu-volume-value" for="menu-volume"></output></div></div>
          <div class="mars-setting-row"><span id="menu-muted-label">Mute sound</span><button id="menu-muted" class="mars-toggle" role="switch" aria-checked="false" aria-labelledby="menu-muted-label" data-pref-toggle="muted"><span>Off</span><span>On</span></button></div>
          <p class="mars-setting-description">Audio is coming in a future update. Your sound preferences will be ready.</p>
        </section>
        <section id="settings-accessibility" role="tabpanel" aria-labelledby="settings-tab-accessibility" hidden>
          <div class="mars-setting-row"><span id="menu-reduced-label">Reduce interface motion</span><button id="menu-reduced" class="mars-toggle" role="switch" aria-checked="false" aria-labelledby="menu-reduced-label" data-pref-toggle="reducedMotion"><span>Off</span><span>On</span></button></div>
          <div class="mars-setting-row"><span id="menu-large-label">Larger interface text</span><button id="menu-large" class="mars-toggle" role="switch" aria-checked="false" aria-labelledby="menu-large-label" data-pref-toggle="largeText"><span>Off</span><span>On</span></button></div>
          <p class="mars-setting-description">Adjust interface comfort and readability. Your preferences are saved automatically.</p>
        </section>
      </div>
      <footer class="mars-settings-footer"><button id="menu-settings-back"><span aria-hidden="true">‹</span> Back</button><p id="settings-storage" class="mars-setting-note" role="status"></p><span class="mars-settings-key"><kbd>Esc</kbd> Back</span></footer>
    </div>`;
    this.confirmPanel = document.createElement('section');
    this.confirmPanel.className = 'mars-modal';
    this.confirmPanel.hidden = true;
    this.confirmPanel.setAttribute('role','dialog');
    this.confirmPanel.setAttribute('aria-modal','true');
    this.confirmPanel.setAttribute('aria-labelledby','new-game-title');
    this.confirmPanel.innerHTML = `<div class="mars-modal-content mars-confirm"><p class="mars-menu-kicker">A new beginning</p><h2 id="new-game-title">Start again?</h2><p>New Game replaces your saved exploration and memory markers on this browser.</p><button id="menu-keep-save">Keep my journey</button><button id="menu-confirm-new" class="mars-secondary">Start New Game</button></div>`;
    document.body.append(this.settingsPanel,this.confirmPanel);
    this.journal=new RobotJournal(()=>this.closeJournal(),actions.journalProgress,actions.captureTerrain);
    this.backgroundElements = [...document.body.children].filter((el): el is HTMLElement => el instanceof HTMLElement && ![this.root,this.settingsPanel,this.confirmPanel,this.journal.root].includes(el) && el.tagName !== 'SCRIPT');
    const signal=this.events.signal;
    this.button('settings').addEventListener('click',()=>this.openSettings(),{signal});
    this.get('journal-button').addEventListener('click',()=>this.openJournal(),{signal});
    this.button('continue').addEventListener('click',()=>this.actions.continueGame(),{signal});
    this.button('new').addEventListener('click',()=>{
      if(this.hasSave){this.confirmPanel.hidden=false;this.updateInert();this.get('menu-keep-save').focus();}
      else void this.startNew();
    },{signal});
    this.get('menu-keep-save').addEventListener('click',()=>this.closeConfirm(),{signal});
    this.get('menu-confirm-new').addEventListener('click',()=>void this.startNew(),{signal});
    this.get('menu-settings-back').addEventListener('click',()=>this.closeSettings(),{signal});
    this.get('menu-volume').addEventListener('input',()=>{
      this.preferences.volume=Number((this.get('menu-volume') as HTMLInputElement).value)/100;
      this.savePreferences();
    },{signal});
    for(const button of this.settingsPanel.querySelectorAll<HTMLButtonElement>('[data-settings-tab]')){
      button.addEventListener('click',()=>this.selectSettingsTab(button.dataset.settingsTab!),{signal});
      button.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.code))return;
        event.preventDefault();
        const tabs=[...this.settingsPanel.querySelectorAll<HTMLButtonElement>('[data-settings-tab]')];
        const index=tabs.indexOf(button);
        const next=event.code==='Home'?0:event.code==='End'?tabs.length-1:(index+(event.code==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
        this.selectSettingsTab(tabs[next].dataset.settingsTab!);tabs[next].focus();
      },{signal});
    }
    for(const button of this.settingsPanel.querySelectorAll<HTMLButtonElement>('[data-graphics-step]')){
      button.addEventListener('click',()=>{
        const presets: Preferences['graphics'][]=['low','balanced','high'];
        this.preferences.graphics=presets[(presets.indexOf(this.preferences.graphics)+Number(button.dataset.graphicsStep)+presets.length)%presets.length];
        this.savePreferences();
      },{signal});
    }
    for(const button of this.settingsPanel.querySelectorAll<HTMLButtonElement>('[data-pref-toggle]')){
      const key=button.dataset.prefToggle as 'muted'|'reducedMotion'|'largeText';
      button.addEventListener('click',()=>{this.preferences[key]=!this.preferences[key];this.savePreferences();},{signal});
    }
    this.get('menu-fullscreen').addEventListener('click',()=>void this.toggleFullscreen(),{signal});
    document.addEventListener('fullscreenchange',()=>this.updateFullscreen(),{signal});
    this.get('menu-fullscreen').toggleAttribute('disabled',!document.fullscreenEnabled);
    this.updateFullscreen();
    this.applyPreferences();
    this.root.hidden=!enabled;
    this.updateInert();
  }
  private get(id:string): HTMLElement { return document.getElementById(id)!; }
  private button(name:string): HTMLButtonElement { return this.root.querySelector(`[data-menu="${name}"]`)!; }
  get visible(): boolean { return !this.root.hidden; }
  get modalOpen(): boolean { return !this.settingsPanel.hidden || !this.confirmPanel.hidden || !this.journal.root.hidden; }
  setReady(ready:boolean):void {
    this.ready=ready;
    for(const name of ['continue','new'])this.button(name).disabled=!ready;
    this.root.querySelector('[data-menu="status"]')!.textContent=ready?'Present-day Mars · Progress saved on this browser':'Preparing Mars…';
  }
  setSaveAvailable(value:boolean):void { this.hasSave=value;this.button('continue').hidden=!value; }
  show():void {this.root.hidden=false;this.updateInert();(this.hasSave?this.button('continue'):this.button('new')).focus();}
  hide():void {this.root.hidden=true;this.updateInert();}
  storageWarning():void {this.root.querySelector('[data-menu="status"]')!.textContent='Browser storage is unavailable. Progress will last only for this visit.';}
  saveMessage(message:string):void {this.root.querySelector('[data-menu="status"]')!.textContent=message;}
  private openJournal():void {
    this.returnFocus=document.activeElement as HTMLElement;
    this.actions.pauseForSettings();this.journal.show();this.updateInert();
  }
  private closeJournal():void {this.journal.hide();this.updateInert();this.returnFocus?.focus({preventScroll:true});}
  journalUpdated():void {this.journal.notify();}
  resetJournal():void {this.journal.reset();}
  openSettings():void {
    this.returnFocus=document.activeElement as HTMLElement;
    if(!this.visible)this.actions.pauseForSettings();
    this.settingsPanel.hidden=false;this.updateInert();
    this.settingsPanel.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')!.focus({preventScroll:true});
  }
  private closeSettings():void {this.settingsPanel.hidden=true;this.updateInert();this.returnFocus?.focus();}
  private closeConfirm():void {this.confirmPanel.hidden=true;this.updateInert();this.button('new').focus();}
  private async startNew():Promise<void> {
    if(!this.ready)return;
    this.closeConfirm();this.setReady(false);
    try {await this.actions.newGame();} finally {this.setReady(true);}
  }
  private updateInert():void {
    for(const el of this.backgroundElements)el.inert=this.visible||this.modalOpen;
    this.root.inert=this.modalOpen;
    this.root.classList.toggle('mars-menu-underlay',this.modalOpen);
  }
  /** Called by the single shared input listener, before gameplay shortcuts. */
  handleKey(event:KeyboardEvent):boolean {
    const panel=!this.journal.root.hidden?this.journal.root:!this.settingsPanel.hidden?this.settingsPanel:!this.confirmPanel.hidden?this.confirmPanel:this.visible?this.root:undefined;
    if(!panel)return false;
    if(event.code==='Escape'){
      event.preventDefault();if(!this.journal.root.hidden)this.closeJournal();else if(!this.settingsPanel.hidden)this.closeSettings();else if(!this.confirmPanel.hidden)this.closeConfirm();
    }
    if(event.code==='Tab'){
      const items=[...panel.querySelectorAll<HTMLElement>('button,input,select,a[href],summary,[tabindex]')].filter(el=>el.tabIndex>=0&&!el.closest('[hidden]')&&!(el as HTMLButtonElement).disabled&&el.getClientRects().length>0);
      const i=items.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();items[(i+(event.shiftKey?-1:1)+items.length)%items.length]?.focus();
    }
    return true;
  }
  private selectSettingsTab(name:string):void {
    for(const tab of this.settingsPanel.querySelectorAll<HTMLButtonElement>('[data-settings-tab]')){
      const selected=tab.dataset.settingsTab===name;
      tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
      this.get(`settings-${tab.dataset.settingsTab}`).hidden=!selected;
    }
  }
  private savePreferences():void {
    this.applyPreferences();
    this.get('settings-storage').textContent=writePreferences(this.preferences)?'Saved automatically.':'Browser storage is unavailable. Settings apply for this visit.';
  }
  private applyPreferences():void {
    this.get('menu-graphics').textContent={low:'Low',balanced:'Balanced',high:'High'}[this.preferences.graphics];
    this.get('graphics-description').textContent={low:'Lighter rendering for a smoother journey on less powerful devices.',balanced:'Balanced detail and performance. Recommended for most devices.',high:'Sharper detail and bloom. Best for more powerful devices.'}[this.preferences.graphics];
    (this.get('menu-volume') as HTMLInputElement).value=String(Math.round(this.preferences.volume*100));
    this.get('menu-volume').style.setProperty('--volume-fill',`${this.preferences.volume*100}%`);
    this.get('menu-volume-value').textContent=`${Math.round(this.preferences.volume*100)}%`;
    for(const [id,key] of [['menu-muted','muted'],['menu-reduced','reducedMotion'],['menu-large','largeText']] as const)
      this.get(id).setAttribute('aria-checked',String(this.preferences[key]));
    document.body.classList.toggle('reduced-menu-motion',this.preferences.reducedMotion);
    document.body.classList.toggle('large-interface',this.preferences.largeText);
    this.actions.settings(this.preferences);
  }
  private updateFullscreen():void {
    const fullscreen=Boolean(document.fullscreenElement);
    this.get('menu-fullscreen').textContent=fullscreen?'Fullscreen':'Windowed';
    this.get('menu-fullscreen').setAttribute('aria-label',fullscreen?'Switch to windowed mode':'Switch to fullscreen');
  }
  private async toggleFullscreen():Promise<void> {
    try {
      if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();
      this.get('fullscreen-status').textContent='';
    } catch {this.get('fullscreen-status').textContent='Fullscreen is unavailable in this browser or window.';}
    this.updateFullscreen();
  }
  dispose():void {this.events.abort();this.journal.dispose();for(const el of this.backgroundElements)el.inert=false;this.root.remove();this.settingsPanel.remove();this.confirmPanel.remove();}
}
