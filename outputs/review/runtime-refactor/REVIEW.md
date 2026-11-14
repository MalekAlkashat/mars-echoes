# Runtime organization and transition review

Reviewed 14 November 2026. Source baseline: `rover-v2-baseline`, commit `179705b`. The integrator will commit this checked refactor and create release tag `runtime-foundation` after the review is saved. This report distinguishes implemented code, automated checks, the primary agent's native browser observations, and unfinished game content.

## Outcome

The former flat rover runtime is separated into application orchestration, shared input/rendering/assets, Mars environment code, rover and spirit entities, a Mars hub, and an isolated rover episode. A small humanoid spirit placeholder and entry/return route exercise the new contract. The preserved rover repair and unanswered-call sequence now runs as the equipment episode.

This is an integration foundation, not the complete selected game. The original rover assignment remains undecided. The full past mission, cinematic time jumps, abandonment-to-shutdown arc, final spirit art and sound are not implemented by this refactor. A completed prototype sequence is not evidence that those story requirements are complete. Owner acceptance of the spirit appearance and gameplay remains pending.

## Actual source ownership

| Location | Responsibility | Contributor boundary |
| --- | --- | --- |
| `game/src/main.ts` | Bootstrap and preview selection | Integrator |
| `game/src/app/` | Game lifetime, typed contracts, scene registry/director and session | Integrator |
| `game/src/core/` | Input, renderer/composer, shared asset cache and development capture | Integrator |
| `game/src/ui/` | Shared loading, pause, return and recovery presentation | Integrator |
| `game/src/entities/spirit/` | Movement, replaceable placeholder appearance and camera | Spirit/hub author |
| `game/src/scenes/mars-hub/` | Mars exploration scene, enterable wreck and layout | Spirit/hub author |
| `game/src/scenes/episodes/rover/` | Rover episode, local mission progression, layout and HUD | Equipment-episode author |
| `game/src/entities/rover/` | Shared rover rig, materials, controller, grounding, camera and wheel effects | Coordinate shared changes with integrator |
| `game/src/environments/mars/` | Reusable terrain, atmosphere, materials, dressing and disposal | Shared environment owner/integrator |
| `game/src/content/equipment.ts` | Stable wreck-to-episode registration | Integrator, following scene/asset handoff |
| `game/public/assets/` and `assets/` | Existing local runtime assets and preserved originals | Assigned asset contributor |

The new code uses the existing runtime asset paths rather than relocating reviewed binaries during the runtime extraction. No paid asset generation or new final character/model is claimed.

## Lifecycle and resource ownership

The application owns the renderer/composer and one requestAnimationFrame chain. Input and application lifecycle handlers use application-owned AbortControllers rather than scene-created global listeners. Scenes expose activation, update, resize, pause, restart, disposal and debug state. Destination preparation is inert; presentation is rebound only for activation. The old scene is retained until the destination activates successfully.

The director locks overlapping transitions, rejects prepared/retired scene callbacks, cancels stale loads and disposes orphaned results. Retry retains the failed request, including the hub bookmark and the episode's completion/abort result. Completion is recorded only after a successful return; aborted visits do not increment it. Input is cleared at pause, restart and transition boundaries.

Scene geometry, local materials/textures, instance resources, shadows and environment render targets are retired through scene disposal. The shared asset cache owns GLB source geometry/textures, and cached surface/rover textures remain cache-owned until application shutdown. This avoids disposing a texture still referenced by a new scene. The observed stable renderer counts below support this behavior for the tested route; they do not prove absence of every heap or driver leak.

## Automated verification

`npm --prefix game test` passes all **23 tests**:

| Suite | Count | Coverage |
| --- | --- | --- |
| `scene-director.test.ts` | 14 | Ten visits, completion versus abort, invalid source/result, load and activation failure, failed return, overlapping requests, cancellation and late results, stale callbacks, active callbacks, restart, shutdown, and retry preserving bookmark/completion semantics. |
| `rover-motion.test.ts` | 4 | Progressive acceleration, braking/reverse, 30/120 Hz route agreement, six-wheel sloped contact and bounded suspension travel, stable collision stop, negligible blocked wheel travel, reverse and pivot escape. |
| `spirit-motion.test.ts` | 5 | Camera-relative movement, normalized diagonals, 30/60/120 Hz route agreement, solid collision while airborne, reverse escape, bounded leap/landing, no automatic repeated leap, pause/time guards, reset and map boundary. |

