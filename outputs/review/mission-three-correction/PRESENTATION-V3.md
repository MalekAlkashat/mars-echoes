# Faster storm and post-contact presentation

15 November 2026; user-requested follow-up on the same isolated `codex/mission-three` worktree, base `548ce49`. Uncommitted and not merged/pushed/deployed. Supersedes the 40-second/manual-storm transition and post-contact information box in the preceding correction report.

The sky ramp is now **16 seconds**. Reserve, incoming energy and demand use the same 2.5× time compression, preserving the old full-ramp reserve outcome and continuous/slower drain when services stop. The scene flows into silence automatically at peak; a service action near the end receives 2.5 seconds of feedback before that transition. Skip remains a quiet “Skip waiting” option. Later story stages remain player-paced.

Silence uses large text directly over the rover scene, followed by a larger unchanged archival image, a static 1,000+ recovery-command total with June 2018–February 2019 timeline, and a SUNLIGHT/Opportunity/Spirit/Ingenuity connection screen. No generated historical imagery, live command-counter claim, new scientific measurement, voiceover or additional Three.js pass was added. Sources remain expandable, Pause stays accessible, and the historical outcome remains fixed.

The persisted storm-progress scale remains 0–40. Existing checkpoint fractions and reserve values therefore remain compatible; only the playback rate changes. Save validation, rewards, scene routing, world lighting/geometry and shared services were not changed by this revision.

Changed source: `long-night/progress.ts`, `index.ts`, `style.css`, `content/long-night.ts`, and `tests/long-night.test.ts` (under `game/`). Pre-change source snapshot is `work/presentation-v3/before.zip`.

Verification: **81 tests passed**, supported-Node TypeScript/production build and diff checks passed. Native production full routes reached silence in **16.219 seconds desktop** and **16.034 seconds touch emulation**, without using Skip. Both passed service conservation, pause/resume, all story stages, return to hub control and no horizontal overflow. Touch used 390×844, low graphics, large text and reduced motion. Separate checks passed late-action feedback grace, saved archive Continue, prior GRIND preservation and SUNLIGHT return. No page errors were recorded. A full-screen overlay initially intercepted Pause; the scene-local stacking fix was retested successfully. Direct-preview hub intro was handled as the existing preview behavior, not misreported as a return failure.

Captures: `v3-desktop-*.png`, `v3-mobile-*.png` beside this report. Runtime results: `v3-runtime.json`, `v3-checkpoints.json`. Full-speed recordings and reproduction scripts remain under `work/presentation-v3/`. Captures precede only the final cosmetic demotion of the storm's Skip button; story screens and timings are unchanged. This revision did not repeat the prior GPU benchmark because renderer/lighting work is unchanged; no new performance claim is made. Physical-device, assistive-technology user testing and owner visual acceptance remain open.

Preview: http://127.0.0.1:5208/?mission=long-night&review=presentation-v3 . Normal saved journey remains at port 5208 without the mission query.
