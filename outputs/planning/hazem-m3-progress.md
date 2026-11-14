# Hazem's M3 journey and objectives

Updated 14 November 2026 (Kuwait). This is the current progress tracker, checked against the original `HAZEM_M3_CODEX_HANDOFF.md`, current source files and retained review evidence. It replaces assumptions in the old handoff with observed status; it does not change team ownership or authorize new gameplay work.

## Original objective

Hazem's team role was **M3: Spirit, Skill Tree & Screens**. The intended player journey was spirit exploration → enter Opportunity → Blueberry Clue → Purgatory Dune → Long Night → finale teasing other machines. The four original story skills were GRIND, SAND, OVERTIME and SUNLIGHT.

The repository ROADMAP also uses “M3” for an enter/return infrastructure milestone. That milestone is distinct from Hazem's broader team role; completing entry/return does not finish the role or the historical story.

The handoff proposed React/R3F/Zustand files, but this repository implements TypeScript/Three.js with app/core services. Track working behavior rather than recreating the old filenames or installing another framework.

## Original M3 tasks versus current files

| ID | Original task | Status | Implemented / remaining |
| --- | --- | --- | --- |
| K-04 | Shared state, actions, content schema and routing | Partial | App/session/director/contracts and validated persistent saves exist. They provide the implemented state foundation without Zustand. Full historical mission progression, four skill unlocks, storm power/sunlight and quiz/content integration remain. |
| VS-06 | Title, HUD, mission cards, pause/restart and phase routing | Partial | Working title, New Game/Continue, Settings, side pause menu, Save Game, Skills, Map, loading/recovery and hub/rover routing. Final mission cards, mission HUD and complete story routing remain. Visible restart was deliberately removed; confirmed New Game is available. |
| VS-07 | Debug panel, lower priority | Not implemented | Development diagnostics and preview URLs exist, but they are not the planned user-facing debug panel. Optional until must-haves are finished. |
| CG-16 | Final spirit appearance, possession halo and entry/exit swirl | Placeholder / deferred | Replaceable humanoid placeholder and movement work. Final orb/smoke/ring art, possession-only rover halo and entry/exit swirl are not implemented. User explicitly deferred final spirit design. |
| CG-15 | Connected GRIND/SAND/OVERTIME/SUNLIGHT skill tree | Partial | Skills overlay has one working Photograph Terrain node and PNG capture, following the user's revised starting scope. The four original mission-earned skills and their unlock/progression links are not implemented; confirm that scope with the team before expanding. |
| CG-18 | Mars map with last-known regions of Opportunity, Spirit rover and Ingenuity | Partial | M opens a real local terrain map with live player/heading, objective, scale and boundary. The larger Mars/other-robots map and last-known-area circles remain. A local map is not completion of that original planet-wide task. |
| CG-04 | Storm sunlight/power logic with no fail-state soft lock | Not implemented | Dusty sky is presentation only. Playable storm progression, battery/sunlight state, safeguards and mission integration remain. Coordinate with world/mission owners. |
| CG-07 | Finale/end screen and other-machine tease | Not implemented | No completed historical finale, ending screen or Spirit/Ingenuity discovery tease. Depends on real mission completion events and confirmed story content. |
| Polish / release | UI testing, README/credits, links and submission integration | Partial | Build/tests and substantial browser UI/movement/save/map/audio checks exist. Final attribution/README pass, public build verification, team integration and target-PC rehearsal remain. Credits menu removal was the user's deliberate choice; source/license attribution still belongs in project documentation. |

## Completed working features

- [x] Fixed, non-scrolling title screen using the supplied background; title changed to **Abandoned but not Forgotten** and Credits action removed as requested.
- [x] New Game starts the present-day hub; Continue appears for valid saves.
- [x] Autosave, manual Save Game, validated backup recovery, old-save migration and active hub/rover resume.
- [x] Side pause menu; Settings with Display, Sound, Accessibility and Controls; fullscreen/graphics/text/motion preferences.
- [x] First working Photograph Terrain skill and image capture.
- [x] M local terrain map with real player and objective pins, pause/input/focus isolation and return to prior state.
- [x] F first/third-person spirit view, preserved through Continue and memory return; rover optical view retained.
- [x] Held Shift spirit glide boost with existing collision and bounded leap.
- [x] Supplied click sound with silent lead removed; levelled/stretched supplied menu music loop; Master/Effects/Music/Mute controls.
- [x] Supplied Mars rocks, varied sizes/gravel, nearby hills, smoother terrain transitions and dusty amber sky. These are additional world/camera tasks beyond the original M3 role.

Entry/return infrastructure and the Opportunity driving model also exist in the current repository. They are shared/inherited work, not evidence that the three historical missions are finished or that Hazem alone authored every system.

## What still needs doing

### Required M3 completion, coordinated with teammates

- [ ] Agree the real mission completion/unlock/storm/quiz data contract with M2 and the integrator.
- [ ] Finish mission cards, objectives/HUD and player feedback around real mission states.
- [ ] Connect the agreed story skill tree to real unlock events; preserve Photograph Terrain unless the user changes it.
- [ ] Implement storm power/sunlight logic and recovery safeguards when the Long Night mission host is ready.
- [ ] Build the agreed finale/end screen and other-machine map tease after real completion events exist.
- [ ] Finalize spirit appearance, halo and entry/exit effects when the user resumes that deferred art task.
- [ ] Finish attribution/README, verify the integrated public build and rehearse on the actual presentation PC.

### Shared dependencies, not Hazem's tasks alone

- [ ] Blueberry Clue, Purgatory Dune and Long Night historical gameplay and time jumps. The current default memory is a drive preview; the retained repair/call prototype is fictional.
- [ ] Independent mission-host/map foundation and integration with M2's mission code.
- [ ] Confirmed NASA facts/content and story captions with the story/research owner.
- [ ] Final team-approved fonts/art, mission audio, accessibility review and submission materials.

### Optional / deliberately changed

- Satellite departure/arrival cinematic: later user proposal, not an original implemented requirement; coordinate intro work rather than blocking the game on it.
- Debug panel: lower priority.
- Credits menu: intentionally removed, not a missing button to restore.
- Final font: user planned to supply/change it later.

## Recommended next steps

1. **Transfer this branch to the other PC:** retrieve `terrain_fix/hazem` from `origin` after its publication is verified. The game changes, source assets and this tracker travel together in that branch. Do not merge to main or overwrite teammates without integration review.
2. **Confirm the mission contract with M2**, then implement the remaining mission UI and skill-unlock connections against real events.
3. **Finish storm logic and finale**, with team story inputs. Resume spirit/halo art when the user chooses to.
4. **Run the full integrated story and presentation rehearsal**, including sound listening, saves, failures and public links.

## Evidence and practical limits

Latest recorded production build/typecheck and **64 automated tests pass**. Evidence: `outputs/review/m3-memory-ui/`, `terrain-fix/`, `hills-view-audio/` and `map-boost-music-sky/`. The latest combined native browser run passed 44 checks. Initial targeted audio lifecycle checks passed; later output-clock stalls made timed repetitions inconclusive, so fade/mute was independently checked with a native offline audio render. No claim of final listening acceptance or stage-machine performance certification.

Delivery branch: `terrain_fix/hazem`, based on `0becdac`; target remote is `origin/terrain_fix/hazem`. This delivery includes the latest gameplay, source/runtime assets and progress documents. Verify local HEAD matches the remote branch before switching PCs. Browser saves are local to a browser/site, and the localhost game URL only works on the computer running that server. A project name alone does not transfer source files to another PC.
