# Three chapters integrated into one production game

15 November 2026. Prepared in `work/mission-integration`, branch `codex/integrate-missions`, base **548ce49**. This combines snapshots of the idle, uncommitted `codex/mission-two` and `codex/mission-three` candidates without editing those worktrees. The abandoned comet, its global timing changes, and the reverted Mission 3 imagery/quote update are excluded.

The normal hub now selects **Blueberry Clue, Purgatory and Long Night**. Each production chapter preserves its own map and presentation, supports saved continuation, and records its knowledge reward only after successful return. The three chapters remain independently selectable; this is not the final connected story, skill map or release.

## Integration changes

- Preserved the integrated reference100 terrain and Mission 1 geology/RAT/reconstruction/continuity.
- Imported Mission 2's completed NASA-archive sprint: automatic encounter, 3.8-second wheel reveal, held-W metered recovery, 5.2-second post-recovery hold, sand push, labeled unchanged NASA originals and reflection. No track strips/tread decals were restored.
- Promoted Purgatory from a DEV-only slice to the production `purgatory` chapter. Its old `slice=purgatory` URL is a compatibility alias. Recovery checkpoints preserve actual rover pose, wheel angle, camera and sparse bounded soil deformation. Active command queues/velocities are cleared; the scripted opening resumes from its start. New save fields reject invalid map poses, duplicate/out-of-range soil cells and inconsistent chapter/skill combinations.
- Added transactional **SAND**, separate from legacy prototype completion. Early exit grants no new reward. No OVERTIME montage/reward was fabricated.
- Imported the restored Mission 3 presentation: 16-second storm, readable darkness, continuous accumulated reserve, visible service consequences, authentic partial image, recovery timeline and SUNLIGHT. Its chapter/checkpoint/save migration and prior-progress preservation remain intact.
- Reconciled shared contracts, save validation, session, bootstrap, rover dispatch, hub choice and recorded-memory display. Director rejects results for a different chapter. Existing PNG photography remains functional.
- Fixed the chapter selector covering the Enter button by placing it inside the existing interaction panel. Selection defaults after return reflect committed rewards rather than the pre-commit session snapshot.
- Enabled Mission 2's existing touch direction pad during recovery and placed its guidance/tool panels clear of the controls. No new input listener or controller was added.
- Redistributed 90 of the existing 640 hub grains around reference100's `(0,36)` start. Existing route clusters remain; total population and batch count are unchanged. Updated the placement check to the actual terrain100 sampler/spawn.

## Checks performed

**99/99 tests pass**, including imported chapter tests and new combined checkpoint/reward tests. Explicit Node **22.23.5**, TypeScript `tsc --noEmit`, Vite production build and whitespace checks pass. Dependencies were reused from main after verifying the identical package-lock; no package or lockfile changed. The initial offline install could not find a cached Vite tarball and was not counted as a pass.

Per-pack attributes preserve research-original/receipt bytes, including archived web responses, and treat the original generated level diagram as data. These retained artifacts are not whitespace-normalized to satisfy code checks.

Build: `work/integration/dist/`. One local production preview was used for the complete browser journey, with fresh isolated Chromium storage. User saves were not accessed. See `runtime.json`, `extra.json` and `source-sha256.json` beside this report. Full normal-speed original recordings and reproduction scripts remain local under `work/mission-integration/work/integration/`.

### Production desktop

At 1440 × 900, balanced quality, existing cap/settings:

