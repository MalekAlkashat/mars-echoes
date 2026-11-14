import {
  Box3, BufferAttribute, BufferGeometry, InstancedMesh, Mesh, MeshStandardMaterial,
  Quaternion, Raycaster, Scene, Vector2, Vector3,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { disposeSceneResources } from './resources.ts';
import { bakeRockBaseDust, setRockGroundPlanes, type DustFootprint } from './hub-rock-dust.ts';

type Shape = 'ridge' | 'slab' | 'block' | 'fragment';
type Placement = { shape: Shape; x: number; z: number; scale: number; yaw: number; burial: number };
type Solid = { x: number; z: number; radius: number; kind?: 'rock' };
export type RockKit = Record<Shape, BufferGeometry>;

// Existing six landmark sites; sizes are uniform so scanned proportions survive.
export const HUB_OUTCROPS: readonly Placement[] = [
  {shape:'ridge', x:-18, z:1, scale:2, yaw:-.45, burial:.45},
  {shape:'slab', x:-23, z:-12, scale:2.4, yaw:.72, burial:.18},
  {shape:'block', x:24, z:-23, scale:1.55, yaw:-1.1, burial:.16},
  {shape:'slab', x:35, z:14, scale:2.15, yaw:-.6, burial:.24},
  {shape:'ridge', x:-40, z:-35, scale:1.65, yaw:1.25, burial:.23},
  {shape:'block', x:10, z:-48, scale:1.35, yaw:2.3, burial:.20},
];

// Sparse broken-off pieces give each site a different footprint, not six identical clusters.
const FRAGMENTS: readonly Placement[] = [
  {shape:'fragment', x:-16.3, z:2.1, scale:.75, yaw:.3, burial:.08},
  {shape:'fragment', x:-21.4, z:-10.7, scale:.9, yaw:1.1, burial:.10},
  {shape:'fragment', x:-22.2, z:-13.9, scale:.6, yaw:-.4, burial:.08},
  {shape:'fragment', x:25.2, z:-21.8, scale:1, yaw:-1.2, burial:.12},
  {shape:'fragment', x:33.5, z:14.6, scale:.8, yaw:.7, burial:.09},
  {shape:'fragment', x:-38.8, z:-33.5, scale:.85, yaw:1.5, burial:.10},
  {shape:'fragment', x:-41.4, z:-34.5, scale:.6, yaw:-.8, burial:.07},
  {shape:'fragment', x:8.8, z:-47.3, scale:.7, yaw:2.8, burial:.08},
];
export const HUB_FRAGMENT_COUNT = FRAGMENTS.length;

/** Setup-only placement/collision work. Rendered instances share four geometries and one material. */
export function populateHubOutcrops(scene: Scene, obstacles: Solid[], height: (x:number,z:number)=>number,
  stone: MeshStandardMaterial, kit: RockKit): Mesh[] {
  const up = new Vector3(0,1,0), point = new Vector3();
  const ray = new Raycaster(new Vector3(), new Vector3(0,-1,0));
  const placements = [...HUB_OUTCROPS, ...FRAGMENTS];
  const placed: Mesh[] = [];
  const footprints: DustFootprint[] = [];
  for (const spec of placements) {
    const mesh = new Mesh(kit[spec.shape], stone);
    mesh.name = `hub-${spec.shape}-${placed.length}`;
    mesh.scale.setScalar(spec.scale);
    // Sit on the local shoulder instead of tilting an arbitrary stretched blob.
    const dx = (height(spec.x+1,spec.z)-height(spec.x-1,spec.z))/2;
    const dz = (height(spec.x,spec.z+1)-height(spec.x,spec.z-1))/2;
    mesh.quaternion.setFromUnitVectors(up, new Vector3(-dx,1,-dz).normalize());
    mesh.quaternion.multiply(new Quaternion().setFromAxisAngle(up,spec.yaw));
    mesh.position.set(spec.x,0,spec.z);
    mesh.updateMatrixWorld(true);
    const positions = mesh.geometry.getAttribute('position');
    mesh.geometry.computeBoundingBox();
    const floor = mesh.geometry.boundingBox!.min.y;
    let base = Infinity;
    for (let i=0;i<positions.count;i++) {
      if (positions.getY(i)>floor+.002) continue;
      point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);
      base = Math.min(base,height(point.x,point.z)-point.y);
    }
    mesh.position.y = base-spec.burial;
    mesh.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(mesh);
    const firstObstacle = obstacles.length;
    const footprint: DustFootprint = {bounds,points:[]};
    // Occupied columns track the visible footprint; low chips remain walkable detail.
    const spacing=.4;
    for (let x=bounds.min.x+.12;x<bounds.max.x;x+=spacing) {
      for (let z=bounds.min.z+.12;z<bounds.max.z;z+=spacing) {
        ray.ray.origin.set(x,bounds.max.y+1,z);
        const hit=ray.intersectObject(mesh,false)[0];
        if (hit && hit.point.y>height(x,z)-.06) footprint.points.push(new Vector2(x,z));
        if (hit && hit.point.y>height(x,z)+.22) obstacles.push({x,z,radius:.29,kind:'rock'});
      }
    }
    mesh.userData = {shape:spec.shape, burial:spec.burial, firstObstacle, obstacleCount:obstacles.length-firstObstacle};
    placed.push(mesh);
    footprints.push(footprint);
  }
  for (const shape of ['ridge','slab','block','fragment'] as const) {
    const pieces = placed.filter(mesh=>mesh.userData.shape===shape);
    const batch = new InstancedMesh(kit[shape],stone,pieces.length);
    setRockGroundPlanes(kit[shape],pieces.map(mesh=>mesh.position),height);
    batch.name = `hub-outcrops-${shape}`;
    pieces.forEach((mesh,i)=>batch.setMatrixAt(i,mesh.matrixWorld));
    batch.castShadow = shape!=='fragment';
    batch.receiveShadow = true;
    batch.computeBoundingSphere();
    scene.add(batch);
  }
  bakeRockBaseDust(scene.getObjectByName('hub-traversable-troughs') as Mesh | undefined,footprints);
  scene.userData.outcrops = {sites:HUB_OUTCROPS.length, fragments:FRAGMENTS.length,
    triangles:placed.reduce((sum,mesh)=>sum+(mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position').count)/3,0),
    geometryVariants:4, materialCount:1};
  return placed;
}

export async function addHubOutcrops(scene: Scene, obstacles: Solid[], height: (x:number,z:number)=>number,
  stone: MeshStandardMaterial, isDisposed:()=>boolean): Promise<void> {
  const {scene:source} = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}assets/rocks/hub-kit-v1/rock-kit.glb`);
  if (isDisposed()) { disposeSceneResources(source); return; }
  const kit = {} as RockKit;
  source.updateMatrixWorld(true);
  source.traverse(object=>{
    if (!(object instanceof Mesh)) return;
    const shape = object.name as Shape;
    if (!['ridge','slab','block','fragment'].includes(shape)) return;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    geometry.setAttribute('color',new BufferAttribute(new Float32Array(geometry.getAttribute('position').count*3).fill(1),3));
    kit[shape] = geometry;
  });
  disposeSceneResources(source);
  try {
    if (Object.keys(kit).length!==4) throw new Error('Hub rock kit is incomplete');
    populateHubOutcrops(scene,obstacles,height,stone,kit);
  } catch (error) {
    Object.values(kit).forEach(geometry=>geometry.dispose());
    throw error;
  }
}
