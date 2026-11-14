/** One extensible exploration branch, using the shared menu's input ownership. */
export class SkillTree {
  readonly root=document.createElement('section');
  private readonly events=new AbortController();
  private busy=false;
  constructor(close:()=>void,private readonly capture?:()=>Promise<boolean>){
    this.root.className='mars-modal mars-skills';
    this.root.hidden=true;
    this.root.setAttribute('role','dialog');
    this.root.setAttribute('aria-modal','true');
    this.root.setAttribute('aria-labelledby','skills-title');
    this.root.innerHTML=`<div class="mars-skill-content">
      <header class="mars-skill-heading"><div><p class="mars-menu-kicker">Exploration</p><h2 id="skills-title">Skills</h2></div><span class="mars-skill-count">1 available ability</span></header>
      <div class="mars-skill-layout">
        <div class="mars-skill-tree" aria-label="Exploration skill tree">
          <p class="mars-skill-branch">Observation</p><span class="mars-skill-stem" aria-hidden="true"></span>
          <button id="photograph-skill-node" class="mars-skill-node" aria-label="Photograph Terrain" aria-pressed="true" aria-controls="photograph-skill-details"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M9 15h8l3-5h8l3 5h8v23H9z"/><circle cx="24" cy="26" r="8"/><path d="M34 20h1"/></svg><span class="mars-skill-node-mark" aria-hidden="true">✓</span></button>
          <span class="mars-skill-node-label">Photograph Terrain</span>
          <span class="mars-skill-trunk" aria-hidden="true"></span><p class="mars-skill-future">More discoveries ahead</p>
        </div>
        <section id="photograph-skill-details" class="mars-skill-details" aria-labelledby="photograph-skill-title"><p class="mars-skill-available">Available</p><h3 id="photograph-skill-title">Photograph<br> Terrain</h3><p>Keep a record of the landscape. Capture the terrain through your current view as you explore Mars.</p><p class="mars-skill-hint">Find your angle in the world, then open Skills to take a photograph.</p><button id="photograph-terrain-button" type="button">Take photograph</button><p id="photograph-status" role="status"></p></section>
      </div>
      <footer class="mars-settings-footer"><button id="skills-back-button" type="button"><span aria-hidden="true">‹</span> Back</button><span class="mars-settings-key"><kbd>Esc</kbd> Back to pause</span></footer>
    </div>`;
    const signal=this.events.signal;
    this.root.querySelector('#skills-back-button')!.addEventListener('click',close,{signal});
    this.root.querySelector('#photograph-skill-node')!.addEventListener('click',()=>{
      this.root.querySelector('#photograph-skill-details')!.classList.add('selected');
    },{signal});
    const photo=this.root.querySelector<HTMLButtonElement>('#photograph-terrain-button')!;
    photo.disabled=!capture;
    photo.addEventListener('click',()=>void this.takePhotograph(),{signal});
    document.body.append(this.root);
  }
  show():void {this.root.hidden=false;this.root.querySelector<HTMLButtonElement>('#photograph-skill-node')!.focus({preventScroll:true});}
  hide():void {this.root.hidden=true;}
  private async takePhotograph():Promise<void>{
    if(this.busy||!this.capture)return;
    this.busy=true;
    const button=this.root.querySelector<HTMLButtonElement>('#photograph-terrain-button')!;
    const status=this.root.querySelector<HTMLElement>('#photograph-status')!;
    button.disabled=true;status.textContent='Capturing terrain…';
    try {status.textContent=await this.capture()?'Photograph ready. Check your downloads.':'The photograph could not be saved. Try again.';}
    catch {status.textContent='The photograph could not be saved. Try again.';}
    finally {button.disabled=false;this.busy=false;}
  }
  dispose():void {this.events.abort();this.root.remove();}
}
