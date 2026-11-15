import { journalRecords, journalSources, memories, type JournalProgress, type RobotId } from '../content/robot-journal';
import './robot-journal.css';

/** Event-driven DOM archive. Shared menu owns pause, focus trapping and keyboard input. */
export class RobotJournal {
  readonly root = document.createElement('section');
  private readonly events = new AbortController();
  private selected: RobotId = 'opportunity';
  private busy = false;
  private disposed = false;
  private readonly fresh = new Set<RobotId>();
  private known = new Map<RobotId, string>();
  private readonly toast = document.createElement('p');
  private toastTimer?: ReturnType<typeof setTimeout>;
  constructor(close: () => void, private readonly progress: () => JournalProgress, private readonly capture?: () => Promise<boolean>) {
    this.root.className = 'mars-modal robot-journal';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.setAttribute('aria-labelledby', 'journal-title');
    this.root.innerHTML = `<div class="journal-shell">
      <header class="journal-heading"><div><p class="journal-eyebrow">Field archive · Mars</p><h2 id="journal-title">Robot Journal</h2></div><p class="journal-total"></p></header>
      <div class="journal-layout"><nav class="journal-records" aria-label="Robot records"></nav><article id="journal-record-detail" class="journal-detail" aria-labelledby="journal-record-title" tabindex="0"></article></div>
      <footer class="journal-footer"><button id="journal-back-button" type="button">‹ <span>Back</span></button><div class="journal-photo"><button id="photograph-terrain-button" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h5l2-3h4l2 3h5v13H3Z"/><circle cx="12" cy="13" r="4"/></svg>Take photograph</button><p id="photograph-status" role="status">Capture your current view.</p></div><span class="journal-key"><kbd>Esc</kbd> Back to pause</span></footer>
    </div>`;
    const signal = this.events.signal;
    this.root.querySelector('#journal-back-button')!.addEventListener('click', close, { signal });
    this.root.querySelector('#photograph-terrain-button')!.addEventListener('click', () => void this.takePhotograph(), { signal });
    this.root.querySelector<HTMLButtonElement>('#photograph-terrain-button')!.disabled = !capture;
    this.root.querySelector('.journal-records')!.addEventListener('click', event => {
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-record]');
      if (!button || button.getAttribute('aria-disabled') === 'true') return;
      this.selected = button.dataset.record as RobotId;
      this.fresh.delete(this.selected);
      this.render();
      this.root.querySelector<HTMLButtonElement>(`[data-record="${this.selected}"]`)!.focus({ preventScroll: true });
    }, { signal });
    this.toast.className = 'journal-toast';
    this.toast.setAttribute('role', 'status');
    this.toast.setAttribute('aria-live', 'polite');
    this.toast.hidden = true;
    document.body.append(this.root, this.toast);
    this.rememberRecords();
  }
  show(): void { this.clearNotice(); this.fresh.delete(this.selected); this.render(); this.root.hidden = false; this.root.querySelector<HTMLElement>('[aria-current="true"]')?.focus({ preventScroll: true }); }
  hide(): void { this.root.hidden = true; }
  reset(): void { this.selected = 'opportunity'; this.fresh.clear(); this.clearNotice(); this.rememberRecords(); }
  private rememberRecords(): void {
    this.known = new Map(journalRecords(this.progress()).map(record => [record.id, `${record.available}:${record.memories.length}:${record.connections.length}`]));
  }
  notify(): void {
    const records = journalRecords(this.progress());
    for (const record of records) if (record.available && this.known.get(record.id) !== `${record.available}:${record.memories.length}:${record.connections.length}`) this.fresh.add(record.id);
    this.rememberRecords();
    this.clearNotice();
    this.toast.hidden = false;
    this.toast.textContent = 'Journal updated · Open Journal from the pause menu.';
    this.toastTimer = setTimeout(() => this.clearNotice(), 5500);
    if (!this.root.hidden) this.render();
  }
  private clearNotice(): void { clearTimeout(this.toastTimer); this.toastTimer = undefined; this.toast.hidden = true; this.toast.textContent = ''; }
  private render(): void {
    const records = journalRecords(this.progress());
    if (!records.find(record => record.id === this.selected)?.available) this.selected = 'opportunity';
    const record = records.find(record => record.id === this.selected)!;
    const count = records.filter(item => item.available).length;
    this.root.querySelector('.journal-total')!.textContent = `${count} of 3 records revealed`;
    this.root.querySelector('.journal-records')!.innerHTML = records.map((item, index) => `<button type="button" data-record="${item.id}" aria-controls="journal-record-detail" aria-current="${item.id === this.selected}" ${!item.available && index > 0 ? 'aria-disabled="true"' : ''}><span class="journal-record-mark" aria-hidden="true">${item.available ? '↗' : '—'}</span><span><strong>${item.available ? item.name : 'Unknown robot'}</strong><small>${item.available ? this.fresh.has(item.id) ? 'New discovery' : item.id === 'opportunity' ? 'Encounter recorded' : 'Connection discovered' : 'Not yet discovered'}</small></span>${item.id === this.selected ? '<span class="journal-selected" aria-hidden="true">›</span>' : ''}</button>`).join('') + '<p class="journal-rail-note">Memories reveal connections.<br>Other echoes are waiting.</p>';
    const detail = this.root.querySelector<HTMLElement>('.journal-detail')!;
    if (!record.available) {
      detail.innerHTML = `<div class="journal-empty"><span class="journal-empty-mark" aria-hidden="true">—</span><p class="journal-eyebrow">A record waiting to begin</p><h3 id="journal-record-title">Follow the valley.</h3><p>Approach the silent rover to begin your journal.<br>Its memories will reveal connections to other robots.</p><p class="journal-location">Location not yet recorded</p></div>`;
      return;
    }
    const sources = new Set<keyof typeof journalSources>([record.source]);
    record.connections.forEach(connection => connection.sources.forEach(source => sources.add(source)));
    // Reuse the reviewed archive at its native aspect; other records deliberately use typography.
    const visual = record.id === 'opportunity' ? `<figure class="journal-image"><img src="${import.meta.env.BASE_URL}assets/missions/purgatory/v1/PIA07984-right-front-wheel.jpg" alt="Opportunity’s right front wheel in soft sand" width="256" height="256"><figcaption>Wheel detail · May 2005<br>PIA07984 · NASA/JPL</figcaption></figure>` : `<div class="journal-no-image" aria-label="Image not recorded"><span aria-hidden="true">${record.name.charAt(0)}</span><small>Image not recorded</small></div>`;
    if (record.id === 'opportunity') sources.add('image');
    detail.innerHTML = `<div class="journal-hero"><div><p class="journal-eyebrow">${record.id === 'opportunity' ? 'Encounter recorded' : 'Connected through Opportunity'}</p><h3 id="journal-record-title">${record.name}</h3><p class="journal-kind">${record.kind}</p><p class="journal-description">${record.description}</p></div>${visual}</div>
      <section class="journal-memories"><h4>Memories recorded <span>${record.memories.length}</span></h4>${record.id === 'opportunity' ? record.memories.length ? '<ul>' + record.memories.map(memory => `<li><span class="journal-year">${memory.year}</span><div><strong>${memory.title}</strong><p>${memory.lesson}</p></div><span class="journal-check" aria-label="Recorded">✓</span></li>`).join('') + '</ul>' : '<p class="journal-muted">Enter a memory. Return to Mars to record what you learn.</p>' : '<p class="journal-muted">No memories visited. This robot’s story is still ahead.</p>'}</section>
      <section class="journal-connections"><h4>Connections discovered <span>${record.connections.length}</span></h4>${record.connections.length ? record.connections.map(connection => `<div class="journal-connection"><p class="journal-connection-label">${record.id === 'opportunity' ? connection.robot === 'spirit' ? 'Spirit rover' : 'Ingenuity' : 'Opportunity'} <span aria-hidden="true">↔</span> ${connection.title}</p><p>${connection.explanation}</p><small>Recorded during ${memories.find(memory => memory.id === connection.chapter)!.title}</small></div>`).join('') : '<p class="journal-muted">Connections appear as memories are recorded.</p>'}</section>
      <div class="journal-location"><strong>${record.id === 'opportunity' ? 'Location · Encountered in the valley' : 'Location not yet recorded'}</strong>${record.id !== 'opportunity' ? '<p>This location is not yet in your journal. Historical locations are documented by NASA.</p>' : ''}</div>
      <details class="journal-sources"><summary>Sources & image credits</summary><ul>${[...sources].map(key => `<li><a href="${journalSources[key].url}" target="_blank" rel="noopener noreferrer">${journalSources[key].title} ↗</a></li>`).join('')}</ul><p>Historical evidence from NASA/JPL. The exploration and journal are a game interpretation.</p></details>`;
    detail.scrollTop = 0;
    const img = detail.querySelector('img');
    if (img) img.addEventListener('error', () => { img.hidden = true; img.parentElement!.querySelector('figcaption')!.textContent = 'Archival image unavailable · PIA07984 · NASA/JPL'; }, { once: true });
  }
  private async takePhotograph(): Promise<void> {
    if (this.busy || !this.capture) return;
    this.busy = true;
    const button = this.root.querySelector<HTMLButtonElement>('#photograph-terrain-button')!;
    const status = this.root.querySelector<HTMLElement>('#photograph-status')!;
    button.disabled = true; status.textContent = 'Capturing terrain…';
    try { const saved = await this.capture(); if (!this.disposed) status.textContent = saved ? 'Photograph saved to downloads.' : 'Could not save. Please try again.'; }
    catch { if (!this.disposed) status.textContent = 'Could not save. Please try again.'; }
    finally { if (!this.disposed) { button.disabled = false; this.busy = false; } }
  }
  dispose(): void { this.disposed = true; this.clearNotice(); this.events.abort(); this.root.remove(); this.toast.remove(); }
}
