# Mission 2 "Stuck in Purgatory": Sprint 0 audit and resource request

> Moved on 15 November 2026 from `work/mission-two-sprint0` into the Mission 2 worktree. The ledger beside it is now revision sprint-1; the orientation question (PG-16) is answered in `level-blueprint.md` section 2.

Prepared 15 November 2026, about 02:30–03:30 Asia/Riyadh. Read-only audit. No gameplay code, branch, worktree, commit or server was created. This folder is under ignored `work/`; move these two files into the Mission 2 worktree when it exists.

Companion file: `claims-ledger.json` (29 claims, sources, statuses).

## 1. Current state and ownership

### Git, checked at 02:27

| Item | State |
| --- | --- |
| Integration checkout | `C:/Nasa 2026/mars-echoes`, `main` at `548ce49`, equal to local `origin/main` |
| Shared checkout dirt | 35 staged resource additions (team-plan snapshots, hub reference, Moon Flat Macro), some with further unstaged edits; modified `AGENTS.md`; untracked `HANDOFF.md`, `TEAM_CONTEXT.md`, `run-game.bat`; three stashes. Another chat was writing there at 02:24–02:25. Not touched. |
| `work/mission-two-resources` | Branch `codex/mission-two-resources` at `9bd61b0`, clean, already an ancestor of `main`. Owned by the "Mission 2 Resources" chat. Contains only the reference pack and its handoff. The pack on `main` is byte-identical. |
| `work/mission-one`, `work/mission-one-world-polish`, `work/blueberry-continuity` | Mission 1 branches, all merged into `main`. Read-only for this task. |
| Purgatory code in any local or remote branch | None. The only matches for "purgatory" are the two resource commits. |
| Remote branches | `origin/Hazem`, `origin/terrain_fix/hazem` exist and are not merged. Neither contains Mission 2 work. |

### What is implemented (read from source at `548ce49`)

- One renderer, loop and input service (`app/Game.ts`, `core/input.ts`, `core/presentation.ts`). Frame cap 45 FPS at the default "balanced" quality.
- Scene routing: `app/registry.ts` sends everything that is not the hub to `scenes/episodes/rover/index.ts`, which dispatches to Mission 1, the drive preview or the repair prototype.
- Mission 1 lives in `scenes/episodes/rover/missions/blueberry-clue/` (12 files) with copy in `content/blueberry-clue.ts`. It is the working pattern for a chapter: own terrain field and mesh, own HUD panel, own cinematic clock, own checkpoint.
- Saves: version 2 in `app/save.ts`, with validation, v1 migration and backup. Developer previews (`?mission=`, `?scene=`) are save-disabled.
- Rewards: `session.record()` adds chapter `blueberry-clue` and skill `grind` only after a successful return to the hub.
- Rover: NASA model wrapper in `entities/rover/opportunity.ts`; `Vehicle` controller with geometric contact; `WheelEffects` with pooled dust (360) and track stamps (768).
- No audio anywhere in `game/src`.
- Tests: 15 files under `game/tests`. The context file reports 74 passing after the terrain pull; I did not run them in Sprint 0.

### Measured rover (from `rig-metadata.json`)

| Measure | Value |
| --- | --- |
| Overall width × length × height | 2.28 × 1.65 × 1.58 m |
| Wheel radius | 0.131 m |
| Front/rear wheel centres, across | 1.06 m |
| Front to rear wheel centres, along | 1.21 m |
| Collision radius used by the controller | about 1.41 m (half the footprint diagonal) |
| Suspension travel | 0.065 m |

Consequences: the whole wheelbase fits on a 2.5 m ripple. Hub depth is about 13 cm, which agrees with "more than 10 cm". The suspension cannot show that sink by itself, so sink must come from the mission's own height field and a matching visible trench. The shared 0.5 m terrain grid gives a 2.5 m ripple only five cells and cannot show a 0.16 m wheel trench, so local refinement is required.

## 2. Missing shared-interface dependencies

None of these exist for a second chapter. All are integrator-owned.

