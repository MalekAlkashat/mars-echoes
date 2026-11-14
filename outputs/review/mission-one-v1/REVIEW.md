# Mission 1 runtime review

14 November 2026. Isolated branch `codex/mission-one`, worktree `C:/Nasa 2026/mars-echoes/work/mission-one`, base `0becdac`. Agent verification of a playable chapter slice; owner visual acceptance remains open.

## Implemented result

The normal hub memory entrance now opens **The Blueberry Clue** in this branch. The chapter drives across a compact Eagle-inspired basin, prepares a layered rock, brushes, requires a fresh three-second held grind, exposes a physical shallow cavity, switches explicitly to the separate Berry Bowl cluster/brushed comparison, presents a labeled ancient-water sediment cutaway, returns to dry evidence, and restores the hub. Grinding head and bristles move separately from the casing; the tool withdraws before the inspection action becomes available. No NASA source arm animation is claimed.

GRIND and `blueberry-clue` are awarded only after the hub successfully loads. Full rover-story completion remains separate. Skills displays the recorded ability. Chapter checkpoints preserve approach, grind, inspection and evidence; interrupted brushing restarts preparation, and a saved water reconstruction resumes at comparison. Held work always requires a new press after pause/reload. Saves retain legacy v1/v2 support and existing backup recovery.

Developer preview: `http://127.0.0.1:5182/?mission=blueberry-clue` (intentionally does not write the player's journey). Normal development entrance: `http://127.0.0.1:5182/`. Production preview: `http://127.0.0.1:5183/`. Existing drive/repair preview URLs remain available.

## Verification

- TypeScript and Vite production build pass. The pre-existing large shared bundle warning remains (approximately 738 kB uncompressed). No package/dependency changes.
- 54 automated checks pass, including progression, fresh held-input semantics, cancellation, safe checkpoint restoration, validation/backup recovery, failed return/retry, reward idempotence, and 300 raycast comparisons between this chapter's rendered ground and wheel-contact heights (error below 1 micrometre). Existing terrain, rover, spirit, camera, save and scene-director checks still pass.
- Chromium desktop, actual keyboard/UI input: New Game → normal hub traversal → memory entry → drive → brush → grind, release/cancel and retry → inspection → manual save/reload/Continue → cluster/control → full timed water interpretation → evidence → return. Reload preserves GRIND. Skill panel reads the session's unlock. No page/console errors. `runtime-report.json` records the checks.
- Ten further actual entry/abort/return visits preserve hub position `(0,-23.18)`, one chapter, zero full-story completions and one application loop. Renderer resources stabilize at 30 geometries / 31 textures in the balanced hub across all ten returns. This is a cleanup check, not a hardware or thermal benchmark.
- Production build at 390×844, emulated touch, larger text and reduced motion: seeded valid approach checkpoint → touch driving → brushing → touch hold/release/cancel → successful grind → cluster/control → skip interpretation → dry evidence → return. Reward persists even for a valid imported chapter save with no prior hub bookmark. No horizontal overflow or browser errors. Tool and cluster remain above the action panel after the phone framing correction. `mobile-production-report.json` distinguishes this fixture-assisted check from the normal desktop traversal.
- Development injected failed hub return: evidence remains active, no premature reward; Retry loads hub and persists exactly one reward. Restart during grinding restores start pose `(0,7)`, zero hold and dry approach. Retained drive and fictional repair previews both load/start. These are route smoke checks, not a repeated full repair playthrough. See `fault-restart-report.json`.
- Screenshots are actual WebGL output, not concept images. Desktop captures cover instrument contact, saved inspection, both comparison targets, interpretation, dry evidence and recorded GRIND. Mobile captures cover the corresponding layouts with large text/reduced motion. Browser uses D3D11; default software rendering was unsuitable for fixed-duration movement checks, so tests wait for actual gameplay state.

## Assets and scientific boundaries

The original supplied NASA MER model and source binary hashes are unchanged. Six retained NASA images have source URLs, credit, date/sol, color interpretation and checksums; eight source records support the science copy. Custom materials have independent provenance and hashes under `game/public/assets/missions/blueberry-clue/v1`. The source images guide authored reconstruction and are not misrepresented as Mars PBR scans.

McKittrick abrasion dimensions, Flatrock's separate tool-limitation observation and Berry Bowl's unground brushed comparison stay distinct. Grains are gray, physically millimetre-sized and magnified. They do not appear as a reward for drilling. Mineral identification is attributed to instruments; the water scene is a clearly labeled interpretation of a distant past.

## Remaining limits

This is a playable implementation candidate, not final cinematic/hero-art acceptance. The basin, slab edges, macro material detail, instanced grains and custom instrument are authored approximations; they need owner art review against the retained board. The sediment cutaway is an explanatory illustration, not a fluid/geochemical simulation. The source rover retains its existing materials; dedicated early/late dust-and-wear profiles and full arm articulation remain future work. Audio is still unimplemented in the base game. Physical-device mobile performance, a production network deployment and user acceptance were not tested or claimed. Later Opportunity chapters, map shrinking and Memory Check are outside this chapter slice.

## Isolation and handoff

SHA256 comparison of all 1,318 snapshotted main-checkout tracked/untracked nonignored files found **zero changes and zero missing files**. Main remains `0becdac` on `main`; no merge, push, branch switch, asset replacement or terrain-file edit occurred there. See `preservation.json`.

Owned additions: `scenes/episodes/rover/missions/blueberry-clue/`, chapter content, versioned chapter materials, references and tests. Shared interfaces changed only in this worktree: chapter entry/result/checkpoint fields, held E input, additive chapter/skill persistence, the hub entry route, touch hold control and skill-status display. The hub geometry, surface materials and spirit controller were not edited. Before a future integration, reconcile those narrow shared-file changes with the current terrain work; do not replace whole files from this branch.
