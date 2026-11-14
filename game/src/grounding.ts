import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

export const WHEEL_RADIUS = 0.266;
export const SUSPENSION_TRAVEL = 0.14;
export const WHEEL_POINTS = [-1, 1].flatMap((side) => (
  [-0.66, 0, 0.66].map((z) => new Vector3(side * 0.66, WHEEL_RADIUS, z))
));

type Spring = { value: number; velocity: number };

function advanceSpring(spring: Spring, target: number, dt: number, frequency: number): void {
  const steps = Math.max(1, Math.ceil(dt * 120));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) {
    spring.velocity += ((target - spring.value) * frequency * frequency
      - spring.velocity * frequency * 1.75) * step;
    spring.value += spring.velocity * step;
  }
}

export class RoverGrounding {
  readonly offsets = Array<number>(6).fill(0);
  readonly contacts = WHEEL_POINTS.map(() => new Vector3());
  readonly travel = Array<number>(6).fill(0);
  readonly grounded = Array<boolean>(6).fill(false);
  private readonly previousContacts = WHEEL_POINTS.map(() => new Vector3());
  private readonly pitchSpring: Spring = { value: 0, velocity: 0 };
  private readonly rollSpring: Spring = { value: 0, velocity: 0 };
  private readonly heightSpring: Spring = { value: 0, velocity: 0 };
  private readonly rotation = new Quaternion();
  private readonly euler = new Euler(0, 0, 0, 'YXZ');
  private readonly sample = new Vector3();
  private initialized = false;

  get pitch(): number { return this.pitchSpring.value; }
  get roll(): number { return this.rollSpring.value; }

  reset(): void {
    this.initialized = false;
    for (const spring of [this.pitchSpring, this.rollSpring, this.heightSpring]) {
      spring.value = 0;
      spring.velocity = 0;
    }
    this.offsets.fill(0);
    this.travel.fill(0);
    this.grounded.fill(false);
    for (const point of [...this.contacts, ...this.previousContacts]) point.set(0, 0, 0);
  }

  update(
    dt: number, position: Vector3, heading: number,
    height: (x: number, z: number) => number,
    acceleration: number, steer: number, speed: number, impact: number,
  ): void {
    const step = Math.min(Math.max(dt, 0), 0.25);
    const sine = Math.sin(heading);
    const cosine = Math.cos(heading);
    const heights = WHEEL_POINTS.map((point) => height(
      position.x + point.x * cosine + point.z * sine,
      position.z - point.x * sine + point.z * cosine,
    ));
    const meanHeight = heights.reduce((sum, value) => sum + value, 0) / 6;
    const slopeX = WHEEL_POINTS.reduce((sum, point, i) => sum + point.x * heights[i], 0)
      / WHEEL_POINTS.reduce((sum, point) => sum + point.x * point.x, 0);
    const slopeZ = WHEEL_POINTS.reduce((sum, point, i) => sum + point.z * heights[i], 0)
      / WHEEL_POINTS.reduce((sum, point) => sum + point.z * point.z, 0);
    const targetPitch = MathUtils.clamp(-Math.atan(slopeZ)
      + MathUtils.clamp(acceleration * 0.012, -0.035, 0.025), -0.3, 0.3);
    const targetRoll = MathUtils.clamp(Math.atan(slopeX)
      - steer * Math.abs(speed) * 0.009, -0.28, 0.28);
    const wasInitialized = this.initialized;
    if (!wasInitialized) {
      this.pitchSpring.value = targetPitch;
      this.rollSpring.value = targetRoll;
      this.heightSpring.value = meanHeight;
    } else {
      advanceSpring(this.pitchSpring, targetPitch, step, 8);
      advanceSpring(this.rollSpring, targetRoll, step, 8);
    }

    this.rotation.setFromEuler(this.euler.set(this.pitch, heading, this.roll, 'YXZ'));
    const verticalScale = Math.cos(this.pitch) * Math.cos(this.roll);
    const rootHeights = WHEEL_POINTS.map((point) => {
      this.sample.copy(point).applyQuaternion(this.rotation);
      return height(position.x + this.sample.x, position.z + this.sample.z)
        + WHEEL_RADIUS - this.sample.y;
    });
    const targetHeight = rootHeights.reduce((sum, value) => sum + value, 0) / 6
      - Math.min(Math.abs(acceleration) * 0.0025 + impact * 0.014, 0.026);
    if (!wasInitialized) this.heightSpring.value = targetHeight;
    else advanceSpring(this.heightSpring, targetHeight, step, 9);

    // Keep the body inside the range its bounded wheel travel can support.
    const minimum = Math.max(...rootHeights) - SUSPENSION_TRAVEL * verticalScale;
    const maximum = Math.min(...rootHeights) + SUSPENSION_TRAVEL * verticalScale;
    if (minimum <= maximum) {
      const supported = MathUtils.clamp(this.heightSpring.value, minimum, maximum);
      if (supported !== this.heightSpring.value) this.heightSpring.velocity = 0;
      this.heightSpring.value = supported;
    }
    position.y = this.heightSpring.value;

    for (let i = 0; i < WHEEL_POINTS.length; i++) {
      const local = WHEEL_POINTS[i];
      let offset = this.offsets[i];
      for (let iteration = 0; iteration < 3; iteration++) {
        this.sample.set(local.x, WHEEL_RADIUS + offset, local.z)
          .applyQuaternion(this.rotation).add(position);
        const gap = height(this.sample.x, this.sample.z) + WHEEL_RADIUS - this.sample.y;
        offset = MathUtils.clamp(offset + gap / verticalScale,
          -SUSPENSION_TRAVEL, SUSPENSION_TRAVEL);
      }
      this.offsets[i] = offset;
      this.sample.set(local.x, WHEEL_RADIUS + offset, local.z)
        .applyQuaternion(this.rotation).add(position);
      const groundHeight = height(this.sample.x, this.sample.z);
      this.grounded[i] = Math.abs(this.sample.y - WHEEL_RADIUS - groundHeight) <= 0.045;
      const contact = this.contacts[i].set(this.sample.x, groundHeight, this.sample.z);
      if (wasInitialized) {
        this.travel[i] += Math.hypot(contact.x - this.previousContacts[i].x,
          contact.z - this.previousContacts[i].z);
      }
      this.previousContacts[i].copy(contact);
    }
    this.initialized = true;
  }
}
