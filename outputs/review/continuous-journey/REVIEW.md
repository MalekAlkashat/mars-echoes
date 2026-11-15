# Continuous Opportunity journey

15 November 2026, Asia/Riyadh. Candidate implementation in `C:/Nasa 2026/mars-echoes/work/continuous-journey`, branch `codex/continuous-journey`, base `6eef598019efa8500d5b66db1be92720647a3cc9`. Main remains separate. No merge, push or deployment.

## Player-facing result

Normal entry now follows Blueberry Clue → Purgatory → Long Night → one present-day return. Completed chapters persist before the next map loads. The normal entry resumes an unfinished journey; individual chapters remain explicit replay choices. Existing developer URLs remain save-disabled and do not fabricate earlier progress.

The dry abrasion circle settles into a centered composition, followed by a masked cut to a similarly framed wheel. Purgatory keeps its recovery, untouched NASA imagery and reflection before OVERTIME's wheel/years/panel passage. The final legacy screen leads through silence and darkness to the accepted blue flame at the original entry bookmark. Opportunity is not revived or altered.

Authored clocks: 2 seconds outgoing + 2.2 seconds incoming for the first bridge and final return; 6 + 2.2 seconds for OVERTIME. Actual preparation time is additional and is covered by the existing loading/cancel UI. Cameras never interpolate across maps. Incoming camera motion arcs around the rover's deck. Reduced motion uses fixed compositions/cuts. Skip retains at least 1.5 active seconds of essential incoming text. Pause and focus loss freeze bridge clocks; there are no independent animation timers. Purgatory's cinematic Skip resolves only the scripted entrapment, never the player recovery.

## Shared integration contract

- `SceneEntry` episodes have optional `journey:true`; absence retains standalone behavior. Hub `memoryReturn:true` is a transient final-arrival cue and is not saved.
- `OpportunityJourney` holds the current chapter, original bookmark, optional checkpoint, and optional `next`/`return` boundary. It is distinct from legacy prototype `completed` IDs and chapter completion sets.
- `chapter-boundary` records legitimate chapter completion and calls the existing settled/save hook **before** asynchronous preparation. The source remains recoverable until destination activation succeeds. Incoming chapter rewards are never inferred from a load.
- `remember-overtime` is guarded by earned Purgatory progress in a journey. It adds the legacy knowledge ID `overtime`, not a functional ability. If a boundary reload bypasses the outgoing montage, the incoming 2018 caption conveys that knowledge before recording it.
- `opportunityComplete` commits only after a successful final hub return and all three chapter records. Abort and standalone final-chapter replay do not create it. Replaying an already completed story retains the prior completion record.
- Save version/key remain v2. Optional fields are validated, prior saves remain readable, and old chapter checkpoints retain their standalone mode. A subsequent normal journey starts at the earliest unrecorded chapter. When every chapter is recorded, full replay starts at M1. Existing v1 migration remains.
- Early exit keeps the unfinished checkpoint and original journey bookmark. Chapter replay can change its own existing chapter records but cannot overwrite the pending journey.
- `GameScene.journeyShot` is a narrow scene-local adapter for the dry abrasion surface and recovered rover motion. `journey.ts` owns only these authored bridges and reuses each chapter's camera/world. It renders no second world and adds no renderer, compositor, input service or application loop.

**Journal branch:** derive discoveries from committed chapter records; continuous journeys now commit at chapter boundaries, while standalone chapters retain successful-return semantics. Preserve `overtime` validation and optional journey/full-story fields when reconciling save changes.

**Epilogue branch:** this task stops at restored spirit control. The final hub activates before the director commits `opportunityComplete`; the wrapper withholds hub updates through its 2.2-second arrival. An epilogue should observe the committed state when hub updates resume, not rely solely on the factory/activation moment. Memory Check and the broader epilogue remain that separate task's scope.

## Source and assets

The user supplied the creative direction. Camera matching is an authored connection, not geological or geographic continuity. The intermediate 2010 cut denotes elapsed mission years, not a claimed event at the reconstructed Purgatory location. No odometer statistic or invented historical milestone is shown.

