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
- The first memory follows the real Opportunity rover through evidence of ancient water, the Purgatory Dune entrapment and the final dust storm, with playable moments connected by cinematic time jumps. See [Opportunity story](outputs/planning/opportunity-story.md).
- The team's design proposes skill links to other robots, a Mars map and a short learning check; their exact scope and mechanics remain to be reviewed.
- Retain the selected orange terrain, pale distant light, heavy cold sky, grounded machinery and emotion expressed through motion/sound with little text.
- The existing expressive twin-eye rover remains the fictional prototype’s accepted design reference. The visual treatment of the real Opportunity rover needs a separate decision; do not present the existing model as historically accurate.

### Implemented foundation versus remaining story work

The runtime has now been reorganized into the ownership boundaries below. `main.ts` bootstraps the app; shared application, input, asset and presentation services run scene factories. The preserved rover sequence lives in `scenes/episodes/rover/`, including local mission progression and HUD. A compact placeholder hub uses the shared Mars environment and a separate spirit controller/appearance/camera. It provides entry into that rover sequence and a return route to the hub.

Git tag `rover-v2-baseline` preserves the original rover-only version. The new work implements the M1 runtime foundation and minimal M2/M3 integration, not the complete past mission, shutdown ending, final spirit model or audio pass. The existing repair and unanswered-call material is fictional prototype content, not an event in Opportunity’s history. A memory may begin with a functional machine; stage-two deterioration describes the previous opening and present-day remains, not a required initial memory condition.

The production build and 23 automated checks pass: 14 director/lifecycle checks, four rover motion/contact checks and five spirit controller checks. Native development-browser review also passes the complete preserved repair-to-relay sequence and return to Mars, including failed alignment and successful installation. After one completed prototype visit, ten additional aborted visits restore the same hub position, retain the one completion and return to stable renderer counts of 134 geometries and 34 textures, with no browser errors. These are observed development-browser results, not a GPU-memory benchmark or stage-machine certification. Fault UI, mobile and production-browser checks are tracked separately. Earlier v2 review remains historical evidence under `outputs/review/visual-pass-v2/REVIEW.md`.

## Why Three.js is feasible

