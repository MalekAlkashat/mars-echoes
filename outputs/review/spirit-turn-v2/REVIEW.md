# Spirit turn and reversal study

15 November 2026. Native source preview, production hub path. Agent review;
owner aesthetic acceptance remains open.

## What the screenshots revealed

The previous trail was a broad, nearly straight ribbon. During a full reversal,
the body turned toward the new velocity while the old stroke stayed on the
opposite side. The result was a beam crossing the soul, followed by a small
folded bulb. Smoothing adjacent ribbon normals alone did not resolve this.
See `before-08.jpg` and `before-13.jpg`.

Additional source defects: filament coordinates were normalized by individual
sample lifetime, changing their spatial scale during acceleration/braking;
the head frame was rebuilt from the camera; a thick ribbon was extruded around
tight corners without narrowing.

## Implemented design

- Limit the flame body's angular response to 4.5 rad/s, with eased convergence.
  Only appearance changes; controller movement remains unchanged.
- Gather the envelope around the soul when its visual direction differs sharply
  from travel, and unfurl as it aligns again.
- Smooth world-space samples with a short symmetric kernel. A cubic tangent
  collar connects the core to the recorded path over the newest eight samples.
- Feather the collar's width and opacity; reduce width at high curvature.
- Keep an eased head frame across time and propagate its orientation along the
  ribbon, including near view-aligned or stationary segments.
- Dissolve old portions that move ahead of the new travel direction, blended by
  resolved speed. This removes the crossing beam without abruptly clearing history.
- Use distance along the rendered curve for filament coordinates; lifetime
  controls fading rather than texture scale.

The result is a softer stroke joining the soul, with old energy dissolving as
the new stroke emerges. The soft core and velocity-dependent pulse are retained.

## Evidence and checks

Before and final captures use the same fresh hub start and native input recipe:
Shift+D for 1200 ms, followed by Shift+A for 1100 ms. Fourteen screenshots were
captured during each reversal. These are native frames, not retouched art.
Frames are representative phases, not exact frame-aligned timing or a thermal
benchmark. `after-*` is an intermediate attempt; `final-*` is the shipped revision.

Final frame `final-08.jpg` shows the old forward-side stroke dissolved while the
new wake forms; `final-13.jpg` shows it extended behind the new direction.
`corner.jpg` follows a forward/right turn. Native error log is empty.

Build and all **86 tests pass**, including continuity near view-aligned motion,
old-wake suppression ahead of a reversing soul, retention of the new stroke,
pause/reset/fade, fixed-time history, collision and camera tests. Scene resources,
draw count and render-target count are unchanged. Added CPU work is bounded by
the existing 64-sample buffer; no per-frame object allocation is introduced by
the curve construction. A matched CPU/GPU cost benchmark was not performed.
