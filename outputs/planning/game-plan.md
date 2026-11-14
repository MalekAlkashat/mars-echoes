# Rover game plan

## Reference terrain update, 15 November 2026

The active branch is `fixing_terrain`. The default hub and Opportunity drive preview now use an authored 100 × 100 metre terrain: broad winding sandy floor, asymmetric low western shelf and higher eastern headland, restrained orange/peach haze, sparse scanned rock anchors and debris. The three new user-supplied images under `outputs/references/terrain-100/` are the primary direction for this pass, superseding the old gray-sky hub appearance. Spawn is now `(0,36)`; the single memory rover remains at `(0,-25)`. Legacy terrain is retained through `createHubEnvironment({legacyTerrain:true})`, and the fictional repair episode remains separate.

Rendered ground and contact share the same 0.5 m triangle grid; both controllers respect explicit square bounds. The terrain world bakes the parallel physics owner's transformed rock surfaces before readiness and clears them on disposal. The measured rover supports bounded suspension, low-rock traversal, and tall-step/belly obstruction; this is geometric contact, not a full rigid-body/rollover solver. Main and side routes pass at 30/60 Hz. Current combined suite: 58 passing checks, successful isolated production build, native drive/turn/reverse plus hub entry/return checks. See `outputs/planning/terrain-100-plan.md` and `outputs/review/terrain-100/REVIEW.md`. Visual acceptance and thermal measurement remain outstanding; independent historical chapter hosting is still future work.

## Stone traversal, 15 November 2026

The user rejected the first climb as too abrupt. A soft-motion revision now progressively loads tyres with a cubic contact profile and slows the approach to raised rocks. It remains dynamic under driving input. The same-input before/after recording and measured reduction in frame jumps are in `outputs/review/soft-climb/REVIEW.md`; 59 tests and build pass. User acceptance remains open.

Opportunity now rolls onto low stones using a wheel-radius contact envelope over the visible static rock geometry. Six-wheel support drives the existing bounded suspension and chassis springs. Oversized steps and central belly obstructions stop translation; pivoting checks tyre clearance too, and reversing/turning away remains possible. This extends the custom kinematic contact approximation, rather than adding a rigid-body or articulated rocker-bogie solver. Static rock tops are cached once in a 4 cm grid; driving performs height lookups, with no detailed rock-mesh raycasts per frame. Terrain and rock maps expose this through the optional `MarsEnvironment.roverSurface` interface.

Production build/typecheck and all 58 automated checks pass, including six stone regressions. Native development-browser review covers a low-step ascent/descent, tall-step stop, reverse recovery, pause/resume and normal terrain driving without fixtures. See `outputs/review/stone-climbing/REVIEW.md`; final feel remains subject to user review.

## Main menu implementation, 14 November 2026

The user replaced the Echoes of Mars title and introductory tagline with **Abandoned but not Forgotten**, using a condensed sans-serif heading over the supplied Mars landscape. The default entry has New Game, saved Continue and Settings; no Credits action. New Game starts the existing present-day hub directly and requires confirmation when a save exists. The satellite arrival cinematic remains future work.

The main menu stays fixed to the viewport with centered, left-aligned content and no scrolling or positional hover motion. Settings uses Display, Sound and Accessibility category tabs. Escape now opens a side pause menu with Resume, Save Game, Skills, Settings and Main menu, plus Leave memory during a rover visit. The accidental R restart shortcut and visible Restart scene option were removed. The paused world remains visible with its HUD concealed.

Version 2 local saves keep the active scene, hub bookmark, completion markers, and rover pose/camera/optical or preserved repair-phase progress. They autosave about once per second during gameplay, at successful transitions and on pause/page hiding. Save Game gives visible timestamp/error feedback. Validation, a recovery backup and migration of existing v1 exploration saves are implemented. Explicit New Game replaces backup history too. Resumed vehicles are stopped; dust, tracks and wheel rotation are transient. Browser storage is local to the same browser profile and site address, not cloud storage.

The first Skills branch has one available **Photograph Terrain** node near its head, with details and a working current-view PNG capture. No additional skills, XP economy or historical chapter completion was invented. Seven viewport sizes including larger text, manual/autosaving, actual hub/rover reload/return, backup recovery, storage-failure feedback, input isolation and photography have been browser-checked. Sound preferences are saved, but the runtime remains silent. Build/typecheck and all 43 automated tests pass. See `outputs/review/m3-memory-ui/REVIEW.md` for evidence and limits; visual acceptance remains with the user.

## Current Opportunity model integration

