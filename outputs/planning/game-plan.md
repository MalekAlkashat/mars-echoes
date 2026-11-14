# Rover game plan

Current vision, revised 14 November 2026: the protagonist is a spirit exploring present-day Mars. It enters abandoned equipment, replays that machine's past mission, and returns to the spirit. The hackathon target is one complete rover story, with other wrecks visible. Root `ROADMAP.md` is the current development plan; `architecture.md` and `team-development.md` define the proposed collaboration boundaries. Those new runtime boundaries are not implemented yet.

Confirmed spirit movement is near-ground glide and bounded leap, inspired by Fortnite's Shadow Stone movement feel, with no passing through obstacles. A ghostly humanoid silhouette is tentative and may change. The rover memory follows mission, abandonment and eventual shutdown through playable moments linked by cinematic time jumps. Its original assignment remains open. The new game has no fixed duration or approved final title.

The existing code remains the rover-only optical-repair/relay prototype, preserved at tag `rover-v2-baseline` (commit `179705b`). Its build passes; the spirit hub, entry/return transitions, full past mission, shutdown and sound are still planned. Earlier repair and call decisions below are retained as baseline context and potential episode material. They do not override the newly selected opening as a spirit or force a stage-two-damaged state at the beginning of the past mission.

## Retained rover-episode direction and earlier decisions

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

Presentation slot and target computer; final graveyard layout and art; original mission; what the rover expected after completion; full-game scope and duration. WASD driving is now explicitly selected. Implemented puzzle controls are WASD positioning, Q/E rotation and Enter insertion; these remain a prototype awaiting the user's gameplay review. The selected environment retains orange terrain, distant pale light and a heavy gray sky; implementation must preserve route and protagonist readability.

These choices do not block installation, reference preparation or initial concept exploration. They must be resolved before dependent implementation or final story writing.

## Current state

The Three.js opening is implemented in `game/`. Its existing loop includes direct driving, third-person/orbit camera controls, collision proxies, optical-feed views, inactive donor recovery, an optical-module positioning/insertion puzzle, calibration, an attempted relay call, pause and restart. The earlier blockout loop was traversed in the local browser, including failed insertion and successful repair.

The user found that blockout visually too basic and authorized a substantial second visual/gameplay pass using Project Endurance as a quality reference. The priority remains the rendered world and gameplay, with interface work secondary. Live reference inspection, deployed-client analysis and the author's technical explanations are recorded under `outputs/references/endurance-racing/`. No Endurance artwork or client code was imported, and wet racing surfaces are not the selected planetary direction.

The v2 pass is implemented with a more detailed pale damaged procedural rover, separate paint/metal/rubber/optical finishes, scanned orange regolith and rock surfaces, fractured outcrops grounded into their terrain footprints, an open valley, inactive matching-rover wrecks, and synchronized procedural sky, environment reflections, sun, fog and shadows. Six terrain contacts drive bounded spring visual suspension and chassis pitch/roll. Acceleration settling, a weighted camera, contact-driven dust/tracks and the arm/optic puzzle connect visual feedback to movement and repair. This is a geometric wheel-contact approximation, not a full rigid-body vehicle solver. The approved enlarged-eye reference remains the design authority; the procedural model and layout are not yet accepted final art.

Implementation responsibilities are split across `terrain.ts`, `worldMaterials.ts`, `atmosphere.ts` and `world.ts` for the environment; `rover.ts` and `roverMaterials.ts` for machinery; `grounding.ts`, `vehicle.ts` and `wheelEffects.ts` for movement/contact response; and `camera.ts`, `rendering.ts` and `main.ts` for presentation and integration. The first scene retains spawn `(0, 8)`, donor `(0, -5)` and relay `(0, -24)` in horizontal meters, with a clear recovery lane around the intended interaction obstacles.

TypeScript, production build and targeted motion checks pass. Geometry checks confirm that the near-terrain mesh and wheel height sampling agree. Current captures and a normal-speed recording are under `outputs/review/visual-pass-v2/`. The final production desktop playthrough passes recovery, alignment retry, successful installation, calibration, the unanswered relay call, replay, pause/resume/restart, focus handling and optical views through both F and the button. All six mobile touch buttons and module pointer dragging pass, and browser error logs are empty. User visual/gameplay acceptance, sound integration, target-machine performance confirmation and the complete later story remain outstanding. The game is not complete.

Ready-made assets include Kenney CC0 mission hardware and an unused NASA Perseverance GLB. Poly Haven CC0 `sandy_gravel_02` and `dry_riverbed_rock` supply local color, OpenGL normal, roughness and AO maps; originals, source URLs, licenses and hashes are retained under `assets/vendor/polyhaven/`. Nine project workflows and the approved-reference pack remain installed. Tripo CLI/MCP is researched but unauthenticated; the user has no account and no paid model job has been submitted. See `test-assets.md` and `3d-service-workflow.md`. The current prototype does not require live generation services.