F-03/F-04 in the supplied NASA research register support the endurance lesson; the primary [JPL mission-conclusion article](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/) was read on 15 November 2026. Existing mission claim registers and archive labels remain authoritative. No NASA pixels, asset files, model, texture pack, dependency, lockfile, graphics preset, resolution policy or FPS cap changed. No sound or external video was added.

## Verification

120 automated tests pass, including nine new journey transaction/save tests. Supported Node 22.23.5 TypeScript and production build pass. Tests cover ordered progression, wrong/unplayed results, durable outgoing rewards on failure, source recovery, cancellation/late resolution, retry, replay isolation, final-return gating, boundary reload and OVERTIME deduplication. The existing 111 checks remain passing.

Fresh isolated production browser playthrough: New Game, native hub traversal, all M1 investigation/reconstruction steps, native Purgatory recovery and original archive, 16-second Long Night storm/conservation/archive/recovery, and one final return. No page errors or failed required requests. The recorded storm took 16.004 seconds in the uninterrupted production run before the final narrow-screen framing, wording and M1 evidence-screen early-exit refinements. The final source additionally passed two complete journeys in the same development-browser session, with 16.003- and 16.000-second storms, no page errors or failed required requests, and no duplicate rewards. Both returns measured 30 geometries, 32 textures and one application loop.

Seeded development edge checks supplement that full playthrough; they do not pretend to be fresh playthroughs. They pass M1 boundary pause/reload, Purgatory cinematic Skip without completion, exact recovery pose/soil reload, focus pause, early exit/reentry/restart, an injected Long Night image failure/retry, in-flight cancellation/exit/resume, final-boundary reload and later hub movement/save. Four abort/replay cycles returned to 30 geometries, 32 textures and one loop each. Native browser touch events at 390 × 844, large text and reduced motion pass pause/Skip and chapter progression without overflow or awarding unplayed SUNLIGHT. Their final page-error list is empty.

The final production smoke run also passes M1 evidence-screen early exit without completion, checkpoint reentry and legitimate continuation; Purgatory cinematic Skip; reduced-motion touch bridge UI/layout; and standalone chapter preview/compatibility-alias save isolation. Its page-error list is empty. Preview isolation was measured after the normal game's unload save had settled, then remained byte-for-byte unchanged across preview navigation.

The review found and corrected an incoming camera chord through the solar deck, insufficient match-shot hold, a sticky saved boundary, an obsolete return-completion label, shared Restart visibility, and touch controls behind the cinematic layer. Failed harness attempts were excluded from passes: the first Skip-button markup attempt failed scene creation; a cleanup assertion incorrectly expected a disposed overlay to remain; synthetic DOM pointer IDs were replaced with actual browser touch events; final preview checks initially captured before normal-game unload saving and then waited on a hidden gameplay control instead of the visible preview start button.

### Measured performance

Matched baseline/candidate runs used Chromium 159.0.8154.6, native WebGL, a 1440 × 900 viewport, device scale/pixel ratio 1, Balanced quality and the unchanged 45 FPS cap. Each static gameplay sample lasted 3.5 seconds; the recovered-M2 return action was observed for 12 seconds. CPU submission times below are the existing renderer diagnostics, not GPU times. Values are median / p95 milliseconds.

| Scenario | Baseline CPU | Candidate CPU | Candidate peak geometries / textures | Candidate peak draw calls |
| --- | ---: | ---: | ---: | ---: |
| Hub | 0.6 / 1.0 | 0.7 / 1.3 | 30 / 32 | 96 |
| Purgatory | 0.6 / 1.3 | 0.5 / 0.8 | 19 / 26 | 73 |
| Long Night | 0.7 / 1.5 | 0.6 / 1.1 | 19 / 31 | 74 |
| Recovered M2 return action | 0.7 / 1.3 | 0.5 / 1.0 | 19 / 31 | 74 |

