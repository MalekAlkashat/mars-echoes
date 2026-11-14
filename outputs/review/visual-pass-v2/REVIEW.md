# Rover opening visual pass review

Reviewed on 11 November 2026. The latest production build completes the opening interaction from waking through optical repair, a relay call, no response and replay. This is a functional and visual review of the opening prototype. The user's judgment of the new visual treatment is still pending.

## What changed

The orange graveyard now has more surface variation, larger landforms, a cold cloud ceiling, restrained distant light and clearer foreground-to-horizon depth. The pale six-wheel rover has more readable mechanical detail and damage. Movement uses gradual acceleration and braking, fitted terrain contact, bounded suspension and a lower follow camera. Wheel effects respond to actual travel and contact. The optical recovery uses a staged arm reach, a stable external assembly view and a keyed alignment puzzle.

These changes preserve the selected rover and environment direction. The model remains an approximate procedural enhancement of Kenney geometry; it is not the finished custom rover from the reference images.

## Saved visual evidence

- `before-opening.jpg` and `before-driving.jpg`: baseline captures before this pass.
- `after-driving.jpg`: updated world and follow view, saved at 921 by 896 pixels.
- `after-rover.jpg`: final front three-quarter rover view.
- `after-repair-driving.jpg`: driving after successful repair, with the relay objective visible. The development capture control is also visible in this frame.
- `after-mobile-repair.jpg`: repair composition and touch controls at 390 by 844 pixels.
- `after-relay.jpg`: current production relay view at 1280 by 720 pixels.
- `rover-motion-v2.webm`: a direct running-canvas motion capture, 7.92025 seconds, VP9, 2508 by 1366 pixels, approximately 29.92 recorded frames per second, 1,903,005 bytes. It contains a video stream and no audio stream. These are recording properties, not a rendering-performance benchmark.

The screenshots demonstrate framing and appearance in their saved states. The short video demonstrates motion during its captured interval; it is not a recording of the entire playthrough. The complete interaction checks below were observed separately by the primary reviewing agent in the production build.

The baseline driving image is 1280 by 720 pixels; the updated driving image is 921 by 896 pixels. Camera framing, geometry, materials and lighting intentionally changed together, so this is a broad before/after review rather than a controlled single-effect comparison. The final rover and relay views are 1280 by 720 pixels. `source-sha256.json` identifies the reviewed source and production bundle because this workspace has no Git revision.

## Runtime interaction record

| Control or sequence | Observed result |
| --- | --- |
| Wake the rover | Enters the opening drive state. |
| W A S D driving | Approaches the donor; acceleration, turning and braking are visible. |
| Donor collision | Stops stably; backing out and pivoting permit escape. |
| E near the donor | Optical scan and extraction lead to alignment. |
| Inspect module button on the narrow viewport | Starts the same scan/extract/align sequence. |
| Enter while misaligned | Produces recoverable alignment feedback; the player can adjust and retry. |
| Alignment controls | A, W and Q adjustment reaches the visible Connector aligned state. Timed inputs used for this test are not prescribed gameplay timings. |
| Insert module button | Seats the aligned component; calibration restores the optic and advances to the relay objective. |
| E near the relay | Advances through Calling mission control, Listening and No response. |
| Replay opening button | Returns to the opening drive state. |
| Escape and Pause button | Open the pause dialog. |
| Tab in the pause dialog | Moves Resume to Restart and wraps back to Resume. |
| Enter on Resume | Returns focus to the canvas and resumes driving. |
| Restart scene button and R | Reset to the starting drive state. |
| F and Optical view button | Show the degraded optical feed and reticle; the brief view automatically returns after three seconds. The button result was checked with an immediate capture. |
| Mouse drag, both directions | Orbits the camera. |
| Mouse scroll, both directions | Changes zoom visibly. |
| Arrow keys | Change the look direction; exercised during motion capture. |
| Narrow-viewport W, S, A and D buttons | Move or steer visibly and stop applying input on release. |
| Narrow-viewport Q and E buttons | Rotate the held module in opposite directions. |
| Dragging the module during repair | Visibly changes its alignment position. |

