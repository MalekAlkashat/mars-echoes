/** Mission-owned planning panel. Buttons only raise flags; the scene reads them inside its own update. */
import { purgatoryText as copy } from '../../../../../content/purgatory';
import { CAMERA_LABELS, CAMERA_MODES, type CameraMode } from './cameras';
import { MAX_QUEUE, type Command } from './drive';

export const TILES: readonly { label: string; short: string; command: Command }[] = [
  { label: 'Forward 0.5 m', short: 'Fwd 0.5 m', command: { kind: 'drive', metres: 0.5 } },
  { label: 'Forward 2 m', short: 'Fwd 2 m', command: { kind: 'drive', metres: 2 } },
  { label: 'Reverse 0.5 m', short: 'Rev 0.5 m', command: { kind: 'drive', metres: -0.5 } },
  { label: 'Reverse 2 m', short: 'Rev 2 m', command: { kind: 'drive', metres: -2 } },
  { label: 'Turn left 15°', short: 'Left 15°', command: { kind: 'turn', radians: Math.PI / 12 } },
  { label: 'Turn right 15°', short: 'Right 15°', command: { kind: 'turn', radians: -Math.PI / 12 } },
];
export type PanelAction = { kind: 'tile'; index: number } | { kind: 'send' } | { kind: 'clear' } | { kind: 'replay' } | { kind: 'camera'; mode: CameraMode };
export type PanelView = {
  title: string; body: string; hint: string; wheel: string; moved: string; sink: string;
  queue: readonly { label: string; state: 'filled' | 'running' | 'done' }[];
  busy: boolean; planning: boolean; replayOffered: boolean; camera: CameraMode;
};

export class PlanPanel {
  readonly root = document.createElement('section');
  /** Actions raised since the last frame; drained by the scene. */
  readonly actions: PanelAction[] = [];
  private readonly events = new AbortController();
  private readonly parts: Record<string, HTMLElement>;
  private readonly slots: HTMLElement[];
  private readonly tiles: HTMLButtonElement[];
  private readonly cameras: HTMLButtonElement[];
  private last = '';

  constructor() {
    const root = this.root;
    root.className = 'purgatory-panel'; root.hidden = true;
    root.setAttribute('aria-label', 'Mission 2 command planning');
    root.innerHTML = `<p class="pg-kicker"></p><h2></h2><p class="pg-copy"></p>
      <p class="pg-controls"><b>W A S D</b> Drive <span>· F Camera · drag to look</span></p>
      <div class="pg-readout" role="status"><div><span>Wheels turned</span><b data-part="wheel">0.00 m</b></div><div><span>Rover moved</span><b data-part="moved">0.00 m</b></div><div><span>Wheel sink</span><b data-part="sink">0 cm</b></div></div>
      <p class="pg-hint" role="status"></p>
      <button type="button" class="pg-replay">Run the sol 446 drive</button>
      <details class="pg-planner"><summary>Command planner · optional</summary><div class="pg-planner-body">
      <ol class="pg-queue" aria-label="Queued commands">${'<li></li>'.repeat(MAX_QUEUE)}</ol>
      <div class="pg-tiles">${TILES.map((tile, i) => `<button type="button" data-tile="${i}">${tile.label}</button>`).join('')}</div>
      <div class="pg-actions"><button type="button" class="pg-send">SEND plan · E</button><button type="button" class="pg-clear">Clear</button></div>
      </div></details>
      <details><summary>Inspection cameras · F</summary>
      <div class="pg-cameras" role="group" aria-label="Camera">${CAMERA_MODES.map(mode => `<button type="button" data-camera="${mode}">${CAMERA_LABELS[mode]}</button>`).join('')}</div>
      </details><details class="pg-sources"><summary>Sources & reconstruction</summary><p></p></details>`;
    root.innerHTML = `<details class="pg-toolbox"><summary>Rover tools · E / F</summary><div class="pg-tool-content">${root.innerHTML}</div></details>`;
    const find = <E extends HTMLElement>(selector: string) => root.querySelector<E>(selector)!;
    this.parts = {
      kicker: find('.pg-kicker'), title: find('h2'), body: find('.pg-copy'), hint: find('.pg-hint'),
      wheel: find('[data-part=wheel]'), moved: find('[data-part=moved]'), sink: find('[data-part=sink]'),
      queue: find('.pg-queue'), tileBox: find('.pg-tiles'), actionBox: find('.pg-actions'),
      send: find('.pg-send'), clear: find('.pg-clear'), replay: find('.pg-replay'), planner: find('.pg-planner'),
    };
    this.parts.kicker.textContent = copy.labels;
    this.slots = [...root.querySelectorAll<HTMLElement>('.pg-queue li')];
    this.tiles = [...root.querySelectorAll<HTMLButtonElement>('[data-tile]')];
    this.cameras = [...root.querySelectorAll<HTMLButtonElement>('[data-camera]')];
    const sources = find('.pg-sources p');
    sources.append(document.createTextNode(copy.disclaimer + ' '));
    for (const [name, url] of copy.sources) {
      const link = document.createElement('a');
      link.textContent = name; link.href = url; link.target = '_blank'; link.rel = 'noopener';
      sources.append(link, document.createTextNode(' · '));
    }
    const signal = this.events.signal, raise = (action: PanelAction) => () => { this.actions.push(action); };
    this.tiles.forEach((button, index) => button.addEventListener('click', raise({ kind: 'tile', index }), { signal }));
    this.cameras.forEach(button => button.addEventListener('click', raise({ kind: 'camera', mode: button.dataset.camera as CameraMode }), { signal }));
    this.parts.send.addEventListener('click', raise({ kind: 'send' }), { signal });
    this.parts.clear.addEventListener('click', raise({ kind: 'clear' }), { signal });
    this.parts.replay.addEventListener('click', raise({ kind: 'replay' }), { signal });
    document.body.append(root);
  }
  render(view: PanelView): void {
    const signature = JSON.stringify(view);
    if (signature === this.last) return;
    this.last = signature;
    const { parts } = this, text = (node: HTMLElement, value: string) => { if (node.textContent !== value) node.textContent = value; };
    text(parts.title, view.title); text(parts.body, view.body); text(parts.hint, view.hint);
    text(parts.wheel, view.wheel); text(parts.moved, view.moved); text(parts.sink, view.sink);
    this.slots.forEach((slot, i) => {
      const item = view.queue[i];
      text(slot, item?.label ?? `Slot ${i + 1}`);
      slot.className = item?.state ?? '';
    });
    parts.queue.hidden = parts.tileBox.hidden = parts.actionBox.hidden = !view.planning;
    parts.planner.hidden = !view.planning;
    const full = view.queue.length >= MAX_QUEUE;
    this.tiles.forEach(button => { button.disabled = view.busy || full; });
    (parts.send as HTMLButtonElement).disabled = !view.busy && view.queue.length === 0;
    text(parts.send, view.busy ? 'Stop plan' : 'SEND plan · E');
    (parts.clear as HTMLButtonElement).disabled = view.busy || view.queue.length === 0;
    parts.replay.hidden = !view.replayOffered;
    (parts.replay as HTMLButtonElement).disabled = view.busy;
    this.cameras.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.camera === view.camera)));
  }
  dispose(): void { this.events.abort(); this.root.remove(); this.actions.length = 0; }
}
