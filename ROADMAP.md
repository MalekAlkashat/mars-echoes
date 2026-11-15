# Spirit and machine memories: development roadmap

## Active polish backlog, 15 November 2026

The user's six-item To do list is the current polish backlog. These are planned tasks, not completed features. Existing chapter integration and approved a38322f terrain remain the baseline. This section supersedes older proposals to expand the Skills interface: replace that player-facing interface with a journal linking robots/equipment. Preserve existing chapter rewards and saved progress while migrating their presentation. The exact robot-link structure remains to be defined.

| ID | Task | Status | Owner | Completion check |
| --- | --- | --- | --- | --- |
| VIS-01 | Halo on the embodied equipment | Planned | Scene / visual owner | A readable halo identifies the equipment currently embodied during a memory; follows its model, clears on exit/reset and is checked under each mission's lighting without another renderer or loop. Exact appearance remains to be reviewed. |
| TRN-01 | Transition between Opportunity missions | Planned | Integrator + chapter owners | Completing a chapter advances to the next; leaving a memory returns to the hub; final shutdown returns to the spirit. Preserve the original hub bookmark, unlocks and checkpoints, and handle loading failure safely. Native end-to-end rehearsal passes. |
| REF-01 | Real reference images across the remaining missions, following Mission II's presentation | Mission I in progress (project owner); remaining gaps planned | Chapter owners + asset owner | Audit each chapter against Mission II, add relevant historical images at the discoveries/actions they explain, with captions, source credits and clear separation of evidence from reconstruction. Verify reveals and readability in gameplay. Keep existing Mission I work intact. |
| ANI-01 | Fix Mission I animation | Audit / fix planned | Mission I owner | Identify the affected sequence in the current mission; fix abrupt or incorrect motion and interruption/reset behavior. Capture the same action before/after at normal speed in the actual game. |
| UX-01 | Review a better way to display data than the sidebar | Design review planned | UI owner + chapter owners | Compare a compact contextual presentation with the current sidebar using actual mission evidence. Select a direction before implementation; preserve access to observations, source captions and controls without blocking the rover view. |
| JRN-01 | Replace Skills with a journal linking robots | Planned | UI owner + integrator | A journal connects discovered robots/equipment with their mission memories and evidence. Replace Skills entry points and migrate existing rewards/progress presentation without losing saves. Detailed linking behavior and content remain to be defined; verify navigation, reopen, pause and resume. |

### TRN-01: swift cinematic implementation

Use the existing scene director, chapter factories and fade infrastructure, with separate compact maps. A proposed 3–4-second transition holds on the rover briefly, fades out, displays one concise passage-of-time caption while loading, then fades into a matching rover shot before restoring controls. Keep this driven by scene state and elapsed time; no prerendered video, new renderer, animation loop or continuous connecting world is required. Final duration, wording and camera framing remain tunable.

Sequence: ancient-water discovery → Purgatory Dune → final dust storm → present-day spirit hub. Intermediate chapter completion should advance within Opportunity's memory; explicit Leave Memory should still return to the bookmarked hub. The integrator owns the typed chapter-advance request, transition lock, input clearing and save boundary. Chapter owners supply completion hooks and arrival/exit framing. Record progress and reward changes once the next destination activates successfully, retain a recoverable current scene/checkpoint on load failure, and dispose retired scene effects through the existing lifecycle.

Checks: normal chapter advance, repeated completion input, pause/resume during the fade, failed destination load/retry, reload from the next checkpoint, explicit abort to hub and final return. Confirm the implemented chapter IDs and current routing before editing; older single-chapter descriptions below are historical.

Suggested order: audit Mission I animation and chapter reference gaps; integrate safe mission transitions; apply the halo; review data presentation together with the journal so the same evidence does not acquire competing interfaces. Each task can be reviewed independently; UI design choices are not silently selected by this backlog.

## Current integration — 15 November 2026

The three production chapters, checkpoints and GRIND/SAND/SUNLIGHT return rewards remain integrated. The remote blue flame spirit and approved a38322f hub restoration below are merged with those mission updates; reference100 remains an explicit alternate. Older status/test snapshots are historical. Connected story progression, OVERTIME, the robot-linking journal, map, Memory Check, finale/audio and release acceptance remain separate work.

## Blue flame spirit, 15 November 2026

The user approved replacing the humanoid placeholder with a compact living blue flame, using their supplied image as the design authority. WASD glides at 4.2 m/s; either Shift smoothly rushes at 7.5 m/s; Space retains the bounded leap and obstacles remain solid. The implemented procedural spirit has a white-cyan core, flowing blue envelope, world-space wake, pooled embers and speed-responsive camera. It uses six effect draws, 3,074 triangles and one small noise texture without requiring bloom. Existing terrain and mission work is preserved. See `outputs/planning/spirit-flame.md` and `outputs/review/blue-flame-v1/REVIEW.md`. Build and 81 tests pass; native development/production review and ten stable memory returns pass. Final runtime visual acceptance and thermal measurement remain open. Older notes deferring spirit art or calling the humanoid current are superseded by this section.

