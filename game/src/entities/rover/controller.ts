import { MathUtils, Vector3 } from 'three';
import { DEFAULT_ROVER_CONTACT, RoverGrounding, type RoverContactConfig } from './grounding.ts';

export type Obstacle = { x: number; z: number; radius: number };
type DriveInput = { forward: number; turn: number };

const CONTACT_GAP = 0.0004;

function approach(value: number, target: number, amount: number): number {
  return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}

export class Vehicle {
  readonly position = new Vector3();
  heading = 0;
  speed = 0;
  movedDistance = 0;
  steer = 0;
  acceleration = 0;
  impact = 0;
  private turnRate = 0;
  private readonly grounding: RoverGrounding;
  readonly config: RoverContactConfig;
  readonly wheelOffsets: number[];
  readonly contactPositions: Vector3[];
  readonly wheelTravel: number[];
  readonly grounded: boolean[];

  constructor(config: RoverContactConfig = DEFAULT_ROVER_CONTACT) {
    this.grounding = new RoverGrounding(config);
    this.config = this.grounding.config;
    this.wheelOffsets = this.grounding.offsets;
    this.contactPositions = this.grounding.contacts;
    this.wheelTravel = this.grounding.travel;
    this.grounded = this.grounding.grounded;
  }

  get pitch(): number { return this.grounding.pitch; }
  get roll(): number { return this.grounding.roll; }

  reset(x: number, z: number, heading: number): void {
    this.position.set(x, 0, z);
    this.heading = heading;
    this.speed = 0;
    this.movedDistance = 0;
    this.steer = 0;
    this.acceleration = 0;
    this.impact = 0;
    this.turnRate = 0;
    this.grounding.reset();
  }

  settle(dt: number, height: (x: number, z: number) => number): void {
    const step = Number.isFinite(dt) ? MathUtils.clamp(dt, 0, 0.25) : 0;
    this.acceleration *= Math.exp(-step * 5);
    this.steer *= Math.exp(-step * 6);
    this.turnRate *= Math.exp(-step * 6);
    this.impact *= Math.exp(-step * 7);
    this.grounding.update(step, this.position, this.heading, height,
      this.acceleration, this.steer, this.speed, this.impact);
  }

  update(
    dt: number,
    input: DriveInput,
    obstacles: readonly Obstacle[],
    height: (x: number, z: number) => number,
  ): void {
    const elapsed = Number.isFinite(dt) ? MathUtils.clamp(dt, 0, 0.25) : 0;
    const steps = Math.max(1, Math.ceil(elapsed * 90));
    const step = elapsed / steps;
    const forward = MathUtils.clamp(Number.isFinite(input.forward) ? input.forward : 0, -1, 1);
    const turn = MathUtils.clamp(Number.isFinite(input.turn) ? input.turn : 0, -1, 1);
    const targetSpeed = forward * (forward >= 0 ? 2.5 : 1.2);
    const previousSpeed = this.speed;
    const playerRadius = this.config.collisionRadius;
    const worldRadius = 64 - playerRadius;
    this.impact *= Math.exp(-elapsed * 7);

    for (let i = 0; i < steps; i++) {
      const braking = this.speed * targetSpeed < 0 || Math.abs(targetSpeed) < Math.abs(this.speed);
      this.speed = approach(this.speed, targetSpeed, (braking ? 2.8 : 1.25) * step);
      this.steer = MathUtils.damp(this.steer, turn, 5.5, step);
      const turnAuthority = 0.42 + 0.56 * Math.min(Math.abs(this.speed) / 1.7, 1);
      this.turnRate = MathUtils.damp(this.turnRate, this.steer * turnAuthority, 6.5, step);
      this.heading += this.turnRate * step;
      this.heading = Math.atan2(Math.sin(this.heading), Math.cos(this.heading));

      const previousX = this.position.x;
      const previousZ = this.position.z;
      const moveX = -Math.sin(this.heading) * this.speed * step;
      const moveZ = -Math.cos(this.heading) * this.speed * step;
      let x = previousX + moveX;
      let z = previousZ + moveZ;
      let collided = false;

      for (let pass = 0; pass < 6; pass++) {
        let corrected = false;
        for (const obstacle of obstacles) {
          const clearance = Math.max(0, obstacle.radius) + playerRadius;
          let dx = x - obstacle.x;
          let dz = z - obstacle.z;
          let distance = Math.hypot(dx, dz);
          if (distance >= clearance) continue;
          if (distance < 1e-8) {
            dx = previousX - obstacle.x;
            dz = previousZ - obstacle.z;
            distance = Math.hypot(dx, dz);
            if (distance < 1e-8) {
              dx = Math.sin(this.heading);
              dz = Math.cos(this.heading);
              distance = 1;
            }
          }
          const separation = clearance / distance;
          x = obstacle.x + dx * separation;
          z = obstacle.z + dz * separation;
          collided = true;
          corrected = true;
        }
        const distanceFromOrigin = Math.hypot(x, z);
        if (distanceFromOrigin > worldRadius) {
          const scale = worldRadius / distanceFromOrigin;
          x *= scale;
          z *= scale;
          collided = true;
          corrected = true;
        }
        if (!corrected) break;
      }

      if (obstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z)
        < Math.max(0, obstacle.radius) + playerRadius - CONTACT_GAP)) {
        x = previousX;
        z = previousZ;
      }

      const actualX = x - previousX;
      const actualZ = z - previousZ;
      const requestedSquared = moveX * moveX + moveZ * moveZ;
      if (collided && requestedSquared > 1e-12) {
        const retained = MathUtils.clamp((actualX * moveX + actualZ * moveZ) / requestedSquared, 0, 1);
        const lostSpeed = Math.abs(this.speed) * (1 - retained);
        if (lostSpeed > 0.2) this.impact = Math.max(this.impact, Math.min(lostSpeed / 1.8, 1));
        this.speed *= retained;
      }
      this.position.x = x;
      this.position.z = z;
      this.movedDistance += Math.hypot(actualX, actualZ);
    }

    if (elapsed > 0) {
      const measuredAcceleration = MathUtils.clamp((this.speed - previousSpeed) / elapsed, -5, 2.8);
      this.acceleration = MathUtils.damp(this.acceleration, measuredAcceleration, 7, elapsed);
    }
    this.grounding.update(elapsed, this.position, this.heading, height,
      this.acceleration, this.steer, this.speed, this.impact);
  }
}
