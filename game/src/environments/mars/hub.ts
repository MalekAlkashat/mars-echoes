import { Color, FogExp2, InstancedMesh, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3 } from 'three';
import { addAtmosphere } from './atmosphere';
import type { MarsEnvironment } from './dressing';
import { surfaceTexturesReady, surfaceMaterial } from './materials';
import { disposeSceneResources } from './resources';
import { fracturedRock } from './terrain';
import { hubHeight, HUB_TERRAIN, makeHubTerrain } from './hub-terrain';

/** Present-day hub dressing; the fictional repair episode keeps its separate baseline. */
export function createHubEnvironment(): MarsEnvironment {
  const scene = new Scene();
  scene.name = 'meridiani-trough-and-crater-hub';
  scene.background = new Color('#adb1b1');
  scene.fog = new FogExp2('#adb1b1', .0013);
  scene.add(...makeHubTerrain());
  const atmosphere = addAtmosphere(scene, {skyRadius: 1400, shadowSize: 1024});
  const obstacles: MarsEnvironment['obstacles'] = [];
  const rock = fracturedRock(39, 1);
  const transform = new Object3D();
  const stone = surfaceMaterial('rock');
  stone.color.set('#cfb395');
  const shelves = [
    [-18, 1, 7, 1.2, 12], [-23, -12, 9, 1.8, 11],
    [24, -23, 12, 1.5, 9], [35, 14, 7, .9, 13],
    [-40, -35, 13, 2, 14], [10, -48, 11, 1, 8],
  ];
  const rockSize = rock.boundingBox!.getSize(new Vector3());
  for (let i = 0; i < shelves.length; i++) {
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
  const scatter: {x:number;z:number;size:number;yaw:number}[] = [];
  for (let i = 0; i < 170; i++) {
    const x = (random() - .5) * 148, z = (random() - .5) * 148;
    // Leave the approach and optional sweeping side routes readable.
    if (Math.abs(x) < 6 || Math.hypot(x + 10, z + 14) < 6) continue;
    const size = .15 + random() ** 2 * .9;
    scatter.push({x,z,size,yaw:random()*Math.PI*2});
    if (size > .65 && Math.hypot(x,z) < 62) obstacles.push({x,z,radius:size*.5});
  }
  const gravelMaterial = new MeshStandardMaterial({color:'#bca18a',roughness:1,vertexColors:true});
  const scatterMesh = new InstancedMesh(rock, gravelMaterial, scatter.length);
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
  return {
    scene, height:hubHeight, obstacles, spawn,
    setupEnvironment:atmosphere.setupEnvironment, follow:atmosphere.follow,
    ready:surfaceTexturesReady(), tick(time) { atmosphere.tick(time); },
    dispose() { if(disposed)return;disposed=true;atmosphere.dispose();disposeSceneResources(scene); },
  };
}
