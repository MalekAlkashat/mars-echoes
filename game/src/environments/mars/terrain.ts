import {
  BufferAttribute, BufferGeometry, Color, IcosahedronGeometry, MathUtils,
  Mesh, MeshStandardMaterial, PlaneGeometry, Vector3,
} from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rockVertexColor, surfaceMaterial } from './materials';

export function noise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z);
  const tx = x - ix, tz = z - iz;
  const ux = tx * tx * (3 - 2 * tx), uz = tz * tz * (3 - 2 * tz);
  const hash = (a: number, b: number) => {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return MathUtils.lerp(
    MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), ux),
    MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), ux), uz,
  );
}

function landformHeight(x: number, z: number): number {
  const shoulder = MathUtils.smoothstep(-z, 16, 39) * 1.12;
  const dune = 0.16 * Math.sin(z * 0.1) + shoulder;
  const contactRidges = 0.17 * Math.exp(-(((z - 2.8 + x * 0.3) / 1.1) ** 2))
    + 0.21 * Math.exp(-(((z + 12.5 - x * 0.32) / 1.3) ** 2))
    + 0.14 * Math.exp(-(((z + 18.4 + x * 0.2) / 0.95) ** 2));
  const ripple = Math.sin(z * 1.43 + x * 0.58) * 0.045
    * Math.exp(-(((z + 8) / 30) ** 2));
  const route = dune + contactRidges + ripple;
  const distance = Math.abs(x);
  const banks = 2.4 * (1 - Math.exp(-(x * x) / 140));
  const valleyWalls = Math.min(31, Math.pow(distance / 35, 1.4) * 6.7);
  const folds = (noise(x * 0.024 + 7, z * 0.023) - 0.42) * 7.5
    + (noise(x * 0.085, z * 0.075) - 0.5) * 1.4;
  const pocket = Math.exp(-((x / 12) ** 2) - (((z - 8) / 15) ** 2)) * 0.45;
  const routeBlend = 1 - Math.exp(-((distance / 5.8) ** 3));
  return route + (banks + valleyWalls + folds - pocket) * routeBlend;
}

export function terrainHeight(x: number, z: number): number {
  if (x < -60 || x > 60 || z < -100 || z > 60) return landformHeight(x, z);
  const x0 = Math.floor(x * 2) / 2;
  const z0 = Math.floor(z * 2) / 2;
  const tx = (x - x0) * 2;
  const tz = (z - z0) * 2;
  const a = landformHeight(x0, z0);
  const b = landformHeight(x0 + 0.5, z0);
  const c = landformHeight(x0, z0 + 0.5);
  const d = landformHeight(x0 + 0.5, z0 + 0.5);
  return tx + tz <= 1
    ? a + tx * (b - a) + tz * (c - a)
    : d + (1 - tx) * (c - d) + (1 - tz) * (b - d);
}

function colorGround(geometry: BufferGeometry): void {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const rust = new Color('#fff1da');
  const dusty = new Color('#ded6c9');
  const dark = new Color('#b6b2ab');
  const color = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setY(i, terrainHeight(x, z));
    const patch = noise(x * 0.058 + 18, z * 0.058 - 3);
    color.copy(rust).lerp(dusty, patch * 0.6);
    color.lerp(dark, MathUtils.smoothstep(patch, 0.67, 0.94) * 0.6);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
}

export function makeTerrain(): Mesh[] {
  const material = surfaceMaterial('regolith');
  const near = new PlaneGeometry(120, 160, 240, 320);
  near.rotateX(-Math.PI / 2);
  near.translate(0, 0, -20);
  colorGround(near);
  const foreground = new Mesh(near, material);
  foreground.name = 'authored-contact-terrain';
  foreground.receiveShadow = true;

  const far = new PlaneGeometry(480, 480, 120, 120);
  far.rotateX(-Math.PI / 2);
  far.translate(0, 0, -60);
  colorGround(far);
  const indices = far.getIndex()!;
  const positions = far.getAttribute('position');
  const kept: number[] = [];
  for (let i = 0; i < indices.count; i += 3) {
    const a = indices.getX(i), b = indices.getX(i + 1), c = indices.getX(i + 2);
    const x = (positions.getX(a) + positions.getX(b) + positions.getX(c)) / 3;
    const z = (positions.getZ(a) + positions.getZ(b) + positions.getZ(c)) / 3;
    if (x > -60 && x < 60 && z > -100 && z < 60) continue;
    kept.push(a, b, c);
  }
  far.setIndex(kept);
  const distance = new Mesh(far, material);
  distance.name = 'open-valley-distance-terrain';
  distance.receiveShadow = true;
  return [foreground, distance];
}

export function fracturedRock(seed: number, detail = 3): BufferGeometry {
  const initial = new IcosahedronGeometry(1, detail);
  initial.deleteAttribute('uv');
  initial.deleteAttribute('normal');
  const geometry = mergeVertices(initial, 0.00001);
  initial.dispose();
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const point = new Vector3();
  const planes = [
    new Vector3(0.94, 0.27, 0.2).normalize(),
    new Vector3(-0.52, 0.7, 0.49).normalize(),
    new Vector3(0.18, -0.31, -0.93).normalize(),
  ];
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i);
    let radius = 0.88 + noise(point.x * 2.2 + seed, point.z * 2.2 + point.y) * 0.22;
    for (let plane = 0; plane < planes.length; plane++) {
      const facing = point.dot(planes[plane]);
      if (facing > 0.01) radius = Math.min(radius, (0.68 + plane * 0.065) / facing);
    }
    radius += (noise(point.x * 9 + seed * 3, point.z * 9 + point.y * 4) - 0.5) * 0.065;
    point.multiplyScalar(radius);
    const stratum = Math.sin(point.y * 20 + point.x * 2.3 + seed) * 0.016;
    point.x += stratum;
    point.y += noise(point.x * 6 + seed, point.z * 6) * 0.035;
    positions.setXYZ(i, point.x, point.y, point.z);
    const shade = 0.87 + noise(point.x * 3 + seed, point.z * 3 + point.y * 2) * 0.22;
    rockVertexColor(shade).toArray(colors, i * 3);
  }
  geometry.computeBoundingBox();
  geometry.translate(0, -geometry.boundingBox!.min.y, 0);
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function makeRockMaterials(): { rock: MeshStandardMaterial; grit: MeshStandardMaterial } {
  return {
    rock: surfaceMaterial('rock'),
    grit: new MeshStandardMaterial({ color: '#a68165', roughness: 0.97, metalness: 0 }),
  };
}
