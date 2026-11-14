import { MathUtils, Vector3 } from 'three';

type SpiritInput = { moveX: number; moveY: number; leapPressed: boolean };
type Solid = { x: number; z: number; radius: number };
type Height = (x: number, z: number) => number;
const RADIUS = 0.28;
const HOVER = 0.28;
const SPEED = 4.2;

/** Ground-following movement; its appearance and camera have no effect on collision. */
export class SpiritController {
  readonly position = new Vector3();
  readonly velocity = new Vector3();
  heading = 0;
  grounded = true;
  private lift = 0;
  private verticalVelocity = 0;

  reset(x: number, z: number, height: Height, heading = 0): void {
    this.position.set(x, height(x, z) + HOVER, z);
    this.velocity.set(0, 0, 0);
    this.heading = heading;
    this.lift = 0;
    this.verticalVelocity = 0;
    this.grounded = true;
  }

  update(dt: number, input: SpiritInput, cameraYaw: number, obstacles: readonly Solid[], height: Height): void {
    const duration = Number.isFinite(dt) ? MathUtils.clamp(dt, 0, .1) : 0;
    if (!duration) return;
    if (input.leapPressed && this.grounded) {
      this.verticalVelocity = 3.8;
      this.grounded = false;
    }
    const magnitude = Math.max(1, Math.hypot(input.moveX, input.moveY));
    const targetX = (input.moveX * Math.cos(cameraYaw) - input.moveY * Math.sin(cameraYaw)) / magnitude * SPEED;
    const targetZ = (-input.moveX * Math.sin(cameraYaw) - input.moveY * Math.cos(cameraYaw)) / magnitude * SPEED;
    const steps = Math.max(1, Math.ceil(duration * 120));
    const step = duration / steps;
    for (let i = 0; i < steps; i++) {
      const ease = 1 - Math.exp(-step * 8);
      this.velocity.x = MathUtils.lerp(this.velocity.x, targetX, ease);
      this.velocity.z = MathUtils.lerp(this.velocity.z, targetZ, ease);
      this.position.x += this.velocity.x * step;
      this.position.z += this.velocity.z * step;
      for (const solid of obstacles) {
        const dx = this.position.x - solid.x, dz = this.position.z - solid.z;
        const distance = Math.hypot(dx, dz), limit = solid.radius + RADIUS;
        if (distance >= limit) continue;
        const nx = distance > 1e-6 ? dx / distance : 0;
        const nz = distance > 1e-6 ? dz / distance : 1;
        this.position.x = solid.x + nx * limit;
        this.position.z = solid.z + nz * limit;
        const towards = this.velocity.x * nx + this.velocity.z * nz;
        if (towards < 0) {
          this.velocity.x -= towards * nx;
          this.velocity.z -= towards * nz;
        }
      }
      const distance = Math.hypot(this.position.x, this.position.z);
      if (distance > 63.5) {
        this.position.x *= 63.5 / distance;
        this.position.z *= 63.5 / distance;
      }
      if (!this.grounded) {
        this.verticalVelocity -= 8 * step;
        this.lift = Math.max(0, this.lift + this.verticalVelocity * step);
        if (this.lift === 0 && this.verticalVelocity < 0) {
          this.verticalVelocity = 0;
          this.grounded = true;
        }
      }
      this.position.y = height(this.position.x, this.position.z) + HOVER + this.lift;
    }
    if (Math.hypot(this.velocity.x, this.velocity.z) > .1) {
      this.heading = Math.atan2(-this.velocity.x, -this.velocity.z);
    }
  }
}
