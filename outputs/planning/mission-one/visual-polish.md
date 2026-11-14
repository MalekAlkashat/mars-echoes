# Mission 1 staged visual pass

Base: fd51be0 on codex/mission-one. Main and terrain are outside this change.

1. **Investigate — complete.** Visually inspected Eagle/McKittrick context, Last Chance microstructure, Berry Bowl cluster/control, NASA's RAT hardware photograph, PIA08625 working face, PIA05446 grinding-path diagram, and the RAT authors' mechanism diagrams (2004 symposium, Figures 1–3). Originals and hashes are retained. PIA08625 is Spirit in 2006: use mechanical shape only, never its later dust coating as Opportunity's early-2004 condition.
2. **Rocks and RAT — implemented and reviewed in game.** Replace regular stacked-sheet silhouettes with continuous fractured geometry; fine lamination and sheltered pores; consistent specimen outline through abrasion; embedded plus loose gray concretions; true bracing feet and separate rotating/revolving mechanism. Keep controls and progression.
3. **Cinematic entry — implemented and reviewed in game.** Inspect Focus UI kit, use restrained date/location typography and fade into authored rover framing. Pause, skip/reduced motion and saves must remain correct. Use a month/year for the combined chapter rather than imply all observations happened on one sol.
4. **In-game review — completed for this increment.** Compare before/after at identical game cameras; capture contact/withdrawal in motion, dry/brushed/abraded rock, comparison target, mobile and normal return. Preserve this verified increment without merging main.

## Evidence driving the changes

- NASA [PIA05446](https://science.nasa.gov/photojournal/grinding-wheel-profile/) identifies a small grinding paddle with two end pads, spinning on its own axis while orbiting the excavation. Model those separate motions; animation timing is illustrative and compressed, not 3,000-rpm simulation.
- [Myrick, Davis and Wilson, 2004](https://esmats.eu/amspapers/pastpapers/pdfs/2004/myrick.pdf), Honeybee Robotics, 37th Aerospace Mechanisms Symposium at NASA Johnson Space Center: Figures 1–3 show the butterfly support wings, spherical contact feet, bell housing, working face and brushes. The stated envelope is 85 mm diameter / 128 mm length. The bit shaft is offset 11.11 mm; the paddle is 23.37 mm long. The support stays loaded while the lower mechanism feeds; the casing must not spin. Do not infer an exact production CAD model from the reference reconstruction.
- [NASA instrument overview](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/) anchors materials and assembly context. The original photo contains other turret hardware, so distinguish the RAT from the surrounding instruments.
- [NASA Last Chance](https://science.nasa.gov/resource/clues-to-wet-history-in-texture-of-a-martian-rock/) guides interrupted lamination, pitting and embedded grains. It is monochrome, not a white-color reference. [Berry Bowl](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/) guides warmer stone/dark sediment contrast and clustered gray grains, with a separate brushed control.
- Preserve the selected McKittrick 45.5 mm / 4.4 mm cut as the game's explicitly inspired operation. The slab must not become a different rectangular mesh at completion. Grinding marks must read as machining, not natural stratification.

## Verified checkpoint

The eight-second entry shows February–March 2004 / Eagle Crater, reveals Opportunity, then hands over to driving. Focus-kit Rajdhani is locally hosted with OFL. E, Enter or the touch skip button skips; pause freezes the scene clock. Reduced motion uses a 3.4-second date card and fade with a stationary camera. A 0.55-second exit fade precedes the existing guarded hub transition. No reward is committed until that transition succeeds.

Production desktop and mobile playthroughs cover approach, brush, canceled and successful holds, exposed interior, both comparison targets, water interpretation, evidence and saved hub reward. Entry pause, save/reload, keyboard/touch skip, restart and failed-return retry were checked. The live rover drive and preserved repair previews still start. The new geometry regression verifies that only the intended 45.5 mm / 4.4 mm cavity changes during abrasion. 55 tests and the production build pass. See `outputs/review/mission-one-v2/REVIEW.md` for evidence and limits.

Review fixes: removed regular Voronoi/paver cracks; reduced exaggerated striation; varied and buried perimeter fragments; added environmental metal reflections; kept a single specimen through abrasion; removed weathered cracks from the cut interior; kept title text clear of the mast; corrected saved-camera initialization and suppressed mobile movement controls during entry.

## Next bounded improvement

The next design pass should address the transition from the rover to the magnified instrument operation: continuous arm/tool staging, a clearer first-contact shot and physical brush/grind feedback. Full arm articulation and audio remain unfinished. Keep the existing chapter logic, separate Berry Bowl observation and source pack. Review that pass in motion before expanding the water interpretation or other chapters. Owner visual acceptance remains separate from the automated/runtime checks above.

Worktree: `C:/Nasa 2026/mars-echoes/work/mission-one`, branch `codex/mission-one`, base `fd51be0`. Owned paths: chapter code, its geometry test, versioned references, mission typography and this review/plan. Shared contracts, main checkout, hub terrain, accepted NASA rover binaries and asset originals are unchanged. Preview 5182 (development) / 5183 (production).
