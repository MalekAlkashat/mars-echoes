# Mission 1: geological site and ancient-water reconstruction

The closed rock ring is now an asymmetric west/north bedrock exposure beside an open approach. The ending keeps the same irregular specimen in view while an anchored material field wets its pores, reveals inferred embedded concretions, and returns to dry observed evidence before the phase changes. Objectives, trigger, abrasion/comparison order and return transaction are preserved.

Runtime implementation: **`1ab4f18`**, branch **`codex/mission-one`**, base **`864724fecb7569ec772ae560e83c13fca48a2123`**. Worktree: **`C:/Nasa 2026/mars-echoes/work/mission-one`**. Reviewed 14 November 2026. This is an implemented, agent-checked branch increment; owner aesthetic acceptance and integration remain open. Nothing was merged or pushed to main for this task.

## Preview and repeatable checks

Both URLs were opened and exercised against this worktree, not inferred from an old port note:

- Development chapter: **http://127.0.0.1:5182/?mission=blueberry-clue** — direct preview, saves disabled.
- Production normal journey: **http://127.0.0.1:5183/** — New Game → travel to the rover → enter memory → complete the chapter → return.
- Production chapter preview: http://127.0.0.1:5183/?mission=blueberry-clue uses the same built chapter, also save-disabled.

From PowerShell, with supported Node 22 on PATH:

```powershell
Set-Location 'C:/Nasa 2026/mars-echoes/work/mission-one'
npm --prefix game run dev -- --port 5182 --strictPort
```

Production (separate terminal; the currently running server already serves the rebuilt `dist`):

```powershell
Set-Location 'C:/Nasa 2026/mars-echoes/work/mission-one'
npm --prefix game run build
npm --prefix game run preview -- --port 5183 --strictPort
```

Fresh automated commands used **Node v22.23.5**:

```powershell
npm --prefix game test
npm --prefix game run build
git diff --check
```

Tests: **60 passed, 0 failed**. Build: TypeScript and Vite passed, 79 modules. The existing shared bundle remains 738.48 kB and emits Vite's >500 kB chunk warning; the Mission 1 chunk is 34.51 kB. No dependencies changed. The local Node binary used was `C:/Users/Yooms/AppData/Local/npm-cache/_npx/52027bd8fc0022aa/node_modules/node/bin/node.exe`. Browser scripts and raw logs are retained in `work/mission-one-site-v3/` (`capture.cjs`, `verify.cjs`, `test-log.txt`, `build-log.txt`).

## Before/after evidence

| View | Baseline 864724f | Implemented 1ab4f18 |
|---|---|---|
| Same legacy spawn and camera controls | [Before gameplay](before-gameplay.png) | [After legacy gameplay](after-legacy-gameplay.png) |
| Identical overview camera | [Before overview](before-overview.png) | [After overview](after-overview.png) |
| Reconstruction near six seconds | [Before water](before-water.png) | [After water](after-water.png) |

Also inspect [new spawn](after-new-spawn.png), [working area](after-work-zone.png), [preserved cinematic entry](after-entry.png), [dry state before evidence](after-dry-before-evidence.png), [evidence](after-evidence.png), and [mobile reduced motion](mobile-reduced-motion.png).

**Normal-speed videos:** [before, 37.64 seconds](before-normal-speed.webm) and [after, 38.48 seconds](after-normal-speed.webm). Both contain the full 12-second ending through the dry evidence reveal, with approach and investigation context. The after recording also lets the entire eight-second entry run. These are unmodified Playwright browser recordings, 1440×900, VP9, 25 captured frames/s; game time is not accelerated or slowed. Video files remain local/ignored rather than enlarging Git. The original recordings also remain under `work/mission-one-site-v3/{before,delivery}/video/`. [Capture manifest](capture-manifest.json) records sizes and SHA-256 hashes.

Comparison conditions: balanced quality, pixel ratio 1, same lighting and deterministic geometry inputs, 1440×900. Overview is a temporary browser-only override of the existing camera to `(0,30,15)` looking at `(0,0,0)`; it renders the actual production scene, not a diagram or a second renderer. The normal-camera legacy comparison keeps `(0,7)`, heading 0 and the original rig settings; vertical grounding changes with the new ground. The new spawn is deliberately different and is labeled separately. Macro framing/lighting are unchanged; the specimen now remains visible instead of being replaced by boxes. Captured elapsed times are in [before-runtime.json](before-runtime.json) and [after-runtime.json](after-runtime.json), since screenshots complete slightly after their requested timestamps.

## Findings and implementation

**Observed before editing:** the normal and overview cameras showed a central rock pile surrounded by an almost closed, regularly spaced stone chain. During the full ending, rectangular layers lifted, a separate translucent rectangle covered them and cyan points moved above the surface. The dry specimen appeared abruptly at the end.

