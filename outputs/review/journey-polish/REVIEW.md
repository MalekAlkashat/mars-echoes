# Opportunity handoff polish

15 November 2026. Candidate in `C:/Nasa 2026/mars-echoes/work/journey-polish`, branch `codex/journey-polish`, base `ac65d6e`. No merge, push or deployment.

## Diagnosis and result

The reported interruption was reproduced in the old candidate served at **5235**. Its actual label is **“Preparing the scene…”**, and focus moves to Cancel. This happened at M1 → M2 and at the final return. [Popup capture](before-popup.png). The old final shot also put the blue flame directly over Opportunity's silhouette. [Before return](before-return.png).

The baseline had advanced since that candidate: main already contained the journey, Journal, automatic ending and a context-aware loading-mask fix. This isolated continuation starts from their integrated `ac65d6e` revision, preserving the actual journey implementation and subsequent mission/photo improvements. It does not restart the feature from the earlier `6eef598` main. The old uncommitted worktree remains untouched. The unchanged integrated baseline was built and captured at 5272 before edits; its generic loading popup was already suppressed. That existing fix is not attributed to this polish.

The polish adds explicit preparation presentation separate from user pause. A successful internal handoff keeps the authored mask; Cancel remains accessible immediately, with a polite waiting message after 2.5 active seconds. Preparation feedback ticks through the existing application loop without updating the mission or repeatedly drawing a frozen world. Readiness still comes from the existing asynchronous factory, never a timeout. Failed preparation retains ordinary Retry/Cancel and the recoverable source. A user pause survives successful activation, failure and cancellation; error-dialog focus takes priority until dismissed.

The final return now has 1.6 seconds of historical settle/fade, followed by a 3.4-second present-day reveal, plus actual readiness time. The real accepted blue spirit appears beside the silent machine in an oblique two-subject composition. Its existing cosmetic pulse/appearance remains alive while player movement, follow-camera simulation and the automatic ending are withheld. The shot eases to the original saved camera; position, orientation, FOV, zoom, clipping planes and view offset reach their exact terminal state. Neither the spirit's controller/bookmark nor Opportunity is relocated. The saved straight-on gameplay framing can overlap the subjects again at the endpoint; the reveal establishes their separation before handing that original camera back.

Narrow screens use a wider opening composition so both complete subjects fit. Reduced motion holds the same composition and makes one deliberate cut to the saved camera; it does not orbit. The final caption is restrained to “Present day,” avoiding repetition of the existing ending's text. Journal notifications are visually suppressed during the journey/ending presentation while records and pending Journal emphasis remain intact. The separate automatic ending starts on the next hub update after the reveal; its implementation and content are unchanged.

M1's abrasion-circle/wheel match and M2's recovery/OVERTIME passage remain. Outgoing captions fade before the masked swap and incoming captions fade in. The scene-local pose adapter is evaluated before aiming at the moving rover, avoiding a one-frame target lag. A resize updates the active shot. No chapter mechanics, historical captions, original NASA images, atmosphere, assets, dependencies, graphics presets, pixel ratios or caps were changed.

## Evidence

Open the [video comparison viewer](review.html) for native normal-speed before/after footage:

- [Old M1 → M2 popup](before-rock.webm) / [polished M1 → M2](after-rock.webm). Both deliberately delay the Purgatory module by 1.2 seconds to expose the readiness boundary. This is labeled controlled loading, not natural load timing.
- [Old final return](before-return.webm) / [polished final return](after-return.webm).
- [Polished OVERTIME](after-overtime.webm).
- [Unchanged integrated M1 handoff](integrated-rock.webm) and [integrated final return](integrated-return.webm), separating already-integrated behavior from this change.
- [Fresh full production journey](../../../work/qa/full-production/video/page@b341680b978de7979456a5d9d5d1514a.webm), from New Game through all chapters, one final return, Journal and the automatic ending. [Runtime assertions and saves](full-production.json).
- [Touch/reduced-motion return](touch-return.png), [slow preparation](slow-preparation.png), [failure recovery](failure-recovery.png), [final desktop reveal](after-return.png).