## Approved hub restoration, 15 November 2026

The user selected the terrain from commit `a38322f`. The default hub and Opportunity drive preview again use its trough/basin terrain, fine scanned dust, varied grounded outcrops, distant crater vista and cold cloudy atmosphere. New-game spawn is `(0,8)` and Opportunity remains `(0,-25)`. Existing missions, saves, spirit work and soft stone-contact physics are retained. The newer reference100 map stays available only through `createHubEnvironment({legacyTerrain:false})`; earlier notes calling it the default are historical. Terrain/material source matches a38322f; modern contact tagging/cache integration is retained. Existing saved positions remain valid and are not cleared.

## Reference terrain update, 15 November 2026

The active branch is `fixing_terrain`. The default hub and Opportunity drive preview now use an authored 100 Ã— 100 metre terrain: broad winding sandy floor, asymmetric low western shelf and higher eastern headland, restrained orange/peach haze, sparse scanned rock anchors and debris. The three new user-supplied images under `outputs/references/terrain-100/` are the primary direction for this pass, superseding the old gray-sky hub appearance. Spawn is now `(0,36)`; the single memory rover remains at `(0,-25)`. Legacy terrain is retained through `createHubEnvironment({legacyTerrain:true})`, and the fictional repair episode remains separate.

Rendered ground and contact share the same 0.5 m triangle grid; both controllers respect explicit square bounds. The terrain world bakes the parallel physics owner's transformed rock surfaces before readiness and clears them on disposal. The measured rover supports bounded suspension, low-rock traversal, and tall-step/belly obstruction; this is geometric contact, not a full rigid-body/rollover solver. Main and side routes pass at 30/60 Hz. Current combined suite: 58 passing checks, successful isolated production build, native drive/turn/reverse plus hub entry/return checks. See `outputs/planning/terrain-100-plan.md` and `outputs/review/terrain-100/REVIEW.md`. Visual acceptance and thermal measurement remain outstanding; independent historical chapter hosting is still future work.

## Current Opportunity model integration

The user selected `24883_MER_static.usdz` as Opportunityâ€™s model. It is now converted locally to `game/public/assets/opportunity/opportunity-v1.glb` and replaces the visible hub and default playable rover. Six measured wheel pivots, steering/spin, model-specific terrain contact, bounded suspension approximation, camera and wheel effects are wired to it. Final arm/mast articulation remains unimplemented; the source is static. The normal rover episode is now a drive preview; the old fictional repair sequence is retained at `?scene=episode-rover-01&prototype=repair`. Build and all 33 automated checks pass, with native production/development motion review recorded in `outputs/review/opportunity-v1/REVIEW.md`. Historical missions and owner visual acceptance remain outstanding.

## Current development priority: base exploration map and mission foundation

Build the present-day Mars base map first, using the existing spirit placeholder for roaming and discovering Opportunity while final spirit design is prepared. The hub remains the player-facing starting point. Finish shared terrain and the mission-host foundation, then develop Opportunityâ€™s three chapters in independent directories in parallel. The user confirmed a separate compact map for each chapter, using shared terrain, rover, camera and lighting systems. See [mission foundation](outputs/planning/mission-foundation.md) for the source audit, proposed ownership, terrain targets and acceptance checks. The current code still opens the placeholder hub; direct mission hosting and per-mission maps are not implemented. The spirit-to-memory flow below remains the intended player journey; direct mission previews are a development shortcut, not a replacement for the hub. Earlier M1â€“M3 checks establish runtime readiness; they do not establish readiness for independent chapter development.

The first Mars-reference hub redesign is now implemented and agent-checked. It removes all decorative rover copies, uses shallow troughs, low shelves and a distant crater vista, and places the single memory entrance at `(0,-25)` from spawn `(0,8)`. Shared presentation now has a balanced pixel/frame budget and stops composing paused views. Build and all 26 automated checks pass; native development-browser traversal, entry/return and repeated abort checks pass. See `outputs/review/mars-hub-v1/REVIEW.md` and `outputs/references/mars-hub/reference-direction.md`. This is not user visual acceptance, a final Opportunity asset, a thermal measurement or the completed mission-host foundation.

Updated 14 November 2026. Working repository name: `mars-echoes`, not an approved game title.

## The game we are making

Explore Mars as a spirit, enter the remains of abandoned equipment, experience that equipment's past mission through playable moments, and return to the spirit in the present.

