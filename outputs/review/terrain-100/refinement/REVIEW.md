# Terrain refinement — 15 November 2026

## Diagnosis and implementation

Verified active branch fixing_terrain and actual factory: both hub/layout and Opportunity drive call createHubEnvironment, which delegates to createTerrain100World. Legacy terrain is not the visible default. Preserved existing uncommitted physics and prior shelf-breakup edits; no branch/reset/clean or duplicate-file changes.

Direct reference evidence: broad asymmetric basin, connected fractured shelves, clustered multi-scale debris, partly buried stones, localized ripples and layered warm horizons. Images are uncalibrated references with unknown provenance; no historical location, elevation survey or distribution license is inferred. They were not used as runtime images.

Three corrections, in order:
1. Smooth shoulders and disconnected landmark rocks: added localized outer shelf lips, interlocking partly buried slab sections and small fragments tied to those margins. Preserved the original main/side routes, map bounds and spawn/entrance. Existing low-frequency shelf breakup remains. Added broad middle-distance ridges within the existing coarse backdrop grid. No additional terrain triangles.
2. Uniform surface response: vertex geology fields now share bedrock exposure/sand accumulation with palette, roughness and normal strength. Local sand ripples have derivative filtering; finite scanned texture sources still repeat. Rock-base dust tint now matches the terrain palette. Reduced unrelated scatter as fragments were concentrated around bedrock, keeping four instance batches.
3. Flat beige/backlit atmosphere: moved the directional sun to the forward-right, warmed the reference sky, reduced ambient fill and eased distant haze. All changes are referenceSky-only; legacy atmosphere is preserved. No quality preference, resolution, shadow-map size or post-processing change.

## Comparable native evidence

before/after-spawn.jpg are fixed default chase views at stationary `(0,36)`, heading zero. before/after-west/east/down.jpg use the same sequence of native arrow holds (Left700ms, Right1400ms, Down900ms); these are comparable orbital views, not calibrated camera matches or viewpoints located on each shelf. pass1-forms.jpg records the geometry pass before material/light refinement. after-west-approach.jpg records native rover ascent/turn/reverse near the western apron and nearby embedded rock contact.

Both measurement samples use the same development origin, 1280×720 viewport, low graphics, DPR0.8 and30fps cap. No preference was changed. Full-frame counters:

| Metric | Before | After |
| --- | ---: | ---: |
| Draw calls | 44 | 44 |
| Rendered triangles, including passes | 421254 | 415912 |
| Geometry objects | 25 | 25 |
| Textures | 26 | 26 |
| Presented fps | 30.0 | 30.0 |
| CPU render submission sample, ms | 0.50 | 0.40 |
| Cached rock contact cells | 37632 | 40896 |

The CPU values are individual samples, not a statistically established speedup or GPU time. GPU execution, thermal and battery measurements are unavailable. More contact cells are the expected setup-time cost of connected rock margins. No per-frame detailed mesh raycasts were added.

traversal.webm is an actual7.96second normal-speed canvas capture: forward drive, turn and western ascent. Further native reverse passed with all six contacts at the sampled apron position. No error logs were observed. Automated measured-wheel routes and stone/bounds tests supplement this limited native drive.

Concurrent physics edits triggered a development reload during a hub attempt. The final hub check therefore used the isolated production snapshot on5193: glide up the western approach, descend toward Opportunity, enter its memory, pause and leave, restored near the same rover entrance. hub-side-route.jpg and hub-return.jpg are production evidence. The new origin used its own existing/default graphics preference; production images are not part of the low-quality performance comparison. Browser warnings/errors were empty. Final scene paused.

## Results and limits

The terrain has more legible margins, better grouped rock breakup and clearer light direction, without a rendering-count regression at the measured view. It remains substantially simpler than the references: scan silhouettes repeat, shelf faces need finer fractures, horizon forms remain rounded, close gravel is sparse, and localized ripple orientation is still more uniform than the reference. Low-resolution softness persists by design. This is a focused refinement, not a claim of photographic reconstruction or final artistic acceptance.

Native checks did not cover a complete rover lap of both authored routes, every square edge, all newly placed rock contacts, sustained shimmer under every camera, or reload/save recovery. Those existing automated checks are not equivalent to full native visual coverage. Production traversal used the snapshot built before the other chat's subsequent controller edits; later combined tests/build are reported separately. Physics remains geometric bounded contact rather than rigid-body rollover simulation. No model articulation or historical missions were added.

Final combined verification after concurrent physics edits: **59 tests passed, 0 failed**; production build/typecheck succeeded in `work/terrain-refinement-final-build`; git diff whitespace check passed. The existing735kB bundle advisory remains. Terrain source unchanged between the native captures and final build.
