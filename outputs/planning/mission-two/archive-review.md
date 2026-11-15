# Mission 2: longer holds and authentic NASA imagery

15 November 2026. Isolated `work/mission-two`, branch `codex/mission-two`, base `548ce49`. Uncommitted local work. This increment follows the user's review of the cinematic polish and supersedes its shorter wheel/outro timings. Existing source was copied to ignored `outputs/recovery/mission-two-archive-before-*` before editing. Main, other missions, renderer settings and shared save/reward contracts remain untouched.

## Experience and pacing

- Wheel reveal: **3.8 seconds**, up from 1.8. After the game camera settles, a small, clearly labelled original NASA wheel image appears beside the reconstruction.
- Post-recovery view: **5.2 seconds**, up from 3.2. The rover remains stopped on firm ground; no held movement leaks into the cinematic.
- The camera then pushes toward the disturbed sand for **3.4 seconds**, with a modest lens change from 42 to 36 degrees. Reduced motion uses a static view.
- A dissolve introduces a contained, uncropped original NASA look-back image for **6 seconds**. Its capture date, sol, camera, image ID, NASA/JPL credit and canonical source link are visible. The image then shifts right alongside the reflection on desktop/laptop. Narrow screens show the dedicated archive beat before the reflection without trying to fit both beside each other.
- Intro, WASD/hold-W assistance, optional planner, soil response, bounds and safe return remain as in the preceding sprint. The isolated preview is still **http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory**. This remains a DEV-only slice without shared chapter integration, checkpoint/save or reward.

## Sources and guardrails

Two existing repository reference-pack originals were copied **byte-for-byte** to `game/public/assets/missions/purgatory/v1/`. Together they are **147,664 bytes**. They are static HTML image overlays, not added 3D textures or new rendering passes. No new asset download, generated image, re-encoding, crop or recolouring was used. `SOURCE.md` beside the runtime images retains hashes and usage notes. The reference-pack originals and manifests were preserved.

1. [PIA07984: Slow Progress in Dune (Right Front Wheel)](https://science.nasa.gov/photojournal/slow-progress-in-dune-right-front-wheel/). The live NASA caption identifies a Hazard Avoidance Camera recovery sequence starting May 10, 2005 and ending eleven days later; credit NASA/JPL. The UI conservatively labels the static JPEG **Recovery sequence · May 2005**, rather than claiming a precise exposure date or representing it as the April 26 trapping moment.
2. [PIA07999: Looking Back at Purgatory Dune](https://www.jpl.nasa.gov/images/pia07999-looking-back-at-purgatory-dune/). The live JPL caption identifies the June 11, 2005 / Sol 491 Navigation Camera look-back after escape, credit NASA/JPL. June 21 is publication, not capture. The UI uses the capture date.

Both primary pages were independently reopened in this pass; archived captions and the verified reference manifest agree. The visible **Actual NASA image** label applies to the photograph. The orange game sand remains labelled as a simplified reconstruction. The dissolve is an authored visual comparison, not evidence of exact camera registration, surveyed geometry or continuous historical footage. No endorsement, invented NASA dialogue or measured-physics claim is made. Missing media displays an explicit unavailable message and a source link; no generated substitute is shown. These constraints are also recorded in mission-local `AGENTS.md`.

## Actual verification

**89 tests pass**, including 15 Mission 2 tests, plus TypeScript and production build. The new integrity check hashes the runtime images against the independently acquired pack manifest, checks credit/capture context and bounds transfer size. The camera continuity test now includes the sand shot. Existing movement, soft-soil, release-stop, recovery, mesh/contact and bounds checks remain passing. The existing shared large-chunk advisory remains. A production build still excludes the DEV-only route; it does not prove a production Mission 2 integration.

`review-archive/checks.json`: full Chromium, 1440 × 900, DPR 1, balanced; real-time input, no fixed-step advance. Wheel hold measured **3,804 ms** and post-recovery hold **5,222 ms**. Both photos decoded at their native 256 × 256 and 1024 × 1024 dimensions. One held W recovered the rover; pause during recovery and the archive beat, end reflection, replay/reset, return teardown and desktop/laptop/narrow layout checks passed. No unexpected page or HTTP errors. Actual stills were inspected: wheel/photo comparison, sand push, full archive, reflection and 960 × 640 layout. The source photo is fully contained with no hidden crop.

`review-archive/fallback.json`: reduced-motion journey with the look-back request deliberately aborted. The explicit unavailable state appeared, the broken image stayed hidden, and the ending's actual Return to Mars button and cleanup passed without page errors.

`review-archive/profile.json`: same settled right-front inspection pose/preset method as the prior sprint, with actual caps asserted. Measured **45.03 FPS balanced / 60.04 FPS high** against the existing 45/60 caps. Balanced counters remain 63 draw calls, 338,584 rendered triangles across passes, 18 geometries and 26 WebGL textures. The DOM images do not appear in Three.js texture counts; their byte sizes are recorded separately above. Ground remains 55,460 triangles. No quality reduction or render-cap change. These are one-machine DEV browser measurements, not GPU timing, thermal testing or a broad production performance guarantee.

## Review artifacts

- `review-archive/mission-two-nasa-archive.webm`: uncut, normal-speed actual browser gameplay including the longer holds and archive transition, captured at 1440 × 900 into 1280 × 800 video. This longer review clip is not the project's submission video.
- `review-archive/wheel-reveal.png`, `sand-push.png`, `nasa-archive.png`, `ending.png`, `ending-laptop.png`, `ending-narrow.png`.
- Reproduction: `review-archive.mjs`, `check-archive-fallback.mjs`, `capture-archive.mjs`, and `profile-polish.mjs review-archive`. Raw WebMs remain ignored/local. Earlier sprint clips remain historical evidence.

User visual acceptance remains pending; “Picasso level” is a quality target, not a status proven by tests. No propagation to other maps, commit, merge, push or deployment was performed.
