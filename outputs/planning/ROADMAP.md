# Spirit and machine memories: development roadmap

Updated 14 November 2026. Working repository name: `mars-echoes`, not an approved game title.

## The game we are making

Explore Mars as a spirit, enter the remains of abandoned equipment, experience that equipment's past mission through playable moments, and return to the spirit in the present.

The hackathon target is one complete equipment story in a compact Mars exploration area. Other wrecks establish the larger world without promising unbuilt episodes. This remains a single-player stage demonstration, developed in roughly one day with AI and colleagues. The presentation length and target computer are still unknown; the earlier 3–5-minute suggestion is not a requirement.

### Confirmed decisions

- Three.js, TypeScript and Vite remain the implementation stack.
- The spirit glides near the surface and leaps with limited vertical movement. The reference is Fortnite Chapter 1 Season 6's Shadow Stone movement feel.
- The spirit cannot pass through obstacles. Do not implement phase, noclip, a dash or unrestricted flight on the strength of the reference alone.
- The spirit currently has a ghostly humanoid silhouette. Its appearance is tentative and may change; controller and rendering must remain separate.
- Entering equipment replays its past, rather than repairing or possessing its present-day wreck.
- Finishing a memory returns control to the spirit on Mars.
- The first memory follows the rover's mission, abandonment and eventual shutdown. Playable moments are connected by cinematic time jumps.
- The original assignment is deliberately undecided. Do not silently choose sample collection, relay repair or another objective.
- Retain the selected orange terrain, pale distant light, heavy cold sky, grounded machinery and emotion expressed through motion/sound with little text.
- The pale six-wheel rover and enlarged twin optics retain their existing design references. The spirit is a separate protagonist and must not replace that asset authority.

### Existing implementation versus new work

The existing `game/` is a rover-only v2 prototype: driving, an inactive donor, optical repair, calibration and an unanswered relay call. Its production build passes. Earlier runtime review is recorded in `outputs/review/visual-pass-v2/REVIEW.md`; that review is historical evidence, not proof of the new spirit loop.

Git tag `rover-v2-baseline` preserves this version. There is no implemented spirit controller, hub/episode transition, full past mission, shutdown ending or audio pass yet. Existing repair and unanswered-call material can inform the first memory, but does not constitute the complete selected story. A memory may begin with a functional machine; stage-two deterioration describes the previous opening and present-day remains, not a required initial memory condition.

## Why Three.js is feasible