The rover regression measurements remain approximately 1.105667 m braking distance and 0.011315 m path difference at 30 versus 120 Hz. Settled wheel contact residual is at floating-point precision. Blocked chassis drift and wheel-path accumulation remain negligible in the flat-ground obstacle scenario. These are narrow simulation checks, not a claim of full rigid-body rover dynamics.

The primary agent reports the latest production/typecheck build passes with **54 transformed modules**. The main output is `index-D-D3x8aY.js`, about **704.96 kB before compression**, with separate scene/environment chunks. The existing large-chunk advisory remains; this is a build result rather than a stage-machine performance benchmark.

## Native development-browser verification

The following were observed by the primary agent through the actual running browser game, separately from the Node tests:

| Scenario | Observed result |
| --- | --- |
| Hub to rover episode | The designated wreck enters the isolated rover sequence through the real scene director. |
| Failed insertion | Enter while misaligned produces recoverable feedback; adjustment remains possible. |
| Successful repair | Alignment, insertion and calibration restore the optical channel and advance to the relay objective. |
| Relay call | The sequence reaches No response through the preserved call behavior. |
| Return after the completed sequence | Control returns to the hub; completion count becomes one. |
| Ten further aborted visits | Every visit returns to the hub; completion remains one and no browser errors are reported. |
| Injected episode load failure | Using development-only `?fail-once=episode-rover-01` shows recovery UI. Holding W for 900 ms while that dialog is visible leaves the hub position at 3.47, confirming gameplay is blocked behind the dialog. |
| Retry after that failure | Retry enters the episode; aborting returns to the original 3.47 bookmark. |
| Cancel after a fresh failed episode entry | Cancel restores the controllable hub. |

`browser-cycles.json` preserves the ten returned-hub snapshots. Each records hub position `0.00,2.33`, completion count `1`, **134 renderer geometries** and **34 renderer textures**, with no transition or pause left active. Resource counts remain unchanged across all ten snapshots. The dataset's `activeLoops: 1` field reflects the application instrumentation; it is not an independent browser scheduler measurement. Single-loop ownership is additionally supported by the source organization. Episode-specific fields retained in the canvas dataset are not used as evidence of hub behavior.

`hub-return.jpg` is a native capture of the restored hub and its placeholder protagonist. It shows the implemented integration scene, not a generated concept or an approved final spirit design. It is not a controlled before/after art comparison or a normal-speed motion recording.

The first initial-load Retry attempt was closed before its result could be observed, so that attempt was not counted. A later native retest completed: Reload scene reloaded the failed initial view, Retry progressed through Preparing, and the Explore Mars ready screen was observed. Initial-load recovery is therefore verified by the later native observation as well as the automated director test. No sound-quality review is claimed because this prototype remains silent.

## UI and design review delta

The prior visual review and its rule matrix are preserved in `outputs/review/visual-pass-v2/REVIEW.md`. They are historical baseline evidence, not blanket approval of the new controls or layout. This refactor retains the selected orange/cold-gray scene direction, existing text palette, mechanical square controls and the stated ENERGY 1 / RHYTHM 2 / MOTION 3 direction in `game/DESIGN.md`.

The relevant delta checks are:

- Function and recovery: native entry, repair, successful return, repeated abort, failed-entry Retry and Cancel are observed. Node tests cover additional cancellation and rollback paths. The later initial-load Reload/Retry retest reached the ready screen.
- Input blocking: the failed-load dialog prevents underlying movement in the observed W-hold scenario. Shared focus trapping and visible focus outlines are present in source; the final production/mobile observations below verify the hub pause focus cycle.
- Purpose and copy: new text names actual actions such as entering memory, retrying loading and returning to Mars. The spirit is visibly identified as a placeholder and the complete rover mission as in development. No fabricated popularity, performance or security claims, promotional badges, logo, icons or testimonials are introduced.
- Palette and contrast continuity: existing charcoal backing and pale text/accent colors remain in use. The baseline report records its contrast calculation; this refactor does not claim a new independent full-screen contrast measurement.
- Shape and touch targets: shared buttons retain the stylesheet's minimum 44-pixel height and visible focus outline. The final 390 by 844 check observed no horizontal overflow, measured visible buttons at least 44 pixels tall, and confirmed the leap control is separate from the D-pad and entry control.
- Theme and motion: there is no new theme toggle or decorative UI animation. Loading/return views and the placeholder movement serve actual game state; scene effects remain part of the selected art direction.
- Source implementation: the separation is implemented in TypeScript/CSS modules, without a runtime source-rewriting script or a second showcase game path.

