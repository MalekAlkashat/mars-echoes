# Opportunity: a quiet departure

Implemented in isolated `C:/Nasa 2026/mars-echoes/work/epilogue`, branch `codex/opportunity-epilogue`, base **6eef598019efa8500d5b66db1be92720647a3cc9**. This candidate is not merged, pushed or deployed. Main, concurrent worktrees, staged resources, stashes and existing preview servers were preserved.

The user clarified that “Mission 4” means **The Long Night (`long-night`), then the Memory Check and epilogue**. No fourth chapter was invented. This is implementation and agent verification; final aesthetic acceptance belongs to the user.

## Try and review

- Production: **http://127.0.0.1:5224/**. Enter Opportunity and choose The Long Night. Existing chapter selection/replay remains intact in this branch.
- Storage-isolated direct chapter preview: **http://127.0.0.1:5224/?mission=long-night**. Play through its actual legacy/return action; no completion shortcut was added.
- Development checks: http://127.0.0.1:5225/.
- [Desktop normal-speed ending](desktop-ending.webm), [narrow-screen normal-speed ending](mobile-ending.webm).
- [Desktop echo](desktop-echo.png), [departure](desktop-departure.png), [phone Memory Check](mobile-check.png), [phone final action](mobile-choice.png), [phone completed screen](mobile-complete.png).

Recordings start from the real Long Night legacy checkpoint captured during a fresh production playthrough, then use its ordinary successful return. The earlier full new-game-to-Long-Night run is retained locally under `work/qa/video/`. No movie or alternate scene is used by the game. Final display-idle optimization was verified separately after the visual recordings; it does not alter their choreography.

Launch from this worktree's `game/`, with Node 22.12+ on PATH:

```powershell
npm run build -- --outDir ../work/dist
npm run preview -- --port 5224 --strictPort --outDir ../work/dist
```

The supported cached executable used here was Node 22.23.5 at `C:/Users/Yooms/AppData/Local/npm-cache/_npx/52027bd8fc0022aa/node_modules/node/bin/node.exe`. Existing identical-lockfile dependencies were copied locally; no package or lockfile was changed.

## Experience and control

The hub settles beside the silent rover, presents three untimed questions with sourced feedback, then asks “What else is waiting to be understood?” One batched point object represents only actually earned chapter memories. A distant fictional blue echo introduces the final action. W, the existing touch Forward control, or **Move onward** initiates a short automatic glide with the existing spirit controller. The camera stays behind with Opportunity in frame. A scene-wide fade leads through the two requested closing lines to an explicit completed screen, with credits, primary sources, first-attempt result, replay, exploration and existing main menu actions.

Timed beats total approximately **35 seconds** (observed reduced-motion active clock: 35.149 s). Desktop and narrow recordings took about **39.8 / 35.8 seconds** including quick question responses and capture work. Reading and waiting are untimed. The 18 m path is selected at setup with 25 cm clearance/slope samples against the current world bounds and obstacle proxies. Observed route from the tested bookmark was approximately +X, ending near `(17.88, -23.17)`. Movement retains normal 4.2 m/s glide acceleration and collision; no rush, leap or new controller is introduced during the authored departure.

Pause freezes presentation and effects. Skip bypasses cinematics but cannot fabricate unanswered Memory Check responses. Each first choice is retained, with feedback rather than a pass threshold. Reduced motion holds the camera position, omits gathering fragments and preserves the text, departure and fades. The narrow view widens smoothly during the settle and uses a smaller question panel; captures verify visible rover/spirit, readable text and scrollable credits. The existing runtime remains silent; no audio framework or assets were added.

The completed opaque screen is rendered once, saved immediately, then the existing application loop stops issuing 3D draws. DOM buttons remain live; replay/exploration wakes rendering. There is still one renderer/composer, one input service and one application loop.

## Trigger, save and integration boundary

**Actual trigger:** `SceneDirector.request(return-to-hub)` accepts a matching `long-night` completed result and successfully prepares/activates the hub. Only then does its existing `session.record(result)` add SUNLIGHT and a pending finale. The hub observes this committed state on its next update. SceneDirector itself is unchanged. Failure, retry, cancellation, abort and unrelated chapters preserve the existing transaction rules.

Optional version-2 save field: `finale: { status: 'pending' | 'complete', answers: number[] }`. Strict validation requires earned long-night/SUNLIGHT, at most three integer choices 0–2, and all three answers for complete. Old valid saves remain valid; existing migrations and backup rules are unchanged. No old save is erased. A pending reload settles again at the original safe bookmark and resumes unanswered questions, rather than restoring a half-faded scene. A completed reload returns to exploration; **Revisit ending** is available beside Opportunity. Replays retain the first-attempt score. New Game clears the finale along with the existing journey. Restart/exit/disposal release the temporary overlay, material, buffer and listeners. Direct mission previews do not write the normal save; a missing preview bookmark uses the clear southern rover approach.

Shared changes for integration review:

