# Opportunity model and motion integration

14 November 2026. User supplied `24883_MER_static.usdz` and selected it to replace the placeholder. This review follows the Mars hub pass and prior local planning changes; it is not owner acceptance of the final game's art or physics.

## Implemented

The exact supplied USDZ is preserved in `assets/vendor/nasa/opportunity/`. It matches the official NASA VTAD MER USDZ by SHA256. A reproducible local OpenUSD conversion exports the original 31,450 triangles, nine materials and all 12 JPEG maps into a 3.50 MB GLB, with no alternate asset substitution, decimation or invented facial parts. Source units are centimetres; runtime uses metres, +Y up and -Z forward. Provenance, hashes, measured pivots, component analysis and converter are retained with the source. Browser appearance was checked in the game, separately from file validation.

The six wheels are split from the source's material-combined suspension by welded connectivity, including the outer circular caps. Each wheel has a steering carrier and an X-axis spin group at its measured axle centre. The existing vehicle/contact system now accepts model-specific wheel centres, radius, suspension travel and chassis footprint; old prototype defaults remain unchanged. Real imported wheels use roughly 0.1307 m radii, rather than the old 0.266 m. Per-wheel signed contact displacement drives roll, including reverse and differential travel during turning. No second automatic spin path is used.

Wheel vertical motion is bounded to 65 mm. A scene-owned clone of the original suspension geometry blends small axle-end offsets into fixed inboard/upper anchors so the links stay attached. This is a nonrigid visual approximation around the existing spring-contact solver, not authentic rigid rocker-bogie kinematics. Source arm/mast parts remain static because the asset contains no genuine joint hierarchy. The optical camera is an authored mast-relative viewpoint, not a recovered/calibrated camera from the source. No fake repair socket or arm was added to the real model.

The hub now displays and grounds the imported rover, then batches it as a stationary model. Normal `episode-rover-01` enters Opportunity's drive preview using the shared Mars environment, Vehicle, camera, dust/tracks, input, pause and lifecycle. It has no completed historical objective yet, so leaving returns an aborted result and cannot award story completion. The earlier fictional optical-repair scene remains explicitly available at `?scene=episode-rover-01&prototype=repair`. It is not Opportunity history. Historical chapter implementation remains future work.

## Verification

- Production build/typecheck and all **33 automated checks pass**. Existing large main-bundle advisory remains.
- New configuration tests exercise non-default axle positions, collision footprint/boundary, cloned/validated contact config and legacy defaults.
- Four rig tests use actual GLB vertex/index data and pivots: spinning/steering does not orbit axle centres, one metre of travel uses each measured radius, reverse/idle/reset behave correctly, axles follow a test slope within 1 mm, and deformation never mutates shared cached geometry.
- Native compiled production preview at port 5181: hub approach and collision at the new model, E entry, direct driving, forward/turn/reverse, optical F view, pause, leave to the same hub position and re-entry pass. Front/side appearance, materials and ground pose were inspected. The user's existing production preview was left paused; its server was not restarted or stopped.
- Native development preview at 5180: all six contacts report `111111` through forward, turning and reversing samples. Wheel angles advance negatively forward, separate by turning path, reverse back positively and reset to zero. Root position resets to `(0,8)`. See `motion-samples.json`.
- Representative dev samples: 88–92 total composer calls, 22 geometries, 32 textures, about 277k triangles across passes; 45 fps under the balanced cap and CPU submission samples 0.4–0.6 ms. These are narrow native browser samples, not a thermal/battery or guaranteed hardware-performance benchmark.
- Paused W-hold leaves rendered frame count and position unchanged; see `pause.json`. Browser error logs were empty in both checked previews.
- The preserved repair preview loads and drives; its entire repair puzzle was not replayed for this asset integration.

`production-rover.jpg` is the actual compiled game, with an orbit to show the supplied rover. `rover.jpg` and the eight-second `opportunity-motion.webm` are actual development-runtime captures with native controls; the video includes forward movement and turning. Video is retained locally rather than shipped as a runtime asset. No sound quality, final user art acceptance, complete historical missions, full mechanical arm/mast animation or long-session leak/thermal certification is claimed.

Only the temporary development server started for review was stopped. The user's pre-existing production server on 5181 remains available, with the game paused to avoid continuous rendering.
