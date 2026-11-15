import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Group, Mesh, Points, Vector3, type PerspectiveCamera } from 'three';
import { createEmberMaterial, createTrailMaterial, type FlameFields } from './flame-materials.ts';
import { TRAIL_CAPACITY, TrailHistory, type TrailPoint } from './trail-history.ts';

const EMBERS = 32;

export class SpiritWake {
  readonly root = new Group();
  readonly history = new TrailHistory();
  private readonly positions = new Float32Array(TRAIL_CAPACITY * 6);
  private readonly strengths = new Float32Array(TRAIL_CAPACITY * 2);
  private readonly uv = new Float32Array(TRAIL_CAPACITY * 4);
  private readonly points: TrailPoint[] = Array.from({ length: TRAIL_CAPACITY }, () =>
    ({ position: new Vector3(), age: 0, life: .65, width: 0, strength: 0 }));
  private readonly geometry = new BufferGeometry();
  private readonly mesh: Mesh;
  private readonly tangent = new Vector3();
  private readonly view = new Vector3();
  private readonly side = new Vector3();
  private readonly right = new Vector3();
  private readonly ribbonSide = new Vector3();
  private readonly headSide = new Vector3(1,0,0);
  private readonly raw = Array.from({length:TRAIL_CAPACITY},()=>new Vector3());
  private readonly startControl = new Vector3();
  private readonly endControl = new Vector3();
  private readonly olderDirection = new Vector3();
  private readonly emberPositions = new Float32Array(EMBERS * 3);
  private readonly emberVelocities = new Float32Array(EMBERS * 3);
  private readonly emberLife = new Float32Array(EMBERS);
  private readonly energy = new Float32Array(EMBERS);
  private readonly emberGeometry = new BufferGeometry();
  private readonly emberMaterial = createEmberMaterial();
  private readonly embers = new Points(this.emberGeometry, this.emberMaterial);
  private emission = 0;
  private emberCursor = 0;
  private seed = 137;
  span = 0;
  activeEmbers = 0;

