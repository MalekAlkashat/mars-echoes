import type { MissionPhase } from '../../../../../app/contracts.ts';

export type ArchiveCue = { image: 'comparison'; closing: true; hero: true; reveal: number; note: string };

/** A single archive dissolve after the ancient-water reconstruction has returned dry. */
export function archiveCue(phase: MissionPhase, elapsed: number, _comparison: number, withdrawing: number): ArchiveCue | undefined {
  if (phase !== 'evidence' || !Number.isFinite(elapsed) || elapsed < 0 || withdrawing > 0) return;
  const t = Math.max(0, Math.min(1, (elapsed - .35) / 1.1));
  if (t === 0) return;
  return { image: 'comparison', closing: true, hero: true, reveal: t * t * (3 - 2 * t), note: 'A clue to ancient water.' };
}
