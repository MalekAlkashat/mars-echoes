# Blueberries present from initial navigation

15 November 2026. Implemented in isolated `codex/blueberry-continuity`, based on the prior polish commit `47bc2172e65146e0b2a8a36b3118e61a5196b17c`. Main remains `d87c056`; the previous polish worktree remains clean and unchanged. No merge or push is included.

The opening exploration scene now contains its own authored concretion clusters before any mission is requested. Mission 1 retains its original specimen arrangement through approach, tool use, comparison and final evidence. The water interpretation wets the existing specimen instead of replacing its stones with a second population.

## Preview and evidence

Start the actual journey at **<http://127.0.0.1:5194/>** (development) or **<http://127.0.0.1:5195/>** (production), then choose New Game. The direct mission preview is optional; it is not the entry point for testing this requirement. Existing user saves were not accessed or cleared. Browser checks ran in new ephemeral Playwright contexts.

| Native view | Before, polish baseline | After |
| --- | --- | --- |
| Fresh navigation, before memory entry | [before-navigation.png](before-navigation.png) | [after-navigation.png](after-navigation.png) |
| Mission approach | [before-approach.png](before-approach.png) | [after-approach.png](after-approach.png) |
| Grinding | [before-grind.png](before-grind.png) | [after-grind.png](after-grind.png) |
| Water interpretation | [before-water.png](before-water.png) | [after-water.png](after-water.png) |

Additional captures: [memory entry](after-entry.png), [inspection](after-inspect.png), [cluster](after-cluster.png), [comparison patch](after-control.png), [final evidence](after-evidence.png), [hub return](after-return.png), [fresh portrait navigation](mobile-navigation.png).

Local full-speed recordings: [before journey](before-journey.webm), [after journey](after-journey.webm). These are original 1440×900 browser recordings, without retiming, omitted from Git. Source recordings remain under `work/continuity/{before,after}/video`. `evidence.json` records hashes and capture provenance. Stills are unretouched native-game screenshots. Desktop runs use balanced quality, DPR 1 and the existing 45 FPS cap with Chromium D3D11. Small differences in stopping position and sky time arise from wall-clock input. The recorded journey uses the real cameras throughout; no overhead or substitute scene is used.

## Inspection: observed behavior versus source

**Runtime baseline:** a genuinely fresh New Game showed no small concretion clusters in the opening hub. Mission entry/approach and tool use also lacked the specimen grains; they became visible in comparison. The complete baseline route was captured from navigation through return.

**Source trace:** `main.ts` defaults to `mars-hub`; `Game` loads the hub and New Game resets it. `createMarsHub` calls `createHubWorld` before activation, and the director recreates the hub on return using the stored bookmark. The hub previously had no concretion population. Mission 1's `addConcretions` already deterministically created 150 instances, but `art.ts` placed them in a hidden macro group and `index.ts` explicitly hid them outside comparison/evidence. The reconstruction additionally cross-faded the original grains with 36 overlapping embedded instances. Those were visibility/presentation conditions, not a missing save unlock.

**Inference and selected design:** existence belongs to initial scene assembly. Saves should restore the journey without being required to create geology. A deterministic scene population avoids storing decoration in saves. A single specimen and unchanged local transforms provide a recognizable match across reframed observations. Distinct site seeds and IDs avoid suggesting that the hub and Eagle are the same physical location.

## Implementation and ownership

- New `game/src/environments/mars/concretions.ts`: deterministic cluster placement plus scene-owned instanced geometry/material helpers. Charcoal-gray, rough, nonmetallic grains; no blue pigment instruction. Low-detail geometry has 80 triangles per instance. No new textures, physics, listeners, update loop or save fields.
- New `game/src/scenes/mars-hub/concretions.ts` and a setup call in `layout.ts`: 640 grains in eight authored groups along the initial foreground, trough and rover approach. The first two groups contain 180 grains. Creation receives terrain height only, with no mission/progress/session/reward dependency. Bases intersect the actual terrain rather than floating on a fixed plane. The existing hub terrain, outcrops, lights and navigation are unchanged.
- Mission 1 `landscape.ts`: a separate 240-grain ground population created once, with independent IDs/seed. Nonblocking small dressing; no terrain/contact changes.
- Mission 1 `art.ts` / `geology.ts`: the original 150-grain arrangement stays one instanced object. It sits at the work point during approach and is reframed into the existing magnified stage, retaining instance identity, matrices, count and material. Fine geometry is used for the close-up; the field and approach specimen share coarse geometry. Both geometry lifetimes are explicitly covered by scene disposal, including early cancellation.
- Mission 1 `index.ts`: removed phase-based grain hiding. Brush/tool occlusion is legitimate; no new grain population appears when comparison begins.
- Mission 1 `reconstruction.ts` / `water-state.ts`: removed the duplicate embedded batch and opacity-based disappearance. Existing wetting/front/stage timing remains. Grains stay opaque and fixed; only a restrained wet material response changes during the labeled interpretation, restoring on exit/restart.
- Tests: `concretion-continuity.test.ts` and revised reconstruction checks in `mission-one-site.test.ts`. Planning and evidence are under `outputs/`; `.gitignore` admits this report and compact artifacts only.

