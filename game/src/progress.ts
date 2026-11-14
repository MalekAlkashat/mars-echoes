export type Phase = 'ready' | 'drive' | 'scan' | 'extract' | 'align' | 'insert' | 'calibrate' | 'relay' | 'transmit' | 'end';

export class Progress {
  phase: Phase = 'ready';
  elapsed = 0;
  offset = { x: 0.19, y: -0.14, angle: 0.65 };
  failedAttempts = 0;
  repaired = false;

  get aligned(): boolean {
    return Math.hypot(this.offset.x, this.offset.y) < 0.035
      && Math.abs(this.offset.angle) < 0.11;
  }

  enter(phase: Phase): void {
    this.phase = phase;
    this.elapsed = 0;
  }

  reset(): void {
    this.offset = { x: 0.19, y: -0.14, angle: 0.65 };
    this.failedAttempts = 0;
    this.repaired = false;
    this.enter('ready');
  }

  attemptInsertion(): boolean {
    if (this.phase !== 'align') return false;
    if (!this.aligned) {
      this.failedAttempts++;
      return false;
    }
    this.enter('insert');
    return true;
  }

  adjust(x: number, y: number, angle: number): void {
    if (this.phase !== 'align') return;
    this.offset.x = Math.max(-0.3, Math.min(0.3, this.offset.x + x));
    this.offset.y = Math.max(-0.25, Math.min(0.25, this.offset.y + y));
    this.offset.angle = Math.max(-1.3, Math.min(1.3, this.offset.angle + angle));
  }

  update(dt: number): void {
    this.elapsed += Math.max(0, Math.min(dt, 0.1));
    if (this.phase === 'scan' && this.elapsed > 2.2) this.enter('extract');
    else if (this.phase === 'extract' && this.elapsed > 3.4) this.enter('align');
    else if (this.phase === 'insert' && this.elapsed > 1.4) {
      this.repaired = true;
      this.enter('calibrate');
    } else if (this.phase === 'calibrate' && this.elapsed > 2.4) this.enter('relay');
    else if (this.phase === 'transmit' && this.elapsed > 5.5) this.enter('end');
  }
}
