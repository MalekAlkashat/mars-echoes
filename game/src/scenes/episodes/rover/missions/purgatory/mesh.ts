/**
 * Crack-free multi-resolution ground. Vertices are shared through one registry, so a finer
 * rectangle and its parent meet on identical vertices; parent cells beside a finer edge are
 * rebuilt as fans, leaving no T-junctions. Only trench vertices change after setup.
 */
import { BufferAttribute, BufferGeometry, Color } from 'three';
import { noise } from '../../../../../environments/mars/terrain.ts';
import { baseHeight, cellSplit, reliefHeight, type Ground } from './field.ts';
import { LEVELS, SITE } from './site.ts';

/** Study values from PIA07216 set the relationships (dark ground, brighter redder churned sand); not calibrated. */
export const TINT = { ground: new Color(0.53, 0.41, 0.32), crest: new Color(0.64, 0.49, 0.36), churned: new Color(1.02, 0.62, 0.38), packed: new Color(0.3, 0.22, 0.17) };
const UV_METRES = 0.3;

export type GroundMesh = {
  geometry: BufferGeometry;
  triangles: number;
  vertices: number;
  /** Rewrites only the trench vertices inside the ground's dirty rectangle. */
  refresh(): boolean;
};

export function buildGroundGeometry(ground: Ground): GroundMesh {
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], colors: number[] = [], indices: number[] = [];
  const registry = new Map<string, number>();
  const key = (x: number, z: number) => `${Math.round(x * 64)},${Math.round(z * 64)}`;
  const tint = new Color();
  const shade = (x: number, z: number, sink: number, berm: number) => {
    const relief = Math.min(1, reliefHeight(x, z) / 0.3);
    tint.copy(TINT.ground).lerp(TINT.crest, relief * 0.55).multiplyScalar(0.92 + 0.16 * noise(x * 0.35 + 5, z * 0.35 + 2));
    const disturbed = Math.min(1, sink / 0.03 + berm / 0.012);
    if (disturbed > 0) tint.lerp(TINT.churned, disturbed * 0.85);
    // Rut floors read darker than their bright churned rims, as in the panorama's foreground.
    if (sink > 0.02) tint.lerp(TINT.packed, Math.min(1, (sink - 0.02) / 0.08) * 0.7);
    return tint;
  };
  const vertex = (x: number, z: number, e: number): number => {
    const k = key(x, z), found = registry.get(k);
    if (found !== undefined) return found;
    const index = positions.length / 3;
    registry.set(k, index);
    positions.push(x, baseHeight(x, z), z);
    const nx = baseHeight(x - e, z) - baseHeight(x + e, z), nz = baseHeight(x, z - e) - baseHeight(x, z + e), length = Math.hypot(nx, 2 * e, nz);
    normals.push(nx / length, 2 * e / length, nz / length);
    uvs.push(x / UV_METRES, z / UV_METRES);
    const c = shade(x, z, 0, 0); colors.push(c.r, c.g, c.b);
    return index;
  };
  const triangle = (a: number, b: number, c: number) => {
    // Face +Y regardless of the order the caller walked the corners in.
    const ux = positions[b * 3] - positions[a * 3], uz = positions[b * 3 + 2] - positions[a * 3 + 2];
    const vx = positions[c * 3] - positions[a * 3], vz = positions[c * 3 + 2] - positions[a * 3 + 2];
    if (uz * vx - ux * vz >= 0) indices.push(a, b, c); else indices.push(a, c, b);
  };

  // Finest first, so shared border vertices take the finer level's normal footprint.
  for (const level of [...LEVELS].reverse()) {
    const [x0, z0, x1, z1] = level.rect, cell = level.cell;
    const nx = Math.round((x1 - x0) / cell), nz = Math.round((z1 - z0) / cell);
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const ax = x0 + ix * cell, az = z0 + iz * cell, bx = ax + cell, bz = az + cell;
      const bits = cellSplit(level, ix, iz);
      if (bits < 0) continue;
      const split = { north: (bits & 1) > 0, east: (bits & 2) > 0, south: (bits & 4) > 0, west: (bits & 8) > 0 };
      const a = vertex(ax, az, cell), b = vertex(bx, az, cell), c = vertex(ax, bz, cell), d = vertex(bx, bz, cell);
      if (!split.north && !split.east && !split.south && !split.west) { triangle(a, c, b); triangle(b, c, d); continue; }
      const half = cell / 2, ring = [a];
      if (split.north) ring.push(vertex(ax + half, az, half));
      ring.push(b);
      if (split.east) ring.push(vertex(bx, az + half, half));
      ring.push(d);
      if (split.south) ring.push(vertex(ax + half, bz, half));
      ring.push(c);
      if (split.west) ring.push(vertex(ax, az + half, half));
      const centre = vertex(ax + half, az + half, half);
      // The wheel-contact sampler splits this cell along b-c; put the fan centre on that line so they agree.
      positions[centre * 3 + 1] = (positions[b * 3 + 1] + positions[c * 3 + 1]) / 2;
      for (let i = 0; i < ring.length; i++) triangle(centre, ring[i], ring[(i + 1) % ring.length]);
    }
  }
  // Coarse plain to the horizon. Its first ring is the field's own border vertices.
  const field = LEVELS[0], [fx0, fz0, fx1, fz1] = field.rect, fc = field.cell, border: [number, number][] = [];
  for (let x = fx0; x < fx1 - 1e-6; x += fc) border.push([x, fz0]);
  for (let z = fz0; z < fz1 - 1e-6; z += fc) border.push([fx1, z]);
  for (let x = fx1; x > fx0 + 1e-6; x -= fc) border.push([x, fz1]);
  for (let z = fz1; z > fz0 + 1e-6; z -= fc) border.push([fx0, z]);
  const radii = SITE.vista.rings, { x: ox, z: oz } = SITE.fieldCentre;
  let inner = border.map(([x, z]) => vertex(x, z, fc));
  for (let r = 1; r < radii.length; r++) {
    const scale = radii[r] / radii[0];
    const outer = border.map(([x, z]) => vertex(ox + (x - ox) * scale, oz + (z - oz) * scale, 2));
    for (let i = 0; i < border.length; i++) {
      const j = (i + 1) % border.length;
      triangle(inner[i], outer[i], inner[j]); triangle(inner[j], outer[i], outer[j]);
    }
    inner = outer;
  }

  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(positions), 3), normal = new BufferAttribute(new Float32Array(normals), 3);
  const color = new BufferAttribute(new Float32Array(colors), 3);
  geometry.setAttribute('position', position); geometry.setAttribute('normal', normal);
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2)); geometry.setAttribute('color', color);
  geometry.setIndex(positions.length / 3 > 65535 ? new BufferAttribute(new Uint32Array(indices), 1) : new BufferAttribute(new Uint16Array(indices), 1));
  geometry.computeBoundingSphere(); geometry.computeBoundingBox();

  const g = ground.trench, [tx0, tz0] = g.level.rect, cell = g.level.cell, row = g.nx + 1;
  const lookup = new Int32Array(g.heights.length);
  for (let iz = 0; iz <= g.nz; iz++) for (let ix = 0; ix <= g.nx; ix++) lookup[iz * row + ix] = registry.get(key(tx0 + ix * cell, tz0 + iz * cell)) ?? -1;
  const trenchVertices = lookup.reduce((most, v) => Math.max(most, v + 1), 0);
  const height = (ix: number, iz: number) => ground.trenchHeight(ix, iz);
  const refresh = (): boolean => {
    const dirty = ground.dirty;
    if (!dirty) return false;
    ground.dirty = null;
    const ix0 = Math.max(1, dirty[0] - 1), iz0 = Math.max(1, dirty[1] - 1), ix1 = Math.min(g.nx - 1, dirty[2] + 1), iz1 = Math.min(g.nz - 1, dirty[3] + 1);
    for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
      const i = iz * row + ix, v = lookup[i];
      if (v < 0) continue;
      const x = tx0 + ix * cell, z = tz0 + iz * cell;
      position.setY(v, height(ix, iz));
      const nx = height(ix - 1, iz) - height(ix + 1, iz), nz = height(ix, iz - 1) - height(ix, iz + 1), length = Math.hypot(nx, 2 * cell, nz);
      normal.setXYZ(v, nx / length, 2 * cell / length, nz / length);
      const c = shade(x, z, ground.sink[i], ground.berm[i]); color.setXYZ(v, c.r, c.g, c.b);
    }
    // Trench vertices were created first, so one bounded range covers every vertex that can move.
    for (const attribute of [position, normal, color]) { attribute.clearUpdateRanges(); attribute.addUpdateRange(0, trenchVertices * 3); attribute.needsUpdate = true; }
    return true;
  };
  return { geometry, triangles: indices.length / 3, vertices: positions.length / 3, refresh };
}
