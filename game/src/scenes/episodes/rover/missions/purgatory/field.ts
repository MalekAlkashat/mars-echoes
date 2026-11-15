/**
 * One height field for the visible mesh, wheel contact and material masks.
 * Static values are baked once; only the bounded trench grid changes during play.
 * Simplified reconstruction: ripple sizes follow NASA captions, everything else is authored.
 */
import { noise } from '../../../../../environments/mars/terrain.ts';
import { LEVELS, RIPPLES, SITE, type Ellipse, type Level, type Rect, type Ripple } from './site.ts';

const RAD = Math.PI / 180;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
/** Named field controls (perceptual, tuning values of a reconstruction). */
export const FIELD = {
  rippleSpacing: 3.0, crestSharpness: 0.3, crestOffset: 0.1, southwardRise: 0.35,
  northAmplitude: 0.09, southAmplitude: 0.24, mesoCeiling: 0.42, fieldRadius: 30,
} as const;

export function rippleHeight(r: Ripple, x: number, z: number): number {
  const a = r.azimuthDeg * RAD, ax = Math.sin(a), az = Math.cos(a);
  const dx = x - r.cx, dz = z - r.cz;
  const along = dx * ax + dz * az, half = r.length / 2;
  if (Math.abs(along) >= half) return 0;
  // Crest sits slightly off centre: a longer windward face and a shorter lee face.
  let u = (dx * az - dz * ax) / (r.width / 2) - FIELD.crestOffset;
  u = u < 0 ? u / (1 + FIELD.crestOffset) : u / (1 - FIELD.crestOffset);
  const p = 1 - Math.abs(u);
  if (p <= 0) return 0;
  const shape = p + (p * p * (3 - 2 * p) - p) * FIELD.crestSharpness;
  return r.height * shape * smooth(0, r.taper, half - Math.abs(along));
}
/** 0..1: how strongly an authored ripple owns this place (keeps the procedural field off it). */
function authoredInfluence(x: number, z: number): number {
  let best = 0;
  for (const r of RIPPLES) {
    const a = r.azimuthDeg * RAD, ax = Math.sin(a), az = Math.cos(a), dx = x - r.cx, dz = z - r.cz;
    const along = Math.abs(dx * ax + dz * az) - r.length / 2, across = Math.abs(dx * az - dz * ax) - r.width / 2;
    best = Math.max(best, 1 - smooth(0, 1.4, Math.max(along, across)));
  }
  return best;
}
function authored(x: number, z: number): number {
  let h = 0;
  for (const r of RIPPLES) h = Math.max(h, rippleHeight(r, x, z));
  return h;
}
/** Elongated north-south ripples in localized groups, with dead ends; never one map-wide wave. */
function rippleField(x: number, z: number): number {
  const radial = Math.hypot(x - SITE.fieldCentre.x, z - SITE.fieldCentre.z);
  const reach = 1 - smooth(FIELD.fieldRadius, FIELD.fieldRadius + 8, radial);
  if (reach <= 0) return 0;
  // The route follows a broad trough between crests, as in the vertical projection.
  const trough = smooth(-5.6, -3.6, x) * (1 - smooth(3.8, 5.8, x)) * (1 - smooth(6.5, 9, z));
  const mask = (1 - trough) * (1 - authoredInfluence(x, z)) * reach;
  if (mask <= 0.001) return 0;
  const warp = 2.4 * (noise(x * 0.045 + 3.1, z * 0.03 + 9.7) - 0.5) + 0.8 * Math.sin(z * 0.19 + 4 * noise(x * 0.02, z * 0.02));
  const spacing = FIELD.rippleSpacing * (0.85 + 0.4 * noise(x * 0.021 + 40, z * 0.017 + 11));
  const t = (x + warp) / spacing, f = t - Math.floor(t);
  const crest = Math.max(0, (1 - Math.abs(2 * f - 1) - 0.42) / 0.58);
  const group = smooth(0.3, 0.58, noise(x * 0.06 + 17.3, z * 0.035 + 3.9));
  const amplitude = FIELD.northAmplitude + (FIELD.southAmplitude - FIELD.northAmplitude) * smooth(-8, 22, z);
  return amplitude * group * mask * (crest + (crest * crest * (3 - 2 * crest) - crest) * FIELD.crestSharpness);
}
function macro(x: number, z: number): number {
  return FIELD.southwardRise * smooth(-10, 20, z)
    + 0.04 * Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09 + 0.4) + 0.03 * (noise(x * 0.03, z * 0.03) - 0.5);
}
/** Undisturbed ground. Analytic; use the baked grids at runtime. */
export function baseHeight(x: number, z: number): number {
  return macro(x, z) + Math.min(FIELD.mesoCeiling, Math.max(authored(x, z), rippleField(x, z)));
}
/** Relief above the smooth plain, used for crest tinting. */
export function reliefHeight(x: number, z: number): number {
  return Math.max(authored(x, z), rippleField(x, z));
}
export function ellipseValue(e: Ellipse, x: number, z: number): number {
  const a = e.azimuthDeg * RAD, dx = x - e.cx, dz = z - e.cz;
  const along = dx * Math.sin(a) + dz * Math.cos(a), across = dx * Math.cos(a) - dz * Math.sin(a);
  return (along / e.along) ** 2 + (across / e.across) ** 2;
}
/** 1 in the soft core of the ripple body, easing to 0 across the margin. */
export function softness(x: number, z: number): number {
  const core = ellipseValue(SITE.soft, x, z);
  if (core <= 1) return 1;
  const margin = ellipseValue(SITE.softMargin, x, z);
  if (margin >= 1) return 0;
  const a = Math.sqrt(core) - 1, b = 1 - Math.sqrt(margin);
  return 1 - smooth(0, 1, a / (a + b));
}
export const inRect = (r: Rect, x: number, z: number, margin = 0) => x >= r[0] + margin && x <= r[2] - margin && z >= r[1] + margin && z <= r[3] - margin;