  constructor(fields: FlameFields) {
    const indices: number[] = [];
    for (let i = 0; i < TRAIL_CAPACITY - 1; i++) {
      const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.geometry.setAttribute('position', new BufferAttribute(this.positions, 3).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute('uv', new BufferAttribute(this.uv, 2).setUsage(DynamicDrawUsage));
    this.geometry.setAttribute('strength', new BufferAttribute(this.strengths, 1).setUsage(DynamicDrawUsage));
    this.geometry.setIndex(indices);
    this.geometry.setDrawRange(0, 0);
    this.mesh = new Mesh(this.geometry, createTrailMaterial(fields));
    this.mesh.name = 'spirit-world-space-wake';
    this.mesh.frustumCulled = false; this.mesh.renderOrder = 12;
    this.emberGeometry.setAttribute('position', new BufferAttribute(this.emberPositions, 3).setUsage(DynamicDrawUsage));
    this.emberGeometry.setAttribute('energy', new BufferAttribute(this.energy, 1).setUsage(DynamicDrawUsage));
    this.embers.name = 'spirit-embers-32'; this.embers.frustumCulled = false; this.embers.renderOrder = 16;
    this.root.add(this.mesh, this.embers);
  }

  reset(position: Vector3): void {
    this.history.reset(position);
    this.geometry.setDrawRange(0, 0);
    this.energy.fill(0); this.emberLife.fill(0);
    this.emberGeometry.attributes.energy.needsUpdate = true;
    this.emission = this.emberCursor = this.span = this.activeEmbers = 0;
    this.seed = 137;
    this.headSide.set(1,0,0);
  }

  update(dt: number, center: Vector3, velocity: Vector3, motion: number, rush: number,
    camera: PerspectiveCamera, pixelRatio: number, viewportHeight: number, heading = 0): void {
    this.history.update(dt, center, Math.min(1, motion * 1.5), .16 + .18 * motion, .18 + .55 * motion);
    const count = this.history.count;
    for (let i = 0; i < count; i++) this.history.read(i, this.points[i]);
    // Round the path in world space. Filtering positions, not the whole object's
    // heading, preserves the old wake while taking corners out of its silhouette.
    for(let i=0;i<count;i++)this.raw[i].copy(this.points[i].position);
    for(let i=0;i<count;i++){
      const p=this.points[i].position;p.set(0,0,0);
      let total=0;
      for(let k=-2;k<=2;k++){
        const weight=k===0?6:Math.abs(k)===1?4:1;
        p.addScaledVector(this.raw[Math.max(0,Math.min(count-1,i+k))],weight);total+=weight;
      }
      p.multiplyScalar(1/total);
    }
    // A tangent-controlled collar joins the body to the existing world-space
    // stroke. On reversals it sweeps around instead of flipping a rigid cone.
    const neck=Math.min(8,count-1);
    if(neck>1){
      const end=this.points[neck].position;
      const reach=Math.min(.48,center.distanceTo(end)*.6);
      this.startControl.set(Math.sin(heading),0,Math.cos(heading)).multiplyScalar(reach).add(center);
      this.olderDirection.subVectors(this.points[Math.min(count-1,neck+3)].position,end).normalize();
      this.endControl.copy(end).addScaledVector(this.olderDirection,-reach*.65);
      for(let i=0;i<neck;i++){
        const t=i/neck,s=1-t;
        this.points[i].position.copy(center).multiplyScalar(s*s*s)
          .addScaledVector(this.startControl,3*s*s*t)
          .addScaledVector(this.endControl,3*s*t*t).addScaledVector(end,t*t*t);
      }
    }
    this.right.setFromMatrixColumn(camera.matrixWorld, 0);
    if(this.headSide.dot(this.right)<0)this.right.negate();
    this.headSide.lerp(this.right,1-Math.exp(-dt*8)).normalize();
    this.ribbonSide.copy(this.headSide);
    this.span = 0;
    let arc=0;
    const horizontalSpeed=Math.hypot(velocity.x,velocity.z);
    const reversalBlend=Math.min(1,horizontalSpeed/3);
    for (let i = 0; i < count; i++) {
      const point = this.points[i], p = point.position;
      const fade = Math.max(0, 1 - point.age / point.life);
      if(i>0)arc+=p.distanceTo(this.points[i-1].position);
      const collar=Math.min(1,arc/.32);
      const ahead=horizontalSpeed>.01?((p.x-center.x)*velocity.x+(p.z-center.z)*velocity.z)/horizontalSpeed:0;
      const dissolve=1-reversalBlend*(1-Math.exp(-Math.max(0,ahead-.15)*4));
      const strength = point.strength * fade ** 1.4 * collar * dissolve;
      this.tangent.subVectors(this.points[Math.max(0, i - 1)].position, this.points[Math.min(count - 1, i + 1)].position);
      this.view.subVectors(camera.position, p);
      this.side.crossVectors(this.tangent, this.view);
      // Near a camera-aligned or stationary segment, retain a continuous ribbon frame.
      // A per-point sign against camera-right flips abruptly as that dot crosses zero.
      const alignment = this.tangent.lengthSq() * this.view.lengthSq();
      if (alignment < 1e-8 || this.side.lengthSq() < alignment * .015) this.side.copy(this.ribbonSide);
      else this.side.normalize();
      if (this.side.dot(this.ribbonSide) < 0) this.side.negate();
      this.ribbonSide.lerp(this.side, .35).normalize();
      this.side.copy(this.ribbonSide);
      const before=this.points[Math.max(0,i-1)].position,after=this.points[Math.min(count-1,i+1)].position;
      this.olderDirection.subVectors(p,before);
      this.view.subVectors(after,p);
      const curvature=this.olderDirection.lengthSq()>1e-8&&this.view.lengthSq()>1e-8
        ? this.olderDirection.normalize().dot(this.view.normalize()) : 1;
      const width = point.width * fade ** .55 * collar * (.4+.6*Math.max(0,curvature));
      const curl = Math.sin(point.age * 12. - this.history.time * 2.5) * .045 * (1 - fade);
      for (let edge = 0; edge < 2; edge++) {
        const sign = edge === 0 ? -1 : 1, vertex = i * 2 + edge;
        this.positions[vertex * 3] = p.x + this.side.x * width * sign;
        this.positions[vertex * 3 + 1] = p.y + this.side.y * width * sign + curl;
        this.positions[vertex * 3 + 2] = p.z + this.side.z * width * sign;
        this.uv[vertex * 2] = edge; this.uv[vertex * 2 + 1] = arc*.25;
        this.strengths[vertex] = strength;
      }
      if (strength > .015) this.span = Math.max(this.span, center.distanceTo(p));
    }
    this.geometry.setDrawRange(0, Math.max(0, (count - 1) * 6));
    for (const key of ['position', 'uv', 'strength']) this.geometry.attributes[key].needsUpdate = true;
    this.updateEmbers(dt, center, velocity, motion, rush, pixelRatio < 1 ? 12 : EMBERS);
    this.emberMaterial.uniforms.uPointScale.value = viewportHeight * pixelRatio * .035;
  }

  private random(): number {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  private updateEmbers(dt: number, center: Vector3, velocity: Vector3, motion: number, rush: number, limit: number): void {
    this.activeEmbers = 0;
    for (let i = 0; i < EMBERS; i++) {
      this.emberLife[i] = Math.max(0, this.emberLife[i] - dt);
      if (i >= limit) this.emberLife[i] = 0;
      const life = this.emberLife[i]; this.energy[i] = life ** .65;
      if (life <= 0) continue;
      this.activeEmbers++;
      const j = i * 3;
      this.emberPositions[j] += this.emberVelocities[j] * dt;
      this.emberPositions[j + 1] += this.emberVelocities[j + 1] * dt;
      this.emberPositions[j + 2] += this.emberVelocities[j + 2] * dt;
    }
    this.emission += dt * (2 + motion * 12 + rush * 8);
    while (this.emission >= 1) {
      this.emission--;
      const i = this.emberCursor++ % limit, j = i * 3;
      this.emberPositions[j] = center.x + (this.random() - .5) * .5;
      this.emberPositions[j + 1] = center.y + (this.random() - .3) * .45;
      this.emberPositions[j + 2] = center.z + (this.random() - .5) * .5;
      this.emberVelocities[j] = velocity.x * .12 + (this.random() - .5) * .4;
      this.emberVelocities[j + 1] = .2 + this.random() * .3;
      this.emberVelocities[j + 2] = velocity.z * .12 + (this.random() - .5) * .4;
      this.emberLife[i] = .45 + this.random() * .45;
      this.energy[i] = this.emberLife[i] ** .65;
    }
    this.emberGeometry.attributes.position.needsUpdate = true;
    this.emberGeometry.attributes.energy.needsUpdate = true;
  }

  dispose(): void {
    this.root.removeFromParent();
    this.geometry.dispose(); (this.mesh.material as import('three').Material).dispose();
    this.emberGeometry.dispose(); this.emberMaterial.dispose(); this.root.clear();
  }
}
