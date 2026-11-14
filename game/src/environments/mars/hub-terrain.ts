import { BufferAttribute, BufferGeometry, Color, MathUtils, Mesh, PlaneGeometry } from 'three';
import { noise } from './terrain.ts';
import { surfaceMaterial } from './materials.ts';

export const HUB_TERRAIN = { halfSize: 80, cellSize: 1, vistaRadius: 1000, playableRadius: 63.5 } as const;

function mound(x: number, z: number, cx: number, cz: number, sx: number, sz: number): number {
  return Math.exp(-(((x - cx) / sx) ** 2) - (((z - cz) / sz) ** 2));
}

function landform(x: number, z: number, quiet = false): number {
  const radius = Math.hypot(x, z);
  const shoulder = 5.6 * mound(x, z, -32, -6, 17, 38)
    + 3.8 * mound(x, z, 42, -32, 26, 35)
    + 10 * mound(x, z, -74, 34, 44, 56);
  const basin = -3.2 * mound(x, z, 9, -37, 38, 35);
  // Remove valley-wide corrugation only in the hub; preserve the legacy episode profile.
  const ripple = quiet ? 0 : Math.sin(z * .88 + x * .19) * .035
    * MathUtils.smoothstep(Math.abs(x), 5, 19);
  const saddle = 1.1 * mound(x, z, 0, -7, 13, 7);
  const near = .012 * z + shoulder + basin + saddle + ripple
    + (noise(x * .045 + 18, z * .045) - .5) * .34;
  const craterDistance = Math.hypot(x - 60, (z + 230) * .8);
  const farRim = 80 * Math.exp(-(((craterDistance - 620) / 90) ** 2));
  const rimVariation = .68 + noise(x * .009 + 9, z * .009) * .65;
  const far = -18 + farRim * rimVariation
    + (noise(x * .006, z * .007) - .5) * 11;
  return MathUtils.lerp(near, far, MathUtils.smoothstep(radius, 100, 330));
}

/** The same triangles supply visible ground and collision/contact heights. */
export function hubHeight(x: number, z: number, quiet = false): number {
  if (Math.abs(x) > HUB_TERRAIN.halfSize || Math.abs(z) > HUB_TERRAIN.halfSize) return landform(x, z, quiet);
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const tx = x - x0, tz = z - z0;
  const a = landform(x0, z0, quiet), b = landform(x0 + 1, z0, quiet);
  const c = landform(x0, z0 + 1, quiet), d = landform(x0 + 1, z0 + 1, quiet);
  return tx + tz <= 1 ? a + tx * (b - a) + tz * (c - a)
    : d + (1 - tx) * (c - d) + (1 - tz) * (b - d);
}

function shade(geometry: BufferGeometry, quiet: boolean): void {
  const positions = geometry.getAttribute('position');
  const colors = new Float32Array(positions.count * 3);
  const sand = new Color('#e7c3a1'), bedrock = new Color('#f4e4ce');
  const color = new Color();
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), z = positions.getZ(i);
    positions.setY(i, hubHeight(x, z, quiet));
    const exposure = MathUtils.smoothstep(noise(x * .06 + 3, z * .06), .4, .78);
    color.copy(sand).lerp(bedrock, exposure * .7).multiplyScalar(.9 + noise(x * .018, z * .018) * .18);
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

export function makeHubTerrain(quiet = false): Mesh[] {
  const near = new PlaneGeometry(160, 160, 160, 160);
  near.rotateX(-Math.PI / 2);
  shade(near, quiet);
  if (quiet) near.setAttribute('baseDustCoverage',new BufferAttribute(new Float32Array(near.getAttribute('position').count),1));
  const ground = new Mesh(near, surfaceMaterial(quiet ? 'dust' : 'regolith',false,{terrainDust:quiet}));
  ground.name = 'hub-traversable-troughs';
  ground.receiveShadow = true;

  // Square rings share every fine-grid boundary vertex; no overlapping terrain or cracks.
  const vertices: number[] = [], indices: number[] = [];
  const rings = [80, 120, 180, 260, 400, 640, 1000];
  const perSide = 160, perimeter = perSide * 4;
  for (const radius of rings) for (let side = 0; side < 4; side++) {
    for (let i = 0; i < perSide; i++) {
      const t = i / perSide * 2 - 1;
      const [x, z] = side === 0 ? [-radius, t * radius]
        : side === 1 ? [t * radius, radius]
        : side === 2 ? [radius, -t * radius] : [-t * radius, -radius];
      vertices.push(x, 0, z);
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) for (let i = 0; i < perimeter; i++) {
    const a = ring * perimeter + i, b = ring * perimeter + (i + 1) % perimeter;
    const c = a + perimeter, d = b + perimeter;
    indices.push(a, c, b, b, c, d);
  }
  const far = new BufferGeometry();
  far.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
  far.setIndex(indices);
  shade(far, quiet);
  const vista = new Mesh(far, surfaceMaterial('regolith', true));
  vista.name = 'hub-coarse-crater-vista';
  return [ground, vista];
}
