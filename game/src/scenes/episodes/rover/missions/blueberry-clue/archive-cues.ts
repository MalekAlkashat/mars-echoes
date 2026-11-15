import type { MissionPhase } from '../../../../../app/contracts.ts';

export type ArchiveCue = { image: 'abrasion' | 'comparison'; closing: boolean; hero: boolean; reveal: number; note: string };

/** Pacing follows the scene clock, so pause, restart and restoration share the chapter lifecycle. */
export function archiveCue(phase: MissionPhase, elapsed: number, comparison: number, withdrawing: number): ArchiveCue | undefined {
  if (!Number.isFinite(elapsed) || elapsed < 0 || withdrawing > 0) return;
  if (phase !== 'inspect' && phase !== 'compare' && phase !== 'evidence') return;
  const closing = phase === 'evidence';
  const t = Math.max(0, Math.min(1, (elapsed - (closing ? .35 : .9)) / 1.1));
  if (t === 0) return;
  return {
    image: phase === 'inspect' ? 'abrasion' : 'comparison', closing, hero: closing || elapsed < 6,
    reveal: t * t * (3 - 2 * t),
    note: phase === 'inspect' ? 'Inside the rock. A real view from Opportunity.'
      : closing ? 'A clue to ancient water.'
      : comparison === 0 ? 'A different rock. Tiny round grains.'
      : 'A brushed patch. Fewer grains.',
  };
}
