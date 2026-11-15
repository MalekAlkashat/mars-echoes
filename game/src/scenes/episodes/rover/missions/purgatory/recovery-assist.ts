/** Gameplay assistance, not a historical rover algorithm. One held input meters cautious moves. */
export class RecoveryAssist {
  private wheelRun = 0;
  private rest = 0;
  private lastAngle = 0;
  easing = false;
  reset(wheelAngle = 0): void { this.wheelRun = this.rest = 0; this.lastAngle = wheelAngle; this.easing = false; }
  forward(dt: number, requested: number, wheelAngle: number, radius: number, soft: boolean): number {
    const travel = Math.abs(wheelAngle - this.lastAngle) * radius;
    this.lastAngle = wheelAngle;
    if (requested <= 0 || !soft) { this.wheelRun = this.rest = 0; this.easing = false; return requested; }
    this.easing = true;
    if (this.rest > 0) { this.rest = Math.max(0, this.rest - dt); return 0; }
    this.wheelRun += travel;
    if (this.wheelRun >= 0.42) { this.wheelRun = 0; this.rest = 0.16; return 0; }
    return requested;
  }
}