The hackathon target is one complete equipment story in a compact Mars exploration area. The present-day hub contains a single rover entrance in a broad Mars-informed landscape; the user removed the decorative rover graveyard. This remains a single-player stage demonstration, developed in roughly one day with AI and colleagues. The presentation length and target computer are still unknown; the earlier 3â€“5-minute suggestion is not a requirement.

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
- The existing expressive twin-eye rover remains the fictional prototypeâ€™s accepted design reference. The user selected the NASA MER static USDZ as Opportunityâ€™s design authority; the original expressive concept remains historical prototype material.

### Implemented foundation versus remaining story work

The runtime has now been reorganized into the ownership boundaries below. `main.ts` bootstraps the app; shared application, input, asset and presentation services run scene factories. The preserved rover sequence lives in `scenes/episodes/rover/`, including local mission progression and HUD. A compact placeholder hub uses the shared Mars environment and a separate spirit controller/appearance/camera. It provides entry into that rover sequence and a return route to the hub.

Git tag `rover-v2-baseline` preserves the original rover-only version. The new work implements the M1 runtime foundation and minimal M2/M3 integration, not the complete past mission, shutdown ending, final spirit model or audio pass. The existing repair and unanswered-call material is fictional prototype content, not an event in Opportunityâ€™s history. A memory may begin with a functional machine; stage-two deterioration describes the previous opening and present-day remains, not a required initial memory condition.

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

| ID | Deliverable | Status | Owner | Depends on | Completion check |
| --- | --- | --- | --- | --- | --- |
| M0 | Saved rover baseline, roadmap and collaboration setup | Complete | Integrator | None | Local repository, baseline tag, build pass, documented ownership; remote connected when GitHub access is available. |
| M1 | Shared runtime/input lifecycle and unchanged rover scene extraction | Complete | Integrator | M0 | Existing repair-to-relay behavior still works; one loop/listener set; extracted scene enters, pauses, exits and disposes. |
| M2 | Spirit movement and compact Mars hub | Implemented; tuning/review open | Hub owner | M1 contract freeze | WASD movement relative to camera, readable leap/landing, slopes, solid obstacles, camera clearance and reset work in the actual scene. |
| M3 | One complete enter/return route using the preserved rover scene | Implemented; recovery checks open | Integrator + scene owners | M1; simple M2 | Enter a designated wreck, play the existing rover sequence, return beside it. Loading failure, abort and repeated interaction recover correctly. This proves infrastructure, not the completed story. |
| M4 | Opportunity’s three historical moments and return | Partial; historical chapters unfinished | Episode owner + integrator | M1, M3; verified historical beats | Player experiences the rock discovery, dune entrapment and storm through clear interactions or scoped cinematic transitions, followed by a typed completion and return. Label reconstructions and simplifications. |
| M5 | Spirit/rover art, sound and cinematic continuity | Partial; final art/audio review open | Asset owner + scene owners | Placeholder loop first; M4 beats for final timing | Readable ghostly silhouette, coherent scale/lighting, approved rover identity, meaningful motion and audible story cues checked in runtime. |
| M6 | Integration and stage rehearsal | Pending | Integrator + whole team | M2–M5 | Full loop works in production, repeated scene switching remains stable, assets work locally, target machine checked, fallback build saved and tagged. |
| REF-01 | Mission I: integrate real-life image references using Mission II as the presentation reference | Implemented; owner visual review pending · 15 November 2026 | You (project owner) | Existing Mission I chapter | Select relevant historical images and connect their placement/reveal conditions to the actions and discoveries they explain; retain captions, source credits and the distinction between observation and reconstruction; review in gameplay. Implementation and checks: [Mission I archive review](outputs/review/mission-one-archive/REVIEW.md). |

Suggested first-day allocation: initial 1â€“2 hours for M0/M1; then 2â€“3 hours for parallel hub/controller, episode extraction and asset work, with M3 integrated early. Give the middle of the day to the selected mission and its story beats. Reserve the final 2â€“3 hours for integration, sound/visual review and rehearsal. Reduce story complexity or use a single reused environment before adding a second episode. If M1 takes longer, shorten content rather than skipping transition checks.

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
- [ ] Do not present the fictional repair, decommissioning or unanswered call as Opportunityâ€™s history.

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

Use feature branches and a separate clone per computer or worktree per simultaneous local agent. Run previews on different ports. Shared contracts and dependencies have one owner. Merge small playable increments every 30â€“60 minutes; a clean text merge still needs a scene and transition playthrough. Binary models/textures have one owner per asset version and are never resolved by combining bytes. Instructions and example commands are in [CONTRIBUTING.md](CONTRIBUTING.md).

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