The final production run reported no browser console errors or warnings. The latest TypeScript check and production build passed. Source inspection also confirms the loading message, disabled-until-loaded start control, asset-load error message and Reload scene behavior. The asset-load failure and reload branch were not fault-injected in this review and are not claimed as runtime-tested.

## Numerical checks

All five motion/contact/camera checks pass; the full results are preserved in `motion-check-results.json`.

| Check | Result |
| --- | --- |
| Acceleration, braking and reverse | From the forward speed cap, braking distance was approximately 1.106 metres in the flat-ground test. |
| Frame-step agreement | The 30 Hz and 120 Hz simulated paths differed by approximately 0.0113 metres after the test turn. |
| Six-wheel contact and settling | Plane contact residual was at floating-point precision; extreme terrain correctly exceeded the suspension range and marked unsupported wheels. |
| Collision response | Sustained blocked input produced effectively zero chassis drift and negligible wheel-path accumulation; reverse and pivot escape passed. |
| Camera phase transitions | All checked phases had finite camera positions; the optical cut matched the physical lens position. |

The primary agent also confirmed 100 terrain-ray comparisons with a maximum discrepancy of approximately 4.2e-8 metres. Static wreck placement checks found negative minimum wheel clearances, including roadside samples near (-7, -1), of approximately -0.046, -0.031 and -0.0015 metres. All 11 checked near wrecks had some terrain intersection. This supports partially embedded static wreck placement; it is separate from the moving rover's contact solver.

## Delivery gate evidence

The following PASS results apply to the tested prototype and the evidence stated on each line. They do not imply owner acceptance, complete fault injection, every browser or stage-hardware certification. Code-inspected paths are identified explicitly.

