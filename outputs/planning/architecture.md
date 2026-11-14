# Spirit and memory architecture

## Current Opportunity model integration

The user selected `24883_MER_static.usdz` as Opportunity’s model. It is now converted locally to `game/public/assets/opportunity/opportunity-v1.glb` and replaces the visible hub and default playable rover. Six measured wheel pivots, steering/spin, model-specific terrain contact, bounded suspension approximation, camera and wheel effects are wired to it. Final arm/mast articulation remains unimplemented; the source is static. The normal rover episode is now a drive preview; the old fictional repair sequence is retained at `?scene=episode-rover-01&prototype=repair`. Build and all 33 automated checks pass, with native production/development motion review recorded in `outputs/review/opportunity-v1/REVIEW.md`. Historical missions and owner visual acceptance remain outstanding.

## Latest phase: base hub and mission foundation

Final spirit art is deferred; the present-day exploration hub is required first and uses the existing placeholder. See `mission-foundation.md` for the audit, configurable terrain, independent chapter maps and developer previews. Reuse the implemented hub/episode entry, bookmark and return contract for the outer journey; add chapter sequencing inside the rover host through the integrator. Keep one shared renderer/input lifecycle.

The first Mars-reference hub redesign is now implemented and agent-checked. It removes all decorative rover copies, uses shallow troughs, low shelves and a distant crater vista, and places the single memory entrance at `(0,-25)` from spawn `(0,8)`. Shared presentation now has a balanced pixel/frame budget and stops composing paused views. Build and all 26 automated checks pass; native development-browser traversal, entry/return and repeated abort checks pass. See `outputs/review/mars-hub-v1/REVIEW.md` and `outputs/references/mars-hub/reference-direction.md`. This is not user visual acceptance, a final Opportunity asset, a thermal measurement or the completed mission-host foundation.

14 November 2026. The runtime organization and contracts described here are implemented. Read the confirmed vision in root `ROADMAP.md` first. The earlier flat rover-only source is preserved at Git tag `rover-v2-baseline` (commit `179705b`). This is the shared runtime foundation plus a placeholder hub and preserved repair/call episode, not the complete past mission, shutdown ending or final spirit asset.

## Actual ownership boundaries

### M3 save and interface addition, 14 November 2026

`app/save.ts` now validates and migrates versioned browser saves, including the active `SceneEntry`, original hub bookmark, completed wreck IDs and timestamp, with a last-valid backup. `RoverCheckpoint` in `app/contracts.ts` is the serialized boundary for the current Opportunity drive preview and preserved repair prototype; optional `GameScene.getSaveEntry()` lets the scene report that data. `SceneDirector` calls its optional `settled` hook only after successful scene switching and related session mutations commit. `Game` owns periodic/lifecycle/manual saves and resume entry selection; scenes still own local progression. Existing v1 exploration saves migrate; no full historical-mission campaign or general skill-economy state is implied.

`ui/main-menu.ts` owns title/settings/confirmation focus, and `ui/skills.ts` adds the first Photograph Terrain node. `Game` renders and captures the existing scene for its PNG action. The side pause menu provides Save Game and Skills without adding another renderer, global input listener or animation loop. Runtime branding is Abandoned but not Forgotten at the user's request. Save tests and native browser evidence are documented under `outputs/review/m3-memory-ui/`.

`game/src/main.ts` now selects the initial scene and bootstraps `app/Game.ts`. `app/` owns the director, contracts, registry and session. `core/` owns one input listener set, shared assets and presentation. The hub lives in `scenes/mars-hub/`, with separate controller/appearance/camera under `entities/spirit/`. The rover episode owns its factory, `mission.ts`, `hud.ts` and donor/relay layout. Reusable rover parts live under `entities/rover/`; generic Mars terrain, materials, atmosphere, dressing and resource disposal live under `environments/mars/`. Shared UI primitives/styles live under `ui/`, and stable wreck mapping lives in `content/equipment.ts`.

The existing rig, terrain, materials, camera techniques and contact code are retained in those modules. Keep story conditions inside the episode and shared ownership in the application. Do not rewrite vehicle physics, add an ECS, build a generic plugin system or introduce another framework merely to add the next scene.

## Authoritative implemented contract

`game/src/app/contracts.ts` is the source of truth. Contributor branches use that revision rather than maintaining a separate interface sketch. The integrator owns contract changes.

