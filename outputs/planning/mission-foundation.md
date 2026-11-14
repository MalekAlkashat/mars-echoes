# Opportunity mission foundation

Updated 14 November 2026. Audited source: `30c4783`. Status: current development priorities and a proposed foundation implementation, not a finished terrain or mission system.

## Current decision

Build the present-day Mars exploration hub first. The spirit's final design is deferred, but the base map, roaming and discovery of Opportunity are required now; use the existing provisional spirit to test them. Opportunity leads into three separately confirmed compact mission maps: rock evidence of ancient water, Purgatory Dune and the final dust storm. All maps share terrain tools and cinematic presentation; historical chapters share rover control. Direct mission previews let chapter authors work independently while the player-facing journey starts in the hub.

The [shared team plan](https://claude.ai/artifact/BcobDnEKWRZhLW2Z1Cmype#game) was read in the browser, including its Tech section. Its spirit entry/return loop remains the player-facing structure. The user clarified that postponing final spirit design must not postpone the hub. Its Game section also retains inconsistent rover-model directions (accepted expressive reference versus NASA model); do not resolve that by silently replacing an asset. This pass updates local planning, not the external artifact.

## Readiness audit

| Foundation | Source observation | Readiness for parallel missions |
| --- | --- | --- |
| App lifetime | `app/` and `core/` already provide one renderer, loop, input service, asset cache and guarded scene loading | Reuse |
| Driving | Rover controller accepts a height sampler and circular obstacles; wheel contact, springs, dust and camera already exist | Reuse and test on authored hills |
| Terrain | `environments/mars/terrain.ts` hardcodes a valley, contact ridges and a central lane | Needs configurable terrain per map |
| Dressing | `dressing.ts` uses deterministic randomness, but directly imports the global height sampler and places a graveyard | Needs injected terrain and separate optional dressing sets |
| Boundaries | Controller clamps to a hardcoded circle; near terrain is a separately hardcoded rectangle | Need one map boundary shared by mesh, driving, spawn and props |
| Mission isolation | Only the fictional repair episode exists; shared `mission.ts`, `index.ts` and HUD would become contention points | Need one mission host and independent mission directories |
| Completion | Director/result contract already supports hub/episode entry and return | Reuse the outer journey; add local chapter progress and developer previews within the rover episode |
| Historical content/art | Prototype repair/decommissioning and graveyard are fictional | Preserve baseline; do not carry those events or machinery into Opportunity's past by default |

Last recorded verification: production build and all 23 automated checks passed before this planning update. Those checks cover the existing source, not proposed maps, mission hosting, terrain fun or target-computer performance. No runtime source changes or new browser playthrough are claimed by this document.

## Base exploration map comes first

The structure is one present-day hub plus three historical mission maps. Separate mission maps do not replace the hub. Proposed hub route: sheltered arrival → winding route between outcrops → reachable overlook revealing Opportunity → descent to its resting place → entry interaction. Add a short optional side route and geological landmarks for discovery. The user removed the decorative machine graveyard; use one registered rover entrance. Keep final coordinates and incidental props as proposals.

The existing spirit placeholder is sufficient to check WASD glide, bounded leap, slopes, solid obstacles and camera clearance. The hub must support reaching Opportunity, entering its memory and returning beside the same wreck after the equipment story or an abort. Whether individual chapter breaks return to the hub remains a pacing decision. Do not require finished spirit art to validate that journey, and do not alter the selected movement abilities to fit a new landscape.

## Terrain that supports play

Make the terrain offer a small sequence of choices and reveals. Proposed route: sheltered spawn → shallow bend around an outcrop → gentle ascent → crest revealing the objective → basin with room to work → alternate return route. A player should steer, choose a route, notice a landmark and arrive at an interaction rather than hold W across noise-generated ground.

Proposed tuning targets, pending actual driving review:

- Start with a compact playable area about 80–100 m across and distant scenery outside it. Keep the first objective 20–35 m of driving from spawn; the current 2.5 m/s maximum speed makes this roughly 8–14 seconds at full speed, longer with acceleration and turns.
- Main passages roughly 5–6 m wide, with a wider turning pocket at interactions. Check clearances against the full rover footprint and camera sweep, not just the controller's collision circle.
- Put 1–3 m rises across broad, smooth slopes along the route. Begin with slopes around 5–8 degrees and a short 10–12 degree test incline. These are game tuning proposals, not Opportunity operating specifications. Current body pitch/roll clamps and bounded suspension are not a steep-slope physics solver.
- Place cliffs, taller hills and sharper relief beyond navigable ground or give them explicit collision. The present controller does not reject a steep slope simply because it looks impassable.
- Keep small surface texture/ripples distinct from obstacles. Do not cover the main route with unavoidable chassis-sized rocks.
- Preserve orange ground, pale low light, cold atmospheric fill, coherent scanned surface scale and a readable rover. Use silhouettes and surface changes for navigation. Storm visibility is chapter-specific, not the default everywhere.
- Opportunity's historical scenes need scientific terrain and selected rocks, not an inherited fictional robot graveyard. Historic locations can be compact labeled reconstructions; do not imply all three events occurred in one actual valley.

The same heightfield must drive visible mesh triangles, wheel contact, camera clearance, tracks, spawn and object grounding. Per-map configuration supplies bounds, height/mesh resolution, spawn, fixed seed, obstacle proxies and named markers. A seed alone does not protect authored routes; reserve clear zones around spawn, paths and objectives before placing random decoration.

The user confirmed separate compact mission maps using shared systems. Each chapter owns its terrain configuration, authored layout, spawn, route and objective markers; the terrain generation/sampling, rover control, camera and base lighting remain shared. Do not copy those systems into each mission. Final coordinates and terrain tuning still require runtime review.

Proposed map identities for the confirmed structure:

| Chapter | Terrain/gameplay emphasis | Local responsibility |
| --- | --- | --- |
| Blueberry Clue | Outcrop approach, gentle ridge reveal, open working basin | Rock targets and reconstruction states |
| Purgatory | Low sandy ripples, readable firm approach and an authored soft-sand zone | Entrapment and simplified escape puzzle |
| Long Night | Exposed terrain with a readable route and distant landmarks | Storm progression, power choices and ending |

These are compact gameplay reconstructions, not surveyed historical maps. The specific layouts remain proposals. Sand entrapment and storm effects belong to their chapters; neither should globally change driving or visibility in the other maps.

## Small shared boundary for parallel work

Keep the existing `GameScene` boundary and app ownership. Add a rover mission host within the rover episode, rather than putting all chapter logic in the director or copying the whole scene per chapter. The integrator owns this host and the agreed mission interface.

A mission needs an ID, map/layout configuration, setup/reset/update/dispose hooks and an explicit completion event. It receives the shared rover, environment, normalized input and local presentation helpers. It must be able to temporarily restrict driving for a puzzle or cinematic; the host arbitrates that control and freezes mission timers on pause. The mission never starts a renderer, frame loop, global keyboard listener or a second rover controller.

Proposed source arrangement, not yet implemented:

```text
game/src/scenes/mars-hub/          # hub owner: present-day base map, roaming, discovery
game/src/entities/spirit/         # existing placeholder/controller; final art deferred
game/src/scenes/episodes/rover/
  index.ts                       # integrator: shared GameScene wrapper
  host.ts, mission-contract.ts    # integrator: mission lifecycle / chapter routing
  missions/
    blueberry-clue/               # mission 1 owner: logic, layout, local presentation
    purgatory/                    # mission 2 owner: logic, layout, local presentation
    long-night/                   # mission 3 owner: logic, layout, local presentation
game/src/environments/mars/       # terrain owner: configurable terrain + base look
game/src/entities/rover/          # rover owner: common control, rig and camera
game/src/content/                # assigned source-backed text and fact records
```

An integrator adds direct development selection, for example `?mission=blueberry-clue`, through that same production host. These URLs do not work yet. Keep the fictional repair episode available as an explicit regression preview. Developer previews must not require a hub visit or finished spirit art. The default player-facing route still starts in the hub. Chapter completion advances within the equipment story; completing or aborting that story returns to the hub using its bookmark. Intermediate chapter returns remain a pacing decision, not an implemented feature.

## Build order and acceptance

1. **Base hub and shared terrain:** configurable terrain/bounds, an authored exploration route, stable spawn, hills, landmarks and Opportunity's resting place. Traverse with the existing spirit placeholder; test glide, bounded leap, camera clearance, collision, reset and the approach/entry/return route. Also drive a representative test incline with the rover so shared terrain works for both controllers. Capture normal-speed traversal and review the actual appearance with the user. Automated checks alone cannot establish fun.
2. **Mission host and frozen interface:** enter from the hub and load a minimal objective using the common rover and terrain; complete/restart it, transition between chapter maps and return to the hub. Verify the same mission through a direct developer preview. Check pause, input ownership, load failure, late completion, bookmark restoration and disposal. Publish a specific tested base revision for collaborators.
3. **Parallel chapters:** mission 1 owns grind/scan/reconstruction; mission 2 owns the simplified dune puzzle; mission 3 owns storm/power/ending. Each owns its directory and local effects, using common terrain and atmosphere controls rather than editing global materials or physics. Shared changes go to their owner.
4. **Integration:** one integrator combines chapters in order and rehearses transitions, captions, sound, performance and reset. Story/art approval and target-machine checks remain distinct from code checks.

Before step 2 is merged, teammates can prepare references, fact-backed beats, assets and isolated puzzle logic. Do not send three developers into today's shared rover `index.ts` or `mission.ts` and call that isolation. After the shared interface exists, use separate clones/worktrees and `codex/` branches, unique preview ports and small merges.

## Contributor starting instructions

The current source base is `30c4783`; it is an audit baseline, not a mission-ready release. The integrator must supply the later verified foundation commit before mission integrations begin. Actual teammate names remain unassigned.

Read `.agents/skills/feature-handoff/SKILL.md` and `.agents/skills/plan/SKILL.md` for a bounded task and handoff. Terrain/layout work also reads `.agents/skills/game-level-design/SKILL.md`; appearance or movement work reads `.agents/skills/gameplay-visual-review/SKILL.md`. Task handoffs name owned paths, shared interface revision, controls, preview port, acceptance route, test results and unresolved issues. No new dependencies or chargeable asset jobs are selected by this plan.

## Implemented hub terrain increment

The first Mars-reference hub redesign is now implemented and agent-checked. It removes all decorative rover copies, uses shallow troughs, low shelves and a distant crater vista, and places the single memory entrance at `(0,-25)` from spawn `(0,8)`. Shared presentation now has a balanced pixel/frame budget and stops composing paused views. Build and all 26 automated checks pass; native development-browser traversal, entry/return and repeated abort checks pass. See `outputs/review/mars-hub-v1/REVIEW.md` and `outputs/references/mars-hub/reference-direction.md`. This is not user visual acceptance, a final Opportunity asset, a thermal measurement or the completed mission-host foundation.

`hub-terrain.ts` and `hub.ts` now separate the hub terrain/dressing from the fictional repair episode. This does not implement the proposed general per-mission configuration API or chapter host. The baseline readiness table above records source `30c4783`, before this increment.
