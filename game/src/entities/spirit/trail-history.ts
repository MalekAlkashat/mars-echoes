import { Vector3 } from 'three';

export const TRAIL_CAPACITY = 64;
const SAMPLE_INTERVAL = 1 / 60;
export type TrailPoint = { position: Vector3; age: number; life: number; width: number; strength: number };

/** Fixed-time world samples; old turns never inherit the character's current rotation. */
export class TrailHistory {
  private readonly positions = new Float32Array(TRAIL_CAPACITY * 3);
  private readonly born = new Float64Array(TRAIL_CAPACITY);
  private readonly lives = new Float32Array(TRAIL_CAPACITY);
  private readonly widths = new Float32Array(TRAIL_CAPACITY);
  private readonly strengths = new Float32Array(TRAIL_CAPACITY);
  private readonly previous = new Vector3();
  private readonly sample = new Vector3();
  private cursor = 0;
  count = 0;
  time = 0;
  private nextSample = SAMPLE_INTERVAL;

  reset(position: Readonly<Vector3>): void {
    this.cursor = this.count = this.time = 0;
    this.nextSample = SAMPLE_INTERVAL;
    this.previous.copy(position);
  }

  update(dt: number, position: Readonly<Vector3>, strength: number, width: number, life: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, .1);
    if (this.previous.distanceToSquared(position) > 64) this.reset(position);
    const end = this.time + dt;
    while (this.nextSample <= end + 1e-9) {
      const fraction = Math.min(1, Math.max(0, (this.nextSample - this.time) / dt));
      this.sample.lerpVectors(this.previous, position, fraction);
      const i = this.cursor;
      this.positions[i * 3] = this.sample.x;
      this.positions[i * 3 + 1] = this.sample.y;
      this.positions[i * 3 + 2] = this.sample.z;
      this.born[i] = this.nextSample;
      this.lives[i] = life;
      this.widths[i] = width;
      this.strengths[i] = strength;
      this.cursor = (i + 1) % TRAIL_CAPACITY;
      this.count = Math.min(TRAIL_CAPACITY, this.count + 1);
      this.nextSample += SAMPLE_INTERVAL;
    }
    this.time = end;
    this.previous.copy(position);
  }

  read(newestIndex: number, point: TrailPoint): boolean {
    if (newestIndex < 0 || newestIndex >= this.count) return false;
    const i = (this.cursor - 1 - newestIndex + TRAIL_CAPACITY) % TRAIL_CAPACITY;
    point.position.fromArray(this.positions, i * 3);
    point.age = Math.max(0, this.time - this.born[i]);
    point.life = this.lives[i]; point.width = this.widths[i]; point.strength = this.strengths[i];
    return true;
  }
}
