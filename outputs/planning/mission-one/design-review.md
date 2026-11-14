# Mission 1 production review — first increment

14 November 2026. Reviewer: Astra. Branch `codex/mission-one`, source base `0becdac`. This review follows `mission-one.md`; it approves the production approach below for a representative runtime proof, not final assets, completed gameplay or owner visual acceptance.

## Design decision

Make discovery legible through a change of scale: drive across a quiet shallow basin, stop beside a low fractured outcrop, then inspect centimetres of rock. The visual payoff is the contrast between light laminated bedrock and small dark grains. Keep the camera calm, the rover recognizable and the scene sparsely dressed. The scientific payoff comes from comparing a cluster against a clean surface, not a magical single-bead scan.

Use the locally retained [NASA reference board](../../../assets/references/mission-one/v1/board.html). The reference copies have been visually inspected. Original NASA source pages, dates/sols, color interpretation, dimensions and hashes are in its manifest. These images guide reconstruction; they are not tiling textures.

## Concrete scale and treatment

The gameplay grind is an explicitly compressed **McKittrick-inspired** operation: 45.5 mm diameter and 4.4 mm depth, from [PIA05459](https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/). Do not mix these numbers with the later Flatrock hole. Use a 3-second hold with a persistent time-compression label. Brushing first is a teaching sequence, not a claim that this exact playable chronology reproduces one command log.

Use an approximately 4 mm reference diameter for berries, with restrained authored variation. The mean comes from [NASA APOD's Berry Bowl account](https://apod.nasa.gov/apod/ap040405.html); variation is artistic, not a measured distribution. Keep world units in metres and add magnification. Existing spheres never spawn as a consequence of grinding. At macro scale, reveal embedded cross-sections and loose clusters separately.

For [Berry Bowl](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/), compare a cluster and the brushed Near Empty region, with a short card marking the change of observation. No grind at this target. Phrase the result as hematite-rich spherules supporting an ancient-water interpretation, not direct visual detection of minerals.

The [Flatrock account](https://www.jpl.nasa.gov/images/pia05521-focus-on-flatrock/) supplies a separate brief instrument-limit note: hard grains could obstruct the RAT. Do not invent a damage/repair mechanic or transfer its exact interruption to McKittrick.

## Asset disposition

| Asset | Decision and production route | Current status / exit check |
| --- | --- | --- |
| NASA Opportunity | Keep the supplied MER conversion, original material identities and existing wheel system; hashes match recorded provenance. | Reusable baseline; new early-mission material treatment still needs runtime inspection. No arm articulation claimed. |
| Hero outcrop | Author a low irregular slab with fine interrupted lamination, fracture planes, embedded spherules and sheltered dust. Macro surface and driving silhouette must be one coherent asset. | New asset required. Reject scaled spheres/rounded hub boulders. Compare against Last Chance structure and Berry Bowl color independently. |
| Ground | Author fine granular sand with patchy darker deposits; use NASA images for layout and palette. Evaluate existing licensed maps only for compatible microstructure. | Existing Moon Dusted 05 and Earth riverbed maps are analogues, not accepted geology. Avoid large cracked-mud motifs or lunar provenance presented as Mars. |
| RAT close-up | Custom detailed reconstruction from the NASA hardware photo and existing MER geometry. Expose working head, support/contact structure and plausible approach axis. | Source found; no isolated rig or finished macro asset. Show a labeled compressed instrument view, never a contradictory animated static arm. |
| Berries | Authored instanced small gray concretions, irregular clustering, some partly buried/embedded. | Scale defined; magnified views required. Matte mineral response, not blue gemstones or metallic balls. |
| Background | Compact authored Eagle basin and low outcrop arc. No transplanted Perseverance Valley crater wall. | Layout below is a game reconstruction, not a survey. Keep background budget below hero detail. |
| Water | Explanatory cutaway/crossfade: water within porous sediment, mineral deposition, dry return. | Clearly labeled hypothesis/interpretation; no claim of witnessed water or real-time growth. Skip and reduced motion show equivalent evidence. |
| UI | Focus corner reticle plus a small analysis panel shell; live text and progress. | Candidate catalog entries verified. Remove baked sample science data; preserve settings, saves and photography. No full-screen blue filter. |

Dust and permanent wear use separate scene-owned values. Mission 1 starts intact with restrained dust; later profiles remain definitions only. [NASA's 2014 cleaning comparison](https://science.nasa.gov/resource/cleaned-solar-arrays-gleam-in-mars-rovers-new-selfie/) demonstrates why dust cannot simply increase with age. It is not the early-2004 appearance reference.

## Blocking and shots

All coordinates and durations here are authored tuning proposals. Use a 24 by 24 m working area, rover start `(0, 7)`, preparation zone near `(0, -1.8)`, hero outcrop centered near `(0, -3.2)`, and the separate comparison vignette to its right. Actual contact offset must derive from rover/tool bounds; do not hard-code this sketch as a historical placement.

| Shot | Composition and operation | Acceptance |
| --- | --- | --- |
| Arrival | Rear three-quarter rover, outcrop left of center, low distant rim; a clear curved approach. | Destination visible without a floating arrow; rover and geology both readable. |
| Settle | Slow stop, generous work zone, automatic fine alignment; retain geographic orientation. | No sliding, wheel hover or camera crossing through rock. |
| Preparation | Stable oblique macro view; distinct brushed region and dust clearance. | Brushing changes the surface without making a crater. |
| Abrasion | Tool approaches normal to contact surface, rotates only while touching, withdraws before control returns. | Shallow 45.5 mm cut; localized powder; no arm contradiction. |
| Cluster comparison | Magnified gray grains followed by adjacent brushed control surface; label separate observation. | Both samples visible before conclusions; no spectral confidence percentage. |
| Ancient water | Explicit interpretive cutaway, about 12 seconds; Skip always reachable. | Same evidence in reduced motion; all wet materials and transient geometry removed on exit. |
| Return | Dry rock, brief evidence card and Spirit/GRIND link, then hub return. | Award only after successful return; no entire-Opportunity-story completion. |

## State and acceptance contract

| Phase | Allowed action | Exit / interruption |
| --- | --- | --- |
| Approach | Drive, look, photograph, pause | E in generous working zone settles rover. |
| Prepare | Deliberate brush action; no driving | Camera/contact clear before abrasion. Pause freezes timers. |
| Grind | Hold E or touch equivalent | Release/blur/pause cancels active hold; fresh press required. No hidden progress while paused. |
| Inspect | Advance from exposed interior to separate cluster comparison | Stable checkpoint only after tool withdrawal. |
| Reconstruct | Watch, Skip, pause | Skip and completion use the same dry-state restoration path. |
| Evidence | Read summary, request return | Failed return retains valid state and retry; no reward yet. |
| Hub restored | Existing spirit controls | Record chapter completion and GRIND exactly once; legacy wreck completion remains separate. |

## Gate outcome

**Design review: proceed to representative asset/runtime proof with the corrections above.** The current assets do not yet pass the plan's hero-quality gate. Do not expand the map or claim a playable chapter before dry outcrop, tool contact and magnified cluster pass in the actual renderer. This is Astra's design review, not a newly invented requirement for another user approval.

Completed in this increment: verified source pack, local reference images/board, rover hash/container audit, scale and observation distinctions, asset dispositions and shot/state contract. Remaining: custom hero assets, representative runtime proof, shared chapter/save/held-input foundation, full loop and runtime acceptance. No runtime source, main checkout or existing binary asset was changed by this increment.
