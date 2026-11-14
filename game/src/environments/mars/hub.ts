import { Color, FogExp2, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from 'three';
import { addAtmosphere } from './atmosphere';
import type { MarsEnvironment } from './dressing';
import { surfaceTexturesReady, surfaceMaterial } from './materials';
import { disposeSceneResources } from './resources';
import { fracturedRock } from './terrain';
import { hubHeight as sampleHubHeight, HUB_TERRAIN, makeHubTerrain } from './hub-terrain';
import { addHubRockPreview } from './hub-rock-preview';
import { addHubOutcrops, HUB_FRAGMENT_COUNT, HUB_OUTCROPS } from './hub-outcrops';
import { setRockGroundPlanes } from './hub-rock-dust';

/** Present-day hub dressing; the fictional repair episode keeps its separate baseline. */
export function createHubEnvironment(options: { scannedOutcropPreview?: boolean; variedOutcrops?: boolean; quietGround?: boolean } = {}): MarsEnvironment {
  const hubHeight = (x: number, z: number) => sampleHubHeight(x, z, options.quietGround);
  const scene = new Scene();
  scene.name = 'meridiani-trough-and-crater-hub';
  scene.background = new Color('#adb1b1');
  scene.fog = new FogExp2('#adb1b1', .0013);
  scene.add(...makeHubTerrain(options.quietGround));
  const atmosphere = addAtmosphere(scene, {skyRadius: 1400, shadowSize: 1024});
  const obstacles: MarsEnvironment['obstacles'] = [];
  const rock = fracturedRock(39, 1);
  const transform = new Object3D();
  const stone = surfaceMaterial('rock',false,{terrainDust:options.variedOutcrops});
  stone.color.set(options.variedOutcrops ? '#b27c55' : '#cfb395');
  const shelves = [
    [-18, 1, 7, 1.2, 12], [-23, -12, 9, 1.8, 11],
    [24, -23, 12, 1.5, 9], [35, 14, 7, .9, 13],
    [-40, -35, 13, 2, 14], [10, -48, 11, 1, 8],
  ];
  const rockSize = rock.boundingBox!.getSize(new Vector3());
  for (let i = 0; i < shelves.length; i++) {
    if (options.variedOutcrops) continue;
    if(i===0&&options.scannedOutcropPreview)continue; // Only this placement is under visual review.
    const [x, z, width, height, depth] = shelves[i];
    const shelf = new Mesh(rock, stone);
    shelf.name = `hub-layered-bedrock-${i}`;
    shelf.scale.set(width / rockSize.x, height / rockSize.y, depth / rockSize.z);
    let base = hubHeight(x, z);
    for (const dx of [-width * .45, 0, width * .45]) for (const dz of [-depth * .45, 0, depth * .45]) {
      base = Math.min(base, hubHeight(x + dx, z + dz));
    }
    shelf.position.set(x, base - height * .7, z);
    shelf.rotation.y = -.25;
    shelf.castShadow = shelf.receiveShadow = true;
    scene.add(shelf);
    // Conservative proxies cover the full ledge, not just its centre.
    for (const offset of [-.3, 0, .3]) obstacles.push({x: x + offset * width, z, radius: Math.min(width, depth) * .38});
  }

  let seed = 18427;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  let scatter: {x:number;z:number;size:number;yaw:number}[] = [];
  for (let i = 0; i < 170; i++) {
    const x = (random() - .5) * 148, z = (random() - .5) * 148;
    // Leave the approach and optional sweeping side routes readable.
    if (Math.abs(x) < 6 || Math.hypot(x + 10, z + 14) < 6) continue;
    const size = .15 + random() ** 2 * .9;
    scatter.push({x,z,size,yaw:random()*Math.PI*2});
  }
  if (options.variedOutcrops) {
    // Move eight existing scatter slots into the authored fragment groups; count stays fixed.
    const nearest = scatter.map((piece,index)=>({index,distance:Math.min(...HUB_OUTCROPS.map(site=>Math.hypot(piece.x-site.x,piece.z-site.z)))}))
      .sort((a,b)=>a.distance-b.distance).slice(0,HUB_FRAGMENT_COUNT);
    const replaced = new Set(nearest.map(piece=>piece.index));
    scatter = scatter.filter((_,index)=>!replaced.has(index));
  }
  for (const {x,z,size} of scatter) {
    if (size > .65 && Math.hypot(x,z) < 62) obstacles.push({x,z,radius:size*.5});
  }
  const gravelMaterial = options.quietGround ? stone
    : new MeshStandardMaterial({color:'#bca18a',roughness:1,vertexColors:true});
  const scatterMesh = new InstancedMesh(rock, gravelMaterial, scatter.length);
  if (options.variedOutcrops) setRockGroundPlanes(rock,scatter,hubHeight);
  scatterMesh.name = 'hub-instanced-scattered-bedrock';
  scatter.forEach(({x,z,size,yaw},i) => {
    transform.position.set(x,hubHeight(x,z)-size*.08,z);
    transform.rotation.set(0,yaw,0);
    transform.scale.set(size,size*.28,size*.8);
    transform.updateMatrix(); scatterMesh.setMatrixAt(i,transform.matrix);
  });
  scatterMesh.receiveShadow = true;
  scatterMesh.computeBoundingSphere();
  scene.add(scatterMesh);
  const spawn = new Vector3(0,hubHeight(0,8),8);
  scene.userData.layout = {
    units:'metres',up:'+Y',forward:'-Z',spawn:spawn.toArray(),
    playableRadius:HUB_TERRAIN.playableRadius,vistaRadius:HUB_TERRAIN.vistaRadius,
    decorativeWrecks:0,terrain:'hub-troughs-v1',seed:18427,
    landmarks:{overlook:[-10,-14],basin:[9,-37],rim:[60,-850]},
  };
  let disposed = false;
  const previewReady=options.variedOutcrops
    ? addHubOutcrops(scene,obstacles,hubHeight,stone,()=>disposed)
    : options.scannedOutcropPreview
    ? addHubRockPreview(scene,obstacles,()=>disposed,hubHeight,options.quietGround ? stone : undefined)
    : Promise.resolve();
  return {
    scene, height:hubHeight, obstacles, spawn,
    setupEnvironment:atmosphere.setupEnvironment, follow:atmosphere.follow,
    ready:Promise.all([surfaceTexturesReady(),previewReady]).then(()=>undefined), tick(time) { atmosphere.tick(time); },
    dispose() { if(disposed)return;disposed=true;atmosphere.dispose();disposeSceneResources(scene); },
  };
}
