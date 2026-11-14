import { MathUtils, PerspectiveCamera, Vector3, type Object3D } from 'three';
import type { Obstacle } from './controller';

export type RoverCameraPhase = 'ready' | 'drive' | 'scan' | 'extract' | 'align'
  | 'insert' | 'calibrate' | 'relay' | 'transmit' | 'end';

export type CameraMotion = { speed: number; acceleration: number; steer: number; impact: number };

export class CameraRig {
  constructor(private readonly opticalAnchor?: Object3D) {}
  readonly camera = new PerspectiveCamera(44, innerWidth / innerHeight, 0.05, 360);
  yaw = 0.33;
  pitch = 0.095;
  distance = 5.8;
  private target = new Vector3();
  private initialized = false;
  private lastMode = '';
  private followHeading = 0;
  private desiredPosition = new Vector3();
  private desiredLook = new Vector3();
  private readonly anchor = new Vector3();
  private obstacles: readonly Obstacle[] = [];
  private motion: CameraMotion = { speed: 0, acceleration: 0, steer: 0, impact: 0 };

  orbit(dragX: number, dragY: number, zoom: number): void {
    this.yaw -= dragX * 0.005;
    this.pitch = MathUtils.clamp(this.pitch + dragY * 0.003, 0.035, 0.72);
    this.distance = MathUtils.clamp(this.distance + zoom * 0.0035, 3.5, 9);
  }

  setMotion(motion: CameraMotion): void {
    this.motion = {
      speed: Number.isFinite(motion.speed) ? motion.speed : 0,
      acceleration: Number.isFinite(motion.acceleration) ? motion.acceleration : 0,
      steer: Number.isFinite(motion.steer) ? MathUtils.clamp(motion.steer, -1, 1) : 0,
      impact: Number.isFinite(motion.impact) ? MathUtils.clamp(motion.impact, 0, 1) : 0,
    };
  }

  setObstacles(obstacles: readonly Obstacle[]): void {
    this.obstacles = obstacles;
  }

  reset(): void {
    this.yaw = 0.33;
    this.pitch = 0.095;
    this.distance = 5.8;
    this.initialized = false;
    this.lastMode = '';
    this.followHeading = 0;
    this.motion = { speed: 0, acceleration: 0, steer: 0, impact: 0 };
  }

  private avoidObstacles(): void {
    const dx = this.desiredPosition.x - this.anchor.x;
    const dz = this.desiredPosition.z - this.anchor.z;
    const lengthSquared = dx * dx + dz * dz;
    if (lengthSquared < 1e-8) return;
    let fraction = 1;
    for (const obstacle of this.obstacles) {
      const ox = this.anchor.x - obstacle.x;
      const oz = this.anchor.z - obstacle.z;
      const radius = obstacle.radius + 0.28;
      const c = ox * ox + oz * oz - radius * radius;
      if (c <= 0) continue;
      const b = ox * dx + oz * dz;
      const discriminant = b * b - lengthSquared * c;
      if (discriminant < 0) continue;
      const near = (-b - Math.sqrt(discriminant)) / lengthSquared;
      if (near > 0 && near < fraction) fraction = Math.max(0.16, near - 0.04);
    }
    if (fraction < 1) this.desiredPosition.lerpVectors(this.anchor, this.desiredPosition, fraction);
  }

