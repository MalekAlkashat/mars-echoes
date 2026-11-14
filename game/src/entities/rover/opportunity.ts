import { Box3, Group, MathUtils, Mesh, Object3D, Vector3 } from 'three';
import type { RoverContactConfig } from './grounding.ts';

export const OPPORTUNITY_WHEELS = ['left-front','left-middle','left-rear','right-front','right-middle','right-rear'] as const;

/** Rigid axle pivots around the supplied mesh; source materials and geometry remain cache-owned. */
export function createOpportunityRover(template: Object3D) {
  const root = new Group();
  root.name = 'opportunity-rover';
  root.rotation.order = 'YXZ';
  root.add(template.clone(true));
  root.updateMatrixWorld(true);
  const radii: number[] = [];
  const centers: Vector3[] = [];
  const carriers: Group[] = [];
  const wheels: Group[] = [];
  for (const id of OPPORTUNITY_WHEELS) {
    const source = root.getObjectByName(`wheel-${id}`);
    if (!(source instanceof Mesh)) throw new Error(`Opportunity is missing wheel-${id}.`);
    const radius = source.userData.wheelRadius;
    if (!Number.isFinite(radius) || radius <= 0) throw new Error(`Opportunity wheel-${id} has no measured radius.`);
    const center = root.worldToLocal(source.getWorldPosition(new Vector3()));
    const carrier = new Group();
    carrier.name = `steering-${id}`;
    carrier.position.copy(center);
    const spin = new Group();
    spin.name = `axle-${id}`;
    carrier.add(spin);
    root.add(carrier);
    // Exported wheel geometry is already centred on its measured axle.
    source.removeFromParent();
    source.position.set(0,0,0);
    spin.add(source);
    radii.push(radius); centers.push(center); carriers.push(carrier); wheels.push(spin);
  }
  const opticalAnchor = new Object3D();
  opticalAnchor.name = 'opportunity-optical-camera';
  opticalAnchor.position.set(0,1.45,-.35);
  root.add(opticalAnchor);
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  const contactConfig: RoverContactConfig = {
    wheelRadius: Math.max(...radii), wheelPoints:centers,
    suspensionTravel:.065, collisionRadius:Math.hypot(size.x,size.z)*.5,
  };
  const suspension = root.getObjectByName('suspension-body');
  let deformSuspension: (offsets: readonly number[]) => void = () => {};
  if (suspension instanceof Mesh) {
    // The source is static. Small weighted endpoint offsets keep the original links attached;
    // this retains the existing spring approximation, rather than claiming a rocker-bogie solver.
    suspension.geometry = suspension.geometry.clone();
    suspension.geometry.userData = {...suspension.geometry.userData,sharedAsset:false};
    const position = suspension.geometry.getAttribute('position');
    const rest = new Float32Array(position.array);
    const nearest = new Uint8Array(position.count), weights = new Float32Array(position.count);
    const last = Array<number>(6).fill(Infinity);
    for (let v=0;v<position.count;v++) {
      const x=position.getX(v),y=position.getY(v),z=position.getZ(v);
      let distance=Infinity;
      centers.forEach((center,i)=>{const d=(x-center.x)**2+(z-center.z)**2;if(d<distance){distance=d;nearest[v]=i;}});
      weights[v]=MathUtils.smoothstep(Math.abs(x),.28,.44)*(1-MathUtils.smoothstep(y,.2,.43));
    }
    suspension.geometry.computeBoundingSphere();
    suspension.geometry.boundingSphere!.radius+=contactConfig.suspensionTravel;
    deformSuspension = offsets => {
      const values = centers.map((_,i)=>MathUtils.clamp(offsets[i]??0,-contactConfig.suspensionTravel,contactConfig.suspensionTravel));
      if(values.every((value,i)=>Math.abs(value-last[i])<.0001))return;
      values.forEach((value,i)=>{last[i]=value;});
      for(let v=0;v<position.count;v++)position.setY(v,rest[v*3+1]+values[nearest[v]]*weights[v]);
      position.needsUpdate=true;
      suspension.geometry.computeVertexNormals();
    };
  }
  const angles = Array<number>(6).fill(0);
  const direction = new Vector3();
  const setSuspension = (offsets: readonly number[], steer = 0) => {
    carriers.forEach((carrier,i) => {
      carrier.position.y = centers[i].y + MathUtils.clamp(offsets[i] ?? 0,-contactConfig.suspensionTravel,contactConfig.suspensionTravel);
      carrier.rotation.y = i % 3 === 0 ? steer : i % 3 === 2 ? -steer : 0;
    });
    deformSuspension(offsets);
  };
  const reset = () => { angles.fill(0); wheels.forEach(wheel => {wheel.rotation.x=0;}); setSuspension([]); };
  const roll = (previous: readonly Vector3[], current: readonly Vector3[], heading: number, moving: boolean) => {
    if (!moving) return;
    wheels.forEach((wheel,i) => {
      const yaw = heading + carriers[i].rotation.y;
      direction.subVectors(current[i],previous[i]);
      angles[i] -= (direction.x * -Math.sin(yaw) + direction.z * -Math.cos(yaw)) / radii[i];
      wheel.rotation.x = angles[i];
    });
  };
  root.userData.rig = 'opportunity-v1';
  root.userData.source = '24883_MER_static.usdz';
  return {root,wheels,carriers,radii,contactConfig,opticalAnchor,setSuspension,roll,reset};
}
