# Rover game plan

## Map, sprint, music and dusty sky, 14 November 2026

The user's latest references select a dusty ochre sky with warm haze for the hub/current Opportunity preview. M now opens a local map from the real heightfield, with actual current player/heading and objective pins, contours, boundary, distance and scale. It pauses and restores the previous pause state without new runtime listeners or renderer. Shift provides a held1.65× spirit glide boost using existing collision and bounded leap rules. Settings is slightly smaller, with adaptive Sound layout and updated controls.

The click runtime derivative removes the silent lead and second transient; cached warm clicks start directly. The supplied music's central phrase is levelled, extended with pitch-preserving waveform overlap and crossfaded into a steady title-only loop. Master/Effects/Music/Mute are independent preferences; music stops for gameplay/background windows. Originals, script and hashes are retained. See `map-boost-audio-sky.md` and `assets/audio/menu-music-v1/SOURCE.md`. This latest sky/music direction supersedes the earlier passes that left sky/music unchanged.

## Close hills, first person and menu sound, 14 November 2026

The user accepted the direction of the terrain detail and requested closer hills, an F viewpoint toggle and the supplied menu click. Quiet terrain now has nearby asymmetric shoulders around the clear central route. In the hub, F switches between an eye-height first-person view and the existing third-person camera; the spirit appearance hides in first person. The selected view persists in the optional `HubBookmark.firstPerson` field across Continue and memory return. Existing saves remain compatible; Opportunity retains its F optical camera. Drag/arrow look and solid movement remain shared with the existing controls.

`core/menu-audio.ts` is application-owned and plays the supplied unchanged `clicking.wav` for menu buttons and slider release previews, including keyboard button activation. Master and Effects volumes multiply; Mute silences playback. One AudioContext starts from a user gesture, with bounded voices and app cleanup. Music remains deferred. Coordinates, camera contract and provenance are documented in `near-hills-and-view.md` and `assets/audio/ui-v1/SOURCE.md`; native evidence is under `outputs/review/hills-view-audio/`.

## Terrain repetition and supplied rocks, 14 November 2026

At the user's request, work branched from freshly pulled `origin/main` (`0becdac`) to `terrain_fix/hazem`, retaining the teammate's newer outcrop sites, dust/contact integration, hills, basin, main approach, spawn and rover entrance. Ground now uses shared stochastic texture offsets across albedo/normal/roughness/AO instead of a visibly repeating plane sample. Broad dust/hardpan patches, shallow side relief and small irregular soil relief replace valley-wide striping. The same triangulated height sampler still drives mesh, collision/contact and camera clearance. Opportunity now defaults to the same quiet ground mode as the hub. Near and far terrain share their material, continuous world-space color and height-derived lighting normals; denser outer rings remove long angular panels while texture detail fades with distance.

The hub and current Opportunity preview now use four shapes from the user's MarsRocks FBX with its original UV color/DirectX normal maps. Existing landmark placements and collision/dust tools are reused, plus graded instanced scatter (76 hub pieces, 80 preview pieces, with six landmark sites and eight local fragments). Loose stones range from roughly half a metre to occasional boulders just over two metres across. About 9,000 source-derived low-poly gravel chips form uneven deposits, with filtered centimetre-scale aggregate in the ground shader. Small gravel is passable and casts no shadows; larger collision follows visible occupied rock columns. Earth-derived outcrop/scatter art is retained only in the repository/compatibility path. Source archives and extracted originals are preserved with hashes and conversion provenance in `assets/vendor/user-mars-rocks/`. No claim of NASA origin or an open redistribution license is made for the supplied pack.

Controls is now a category inside Settings, reached through Pause → Settings → Controls, with no separate Pause action or dialog. Verification and captures are recorded in `outputs/review/terrain-fix/REVIEW.md`, including traversal, rover driving, return cleanup, boundary shading and nested Controls. The sky, final spirit design and historical mission implementation were not changed by this pass. Visual acceptance remains with the user.

## Main menu implementation, 14 November 2026

The user replaced the Echoes of Mars title and introductory tagline with **Abandoned but not Forgotten**, using a condensed sans-serif heading over the supplied Mars landscape. The default entry has New Game, saved Continue and Settings; no Credits action. New Game starts the existing present-day hub directly and requires confirmation when a save exists. The satellite arrival cinematic remains future work.

The main menu stays fixed to the viewport with centered, left-aligned content and no scrolling or positional hover motion. Settings uses Display, Sound, Accessibility and Controls category tabs. Escape now opens a side pause menu with Resume, Save Game, Skills, Settings and Main menu, plus Leave memory during a rover visit. The accidental R restart shortcut and visible Restart scene option were removed. The paused world remains visible with its HUD concealed.

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
