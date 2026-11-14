# Mission 1 — world continuity review

15 November 2026. Agent implementation and verification; owner visual acceptance remains open.

Mission 1 now uses the mainland's filtered sand/rock materials, dust integration and atmospheric lighting family while retaining its compact, pale Eagle-inspired exposure. Six low fractured slab variants replace the repeated metre-scale specimen mesh. The existing asymmetric layout, open approach and scientific close-up remain intact. Distant shoulders provide a shallow basin silhouette without changing the playable heightfield.

## Delivery and ownership

- Worktree: `C:/Nasa 2026/mars-echoes/work/mission-one-world-polish`.
- Branch: `codex/mission-one-world-polish`; base `d87c05670bac9c77128edd409c73572a163300e1`.
- Development: <http://127.0.0.1:5190/?mission=blueberry-clue>. Production player flow: <http://127.0.0.1:5191/>. Production direct preview: <http://127.0.0.1:5191/?mission=blueberry-clue>.
- Existing main preview on 5184 was used for baseline capture and left running. Port 5185 was occupied and left alone. Preview servers on 5190/5191 serve this worktree only.
- Owned runtime paths: `game/src/scenes/episodes/rover/missions/blueberry-clue/{art,surface,field-rocks,landscape}.ts`. Tests: `game/tests/mission-one-{site,vista}.test.ts`. Documentation: this directory and `outputs/planning/mission-one/world-continuity-v4.md`; `.gitignore` only adds this evidence directory.
- No shared renderer, input, lifecycle, material factory, atmosphere factory, hub source, dependency or asset file changed. Main, concurrent terrain work and recovery stashes remain separate. No merge/push is part of this delivery.

## Evidence and design decisions

**Observed baseline:** native 1440×900 balanced gameplay showed a fine, warm mainland surface with cool sky, dusty rock bases and distant relief. Mission 1's beige ground was smoother, its field rocks reused the macro specimen material at the wrong scale, and its background was flat. The v3 asymmetric placement and unobstructed approach already worked. These were retained.

**Source facts:** the hub provides world-space triplanar materials with derivative/distance filtering, terrain dust baking, instanced ground-plane attributes and an atmosphere/environment factory. Mission 1's original macro lighting, centimetre specimen, RAT, water reconstruction and reward flow are independent enough to preserve through explicit view switching. The .5 m playable ground triangles and height sampling remain unchanged; a regression test checks the frozen v3 field across the complete playable square plus margin.

**Reference interpretation:** opened the retained NASA Eagle panorama and Berry Bowl photographs under `assets/references/mission-one/v1`. Shallow basin composition, pale broken bedding and dark small concretions inform the setting. These are visual references, not sampled geometry. The approved CC0 hub maps are Earth/Moon surface analogues; provenance remains in `game/public/assets/surfaces/dust/SOURCE.md` and `assets/vendor/polyhaven/SOURCE.md`. No new scientific claim, map download, generated texture or NASA-scanned terrain is introduced.

**Implemented selection:** a scene-local world group uses shared material helpers with a muted warm sand tint, quieter pale rock normals and a higher memory sun. The disk, directional light and environment probe use the same scene-owned direction. Macro lighting/fog/environment are restored explicitly on close-up. Six deterministic slab outlines have chipped/bevelled surfaces, varied shallow exposure, terrain-aligned tilt and buried bases. The 126 thin flakes use cheaper geometry and cluster beside existing exposures. They add no collision obstacles. The 21 slab sites, collision envelopes, spawn `(4,7)`, work point `(0,-1.5)`, ±11 m boundary, route and turning pocket are unchanged.

**Iteration from runtime evidence:** literal hub lighting/normal settings produced overly dark, noisy slabs and long shadows. A later side-view pass revealed cut-block edges and a distant material line. Slabs were lowered and fractured; near/far ground now shares the filtered material and field normals. Scenic sampling was densified to prevent a coarse transition. A measured high triangle count in tiny chips was corrected with a separate fragment mesh. No extra random boulder field was used to fill the open driving apron.

## Native comparisons and footage

All stills are unretouched screenshots from the real game. Desktop comparisons use balanced quality, 1440×900, DPR 1, the existing 45 FPS cap and Chromium D3D11. Before is main at `d87c056`; after is this branch. Scene time and stopping distance can differ slightly because inputs run at wall-clock speed. Hub and Mission 1 have their own existing player cameras; they are compared at normal gameplay scale rather than pretending to be identical shots.

| View | Before | After |
| --- | --- | --- |
| Mission spawn | [before-spawn.png](before-spawn.png) | [after-spawn.png](after-spawn.png) |
| Work area | [before-work.png](before-work.png) | [after-work.png](after-work.png) |
| Hub rock approach | [hub-before.png](hub-before.png) | [hub-after.png](hub-after.png) |
| Reconstruction at approximately 6 seconds | [before-water.png](before-water.png) | [after-water.png](after-water.png) |

[Entry composition](after-entry.png), [layout overview](after-overview.png), [side view](after-side.png), [dry ending](after-ending.png), [mobile ending](mobile-ending.png).

