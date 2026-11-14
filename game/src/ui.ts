import type { Progress } from './progress';

export function element<T extends HTMLElement>(id: string): T {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Missing interface element: ${id}`);
  return result as T;
}

export class UI {
  readonly canvas = element<HTMLCanvasElement>('scene');
  readonly start = element<HTMLButtonElement>('start-button');
  readonly insert = element<HTMLButtonElement>('insert-button');
  readonly interact = element<HTMLButtonElement>('interact-button');
  private lastPhase = '';

  loaded(): void {
    element('load-status').textContent = 'The scene is ready.';
    this.start.disabled = false;
  }

  error(message: string): void {
    element('intro').hidden = false;
    element('load-status').textContent = message;
    this.start.textContent = 'Reload scene';
    this.start.disabled = false;
    this.start.onclick = () => location.reload();
  }

  playing(): void {
    element('intro').hidden = true;
    element('pause').hidden = true;
    element('topbar').hidden = false;
    element('hud').hidden = false;
    document.body.classList.add('playing');
    this.canvas.focus();
  }

  pause(paused: boolean): void {
    element('pause').hidden = !paused;
    if (paused) element('resume-button').focus();
    else this.canvas.focus();
  }

  update(progress: Progress, distance: number, near: boolean, optical: boolean, rejectTimer: number): void {
    const phase = progress.phase;
    const repairing = phase === 'align' || phase === 'insert';
    const viewing = optical || phase === 'scan' || phase === 'calibrate';
    const driving = phase === 'drive' || phase === 'relay';
    element('repair-panel').hidden = !repairing;
    element('feed').hidden = !viewing;
    element('feed-label').textContent = progress.repaired ? 'Optical channels · synchronized' : 'Optical channel · degraded';
    element('controls').hidden = !driving;
    element('interaction').hidden = repairing || phase === 'end' || phase === 'transmit';
    element('touch-rotate').hidden = phase !== 'align';
    element('touch-controls').hidden = !driving && phase !== 'align';
    element('touch-controls').style.visibility = driving || phase === 'align' ? 'visible' : 'hidden';
    this.interact.hidden = !near || !driving;
    this.interact.textContent = phase === 'relay' ? 'Call mission control  E' : 'Inspect module  E';
    const objective = phase === 'drive' ? 'Salvage an optic from the inactive rover.'
      : phase === 'scan' || phase === 'extract' ? 'Recover the compatible optical module.'
      : repairing ? 'Restore the damaged optical channel.'
      : phase === 'calibrate' ? 'Calibrating the replacement optic.'
      : phase === 'relay' ? 'Reach the relay. Call mission control.'
      : 'Awaiting a response.';
    element('objective').textContent = objective;
    element('chapter').textContent = progress.repaired ? 'A call home' : 'Optical recovery';
    element('interaction-text').textContent = phase === 'scan' ? 'Compatible optical assembly found.'
      : phase === 'extract' ? 'Recovering optical module.'
      : phase === 'calibrate' ? 'Optical channel stabilizing.'
      : phase === 'relay' ? near ? 'Relay connection available.' : `Relay · ${Math.ceil(distance)} m`
      : near ? 'The donor is silent. Its optic is intact.' : `Inactive rover · ${Math.ceil(distance)} m`;
    element('repair-panel').classList.toggle('aligned', progress.aligned);
    element('repair-status').textContent = phase === 'insert' ? 'Seating the module' : progress.aligned ? 'Connector aligned' : 'Match the keyed connector';
    element('repair-feedback').textContent = rejectTimer > 0 ? 'The key meets the rim. Adjust the position and rotation, then try again.'
      : progress.aligned ? 'The white key and socket line up. Insert the module.' : 'Move the cartridge. Align its white key with the socket.';
    this.insert.disabled = phase === 'insert';
    element('transmission').hidden = phase !== 'transmit' && phase !== 'end';
    element('transmission-text').textContent = phase === 'end' ? 'No response.' : progress.elapsed < 2.7 ? 'Calling mission control.' : 'Listening…';
    element('replay-button').hidden = phase !== 'end';
    if (phase !== this.lastPhase) {
      if (phase === 'align') this.canvas.focus();
      if (phase === 'end') element('replay-button').focus();
      this.lastPhase = phase;
    }
  }
}