The hub and historical mission are separate authored locations. Navigation grains are enlarged visual analogues (hub radius 8–18 mm, mission field 7–12 mm) for third-person readability; these are not measured NASA sizes. The magnified specimen retains its existing approximately 4 mm grains and exact arrangement. The retained NASA Berry Bowl image was opened and used for grouping/material judgment; existing provenance remains under `assets/references/mission-one/v1`. No new scientific claim or surveyed placement is asserted. Existing separate-observation/McKittrick/Berry Bowl wording remains intact: this representative play space compresses observations rather than claiming one surveyed historical specimen.

## Verification

**Fresh-start proof:** isolated initial storage is empty. The first navigation capture contains one visible 640-grain hub batch, with **zero Mission 1 module requests before that capture**. The hub population therefore exists independently of mission loading or previous completion. The same complete matrix array is present after the mission return.

**Mission proof:** entry, approach, at-specimen, brush, grind, inspect, cluster, control, water and evidence all retain the same 150-grain instance UUID and exact local matrices. Every sampled phase is visible and opaque. Those matrices also equal the baseline comparison specimen's matrices. A different camera/view or legitimate tool/rover occlusion does not imply redistribution. The subcentimetre specimen is naturally small in the drive view; nearby field clusters provide readable geological context.

**Persistence and cleanup:** hub manual save/reload and confirmed New Game reset preserve all 640 matrices and one batch. Mission restart retains the same specimen instance. Inspection save/reload reconstructs the exact arrangement. Wet pause freezes time/state; wet reload safely resumes at comparison with opaque grains. Four repeated visits through grinding/inspection and abort return preserve the hub hash, grant no rewards and keep one active loop. Every inspected mission reports 150 geometries / 41 textures; every returned hub reports 31 / 31, with no growth across four visits.

**Automated checks:** all 64 tests pass; explicit Node 22.23.5 TypeScript check and Vite production build pass. Tests cover deterministic placement, separation, actual terrain intersection, initial-view population, specimen reframe stability, no duplicate reconstruction mesh, opaque grains and wet-material reset, alongside existing route, camera/contact, progression and save tests. Vite retains its existing large-bundle advisory, approximately 738 kB minified.

**Production browser:** a clean New Game proceeds through hub navigation, entry, full investigation, water save/reload, ending, reward return and reload. Only the intended `grind` skill and `blueberry-clue` chapter are recorded. A separate fresh 390×844 production context shows grains during initial navigation with empty prior storage. Touch grinding, comparison, reduced-motion reconstruction, pause/resume, skip and reward return pass in portrait emulation, with no horizontal overflow. These successful checks report no browser errors or failed requests. Production uses the built game rather than dev-only debug state; physical-phone performance is not inferred from emulation.

Validation issues corrected during work: a first unit run exposed an extensionless Node import and an obsolete assertion for the removed opacity timeline; both were fixed. An intermediate dev recording was invalidated by live source reload and was replaced. The persistence observer initially assumed a hub object existed after a direct mission-save reload; it was corrected to allow the genuine hub-not-yet-created lifecycle. These failed attempts are not recorded as successful verification.

## Limits and preservation

Visible grains add rendering work; keeping previously hidden specimen grains visible during tool use is intentionally more expensive. Instancing, shared coarse geometry, no added texture maps and no per-frame generation limit that cost. Frame counters are capped desktop snapshots, not GPU or thermal benchmarks; consult `performance.json` for measured before/after figures.

| Snapshot | Before → after draw calls | Before → after triangles | Before → after capped FPS |
| --- | --- | --- | --- |
| Initial hub navigation | 94 → 96 | 288,506 → 390,906 | 44.3 → 44.3 |
| Mission approach | 100 → 112 | 394,154 → 527,850 | 45.0 → 45.0 |
| Grinding | 427 → 431 | 224,218 → 488,218 | 44.3 → 44.3 |
| Hub return | 92 → 94 | 285,706 → 388,106 | 44.3 → 44.5 |

The hub keeps 31 resident textures. Mission approach now uploads four existing specimen textures earlier (33 → 37); the inspected mission's 41-texture total is unchanged. These results establish this desktop's observed capped behavior, not unchanged cost on every GPU.

This is an agent-verified continuity fix, not owner visual acceptance, a geological survey or an exhaustive device test. Scene reframing preserves the authored specimen rather than simulating a continuous physical microscope camera. No new moving grain physics or abrasion ejection is introduced. Existing user storage, main, recovery stashes and concurrent terrain work remain untouched; `preservation.json` records all 1,484 protected file hashes checked unchanged and the prior polish worktree still clean.

Relevant project skills: `game-level-design`, `gameplay-visual-review`, `materials-to-game`, `plan`, `playwright` and `feature-handoff`. Recheck worktrees and ownership before integration. This branch includes the preceding unmerged polish commit as its base; integrating only a subset requires an explicit dependency review.
