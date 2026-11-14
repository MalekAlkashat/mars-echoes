# Mission 1 — NASA reference reconstruction and cinematic entry

14 November 2026. Implemented and tested in the isolated `codex/mission-one` worktree, from `fd51be0`. Owner visual acceptance remains pending. Main and terrain were not merged, switched, reset, replaced or deleted.

## Result

- Reconstructed low fractured plates, eroded edges, warmer mineral surfaces and 150 small gray concretions with variable size, irregularity and burial. Earth-scanned Poly Haven microdetail is an explicitly documented analog, not a NASA Mars scan.
- Rebuilt RAT around the engineering paper's envelope, asymmetric insulation/cabling, butterfly supports and feet, offset paddle and brush. Casing remains stationary; the cutter spins and orbits while feeding into a shallow cut. Rotation speeds and operation duration are compressed for play.
- Preserved one specimen outline through progressive abrasion. The exposed interior has its own fine surface and machining arcs; it no longer inherits the weathered top's cracks. Brushed Berry Bowl remains a separate observation.
- Added an eight-second February–March 2004 / Eagle Crater introduction using the supplied Focus font and restrained corner-line styling. Authored framing keeps the title clear of the rover on desktop. Camera and projection settle into normal driving; controls appear on handoff. E, Enter and touch skip work, and pause freezes the same scene-owned clock. Reduced motion uses a stationary camera behind a 3.4-second date card and fade.
- Added a 0.55-second fade before the guarded return to the hub. The existing completion transaction still owns GRIND; failed loads do not grant it.

## Evidence and checks

| Check | Result / evidence |
| --- | --- |
| Build / automated checks | TypeScript and Vite build pass; 55 tests pass. New geometry regression checks unchanged specimen topology/outline and the 45.5 mm wide / 4.4 mm deep excavation. Existing shared 738 kB chunk warning remains. |
| Desktop production, 1440 × 900 | Full drive → brush → canceled hold → grind → inspect → cluster/control → water → evidence → hub. Saved chapter and GRIND; no browser errors. `cinematic-report.json`. |
| Entry state | Pause freezes entry; movement is suppressed; save/reload replays entry safely; Enter skips at restored position. `entry-edges-report.json`. |
| Mobile production, 390 × 844 | Reduced motion, large interface, touch driving, release and touch-cancel reset, successful hold, both comparisons, water and saved hub return. No horizontal overflow or browser errors. `mobile-production-report.json`. |
| Entry layouts | Portrait reduced-motion date card and landscape reveal fit; touch controls hidden during entry and restored on natural handoff. `entry-layout-report.json`. |
| Failure / restart | Failed hub load grants no reward; retry grants once. E skip and restart reset to spawn with zero hold. Existing drive/repair previews start. `fault-restart-report.json`. |
| Runtime sample | Isolated balanced desktop sample: approach 39.0 fps shortly after reload; inspect/compare 45.2 fps at a 45 fps cap. Compare: 55 draw calls, 361,546 rendered triangles (including presentation/shadow passes), 169 allocated geometries, 32 textures. These are local snapshots, not a hardware-wide performance guarantee. |
| Preservation | SHA256 comparison of 1,318 main-checkout files: zero changed, zero missing. `preservation.json`. No dependency, shared contract, hub terrain or approved rover-binary changes in this increment. |

Selected images: `11-reveal.png`, `14-cutting.png`, `15-cut.png`, `24-final-cluster.png`, `20-mobile-cluster.png`, `25-portrait-intro.png`, `25-landscape-intro.png`. `runtime.webm` is the local production motion recording (ignored by Git); its hash is in `evidence-sha256.json`. It covers the completed desktop run before the final resumed-camera/mobile-control correction and reduced-motion timing refinement; the final targeted entry/mobile reports cover those changes. Source hashes bind the report to the final chapter files.

Reproduce locally: use Node 22, `npm --prefix game test`, `npm --prefix game run build`. Development port 5182, production preview 5183. Open `/?mission=blueberry-clue` for a save-disabled direct preview; use the normal hub route or Continue for persistence checks. Browser automation used Playwright Chromium with D3D11; raw scripts and earlier rejected captures remain under ignored `work/mission-one-polish/`.

## Source and asset audit

See `assets/references/mission-one/v2/SOURCE.md`, its hash manifest and offline `board.html`, plus the original NASA v1 pack. Four user attachments are preserved, with uncertainty and the incorrect Curiosity repost watermark recorded. NASA PIA05446 and the 2004 RAT engineering paper inform the mechanism; Spirit's later PIA08625 image informs shape only. Gray grain color, separate observations and month-range dating are preserved in copy. The reference images and engineering paper are not shipped as runtime textures. Rajdhani's full OFL is beside the unchanged runtime font.

No paid generation or new raster generation was used. Geometry/material/cinematic code is AI-assisted authored reconstruction, not NASA flight CAD or measured Eagle terrain. Source rights are recorded individually; no blanket CC0/public-domain claim is made for NASA or the user reposts.

## Remaining work

Full rover-arm articulation, the approach-to-macro camera transition and physical contact/audio feedback remain unfinished. The chapter environment and microscopic geometry remain representative reconstructions. Water interpretation retains the prior illustrative presentation. The next bounded pass is recorded in `outputs/planning/mission-one/visual-polish.md`; this checkpoint does not claim final art acceptance or a merged/released Mission 1.
