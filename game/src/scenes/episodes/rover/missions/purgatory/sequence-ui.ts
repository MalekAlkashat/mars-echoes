import { purgatoryText as copy } from '../../../../../content/purgatory';
import { NASA_ARCHIVE } from './archive';

export type Phase = 'replay' | 'stuck' | 'recover' | 'outro' | 'sand' | 'archive' | 'end';
export class SequenceOverlay {
  readonly root = document.createElement('section');
  action: 'return' | 'restart' | 'skip' | null = null;
  private readonly events = new AbortController();
  private readonly title: HTMLElement;
  private readonly caption: HTMLElement;
  private readonly cue: HTMLElement;
  private readonly progress: HTMLProgressElement;
  private readonly stepNode: HTMLElement;
  private readonly wheelPhoto: HTMLElement;
  private readonly archivePhoto: HTMLElement;
  private lastPhase?: Phase;
  constructor(journey=false) {
    const wheel = NASA_ARCHIVE.wheel, lookback = NASA_ARCHIVE.lookback;
    const imagePath = `${import.meta.env.BASE_URL}assets/missions/purgatory/v1/`;
    this.root.className = 'pg-sequence';
    this.root.innerHTML = `<div class="pg-letterbox pg-letterbox-top"></div><div class="pg-letterbox pg-letterbox-bottom"></div>
      <div class="pg-reconstruction">Reconstruction · time compressed</div><button class="pg-skip-sequence" data-pg-skip>Skip cinematic</button>
      <div class="pg-archive-scrim"></div>
      <div class="pg-story"><p class="pg-eyebrow">MERIDIANI PLANUM · 26 APRIL 2005</p><h1></h1><p class="pg-caption"></p></div>
      <figure class="pg-wheel-photo"><span class="pg-photo-label">Actual NASA image</span><img src="${imagePath + wheel.file}" alt="${wheel.alt}" width="256" height="256" decoding="async"><figcaption><b>${wheel.title}</b><span>${wheel.capture} · ${wheel.instrument}</span><a href="${wheel.page}" target="_blank" rel="noopener">${wheel.id} · ${wheel.credit} ↗</a></figcaption></figure>
      <figure class="pg-archive-photo"><span class="pg-photo-label">Actual NASA image · From Opportunity</span><img src="${imagePath + lookback.file}" alt="${lookback.alt}" width="1024" height="1024" decoding="async"><figcaption><b>${lookback.title}</b><span>${lookback.capture} · ${lookback.instrument}</span><a href="${lookback.page}" target="_blank" rel="noopener">${lookback.id} · Credit: ${lookback.credit} · View source ↗</a></figcaption></figure>
      <div class="pg-recovery" aria-label="Recovery controls"><div class="pg-recovery-copy"><span class="pg-eyebrow">RECOVER OPPORTUNITY</span><strong><kbd>W</kbd> Hold to ease forward</strong><span class="pg-step">Short moves are metered for you</span></div><progress max="1" value="0" aria-label="Progress to firm ground"></progress><span class="pg-drive-keys">A / D steer · S reverse · F inspect</span></div>
      <section class="pg-ending" aria-label="Mission reflection" hidden><p class="pg-eyebrow">PURGATORY · 2005</p><h2>${copy.ending.title}</h2><p class="pg-ending-purpose">${copy.ending.purpose}</p><p>${copy.ending.history}</p><p class="pg-ending-lesson">${copy.ending.lesson}</p><a href="${copy.sources[2][1]}" target="_blank" rel="noopener">NASA / JPL · The real recovery ↗</a><p class="pg-ending-lesson">Your journal records this memory at the completed chapter boundary.</p><div class="pg-ending-actions"><button type="button" data-pg-return>${journey?'Continue · OVERTIME':'Return to Mars'}</button><button type="button" data-pg-restart>Experience again</button></div></section>`;
    this.title = this.root.querySelector('h1')!; this.caption = this.root.querySelector('.pg-caption')!;
    this.cue = this.root.querySelector('.pg-recovery')!; this.progress = this.root.querySelector('progress')!;
    this.stepNode = this.root.querySelector('.pg-step')!;
    this.wheelPhoto = this.root.querySelector('.pg-wheel-photo')!; this.archivePhoto = this.root.querySelector('.pg-archive-photo')!;
    // Missing or failed media must not be presented as an authentic image being displayed.
    for (const figure of [this.wheelPhoto, this.archivePhoto]) {
      const img = figure.querySelector('img')!;
      img.addEventListener('error', () => { figure.classList.add('pg-photo-unavailable'); figure.querySelector('b')!.textContent = 'NASA image unavailable · open the source'; }, {signal:this.events.signal});
    }
    const signal = this.events.signal;
    this.root.querySelector('[data-pg-skip]')!.addEventListener('click',()=>{this.action='skip';},{signal});
    this.root.querySelector('[data-pg-return]')!.addEventListener('click', () => { this.action = 'return'; }, {signal});
    this.root.querySelector('[data-pg-restart]')!.addEventListener('click', () => { this.action = 'restart'; }, {signal});
    document.body.append(this.root);
  }
  render(phase: Phase, elapsed: number, progress: number, held: boolean, blocked: boolean): void {
    this.root.querySelector<HTMLElement>('[data-pg-skip]')!.hidden=phase==='recover'||phase==='end';
    if (phase !== this.lastPhase) {
      this.root.dataset.phase = phase; this.lastPhase = phase;
      this.root.querySelector<HTMLElement>('.pg-ending')!.hidden = phase !== 'end';
      this.title.textContent = phase === 'replay' ? copy.title : phase === 'stuck' ? 'Buried to the hubs.' : phase === 'outro' ? 'Back on firm ground.' : phase === 'sand' ? 'Look closer.' : '';
      this.caption.textContent = phase === 'replay' ? 'A routine drive. A ripple of sand.' : phase === 'stuck' ? 'The wheels kept turning. The rover barely moved.' : phase === 'outro' ? 'A small move. A way forward.' : phase === 'sand' ? 'The sand holds the story of the struggle.' : '';
      this.root.querySelector<HTMLElement>('.pg-story .pg-eyebrow')!.textContent = phase === 'sand' || phase === 'outro' ? 'A SIMPLIFIED RECONSTRUCTION' : 'MERIDIANI PLANUM · 26 APRIL 2005';
      this.archivePhoto.inert = phase !== 'archive' && phase !== 'end';
      if (phase === 'end') this.root.querySelector<HTMLButtonElement>('[data-pg-return]')!.focus({preventScroll:true});
    }
    const showWheel = phase === 'stuck' && elapsed >= 1.25;
    if (this.wheelPhoto.classList.contains('pg-photo-visible') !== showWheel) this.wheelPhoto.classList.toggle('pg-photo-visible', showWheel);
    this.wheelPhoto.inert = !showWheel;
    if (phase === 'replay' && elapsed > 3.1 && this.caption.textContent !== 'The wheels keep turning. Progress fades.') this.caption.textContent = 'The wheels keep turning. Progress fades.';
    if (this.cue.dataset.held !== String(held)) this.cue.dataset.held = String(held);
    if (this.cue.dataset.blocked !== String(blocked)) this.cue.dataset.blocked = String(blocked);
    const value = Math.round(Math.max(0, Math.min(1, progress)) * 100) / 100;
    if (this.progress.value !== value) this.progress.value = value;
    const step = blocked ? 'Face the guide · A / D to align' : held ? 'Easing forward · finding traction' : 'Short moves are metered for you';
    if (this.stepNode.textContent !== step) this.stepNode.textContent = step;
  }
  dispose(): void { this.events.abort(); this.root.remove(); }
}