One renderer can present a spirit exploration scene and a machine episode with different controllers, cameras and local objectives. The existing rover, terrain and rendering code already supply useful pieces. We need to add game orchestration: input ownership, scene lifecycle, transition handling and story progression. Three.js supplies rendering, not those game systems. See the [official game-development manual](https://threejs.org/manual/pages/game.html).

This plan uses one compact hub, one episode and explicit scene registration. Open-space travel, a planet-scale map, procedural galaxies, multiplayer, a general-purpose editor and a new physics engine are outside the first build. These are scope recommendations for this iteration, not a permanent restriction on the concept.

## Target file structure

This is the proposed destination. The current flat runtime files stay in place until each extraction is built and checked. Do not create empty layers or move every file in one change.

```text
/
  ROADMAP.md                         # current vision, milestones, open decisions
  README.md                          # start here and run the existing build
  CONTRIBUTING.md                    # branches, ownership and integration checks
  AGENTS.md                          # instructions for AI contributors
  .github/workflows/build.yml        # target location, template not active yet
  game/
    package.json
    package-lock.json
    src/
      main.ts                        # bootstrap only after extraction
      app/
        Game.ts                      # one renderer and one frame loop
        SceneDirector.ts             # guarded enter/return/loading transitions
        contracts.ts                 # shared scene/input/result types
        registry.ts                  # explicit scene ID -> factory mapping
        session.ts                   # completion records and hub return bookmark
      core/
        input.ts                     # one set of listeners, normalized actions
        presentation.ts              # renderer/composer configuration and resizing
        assets.ts                    # load/cache, shared resource ownership
        audio.ts                     # playback ownership and pause/cleanup
      entities/
        spirit/
          controller.ts              # glide, leap, solid collision
          appearance.ts              # replaceable silhouette and effects
          camera.ts
        rover/
          model.ts
          materials.ts
          controller.ts
          grounding.ts
          wheel-effects.ts
      environments/mars/
        terrain.ts
        atmosphere.ts
        materials.ts
        dressing.ts
      scenes/
        mars-hub/
          index.ts                   # hub factory and lifecycle
          layout.ts                  # wreck placements and entry volumes
        episodes/rover/
          index.ts                   # rover episode factory and lifecycle
          mission.ts                 # rover-only progression, never global state
          layout.ts
          timeline.ts                # authored time jumps and damage beats
      content/equipment.ts           # stable wreck ID -> episode ID and assets
      ui/                            # shared loading, pause and objective views
    public/assets/
      spirit/<version>/
      equipment/<equipment-id>/<version>/
      environments/mars/<version>/
      audio/<version>/
    tests/                           # lifecycle, transitions and controller checks
  assets/                            # authoring sources and vendor originals
  outputs/planning/
    architecture.md                  # boundaries, migration and contracts
    team-development.md              # role-specific implementation handoffs
    build-workflow.yml               # ready-to-enable build check template
    game-plan.md                     # detailed context and historical decisions
    asset-brief.md                   # references, pivots, materials and provenance
  .agents/skills/                     # retained project workflows
  work/                              # ignored scratch files
```

Existing `public/assets/kenney` and `surfaces` paths remain valid until an asset migration updates the loader and verifies the production build. Originals, selected references and provenance remain in Git; packaged demos, dependencies and generated builds are ignored. Existing vendor assets do not need LFS at their current sizes. Revisit storage before adding large Blender sources, high-resolution scans or video libraries.

## Boundaries that make parallel work reliable

The integrator owns `app/`, `core/`, shared UI, dependencies, contracts and scene registration. The hub owner owns `entities/spirit/` and `scenes/mars-hub/`. The episode owner owns `scenes/episodes/rover/` and rover behavior changes agreed with the integrator. The asset owner supplies versioned files and provenance rather than rewriting loaders or scene orchestration.

Every scene has the same lifecycle: prepare assets, enter, update, resize, pause/resume, and dispose. It uses application services rather than creating another renderer, frame loop, global keyboard handler or audio context. Only one active scene receives gameplay input. Scene-local objects belong to that scene; shared cached assets belong to the cache and must not be disposed by an episode.

The transition director records the spirit's position, heading and camera bookmark before entering a wreck. It locks repeat entry requests, loads the destination before retiring the working source scene, and restores the source if loading fails. Successful completion records an episode result and returns to a safe point beside the same wreck. Aborting or failing to load does not mark a memory complete. Present-day wrecks remain abandoned; a memory does not silently repair the present world.

Detailed proposed contracts and current-file migration map: [architecture](outputs/planning/architecture.md). Task boundaries and contributor instructions: [team development](outputs/planning/team-development.md).

## Milestones and acceptance

Timeboxes below are planning estimates for the team, not measured implementation times or a promised delivery date. Use completion checks to decide when to move on. Prefer the whole spirit-to-memory-to-spirit loop over additional scenery or episodes.

| ID | Deliverable | Owner | Depends on | Completion check |
| --- | --- | --- | --- | --- |
| M0 | Saved rover baseline, roadmap and collaboration setup | Integrator | None | Local repository, baseline tag, build pass, documented ownership; remote connected when GitHub access is available. |
| M1 | Shared runtime/input lifecycle and unchanged rover scene extraction | Integrator | M0 | Existing repair-to-relay behavior still works; one loop/listener set; extracted scene enters, pauses, exits and disposes. |
| M2 | Spirit movement and compact Mars hub | Hub owner | M1 contract freeze | WASD movement relative to camera, readable leap/landing, slopes, solid obstacles, camera clearance and reset work in the actual scene. |
| M3 | One complete enter/return route using the preserved rover scene | Integrator + scene owners | M1; simple M2 | Enter a designated wreck, play the existing rover sequence, return beside it. Loading failure, abort and repeated interaction recover correctly. This proves infrastructure, not the completed story. |
| M4 | Chosen original assignment and complete rover episode | Episode owner + user for assignment | Mission choice; M1, M3 | One meaningful playable assignment, completion, abandonment, authored time jumps and shutdown produce a clear emotional arc and a typed completion result. |
| M5 | Spirit/rover art, sound and cinematic continuity | Asset owner + scene owners | Placeholder loop first; M4 beats for final timing | Readable ghostly silhouette, coherent scale/lighting, approved rover identity, meaningful motion and audible story cues checked in runtime. |
| M6 | Integration and stage rehearsal | Integrator + whole team | M2–M5 | Full loop works in production, repeated scene switching remains stable, assets work locally, target machine checked, fallback build saved and tagged. |

Suggested first-day allocation: initial 1–2 hours for M0/M1; then 2–3 hours for parallel hub/controller, episode extraction and asset work, with M3 integrated early. Give the middle of the day to the selected mission and its story beats. Reserve the final 2–3 hours for integration, sound/visual review and rehearsal. Reduce story complexity or use a single reused environment before adding a second episode. If M1 takes longer, shorten content rather than skipping transition checks.

### M1: integrator checklist

- [ ] Extract the single frame loop, input listeners and shared renderer lifetime from current `main.ts`.
- [ ] Freeze small scene, input, result and resource-ownership contracts with working stub scenes.
- [ ] Make old `Progress` episode-local; do not add spirit/hub branches to that rover state machine.
- [ ] Separate generic Mars terrain/environment services from donor/relay placements in `world.ts`.
- [ ] Preserve the old rover loop through the extraction before changing its story.
- [ ] Provide independent hub and episode preview entry points using the same production scene factories.

### M2/M3: hub and transition checklist

- [ ] Build the tentative humanoid spirit using a clear placeholder before final rig or shader work.
- [ ] Keep movement in the controller and shape/effects in appearance, so changing the silhouette does not require rewriting gameplay.
- [ ] Tune near-ground glide, bounded leap, landing and collision at normal playback speed.
- [ ] Use a stable `wreck-rover-01` -> `episode-rover-01` mapping and one readable entry cue.
- [ ] Other visible wrecks have no misleading play prompt until their episodes exist.
- [ ] Save/restore the hub bookmark, clear held inputs, lock repeated transitions and recover from loading failure.
- [ ] Distinguish completed from aborted memories. A subtle completion indication is proposed; its final appearance remains open.

### M4: episode checklist

- [ ] Choose the original assignment before authoring its dependent puzzle or mission props.
- [ ] Write a short beat sheet: purposeful work, task completion, abandonment, continued effort, shutdown, return.
- [ ] Choose which moments are playable and where cinematic time jumps communicate elapsed days/months.
- [ ] Preserve machine control during playable beats; camera choreography must return control clearly.
- [ ] Reuse the current optics/repair/call systems only where they serve the new chronology.
- [ ] Keep robot deterioration separate from present-day hub dressing; reuse the approved damage references where appropriate.
- [ ] Do not substitute the old unanswered-call ending for the selected eventual-shutdown ending.

### M6: required verification

- [ ] Build/typecheck each branch and the integrated production build.
- [ ] Play the baseline rover regression after runtime extraction.
- [ ] Check spirit glide/leap at 30/60/120 Hz simulated steps, obstacles, slopes and landing recovery.
- [ ] Verify only the active controller receives inputs, including held keys across possession and return.
- [ ] Verify repeated entry, cancelled/failed loading, pause, resume, abort, restart and successful return.
- [ ] Run ten hub/episode cycles; inspect listener counts, active loops, audio playback, scene-owned resources and stabilized renderer resource counts. Shared cache retention must be distinguished from a leak.
- [ ] Verify completion is recorded once, abort is not completion, and a failed transition does not lose the return bookmark.
- [ ] Check camera collision, optics, humanoid readability, dust/lighting and time jumps in normal-speed runtime captures.
- [ ] Listen to the actual sound mix and verify that pauses and scene exits stop the right sounds.
- [ ] Rehearse on the actual stage computer; record browser, resolution, frame timings and controls. Target performance is unverified until that machine is known.
- [ ] Save a self-contained production build and a known-good tag. Confirm reset can restart the demonstration without a network or generation service.

## Team workflow

Use feature branches and a separate clone per computer or worktree per simultaneous local agent. Run previews on different ports. Shared contracts and dependencies have one owner. Merge small playable increments every 30–60 minutes; a clean text merge still needs a scene and transition playthrough. Binary models/textures have one owner per asset version and are never resolved by combining bytes. Instructions and example commands are in [CONTRIBUTING.md](CONTRIBUTING.md).

Do not open branches for a second episode until the shared contract exists. An additional colleague can prepare assets, layouts and beat sheets while M1 is underway. Actual colleague names, GitHub handles and availability are not yet recorded; the role assignment is proposed.

## Open decisions

1. Original rover assignment, its player action and success condition. This blocks dependent mission scripting, not runtime extraction or spirit movement.
2. Exact playable beats and time-jump timing. The overall method and eventual shutdown are confirmed; duration is not.
3. Final spirit shape, body/rig route, palette and camera distance. A ghostly humanoid is the current tentative direction.
4. What the spirit is, why it enters memories, and whether completion changes it. Keep those lore choices open rather than inventing abilities or moral choices.
5. The visual response on returning to a completed wreck, and whether replay is freely available.
6. Presentation slot, target machine, exact team assignments and final game title.

## Status of this planning delivery

The repository setup and documentation are the implementation in this delivery. The target folders, scene contracts, spirit and complete memory loop are proposed work, not already migrated or playable. The preserved rover build remains the runnable prototype. GitHub, commit and handoff status is recorded in `outputs/planning/repository-status.md`.

The GitHub account can publish code but its current login lacks workflow-publication scope. Build automation is therefore supplied as `outputs/planning/build-workflow.yml`, not an active workflow. Local build/typecheck passes; use it before merging until the template is enabled by an authorized account.

Reference boundaries: [Fortnite's original Shadow Stone notes](https://www.fortnite.com/patch-notes/v6-00) describe increased movement, jumping and phasing. Our selected adaptation explicitly omits phasing, combat and the original consumable timer. Project Endurance remains a visual/vehicle-response quality reference, not the spirit controller specification.