  update(dt: number, phase: RoverCameraPhase, rover: Object3D, socket: Object3D, donor: Vector3, relay: Vector3, optical: boolean, height: (x: number, z: number) => number): void {
    const step = Number.isFinite(dt) ? MathUtils.clamp(dt, 0, 0.1) : 0;
    const position = rover.position;
    const point = (local: Vector3) => rover.localToWorld(local);
    const mode = optical || phase === 'scan' || phase === 'calibrate' ? 'optical'
      : phase === 'align' || phase === 'insert' ? 'assembly'
      : phase === 'extract' ? 'retrieval'
      : phase === 'end' || phase === 'transmit' ? 'call'
      : phase === 'ready' ? 'title' : 'drive';
    if (!this.initialized) this.followHeading = rover.rotation.y;
    const headingDelta = Math.atan2(Math.sin(rover.rotation.y - this.followHeading),
      Math.cos(rover.rotation.y - this.followHeading));
    this.followHeading += headingDelta * (1 - Math.exp(-step * 3.1));

    if (phase === 'ready') {
      const heroYaw = rover.rotation.y + this.yaw - 0.33 - 2.562;
      const heroDistance = this.distance * 1.07;
      const heroPitch = this.pitch - 0.095;
      this.desiredPosition.set(
        position.x + Math.sin(heroYaw) * Math.cos(heroPitch) * heroDistance,
        position.y + 1.35 + Math.sin(heroPitch) * heroDistance,
        position.z + Math.cos(heroYaw) * Math.cos(heroPitch) * heroDistance,
      );
      this.desiredLook.copy(point(new Vector3(0.6, 1.03, 0)));
    } else if (phase === 'align' || phase === 'insert') {
      const socketPoint = socket.getWorldPosition(new Vector3());
      this.desiredPosition.copy(point(new Vector3(0.95, 1.62, -2.65)));
      if (this.camera.aspect < 0.8) this.desiredPosition.sub(socketPoint).multiplyScalar(1.65).add(socketPoint);
      const right = socketPoint.clone().sub(this.desiredPosition).cross(new Vector3(0, 1, 0)).normalize();
      this.desiredLook.copy(socketPoint).addScaledVector(right, innerWidth > 760 ? 0.48 : 0);
      this.desiredLook.y -= innerWidth <= 760 ? 0.15 : 0.03;
    } else if (phase === 'extract') {
      this.desiredPosition.copy(point(new Vector3(-3.0, 1.55, -0.65)));
      this.desiredLook.copy(position).lerp(donor, 0.5).add(new Vector3(0, 0.95, 0));
    } else if (mode === 'optical') {
      const head = this.opticalAnchor ?? socket.parent ?? rover;
      this.desiredPosition.copy(head.localToWorld(this.opticalAnchor ? new Vector3() : new Vector3(-0.22, 0, -0.29)));
      this.desiredLook.copy(head.localToWorld(this.opticalAnchor ? new Vector3(0,0,-25) : new Vector3(-0.22, 0, -25)));
    } else if (phase === 'transmit' || phase === 'end') {
      this.desiredPosition.copy(point(new Vector3(-3.2, 1.25, -4.2)));
      this.desiredLook.copy(position).add(new Vector3(0, 1.02, 0));
    } else {
      const yaw = this.yaw + this.followHeading;
      const distance = this.distance + MathUtils.clamp(this.motion.acceleration * 0.055, -0.14, 0.14);
      this.desiredPosition.set(
        position.x + Math.sin(yaw) * Math.cos(this.pitch) * distance,
        position.y + 0.72 + Math.sin(this.pitch) * distance
          - this.motion.acceleration * 0.015 + this.motion.impact * 0.035,
        position.z + Math.cos(yaw) * Math.cos(this.pitch) * distance,
      );
      const lead = MathUtils.clamp(this.motion.speed * 0.34, -0.35, 0.9);
      const side = -this.motion.steer * Math.min(Math.abs(this.motion.speed) * 0.16, 0.32);
      this.desiredLook.set(
        position.x - Math.sin(rover.rotation.y) * lead + Math.cos(rover.rotation.y) * side,
        position.y + 1.05 - this.motion.impact * 0.015,
        position.z - Math.cos(rover.rotation.y) * lead - Math.sin(rover.rotation.y) * side,
      );
      this.anchor.copy(position).add(new Vector3(0, 1.05, 0));
      this.avoidObstacles();
    }
    if (mode !== 'optical') {
      this.desiredPosition.y = Math.max(this.desiredPosition.y,
        height(this.desiredPosition.x, this.desiredPosition.z) + 0.35);
    }
    // Optical cuts stay on the physical lens instead of easing through its housing.
    const ease = mode === 'optical' || !this.initialized || mode !== this.lastMode
      ? 1 : 1 - Math.exp(-step * (mode === 'drive' ? 5 : 3.5));
    this.camera.position.lerp(this.desiredPosition, ease);
    this.target.lerp(this.desiredLook, ease);
    this.camera.lookAt(this.target);
    const fov = mode === 'assembly' ? 39 : mode === 'optical' ? 51 : 44;
    this.camera.fov = MathUtils.lerp(this.camera.fov, fov, ease);
    this.camera.updateProjectionMatrix();
    this.initialized = true;
    this.lastMode = mode;
  }
}
