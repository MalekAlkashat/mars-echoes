# Mission I: photographic evidence

15 November 2026. Local implementation on `fixing_terrain`, started from `dca84e4`. Concurrent commit `4402b58` updated roadmap documents during the work; those additions are preserved. This is an agent runtime review, not owner visual acceptance. The user subsequently authorized merging and pushing this implementation to main.

## Picture-first revision

School-learner wording reduced to short prompts. Dedicated photo holds replace the panel for the first six phase-seconds (after the existing reveal threshold); the final photo remains centered without the reflection paragraph. Detailed metadata is expandable. Continue/Pause use existing chapter actions. The older side-by-side closing captures below describe the first pass, superseded by `picture-first.jpg`. A fresh native development playthrough checked the reduced prompts, comparison, water interpretation and centered final archive; final image and Return/Pause controls were visually inspected. The closing letterbox overlap was fixed with explicit stacking. Earlier mobile captures are historical; this refinement has not had a fresh mobile visual pass.

## Presentation

The current integrated Mission II sequence, rather than the older isolated Purgatory prototype, supplies the presentation reference: contextual actual-image reveal and a closing dissolve from reconstruction to historical evidence.

- McKittrick PIA05459 appears in `inspect` only after withdrawal is complete and phase time exceeds 0.9 s. Opacity follows scene time over 1.1 s. The tool takes visual priority during brushing/grinding. The date identifies the grinding event, not an independently established photo capture date.
- Berry Bowl PIA05634 appears in both comparison steps. Copy distinguishes a different, brushed target and instrument-derived mineral identification. The original full photograph remains uncropped in each view.
- No photo appears during the ancient-water reconstruction. At `evidence`, after the return to the dry state, Berry Bowl dissolves into a larger archive composition. This reprise begins after 0.35 s and resolves over 1.1 s. The player can proceed without a forced wait.
- The same figure is reused; images load when their stage first needs them. Closing presentation uses a solid dark backdrop, restrained letterbox and adjacent reflection. On narrow screens, photo and reflection stack. There are no new Three.js render passes, textures, dependencies or global listeners.
- Source links include image IDs, credits, instrument/color context and source pages. Enter activation stays local to the link; the closing Pause button routes the existing pause action. Failed media has an explicit unavailable label and retains its source link; this error path was code-reviewed, not fault-injected in the browser.

## Verification performed

- Final TypeScript/Vite production build passes. All **115 automated checks pass**, including four new archive tests for stage timing/exclusion, target context, deterministic bounded scene-clock opacity and source integrity/native dimensions. The existing renderer chunk-size advisory remains.
- Actual development-browser playthrough at `http://127.0.0.1:5195/?scene=episode-rover-01&mission=blueberry-clue`: physical WASD approach, brushing, fresh E-hold grinding, tool withdrawal, McKittrick reveal, both Berry Bowl comparisons, normal-time ancient-water sequence and closing archive view. No photos appeared during tool operation or the inferred-water scene.
- Desktop 1280×720 and narrow 390×844 layouts were checked. Full image aspect ratios are retained with `object-fit:contain`; no horizontal document overflow at 390 px. The contextual mobile card kept the specimen visible above it and the continuation button reachable. Closing Pause was clicked successfully on the narrow layout.
- Pause in `inspect` hides the archive; Resume restores McKittrick in the same stage. Restart from the closing Pause menu restores the opening, with the single archive node hidden and closing panel styling cleared. Leaving the memory returns to the Mars hub and removes all archive and discovery-panel DOM nodes (counts 0/0).
- Browser log inspection showed no error entries in the retrieved warning/error results. Three.js undefined map/normalMap/roughnessMap/aoMap warnings were present across reloads; the archive uses DOM images and does not alter those materials. No GPU-time, thermal or stage-hardware claim is made.

## Evidence

Final-version desktop captures: `abrasion-desktop.jpg`, `comparison-desktop.jpg`, `closing-desktop.jpg`. Final closing narrow capture: `closing-mobile.jpg`. Earlier captures in this folder precede the final Pause control/opaque-backdrop refinement and are retained as intermediate study evidence, not final comparisons. Screenshots demonstrate composition; scene-clock tests and the observed normal-speed playthrough provide the separate timing evidence.

Runtime originals, hashes and metadata are under `game/public/assets/missions/blueberry-clue/v1/source-records.json`; provenance is appended to that folder's existing `SOURCE.md`. The two photos total 216,310 bytes and match the retained source manifests byte-for-byte.

Owner aesthetic acceptance, actual device performance and a fresh production-browser playthrough remain open. Existing chapter rewards/checkpoint contracts are unchanged; this review does not recertify the entire campaign.

## Camera handoff fix

The macro camera previously smoothed position but applied the next shot target immediately with lookAt. Tool withdrawal changes target height by 4 cm in a centimetre-scale shot, producing a viewing-ray snap. MacroCamera now damps position and gaze with the same exponential response. Initial/reduced-motion framing remains direct. Build and all 117 checks pass, including continuous withdrawal, exact pause pose, 30/60/120 Hz agreement and an unchanged end pose. The live browser changed scenes during the attempted final motion replay, so that visual check is inconclusive; no new owner visual acceptance is claimed.

Integration: merged remote `0e5fd80`, preserving the continuous journey/journal/ending and concise Mission I copy. Archive continuation now uses the existing chapter button label so journey mode advances to Purgatory. Combined build and all 141 tests pass. An untracked legacy duplicate `game/src/ui/main-menu 2.ts` was preserved at `work/local-duplicates/main-menu 2.ts` because its obsolete skills import blocked typechecking after the remote removed that module.
