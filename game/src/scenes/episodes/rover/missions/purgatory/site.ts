/**
 * Purgatory site constants. Metres; +X east, +Z south, heading 0 faces north.
 * Mirrors outputs/planning/mission-two/level-plan.json (checked by tests/purgatory-slice.test.ts).
 * A compact reconstruction informed by PIA07922/PIA07216/PIA07999; not a surveyed site.
 */
export type Rect = readonly [x0: number, z0: number, x1: number, z1: number];
export type Ripple = { id: string; cx: number; cz: number; azimuthDeg: number; length: number; width: number; height: number; taper: number };
export type Ellipse = { cx: number; cz: number; across: number; along: number; azimuthDeg: number };
export type Level = { id: string; cell: number; rect: Rect; parent: string | null };

export const SITE = {
  spawn: { x: 0, z: -22, heading: 0 },
  observe: { x: 0, z: -7.6, heading: 0 },
  stuck: { x: 0.3, z: 2.2, heading: 0.10 },
  escape: { x: 0, z: -5.6, heading: 0 },
  deepLimitZ: 4.2,
  envelope: [-6, -25.5, 6, 5.2] as Rect,
  lane: [-3, -24, 3, -6.5] as Rect,
  corridor: [-2.2, -6.5, 2.8, 5.2] as Rect,
  soft: { cx: 0.15, cz: 2.9, across: 1.25, along: 2.4, azimuthDeg: -8 } as Ellipse,
  softMargin: { cx: 0.15, cz: 2.9, across: 1.55, along: 2.8, azimuthDeg: -8 } as Ellipse,
  fieldCentre: { x: 0, z: -4 },
  vista: { rings: [30, 42, 66, 114, 210, 400] },
} as const;

export const RIPPLES: readonly Ripple[] = [
  { id: 'R1-practice-low', cx: 0.3, cz: -16.5, azimuthDeg: 55, length: 11, width: 1.6, height: 0.10, taper: 1.2 },
  { id: 'R2-practice-low', cx: -0.4, cz: -10.5, azimuthDeg: -42, length: 12, width: 2.0, height: 0.14, taper: 1.2 },
  { id: 'L-last-crest', cx: 0.2, cz: -1.9, azimuthDeg: 40, length: 7, width: 1.8, height: 0.12, taper: 1.2 },
  { id: 'H-purgatory', cx: -0.55, cz: 7.0, azimuthDeg: -8, length: 13.6, width: 2.5, height: 0.33, taper: 2.5 },
];

/** Nested power-of-two grids. Each finer rectangle lies on its parent's grid lines. */
export const LEVELS: readonly Level[] = [
  { id: 'L0-field', cell: 0.5, rect: [-30, -34, 30, 26], parent: null },
  { id: 'L1-lane', cell: 0.25, rect: [-4, -24, 4, -4], parent: 'L0-field' },
  { id: 'L1-hero', cell: 0.25, rect: [-6, -4, 6, 9], parent: 'L0-field' },
  { id: 'L2-hero', cell: 0.125, rect: [-3.5, -2.5, 3.5, 7], parent: 'L1-hero' },
  { id: 'L3-trench', cell: 0.0625, rect: [-1.5, 0.25, 1.75, 5.5], parent: 'L2-hero' },
];

/** Measured from game/public/assets/opportunity/rig-metadata.json. Local -Z is the rover front. */
export const ROVER = {
  halfWidth: 1.14, frontExtent: 0.737, rearExtent: 0.911, wheelRadius: 0.131, wheelWidth: 0.161,
  /** Order matches OPPORTUNITY_WHEELS: left front/middle/rear, right front/middle/rear. */
  wheels: [[-0.530, -0.606], [-0.475, 0.105], [-0.530, 0.606], [0.530, -0.606], [0.475, 0.105], [0.530, 0.606]] as const,
  mast: { x: 0.05, y: 1.5, z: -0.37 },
} as const;