The overhead image temporarily repositions the existing camera in the browser for composition inspection; it is explicitly a diagnostic view, not the player camera. Other views use the game's cameras. Browser read-only object exposure supports contact/performance measurement; progression is driven by real keyboard/touch events at normal speed, without time scaling or forced mission stages.

Normal-speed local videos (ignored by Git; original recordings retained under `work/world-polish`): [baseline mission](before-mission.webm), [final entry, approach, RAT and reconstruction](after-mission.webm), [turning and camera orbit](turning-orbit.webm). The final mission recording includes a brief diagnostic overhead view before native driving. The orbit movie is a separate normal-control recording; its final distant sampling predates only the later scenic mesh densification. See `evidence.json` for file hashes, durations, source hashes and original paths.

## Actual verification

- Explicit Node **22.23.5**: TypeScript `tsc --noEmit` and Vite production build pass. All **62 tests pass**, including 21 rock footprint/base-burial checks, unchanged route/contact tests, 800 exact near/far edge matches with matching normals, upward far triangles and the unchanged playable field. Build retains the existing large-chunk advisory (main bundle about 738 kB minified).
- Native development checks: approach, sustained collision push, reverse, left/right pivots and camera orbit pass. 556 samples: all six simulated contacts grounded, minimum camera-ground clearance 0.3497 m, minimum obstacle gap approximately zero without penetration. A separate moving turn and side/rear orbit passes with 806 samples, minimum camera clearance 0.3491 m and minimum obstacle gap 1.1235 m. These are measured samples, not exhaustive proof for every possible input.
- Development full route: brush → deliberate fresh grinding hold → specimen → Berry Bowl → comparison → reconstruction → dry evidence. Pause freezes wet state; water save reload resumes safely at comparison; restart restores current spawn/dry state; skip clears the wet reconstruction. Failed hub return/retry awards the skill only after success. Direct preview does not overwrite the normal save.
- Production browser: clean New Game → hub traversal → memory entry → full investigation, water save/reload, full ending → hub reward → reload. Exactly the `grind` skill and `blueberry-clue` chapter are saved; legacy prototype completion remains empty.
- Production mobile emulation: 390×844, low graphics, large interface and reduced motion. A valid nearby checkpoint seeds the test; subsequent touch grinding, comparison, essential reconstruction cues, pause/resume, skip and reward return pass. No horizontal overflow. This is browser emulation, not physical phone QA.
- Four native development entry/abort/return cycles pass: every mission visit reports 28 geometries / 33 textures, every returned hub reports 30 geometries / 31 textures, one active loop, unchanged bookmark and no reward for aborting. Counts stabilize across all four visits; this is a bounded resource check, not an indefinite leak test.
- Successful reported checks have no browser console errors or failed requests. JSON results accompany this report.

Validation corrections: the first production harness released E at a fixed 3.3 seconds and timed out; it now holds until observed completion. The initial cleanup harness incorrectly waited for development-only counters in production even though the captured hub return succeeded; resource counting was moved to development. An initial default-shell build used Node 21 and lacked `crypto.hash`; the final checks explicitly use Node 22. These failed attempts are not counted as passes.

## Measured rendering cost

Snapshots from the recorded desktop runs, including the renderer's shadow passes. They are not a GPU benchmark, uncapped FPS measurement or thermal test.

| View | Before calls / triangles | After calls / triangles | Before / after FPS | Before / after geometries / textures |
| --- | --- | --- | --- | --- |
| Spawn | 152 / 417,198 | 100 / 394,154 | 44.3 / 45.2 | 41 / 31 → 28 / 33 |
| Work area | 142 / 402,478 | 100 / 394,154 | 44.5 / 44.5 | 41 / 31 → 28 / 33 |
| Reconstruction ~6 s | 53 / 134,730 | 54 / 136,266 | 45.0 / 45.0 | 162 / 32 → 149 / 41 |

Instancing reduces field draw submissions. The new atmosphere and retained world surface cache increase texture residency after entering the macro view. The far extension has 14,400 triangles. No claim of a measured GPU-time improvement is made.

## Preservation and remaining limits

`preservation.json` compares SHA256 for **1,484 main tracked/untracked files** against the starting snapshot: zero changed or missing, same main HEAD, same two stash identities/order/messages. Hub/shared sources and protected Mission 1 gameplay/RAT/reconstruction modules are unchanged. Hub captures retain its existing warm surface, low light and placement; the production flow also revisits it after the memory.

This remains an authored compact geological location, not measured Eagle topography. Distant ground is scenic and outside the playable boundary; the rear apron intentionally remains sparse. The existing conservative circular collision envelopes and approximate rover suspension are preserved. Final aesthetic judgment belongs to the user; screenshots and passing checks do not establish a universal quality standard. Physical-device/thermal testing and exhaustive camera/terrain coverage remain outside this review.

Relevant instructions used: `.agents/skills/{game-level-design,materials-to-game,gameplay-visual-review,threejs-procedural-materials,plan,playwright,feature-handoff}/SKILL.md`. Recheck Git/worktrees before integration, preserve concurrent work, and merge only this isolated branch when requested.
