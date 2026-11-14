# M3 persistence, challenge title, pause and Skills

14 November 2026. Branch `codex/m3-main-menu`, based on `origin/main` at `8d200b1`, with this session's earlier menu work retained. Changes are local and uncommitted. The save subtask was isolated in `work/save-resume-stage`; agreed source files were copied back for a consolidated build/browser check.

## Implemented scope

- Replace Echoes of Mars and its introductory tagline with Abandoned but not Forgotten. Use a locally available condensed sans-serif font stack; no remote font dependency or imported game artwork.
- Keep the default menu fixed and free from scrolling. Escape opens a left side menu; the current world remains visible with gameplay HUD/touch controls concealed. Actions: Resume, Save Game, Skills, Settings, Main menu and contextual Leave memory. R no longer restarts; New Game stays explicit and confirmed.
- Add one available Photograph Terrain node at the head of an observation branch, with details and real PNG capture/download from a freshly rendered game canvas. Skills freezes the world and closes back to pause with focus restored. No fabricated additional skills, XP economy or mission completion.
- Extend local saves to v2: timestamp, active scene, hub return bookmark, completed wreck IDs and scene-reported checkpoint. Current Opportunity checkpoints retain position/heading/camera/optical view; preserved repair checkpoints include phase, timer and alignment state. Periodic saves run about once per second; saves also occur at committed transitions, pause, hide/pagehide and manual Save Game.
- Validate snapshots before overwriting good data, maintain backup recovery, migrate v1 exploration saves, report storage failures, replace recovery history on confirmed New Game and retain a paused Game during a back/forward-cache pagehide.

## Actual checks

`npm.cmd --prefix game run build`: typecheck and production build pass. `npm.cmd --prefix game test`: all **43** checks pass (33 existing, 10 new persistence tests). `git diff --check` passes. Existing Vite large-bundle warning remains.

Headed Chromium via the temporary Playwright CLI, actual Vite game at `http://127.0.0.1:5182/`, separate test browser profile:

- **42 UI/capture checks pass:** title and removal of old wording; manual Save Game confirmation; real photograph PNG download; Skills blocks W/Space/R gameplay input; Skills Escape/focus return; title/pause/Skills fit at 1440×900, 1366×768, 1024×600, 390×844, 320×568, 844×390 and 568×320, with standard and larger text. Nonempty photo-status text is included in the compact Skills checks. No menu scrolling or visible control clipping observed.
- **18 persistence/browser checks pass:** periodic save timestamp advances; manually saved hub position restores after reload/Continue; R cannot reset; actual W traversal reaches the rover entrance; rover driving/turning and optical view survive save/reload/Continue; the rover resumes stopped; returning to the hub saves after transition commit and retains the entrance bookmark without marking an aborted visit complete; corrupted-primary recovery offers Continue from backup; simulated quota failure is visible and retains the previous successful data; saving works again when storage is restored. No uncaught JavaScript errors observed.
- A **synthetic persisted pagehide/pageshow** pair while Skills is open checks its save/lifecycle handler and unchanged paused scene. This is handler evidence, not a full browser Back/Forward test.
- Storage corruption and quota-denial cases were injected only into the separate test profile. A browser-window focus loss initially paused traversal as designed; the final travel scenario resumed through normal UI and completed.

## Visual evidence

PNG captures here include `title-desktop.png`, `pause-desktop.png`, `skills-1440x900.png`, `skills-390x844.png`, `skills-568x320.png`, matching small pause captures, and `rover-save.png`. `terrain-photo.png` is the actual downloaded game photograph; it was visually inspected and contains the Mars scene, not a blank buffer or menu overlay. These are native runtime captures, not generated concepts. Review scripts are retained locally under ignored `work/m3-ui-review.js` and `work/m3-save-browser-review.js`.

## Limits

Saves belong to this browser profile and site origin (including port); they are not cloud/account saves and clearing browser data removes them. Storage failure is reported, not silently treated as success. An airborne hub save retains the most recent grounded checkpoint; vehicle velocity, tracks/dust and transient wheel animation are not restored. Legacy repair snapshot serialization is covered by automated tests; the complete native legacy repair replay was not repeated in this pass. Historical Opportunity missions, campaign/quiz/storm state, sound, satellite cinematic and additional skills remain future work. Visual checks do not imply user acceptance or measured device performance.