| Actual export | Meaning |
| --- | --- |
| `SceneId` | The registered IDs `mars-hub` and `episode-rover-01`. |
| `HubBookmark` | Spirit position/heading and camera yaw/pitch/distance for return. |
| `SceneEntry`, `EpisodeEntry` | Discriminated hub/episode entry payloads; the episode carries its wreck ID. |
| `EpisodeResult` | Episode ID, wreck ID and `completed` or `aborted` outcome. Completion currently describes the preserved prototype sequence, not the complete planned story. |
| `SceneRequest` | `enter-memory` with entry/bookmark, or `return-to-hub` with result. |
| `InputFrame`, `emptyInput()` | Normalized motion/look/rotation axes, drag/zoom deltas and one-frame start/interact/confirm/optical/replay/return/leap actions. |
| `GameScene` | Scene ID, Three.js scene/camera, film-effect state, and `activate`, `update`, `resize`, `setPaused`, `restart`, `dispose`, `debug` methods. |
| `SceneContext` | Shared assets, renderer, UI and session, plus the guarded request callback and input clearing. It does not create or own an episode-local renderer. |
| `SceneFactory` | Async context/entry/abort-signal preparation returning a `GameScene`. |
| `assertActive()` | Abort-signal guard for preparation. |

`app/registry.ts` dispatches to the concrete typed hub or rover factory. Shared pause and restart are handled by the application, not routed to both controllers. The input service emits one-frame actions for interaction and held axes for movement; consume one-frame actions once. Camera and entity classes do not install their own DOM listeners.

The present rover's Q/E alignment action must remain compatible with interact E in driving: map inputs by active mode. Spirit movement is camera-relative; rover movement stays vehicle-relative. This distinction belongs in controllers, not key listeners. The spirit obeys solid obstacles and terrain and cannot phase. Begin with the existing terrain sampler plus a simple solid collision representation; use swept movement or bounded substeps to avoid tunnelling during fast glide/leap. Tune speeds and leap parameters in a small controller config, not in scene dressing.

## Ownership and cleanup

`Game` owns a single canvas, renderer, composer, frame loop, resize handler and input listener set. The active scene supplies its scene and camera. Presentation rebinds scene-dependent passes on switching; an old AO or render pass must not keep displaying the prior scene. Only the active scene updates and receives gameplay input. A prepared destination has no independent animation loop or keyboard listeners.

Scenes own their mutable objects, mission progression, local material instances, particle buffers, local subscriptions and sounds. Disposal is idempotent. The application asset cache owns shared textures/GLB source geometry; scene disposal releases its handles without destroying resources still used by another scene. Modifying an instance's materials must not mutate a shared source used by other equipment. Loaders use cancellation checks and dispose orphaned results when an old async request completes late.

Preparation is inert: the factory must not replace the source scene's objectives, activate sounds or take input while loading. The director calls `activate()` only when the prepared destination is ready to enter. Activation presents local UI and permits local playback through app services; it does not create global listeners or restart a mission. Make activation idempotent so restoring the source UI after a failed switch does not duplicate state.

`core/menu-audio.ts` provides one application-owned context for warmed menu clicks and the supplied title-only music loop. `Game` routes marked menu controls, gestures, foreground and title state through its existing lifetime. Master/Effects/Music/Mute control gain; one cached music buffer and at most four click voices are retained. Title music fades out for gameplay/background and resumes its offset on return. Audio starts from a user gesture and disposes with the app. Scene/story audio remains future work; listening acceptance remains separate.

Optional `GameScene.getMapSnapshot()` supplies actual current player/heading, terrain identity/sampler/bounds and objective to `ui/world-map.ts`; it does not infer gameplay state from saves or debug fields. MainMenu owns its modal/focus/inert lifetime. Game owns pause restoration and the existing shared M hotkey. `InputFrame.boost` carries held Shift to the spirit controller; no separate keyboard loop is created.

## Transition sequence

1. In the hub, identify a registered, nearby enterable wreck. A stable ID such as `wreck-rover-01` maps to `episode-rover-01`; geometry names are not story IDs.
2. Capture the spirit position, heading and camera bookmark. Lock input and repeated transition requests; pause the working source scene.
3. Prepare the destination through its factory. Share cached assets where useful. The current frame can remain visible behind a restrained transition/loading view.
4. On success, bind the destination scene/camera to presentation and activate it, clear held keys and one-frame actions, then dispose source-owned resources and unlock input. Keep the hub bookmark and logical hub state in the session. Retain the source until activation succeeds; if activation fails, restore its presentation and UI instead of disposing the working scene.
5. On load failure, dispose the partial destination, keep the source scene and bookmark valid, show retry/cancel feedback and restore control. A late callback from a cancelled request cannot take over the game.
6. A memory finishes with a typed completed result, or leaves with an aborted result. The director reconstructs/restores the hub using the saved bookmark and a safe nearby return point.
7. Record completion exactly once only after successful return preparation. An aborted memory or failed load is not completed. Present-day wrecks remain dead unless a future explicit design decision changes this.

