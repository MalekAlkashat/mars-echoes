# Mission 2 controls and pacing review

15 November 2026. Isolated checkout: `C:/Nasa 2026/mars-echoes/work/mission-two`, branch `codex/mission-two`, base `548ce49`. Fable's representative slice was uncommitted when inspected. The entire mission folder, content file, original tests and tracked route diff were copied to ignored `outputs/recovery/mission-two-before-*` before editing. No commit, merge or push was performed.

## What was actually found

The preview is `http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory`. Port 5194 served a different worktree, so it was left running unchanged. Full Chromium (`channel: chromium`) worked for review; the headless-shell attempt stalled and was not used for evidence.

Fable implemented a development-only representative slice: the existing NASA Opportunity model, multi-resolution ground, sourced ripple proportions, local slip/sink/trench approximation, command queue, historical reconstruction/recovery, six camera modes, reference board and claims ledger. The slice starts at the observation shortcut, not the full approach spawn. It has no hub chapter entry, chapter save, completion reward or production route. The regular production build tree-shakes this DEV-only route. A passing production build does not establish a playable production Mission 2.

The custom Driver never read `InputFrame.moveX/moveY`; WASD was genuinely absent. Replay pacing was 0.9 wheel-metres/second, taking about 19 seconds. It was not a rendering slideshow in the tested session: the existing balanced renderer cap was maintained.

## Repair scope

- Restored W/S drive and A/D steer through existing InputFrame and the same Driver/soil owner. Firm forward speed reaches 2.5 m/s, reverse 1.4 m/s with acceleration. Release stops motion; no second listener or loop.
- WASD cancels ordinary queued/running plans and resumes chase view. The announced replay retains exclusive movement ownership. Firm-ground speed does not bypass slip, sink or bounds. Holding manual drive beyond 0.6 wheel-metres incurs the long-command penalty; releasing allows a fresh cautious attempt.
- Player plans run at 1.35 wheel-metres/s; the reconstructed replay at 3.2 wheel-metres/s. These are explicitly time-compressed gameplay values. Distances, stuck pose, terrain dimensions and educational short-versus-long recovery behavior remain covered by tests.
- Fixed same-frame tile-click/E ordering. Added body-footprint validation for pivots, both preview and execution.
- Kept direct-driving chase orientation stable while reversing. Retained inspection cameras and the look-back payoff.
- Made command planning and camera selection collapsible. Controls are explicit. The panel is narrower; telemetry view construction and DOM refresh run at 10 Hz instead of each render. Physics/camera/effects continue at normal update rate.
- No runtime assets, geometry, maps, dependencies, renderer settings or shared save contracts were changed.

## Evidence and practical limits

Real-time browser input, 1440 × 900, device scale 1, balanced preset; full Chromium via locally cached Playwright, Node 22.23.5. No fixed-step `advance()` was used for these results. Renderer counters include all rendering passes, not just terrain.

| Check | Before | After |
| --- | --- | --- |
| Holding W for 2 seconds | 0 m | 4.303 m; stopped after key release |
| Replay wall time | 18.790 s | 5.464 s |
| Matched stationary mired render sample | 45.5 FPS, cap 45 | 45.5 FPS, cap 45 |
| Draw calls / rendered triangles in that sample | 64 / 340,120 | 64 / 340,120 |
| Geometries / textures in that sample | 20 / 27 | 20 / 27 |
| Terrain triangles | 55,460 | 55,460; budget 58,880 |
| Render submission CPU sample | 0.60 ms | 0.50 ms |

Those CPU numbers are individual submission samples, not GPU time or a statistically established speedup. RAF interval mean/p95 stayed about 14.2/14.5 ms, reflecting browser refresh cadence; actual game rendering is separately capped at 45 FPS. Do not label RAF cadence as game FPS. These are development-preview measurements, not a production or multi-device performance certification. The original cross-scene extra-draw-call budget and a high-preset/GPU benchmark remain unverified. No renderer-quality reduction was made.

`review-baseline/runtime.json` and `review-after/runtime.json` contain the matched observations. `review-controls/checks.json` records the normal-speed acceptance journey: W/S, A/D, release, plan takeover, held-input pause/resume, replay input isolation, mired manual motion, seven cautious plans to firm ground, reset of pose/sink and return-to-hub cleanup. No page errors or HTTP errors were recorded. The review folder includes native runtime stills and raw normal-speed WebM captures, including failed attempts; successful JSON, not mere file presence, establishes a passed run. Full videos are local evidence and should not be blindly committed.

Visual inspection at desktop: the full rover remains visible, panel does not cover it, source-driven low relief and dark brown Meridiani palette remain. The mired inspection clearly shows wheel burial; the look-back shows the disturbed trench. 960 × 640 and 390 × 844 layout captures were inspected: no horizontal overflow; expanded content scrolls within the panel. Desktop keyboard is the verified input target; a narrow screenshot does not prove touch gameplay. This is a functional polish pass; final art acceptance remains with the user. No claim of “Picasso level” or full chapter completion is made.

Validation: all **86 tests pass**, including 12 Mission 2 tests; TypeScript and production build pass. Existing large shared chunk advisory remains. Tests cover 30/60/120 Hz direct movement, bounded deformation, visible/contact mesh agreement, replay pose, recovery strategies, command interruption and footprint limits.

## Source checks and anti-hallucination rules

The new mission-local `AGENTS.md` makes source verification, evidence-based status, separation of facts/tuning, scope preservation, performance limitations and sprint gates persistent for future edits. The existing PG claims ledger is retained; its older checks were not silently relabeled as newly verified.

Three live primary pages were independently reopened for this pass:

- [PIA07922, Sol 446 position](https://www.jpl.nasa.gov/images/pia07922-opportunitys-sol-446-position-with-relative-heights/): April 26, 2005, wheel-hub-depth entrapment, approximately 0.33 m tall / 2.5 m wide ripple, reverse driving and failed final turn.
- [PIA07999, looking back](https://www.jpl.nasa.gov/images/pia07999-looking-back-at-purgatory-dune/): more than 10 cm deep ruts, more than five weeks of planning/testing/driving, June 11 look-back.
- [JPL, rover rolls free](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/): difficult traction and cautious recovery increments; published June 6, 2005.

No new historical or calibrated physical measurements were invented. The compact 16 m replay, direct controls, manual attempt threshold and speed changes are gameplay decisions, not recovered rover commands.

## Next sprints

1. **Controls/pacing remediation — implemented and locally verified here.** User visual/game-feel acceptance is pending. Review the preview and capture before expanding scope.
2. **One representative art/readability pass.** Keep the Meridiani reference authority. Audit the entry track strips (currently too uniform), distant ripple readability and abrupt camera cuts at normal gameplay scale. Improve one representative area, compare a fixed route at identical quality, then review before propagation. Do not invent rocks or cliffs absent from this site's references to fill the horizon. Preserve WASD and the sand-trap learning loop. Do not claim this sprint is complete now.
3. **Full chapter integration.** First recheck the live shared chapter/save/reward interfaces and current main; other chats are active. Agree the owned routing/schema changes, then implement approach, completion, reward and checkpoint handling using the current shared contract. Test completed/aborted return, reload and replay reward idempotency. This work has not been done here.

Keep every sprint handoff concrete: base/worktree, owned paths, preview port, source claims, changed behavior, checks with actual outputs, screenshots/motion evidence, performance configuration and remaining limits. Do not switch the integration checkout or touch unrelated staged resources.
