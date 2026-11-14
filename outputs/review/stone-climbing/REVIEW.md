# Opportunity stone-climbing review

15 November 2026. Native Three.js development-browser capture on the user's machine. Agent verification, awaiting user review of the driving feel.

## Source and scenario

Base revision `0becdacd0bf3ecfca8d836424584955f02c0a5fe`, branch `fixing_terrain`, plus uncommitted physics changes and the concurrent terrain100 work. Physics preserved existing terrain/bounds changes and did not alter terrain100 morphology, placements or materials. The terrain owner integrated its `RockSurface` interface. See `source-hashes.txt` for the reviewed modules and original capture.

The actual Opportunity model, Vehicle controller, grounding solver, scene, lighting, camera and rendering path were used. Development URL: `?scene=episode-rover-01&rocks=review&review=opportunity`. `stone-review-course.ts` adds a low 8.5 cm fixture and tall 60 cm fixture four and eight metres forward of the map spawn. Each fixture follows its local terrain slope. They are diagnostic boxes, not new map artwork. No fixture appears on the normal map; production excludes the development import.

## Behavior and appearance

- Low step: forward driving moves onto and across the fixture, raising wheel support and the chassis. At `(0,31.93)` all six contacts report supported; bounded offsets range from -0.001 to +0.005 m. Native detail capture: `low-stone.png`.
- Tall step: forward input stops the rover at `(0,29.25)`, before its tyres enter the 60 cm wall. Speed becomes zero. Native detail: `tall-stone.png`.
- Recovery: reverse input moves to `(0,30.88)` with negative wheel travel. The final eight-second recording shows low-step traversal, tall-step contact and reversing away at normal playback speed.
- Pause/resume: the rendered-frame count remains 1198 across paused observations with the same position. Resume and reverse move to `(0,31.37)`; one active application loop is retained.
- Normal map: a forward/turn/forward route without either fixture ends at `(-2.12,26.64)`, heading 0.633, with six supported tyres. `normal-terrain.png` and `normal-stats.json` record that check. This is a short route, not an exhaustive traversal of every stone.
- Console warning/error observations are empty on the fixture and normal routes.

`native-stats.json` contains the native contact/pose observations. The cube detail captures precede the final pivot-clearance hardening; the final motion capture and normal route use that hardening. Camera, terrain and lighting match; the fixture orientation was corrected to follow the local slope before the retained captures.

## Cost and limits

Static transformed rock triangles/instances bake to a 4 cm top-height cache once at setup. The normal map has 36,751 occupied columns; the fixture map has 39,695. Driving samples the cache through a wheel-radius envelope; no per-frame raycasts against the detailed rock meshes are introduced. Existing balanced display settings remain DPR 1.25 and a 45 fps cap. The normal native observation reports 45 rendered fps, 88 draw calls, 25 geometries and 32 textures; reported CPU rendering submission of 0.4 ms excludes GPU time and does not measure heat, power, total frame cost or memory bytes. Draw-call/triangle counters include the existing rendering passes.

This is a custom kinematic contact and spring-suspension approximation. It blocks oversized steps, tyre intersections while pivoting and central belly obstacles. It is not articulated rocker-bogie rigid-body physics: there is no tipping, dynamic stone movement, falling-body simulation or traversable overhang. Wheels may unload when the terrain exceeds suspension travel. Re-bake the cache if static rock transforms change. Limits are tuned gameplay values derived from wheel size, not claimed NASA specifications.

## Validation

- `npm --prefix game run build`: passed TypeScript and production bundle. Existing large shared-bundle advisory remains.
- `npm --prefix game test`: 58 passed, 0 failed, including six new stone regressions: climb, 30/60/120 Hz agreement, tall-step stop/reverse, central belly obstruction, pivot clearance/escape and transformed-instance baking/disposal.
- Native normal-speed motion: passed the controlled route above. This is development-browser evidence; the production output was built but not separately browser-played for this change.

## Evidence

- `stone-motion.webm`: original native canvas recorder, 7.96 seconds, 1,952,163 bytes.
- `stone-motion.mp4`: review copy encoded once from that original, without audio.
- `motion-strip.jpg`: four frames sampled every two seconds from the original, useful for orientation; the video is the motion evidence.
- PNG detail/normal captures are local originals; JPEG copies retain compact evidence in Git. Recordings stay local and ignored.

Only the physics review tab and port 5185 server were closed. The concurrent terrain chat's port 5181 and tab were left untouched.