The user selected `24883_MER_static.usdz` as Opportunity’s model. It is now converted locally to `game/public/assets/opportunity/opportunity-v1.glb` and replaces the visible hub and default playable rover. Six measured wheel pivots, steering/spin, model-specific terrain contact, bounded suspension approximation, camera and wheel effects are wired to it. Final arm/mast articulation remains unimplemented; the source is static. The normal rover episode is now a drive preview; the old fictional repair sequence is retained at `?scene=episode-rover-01&prototype=repair`. Build and all 33 automated checks pass, with native production/development motion review recorded in `outputs/review/opportunity-v1/REVIEW.md`. Historical missions and owner visual acceptance remain outstanding.

## Latest phase: base exploration map and rover development

The user has deferred final spirit design, while requiring the base map first for spirit roaming and reaching Opportunity. Use the existing placeholder; build shared terrain and independent Opportunity mission maps around the hub journey. `mission-foundation.md` records the current audit and proposed build order. The spirit-to-memory flow below remains the player-facing journey; current runtime code already opens the placeholder hub. The hub terrain is now implemented as described below; independent historical mission hosting remains future work.

The first Mars-reference hub redesign is now implemented and agent-checked. It removes all decorative rover copies, uses shallow troughs, low shelves and a distant crater vista, and places the single memory entrance at `(0,-25)` from spawn `(0,8)`. Shared presentation now has a balanced pixel/frame budget and stops composing paused views. Build and all 26 automated checks pass; native development-browser traversal, entry/return and repeated abort checks pass. See `outputs/review/mars-hub-v1/REVIEW.md` and `outputs/references/mars-hub/reference-direction.md`. This is not user visual acceptance, a final Opportunity asset, a thermal measurement or the completed mission-host foundation.

Current vision, revised 14 November 2026: the protagonist is a spirit exploring present-day Mars. It enters abandoned equipment, replays that machine's past mission, and returns to the spirit. The hackathon target is one complete rover story, with a single rover entrance and no decorative rover graveyard. Root `ROADMAP.md` is the current development plan; `architecture.md` and `team-development.md` define the implemented runtime ownership boundaries and contributor handoffs.

Confirmed spirit movement is near-ground glide and bounded leap, inspired by Fortnite's Shadow Stone movement feel, with no passing through obstacles. A ghostly humanoid silhouette is tentative and may change. The selected rover memory follows Opportunity through evidence of ancient water, Purgatory Dune and the final dust storm, with playable moments linked by cinematic time jumps. See `opportunity-story.md` for historical guardrails and proposed supporting features. The new game has no fixed duration or approved final title.

The earlier rover-only optical-repair/relay prototype is preserved at tag `rover-v2-baseline` (commit `179705b`). The current source has shared app/core services, an isolated rover episode and HUD, reusable entities/Mars environment, and a placeholder spirit hub with entry/return plumbing. This implements the M1 foundation plus minimal M2/M3 integration. It does not yet implement the complete past mission, cinematic time jumps, shutdown or sound. Earlier repair and call decisions below are fictional baseline context, not Opportunity history; they do not force a stage-two-damaged state at the beginning of the past mission.

## Historical fictional prototype and earlier decisions

The fictional events in this section and the old scene proposals and acceptance checks below are preserved for reference, not as facts about Opportunity. The selected new story takes precedence.

- The machine was sent on a mission expected to last days, without a planned return. It completes the assignment and continues for months before its eventual demise.
- The emotional reference is the vulnerability and abandonment of machines in Markus's junkyard sequence in Detroit Become Human.
- AI will implement most of the game. Three.js is the selected direction for the first scene.
- There is one development day. The user and one colleague will work with AI.
- The player directly drives, looks around and operates the rover's tools.
- The game will be demonstrated on stage; direct judge play is not expected.
- Visual direction: grounded cinematic, believable machinery, simplified detail and atmospheric lighting.
- Obtain usable rover and map assets before implementing the first scene.
- The story opens amidst rubble after the rover has been discarded following its assigned usefulness. Mission completion precedes the opening.
- An automated mission system decommissioned it after its task ended.
- The rover opens in stage-two deterioration. Its first objective is to salvage an optical module from another discarded rover, restore one eye and obtain clearer vision.
- Exploration uses third person, with brief optical-feed views during scanning and repair.
- Installing the module is a small alignment puzzle where the player positions the component. The current controls and camera transitions are an implemented prototype awaiting user review.
- The donor rover is completely inactive; the scene stays quiet. After recovering vision, the protagonist tries to reach mission control, still expecting a response.
- Feelings and thoughts are conveyed mostly through movement and sound, with minimal text.
- The user likes the initial rover concept, especially its eye-like optics, and requests larger eyes, side and top views, and three stages of deterioration.
- Deteriorated versions should have a paler finish and substantially greater body destruction, while retaining a recognizable face.
- Selected environment direction: A's bright orange, Mars-like terrain and distant pale light combined with B's heavier gray sky. The opening contains a graveyard of discarded machines using repeated wreck silhouettes, and should feel harsh, cold and sad.
- The earlier 3–5-minute suggestion does not constrain the game or presentation.

