import {
  Box3, BufferAttribute, BufferGeometry, Color, FogExp2, Group, IcosahedronGeometry,
  InstancedMesh, Material, Mesh, MeshStandardMaterial, Object3D, Scene, Vector3,
  WebGLRenderer,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { addAtmosphere } from './atmosphere';
import { fracturedRock, makeRockMaterials, makeTerrain, terrainHeight } from './terrain';
import { surfaceTexturesReady } from './worldMaterials';

export interface World {
  scene: Scene;
  height(x: number, z: number): number;
  obstacles: { x: number; z: number; radius: number }[];
  donor: Group;
  donorPosition: Vector3;
  relayPosition: Vector3;
  tick(time: number, dt: number): void;
  spawn: Vector3;
  setupEnvironment(renderer: WebGLRenderer): void;
  follow(position: Vector3): void;
  ready: Promise<void>;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function prepareMesh(root: Object3D, tint?: Color): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const source = Array.isArray(object.material) ? object.material : [object.material];
    const materials = source.map((original) => {
      const material = original.clone();
      if (material instanceof MeshStandardMaterial) {
        material.roughness = Math.max(material.roughness, 0.72);
        material.metalness *= 0.65;
        if (tint) material.color.lerp(tint, 0.32);
        if (tint && original.name === 'metalRed') material.color.copy(tint);
        material.emissive.set(0);
        material.emissiveIntensity = 0;
      }
      return material;
    });
    object.material = Array.isArray(object.material) ? materials : materials[0];
  });
}

function fittedModel(source: Object3D, length: number, tint?: Color): Group {
  const group = new Group();
  const clone = source.clone(true);
  const box = new Box3().setFromObject(clone);
  const size = box.getSize(new Vector3());
  const factor = length / Math.max(size.x, size.y, size.z, 0.001);
  const center = box.getCenter(new Vector3());
  clone.position.sub(new Vector3(center.x, box.min.y, center.z));
  group.add(clone);
  group.scale.setScalar(factor);
  prepareMesh(group, tint);
  return group;
}

function collapseStaticMeshes(root: Group): void {
  root.updateWorldMatrix(true, true);
  const inverseRoot = root.matrixWorld.clone().invert();
  const serializationCache = { textures: {}, images: {} };
  const batches = new Map<string, {
    material: Material; geometries: BufferGeometry[];
    castShadow: boolean; receiveShadow: boolean;
  }>();
  root.traverseVisible((object) => {
    if (!(object instanceof Mesh) || !object.geometry.getAttribute('position')) return;
    const source = object.geometry.index ? object.geometry.toNonIndexed() : object.geometry.clone();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const groups = Array.isArray(object.material) ? source.groups
      : [{ start: 0, count: source.getAttribute('position').count, materialIndex: 0 }];
    for (const group of groups) {
      const material = materials[group.materialIndex ?? 0];
      if (!material?.visible) continue;
      const start = Math.max(group.start, source.drawRange.start);
      const end = Math.min(group.start + group.count, source.drawRange.start + source.drawRange.count);
      if (start >= end) continue;
      const geometry = new BufferGeometry();
      for (const name of Object.keys(source.attributes)) {
        const attribute = source.getAttribute(name) as BufferAttribute;
        const values = attribute.array.slice(start * attribute.itemSize, end * attribute.itemSize);
        geometry.setAttribute(name, new BufferAttribute(values, attribute.itemSize, attribute.normalized));
      }
      geometry.applyMatrix4(inverseRoot.clone().multiply(object.matrixWorld));
      const { uuid, name, metadata, userData, ...appearance } = material.toJSON(serializationCache);
      const attributes = Object.entries(geometry.attributes).map(([key, attribute]) => (
        `${key}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`
      )).sort();
      const key = JSON.stringify([appearance, attributes, object.castShadow, object.receiveShadow]);
      let batch = batches.get(key);
      if (!batch) {
        batch = { material, geometries: [], castShadow: object.castShadow, receiveShadow: object.receiveShadow };
        batches.set(key, batch);
      }
      batch.geometries.push(geometry);
    }
    source.dispose();
  });
  root.clear();
  let index = 0;
  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.geometries, false);
    for (const input of batch.geometries) input.dispose();
    if (!geometry) throw new Error('Static wreck geometry has incompatible attributes.');
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const mesh = new Mesh(geometry, batch.material);
    mesh.name = `wreck-material-batch-${index++}`;
    mesh.castShadow = batch.castShadow;
    mesh.receiveShadow = batch.receiveShadow;
    root.add(mesh);
  }
  root.userData.materialBatches = batches.size;
}