These are actual browser captures, not generated illustrations or animated NASA images. Recorded video is 1280 × 800 at 25 FPS, from a 1440 × 900 viewport; the game uses its existing 45 FPS cap. Original timing is retained without retiming, interpolation or recompression. Startup/menu time is retained in the short recordings. [Footage provenance](footage.json). Full gameplay was exercised at normal speed and key compositions were visually inspected. Final pacing/art acceptance remains the owner's judgment.

## Verification actually performed

**144 automated tests pass**, including the existing 141 plus return-camera terminal/separation checks, pause across asynchronous activation, and paused-source recovery after cancellation/failure. TypeScript and the production build pass with cached Node **22.23.5**. The existing Vite >500 kB chunk advisory remains.

Fresh production gameplay passed native investigation/grinding/comparison, the single NASA photo reveal, Purgatory recovery/archive/reflection, OVERTIME, the unchanged 16-second storm/conservation/archive/later campaign, final spirit return and automatic ending. Journal/photo checks and completed-save continuation also passed. No page errors or failed required requests. This full recording preceded only the final paused-failure focus-priority adjustment; that affected branch passed a separate final-production check.

Two complete journeys also passed in the same application and renderer on the final source, with no browser errors or failed required requests. Both final returns settled at **30 geometries, 32 textures and one loop**; each recorded exactly the three chapter memories plus OVERTIME. The automatic ending was skipped in this repeat run after the final reveal; its full unskipped presentation was verified in the separate production campaign. [Repeat assertions and resources](repeat-journeys.json), [normal-speed two-journey recording](../../../work/qa/repeat-verified/video/page@bf3af9f532c30dc60055a2286709070d.webm).

Targeted seeded checks passed:

- All three successful handoffs under controlled slow preparation, with no generic loading dialog or Cancel/Retry focus theft. Waiting UI freezes while paused, and a destination that finishes loading while paused stays paused.
- Actual `last-message.jpg` load failure and retry, retaining GRIND/SAND/OVERTIME without SUNLIGHT. A separate existing development fault injection at final-hub creation defers SUNLIGHT/full-story completion until successful retry.
- In-flight cancellation with late completion, early exit, reentry and Skip; original bookmark and unfinished chapter preserved.
- Reload at each committed boundary, including final return; no replay of legitimately completed work. Incoming checkpoints continue to save after boundary consumption.
- 390 × 844 touch emulation, large text, reduced motion, focus loss and Skip; no overflow, Journal notice or premature ending over the reveal.
- Paused loading failure focuses Retry; Cancel restores the paused source and Resume focus. Held W/Shift/E does not move or complete the incoming Long Night. Restart restores chapter controls without a bridge overlay.
- Four cancelled next-chapter preparations in the same app returned to 18 geometries, 26 textures, one loop and exactly one recoverable source bridge; leaving then removed that final bridge. To ensure each cancellation actually held a pending image rather than reusing decoded browser image data, this targeted harness adds an isolated QA query parameter to the image URL. All four standalone production chapter/compatibility preview routes preserved the normal save byte-for-byte. [Cleanup and preview-isolation record](cleanup.json).
- Browser-frame UI sampling across the final three bridge recordings: **1,111 sampled frames**, zero visible generic loading, intro/HUD/touch/old chapter/archive/Journal/ending overlays while the bridge owned presentation. This is browser callback sampling, not a claim of exhaustive hardware scanout inspection.

[Edge checks](edge-checks.json), [final-production checks](final-checks.json), and the three `after-*.json` records contain actual results. One early cancellation-loop harness encountered browser decoded-image reuse instead of a second pending network request; explicit isolated cache busting made the test exercise the intended path. One early pause test failure compared the waiting clock before a click with its value after the click; measuring from the completed pause action fixed that harness race. The first repeat-run harness also missed the existing New Game confirmation after a completed campaign; that harness was corrected without changing the game. No failing attempt is counted as a pass. Source hashes are recorded in [source-sha256.json](source-sha256.json), normalizing CRLF to LF.

## Performance and limits

Matched production runs: Chromium **159.0.8154.6**, native WebGL2, 1440 × 900, DPR 1, Balanced quality, unchanged 45 FPS cap. Each handoff was measured in a fresh browser context (“cold” HTTP cache) and a repeat navigation in the same context (“warm”). Baseline then candidate ran sequentially in one browser process. Driver/shader/OS caches are not cold-isolated, so smaller candidate initialization spikes are **not evidence of a speedup**.