- `game/src/app/session.ts`, `finale.ts`, `save.ts`: final-return marker and strictly validated optional persistence.
- `game/src/app/Game.ts`: hydrate/write/reset that field, save the settled ending immediately, respect the optional idle hook.
- `game/src/app/contracts.ts`: optional `GameScene.isPresentationIdle()`; no scene/result/input ID change.
- `game/src/scenes/mars-hub/index.ts`: lazy committed-finale adapter, replay entry, original bookmark preservation and lifecycle cleanup.
- Scene-owned `epilogue.ts`, `epilogue-progress.ts`, `epilogue.css`; meaningful checks in `game/tests/epilogue.test.ts`.

The concurrent **continuous-journey** branch changes chapter transactions and the same app/hub files. Preserve its full journey behavior when integrating; final `session.record(long-night)` must remain after successful final hub activation. Do not run the epilogue at an intermediate chapter boundary. The concurrent **Robot Journal** branch changes shared UI/session/save plumbing; combine optional fields and validation, never replace either parser or menu callbacks wholesale. Neither concurrent branch was merged here.

## Verification actually performed

**117/117 tests pass**, including six new tests for final transaction failure/retry/idempotence, abort/earlier chapters, mandatory first answers under Skip, paused/untimed clocks, strict saves/old compatibility and route clearance. TypeScript and production build pass. The existing large-bundle advisory remains (~755.44 kB main chunk; hub chunk ~44.95 kB plus ~3.2 kB local CSS). `git diff --check` passes.

Native browser runs used isolated Chromium contexts/storage and real production factories:

- Fresh New Game → walk to Opportunity → actual Long Night drive, full 16-second storm, archive/recovery/legacy → committed return → three answers → keyboard departure → complete.
- Purgatory successful return from its previously recorded real ending checkpoint; final-chapter abort: neither starts the ending.
- Development fault injection rejects the final hub load; both Retry and Cancel/return preserve progress and award SUNLIGHT once, only on success.
- Skip before unanswered questions, pending save/reload after the first response, completed save/reload, pause/resume, accessible button departure, main menu/Continue, replay and exploration.
- 390×844 touch emulation with browser touch dispatch through the actual d-pad; keyboard-only question controls; normal reduced-motion sequence and exact frozen active clock during Pause.
- Restart during a pending check retains its first answer and replaces the old overlay; completed screen produces zero additional production GPU draw calls; replay and exploration resume rendering.
- Repeated ending/exit cycles return to identical resource counts and zero epilogue overlays. No errors or failed required requests in the successful runtime scenarios.

Evidence sources are preserved locally in `work/qa/`: runtime.json/playthrough.cjs, extended.json/extended.cjs, final.json/final-check.cjs, settled.json/settled.cjs, production-idle.json/production-idle.cjs, gpu.json/gpu.cjs and tests.txt/build.txt. The combined exploratory scripts also retain their failed test attempts: one synthetic pointer ID was invalid, an early reduced-motion test incorrectly expected a full sequence after Skip, and one development run was interrupted by our HMR source edit. These are not counted as passing checks. Corrected real-touch production runs, the focused reduced-motion run and final production-idle check establish the stated outcomes. [Settled-state results](settled.json) and [production-idle results](production-idle.json) are successful final checks.

## Performance and resource evidence

RTX 4060 Laptop GPU, Chromium/ANGLE D3D11, 1440×900, DPR 1, balanced, unchanged 45 FPS cap. Five-second samples, 225–226 rendered frames. Timer queries used `EXT_disjoint_timer_query_webgl2`; disjoint results were rejected. GPU timings cover WebGL work, not DOM compositing. CPU values are application rAF callback time, not GPU time. [Raw results](gpu.json).

| Scenario | CPU median / p95 ms | GPU median / p95 ms | Draw calls |
| --- | --- | --- | --- |
| Main 6eef598, idle hub bookmark/camera | 0.80 / 1.30 | 6.52 / 7.79 | 94 |
| Candidate, identical idle hub bookmark/camera | 0.70 / 1.20 | 6.97 / 8.23 | 94 |
| Candidate ending choice, authored camera | 0.70 / 1.00 | 2.56 / 4.38 | 97 |

The ending camera changes coverage, so its cheaper GPU sample is **not** a same-view optimization claim. The small same-view baseline difference is a short local sample, not a thermal regression certification. Resource instrumentation measured baseline/candidate idle at **128 GL buffers, 36 textures, 26 programs**; ending choice adds one buffer and one program, with no new texture. Four complete ending/exit cycles each returned to 128/36/26 and zero overlays. These are GL resource counts, not VRAM bytes. Final completed presentation stops 3D draws instead of changing quality, resolution or caps.

## Sources and limits

New question copy was checked against NASA's [Berry Bowl interpretation](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/), [Purgatory recovery caption](https://science.nasa.gov/resource/looking-back-at-purgatory-dune/) and [Opportunity mission overview](https://science.nasa.gov/mission/mer-opportunity/), 15 November 2026. Model credit follows the repository's source record: NASA VTAD. All original mission imagery, pixels, credits and labels remain untouched. The rover is never revived and the narrator copy is not rover dialogue. The spirit and echo are explicitly fictional.

Owner review remains for cinematic taste and pacing with real readers. No physical phone, screen-reader session, sustained thermal run, public release/license audit or combined Journal/continuous-journey integration is claimed. First-choice results are local playthrough data, not a fabricated group playtest or telemetry service. Wider map/robot discovery remains outside this epilogue. Source hashes are recorded in [source-sha256.json](source-sha256.json).
