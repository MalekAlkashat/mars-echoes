import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

type Solid = { x: number; z: number; radius: number };
export class SpiritCamera {
  readonly camera = new PerspectiveCamera(48, innerWidth / innerHeight, .1, 1600);
  yaw = 0;
  pitch = .12;
  distance = 5.8;
  private initialized = false;
  private readonly look = new Vector3();
  private readonly desired = new Vector3();
  private readonly anchor = new Vector3();
  private readonly previous = new Vector3();
  private readonly lead = new Vector3();
  private readonly lookTarget = new Vector3();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private pullback = 0;
  private bank = 0;

  reset(): void { this.initialized = false; this.lead.set(0,0,0); this.pullback = this.bank = 0; this.camera.fov = 48; this.camera.updateProjectionMatrix(); }

  orbit(dx: number, dy: number, zoom: number): void {
    this.yaw -= dx * .005;
    this.pitch = MathUtils.clamp(this.pitch + dy * .003, .04, .65);
    this.distance = MathUtils.clamp(this.distance + zoom * .0035, 3.5, 9);
  }

  update(dt: number, position: Vector3, height: (x: number, z: number) => number, obstacles: readonly Solid[], speed = 0): void {
    const anchor = this.anchor.copy(position); anchor.y += .35;
    const vx = this.initialized && dt > 0 ? (position.x - this.previous.x) / dt : 0;
    const vz = this.initialized && dt > 0 ? (position.z - this.previous.z) / dt : 0;
    this.lookTarget.set(this.reducedMotion?0:vx*.07,0,this.reducedMotion?0:vz*.07).clampLength(0,.4);
    this.lead.lerp(this.lookTarget, 1-Math.exp(-Math.max(0,dt)*7));
    this.lookTarget.copy(anchor).add(this.lead);
    const rush = this.reducedMotion ? 0 : MathUtils.clamp((speed - 1.8) / 5.7, 0, 1);
    this.pullback = MathUtils.lerp(this.pullback, rush * .55, 1 - Math.exp(-Math.max(0, dt) * 6));
    const distance = this.distance + this.pullback;
    const lateral = this.initialized && dt > 0
      ? ((position.x - this.previous.x) * Math.cos(this.yaw) - (position.z - this.previous.z) * Math.sin(this.yaw)) / dt : 0;
    this.bank = MathUtils.lerp(this.bank, this.reducedMotion ? 0 : MathUtils.clamp(-lateral * .002, -.015, .015), 1 - Math.exp(-Math.max(0, dt) * 5));
    this.previous.copy(position);
    this.desired.set(position.x + Math.sin(this.yaw) * distance,
      position.y + .75 + Math.sin(this.pitch) * this.distance,
      position.z + Math.cos(this.yaw) * distance);
    const dx = this.desired.x - anchor.x, dz = this.desired.z - anchor.z;
    const length = dx * dx + dz * dz;
    let fraction = 1;
    for (const obstacle of obstacles) {
      const ox = anchor.x - obstacle.x, oz = anchor.z - obstacle.z;
      const c = ox * ox + oz * oz - (obstacle.radius + .25) ** 2;
      if (c <= 0 || length < 1e-5) continue;
      const b = ox * dx + oz * dz, discriminant = b * b - length * c;
      if (discriminant < 0) continue;
      const near = (-b - Math.sqrt(discriminant)) / length;
      if (near > 0 && near < fraction) fraction = Math.max(.16, near - .04);
    }
    if (fraction < 1) this.desired.lerpVectors(anchor, this.desired, fraction);
    this.desired.y = Math.max(this.desired.y, height(this.desired.x, this.desired.z) + .35);
    const ease = this.initialized ? 1 - Math.exp(-dt * 5) : 1;
    this.camera.position.lerp(this.desired, ease);
    this.look.lerp(this.lookTarget, ease);
    this.camera.lookAt(this.look);
    this.camera.rotateZ(this.bank);
    const fov = 48 + 10 * rush;
    const nextFov = MathUtils.lerp(this.camera.fov, fov, 1 - Math.exp(-Math.max(0, dt) * 4));
    if (Math.abs(nextFov - this.camera.fov) > .001) {
      this.camera.fov = nextFov; this.camera.updateProjectionMatrix();
    }
    this.initialized = true;
  }
}
