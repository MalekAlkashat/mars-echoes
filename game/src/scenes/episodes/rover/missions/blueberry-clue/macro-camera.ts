import { PerspectiveCamera, Vector3 } from 'three';

/** Position and gaze share one response; a phase change must not snap the viewing ray. */
export class MacroCamera {
  private readonly focus = new Vector3();
  update(camera: PerspectiveCamera, position: Vector3, target: Vector3, dt: number, snap: boolean): void {
    if (snap) { camera.position.copy(position); this.focus.copy(target); }
    else {
      const blend = Number.isFinite(dt) && dt > 0 ? 1 - Math.exp(-dt * 6) : 0;
      camera.position.lerp(position, blend);
      this.focus.lerp(target, blend);
    }
    camera.lookAt(this.focus);
  }
}
