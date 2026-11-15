# Mission 3 correction: readability and energy

Latest pacing/presentation: [PRESENTATION-V3.md](../review/mission-three-correction/PRESENTATION-V3.md) supersedes the 40-second manual transition below. The current storm takes 16 seconds, then flows into staged post-contact screens with a brief late-action feedback allowance.

15 November 2026. Narrow correction to the uncommitted `codex/mission-three` candidate at base `548ce49`. Original source, tracked diff/status and production build are preserved in `work/correction-before/`. No integration checkout, other mission, terrain/rover asset, reward, shared renderer/input/loop or dependency changes.

## Verified causes

Original storm multiplies every light by 0.06, environment intensity by 0.04, suppresses the sun and raises fog density to 0.081. At the normal camera this loses most chassis/wheel detail. Original service buttons merely disable without explicit state labels; their entire panel disappears on automatic silence at 40 seconds. Reserve was recalculated from elapsed storm and current switches, so imaging suspension at the measured point increased it from 66.25 to 72.925. Source and production captures agree.

## Selected correction

- Keep sun/sky/fog suppression. Reuse the existing non-shadow fill and retain a small reflection floor; no new light, shadow map, emissive rover or render pass. Light/reflection floors are artistic visibility aids and never enter the energy model. The first additional-point-light trial was removed. Narrow views use a chapter-local wider/upward projection to keep the rover above the card; saved orbit/controller pose remains unchanged.
- Explicit Imaging and Science activity RUNNING/SUSPENDED text survives disabled controls and silence. Polite live feedback announces actions only. Solar input, demand and stored reserve are separate. Rates use the same authored units/second so net loss is legible. Numeric UI updates at 10 Hz, with immediate action/pause refresh. The panel is constructed once, then text/properties are updated.
- A 40-second sky ramp reaches peak and holds. The player chooses Continue or Skip; no automatic screen change. The illustrative reserve continues draining while inspecting the storm. If left long enough it reaches zero as a bounded model result, but that triggers no failure or historical transition. Silence freezes the model and explicitly labels actual post-contact state unknown.
- Model demand is 1.0, 0.75 or 0.50; the last half is essential demand. Authored solar input is `0.04 + 0.31*(1-obscuration)^2`, with a 1.6 display/integration scale. Neither value is a measurement or tau conversion. Integrate `(demand - solar input)` analytically over each update. Suspending a service changes future slope only; no recharge. No-action and all-actions paths retain the same historical ending.
- New saves include accumulated reserve. Existing valid chapter saves without it migrate to their previously displayed reserve, preserving states and rewards without inventing past switch times. The save envelope stays version 2. Invalid reserve types/nonfinite/out-of-range values are rejected. Existing version 1/backup recovery remains intact.

## Evidence boundaries

Re-read [JPL's storm status report](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/) and [recovery explanation](https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/). The June 10 update says science operations remained suspended; the June 12 low-power account was an engineering assumption. Separately selectable imaging/science switches, their loads, the energy curve and timing remain the teaching abstraction described by M3-C34, not a historical command sequence or confirmed final diagnosis. M3-C18 still governs post-contact uncertainty. No new scientific numbers or archival changes were introduced.

Acceptance and matched captures are recorded in `outputs/review/mission-three-correction/REVIEW.md`. Agent verification is separate from owner acceptance, comprehension testing and physical-device testing.
