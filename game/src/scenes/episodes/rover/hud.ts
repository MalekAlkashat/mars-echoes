import { element, type UI } from '../../../ui';
import type { Progress } from './mission';

export class RoverHUD {
  private lastPhase = '';

  constructor(private ui: UI) {}

  prepare(): void {
    this.lastPhase = '';
    this.ui.resetView();
    this.ui.showIntro({
      eyebrow: 'Opening scene · playable prototype', title: 'After the mission',
      copy: 'The assignment is over.\nSomething is still moving.', button: 'Wake the rover',
      controls: 'WASD to drive · drag to look · E to interact',
      note: 'Preserved repair sequence. The complete mission and sound are still to follow.',
    });
  }

  update(progress: Progress, distance: number, near: boolean, optical: boolean, rejectTimer: number): void {
    const phase = progress.phase;
    const repairing = phase === 'align' || phase === 'insert';
    const viewing = optical || phase === 'scan' || phase === 'calibrate';
    const driving = phase === 'drive' || phase === 'relay';
    const interact = element<HTMLButtonElement>('interact-button');
    const insert = element<HTMLButtonElement>('insert-button');
    element('repair-panel').hidden = !repairing;
    element('feed').hidden = !viewing;
    element('feed-label').textContent = progress.repaired ? 'Optical channels · synchronized' : 'Optical channel · degraded';
    element('controls').hidden = !driving;
    element('interaction').hidden = repairing || phase === 'end' || phase === 'transmit';
    element('touch-rotate').hidden = phase !== 'align';
    element('touch-controls').hidden = !driving && phase !== 'align';
    element('touch-controls').style.visibility = driving || phase === 'align' ? 'visible' : 'hidden';
    interact.hidden = !near || !driving;
    interact.textContent = phase === 'relay' ? 'Call mission control  E' : 'Inspect module  E';
    const objective = phase === 'drive' ? 'Salvage an optic from the inactive rover.'
      : phase === 'scan' || phase === 'extract' ? 'Recover the compatible optical module.'
      : repairing ? 'Restore the damaged optical channel.'
      : phase === 'calibrate' ? 'Calibrating the replacement optic.'
      : phase === 'relay' ? 'Reach the relay. Call mission control.' : 'Awaiting a response.';
    element('objective').textContent = objective;
    element('chapter').textContent = progress.repaired ? 'A call home' : 'Optical recovery';
    element('interaction-text').textContent = phase === 'scan' ? 'Compatible optical assembly found.'
      : phase === 'extract' ? 'Recovering optical module.'
      : phase === 'calibrate' ? 'Optical channel stabilizing.'
      : phase === 'relay' ? near ? 'Relay connection available.' : `Relay · ${Math.ceil(distance)} m`
      : near ? 'The donor is silent. Its optic is intact.' : `Inactive rover · ${Math.ceil(distance)} m`;
    element('repair-panel').classList.toggle('aligned', progress.aligned);
    element('repair-status').textContent = phase === 'insert' ? 'Seating the module'
      : progress.aligned ? 'Connector aligned' : 'Match the keyed connector';
    element('repair-feedback').textContent = rejectTimer > 0
      ? 'The key meets the rim. Adjust the position and rotation, then try again.'
      : progress.aligned ? 'The white key and socket line up. Insert the module.'
      : 'Move the cartridge. Align its white key with the socket.';
    insert.disabled = phase === 'insert';
    element('transmission').hidden = phase !== 'transmit' && phase !== 'end';
    element('transmission-text').textContent = phase === 'end' ? 'No response.'
      : progress.elapsed < 2.7 ? 'Calling mission control.' : 'Listening…';
    element('replay-button').hidden = phase !== 'end';
    element('return-button').hidden = phase !== 'end';
    if (phase !== this.lastPhase) {
      if (phase === 'align') this.ui.canvas.focus();
      if (phase === 'end') element('replay-button').focus();
      this.lastPhase = phase;
    }
  }
}
