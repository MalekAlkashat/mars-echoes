# Cinematic speed effects for the Mars spirit

Follow-up: the user-requested `phaser-filters-and-postfx` skill was installed and
assessed in `phaser-skill-assessment.md`. Its barrel-distortion concept is now
adapted as a restrained speed-weighted peripheral lens warp in the same pass.

Research and first implementation, 15 November 2026.

## Primary references

- [Epic: Post Process Effects](https://dev.epicgames.com/documentation/en-us/unreal-engine/post-process-effects-in-unreal-engine): lens effects, bloom, vignette, depth of field and grading are separately authored controls.
- [Three.js radial blur example](https://threejs.org/examples/webgpu_postprocessing_radial_blur.html): demonstrates radial spatial sampling, specifically for faked light shafts. It is not a ready-made racing effect and uses WebGPU; our implementation adapts the general sampling idea to the existing WebGL film shader.
- [Hybrid MBlur research](https://arxiv.org/abs/2210.06159): distinguishes real-time velocity-based motion integration from more complete shutter simulation. Our current effect is spatial peripheral blur, not physical per-object motion blur.
- Earlier direct study of The Run: `study.md`, including its speed-dependent lens and smoothed follow camera.

## Selection

| Technique | Decision for this game |
| --- | --- |
| Lens widening and camera inertia | Implement: smoothly widen 48–58°, with up to 0.55 m extra follow distance at speed. Builds a rush without modifying player input. |
| Lateral camera banking | Implement: up to 0.015 radians, eased and reset on restoration. Tiny enough to preserve the horizon and existing orbit. |
| Peripheral radial blur | Implement: four extra texture samples inside the existing film pass, weighted toward the frame edge. Central focus stays sharp. No history/velocity buffers or new pass. |
| Speed vignette | Implement: gently darken peripheral vision as speed builds; keep the existing warm Mars / cool spirit grade. |
| Bloom | Retain existing quality-controlled bloom. Avoid washing out the newly softened core or adding a full-resolution bloom pass on balanced quality. |
| Depth of field | Reserve for authored cinematics. Blurring the exploration route competes with navigation. |
| Strong RGB separation, lens dirt, handheld shake | Exclude from this pass. These suggest a damaged physical camera and distract from the ethereal protagonist. |
| Full per-object motion blur | Defer: needs a different velocity/history rendering strategy and a measured hardware budget. |

These selections are design judgments for this game, not claims that every
technique is used by the reference game or that filters alone certify AAA art.

## Wiring and safeguards

The hub derives effect intensity from resolved speed, smoothing activation and
release. The existing scene-effects contract gains optional `speed`; other
scenes default to zero. Both normal rendering and the photograph path supply it.
Scene binding clears it to avoid carrying spirit blur into a memory.

Low graphics disables the new blur/vignette. The system reduced-motion preference
disables new camera pullback, lens widening, banking and speed filters. Existing
input, orbit, renderer, frame loop, DPR and frame caps remain owned by the app.

## Verification

Build and all 84 tests pass, including speed camera collision/reset and reduced
motion. Native source preview verifies forward rush, lateral motion, lens response
and an empty error log; a near-rush sample reports FOV 57.58°, with the same 30
geometries and 32 textures. Captures are `speed-filters.jpg` and
`speed-filters-side.jpg` under `outputs/review/blue-flame-v1/`.

The current in-app-browser sample reports 30 FPS with a 45 FPS cap and render
submission around 0.7 ms. This is not a GPU timing or a matched before/after
benchmark. Additional scene textures, draw calls and targets: zero. Extra pixel
sampling still has GPU cost and must not be described as free. Native low-quality
and system-preference switching were not exercised; reduced camera motion is
covered by automated tests. Owner visual acceptance remains open.