function addGroundGrit(scene: Scene, random: () => number, material: MeshStandardMaterial): void {
  const grit = new InstancedMesh(new IcosahedronGeometry(1, 0), material, 3400);
  grit.name = 'mineral-gravel-contact-scale';
  const transform = new Object3D();
  const color = new Color();
  for (let i = 0; i < grit.count; i++) {
    const near = i < 1500;
    const x = near ? random() * 22 - 11 : random() * 160 - 80;
    const z = near ? random() * 58 - 36 : random() * 170 - 105;
    const size = near ? 0.015 + random() ** 2 * 0.065 : 0.02 + random() ** 2 * 0.11;
    transform.position.set(x, terrainHeight(x, z) + size * 0.14, z);
    transform.rotation.set(random() * 2, random() * 6.28, random() * 2);
    transform.scale.set(size * (1 + random()), size * 0.46, size);
    transform.updateMatrix();
    grit.setMatrixAt(i, transform.matrix);
    const shade = 0.62 + random() * 0.38;
    color.setRGB(shade, shade * 0.94, shade * 0.84);
    grit.setColorAt(i, color);
  }
  grit.receiveShadow = true;
  grit.computeBoundingSphere();
  scene.add(grit);
}

function retireWreck(wreck: Group, variant: number): void {
  const head= wreck.getObjectByName('optical-head');
  if(head){head.rotation.x=.24+(variant%3)*.10;head.rotation.z=(variant%2?1:-1)*(.12+(variant%3)*.06);}
  const wheels:Object3D[]=[];
  wreck.traverse(object=>{if(object.name.startsWith('wheel-'))wheels.push(object);});
  if(wheels.length){wheels[variant%wheels.length].visible=false;if(variant%4===0)wheels[(variant+3)%wheels.length].visible=false;}
}