## Proposals awaiting selection

The rover wakes amidst rubble after automated decommissioning, in its stage-two damage state. It salvages an optical module from a completely inactive discarded rover and installs it through a positioning puzzle. The camera alternates between third person and brief optical-feed views as selected above. Prototype puzzle controls and camera transitions are implemented; final acceptance remains open. Newly revealed hidden geometry in the rover references remains a proposal to check for consistency.

The current implementation uses a compact authored environment, separate rigid parts and pivots, and geometric six-wheel terrain contact with damped visual suspension. This is the implemented production route for the prototype, not approval of a final rover model or a claim of full physical vehicle simulation.

The user selected a hybrid of A and B, retaining A's terrain and distant light with B's heavy sky, plus repeated machine wrecks. The combined study is saved as `outputs/assets/environment-c-orange-graveyard.png`. Proposed spatial sequence: wake pocket, recovery lane, then a low basin shoulder. Wrecks should flank a clear playable route and suggest a much larger graveyard through repeated distant silhouettes. The exact layout is not yet accepted. See `environment-direction.md` and `graveyard-layout.md`; the concepts are visual references rather than runtime maps.

## Deliverables and completion checks

| Stage | Deliverable | Completion check |
| --- | --- | --- |
| Direction | Rover and environment concept studies | The user selects or revises a candidate; defining shapes and palette are recorded. |
| References | One master rover source and the additional views needed for modeling | Proportions, component count and camera housing stay consistent; hidden geometry is distinguished from observed detail. |
| Rover asset | Editable model or procedural model source with game materials | Parts, pivots, scale, orientation and intended motions are checked. The source and usage rights are recorded. |
| Environment assets | Ground, a small rubble kit, repeated wreck variations and selected mission hardware with a proposed layout | A rover-sized route, camera space and collision approximations are defined. A concept illustration alone does not pass. |
| Import check | Assets inspected in the target renderer | Materials and geometry load correctly; appearance and runtime cost are evaluated before scene assembly. |
| First scene | Integrated camera, movement, collision, one interaction and reset | The complete opening interaction can be played and repeated in Three.js. |
| Review | Captures and an issue record | Normal-speed behavior and gameplay-distance appearance are checked on the intended demo hardware when available. |

## First scene acceptance

- Assets load from local project files without requiring live generation services.
- The rover, terrain and rubble have coherent scale and appearance.
- Camera framing supports navigation and the intended mood.
- Movable components rotate around appropriate pivots.
- Traversable surfaces and obstacle boundaries match their collision behavior.
- One selected interaction gives clear feedback and advances the opening.
- Third-person navigation and brief optical-feed views transition predictably without obscuring controls or the route.
- The donor's optical module can be located, recovered and positioned in a small alignment puzzle. Misalignment gives recoverable feedback and success visibly restores the damaged optic.
- The arm can reach the module and the receiving socket through a plausible service pose. A rover-eye view must not magically show its own socket; use an appropriate external close-up for assembly if required.
- Reset returns to a predictable state; replay does not duplicate objects or events.
- Performance and input are checked in the actual running scene. The target hardware and performance budget are recorded once known.

## Decisions still needed

Presentation slot and target computer; final layout and art; exact Opportunity chapter mechanics; historical rover visual treatment; skill/map/check scope; full-game duration. WASD driving is now explicitly selected. Implemented puzzle controls are WASD positioning, Q/E rotation and Enter insertion; these remain a prototype awaiting the user's gameplay review. The selected environment retains orange terrain, distant pale light and a heavy gray sky; implementation must preserve route and protagonist readability.

These choices do not block installation, reference preparation or initial concept exploration. They must be resolved before dependent implementation or final story writing.

## Current runtime organization

`game/src/main.ts` is now bootstrap/preview selection. `app/` owns the one game loop, scene director, contracts, registry and in-memory session; `core/` owns input, asset caching and presentation; `entities/rover/` and `entities/spirit/` separate their control and appearance; `environments/mars/` contains shared terrain, surfaces, atmosphere, dressing and disposal. The episode's donor/relay placements, progression and instructions live under `scenes/episodes/rover/` in `layout.ts`, `mission.ts` and `hud.ts`. The hub owns its separate `scenes/mars-hub/` factory/layout and uses the stable wreck mapping in `content/equipment.ts`. Shared UI primitives/styles live under `ui/`.

The default entry and `?scene=mars-hub` run the placeholder hub factory. `?scene=episode-rover-01` previews the preserved rover sequence through the same registered production factory. The hub has a tentative humanoid placeholder and separate near-ground glide/leap controller; its appearance can change independently. The runtime has typed entry/return requests, bookmark restoration, cancellation/failure recovery and completion-versus-abort handling. These are implemented infrastructure, not evidence of the full selected story.

