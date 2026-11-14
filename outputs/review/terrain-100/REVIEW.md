# Reference terrain 100: native review

15 November 2026. Branch `fixing_terrain`; changes are local, not pushed. Source files at capture/review are hashed in `source-hashes.json`. Concurrent physics changes are included in this snapshot; ownership/coordination is recorded in `outputs/planning/physics-terrain-handoff.md`. Existing cloud-sync duplicate files were left untouched.

## Result and composition

The default hub and actual Opportunity driving preview now share an authored 100 × 100 metre basin. Broad sandy passage, a low western shelf, higher eastern headland, localized weathering, warm haze and low distant silhouettes follow the three supplied references. A coherent field controls shape, exposed ground and fragment placement. There is no global sinusoidal dune pattern, added rover graveyard or extra rendering loop. Fine scanned texture detail is world projected and warped across channels; it still reuses finite texture sources and is not literally unique at every point.

The 100 m playable square is visually extended by a non-playable backdrop to 700 m. Near ground is 80,000 triangles and the stitched backdrop 8,000. Rock anchors/debris share four instance batches. Rectangular bounds preserve wheel/body margins; restored spirit bookmarks are clamped and regrounded. Legacy terrain and the fictional repair episode are retained.

## Physics verification

The 0.5 m triangle grid is used for rendering and wheel heights. One hundred deterministic raycasts agree with contact to 1.25e-14 m, and all 800 near/far seam vertices agree. Actual measured Opportunity wheel centres/radius traverse both authored terrain-only routes at 30 and 60 Hz with all six contacts. Largest gap: 1.39e-6 m; maximum side-route chassis tilt: 0.281 rad. Route checks deliberately omit rocks; these numbers describe terrain contact, not every obstacle arrangement.

The physics chat's setup-baked 4 cm rock top surface is built from the actual transformed instances before world readiness. Rover low-rock traversal, tall-step obstruction, belly clearance, pivot clearance, frame-rate consistency and reverse recovery have dedicated tests. Spirit and camera retain their solid rock navigation proxies. This is the existing bounded geometric suspension/clearance approximation, not a rigid-body vehicle or rollover simulation.

`npm --prefix game test`: **58 passed, 0 failed**. Production/typecheck command: `npm --prefix game run build -- --outDir ../work/terrain-100-production --emptyOutDir` succeeds. Vite retains its advisory about the existing 735 kB main chunk. Isolated output avoids concurrent writes to `game/dist` by the physics chat.

## Native scenario and evidence

Development browser, actual WebGL game path at `http://127.0.0.1:5181/?scene=episode-rover-01&review=terrain`. Native screenshot size 1280 × 720. Existing low graphics preference was preserved: DPR 0.8, 30 fps cap. No model/background substitution was used for captures.

1. Start Opportunity; record normal-speed W driving, W+A turn and W ascent. Reverse with S; toggle F optical view and return to chase. Wheels remain visually grounded on the tested shallow route, the chassis follows grades, dust originates at moving tyres, and steering is responsive. `terrain-motion.webm` is the original 7.96 s canvas-only capture (local, ignored by Git); `motion-contact-sheet.jpg` samples 0/2/4/6 seconds. `rover.jpg` is a native full-page still after that drive.
2. Pause and Leave memory. Start hub at `(0,36)`, cross the central passage with W, approach Opportunity, enter with E. Leave again via the pause menu. Hub restores the approach bookmark `(0,-23.32)`, grounded, with one active loop. `hub.jpg` shows the approach with the placeholder spirit.
3. Fresh-tab browser warning/error logs are empty. Paused at the end of review to stop active scene composition. An earlier dev-server config restart caused a stale-tab connection reset; review continued in a fresh tab, not through a browser security bypass.

`runtime.json` records a stationary post-drive sample: 44 draw calls, 416,500 rendered triangles across passes, 25 geometries, 26 textures, 36,751 cached rock contact cells, all six wheel contacts, approximately 30 fps at the selected cap. Render CPU submission was about 0.5 ms; this is not GPU frame time, battery usage or laptop thermal evidence. Shared paused-render behavior and graphics settings were preserved.

## Limits and visual judgment

The result reads as a restrained orange sandy basin with clear rolling slopes and sparse rocky landmarks. It is a procedural interpretation of the references, not their photographic reconstruction. Close detail, sharper geological shelf breakup and rock-to-sand blending remain candidates for owner review. No claim of a masterpiece or final artistic acceptance is made.

Optical view toggles correctly, but the existing source-model/camera combination can show part of the rover at the edge of the feed; this terrain pass does not resolve model-specific optical camera clipping. Full square-edge driving is covered by automated controller checks rather than a native lap of every edge. Native side-route traversal, full production-browser QA, thermal measurement and historical mission integration were not performed in this terrain review. The source model still has no final articulated mast/arm.