export function createWorld(assets: Record<string, Object3D>, makeWreck: () => Group): World {
  const random = seededRandom(18427);
  const scene = new Scene();
  scene.name = 'fractured-orange-discard-valley';
  scene.background = new Color('#adb1b1');
  scene.fog = new FogExp2('#adb1b1', 0.0047);
  scene.add(...makeTerrain());
  const atmosphere = addAtmosphere(scene);
  const obstacles: World['obstacles'] = [];
  const materials = makeRockMaterials();
  const rockShapes = [4, 17, 39, 73, 121].map((seed) => fracturedRock(seed));
  const rockSizes = rockShapes.map((geometry) => geometry.boundingBox!.getSize(new Vector3()));

  const place = (object: Object3D, x: number, z: number, yaw: number, burial = 0) => {
    object.position.set(x, terrainHeight(x, z) - burial, z);
    object.rotation.y = yaw;
    scene.add(object);
    return object;
  };
  const addObstacle = (object: Object3D, reduction = 1) => {
    const box = new Box3().setFromObject(object);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    if (Math.hypot(center.x, center.z) > 67) return;
    obstacles.push({ x: center.x, z: center.z, radius: Math.hypot(size.x, size.z) * 0.46 * reduction });
  };
  const placeRock = (
    x: number, z: number, width: number, height: number, depth: number,
    variant: number, burial = 0.08, collider = true,
  ) => {
    const shape = variant % rockShapes.length;
    const rock = new Mesh(rockShapes[shape], materials.rock);
    rock.name = 'fractured-weathered-outcrop';
    const size = rockSizes[shape];
    rock.scale.set(width / size.x, height / size.y, depth / size.z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    const yaw = random() * Math.PI * 2;
    const cosine = Math.cos(yaw), sine = Math.sin(yaw);
    let lowestGround = terrainHeight(x, z);
    for (const dx of [-width * 0.36, 0, width * 0.36]) {
      for (const dz of [-depth * 0.36, 0, depth * 0.36]) {
        const sampleX = x + dx * cosine + dz * sine;
        const sampleZ = z - dx * sine + dz * cosine;
        lowestGround = Math.min(lowestGround, terrainHeight(sampleX, sampleZ));
      }
    }
    rock.position.set(x, lowestGround - burial, z);
    rock.rotation.y = yaw;
    scene.add(rock);
    if (collider) addObstacle(rock, 0.88);
    return rock;
  };

  const distanceFormations = [
    [-41, -22, 28, 13, 37], [-66, -69, 46, 25, 48], [-91, -127, 58, 34, 65],
    [-57, -190, 33, 20, 63], [44, -37, 32, 16, 39], [78, -105, 50, 31, 66],
    [61, -192, 49, 24, 72], [-101, 35, 52, 27, 60], [98, 39, 55, 26, 52],
  ];
  for (let i = 0; i < distanceFormations.length; i++) {
    const [x, z, width, height, depth] = distanceFormations[i];
    placeRock(x, z, width, height, depth, i, height * 0.48);
    placeRock(x + width * 0.26, z + depth * 0.27, width * 0.55, height * 0.48,
      depth * 0.65, i + 2, height * 0.27);
  }
  const nearbyOutcrops = [
    [-8.5, 10, 3.5, 1.5, 4], [9.2, 7, 3.8, 1.7, 3.1],
    [-12, -3, 6.6, 2.7, 7.5], [13, -14, 7, 3, 8],
    [-18, -23, 12, 5.4, 15], [23, -33, 12, 6, 14],
    [-16, -45, 9, 4.2, 11], [17, 27, 8, 3.3, 10],
  ];
  for (let i = 0; i < nearbyOutcrops.length; i++) {
    const [x, z, width, height, depth] = nearbyOutcrops[i];
    placeRock(x, z, width, height, depth, i + 1, height * 0.24 + 0.12);
  }
  for (let i = 0; i < 125; i++) {
    const width = 0.4 + random() ** 1.6 * 2.1;
    const x = (6.3 + random() * 57) * (random() < 0.5 ? -1 : 1);
    const z = random() * 123 - 78;
    placeRock(x, z, width, width * (0.35 + random() * 0.5), width * (0.6 + random() * 0.6), i, 0.06);
  }

  const wreckPositions = [
    [-5.9, 8.5], [6.2, 4], [-7, -1], [6.8, -7.5], [-6.5, -11],
    [8.5, -16], [-8.5, -21], [6.3, -27], [-12, 19], [12, 18], [-14, -34],
  ];
  const staticWrecks = new Group();
  staticWrecks.name = 'batched-near-graveyard';
  scene.add(staticWrecks);
  const tints = [new Color('#91877a'), new Color('#777b7b')];
  for (let i = 0; i < wreckPositions.length; i++) {
    const [x, z] = wreckPositions[i];
    const wreck = makeWreck();
    retireWreck(wreck,i);
    prepareMesh(wreck, tints[i % tints.length]);
    wreck.scale.multiplyScalar(0.9 + random() * 0.17);
    wreck.rotation.x = (random() - 0.5) * 0.45;
    wreck.rotation.z = i % 4 === 0 ? 1.08 : (random() - 0.5) * 0.38;
    place(wreck, x, z, random() * 6.28, 0.14 + random() * 0.28);
    addObstacle(wreck, 0.9);
    staticWrecks.add(wreck);
  }
  const distantWreck = makeWreck();
  retireWreck(distantWreck,3);
  prepareMesh(distantWreck, new Color('#696e70'));
  for (let i = 0; i < 26; i++) {
    const x = (9 + random() * 45) * (i % 2 ? -1 : 1);
    const z = -25 - random() * 70;
    const wreck = distantWreck.clone(true);
    wreck.scale.multiplyScalar(0.85 + random() * 0.22);
    wreck.rotation.x = (random() - 0.5) * 0.6;
    wreck.rotation.z = i % 6 === 0 ? -1.18 : (random() - 0.5) * 0.4;
    place(wreck, x, z, random() * 6.28, 0.2 + random() * 0.4);
    addObstacle(wreck, 0.9);
    staticWrecks.add(wreck);
  }
  collapseStaticMeshes(staticWrecks);

  const donorPosition = new Vector3(0, terrainHeight(0, -5), -5);
  const donor = makeWreck();
  donor.name = 'inactive-optical-module-donor';
  prepareMesh(donor);
  place(donor, 0, -5, Math.PI);
  obstacles.push({ x: 0, z: -5, radius: 1.05 });

  const relayPosition = new Vector3(0, terrainHeight(0, -24), -24);
  if (assets.satellitedish) {
    const relay = fittedModel(assets.satellitedish, 2.6, new Color('#8b8e89'));
    relay.name = 'silent-mission-relay';
    place(relay, 0, -24, Math.PI * 0.15);
    obstacles.push({ x: 0, z: -24, radius: 1.1 });
  }
  if (assets['machine-generator']) {
    const generator = fittedModel(assets['machine-generator'], 1.7, new Color('#6e726e'));
    generator.name = 'disconnected-relay-generator';
    place(generator, 7.6, -26.5, -0.3, 0.25);
    addObstacle(generator);
  }
  if (assets.structure) {
    const frame = fittedModel(assets.structure, 2.4, new Color('#73736b'));
    frame.name = 'partly-buried-broken-service-frame';
    frame.rotation.z = -0.48;
    place(frame, -12.5, -29, 0.6, 0.7);
    addObstacle(frame);
  }
  addGroundGrit(scene, random, materials.grit);

  const spawn = new Vector3(0, terrainHeight(0, 8), 8);
  scene.userData.layout = {
    units: 'meters', up: '+Y', forward: '-Z', playableRadius: 64,
    routeWidth: 6, spawn: spawn.toArray(), donor: donorPosition.toArray(),
    relay: relayPosition.toArray(), prototypeLayout: true,
    contactRidges: [2.8, -12.5, -18.4],
  };
  return {
    scene, height: terrainHeight, obstacles, donor, donorPosition, relayPosition, spawn,
    setupEnvironment: atmosphere.setupEnvironment,
    follow: atmosphere.follow,
    ready: surfaceTexturesReady(),
    tick(time, _dt) { atmosphere.tick(time); },
  };
}
