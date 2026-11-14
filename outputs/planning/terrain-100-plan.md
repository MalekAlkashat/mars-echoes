# Authored 100 × 100 metre terrain

15 November 2026. User-selected branch: `fixing_terrain`. Primary art direction: the three user-supplied images retained under `outputs/references/terrain-100/`. They take precedence over the earlier storm-gray hub direction for this pass. Image origin is not assumed; these are private production references, not licensed runtime textures. No reference image is included in the game build.

## Composition

A broad orange sandy trough winds north through an asymmetric basin. The western shelf is low and broken; an eastern headland carries the largest mass. Warm dusty haze, restrained sun and layered low horizons follow reference 1. The sand/bedrock/fragment distribution follows reference 2. The opposing shelves and broad passage follow reference 3. Preserve quiet open ground: no canyon walls everywhere, no rover graveyard, no field-wide corrugation and no distracting effects.

The playable/contact terrain is exactly x,z ∈ [-50,50] metres. One 0.5 m heightfield grid owns rendered triangles and rover wheel sampling. A stitched coarse horizon is decorative only and does not extend physics beyond the 100 m square. Explicit rectangular bounds apply to both controllers, leaving room for the rover footprint.

Authored main route: `(0,36) → (5,22) → (-3,5) → (0,-12) → (0,-25) → (10,-39)`. Alternate climbing route: `(0,36) → (-14,24) → (-17,7) → (-14,-10) → (-10,-25) → (0,-25)`. These are gameplay routes, not claims about Opportunity's historical path. The sole memory rover keeps its stable ID at `(0,-25)`.

## Shared field contract

World metres → west shelf / east headland / back shelf / saddle / winding sediment channel → bedrock exposure, deposited-sand patch → height, palette, detail strength and rock distribution. Geometry gets low-frequency forms and centimetre-level local weathering; existing texture-backed PBR maps supply fine mineral detail. No moss, wetness, oceans or dynamic granular simulation is added. No raster asset generation or paid service is used.

Large scanned rock-kit anchors sit off the main routes. Their proxies remain solid for spirit/camera navigation. Rover wheels use the setup-baked transformed rock surfaces, allowing low-rock traversal while stopping at oversized steps and belly obstruction; tiny fragments add visual detail and only affect contact when they resolve in the contact grid. Fixed-seed instance placement is weighted by exposed ground and excluded from the clear channel. Shapes/materials remain shared, and the horizon receives no collision or dynamic shadows.

## Contact and scope

Use the existing measured six-wheel Opportunity contact solver, bounded suspension, drive response and frame-rate-independent update. This remains geometric terrain contact, not a new full rigid-body engine or a rollover simulation. Test actual wheel geometry over ascent, descent and cross-slopes, round-trip driving and obstacle/boundary recovery. Pause/save/return continue through existing scene contracts. Existing spirit bookmarks are regrounded on the new terrain instead of restoring an obsolete absolute elevation.

## Acceptance

Verify exact dimensions and stitched borders; compare ground raycasts with contact sampling; verify route grades, finite/bounded suspension and wheel gaps; test both square-edge and rock collision; inspect native rover motion, camera, palette and material repetition. Preserve balanced graphics budgets and record draw calls/triangles at a fixed viewport. Do not call the result a masterpiece based on tests alone; final artistic acceptance belongs to the user.

## Implemented and checked

The default hub and Opportunity preview now use this world. Ground: 80,000 triangles; stitched backdrop: 8,000. Rock geometry is shared across four instance batches. Both authored terrain-only rover routes keep six contacts at 30/60 Hz; maximum side-route wheel gap is below 0.000002 m and maximum chassis tilt is 0.281 rad. These route checks exclude rock obstacles; dedicated stone tests and native driving supplement them. Full combined suite: 58 passing checks. Build/typecheck succeeds into an isolated output folder to avoid the other chat's production build. Native driving, optical toggle, pause, hub traversal and memory entry/return pass; see `outputs/review/terrain-100/REVIEW.md` for remaining visual limits and evidence.

### Focused reference refinement, 15 November 2026

Extended the existing100m terrain with broken outer shelf lips, connected buried bedrock sections and margin-weighted fragments. Geology attributes now couple sediment/exposure to color, roughness and normal strength; localized derivative-filtered sand ripples remain material-only. Warm forward-right sunlight and middle-distance forms improve separation without changing graphics budgets. Map dimensions, routes, spawn and entrance remain unchanged. Native comparisons, performance and explicit remaining discrepancies: `outputs/review/terrain-100/refinement/REVIEW.md`. Final artistic acceptance remains open.
