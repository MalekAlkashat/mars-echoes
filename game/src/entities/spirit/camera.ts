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

  orbit(dx: number, dy: number, zoom: number): void {
    this.yaw -= dx * .005;
    this.pitch = MathUtils.clamp(this.pitch + dy * .003, .04, .65);
    this.distance = MathUtils.clamp(this.distance + zoom * .0035, 3.5, 9);
  }

  update(dt: number, position: Vector3, height: (x: number, z: number) => number, obstacles: readonly Solid[]): void {
    const anchor = position.clone().add(new Vector3(0, .65, 0));
    this.desired.set(position.x + Math.sin(this.yaw) * this.distance,
      position.y + .75 + Math.sin(this.pitch) * this.distance,
      position.z + Math.cos(this.yaw) * this.distance);
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
    this.look.lerp(anchor, ease);
    this.camera.lookAt(this.look);
    this.initialized = true;
  }
}
