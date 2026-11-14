import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

export const WHEEL_RADIUS = 0.266;
export const SUSPENSION_TRAVEL = 0.14;
export const WHEEL_POINTS = [-1, 1].flatMap((side) => (
  [-0.66, 0, 0.66].map((z) => new Vector3(side * 0.66, WHEEL_RADIUS, z))
));

export type RoverContactConfig = {
  wheelRadius: number;
  wheelPoints: readonly Vector3[];
  suspensionTravel: number;
  collisionRadius: number;
};

export const DEFAULT_ROVER_CONTACT: RoverContactConfig = {
  wheelRadius: WHEEL_RADIUS,
  wheelPoints: WHEEL_POINTS,
  suspensionTravel: SUSPENSION_TRAVEL,
  collisionRadius: .75,
};

function checkedConfig(config: RoverContactConfig): RoverContactConfig {
  if (!Number.isFinite(config.wheelRadius) || config.wheelRadius <= 0
    || !Number.isFinite(config.suspensionTravel) || config.suspensionTravel < 0
    || !Number.isFinite(config.collisionRadius) || config.collisionRadius <= 0 || config.collisionRadius >= 64
    || config.wheelPoints.length !== 6
    || config.wheelPoints.some(point => ![point.x, point.y, point.z].every(Number.isFinite))) {
    throw new Error('Rover contact requires six finite wheel centres, positive radii and bounded suspension travel.');
  }
  const points = config.wheelPoints.map(point => point.clone());
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / 6;
  const meanZ = points.reduce((sum, point) => sum + point.z, 0) / 6;
  const xx = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  const zz = points.reduce((sum, point) => sum + (point.z - meanZ) ** 2, 0);
  const xz = points.reduce((sum, point) => sum + (point.x - meanX) * (point.z - meanZ), 0);
  if (xx * zz - xz * xz <= 1e-8) throw new Error('Rover wheel centres must span a support plane.');
  return {...config, wheelPoints: points};
}

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
  readonly config: RoverContactConfig;
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

  constructor(config: RoverContactConfig = DEFAULT_ROVER_CONTACT) {
    this.config = checkedConfig(config);
  }

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
    const {wheelPoints, wheelRadius, suspensionTravel} = this.config;
    const heights = wheelPoints.map((point) => height(
      position.x + point.x * cosine + point.z * sine,
      position.z - point.x * sine + point.z * cosine,
    ));
    const meanHeight = heights.reduce((sum, value) => sum + value, 0) / 6;
    const meanX = wheelPoints.reduce((sum, point) => sum + point.x, 0) / 6;
    const meanZ = wheelPoints.reduce((sum, point) => sum + point.z, 0) / 6;
    let xx = 0, zz = 0, xz = 0, hx = 0, hz = 0;
    wheelPoints.forEach((point, i) => {
      const x = point.x - meanX, z = point.z - meanZ;
      xx += x * x; zz += z * z; xz += x * z;
      hx += x * (heights[i] - meanHeight); hz += z * (heights[i] - meanHeight);
    });
    const determinant = xx * zz - xz * xz;
    const slopeX = (hx * zz - hz * xz) / determinant;
    const slopeZ = (hz * xx - hx * xz) / determinant;
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
    const rootHeights = wheelPoints.map((point) => {
      this.sample.copy(point).applyQuaternion(this.rotation);
      return height(position.x + this.sample.x, position.z + this.sample.z)
        + wheelRadius - this.sample.y;
    });
    const targetHeight = rootHeights.reduce((sum, value) => sum + value, 0) / 6
      - Math.min(Math.abs(acceleration) * 0.0025 + impact * 0.014, 0.026);
    if (!wasInitialized) this.heightSpring.value = targetHeight;
    else advanceSpring(this.heightSpring, targetHeight, step, 9);

    // Keep the body inside the range its bounded wheel travel can support.
    const minimum = Math.max(...rootHeights) - suspensionTravel * verticalScale;
    const maximum = Math.min(...rootHeights) + suspensionTravel * verticalScale;
    if (minimum <= maximum) {
      const supported = MathUtils.clamp(this.heightSpring.value, minimum, maximum);
      if (supported !== this.heightSpring.value) this.heightSpring.velocity = 0;
      this.heightSpring.value = supported;
    } else if (this.heightSpring.value < minimum) {
      // When the six supports exceed suspension travel, lift unloaded tyres instead of
      // letting a tyre pass through the high contact. Gravity is approximated by the spring.
      this.heightSpring.value = minimum;
      this.heightSpring.velocity = Math.max(0,this.heightSpring.velocity);
    }
    position.y = this.heightSpring.value;

    for (let i = 0; i < wheelPoints.length; i++) {
      const local = wheelPoints[i];
      let offset = this.offsets[i];
      for (let iteration = 0; iteration < 3; iteration++) {
        this.sample.set(local.x, local.y + offset, local.z)
          .applyQuaternion(this.rotation).add(position);
        const gap = height(this.sample.x, this.sample.z) + wheelRadius - this.sample.y;
        offset = MathUtils.clamp(offset + gap / verticalScale,
          -suspensionTravel, suspensionTravel);
      }
      this.offsets[i] = offset;
      this.sample.set(local.x, local.y + offset, local.z)
        .applyQuaternion(this.rotation).add(position);
      const groundHeight = height(this.sample.x, this.sample.z);
      this.grounded[i] = Math.abs(this.sample.y - wheelRadius - groundHeight) <= 0.045;
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
