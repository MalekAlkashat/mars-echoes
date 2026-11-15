# Mission 2 cinematic and recovery polish

15 November 2026. `codex/mission-two`, worktree `C:/Nasa 2026/mars-echoes/work/mission-two`, base `548ce49`. Local uncommitted work. This sprint supersedes the previous practice-first controls and tiny-tap recovery described in `remediation-review.md`. Previous source was preserved under ignored `outputs/recovery/mission-two-polish-before-*`. Main, other missions, shared runtime/settings/save contracts and unrelated staged assets were not edited. No commit, merge, push or deployment.

## User-directed experience

The sequence starts automatically when the scene loads. An approximately 5.5-second reconstructed reverse drive ends with Opportunity mired. A short wheel-level reveal establishes the problem, followed by a smooth handoff to the driving camera. The player sees a large **W — Hold to ease forward** cue, a progress bar and virtual direction chevrons. W meters cautious attempts automatically; A/D steer and S reverses. Releasing W still stops motion immediately. The optional planner and cameras remain in a collapsed tools panel; WASD takes over a running ordinary plan.

After all six wheels reach firm ground and the escape marker is reached, the rover stops, the camera pulls out to show it alongside the disturbed sand, and a reflection explains the purpose: compare spinning wheels with actual progress; observe, test a small move, compare, adapt. The ending links to NASA/JPL and provides Return to Mars / Experience again actions.

This is still the isolated DEV-only slice at **http://127.0.0.1:5198/?scene=episode-rover-01&slice=purgatory**. No shared chapter completion, skill reward, checkpoint/save or hub mission entry was added. Return is the existing safe aborted-return contract; the new local ending does not pretend to award a chapter reward.

## Visual and camera contract

- Actual NASA Opportunity model, existing compact Meridiani layout and palette. No downloaded/generated assets, new landmarks or propagation to other maps.
- Removed the authored parallel entry strips. Mission-local tread decals are hidden; pooled dust remains. Physical wheel sink/ruts stay visible as the explanation of entrapment, not decorative strip tracks.
- Sand normal strength changed from 1.35 to 0.55 so fine grain competes less with broad relief. Sun elevation changed from 32 to 24 degrees to make the low crests readable; this is an authored lighting choice, not a recorded time of day. Same maps, geometry density, shadow resolution, post-processing and quality presets.
- One existing camera and update loop. Subject is the measured roughly 2.28 m wide rover. Intro is a side dolly around 4–6 m from it; stuck shot frames wheel burial; recovery retains chase/orbit; ending puts the rover on the right and leaves the left for text.
- Explicit handoffs interpolate camera position, quaternion and lens with one smoothstep stage. Duration is at least 1.15 s and increases with distance. Camera floors are bounded above sampled ground. Follow smoothing resumes after the handoff. Reduced-motion mode suppresses the dolly and animated handoff. Rendering projection remains owned by the same camera.
- Actual still inspection caught and corrected the clipped Pause control, empty objective box and ending text overlapping the rover. Pause remains accessible throughout. Keyboard input is the verified target; touch gameplay is not claimed.

## Mechanics and evidence guardrails

`RecoveryAssist` issues at most roughly 0.42 wheel-metres per held-W attempt, then a 0.16 s rest, before starting another. It does not teleport, change the soil model or grant traction. The same Driver still computes wheel spin, chassis movement, sink, footprint bounds and deep limit. Assistance operates only in soft sand; normal forward speed on firm ground remains 2.5 m/s. These pulse values are invented gameplay tuning, explicitly not a historical rover algorithm.

Sourced history in the ending was checked against the live primary pages on this date:

- [JPL, Opportunity rolls free, June 6, 2005](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/): entrapment, Earth testing, cautious increments and monitoring support the ending's history paragraph (existing PG-04/PG-12/PG-14). The educational takeaway is our interpretation, not a quotation.
- [PIA07922, Sol 446 position](https://www.jpl.nasa.gov/images/pia07922-opportunitys-sol-446-position-with-relative-heights/): reverse driving, hub-depth burial, wheel spin with little movement, the failed final turn and Earth tests support the reconstructed encounter. Compact distances and speeds are not historical commands.

The visible reconstruction/time-compression label remains. No invented NASA dialogue, feelings, calibrated soil parameters, rover autonomy claim or exact surveyed terrain is presented. Mission-local `AGENTS.md` now preserves the user-directed automatic sequence and hold-W behavior alongside the source/evidence rules.

## Verification

All **88 tests pass**, including 14 Mission 2 tests. New meaningful checks establish that one continuous held forward input recovers at 30/60/120 Hz while preserving slip/rests and release-stop behavior; camera position/quaternion/lens handoffs have no first-frame cut and stay above ground. TypeScript and production build pass; existing large-chunk advisory remains. The normal production build excludes this DEV-only route, so build success is not production Mission 2 playability.

`review-polish/checks.json` records a real-time full Chromium playthrough at 1440 × 900, DPR 1, balanced: automatic start → stuck reveal → recovery → ending. W/S, A/D, optional plan takeover, camera inspection, held-input pause/resume, ending input lock, replay/reset, responsive stills and teardown pass. The observed assisted held-W recovery takes about 11 seconds, with actual elapsed time recorded per run. No fixed-step `advance()` was used. No page/HTTP errors were recorded.

`review-polish/ending-return.json` independently verifies the ending's actual Return to Mars button and cleanup with reduced motion enabled. Captures at desktop, 960 × 640 and 390 × 844 were visually inspected; the narrow view has no horizontal overflow. Stills establish layout, not touch-input readiness.

Fresh pre-edit baseline: `review-polish-before/runtime.json`. Matched settled right-front wheel view, same mired pose, balanced quality:

| Metric | Before | After |
| --- | --- | --- |
| Render cap | 45 FPS | 45 FPS |
| Observed settled FPS | 44.5 counter sample | 44.27 measured over 180 presented frames |
| Draw calls | 64 | 63 |
| Rendered triangles across passes | 340,120 | 338,584 |
| Geometries / textures | 20 / 27 | 18 / 26 |
| Ground triangles | 55,460 | 55,460; cap 58,880 |

`review-polish/profile.json` also records **59.87 measured FPS at the actual high preset's 60 FPS cap**. Test preferences are set only in isolated browser contexts and the real cap is asserted; the app's settings can override the quality URL query, so the query label alone is not accepted as evidence. The final balanced/high CPU submission medians were 3.3/2.2 ms; these vary with host load and are not GPU timings or proof of a CPU improvement. Presented-frame intervals inherit browser refresh cadence. No visual-quality setting was lowered to obtain the results. This is one-machine development-preview evidence; production GPU timing, other hardware and the old cross-scene extra-draw-call budget remain unverified.

## Review the actual game

- `review-polish/mission-two-polish.webm`: short, uncut, normal-speed native browser capture of intro → one held-W recovery → ending. Captured from 1440 × 900 into 1280 × 800 video, with no synthetic time advancement or composited artwork.
- `review-polish/intro.png`, `stuck.png`, `recover.png`, `ending.png`: native runtime screenshots. Other captures include inspection, easing and narrow/laptop ending layouts.
- Reproducible local scripts: `review-polish.mjs`, `profile-polish.mjs`, `check-ending.mjs`, `capture-polish.mjs`. Earlier review scripts and reports describe the earlier flow and are historical evidence.

The changes stay confined to this Mission 2 representative slice pending user visual/game-feel review. User acceptance of the art target is not implied by passing checks. Full chapter integration remains a separate sprint requiring inspection of the live shared interfaces and concurrent work.
