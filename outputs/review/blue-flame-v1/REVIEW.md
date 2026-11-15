# Blue flame spirit v1: runtime review

## Skill-guided camera and trail refinement

Reviewed the refreshed skill catalog and applied game-feel, camera, procedural
animation and native-review guidance. Stabilized adjacent ribbon frames to remove
edge flips near view-aligned motion and added bounded 0.4 m camera look-ahead.
Native right/forward/left rush review in a separate preview shows a continuous
wake and no browser errors; `feel-refinement.jpg` is the current capture. The
soft contained core and existing rendering budgets remain. Build and 85 tests
pass, including an adjacent-edge regression case and camera/reduced-motion
checks. Historical captures below precede this revision.

## Follow-up: soft contained soul

Removed the upward/rear horn at rest and reduced core deformation. Noise-cut
holes are replaced with a coherent rounded internal soul and subtle density
variation. Both envelope and core now feather opacity at grazing angles; core
opacity and outer filament contrast are reduced. Native moving view checked,
with an empty browser error log. `soft-core.jpg` is the current capture; earlier
images and clips describe superseded appearances. Build and 82 tests pass.

## Follow-up: velocity pulse and core dissolution

The revised shader/controller wiring directly maps actual speed to pulse rate
(0.65–3 Hz), advection and trail lifetime (0.18–0.73 s). Integrated pulse phase
prevents discontinuities. Core geometry morphing and alpha dissolution replace
the dense spherical centre. Native hub review shows the broken-up core and
responsive wake with no browser errors. A paused sample at 4.057 m/s reports
1.921 Hz and a 2.843 m trail span. `velocity-pulse.jpg` records that view.
The production build passes; 82 automated tests pass, including a new four-speed
comparison of pulse frequency and trail reach. Earlier motion captures, metrics
hashes and the ten-return test below describe the initial revision, not a fresh
ten-return run of this shader adjustment.

15 November 2026. Base revision `548ce49`, branch `fixing_terrain`, with local
spirit changes. Final appearance acceptance belongs to the user.

## Result

The humanoid placeholder is replaced by the supplied blue flame direction:
white-cyan nucleus, flowing envelope, bright filaments, world-space wake,
embers and a subtle ground halo. WASD glides, either Shift rushes, Space leaps,
drag/arrows orbit and scroll zooms. Terrain and the Opportunity chapters retain
their existing ownership. No third-party runtime art/code was imported.

## Checks

- `npm run build`: passed, including TypeScript. Vite retains its existing
  warning about the large shared engine chunk; no dependency was added.
- `npm test`: all **81 checks passed**. Twelve are spirit checks, covering
  existing traversal, new rush/brake/diagonal behavior, 30/60/120 Hz agreement,
  solid and bound contact, actual displacement, fixed-time trail sampling,
  a retained world-space corner, pause, reset/teleport, fading and resource disposal.
- `git diff --check`: passed.
- Native development play: rush right, turn forward, bounded leap, steer left,
  release and stop. The actual canvas is recorded in `spirit-motion.webm`
  (7.966 s, 1600 × 900, nominal capture target 30 Hz). `spirit-motion.mp4` is
  one H.264 review conversion from that original. Neither clip includes sound.
- The moving wake remains on the travelled path. The side view exposes its
  length; the chase view remains legible through the turn and leap. At rest it
  contracts into the compact living flame. These are agent observations, not
  owner aesthetic acceptance.
- Native orbit: arrow-key yaw and higher-pitch view remain functional.
- Solid rover contact: the spirit is displaced along the existing collision
  circle rather than passing through the rover; the leap retains solid collision
  in automated checks. Effect strength follows the resolved displacement.
- Native entry/return: **ten aborted Blueberry Clue visits**, including early
  exits during its introduction. All restore `(1.08,-23.70)`, zero trail span,
  zero rush and 48° FOV. Returned renderer counts remain **30 geometries / 32
  textures**. The first return is shown in `returned-hub.jpg`; the additional
  nine are recorded in `return-checks.json`. This does not retest completion of
  the full scientific chapter.
- Pause: rendered frame count remains `19819` across observations separated by
  the production smoke test. The app stops composing paused views.
- Native production check: this build served separately on port 5196, normal
  start, **right Shift** rush, forward leap and pause. Production error log is
  empty. The temporary production server was stopped afterward; source preview
  remains available on port 5195.

## Cost and limits

The spirit has six main-view effect draws, **3,074 triangles**, one private
128 × 128 RGBA noise texture (64 KiB before driver overhead), a 64-point trail
buffer sampled at 60 Hz and 32 pooled embers (12 at low pixel ratio). Flat
double-sided effects explicitly use a single pass. No shadow lights, simulation
targets, new compositor passes, additional renderer or input listeners.

Balanced graphics retained DPR 1.25, bloom disabled and the 45 FPS cap. Native
samples during traversal/returns read approximately **44.9–45.2 FPS**, with
render submission readings around **0.5–0.9 ms**. These are application readings,
not GPU timings, full update-frame profiles or a thermal measurement. A timed
five-minute hardware benchmark has not been performed.

The initial baseline image used the reference100 terrain. During this work, the
terrain owner restored the user's a38322f hub selection. Final captures use that
restored hub. Thus `before-idle.jpg` is historical appearance context, **not a
controlled terrain/performance A/B comparison**. A matched unchanged-map CPU/GPU
cost comparison remains unmeasured; the geometry/draw contract is checked
independently.

During repeated Mission 1 visits, Three.js logged warnings about undefined
optional map/normal/roughness/AO material parameters. Those materials are not
changed by this spirit pass. No flame shader compilation fault was observed.

## Evidence and scope

- `rush.jpg`, `turn.jpg`, `leap.jpg`: frames extracted from the original native
  canvas recording, without retouching the game image.
- `production-rush.jpg`: production browser screenshot with surrounding HUD.
- `idle.jpg`, `returned-hub.jpg`: live browser screenshots.
- `metrics.json`: tuning, budgets, observations and source hashes.
- `return-checks.json`: nine additional returns after the first manual return.

Focused visual review: character readability improved from placeholder to a
distinct energy form; movement state now drives body/trail/camera together;
trail curvature and lifecycle are verified. Flame surface detail and personality
remain subject to the user's visual review. This is not a whole-game premium
graphics certification, final spirit lore, an audio pass or a mobile rush UI.

Reproduce the recording through `?scene=mars-hub&review=spirit`, using the existing
development-only **Record motion check** button. It captures the production scene
path and saves into this directory without overwriting older hub reviews.