The following final observations close the checked production and narrow-viewport paths for this integration delivery. They do not establish final spirit art, complete story content or acceptance on the unknown stage computer.

## Final production and narrow-viewport observations

The primary agent completed the compiled production build at local port 5181 using native browser interactions:

| Control or scenario | Observed production result |
| --- | --- |
| Complete equipment sequence | Inspection, failed insertion button attempt, recoverable adjustment, aligned insertion, calibration, relay call, No response and Return to Mars all pass. |
| Standalone episode preview | `?scene=episode-rover-01` runs the same full sequence. Replay resets it, rather than creating a second scene or duplicate handlers. |
| Optical control | Both the Optical view button and F show the brief optical view. |
| Camera input | Native dragging visibly orbits; scrolling visibly changes camera distance. |
| R reset | Resets the episode through the shared input/application path. |
| Six touch repair controls | At 390 by 844, W/A/S/D positioning and Q/E rotation buttons work, alignment remains readable, and insertion completes. |
| Spirit Leap button | The narrow-screen Leap button visibly initiates a bounded jump. |
| Hub pause and keyboard focus | Pause opens the dialog; Tab cycles Resume to Restart and back to Resume; Enter resumes. |
| Hub Restart | Returns to the starting state, with the wreck distance back to 8 m. |
| Narrow layout | `scrollWidth` and `innerWidth` both measure 390 pixels; visible buttons are at least 44 pixels tall. The Leap rectangle spans x 18–89, y 675–720 and is separate from both D-pad and entry control. |
| Final browser logs | No errors or warnings are reported. |

Saved native captures:

- `production-hub.jpg`: final restored hub, 1280 by 720 pixels.
- `production-ending.jpg`: compiled-production ending view, 1280 by 720 pixels.
- `mobile-hub.jpg`: narrow hub and leap controls, 390 by 844 pixels.
- `mobile-repair.jpg`: narrow repair view and touch controls, 390 by 844 pixels.

These are actual game frames at the stated viewports. They document appearance in those states, not a frame-rate benchmark or a recording of the full sequence.

## Delivery gate

PASS below means the stated source inspection or observed check passed for this integration build. It does not imply an independent review on every browser, final asset approval or completion of the selected full story.

