import { Group, MathUtils, Mesh, PlaneGeometry, SphereGeometry, Vector3, type PerspectiveCamera } from 'three';
import { createFlameFields, createFlameMaterial, createFlowNoise, createSoftGlow } from './flame-materials.ts';
import { SpiritWake } from './wake.ts';

export type SpiritMotion = {
  position: Readonly<Vector3>; actualVelocity: Vector3; heading: number; grounded: boolean;
};

/** World-space effects and a local animated body share the existing scene lifecycle. */
export class SpiritAppearance {
  readonly root = new Group();
  readonly center = new Vector3();
  private readonly noise = createFlowNoise();
  private readonly fields = createFlameFields(this.noise);
  private readonly body = new Group();
  private readonly sphere = new SphereGeometry(1, 32, 24);
  private readonly nucleus = new Mesh(this.sphere, createFlameMaterial(this.fields, false));
  private readonly envelope = new Mesh(this.sphere, createFlameMaterial(this.fields, true));
  private readonly glow = new Mesh(new PlaneGeometry(1.5, 1.5), createSoftGlow());
  private readonly ground = new Mesh(new PlaneGeometry(1.8, 1.8).rotateX(-Math.PI / 2), createSoftGlow(true));
  private readonly wake = new SpiritWake(this.fields);
  private time = 0;
  private pulsePhase = 0;
  private motion = 0;
  private rush = 0;
  private impact = 0;
  private grounded = true;
  private disposed = false;

  constructor() {
    this.root.name = 'blue-flame-spirit-v1';
    this.nucleus.name = 'white-cyan-nucleus'; this.envelope.name = 'flowing-blue-envelope';
    this.nucleus.renderOrder = 14; this.envelope.renderOrder = 15;
    this.glow.renderOrder = 11; this.ground.renderOrder = 10;
    this.glow.frustumCulled = this.ground.frustumCulled = false;
    this.body.add(this.nucleus, this.envelope);
    this.root.add(this.body, this.glow, this.ground, this.wake.root);
    this.root.traverse(object => { object.userData.excludeAO = true; });
  }

  reset(motion: SpiritMotion): void {
    this.time = this.pulsePhase = this.motion = this.rush = this.impact = 0;
    this.fields.uPulse.value = 0;
    this.fields.uTime.value = this.fields.uMotion.value = this.fields.uRush.value = this.fields.uImpact.value = 0;
    this.grounded = motion.grounded;
    this.center.copy(motion.position); this.center.y += .35;
    this.body.position.copy(this.center); this.body.rotation.set(0, motion.heading, 0); this.body.scale.set(1, 1, 1);
    this.wake.reset(this.center);
  }

  update(dt: number, state: SpiritMotion, camera: PerspectiveCamera, height: (x: number, z: number) => number,
    pixelRatio: number, viewportHeight: number): void {
    if (this.disposed) return;
    const step = Number.isFinite(dt) ? MathUtils.clamp(dt, 0, .1) : 0;
    const speed = Math.hypot(state.actualVelocity.x, state.actualVelocity.z);
    if (step > 0) {
      this.motion = MathUtils.clamp(speed / 7.5, 0, 1);
      this.rush = MathUtils.clamp((speed - 4.2) / 3.3, 0, 1);
    }
    // Integrate phase: changing speed must not jump to a different point in the pulse.
    this.pulsePhase += step * Math.PI * 2 * (.65 + this.motion * 2.35);
    this.time += step * (.45 + this.motion * 1.8);
    if (this.grounded !== state.grounded) this.impact = state.grounded ? .16 : -.12;
    this.grounded = state.grounded;
    this.impact *= Math.exp(-step * 11);
    const breathing = Math.sin(this.pulsePhase) * .025 * (1 - this.motion * .6);
    this.center.copy(state.position); this.center.y += .35 + breathing;
    this.body.position.copy(this.center);
    const turn = Math.atan2(Math.sin(state.heading - this.body.rotation.y), Math.cos(state.heading - this.body.rotation.y));
    this.body.rotation.y += MathUtils.clamp(turn * (1 - Math.exp(-step * 9)), -step * 4.5, step * 4.5);
    const pulse = 1 + Math.sin(this.pulsePhase) * .055;
    this.body.scale.set((1 - this.motion * .08) * pulse, pulse, (1 + this.motion * .12) * pulse);
    this.fields.uPulse.value = this.pulsePhase;
    this.fields.uTime.value = this.time;
    // Gather the flame around its soul during a hard turn, then unfurl behind it.
    this.fields.uMotion.value = this.motion * Math.max(.2, Math.cos(turn));
    this.fields.uRush.value = this.rush;
    this.fields.uImpact.value = this.impact;
    this.glow.position.copy(this.center); this.glow.quaternion.copy(camera.quaternion);
    this.glow.scale.setScalar(1 + this.rush * .2);
    this.glow.material.uniforms.uOpacity.value = .18 + this.rush * .06;
    const groundY = height(state.position.x, state.position.z);
    this.ground.position.set(state.position.x, groundY + .024, state.position.z);
    const vertices = this.ground.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      vertices.setY(i, height(state.position.x + vertices.getX(i), state.position.z + vertices.getZ(i)) - groundY);
    }
    vertices.needsUpdate = true;
    this.ground.material.uniforms.uOpacity.value = .14 / (1 + Math.max(0, this.center.y - groundY - .63) * 3);
    if (step > 0) this.wake.update(step, this.center, state.actualVelocity, this.motion, this.rush, camera, pixelRatio, viewportHeight, this.body.rotation.y);
  }

  debug(): Record<string, number | string> {
    return { spirit: 'blue-flame-v1', spiritSpeed: this.motion * 7.5, spiritRush: this.rush,
      pulseHz: .65 + this.motion * 2.35, pulsePhase: this.pulsePhase,
      trailSpan: this.wake.span, trailSamples: this.wake.history.count, spiritEmbers: this.wake.activeEmbers };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.root.removeFromParent(); this.wake.dispose();
    this.sphere.dispose(); this.nucleus.material.dispose(); this.envelope.material.dispose();
    this.glow.geometry.dispose(); this.glow.material.dispose();
    this.ground.geometry.dispose(); this.ground.material.dispose(); this.noise.dispose();
    this.root.clear();
  }
}

export function createSpiritAppearance(): SpiritAppearance { return new SpiritAppearance(); }