- R-01 PASS: scene color, fog, grading and vignette support the selected orange terrain, cold sky and rover focus, as documented in `game/DESIGN.md`.
- R-02 PASS: source scan found no em dash characters in the product HTML, UI text source or stylesheet.
- R-03 PASS: desktop and 390 by 844 repair layouts were observed without overflow; touch buttons use at least 44-pixel height and were exercised.
- R-04 PASS: controls use text and relevant keyboard glyphs; no decorative generic feature-icon set is present.
- R-05 PASS: composition is a live game view with objective, interaction and repair states, rather than a template landing page.
- R-06 PASS: system sans-serif text is chosen for short, stage-readable instructions; its reason is recorded in DESIGN.
- R-07 PASS: ground detail and optical reticles serve terrain and instrument feedback; no decorative page grid is used.
- R-08 PASS: arrows label actual look controls; they are not decorative call-to-action ornaments.
- R-09 PASS: visible labels describe chapter, optic and repair state; no promotional capsule badges are present.
- R-10 PASS: stylesheet inspection finds no backdrop-filter treatment across panels.
- R-11 PASS: square mechanical controls use restrained one- or two-pixel corner radii rather than pill styling.
- R-12 PASS: scene shadows establish ground contact and direction; the UI does not apply floating shadows to every component.
- R-13 PASS: scene highlights serve optics and distant light; controls and panels are not covered with glow effects.
- R-14 PASS: there is no repeated feature-card layout.
- R-15 PASS: actions are specific: Wake the rover, Inspect module, Insert module, Call mission control, Resume driving, Restart scene and Replay opening.
- R-16 PASS: product text describes the rover's current action and state without promotional AI buzzwords.
- R-17 PASS: displayed distances come from game positions; no invented popularity or performance statistics appear.
- R-18 PASS: no testimonials, review identities or social-proof claims appear.
- R-19 PASS: camera cuts, suspension, wheel motion, arm movement and calibration serve gameplay and match the stated motion direction.
- R-20 PASS: orange terrain, gray sky, pale twin-optic rover and discarded-machine silhouettes trace directly to the user's selected direction.
- R-21 PASS: fixed scene lighting preserves the narrative art direction; DESIGN records why a website theme switch is not part of this game.
- R-22 PASS: imagery is the actual game scene and explicitly identified prototype assets, with a direct relationship to the rover story.
- R-23 PASS: rover and environment direction came from the user; the intro explicitly labels test models and the pending custom rover/sound work.
- R-24 PASS: no navigation links point to unimplemented pages or sections.
- R-25 PASS: enabled-text source combinations checked against bright worst-case backing gave ratios from 6.64:1 to 11.57:1; the start-button combination was 8.49:1. Disabled controls are excluded from this text-contrast check.
- R-26 PASS: normal-flow interactive controls were exercised as listed above; load-error reload wiring was inspected in source and is not claimed as fault-tested.
- R-27 PASS: source contains pre-load/loading, ready, repair-rejection and asset-error/reload states; normal loading and repair rejection were observed at runtime.
- R-28 PASS: no generic FAQ is present.
- R-29 PASS: orange terrain and a restrained warm interaction accent sit within pale and cold neutral materials; DESIGN records the palette.
- R-30 PASS: the scene retains the user's rover graveyard direction; the racing reference informed rendering and response principles rather than copied artwork or interface.
- R-31 PASS: DESIGN records reasons for palette, composition, typography, camera, scene motion, reticles and interface placement.
- R-32 PASS: native buttons and a focusable canvas retain visible focus outlines; the pause focus cycle, Enter resume and keyboard game controls were observed.
- R-33 PASS: features are implemented in their TypeScript/CSS sources and built by Vite; no runtime source-rewriting feature is required.
- R-34 PASS: no theme toggle or unverified alternate theme is shipped.
- R-35 PASS: the production build was run through the opening, invalid and valid repair, relay, replay, pause/reset, camera and touch controls; the table records each observed action. The separate asset-error branch remains code-inspected.
- R-36 PASS: no unsupported customer, security, compliance or real-time-performance claims are made; recording metadata is explicitly distinguished from a benchmark.
- R-37 PASS: the user-supplied direction and ENERGY 1 / RHYTHM 2 / MOTION 3 are recorded in DESIGN before this visual pass.
- R-38 PASS: the narrative is intentionally fictional, prototype asset status is visible, and test results are separated from future plans.

## Liveliness and craftsmanship

- Dials PASS: ENERGY 1 / RHYTHM 2 / MOTION 3 are explicit in DESIGN and correspond to a restrained scene with purposeful mechanical motion and camera changes.
- Focal point PASS: the rover dominates exploration, the keyed socket anchors assembly, and the call state redirects attention to the relay outcome.
- Space PASS: the world remains the primary composition; interface elements occupy objective, control and assembly locations rather than filling unused space.
- Accent PASS: a restrained warm accent identifies current interaction and alignment state.
- Motif PASS: twin optics, keyed connectors and fine instrument framing repeat the machine identity.
- Design Read PASS: the documented opening identifies a grounded cinematic stage demonstration for this narrative rover game.
- C-1 PASS: the major visual and interaction decisions have reasons in DESIGN and the accepted plan.
- C-2 PASS: normal-flow controls produce observed actions; the source-only error path is disclosed above.
- C-3 PASS: each visible interface region supports the current game state or its controls.
- C-4 PASS: the reviewed desktop and narrow layouts, keyboard pause flow and touch controls function in the checked build; this is not an all-device certification.
- C-5 PASS: claims are tied to source inspection, recorded tests or primary-agent runtime observations, with limitations retained.

## Remaining work and acceptance

The prototype is silent. The custom rover, final environmental assets and complete story remain unfinished. Terrain contact is a geometric height fit with bounded suspension and circle collision proxies, not a rigid-body vehicle simulation. The short capture is not a performance benchmark. The user's visual judgment of this pass and testing on the actual stage machine remain pending.