`SceneDirector` allows one pending transition and uses its transaction/abort guard to reject stale asynchronous completions. Its `retry()` preserves the failed transition intent, including the entry bookmark or pending completion result. `cancel()` discards that intent and retires late results. Restart clears input/transient loading and restarts the active scene through its lifecycle. Pause freezes current gameplay timers. Audio playback and authored time-jump timelines do not exist yet. At most one source and one preparing destination are retained, rather than every scene ever visited. Peak memory still needs measurement on the target machine.

`app/session.ts` implements the runtime bookmark and set of completed wreck IDs; `app/save.ts` persists them with the active scene checkpoint as described above. The current hub uses a simple prototype visited label; final mission completion presentation and replay policy remain design decisions. World streaming remains future work. The single Photograph Terrain ability is available by default; there is no collection economy or permanent-upgrade system.

## Completed source migration

| Baseline flat file | Current location/responsibility | Guard for future changes |
| --- | --- | --- |
| `main.ts` | Tiny bootstrap plus `app/Game.ts` and `SceneDirector.ts` | Preserve one loop; migrate listeners before scene authors start. |
| `progress.ts` | `scenes/episodes/rover/mission.ts` | Retain old repair phases as local behavior before revising chronology. |
| `world.ts` | `environments/mars/dressing.ts` plus scene-local `layout.ts` and factories | Donor/relay belong to the rover episode, not a universal world interface. |
| `terrain.ts`, `worldMaterials.ts`, `atmosphere.ts` | `environments/mars/` | Height samples and actual terrain must continue to agree. |
| `rover.ts`, `roverMaterials.ts` | `entities/rover/model.ts`, `materials.ts` | Preserve names, pivots and enlarged-eye reference identity. |
| `vehicle.ts`, `grounding.ts`, `wheelEffects.ts` | `entities/rover/` | Keep existing contact/drive behavior and meaningful regression checks. |
| `camera.ts` | Rover camera plus shared presentation helpers; separate spirit camera | Do not force the rover's forward direction or service view onto the spirit. |
| `rendering.ts` | `core/presentation.ts` | One renderer/composer; safely update scene-dependent passes. |
| `assets.ts` | `core/assets.ts` plus content-specific manifest entries | Preserve existing URLs until migrated and checked in production. |
| `ui.ts`, `style.css`, HTML | `ui/` and shared UI service | Only active scene presents objectives; clean old listeners/state. |
| `review.ts` | Development-only review hook | Must not become a second production loop or an independent scene implementation. |

The default and `?scene=mars-hub` open the hub factory. `?scene=episode-rover-01` opens the rover factory directly. Both use the real registry and production scene implementation; neither is a separate showcase. Development and production previews use ports 5180 and 5181 respectively in the current handoff.

## Asset agreement

Runtime source imports now follow the ownership directories. Runtime asset URLs remain at `game/public/assets/kenney` and `surfaces`; no versioned asset-directory migration was performed. New equipment should use versioned manifests, metres, +Y up and -Z local forward, stable moving-part names, known origin/pivots and simple collision proxies. The environment supplies terrain height and solids; the spirit and rover use different controllers against them. A contract change to collision representation goes through the integrator.

Humanoid spirit presentation is replaceable and currently procedural placeholder geometry in `entities/spirit/appearance.ts`, separate from its controller/camera. A final character model, palette or animated rig has not been approved or produced. The movement reference does not authorize Fortnite models, animations or textures. Accepted rover images remain comparison references after a model is built.

## Verification and remaining checks

The production build/typecheck and 23 automated checks pass: 14 director/lifecycle tests, four rover motion/contact tests and five spirit controller tests. Director tests cover guarded entry, abort/completion, factory/activation failures, cancellation, late results, stale callbacks, restart/disposal and failed-intent retry. Controller tests cover frame-step agreement, solid collision, bounded leaps and deterministic reset. These tests do not prove visuals or every browser path.

Native development-browser review separately passes the preserved rover sequence: approach, scan/extract, failed alignment, successful alignment/insertion, calibration, relay NoResponse and Return to Mars. After one completed prototype sequence, ten additional aborted visits return to the same hub position `(x,z)=(0,2.33)`, with one completion and 134 geometries/34 textures on every returned hub frame sampled. Browser error logs are empty. These observations support stable returned scene resources in that run, not a GPU-memory benchmark or final-art acceptance.

Fault UI, mobile and production-browser checks are tracked separately by the integrator's review report. Stage-machine performance, final spirit art, sound, the Opportunity chapters, time jumps and shutdown remain open. Before future scene merges, repeat the relevant lifecycle/controller checks, the native enter/return/pause/reset path, and the actual visual check for both modes; do not substitute these historical results for a changed implementation's review.