**Established by source inspection:** eight central rocks plus 36 perimeter rocks at radius 11 m; a radial basin function; five box layers, moving points and a flat water plane; the 12-second water phase and safe restore to comparison were already implemented. **Design inference:** repeated enclosure and the isolated center caused the ceremonial composition; disconnected shapes and motion caused the clunky ending. These observations and the selected proposal were recorded before runtime edits in [the spatial/material plan](../../planning/mission-one/site-and-water-v3.md) and [site diagram](../../planning/mission-one/site-v3.svg).

The implemented site has 21 varied, partly buried slabs concentrated along a west shoulder and north bench, a smaller detached northeast exposure, and 168 low-cost nonblocking flakes near their parent exposures. An offset, elliptical basin retains shallow crater curvature without a circular prop boundary. Geometry and conservative navigation/camera obstacles share `site.ts`. Fresh spawn is `(4,7)`, heading .40; legacy `(0,7)` saves still approach safely. The work trigger remains `(0,-1.5)`, radius 2.4 m; comparison targets remain the existing magnified views, not additional driving objectives.

Measured rover plan dimensions are 2.279×1.648 m, with a 1.406 m collision radius. The planned 5.5 m approach and 8 m turning pocket were checked against the actual slab footprints and controller configuration. Small flakes are intentionally nonblocking. The exact mesh-triangle height sampler is retained for wheel contact. The diagram's full-speed turning envelope is a calculated allowance; native review tested approach, pivoting, stopping, reverse and camera orbit, not a timed high-speed lap.

The ending now shares one spatial wetness field across the rock and nearby sediment, with irregular noise boundaries, darker diffuse response and restrained roughness reduction. Embedded grains crossfade at fixed positions; no reconstruction geometry rises or translates. It progresses through pores, inferred mineral accumulation, then later exposure, reaches fully dry by 11.4 seconds, and keeps the last portion dry before the 12-second evidence transition. The observed brushed patch fades out and returns with the dry view. Reduced motion uses a stationary tableau with all three explanatory steps continuously available in text. The effect resets explicitly on every inactive draw/reset.

No new asset downloads or generated images were introduced. Existing NASA references, selected rover, rock PBR detail and RAT construction are retained. Unused runtime loading of the three old laminated-rock texture maps was removed; their files and originals were not deleted. Rock microdetail remains an Earth-material visual analogue, not a recovered Mars mesh.

## Science and provenance

The local Eagle panorama and Berry Bowl reference were opened, and NASA's primary [Lion King panorama](https://science.nasa.gov/photojournal/opportunity-captures-lion-king-panorama/) and [Discovery Served Up in a Bowl](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/) pages were rechecked. The panorama informs uneven exposure within a shallow crater; the Berry Bowl source distinguishes the cluster and the brushed, relatively empty comparison and attributes mineral identification to spectrometer measurements. These support visual relationships and explanation, not surveyed coordinates for this authored level.

Existing claims register entries M1-C01, M1-C04 and M1-C05 and the mission design review were inspected. The revised copy explicitly says inferred ancient conditions, long ago and geological time compressed; it denies present-day water and a geochemical simulation. Evidence attribution now starts with **instrument measurements**, not visual comparison identifying hematite. McKittrick-inspired grinding remains separate from the Berry Bowl/Near Empty comparison. The original geology, RAT, cinematic and mission-progress source files are unchanged.

## Verification actually performed

