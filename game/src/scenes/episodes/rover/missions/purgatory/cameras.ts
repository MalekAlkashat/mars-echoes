/** Mission-local cameras: a travel-trailing chase, three wheel inspections, an overview and a mast look-back. */
import { MathUtils, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { ROVER, SITE } from './site.ts';

export const CAMERA_MODES = ['chase', 'wheel-lf', 'wheel-rf', 'wheel-rear', 'overview', 'lookback'] as const;
export type CameraMode = typeof CAMERA_MODES[number];
export const CAMERA_LABELS: Record<CameraMode, string> = {
  chase: 'Chase', 'wheel-lf': 'Left front wheel', 'wheel-rf': 'Right front wheel', 'wheel-rear': 'Rear wheels', overview: 'Overview', lookback: 'Look back',
};
type Pose = { x: number; y: number; z: number; heading: number; pitch: number; travelSign: number };
export type Shot = 'intro' | 'stuck' | 'outro' | 'sand';

export class SliceCameras {
  readonly camera = new PerspectiveCamera(44, innerWidth / innerHeight, 0.03, 900);
  mode: CameraMode = 'chase';
  yaw = 0.3; pitch = 0.22; distance = 5.8;
  /** Side of the rover the chase camera trails on: eased between -1 and +1 when travel reverses. */
  private side = 1;
  private readonly wanted = new Vector3();
  private readonly look = new Vector3();
  private settled = false;
  private shot: Shot | undefined;
  private transition = 1;
  private transitionDuration = 1.15;
  private readonly fromPosition = new Vector3();
  private readonly fromRotation = new Quaternion();
  private readonly wantedRotation = new Quaternion();
  private readonly aim = new Matrix4();
  private fromFov = 44;

  reset(): void { this.mode = 'chase'; this.shot = undefined; this.yaw = 0.3; this.pitch = 0.22; this.distance = 5.8; this.side = 1; this.settled = false; this.transition = 1; }
  private handoff(): void {
    this.fromPosition.copy(this.camera.position); this.fromRotation.copy(this.camera.quaternion);
    this.fromFov = this.camera.fov; this.transition = 0;
  }
  set(mode: CameraMode): void { if (mode !== this.mode) { this.mode = mode; this.handoff(); } }
  next(): void { this.set(CAMERA_MODES[(CAMERA_MODES.indexOf(this.mode) + 1) % CAMERA_MODES.length]); }
  orbit(dragX: number, dragY: number, zoom: number): void {
    if (this.mode !== 'chase') return;
    this.yaw -= dragX * 0.005;
    this.pitch = MathUtils.clamp(this.pitch + dragY * 0.003, 0.08, 0.75);
    this.distance = MathUtils.clamp(this.distance + zoom * 0.0035, 3.6, 9);
  }
  private local(pose: Pose, lx: number, ly: number, lz: number, out: Vector3): Vector3 {
    const c = Math.cos(pose.heading), s = Math.sin(pose.heading);
    return out.set(pose.x + lx * c + lz * s, pose.y + ly, pose.z - lx * s + lz * c);
  }
  update(dt: number, pose: Pose, height: (x: number, z: number) => number, reduced: boolean, shot?: Shot, progress = 0): void {
    if (shot !== this.shot) { this.shot = shot; this.handoff(); }
    let fov = 44;
    if (shot === 'intro') {
      // Authored camera only; the actual Driver still owns every centimetre of rover travel.
      const p = reduced ? 0.5 : MathUtils.clamp(progress, 0, 1);
      this.local(pose, -4.6 + p * 1.1, 1.7 - p * 0.35, 3.8, this.wanted);
      this.local(pose, 0, 0.6, 0, this.look); fov = 42;
    } else if (shot === 'stuck') {
      this.local(pose, 2.3, 0.45, -0.2, this.wanted);
      this.local(pose, 0.25, 0.15, 0.1, this.look); fov = 41;
    } else if (shot === 'sand') {
      const p = reduced ? 0.5 : MathUtils.clamp(progress, 0, 1);
      this.wanted.set(SITE.stuck.x + 2.8 - p * 0.5, height(SITE.stuck.x + 2.8, SITE.stuck.z - 3) + 1.9 - p * 0.6, SITE.stuck.z - 3.4 + p * 0.6);
      this.look.set(SITE.stuck.x, height(SITE.stuck.x, SITE.stuck.z) + 0.02, SITE.stuck.z + 0.2);
      fov = 42 - p * 6;
    } else if (shot === 'outro') {
      const p = reduced ? 0.5 : MathUtils.clamp(progress, 0, 1);
      this.wanted.set(pose.x + 6.8 + p * 0.4, height(pose.x + 6.8, pose.z - 8) + 3.6, pose.z - 8);
      this.look.set(pose.x + 2.5, pose.y + 0.25, pose.z + 2); fov = 48;
    } else if (this.mode === 'chase') {
      // Trail the direction of travel, so the place the rover is heading stays up-screen.
      this.side = MathUtils.damp(this.side, pose.travelSign, reduced ? 100 : 1.6, dt);
      const angle = pose.heading + this.yaw * this.side + (1 - this.side) * Math.PI / 2;
      const flat = this.distance * Math.cos(this.pitch);
      this.wanted.set(pose.x + Math.sin(angle) * flat, pose.y + 0.9 + this.distance * Math.sin(this.pitch), pose.z + Math.cos(angle) * flat);
      this.look.set(pose.x - Math.sin(angle) * 1.1, pose.y + 0.55, pose.z - Math.cos(angle) * 1.1);
    } else if (this.mode === 'overview') {
      this.wanted.set(5.2, height(5.2, -3.6) + 3.4, -3.6); this.look.set(0.2, height(0.2, 1.2) + 0.2, 1.2); fov = 42;
    } else if (this.mode === 'lookback') {
      // Mast height, over the rear deck toward the trap; modelled on PIA07999.
      // Just above and behind the mast head, so the mast itself never blocks the view.
      this.local(pose, ROVER.mast.x, ROVER.mast.y + 0.2, ROVER.mast.z + 0.22, this.wanted);
      this.look.set(SITE.stuck.x, height(SITE.stuck.x, SITE.stuck.z) + 0.05, SITE.stuck.z); fov = 45;
    } else {
      const [wx, wz] = this.mode === 'wheel-lf' ? ROVER.wheels[0] : this.mode === 'wheel-rf' ? ROVER.wheels[3] : [0, ROVER.wheels[2][1]];
      const out = this.mode === 'wheel-lf' ? -1 : this.mode === 'wheel-rf' ? 1 : 0;
      if (out) { this.local(pose, wx + out * 0.82, 0.17, wz - 0.28, this.wanted); fov = 36; this.local(pose, wx, ROVER.wheelRadius * 0.6, wz, this.look); }
      // Rear pair from behind and to one side, low: the leading wheels at the trench heads.
      else { this.local(pose, 1.55, 0.5, wz + 1.25, this.wanted); fov = 40; this.local(pose, 0.1, 0.1, wz - 0.1, this.look); }
      // Never let an inspection camera dip below the sand it is looking across.
      this.wanted.y = Math.max(this.wanted.y, height(this.wanted.x, this.wanted.z) + 0.1);
    }
    this.wanted.y = Math.max(this.wanted.y, height(this.wanted.x, this.wanted.z) + 0.18);
    this.aim.lookAt(this.wanted, this.look, this.camera.up); this.wantedRotation.setFromRotationMatrix(this.aim);
    if (this.transition === 0) this.transitionDuration = Math.max(1.15, this.fromPosition.distanceTo(this.wanted) / 7);
    let nextFov = fov;
    if (!this.settled || reduced) {
      this.camera.position.copy(this.wanted); this.camera.quaternion.copy(this.wantedRotation); this.transition = 1;
    } else if (this.transition < 1) {
      // One explicit interpolation stage; no second follow smoother during the handoff.
      this.transition = Math.min(1, this.transition + dt / this.transitionDuration);
      const t = this.transition * this.transition * (3 - 2 * this.transition);
      this.camera.position.lerpVectors(this.fromPosition, this.wanted, t);
      this.camera.quaternion.slerpQuaternions(this.fromRotation, this.wantedRotation, t);
      nextFov = MathUtils.lerp(this.fromFov, fov, t);
    } else {
      const ease = 1 - Math.exp(-dt * 5);
      this.camera.position.lerp(this.wanted, ease); this.camera.quaternion.slerp(this.wantedRotation, ease);
    }
    this.settled = true;
    this.camera.position.y = Math.max(this.camera.position.y, height(this.camera.position.x, this.camera.position.z) + 0.18);
    if (this.camera.fov !== nextFov) { this.camera.fov = nextFov; this.camera.updateProjectionMatrix(); }
  }
}