Static scene draw/resource counts match baseline. The return-action destinations differ by design: baseline loads the hub; candidate runs OVERTIME and loads Long Night. During that candidate action, instrumented live GL allocations peaked at 35 textures / 103 buffers; baseline peaked at 36 / 128. These counts include loading and are distinct from renderer.info scene-resource counts. They are not GPU memory measurements.

Observed rendered-frame intervals, sampled by polling the rendered-frame counter every 8 ms, had medians of 16.5–16.9 ms and p95 of 33.2–40.3 ms across these runs. This quantized proxy reflects polling and the 45 FPS cap on the browser's callback cadence; it is not a GPU benchmark. Diagnostic median FPS was 44.5–45.0. The short-sample differences do not establish an optimization or spare GPU headroom. Full figures and matching before/after images are in [performance.json](performance.json) and the `baseline-*` / `candidate-*` PNGs.

The main production JS chunk is 766,651 bytes versus the inspected baseline artifact's 754,749 bytes: +11,902 bytes, approximately 1.6%. The existing Vite large-chunk advisory remains. No dependency or quality reduction was used.

No GPU timing, physical-phone, thermal or owner aesthetic certification is claimed. Headless Chromium native WebGL footage and bounded resource counts establish behavior in the tested environment, not broad device performance or “Picasso-level” acceptance.

### Runtime evidence

- Normal-speed clips: [rock to wheel](rock-to-wheel.webm), [OVERTIME](overtime.webm), [silence to blue](silence-to-blue.webm).
- [Two complete journeys, uninterrupted recording](../../../work/qa/repeat-final/video/page@4fd6aae33a5a3053adfc96bdc3d17b9e.webm) from the final source; [runtime assertions and saves](repeat-runtime.json).
- [Fresh production journey recording](../../../work/qa/final-production/video/page@c5b17e2c321bb2e383ed3ec58c955642.webm); [production assertions](production-runtime.json), with the refinement timing qualified above.
- [Failure, cancellation, reload, pause and touch checks](edge-checks.json), [source SHA-256 manifest](source-sha256.json), and the PNGs beside this report.
- [Final production smoke checks](production-smoke.json), [final production touch OVERTIME](final-production-touch-overtime.png), and [touch arrival](final-production-touch-arrival.png).

The clips are stream-copied excerpts of actual Playwright browser recording, with original timing and keyframe preroll. Capture is 1280 × 800 at 25 FPS; the game viewport/render cadence above differs. No generated footage, retiming, interpolated frames or historical NASA imagery animation was used. The full run was exercised at normal speed and key compositions were inspected as frames. Videos remain local, ignored evidence rather than repository assets.

## Run and ownership

Production preview: **http://127.0.0.1:5235/**. Development diagnostics: **http://127.0.0.1:5234/**.

```powershell
Set-Location 'C:\Nasa 2026\mars-echoes\work\continuous-journey\game'
& 'C:\Users\Yooms\AppData\Local\npm-cache\_npx\52027bd8fc0022aa\node_modules\node\bin\node.exe' node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5235 --strictPort
```

The preview is already running. Build lives in this worktree's `game/dist`. Dependencies were copied from main's existing installation; none was added or changed. Original ports 5224/5225 were unusable from the test browser and were replaced by the verified 5234/5235 pair. The temporary baseline profiling server on 5236 was stopped after measurement. Other preview servers were preserved.

Owned changes: `app/{contracts,session,save,SceneDirector,Game,registry}.ts`; new `scenes/episodes/rover/journey.{ts,css}`; M1 index; M2 index/sequence UI/style; hub entry index; shared UI active-scene Restart visibility; `tests/continuous-journey.test.ts`; planning/review/AI-use/roadmap documentation and review ignore rules. No edit to the separate Journal/Epilogue worktrees or main game source. Main's 35 staged resources and three stash hashes remain present and unchanged.

Raw scripts and recordings remain in this worktree's `work/qa/`. Source hashes and final evidence inventory accompany the handoff. Final visual pacing/composition needs owner judgment; public release and concurrent branch integration remain unperformed.