- **Native development playthrough:** fresh spawn to approach, timed brush, fresh held-E grind, inspect, cluster, control, entire normal-speed reconstruction, dry evidence. Entry also played without skipping in the final recording. No phase/time injection was used for that playthrough.
- **Legacy route and navigation:** loaded a valid legacy approach checkpoint at `(0,7)`, drove into the bedrock obstruction, stopped, reversed more than 1 m, pivoted left/right and orbited the normal camera. Across 554 sampled frames, all six contacts stayed supported, minimum camera/ground clearance was **0.349736 m**, and minimum conservative rover/obstacle gap was approximately zero without penetration. [Behavior results](behavior.json).
- **Pause/reload:** paused during wetting and compared the exact phase clock/material state 1.2 seconds apart: unchanged. Normal persistence stored `water`; reload/Continue restored dry comparison, then replayed the reconstruction.
- **Restart/skip:** restart during wetting replayed the entry and reset to `(4,7)` with no wet field or temporary embedded grains. A new investigation and early skip reached dry evidence with transient grains hidden. Tests also verify fixed embedded instance transforms and material/shadow restoration.
- **Return failure:** injected the existing development-only one-time hub-load failure. Chapter/reward counts remained zero until Retry successfully opened the hub; then exactly one chapter and GRIND were saved. The direct preview's manual Save Game left the stored normal journey unchanged. An initial harness assertion incorrectly compared against the outgoing normal page's pre-unload timestamp; it was corrected to compare storage within the preview itself, then rerun successfully. No game fix was needed for that harness issue.
- **Clean production journey:** started with empty browser storage at `/`, selected New Game, glided through the hub to the rover, entered the memory, drove the new route and completed the investigation. Reload during wetting restored comparison; the replay ran to evidence without skipping; successful return saved `chapters:['blueberry-clue']`, `skills:['grind']`, and `completed:[]`. A subsequent reload retained those values. [Production results](production.json).
- **Mobile production:** 390×844, low quality, touch and large text, reduced-motion preference. Loaded a valid nearby approach checkpoint, skipped the dated entry, touch-held the grinder, completed both comparisons, inspected the stationary reconstruction and its three-step text, paused/resumed, skipped to dry evidence and returned with the reward saved. No horizontal overflow. [Mobile results](mobile.json). This is browser emulation, not a physical-phone test.
- **Errors/assets:** no page or console errors and no failed requests in final capture, development behavior, production journey or mobile runs. One shared active loop remains. The browser-only inspection hook exposes existing objects for measurement; it does not add runtime source hooks, renderers or input systems.
- **Automated:** new tests check rendered slab footprints against navigation obstacles, both route clearances/slopes, real rover contact configuration and collision/reverse behavior, drying before evidence, inactive/reduced states and fixed reconstruction transforms. Existing 55 checks also pass. `git diff --check` passes.

## Measured rendering cost

Chromium with D3D11 ANGLE on this machine; balanced 1440×900, game cap 45 fps. Values are observed frame samples including the existing shadow/presentation passes, not GPU timing or a hardware-independent benchmark.

| Sample | Before calls / triangles / fps | After calls / triangles / fps |
|---|---|---|
| Fresh spawn (different authored start) | 162 / 422,766 / 45.0 | 152 / 417,198 / 45.2 |
| Working approach | 146 / 399,214 / 45.2 | 142 / 402,478 / 45.2 |
| Reconstruction near 6.3 s | 75 / 72,698 / 45.2 | 53 / 134,730 / 45.0 |
| Dry evidence | 59 / 367,434 / 45.3 | 57 / 367,242 / 45.2 |

End-of-chapter allocated geometries/textures: **192/33 → 162/32**. The new middle reconstruction renders more triangles than the old box-only shot because the detailed specimen stays present, while using fewer calls. A first draft's flakes were too expensive; they were replaced by a simple instanced low-poly shape before final capture. The initially black macro sediment (missing vertex colors on a shared material) was corrected and visually rechecked. Full after-run counters, including brief transition/screenshot dips, are retained in the JSON; sustained thermal behavior and low-end hardware were not measured.

## Changed paths, ownership and limits

Runtime paths:

- `game/src/scenes/episodes/rover/missions/blueberry-clue/site.ts` — authored site and obstacle source.
- `.../surface.ts` — asymmetric chapter heightfield and sediment vertex variation.
- `.../art.ts` — grouped site meshes, macro sediment attribute fix and reconstruction integration.
- `.../water-state.ts` — deterministic normal/reduced/inactive reconstruction timeline.
- `.../reconstruction.ts` — material field and fixed embedded grain presentation.
- `.../index.ts` — scene-local placement, effect lifecycle, observed patch transition and directly affected explanatory UI updates.
- `game/src/content/blueberry-clue.ts` — inferred-time/science wording.
- `game/tests/mission-one-site.test.ts` — five meaningful new checks.

Supporting changes: `.gitignore` permits selected review evidence; `outputs/planning/mission-one/site-and-water-v3.md`, `site-v3.svg`, and this review folder record the plan and handoff. [Source hashes](source-sha256.json) identify the final runtime and build inputs.

Shared app/core/input/rendering, rover/controller/camera, hub/environment files, dependencies, RAT/geology/entry/progress modules and all asset originals are unchanged from the base. No Mission 2 work was added. The shared main checkout remains at `9bd61b0`; all **1,370** snapshotted tracked/untracked files are byte-identical, with no new paths there. Existing main dirt and the other worktrees were preserved. See [preservation.json](preservation.json).

This remains a compact, authored Eagle-inspired teaching site, not a photogrammetric/surveyed reconstruction. Wetting and crossfaded concretion/exposure are explanatory material transitions, not fluid transport, geochemical kinetics or a geometric erosion solver. Collision circles are deliberately conservative and fine chips are nonblocking. Mobile essential information fits, but the large-text panel covers part of the magnified specimen. Physical-device, extended soak, full-speed circuit and owner aesthetic acceptance are not claimed. No deployment or merge was performed.
