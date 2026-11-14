# Spirit and memory architecture

14 November 2026. This is a proposed implementation contract and migration plan, not a description of an already refactored runtime. Read the confirmed vision in root `ROADMAP.md` first. Existing source is preserved at Git tag `rover-v2-baseline` (commit `179705b`).

## Current code findings

`game/src/main.ts` currently creates the renderer, frame loop, input listeners, rover story, camera and world inside one initialization closure. It has no reusable scene teardown. `world.ts` exposes a donor and relay as if every world needs them. `progress.ts` is specifically the optical-repair state machine. Extending those three with more spirit/equipment conditions would concentrate every author's work in the same files.

Reuse the existing rig, terrain, materials, camera techniques and contact code. First extract runtime ownership, then package the existing rover sequence as one episode. Do not rewrite the vehicle physics, add an ECS, build a generic plugin system or introduce another framework for this scope.

## Proposed scene interface

The integrator finalizes these small types during M1 and validates them with a hub stub and rover stub before other authors depend on them. The sketch below illustrates the boundary; it is not an implemented API.

```ts
type SceneId = 'mars-hub' | 'episode-rover-01';
type Vec3 = readonly [number, number, number];
type HubBookmark = {
  position: Vec3;
  heading: number;
  cameraYaw: number;
  cameraPitch: number;
  cameraDistance: number;
};
type Entry =
  | { scene: 'mars-hub'; bookmark?: HubBookmark }
  | { scene: 'episode-rover-01'; wreckId: string };
type EpisodeResult = {
  episodeId: 'episode-rover-01';
  wreckId: string;
  outcome: 'completed' | 'aborted';
};
type SceneRequest =
  | { kind: 'enter-memory'; entry: Extract<Entry, {scene: 'episode-rover-01'}>;
      bookmark: HubBookmark }
  | { kind: 'return-to-hub'; result: EpisodeResult };

interface InputFrame {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  zoom: number;
  leapPressed: boolean;
  interactPressed: boolean;
  confirmPressed: boolean;
  rotate: number;
  opticalPressed: boolean;
}
interface GameScene {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  activate(): void;
  update(dt: number, input: Readonly<InputFrame>): void;
  resize(width: number, height: number): void;
  setPaused(paused: boolean): void;
  dispose(): void;
}
// SceneContext supplies assets, shared UI/audio and a typed request callback.
// A factory constructs a prepared scene without activating global side effects.
type SceneFactory = (
  context: SceneContext, entry: Entry, signal: AbortSignal
) => Promise<GameScene>;
```

Use scene-ID-specific entry types in the actual registry so a factory cannot accidentally accept another scene's payload. Add only actions demanded by a working scene. Shared pause and restart are handled by the application, not routed to both controllers. The input service emits one-frame actions for interact/leap/confirm and held axes for motion; consume one-frame actions once.

The present rover's Q/E alignment action must remain compatible with interact E in driving: map inputs by active mode. Spirit movement is camera-relative; rover movement stays vehicle-relative. This distinction belongs in controllers, not key listeners. The spirit obeys solid obstacles and terrain and cannot phase. Begin with the existing terrain sampler plus a simple solid collision representation; use swept movement or bounded substeps to avoid tunnelling during fast glide/leap. Tune speeds and leap parameters in a small controller config, not in scene dressing.

## Ownership and cleanup

`Game` owns a single canvas, renderer, composer, frame loop, resize handler and input listener set. The active scene supplies its scene and camera. Presentation rebinds scene-dependent passes on switching; an old AO or render pass must not keep displaying the prior scene. Only the active scene updates and receives gameplay input. A prepared destination has no independent animation loop or keyboard listeners.

Scenes own their mutable objects, mission progression, local material instances, particle buffers, local subscriptions and sounds. Disposal is idempotent. The application asset cache owns shared textures/GLB source geometry; scene disposal releases its handles without destroying resources still used by another scene. Modifying an instance's materials must not mutate a shared source used by other equipment. Loaders use cancellation checks and dispose orphaned results when an old async request completes late.