1. Empty storage → New Game → initial navigation **before any mission entry**. Native capture shows the new foreground blueberry groups.
2. Real hub traversal → three-choice selector → Mission 1 dated entry, native driving, brushing, held grinding, both comparisons, full water interpretation, dry evidence and GRIND return.
3. Purgatory wheel/NASA reveal → recovery. Save/reload/Continue retains exact rover X/Z and soil array; prior GRIND remains. Native held-W recovery → longer outro → sand push → actual NASA image → reflection → successful SAND return.
4. Long Night approach → service choices → natural roughly 16-second storm/silence → unchanged archival image. Save/reload at the archive continues correctly, then recovery timeline/legacy → SUNLIGHT return. All three chapter IDs/skills persist; legacy prototype completion remains empty.
5. Skills panel lists GRIND/SAND/SUNLIGHT. Photography downloads a real nonempty PNG. Two further Purgatory aborts and one Long Night abort leave one selector, no leftover panels and unchanged rewards. Final reload retains the combined save.

No page errors or HTTP error responses occurred in the final normal run. These are actual input-driven production scenarios, not forced phases, fixed-step advancement or generated artwork.

### Touch, unavailable media and transitions

At 390 × 844, low quality, large text, reduced motion, with a valid checkpoint from the desktop journey:

- Actual held touch input recovers Purgatory. Pause clears held movement; releasing while paused and resuming does not keep driving. The reflection and return fit without horizontal overflow.
- An intentionally blocked Purgatory image shows an explicit unavailable/source message and hides the missing image. Recovery, ending and return still work.
- Long Night's touch driving, both service choices, automatic storm/silence, archive/recovery/legacy and reward return pass.
- A separate production archival-load failure retains the hub/progress, cancels cleanly, and permits reentry after the image is available.

Development-only fault injection seeds the real saved Purgatory ending, then fails the first hub return. SAND remains absent until Retry succeeds. Three further native entry/abort/return cycles retain **30 geometries / 31 textures / one loop** on every returned hub sample, with no reward growth. These are bounded resource observations, not GPU memory or indefinite leak certification.

An early desktop run exposed the selector overlap and failed honestly; the fixed full journey passed. An early touch harness queried the direction pad before the start action had been consumed; it was corrected to wait for visible controls, then rerun. Network-sandbox preview failures were resolved with approved loopback-only browser/server execution. None of these failed attempts is counted as a pass.

## Evidence

| Native capture | File |
| --- | --- |
| Initial hub before any chapter | `01-fresh-hub.png` |
| Working three-chapter selector | `02-three-chapter-selector.png` |
| Purgatory's labeled NASA image | `07-purgatory-nasa-archive.png` |
| Long Night silence/readability | `10-night-silence.png` |
| Actual touch recovery controls | `13-mobile-recovery-controls.png` |
| Touch Long Night presentation | `16-mobile-night-silence.png` |

The captures are unretouched game screenshots. Other detailed captures and videos remain in the local integration worktree. Original candidate reports retain their historical branch/test/status values; this combined report supersedes their integration claims. Source hashes identify the tested implementation independently of prose changes.

## Preservation and remaining limits

Main's 39 pre-existing changed/untracked files were snapshotted, including exact working bytes and the staged diff. All 35 staged resource additions, local notes and the three existing stashes are preserved outside the integration commit. Audit: ignored `work/mission-integration-audit/{main-before.json,main-after.json,mission-inputs.json}`. Source mission worktree hashes were checked unchanged after copying. No shared branch switch, old stash application, push or deployment is part of this task.

The existing large-bundle advisory remains (main shared chunk about **753 kB minified**; separately loaded Mission 2/3 chunks about 40/13 kB). Graphics policy stays balanced 45 / low 30 / high 60. No new comparative GPU, low-end, physical-phone, thermal or accessibility-user certification is claimed. Native touch checks are browser emulation. Visual inspection and successful routes do not establish owner artistic acceptance.

The chosen teammate spirit's actual source is still unavailable here; the placeholder remains. Connected chapter time jumps, OVERTIME, broader skills/shrinking map, halo/final spirit, Memory Check, finale/audio, project license and public release remain separate. Existing square-corner save-bound coverage and final rover arm/mast articulation are not certified by this pass. Reconstructions and illustrative engineering remain labeled; NASA originals/rights are preserved.