/**
 * Which edges of a cell touch a finer level: bit 1 north, 2 east, 4 south, 8 west.
 * Returns -1 when a finer level replaces the cell. Shared by the mesh and the contact sampler.
 */
export function cellSplit(level: Level, ix: number, iz: number): number {
  const ax = level.rect[0] + ix * level.cell, az = level.rect[1] + iz * level.cell, bx = ax + level.cell, bz = az + level.cell, e = 1e-6;
  let bits = 0;
  for (const child of LEVELS) {
    if (child.parent !== level.id) continue;
    const [cx0, cz0, cx1, cz1] = child.rect, withinX = ax >= cx0 - e && bx <= cx1 + e, withinZ = az >= cz0 - e && bz <= cz1 + e;
    if (withinX && withinZ) return -1;
    if (withinX && Math.abs(az - cz1) < e) bits |= 1;
    if (withinZ && Math.abs(bx - cx0) < e) bits |= 2;
    if (withinX && Math.abs(bz - cz0) < e) bits |= 4;
    if (withinZ && Math.abs(ax - cx1) < e) bits |= 8;
  }
  return bits;
}
type Grid = { level: Level; nx: number; nz: number; heights: Float32Array; split: Int8Array };
const TRENCH = LEVELS[LEVELS.length - 1];
export const TRENCH_CAP = 0.16;

/** Baked terrain plus the only mutable part: sink and berm on the finest grid. */
export class Ground {
  readonly grids: Grid[];
  readonly trench: Grid;
  readonly sink: Float32Array;
  readonly berm: Float32Array;
  /** Inclusive dirty rectangle in trench-grid indices; consumed by the mesh. */
  dirty: [ix0: number, iz0: number, ix1: number, iz1: number] | null = null;
  readonly surface = (x: number, z: number): number => this.sample(x, z);