One renderer presents a spirit exploration scene and a machine episode with different controllers, cameras and local objectives. Application orchestration now supplies input ownership, scene lifecycle and transition handling around the existing rover, terrain and rendering code. Full story progression remains episode-author work. Three.js supplies rendering, not those game systems. See the [official game-development manual](https://threejs.org/manual/pages/game.html).

This plan uses one compact hub, one episode and explicit scene registration. Open-space travel, a freely traversable planet, procedural galaxies, multiplayer, a general-purpose editor and a new physics engine are outside the first build. These are scope recommendations for this iteration, not a permanent restriction on the concept.

## Implemented file structure and reserved extensions

The ownership directories below now exist and contain executable source. Items explicitly marked as future remain unimplemented; do not create empty layers to imply completion. Runtime asset URLs remain at their existing locations.

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
      main.ts                        # bootstrap and preview entry selection only
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
        # future audio service       # not implemented; prototype remains silent
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
          camera.ts
      environments/mars/
        terrain.ts
        atmosphere.ts
        materials.ts
        dressing.ts
        resources.ts                 # scene resource disposal
      scenes/
        mars-hub/
          index.ts                   # hub factory and lifecycle
          layout.ts                  # wreck placements and entry volumes
        episodes/rover/
          index.ts                   # rover episode factory and lifecycle
          mission.ts                 # rover-only progression, never global state
          hud.ts                     # rover-specific instructions and feedback
          layout.ts
          # future timeline.ts       # authored time jumps and shutdown not built
      content/equipment.ts           # stable wreck ID -> episode ID and assets
      ui/                            # shared loading/pause primitives and styles
      review.ts                      # development capture helper
      env.d.ts
    public/assets/
      kenney/                        # current local runtime GLBs
      surfaces/                      # current local scanned maps
      # future versioned spirit/equipment/environment/audio exports
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

Implemented contracts and ownership map: [architecture](outputs/planning/architecture.md). Task boundaries and contributor instructions: [team development](outputs/planning/team-development.md). Preview the hub with `?scene=mars-hub` (also the default) and the preserved episode directly with `?scene=episode-rover-01`; both use the production factories.

## Milestones and acceptance

Timeboxes below are planning estimates for the team, not measured implementation times or a promised delivery date. Use completion checks to decide when to move on. Prefer the whole spirit-to-memory-to-spirit loop over additional scenery or episodes.

| ID | Deliverable | Owner | Depends on | Completion check |
| --- | --- | --- | --- | --- |
| M0 | Saved rover baseline, roadmap and collaboration setup | Integrator | None | Local repository, baseline tag, build pass, documented ownership; remote connected when GitHub access is available. |
| M1 | Shared runtime/input lifecycle and unchanged rover scene extraction | Integrator | M0 | Existing repair-to-relay behavior still works; one loop/listener set; extracted scene enters, pauses, exits and disposes. |
| M2 | Spirit movement and compact Mars hub | Hub owner | M1 contract freeze | WASD movement relative to camera, readable leap/landing, slopes, solid obstacles, camera clearance and reset work in the actual scene. |
| M3 | One complete enter/return route using the preserved rover scene | Integrator + scene owners | M1; simple M2 | Enter a designated wreck, play the existing rover sequence, return beside it. Loading failure, abort and repeated interaction recover correctly. This proves infrastructure, not the completed story. |
| M4 | Opportunity’s three historical moments and return | Episode owner + integrator | M1, M3; verified historical beats | Player experiences the rock discovery, dune entrapment and storm through clear interactions or scoped cinematic transitions, followed by a typed completion and return. Label reconstructions and simplifications. |
| M5 | Spirit/rover art, sound and cinematic continuity | Asset owner + scene owners | Placeholder loop first; M4 beats for final timing | Readable ghostly silhouette, coherent scale/lighting, approved rover identity, meaningful motion and audible story cues checked in runtime. |
| M6 | Integration and stage rehearsal | Integrator + whole team | M2–M5 | Full loop works in production, repeated scene switching remains stable, assets work locally, target machine checked, fallback build saved and tagged. |

Suggested first-day allocation: initial 1–2 hours for M0/M1; then 2–3 hours for parallel hub/controller, episode extraction and asset work, with M3 integrated early. Give the middle of the day to the selected mission and its story beats. Reserve the final 2–3 hours for integration, sound/visual review and rehearsal. Reduce story complexity or use a single reused environment before adding a second episode. If M1 takes longer, shorten content rather than skipping transition checks.

### M1: integrator checklist

- [x] Extract the single frame loop, input listeners and shared renderer lifetime into `app/` and `core/`.
- [x] Implement small scene, input, result and resource-ownership contracts with registered hub and rover scene factories. Treat these as the coordination boundary for contributor branches; changes still require the integrator.
- [x] Make old `Progress` episode-local in `scenes/episodes/rover/mission.ts`; the shared runtime has no rover progression phases.
- [x] Separate generic Mars terrain/environment services from donor/relay placements in the rover episode's `layout.ts`.
- [x] Preserve and play through the old rover loop after extraction, including alignment retry, installation, calibration, relay call and return to Mars.
- [x] Provide independent hub and episode preview entry points using the same production scene factories.

M1 implementation and the preserved rover development-browser regression are complete. The contracts in `game/src/app/contracts.ts` are now the authoritative boundary for parallel scene work. Owner visual acceptance, production/mobile review, fault UI checks and stage-hardware rehearsal remain distinct checks.

### M2/M3: hub and transition checklist

- [x] Build the tentative humanoid spirit using a clear placeholder before final rig or shader work.
- [x] Keep movement in the controller and shape/effects in appearance, so changing the silhouette does not require rewriting gameplay.
- [ ] Tune near-ground glide, bounded leap, landing and collision at normal playback speed.
- [x] Use a stable `wreck-rover-01` -> `episode-rover-01` mapping and one entry cue. Runtime readability still needs the browser review below.
- [x] Limit entry prompts to the one registered wreck; other visible wrecks have no unimplemented episode prompt.
- [ ] Save/restore the hub bookmark, clear held inputs, lock repeated transitions and recover from loading failure.
- [x] Distinguish completed from aborted prototype visits. One completed repair/call sequence followed by ten aborted visits retains exactly one completion. The hub's simple visited label is provisional, not final story progression.

### M4: episode checklist

- [ ] Verify and source a concise beat sheet for the rock discovery, Purgatory Dune, storm and return.
- [ ] Design the three interactions, transitions and scoped fallbacks for the available time; mark reconstructions and simplifications.
- [ ] Preserve direct machine control during playable beats and return camera/control clearly after transitions.
- [ ] Review the proposed skill links, map, learning check and credits against the one-day budget.
- [ ] Decide how to depict the real Opportunity rover while respecting the previously selected expressive design.
- [ ] Do not present the fictional repair, decommissioning or unanswered call as Opportunity’s history.

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

The contributor base for this extraction is Git tag `runtime-foundation`. Both the compiled production repair-to-return playthrough and the 390 by 844 hub/repair controls pass, including retry, replay, reset, pause focus and leap. Development failure injection verifies initial Reload/Retry and failed-entry Retry/Cancel, with gameplay blocked behind the recovery dialog. Evidence and remaining limits are recorded in `outputs/review/runtime-refactor/REVIEW.md`.

Use feature branches and a separate clone per computer or worktree per simultaneous local agent. Run previews on different ports. Shared contracts and dependencies have one owner. Merge small playable increments every 30–60 minutes; a clean text merge still needs a scene and transition playthrough. Binary models/textures have one owner per asset version and are never resolved by combining bytes. Instructions and example commands are in [CONTRIBUTING.md](CONTRIBUTING.md).

The shared contract now exists in `game/src/app/contracts.ts`, and scene owners can work in their separate directories against it. A second episode still requires an explicit scope decision; first finish and review the selected rover story. An additional colleague can prepare assets, layouts and beat sheets independently. Actual colleague names, GitHub handles and availability are not yet recorded; the role assignment is proposed.

## Open decisions

1. Specific player actions, success conditions and fallbacks for the three selected Opportunity moments.
2. Exact time-jump timing and scope of skill links, map and learning check; duration is not fixed.
3. Final spirit shape, body/rig route, palette and camera distance. A ghostly humanoid is the current tentative direction.
4. What the spirit is, why it enters memories, and whether completion changes it. Keep those lore choices open rather than inventing abilities or moral choices.
5. The visual response on returning to a completed wreck, and whether replay is freely available.
6. Presentation slot, target machine, exact team assignments and final game title.

## Current refactor status

The actual owner-responsibility structure is implemented, with shared app/core services, separate entities and environment code, an isolated rover episode/HUD and a placeholder hub entry/return route. The production build and 23 automated checks pass. Native development-browser review passes the preserved repair/call sequence, return to the hub and ten additional aborted visits with stable returned resource counts. Owner acceptance, fault UI, mobile/production-browser checks and stage rehearsal are tracked separately. The complete past mission, cinematic time jumps, shutdown, final spirit appearance and sound remain roadmap work. GitHub, commit and handoff status is recorded in `outputs/planning/repository-status.md`.

The GitHub account can publish code but its current login lacks workflow-publication scope. Build automation is therefore supplied as `outputs/planning/build-workflow.yml`, not an active workflow. The refactor's local production build/typecheck passes; continue running it and the automated tests before merging until the template is enabled by an authorized account.

Reference boundaries: [Fortnite's original Shadow Stone notes](https://www.fortnite.com/patch-notes/v6-00) describe increased movement, jumping and phasing. Our selected adaptation explicitly omits phasing, combat and the original consumable timer. Project Endurance remains a visual/vehicle-response quality reference, not the spirit controller specification.
