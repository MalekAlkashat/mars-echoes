# Mars hub terrain and rendering review

14 November 2026. Source base `30c4783`, with local planning changes and the implementation recorded below. `baseline.json` preserves pre-redesign source hashes; `applied-layout.json` records the new map and source hashes. Agent verification is not user acceptance.

## Result

The present-day hub now uses a separate Mars-informed trough/basin landscape instead of the fictional rover graveyard. NASA references and their interpretation are in `outputs/references/mars-hub/reference-direction.md`. The existing movement abilities and scene contracts remain. One stationary provisional rover is the entrance; the fictional repair episode is separately preserved. This is not a historically accurate final Opportunity model or a surveyed Perseverance Valley reconstruction.

Spawn remains `(x,z)=(0,8)`. The entrance moves from `(0,1)` to `(0,-25)`, making a 33 m approach over a low saddle and down into the basin. A left side loop reaches an overlook near `(-10,-14)` and rejoins the approach. The controller's 63.5 m playable radius is unchanged. A coarse decorative ground mesh reaches roughly 1 km from the origin along its square edges, beyond the playable area. The spirit camera and sky range accommodate that vista. Terrain, shelves, scatter and collision use the same near-ground sampler. Scatter is fixed-seed and leaves the approach clear. Six low shelves and sparse instanced rocks replace rover copies; shelves are buried into ground rather than suspended.

## Rendering changes

Default balanced presentation caps pixel ratio at 1.25 desktop / 1 mobile and rendered frames at 45 fps. Canvas antialiasing is disabled because the composer already has 2x MSAA. AO resolution/samples are reduced and subtle bloom is skipped. `?quality=high` preserves the previous AO/bloom settings, higher pixel limits and a 60 fps cap; that opt-in mode was not separately visually reviewed in this delivery. The hub uses a 1024 shadow map. Only the single stationary hub rover is material-batched; the articulated episode rover remains unbatched and functional.

Static far terrain uses simple vertex-colored shading, no scanned triplanar sampling, no collision and no dynamic shadows. Base ground is 58,880 triangles (old ground meshes were roughly 180,000 before props). At the comparable 1280×720 spawn view, material batching reduced total composer-frame rendering calls from 342 in the intermediate new hub to 86. This is not a measured comparison against the original graveyard frame. Final route samples report about 80 calls / 261,274 triangles across all passes, 23 geometries / 23 textures and CPU submission samples about 0.5–1 ms. CPU submission is not GPU duration; across-pass triangles are not unique scene geometry.

The native review browser reported about 30 presented fps under the 45 fps cap. No claim of guaranteed 45 fps, improved battery life, lower temperature or target-stage performance is made. Those need measurement on the user's computer under representative load. Paused scenes compose once and then stop. Hidden-document rendering is guarded by cancellation of RAF and a zero-delta resume. The IAB's additional tab remained `visible`, so true hidden-document behavior was source-inspected but not demonstrated natively in this run.

## Verification

- Production/typecheck build passes; existing large-bundle advisory remains (~706 kB main JS before compression).
- All 26 automated checks pass, including three new terrain tests: 96 raycast samples agree with the contact sampler (max error 1.97e-7 m), all 640 near/far border vertices stitch, vista triangles face upward, triangle budget is bounded, and the spirit traverses a terrain loop with a bounded leap.
- Native development browser: WASD main approach, ascent/descent, diagonal side route, bounded leap/landing, reset, collision stop at the rover, E entry, abort/return and pause/resume were observed using real controls.
- Three consecutive aborted memory visits restore `(0,-23.67)`, retain zero completions and return to 35 geometries / 23 textures on every visit. Initial hub has 23 geometries; the one-time increase after visiting the episode is retained shared asset/cache state, not evidence of continuing growth. See `cycles.json`.
- Final paused W-hold for 1.2 seconds leaves rendered frame count at 522 and position unchanged. See `pause-check.json`.
- Browser error log is empty. Full repair puzzle playthrough, production-browser playthrough, mobile rendering, long-session memory size, real GPU timing and thermal/battery measurements were not repeated for this terrain delivery.

## Evidence

`before.jpg` is the old graveyard at spawn. `after-spawn.jpg` is the final unpaused hub at the same spawn/camera. Rover placement, terrain and balanced presentation intentionally differ. `after-traversal.jpg` and `approach.jpg` show the final route/rover; `overlook.jpg` is an earlier review before the final shelf burial/batching. `hub-motion.webm` is an eight-second 30 fps canvas recording of the actual final development scene under native controls, without audio. It is a local review artifact and is not bundled into the game. `final-stats.json` retains the final route sample.

The game preview was closed and its server stopped after review to avoid leaving continuous rendering on the laptop. Final spirit art, Opportunity model selection, historical missions, mission-host/configurable-per-chapter interfaces and user visual/gameplay acceptance remain outstanding.
