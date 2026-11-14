# Mission 1 site and ancient-water redesign

Base: `864724f`, clean `codex/mission-one`, `C:/Nasa 2026/mars-echoes/work/mission-one`. Main is independently at `9bd61b0` with Mission 2 references; it is not part of this change. Scope: this chapter's site, reconstruction and directly affected copy/tests. No shared contract, renderer, controller, input, dependency or hub changes.

## Observed / established / inferred

- **Observed runtime:** normal rover view and temporary overview show a nearly complete chain of evenly separated pale rocks around a compact central pile. Full 12-second ending recorded at normal game timing: five rectangular layers move vertically, a large translucent rectangle sits above them, pale cyan points move across it, and the dry specimen returns abruptly. Captures: `work/mission-one-site-v3/before/`.
- **Source-established:** `art.ts` distributes 36 slabs at radius 11 m with angular increment .19; `surface.ts` uses a rotationally symmetric height function. The ending uses boxes, a plane, points and vertical offsets. `progress.ts` owns the 12-second interval and safe water→compare restore. Direct previews disable persistence.
- **Inference:** the repeated closed perimeter plus isolated central target causes the ceremonial reading. Rectangular silhouettes, independent water/rock motion and abrupt dry return break the ending's material continuity.
- **References opened:** retained NASA PIA05755 panorama, Berry Bowl PIA05634 and supplied Hazcam imagery. Primary NASA pages rechecked for the panorama and Berry Bowl interpretation. Use a shallow basin with uneven bedrock exposure; the plan is not a surveyed Eagle map. Separate McKittrick abrasion and Berry Bowl measurement remain intact.

## Spatial proposal (metres, +Y up, forward −Z)

See `site-v3.svg` for authored plan, not an engine export. Keep the existing ±11 m drive boundary and work trigger `(0,−1.5)`, radius 2.4 m. Comparison and reconstruction remain labeled magnified views, not new drive objectives.

- Fresh spawn **(4,7), heading .40 rad**; old save spawn (0,7) remains clear. Approach via approximately (3,4), (1.5,1), (0,−.25). Existing controls and speed unchanged.
- Main exposed bench runs unevenly from the west shoulder (−7,3) toward (−5,−4) and the north working face (0,−4.5). Grouped, partially buried slabs vary in orientation, thickness and spacing. No full perimeter chain.
- Short detached exposure toward (5,−7), sparse eastern fragments; open south/east apron. Small fragments stay near parent exposures rather than tracing a boundary.
- At least **5.5 m wide approach**, and an approximately **8 m turning pocket centered (3.5,3)**. Runtime measured rover is 2.279 × 1.648 m in plan, conservative collision radius **1.406 m**. A 5.5 m passage leaves about 1.34 m clearance each side of that collision envelope. At 2.5 m/s and roughly .98 rad/s full turn authority, a full-speed turning envelope is approximately 7.9 m diameter; stopping/pivoting remains available.
- Keep low crater curvature, but offset/stretch its basin and add a broad west shoulder. Preserve exact heightfield/contact triangle agreement. Mild route slopes; test all wheel contacts and camera minimum ground clearance.
- Build render placements and conservative circular obstacles from one chapter-local layout. Fine chips are explicitly nonblocking. Camera receives the same obstacle set. Preserve target sightline from spawn and the final approach.
- Views: original legacy-spawn camera for fair comparison, fresh cinematic/gameplay spawn, identical overview at (0,30,15) looking at origin, working-zone view. Main sunlight and quality remain fixed.

## Reconstruction proposal

Retain the irregular specimen and licensed rock detail. Replace the former boxes/plane/points with a single anchored wetness field shared by rock and adjacent sediment: irregular porous onset, coupled darker color and lower roughness, no blue overlay or moving slab. Standing water adds little to this view and is omitted. Embedded grains appear by material crossfade at fixed positions, followed by dry exposed grains; this is a compressed explanatory transition, not measured formation kinetics or an erosion simulation.

Timeline: 0–1 s transition from observed dry target; 1–4.5 s moisture spreading through pores; 4.5–8 s inferred mineral accumulation with geological-time label; 8–11.6 s drying and later exposure; last .4 s fully dry before evidence. The 12-second phase remains unchanged. Every exit resets the wetness and temporary mineral visibility explicitly. Reduced motion shows a stationary wet/embedded tableau with all three explanatory steps in live text, then the same dry evidence. Skip reaches the same clean state.

Science copy must say inferred past, long ago and compressed geological time; mineral identity comes from instrument measurements. No present-day flowing water, grinding-created berries or validated geochemical simulation is implied.

## Acceptance / handoff plan

1. Capture baseline and finish this plan before editing runtime. **Done.**
2. Implement local layout/ground/collision changes and anchored material reconstruction. **Done.** The old 44-slab arrangement is replaced by 21 grouped slabs and 168 inexpensive nearby flakes. Both navigation and camera use the authored slab placements. The observed brushed patch fades out and back around the inferred past.
3. Compare same-setting views; drive fresh and legacy-save routes, steer/turn/reverse, check contact/collision/camera. Capture complete normal-speed ending plus pause, skip, reduced motion, restart and safe reload/return. **Done.** See the [runtime review](../../review/mission-one-site-v3/REVIEW.md) for actual scenarios and distinctions between native input, read-only instrumentation and automated geometry checks.
4. Run supported Node tests/build, inspect errors/requests, measure actual cost and preserve main hashes. Deliver source revision, launch commands, before/after stills/footage and limits. **Done.** 60 tests pass on Node 22.23.5; production build and clean New Game journey pass. Main's 1,370-file snapshot is unchanged. Owner aesthetic acceptance remains open.

Source links: https://science.nasa.gov/photojournal/opportunity-captures-lion-king-panorama/ · https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/ · https://science.nasa.gov/resource/clues-to-wet-history-in-texture-of-a-martian-rock/. Existing claims M1-C01, C04, C05; no new mineral-identification claim.