The production build and current automated suite pass, covering 14 director/lifecycle, four rover movement/contact and five spirit controller checks. Native development-browser review passes the complete preserved repair/call sequence, alignment retry, installation, calibration, return to Mars and ten additional aborted visits. Each returned hub reports 134 geometries and 34 textures, restores the same horizontal position `(0, 2.33)` and retains exactly one prior prototype completion; browser errors are empty. These observed resource counts are not a memory-size or performance benchmark. Fault UI, mobile and production-browser checks are tracked separately. The Opportunity chapters and shutdown sequence, final spirit model, sound, owner acceptance and target-machine acceptance remain outstanding.

## Preserved rover v2 history

The Three.js opening is implemented in `game/`. Its existing loop includes direct driving, third-person/orbit camera controls, collision proxies, optical-feed views, inactive donor recovery, an optical-module positioning/insertion puzzle, calibration, an attempted relay call, pause and restart. The earlier blockout loop was traversed in the local browser, including failed insertion and successful repair.

The user found that blockout visually too basic and authorized a substantial second visual/gameplay pass using Project Endurance as a quality reference. The priority remains the rendered world and gameplay, with interface work secondary. Live reference inspection, deployed-client analysis and the author's technical explanations are recorded under `outputs/references/endurance-racing/`. No Endurance artwork or client code was imported, and wet racing surfaces are not the selected planetary direction.

The v2 pass is implemented with a more detailed pale damaged procedural rover, separate paint/metal/rubber/optical finishes, scanned orange regolith and rock surfaces, fractured outcrops grounded into their terrain footprints, an open valley, inactive matching-rover wrecks, and synchronized procedural sky, environment reflections, sun, fog and shadows. Six terrain contacts drive bounded spring visual suspension and chassis pitch/roll. Acceleration settling, a weighted camera, contact-driven dust/tracks and the arm/optic puzzle connect visual feedback to movement and repair. This is a geometric wheel-contact approximation, not a full rigid-body vehicle solver. The approved enlarged-eye reference remains the design authority; the procedural model and layout are not yet accepted final art.

The preserved episode retains spawn `(0, 8)`, donor `(0, -5)` and relay `(0, -24)` in horizontal metres, with a clear recovery lane around the intended interaction obstacles. Its former flat source files have now moved to the current ownership directories above. This history describes the source baseline and earlier review, not a new browser regression of the refactor.

TypeScript, production build and targeted motion checks pass. Geometry checks confirm that the near-terrain mesh and wheel height sampling agree. Current captures and a normal-speed recording are under `outputs/review/visual-pass-v2/`. The final production desktop playthrough passes recovery, alignment retry, successful installation, calibration, the unanswered relay call, replay, pause/resume/restart, focus handling and optical views through both F and the button. All six mobile touch buttons and module pointer dragging pass, and browser error logs are empty. User visual/gameplay acceptance, sound integration, target-machine performance confirmation and the complete later story remain outstanding. The game is not complete.

Ready-made assets include Kenney CC0 mission hardware and an unused NASA Perseverance GLB. Poly Haven CC0 `sandy_gravel_02` and `dry_riverbed_rock` supply local color, OpenGL normal, roughness and AO maps; originals, source URLs, licenses and hashes are retained under `assets/vendor/polyhaven/`. Nine project workflows and the approved-reference pack remain installed. Tripo CLI/MCP is researched but unauthenticated; the user has no account and no paid model job has been submitted. See `test-assets.md` and `3d-service-workflow.md`. The current prototype does not require live generation services.

### Focused reference refinement, 15 November 2026

Extended the existing100m terrain with broken outer shelf lips, connected buried bedrock sections and margin-weighted fragments. Geology attributes now couple sediment/exposure to color, roughness and normal strength; localized derivative-filtered sand ripples remain material-only. Warm forward-right sunlight and middle-distance forms improve separation without changing graphics budgets. Map dimensions, routes, spawn and entrance remain unchanged. Native comparisons, performance and explicit remaining discrepancies: `outputs/review/terrain-100/refinement/REVIEW.md`. Final artistic acceptance remains open.
## Current Mission 1 direction

See [Mission 1 production plan](mission-one.md), reviewed against `0becdac` on 14 November 2026. It records the supplied historical/visual brief, asset sourcing and wear requirements, Focus UI assessment, save compatibility, staged implementation and acceptance gates. This is planned work, not a completed chapter.


Mission 1 runtime increment (14 November 2026): the isolated `codex/mission-one` branch now contains the playable Blueberry Clue loop with reference-backed authored assets, chapter checkpoints and GRIND reward. See [runtime review](../review/mission-one-v1/REVIEW.md) for exact verification, scientific boundaries and remaining art limits. Main and the terrain checkout are unchanged.