  constructor() {
    this.grids = LEVELS.map(level => {
      const nx = Math.round((level.rect[2] - level.rect[0]) / level.cell), nz = Math.round((level.rect[3] - level.rect[1]) / level.cell);
      const heights = new Float32Array((nx + 1) * (nz + 1));
      for (let iz = 0; iz <= nz; iz++) for (let ix = 0; ix <= nx; ix++)
        heights[iz * (nx + 1) + ix] = baseHeight(level.rect[0] + ix * level.cell, level.rect[1] + iz * level.cell);
      const split = new Int8Array(nx * nz);
      for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) split[iz * nx + ix] = cellSplit(level, ix, iz);
      return { level, nx, nz, heights, split };
    });
    this.trench = this.grids[this.grids.length - 1];
    const count = this.trench.heights.length;
    this.sink = new Float32Array(count);
    this.berm = new Float32Array(count);
  }
  reset(): void {
    this.sink.fill(0); this.berm.fill(0);
    this.dirty = [0, 0, this.trench.nx, this.trench.nz];
  }
  private vertex(grid: Grid, ix: number, iz: number): number {
    return grid === this.trench ? this.trenchHeight(ix, iz) : grid.heights[iz * (grid.nx + 1) + ix];
  }
  /** Height of one trench-grid vertex: undisturbed ground, minus the rut, plus piled and cloddy sand. */
  trenchHeight(ix: number, iz: number): number {
    const i = iz * (this.trench.nx + 1) + ix, moved = this.sink[i] + this.berm[i];
    if (moved <= 0) return this.trench.heights[i];
    // Churned sand breaks into clods (PIA07216); a fixed per-vertex offset, never regenerated.
    const hash = Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453, clod = (hash - Math.floor(hash) - 0.5) * 0.014 * Math.min(1, moved / 0.02);
    return this.trench.heights[i] - this.sink[i] + this.berm[i] + clod;
  }
  /** Same triangles as the visible mesh: finest grid containing the point, diagonal b-c. */
  sample(x: number, z: number): number {
    for (let g = this.grids.length - 1; g >= 0; g--) {
      const grid = this.grids[g], r = grid.level.rect;
      if (x < r[0] || x > r[2] || z < r[1] || z > r[3]) continue;
      const fx = (x - r[0]) / grid.level.cell, fz = (z - r[1]) / grid.level.cell;
      const ix = Math.min(grid.nx - 1, Math.floor(fx)), iz = Math.min(grid.nz - 1, Math.floor(fz));
      const u = fx - ix, v = fz - iz;
      const a = this.vertex(grid, ix, iz), b = this.vertex(grid, ix + 1, iz), c = this.vertex(grid, ix, iz + 1), d = this.vertex(grid, ix + 1, iz + 1);
      const bits = grid.split[iz * grid.nx + ix];
      if (bits > 0) return this.fan(r[0] + ix * grid.level.cell, r[1] + iz * grid.level.cell, grid.level.cell, u, v, bits, a, b, c, d);
      return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
    }
    return baseHeight(x, z);
  }
  /** A cell beside a finer level is drawn as a fan around its centre; contact uses the same triangles. */
  private fan(x0: number, z0: number, cell: number, u: number, v: number, bits: number, a: number, b: number, c: number, d: number): number {
    const half = cell / 2;
    // Midpoints belong to the finer level; read them before filling the ring.
    const north = bits & 1 ? this.sample(x0 + half, z0) : 0, east = bits & 2 ? this.sample(x0 + cell, z0 + half) : 0;
    const south = bits & 4 ? this.sample(x0 + half, z0 + cell) : 0, west = bits & 8 ? this.sample(x0, z0 + half) : 0;
    const ring: number[] = [0, 0, a];
    if (bits & 1) ring.push(0.5, 0, north);
    ring.push(1, 0, b);
    if (bits & 2) ring.push(1, 0.5, east);
    ring.push(1, 1, d);
    if (bits & 4) ring.push(0.5, 1, south);
    ring.push(0, 1, c);
    if (bits & 8) ring.push(0, 0.5, west);
    const centre = (b + c) / 2, pu = u - 0.5, pv = v - 0.5, count = ring.length / 3;
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      const e1u = ring[i * 3] - 0.5, e1v = ring[i * 3 + 1] - 0.5, e2u = ring[j * 3] - 0.5, e2v = ring[j * 3 + 1] - 0.5;
      const det = e1u * e2v - e1v * e2u, w1 = (pu * e2v - pv * e2u) / det, w2 = (e1u * pv - e1v * pu) / det;
      if (w1 >= -1e-9 && w2 >= -1e-9 && w1 + w2 <= 1 + 1e-9) return centre + w1 * (ring[i * 3 + 2] - centre) + w2 * (ring[j * 3 + 2] - centre);
    }
    return centre;
  }
  /** Deepest wheel-sized depression already pressed at this place (0 outside the trench grid). */
  sinkAt(x: number, z: number): number {
    const g = this.trench, r = g.level.rect;
    if (x < r[0] || x > r[2] || z < r[1] || z > r[3]) return 0;
    const ix = Math.round((x - r[0]) / g.level.cell), iz = Math.round((z - r[1]) / g.level.cell);
    return this.sink[iz * (g.nx + 1) + ix];
  }
  /**
   * Press one wheel footprint to at least `depth`. Monotonic and capped, so repeated
   * frames cannot dig without bound. The outer two rows stay untouched to keep the seam closed.
   */
  stamp(x: number, z: number, depth: number): void {
    const g = this.trench, r = g.level.rect, cell = g.level.cell;
    const target = Math.min(TRENCH_CAP, depth);
    if (target <= 0 || x < r[0] || x > r[2] || z < r[1] || z > r[3]) return;
    const reach = 0.36, core = 0.1, edge = 0.16;
    const ix0 = Math.max(2, Math.floor((x - reach - r[0]) / cell)), ix1 = Math.min(g.nx - 2, Math.ceil((x + reach - r[0]) / cell));
    const iz0 = Math.max(2, Math.floor((z - reach - r[1]) / cell)), iz1 = Math.min(g.nz - 2, Math.ceil((z + reach - r[1]) / cell));
    let changed = false;
    for (let iz = iz0; iz <= iz1; iz++) for (let ix = ix0; ix <= ix1; ix++) {
      const distance = Math.hypot(r[0] + ix * cell - x, r[1] + iz * cell - z), i = iz * (g.nx + 1) + ix;
      const press = target * (1 - smooth(core, edge, distance));
      if (press > this.sink[i] + 1e-5) { this.sink[i] = press; changed = true; }
      // Displaced sand piles beside the rut; it never fills an existing rut.
      // Sand pushed aside slumps back against the wheel, which is why a mired wheel looks buried to its hub.
      const pile = 0.55 * target * smooth(edge - 0.02, edge + 0.03, distance) * (1 - smooth(edge + 0.05, reach, distance));
      if (this.sink[i] < 0.004 && pile > this.berm[i] + 1e-5) { this.berm[i] = pile; changed = true; }
      if (this.sink[i] >= 0.004 && this.berm[i] > 0) { this.berm[i] = 0; changed = true; }
    }
    if (!changed) return;
    this.dirty = this.dirty
      ? [Math.min(this.dirty[0], ix0), Math.min(this.dirty[1], iz0), Math.max(this.dirty[2], ix1), Math.max(this.dirty[3], iz1)]
      : [ix0, iz0, ix1, iz1];
  }
}
export { TRENCH };