| # | File | What is hard-wired to Mission 1 | Needed for |
| --- | --- | --- | --- |
| 1 | `app/contracts.ts` | `chapter?: 'blueberry-clue'` in `SceneEntry` and `EpisodeResult`; `RoverCheckpoint` has no Purgatory variant; `MissionPhase` is Mission 1's phases | Preview route (Sprint 2), saves (Sprint 3) |
| 2 | `scenes/episodes/rover/index.ts` | Dispatch branch only for `blueberry-clue` | Preview route (Sprint 2) |
| 3 | `main.ts` | `?mission=` accepts only `blueberry-clue` | Preview route (Sprint 2) |
| 4 | `app/save.ts` | Rejects any other chapter, checkpoint kind or skill; enforces "blueberry-clue if and only if grind"; Mission 1 checkpoint limited to ±12 m | Checkpoints (Sprint 3) |
| 5 | `app/session.ts` | `record()` maps only `blueberry-clue` to `grind` | SAND and OVERTIME (Sprint 4) |
| 6 | `scenes/mars-hub/index.ts` line 60 | E always requests `chapter:'blueberry-clue'`. There is no rule for reaching Chapter 2 | Normal player journey (Sprint 5) |
| 7 | `ui/skills.ts`, `Game.ts` | Only a GRIND status line; `grindUnlocked` is the only reward hook. No tree, map or SAND/OVERTIME display | Reward presentation (Sprint 4) |
| 8 | (absent) | No audio service; no shared date-card or time-jump component (Mission 1's is chapter-local with fixed text) | Montage (Sprint 4) |

Things that need **no** shared change, confirmed in source:

- Planning UI can use DOM buttons inside a mission-owned panel with its own `AbortController`, as Mission 1 does. No new global listeners.
- Slip can be shown without editing the shared rover. `createOpportunityRover().roll()` takes previous and current contact points, so the mission can feed it commanded wheel travel while the chassis moves less.
- Sink can come from a mission-local height function passed to `Vehicle.update()`.
- Wheel-inspection and overview cameras can be mission-local, as Mission 1's macro camera is.
- Save position limit is 64 m from origin, so a map up to 80 m across fits.

Smallest coordinated addition (proposal, not built): a `ChapterId` union with `'purgatory'`; one checkpoint variant; matching validation and reward consistency in `save.ts`; one mapping line in `session.ts`; one dispatch branch; one `?mission=` value; a hub rule for which chapter E opens. Roughly six files and a few dozen lines, plus updates to `save-progress.test.ts`.

## 3. Sources checked and discrepancies found

Opened live on 15 November: R1, R2, R3, R4 (both URLs), R5, R6, R7, and the May 6, 2005 JPL release. The PIA07983 and PIA07895 captions were read from the pack's local archive only.

| # | Discrepancy | Handling |
| --- | --- | --- |
| A | Duration: "more than five weeks" (PIA07999), "nearly five weeks" of extrication (June 6 release), "five weeks" (R6), "six weeks" (R7), "more than a month" (PIA07216). April 26 to June 4 is 39 days. | Use "more than five weeks". No "Week 6". |
| B | The supplied R4 link (`...-3/`) shows July 15, 2005. The same release at the URL without `-3` shows June 6, 2005. | Cite the June 6 page. |
| C | R6 describes one stuck right front wheel that was "turned just the right amount". The 2005 releases describe all six wheels mired. No source gives a steering angle. | Do not present a stuck-wheel turn as the historical fix. The team brief's wording needs changing. |
| D | "Backed out" (R6) against "driving backwards when it became stuck" (PIA07922). | See orientation below. Status: inferred. |
| E | PIA07922 says the rover "barely inched forward" while driving backwards. | Avoid "forward" for that moment. |
| F | R5 says signals take "ten minutes or more". At the 174 million km quoted for June 2005 the one-way time is about 9.7 minutes. | Say "about ten minutes". |
| G | The pack's recovery notes give "sols 460–471" for the wheel sequence. The caption gives a start sol and "11 days later". | Do not print an end sol. |
| H | The team brief pairs 45.16 km with a 2017 date. R7 gives 45.16 km when the rover fell silent in 2018. | Montage ends in 2018. No intermediate odometer values. |
| I | The old mission-status page `mars.nasa.gov/mer/mission/status_opportunityAll_2005.html` returns 404. | Per-sol drive notes are unavailable unless an archive copy is supplied. |

### Orientation and command language

Verified: Opportunity was driving backwards (rear leading) when it bogged down.

Image reading, mine, from the pack originals:

- PIA07922 vertical projection (sol 446): the two entry tracks meet the rover at the deck end nearest the camera mast, and the opposite end leads. That agrees with rear-first travel.
- PIA07999 (sol 491): the navigation camera looks toward the trap over the deck end carrying the sundial calibration target. A trench section lies at the far end of the tracks.

Inference: the rover left by retreating along its entry path, which is chassis-forward travel. "Backed out" describes the retreat, not chassis reverse. This is **not verified**. It depends on which deck end carries the calibration target (from memory; checkable on the local NASA model in Sprint 1) and on the rover not having turned around between June 4 and June 11.

Proposed command language until that is settled: tiles name ground-relative intent, not chassis gear. "TOWARD FIRM GROUND" and "DEEPER INTO RIPPLE" replace "FORWARD" and "REVERSE"; "STEER LEFT/RIGHT" keeps the rover's own frame. The approach is staged rear-first with the PG-06 caption. If Sprint 1 confirms the inference, the recovery animation runs chassis-forward along the entry tracks.

## 4. Resources

### Already local and verified

All 25 originals in `assets/references/mission-two/v1/` match their manifest SHA-256 (rechecked 15 November).

| Ref | File | Size | Category |
| --- | --- | --- | --- |
| R1 | `images/PIA07216-rub-al-khali.jpg` + caption | 22,780 × 6,000 | NASA original imagery |
| R2 | `images/PIA07999-looking-back.jpg` + caption | 1,024 × 1,024 | NASA original imagery |
| R3 | `images/PIA07922-overhead-mosaic.jpg`, `...-relative-heights-figure1.jpg` + caption | 2,000² and 800² | NASA original imagery; figure 1 is height-coded data, not a palette or DEM |
| — | Four wheel stills (256²), one 77-frame GIF (left front) | | NASA original imagery |
| — | `PIA07895-earth-recovery-tests.jpg` | 3,008 × 2,000 | NASA original imagery (Earth laboratory) |
| — | Dense Sand 2K: diffuse, GL normal, roughness, AO | 2,048² | Licensed external analogue (Poly Haven, CC0). Tagged by supplier as trampled sand with footprints; unapproved candidate. |
| — | Runtime rover, rig metadata, `surfaces/regolith`, Mission 1 `fine-sand` | | Existing project assets |

No derived reconstructions or generated studies exist for Mission 2.

### Download requests

| Priority | Item | Format | Use | Blocks |
| --- | --- | --- | --- | --- |
| P1 | Biesiadecki & Maimone, "The Mars Exploration Rover Surface Mobility Flight Software: Driving Ambition" (2006). Link in the pack notes: `robotics.jpl.nasa.gov/media/documents/biesiadecki_maimone06.pdf`. Not opened in Sprint 0. | PDF | Settle recovery direction and how drives were commanded (PG-16, PG-17) | The command-language decision in Sprint 1. Not the map. |
| P1 | Saved copies of the five article pages read live: June 6 release, May 6 release, R5, R6, R7 | PDF print or saved HTML | Offline provenance; the pack holds only authored summaries because direct downloads returned 403 | Nothing |
| P2 | Wheel time-lapses for PIA07984, PIA07985, PIA07986 | GIF (3.7–4.3 MB each) | Per-wheel trench and packing reference for the inspection cameras | Nothing |
| P2 | PIA07922 | TIFF (3.82 MB) | Cleaner measurement of ripple spacing against the rover's known width | Nothing |
| P3 | Opportunity status reports for sols 446–491, if an archive copy can be found | Saved page | Escape sol number; per-drive wording | Nothing |
| P3 | Pancam sols 447–448 track mosaics (`pancam.sese.asu.edu/mosaics.html`, from the pack notes; not opened) | JPEG | Close colour reference for churned sand | Nothing |

Not requested: the 391 MB panorama TIFF.

## 5. Proposed mission loop

1. **Date card.** "April 26, 2005 · Sol 446 · Meridiani Planum · Reconstruction". Skippable.
2. **Firm-ground practice.** Build a plan of up to three commands, press SEND, watch it run. Planned and actual distance match. Cross one or two low ripples. The rover travels rear-first.
3. **Historical replay.** Announced as the sol 446 drive. A long drive runs; wheels keep turning, actual progress falls behind the plan, and the rover stops itself. No hidden safe route is offered.
4. **Observe.** Wheel-inspection views of sink, packed cleats and the ripple face. A short Earth-test card.
5. **Recover.** Plan, SEND, compare, revise. Small cautious plans gain centimetres. Large plans dig in up to a cap and return a clue. A checkpoint is taken at each command boundary. A compressed-time label is shown.
6. **Escape.** All six wheels on firm ground at a confirmation point. Overview camera, then a look-back composition modelled on PIA07999. "June 4, 2005".
7. **Reward and montage.** SAND recorded through the agreed interface, then the roughly 15-second OVERTIME montage with Skip and reduced motion, then return.

Labels: "Reconstruction" on the scene, "Simplified" on the puzzle.

## 6. Sprint acceptance gates

| Sprint | Gate |
| --- | --- |
| 1 | Every supplied file catalogued with hash and category. Dated reference board. PG-16 resolved or explicitly left neutral. Dimensioned top-down plan using the measured rover, with marker manifest, routes, three cameras, rejection criteria and budgets. Your review. |
| 2 | One slice with the real rover, firm ground, hero ripple and command execution. Visible mesh, wheel contact, tracks and sand zone agree. Normal-speed captures and a baseline-versus-slice performance sample at the same resolution and preset. |
| 3 | Queue, SEND, compare, bounded setbacks, retry and escape. Pause, interruption, repeated attempts, save/load at command boundaries and cleanup checked. |
| 4 | Full authored route, restrained dust and tracks, verified captions, montage with Skip and reduced motion, rewards through the agreed interface. |
| 5 | Tests and production build; full journey including entry, return, abort and completion; repeated disposal; matching performance comparison; handoff. |

## 7. Proposed working setup (not created)

- Worktree `C:/Nasa 2026/mars-echoes/work/mission-two`, branch `codex/mission-two`, base `main` at `548ce49` (recheck at creation).
- Owned paths: `game/src/scenes/episodes/rover/missions/purgatory/`, `game/src/content/purgatory.ts`, `game/public/assets/missions/purgatory/v1/`, `outputs/planning/mission-two/`, `outputs/review/mission-two/`, `game/tests/purgatory*.test.ts`.
- Ports: 5182–5188 and 5190–5195 were listening at 03:20. Proposed 5196 (development) and 5197 (production preview).
- Node: system default is v21.6.1; use the cached v22.23.5 path recorded in `MAIN_CHAT_CONTEXT.md`.

## 8. Open decisions

1. Who lands the shared routing, save and reward changes in section 2.
2. How the player reaches Chapter 2 from the hub.
3. Whether the puzzle's solution is "small cautious moves, check, revise" in place of the brief's "turn the stuck wheel and back out".
4. Whether the montage ends in 2018 at 45.16 km in place of the brief's 2017.

## 9. Not done in Sprint 0

- No tests, build or browser run of the game.
- PIA07983 and PIA07895 live pages not reopened; R6's publication date not captured.
- SAND and OVERTIME link facts (F-35 to F-37) not source-checked.
- The engineering papers and Pancam mosaic index were not opened.
- No measurement was taken from the images beyond visual reading of orientation.
