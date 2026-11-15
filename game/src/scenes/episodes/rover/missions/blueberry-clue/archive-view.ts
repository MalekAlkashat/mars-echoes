import { NASA_ARCHIVE } from './archive-data';
import type { ArchiveCue } from './archive-cues';

/** One scene-owned photograph, shown in context before its larger closing reprise. */
export class DiscoveryArchive {
  readonly root = document.createElement('section');
  private readonly figure = document.createElement('figure');
  private readonly image = document.createElement('img');
  private readonly label = document.createElement('p');
  private readonly title = document.createElement('strong');
  private readonly metadata = document.createElement('span');
  private readonly note = document.createElement('p');
  private readonly source = document.createElement('a');
  private readonly events = new AbortController();
  private current?: ArchiveCue['image'];
  private failed = false;

  constructor(private readonly panel: HTMLElement, private readonly before: HTMLElement, onPause: () => void, onContinue: () => void) {
    this.root.className = 'discovery-archive';
    this.root.setAttribute('aria-label', 'Historical photograph from Opportunity');
    this.label.className = 'discovery-archive-label';
    this.label.textContent = 'Actual NASA image · Opportunity';
    this.image.decoding = 'async';
    this.source.target = '_blank'; this.source.rel = 'noopener';
    this.note.className = 'discovery-archive-note';
    const caption = document.createElement('figcaption');
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Photo details';
    details.append(summary, this.metadata);
    caption.append(this.title, this.source, details);
    this.figure.append(this.label, this.image, caption, this.note);
    const pause = document.createElement('button');
    pause.type = 'button'; pause.className = 'discovery-archive-pause'; pause.textContent = 'Pause';
    pause.addEventListener('click', onPause, { signal: this.events.signal });
    // Let the browser activate this link; shared gameplay input owns Enter elsewhere.
    this.source.addEventListener('keydown', event => {
      if (event.key === 'Enter') event.stopPropagation();
    }, { signal: this.events.signal });
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'discovery-archive-next';
    next.addEventListener('click', onContinue, { signal: this.events.signal });
    this.root.append(this.figure, pause, next); this.before.before(this.root);
    this.hide();
    this.image.addEventListener('error', () => {
      this.failed = true; this.root.classList.add('discovery-archive-unavailable');
      this.label.textContent = 'NASA image unavailable · view the source';
    }, { signal: this.events.signal });
  }

  render(cue: ArchiveCue | undefined): void {
    if (!cue) { this.hide(); return; }
    if (cue.image !== this.current) {
      const record = NASA_ARCHIVE[cue.image];
      this.current = cue.image; this.failed = false;
      this.root.classList.remove('discovery-archive-unavailable');
      this.label.textContent = 'Actual NASA image · Opportunity';
      this.title.textContent = record.title;
      this.metadata.textContent = `${record.id} · ${record.capture} · ${record.instrument} · ${record.color}`;
      this.source.textContent = `${record.credit} · Source ↗`;
      this.source.href = record.page;
      this.image.alt = record.alt; this.image.width = record.width; this.image.height = record.height;
      this.image.src = `${import.meta.env.BASE_URL}assets/missions/blueberry-clue/v1/${record.file}`;
    }
    if (cue.hero) {
      if (this.root.parentElement !== document.body) document.body.append(this.root);
    } else if (this.root.parentElement !== this.panel) this.before.before(this.root);
    this.root.dataset.closing = String(cue.closing);
    this.root.dataset.hero = String(cue.hero);
    this.root.querySelector('.discovery-archive-next')!.textContent = cue.closing ? (this.before.textContent ?? 'Continue · E') : 'Continue · E';
    this.root.style.setProperty('--archive-reveal', String(cue.reveal));
    this.root.hidden = false;
    this.root.inert = cue.reveal < .1;
    this.root.setAttribute('aria-hidden', String(cue.reveal < .1));
    this.panel.dataset.archive = cue.hero ? 'hero' : 'context';
    if (this.note.textContent !== cue.note) this.note.textContent = cue.note;
  }

  hide(): void {
    this.root.hidden = true; this.root.inert = true;
    this.root.setAttribute('aria-hidden', 'true');
    delete this.panel.dataset.archive;
  }
  debug() { return { image: this.root.hidden ? null : this.current, failed: this.failed }; }
  dispose(): void { this.events.abort(); this.root.remove(); delete this.panel.dataset.archive; }
}