Instrumentation wrapped existing WebGL allocation/draw methods and the application's requestAnimationFrame callback. CPU values include the full callback, not just rendering and not GPU time. Intervals between callbacks issuing GL draws are a presented-frame proxy. No timer-query GPU measurements or hardware memory byte counts were available.

| Handoff | Baseline warm CPU median / p95 | Candidate warm CPU median / p95 | Peak live GL textures / buffers, both builds | Peak draw submissions, baseline → candidate |
| --- | ---: | ---: | ---: | ---: |
| M1 → M2 | 1.2 / 2.8 ms | 1.1 / 3.2 ms | 30 / 217 | 94 → 94 |
| M2 → M3 | 0.9 / 1.7 ms | 0.9 / 1.5 ms | 35 / 103 | 74 → 74 |
| Final hub return | 1.1 / 1.8 ms | 1.2 / 2.0 ms | 38 / 128 | 94 → 96 |

The final view reaches two additional maximum draw submissions while using the same existing objects/effects; no scene geometry, textures, passes or second world renderer were added. These GL live counts include preparation and differ from renderer.info's active-scene resource counts.

Candidate observed readiness intervals were approximately **310 / 306 ms** for M1, **198 / 170 ms** for M2, and **347 / 320 ms** for the final return (cold / warm). Across candidate runs, rendered-callback interval medians were **17.1–17.3 ms**, p95 **34.3–34.7 ms**, with maximum intervals **170–347 ms** across initialization. Maximum application CPU callbacks reached **147 ms**; those stalls are real and occur under the mask. First ten active frames after handoff had candidate CPU p95 **1.4–3.3 ms**. The modal interruption is removed; the build does not promise elimination of initialization cost.

The main JS chunk is **777,935 bytes**, versus **776,634 bytes** in the isolated integrated baseline (approximately +1.3 kB); hub chunk also gains the small return-shot adapter. [Full metrics](performance.json), including cold/warm peaks and first active frames. No physical phone, thermal profiling, GPU headroom or broad device performance certification is claimed.

## Run, ownership and integration

Production: **http://127.0.0.1:5271/**. Development diagnostics: **http://127.0.0.1:5270/**. These serve the isolated polish, not main or the old 5235 build. The temporary unchanged-baseline server on 5272 was stopped after measurement; other preview servers were preserved.

```powershell
Set-Location 'C:\Nasa 2026\mars-echoes\work\journey-polish\game'
& 'C:\Users\Yooms\AppData\Local\npm-cache\_npx\52027bd8fc0022aa\node_modules\node\bin\node.exe' node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5271 --strictPort
```

Owned source: `app/{Game,SceneDirector,contracts}.ts`, `scenes/episodes/rover/journey.{ts,css}`, `scenes/mars-hub/index.ts`, new `scenes/mars-hub/return-shot.ts`, and `tests/journey-polish.test.ts`; plus planning/review/AI-use documentation and review ignore rules. Save/session reward code, chapter mechanics, the epilogue module, NASA assets, dependencies and lockfile are unchanged.

The optional `setPreparing` / `updatePreparation` scene methods separate cosmetic waiting feedback from user pause. The director retains its transaction token, abort controller, recovery source and disposal path. Ordinary non-cinematic loads retain the generic dialog. The hub's existing `journeyShot` adapter now accepts optional `dt` solely to advance cosmetic appearance; the wrapper withholds normal hub updates until the shot ends, preventing an early epilogue trigger.

Concurrent visible-sky work owns atmosphere and chapter outdoor-world/art paths and is not incorporated here. Journal/ending owners' integrated code is preserved. Main, staged resources, old candidate, stashes and other preview servers must remain untouched during integration. Merge/release and owner visual acceptance are not performed by this task.

Final preservation check: main remained `ac65d6e75c4f17cd8ad2c32e41d58453ab4ffe40`, with all 35 staged paths and the same three stash hashes. The original continuous-journey source SHA-256 manifest still matches every recorded source/test file. The candidate is uncommitted and reviewable; no other checkout was edited.