- R-01 PASS: orange terrain and cold sky remain the chosen palette; restrained grade/vignette retain their documented focus purpose.
- R-02 PASS: product HTML, shared UI and scene HUD text contain no em dash characters.
- R-03 PASS: native 390 by 844 hub/repair checks show no horizontal overflow; measured visible touch targets are at least 44 pixels and Leap is separate from the other controls.
- R-04 PASS: instructions use relevant key labels; no decorative feature-icon set is introduced.
- R-05 PASS: interface regions follow actual hub, episode, repair and recovery states rather than a landing-page template.
- R-06 PASS: the existing system sans-serif serves short stage-readable instructions; DESIGN records that purpose.
- R-07 PASS: surface detail belongs to Mars and reticles to optical feedback; no decorative page grid is introduced.
- R-08 PASS: arrows identify real camera input; they do not decorate calls to action.
- R-09 PASS: labels identify scene and interaction state; no promotional capsule badges are present.
- R-10 PASS: shared UI uses legible backed panels rather than stacked backdrop-filter treatments.
- R-11 PASS: retained one-/two-pixel mechanical corner radii remain consistent; new recovery/return controls use the same buttons.
- R-12 PASS: world shadows retain contact/direction purpose; UI does not apply floating shadows to every element.
- R-13 PASS: highlights remain scene effects; controls and panels are not covered in decorative glow.
- R-14 PASS: there is no repeated feature-card composition.
- R-15 PASS: Enter memory, Insert module, Return to Mars, Retry loading, Cancel, Reload scene, Resume and Restart identify actual actions.
- R-16 PASS: action/objective copy stays specific and contains no promotional AI buzzwords.
- R-17 PASS: displayed distances derive from scene positions; simulation/build/resource numbers in this report are tied to their stated evidence.
- R-18 PASS: no testimonials, fictional customer identities or social-proof claims are present.
- R-19 PASS: glide/leap, arm movement, suspension and camera changes serve gameplay; loading/return states expose actual transitions rather than decorative animation.
- R-20 PASS: the selected orange graveyard, cold sky, pale damaged rover and explicitly provisional spirit retain the game's stated identity.
- R-21 PASS: fixed cinematic lighting serves this narrative world; DESIGN explains why a website theme switch is not part of the game.
- R-22 PASS: the actual runtime landscape and placeholder protagonist relate directly to the selected game, with prototype status explicit.
- R-23 PASS: the spirit type and temporary humanoid direction come from the user; the intro labels its placeholder status and unfinished mission rather than presenting it as accepted final art.
- R-24 PASS: preview routes select implemented scenes; other wrecks do not promise unbuilt episode navigation.
- R-25 PASS: enabled text retains the previously checked pale/accent-on-charcoal palette and backed placement; the baseline report records 6.64:1 or greater for its checked combinations. New recovery/return controls reuse those values; no fresh independent whole-screen contrast measurement is claimed.
- R-26 PASS: production entry, insertion/retry, optical, return, replay, reset, pause and touch controls act as recorded; development failure Retry, Cancel and initial Reload/Retry also recover.
- R-27 PASS: loading, ready, misalignment, failed preparation, Retry/Cancel and return states exist; normal loading, repair rejection and injected failure/recovery were observed.
- R-28 PASS: no generic FAQ is present.
- R-29 PASS: scene colors and the restrained warm interaction accent stay within the selected orange/cold-neutral direction; no new multi-accent UI palette is introduced.
- R-30 PASS: references inform motion and rendering; the project retains its Mars/spirit/machine concept without imported Fortnite or Endurance artwork/code.
- R-31 PASS: DESIGN records reasons for scene palette, typography, composition, motion and the new hub/loading/return presentation.
- R-32 PASS: visible focus styles remain; native hub pause Tab cycling and Enter resume pass, with keyboard movement and repair inputs also exercised.
- R-33 PASS: runtime features live in the TypeScript/CSS modules, with no source-rewriting runtime feature required.
- R-34 PASS: no alternate theme or theme toggle is shipped.
- R-35 PASS: typecheck/build and 23 tests pass; native development and compiled-production interaction inventories above record actual control results, including the narrow viewport and recovery paths.
- R-36 PASS: no unsupported security/customer/performance claims are made; stable resource counts are explicitly separate from a memory-leak proof or stage-machine benchmark.
- R-37 PASS: the user direction and ENERGY 1 / RHYTHM 2 / MOTION 3 are stated in DESIGN; provisional spirit appearance is labeled rather than disguised as approved art.
- R-38 PASS: fictional game content is authorized, placeholder art is identified, and implemented runtime is separated from the unfinished mission/story and pending owner acceptance.

Liveliness PASS: the documented 1/2/3 dials retain restrained presentation with purposeful motion; the active character or keyed socket is the focal point, edge placement preserves the world, the warm accent marks interaction, and optical/mechanical framing supplies the recurring motif.

Craftsmanship PASS: C-1 decisions have reasons in DESIGN; C-2 recorded controls function; C-3 each UI region serves a game state; C-4 checked desktop/narrow, keyboard, loading and error states recover; C-5 claims are tied to tests, source or primary-agent observations. Scope and unverified target hardware remain explicit below.

## Remaining scope and acceptance

The file boundaries and actual hub/episode contract now provide a working base for parallel contributors. Shared contracts, registry, input/rendering and dependencies still require one integrator; asset and episode authors should use isolated clones/worktrees and the owned paths rather than editing the shared runtime.

Final spirit identity/rig/art, the chosen rover assignment, the complete remembered mission and time-jump/shutdown story, integrated sound, final environmental assets, target-stage-machine performance and owner visual/gameplay acceptance remain outstanding. No second equipment story or account-dependent runtime generation is included.