Preparation is inert: the factory must not replace the source scene's objectives, activate sounds or take input while loading. The director calls `activate()` only when the prepared destination is ready to enter. Activation presents local UI and permits local playback through app services; it does not create global listeners or restart a mission. Make activation idempotent so restoring the source UI after a failed switch does not duplicate state.

One application audio service owns the audio context. Scene-owned playback is stopped on exit, pause and reset as appropriate. Browser audio starts from a user gesture. Existing runtime is silent, so this remains implementation work; sound quality must be reviewed by listening.

## Transition sequence

1. In the hub, identify a registered, nearby enterable wreck. A stable ID such as `wreck-rover-01` maps to `episode-rover-01`; geometry names are not story IDs.
2. Capture the spirit position, heading and camera bookmark. Lock input and repeated transition requests; pause the working source scene.
3. Prepare the destination through its factory. Share cached assets where useful. The current frame can remain visible behind a restrained transition/loading view.
4. On success, bind the destination scene/camera to presentation and activate it, clear held keys and one-frame actions, then dispose source-owned resources and unlock input. Keep the hub bookmark and logical hub state in the session. Retain the source until activation succeeds; if activation fails, restore its presentation and UI instead of disposing the working scene.
5. On load failure, dispose the partial destination, keep the source scene and bookmark valid, show retry/cancel feedback and restore control. A late callback from a cancelled request cannot take over the game.
6. A memory finishes with a typed completed result, or leaves with an aborted result. The director reconstructs/restores the hub using the saved bookmark and a safe nearby return point.
7. Record completion exactly once only after successful return preparation. An aborted memory or failed load is not completed. Present-day wrecks remain dead unless a future explicit design decision changes this.

Keep one transition request active and use an abort/token guard to reject stale asynchronous completions. Reset clears input and transient transitions, local mission state and active playback through the same lifecycle. Pause freezes gameplay/time-jump timers; app loading recovery remains usable. Retain at most one working scene plus one preparing destination, not every episode ever visited. Measure peak memory on the target machine.

For this build, session state can remain in memory. Disk persistence, save migrations and world streaming are optional future work. Completion indication and replay policy remain design decisions; do not invent a collection economy or permanent upgrades.

## Migration map

| Current file | Destination/responsibility | Migration guard |
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

Small optional preview routes, for example `?scene=mars-hub` and `?scene=episode-rover-01`, should use the same registered scene factory as production. No separate showcase implementation. Preview routing is not present yet and must not be advertised as working before M1.

## Asset agreement

Current runtime imports remain unchanged during this planning delivery. New equipment uses versioned manifests, metres, +Y up and -Z local forward, stable moving-part names, known origin/pivots and simple collision proxies. The environment supplies terrain height and solids; the spirit and rover use different controllers against them. A proposed contract change to collision representation must go through the integrator.

Humanoid spirit presentation is replaceable. First prove a readable silhouette and movement with a placeholder, then decide whether an animated rig is needed. The movement reference does not authorize Fortnite models, animations or textures. Accepted rover images remain comparison references after a model is built.

## Acceptance before parallel scene authors merge

- Build/typecheck and enter/exit both stub scenes through the real director.
- Preserve the existing rover sequence, including failed and successful insertion.
- Verify only one loop and one input listener set after repeated switching.
- Inject a failed and a cancelled destination load; verify the hub stays controllable.
- Repeat ten complete/aborted visits; inspect input, UI, playback and renderer resources.
- Restore the hub bookmark safely, without placing the spirit inside the wreck.
- Confirm held input cannot move both spirit and rover during a transition.
- Check the rebuilt production asset URLs and scene-dependent render passes.

These are proposed checks for the new architecture. They have not been run because that architecture is not implemented yet.
