# Soft climbing audit and comparison

15 November 2026. Requested correction to the abrupt stone-climbing motion.

## Findings and change

The previous wheel envelope sampled only seven positions against a nearest-cell height cache. Contact could jump as a sample crossed an edge. The grounding solver also clamps chassis height immediately to preserve bounded suspension travel; that constraint could overwhelm its spring. At full 2.5 m/s driving speed a low step was crossed too quickly for a convincing weight transfer.

`StoneTraversal.wheelHeight` now uses 33 spatial samples and a cubic smoothstep profile across twice the tyre radius, with zero slope at its endpoints. It progressively loads and unloads climbable stones. This is an authored contact approximation, not exact circular tyre geometry; the blend can begin raising a tyre before geometric contact. Tall ledges do not receive this blend. The existing chassis springs and safety constraints remain.

`speedScale` looks ahead along each tyre route and requests 28% driving speed near raised rock surfaces. Existing acceleration/braking progressively approaches this speed; normal terrain retains its original speed. Movement, stops and reversals continuously determine the pose rather than playing a fixed animation. Additional rim samples retain tall-rock protection during pivots. No terrain artwork or morphology changed in this pass.

## Controlled measurements

Same measured Opportunity wheel configuration, flat ground, 8.5 cm by 1.8 m by 1.4 m step, initial position `(0,2.5)`, eight seconds of forward input, 60 Hz. Before source saved under ignored `work/soft-climb-before/`; harness `work/measure-climb.ts`; raw traces retained locally as `before.json` and `after.json`.

| Largest change per frame | Before | After | Reduction |
| --- | ---: | ---: | ---: |
| Chassis height | 28.35 mm | 1.54 mm | 94.6% |
| Suspension offset | 48.31 mm | 7.29 mm | 84.9% |

These measurements include the slower traversal, not just the cubic profile in isolation. They establish reduced snapping on this step, not universal smoothness across every rock or physical accuracy. Both versions complete the crossing. `metrics.json` retains exact values.

## Native comparison

`before.webm` and `after.webm` are new native canvas captures on port 5186 using identical camera, current map, low/tall fixtures, start/reset and seven seconds of W input. `comparison.mp4` puts BEFORE on the LEFT and AFTER on the RIGHT at normal speed. It is input/time matched; the revised rover deliberately crosses more slowly, so spatial events occur at different times. Test boxes are temporary development fixtures. No generated scene study or alternative animation implementation is used.

Visual observations: the revised climb spreads front/middle/rear loading over a longer interval, with gentler chassis rise and descent. Native follow-up forward/reverse recovery ends at `(0,30.27)` with six supported contacts and no warning/error observations. Native cap remains 45 fps, DPR 1.25; CPU render submission observed 0.7 ms excludes GPU and simulation cost. No thermal claim is made. Final feel remains for user acceptance.

Build/typecheck pass in an isolated output folder. All 59 tests pass, including a new per-frame continuity regression and retained climb, frame-rate agreement, tall-step stop/reverse, belly clearance and pivot escape checks. Source changes are limited to stone traversal, target speed selection, tests and documentation. The original hard safety clamp remains a limitation for extreme or unsupported terrain; this is not full articulated vehicle physics.
