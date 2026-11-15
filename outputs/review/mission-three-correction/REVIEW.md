# Mission 3: dark-scene and energy correction

Latest user follow-up: [faster storm and cinematic post-contact presentation](PRESENTATION-V3.md). It supersedes this report's 40-second/manual-storm advance and post-contact box layout. Earlier verification below remains a historical record.

15 November 2026. Corrected local candidate on `codex/mission-three`, base `548ce49bbeecbd77404b868c1e47e615a6ef5fd9`, worktree `C:/Nasa 2026/mars-echoes/work/mission-three`. Uncommitted, not merged/pushed/deployed. The original uncommitted source and production build are preserved under `work/correction-before/`; its preview is port 5209. Current production is http://127.0.0.1:5208/?mission=long-night, with normal persistence at http://127.0.0.1:5208/ . Development remains 5207.

The storm remains dark, but existing fill/reflections retain the rover silhouette, chassis and wheels. Explicit service states persist into silence. Stored reserve is now integrated: suspending a service lowers future drain without recharging. The player controls the transition to historical silence. Exact historical battery state is never asserted.

## Scope and preservation

Only eight source/test paths differ from the preserved candidate:

- `game/src/scenes/episodes/rover/missions/long-night/{world.ts,progress.ts,index.ts,style.css}`.
- `game/src/content/long-night.ts`.
- `game/src/app/{contracts.ts,save.ts}` — accumulated reserve and backward-compatible parsing only.
- `game/tests/long-night.test.ts`.

The source snapshot comparison found no other source/test/archival asset differences. Main and other worktrees were not edited. Terrain geometry, rover assets, other missions, session rewards, renderer/composer/input/loop, quality preferences, shared controller/camera and dependencies are preserved. Additional files are this review/evidence, the correction plan, report links and narrow Git-ignore exceptions for review artifacts. Integrators must still reconcile the original candidate's shared routing/hub patches with concurrent Mission 2 and spirit work.

## Checkpoint record

**0 — reproduced.** Original production build: peak lighting scales all lights to 6%, environment to 4%, while suppressing the sky and increasing fog. Mast/chassis/wheels are barely separable at the normal camera. Imaging suspension at the sampled state increased reserve **66.25 → 72.925**, because reserve was recomputed from current switches. Buttons disabled without explicit state, and the 40-second automatic transition hid them. Source and actual captures agree.

**1 — visually verified.** Final implementation reuses the existing non-shadow fill and a 20%-of-clear environment-strength floor; sun, background and distant fog remain suppressed. No extra light, emissive material, shadow map or render pass survives. A point-light trial was removed during profiling. The fill/reflection aid is explicitly artistic and independent of charging. Balanced and low captures show mast/deck, chassis/wheels and existing grounding shadows while the distant landscape remains dark. Narrow views additionally use chapter-local camera projection zoom 0.72 and vertical view offset 20% to clear the card. Controller pose and saved orbit remain unchanged. This deliberate narrow-view framing difference is disclosed; the desktop before/after camera is matched.

**2 — runtime verified.** Imaging and Science activity each show RUNNING/SUSPENDED in text. Action feedback is a polite live status update, not a stream of spoken numbers. Disabled controls retain their state. Separate incoming solar, demand, reserve and loss-rate values come from the current model. The next action stays visible in a sticky footer; narrow/large-text content scrolls. Sky reaches peak at 40 seconds and holds; Continue/Skip is explicit. No automatic phase jump interrupts an action. Actual keyboard and CDP touch controls passed. This is agent verification, not a user comprehension study.

The final narrow-view footer also repeats both service states, so they remain visible even when the controls scroll out of view. The large-text touch route and all comparison captures were repeated after adding this line. GPU timing and the full keyboard video precede this final text-only footer addition; no lighting, renderer or model changes followed those measurements.

**3 — model and saves verified.** Accumulated reserve is continuous when switching services. Full initial demand is 1.60 model units/s, then 1.20 and 0.80; even with both suspended, essential demand exceeds authored incoming solar input. Analytic integration gives equivalent 30/60/120 Hz results across switch times and the ramp endpoint. No-action full-length playback reached peak with **43.23 model units** still stored at the sampled time, then continued to the same historical ending. Zero is not a shutdown trigger. If the player waits sufficiently long, the bounded illustrative model can exhaust its reserve without changing history. Silence freezes the model and labels post-contact reality UNKNOWN.

Observed keyboard action feedback in the final full route: imaging lowered current loss from **1.09 → 0.69 units/s**; science from **0.74 → 0.34 units/s**. Reserve decreased slightly during the browser action interval, never jumped upward. Unit tests isolate the switching instant and assert exact continuity under matched solar conditions. Pause/focus freeze the model; restart resets all service/reserve state.

New version-2 checkpoints include accumulated `reserve`; elapsed ramp and service booleans determine incoming energy and demand. Old valid version-2 chapter checkpoints lacking reserve migrate to the number the old implementation displayed, retaining their service choices, pose, phase and prior skills. Historical switch times are not guessed. All supported old phases and new accumulated state are tested. Invalid/null/string/nonfinite/out-of-range reserve values are rejected. Version-1 migration and backup recovery remain supported. Native Save/Continue restored the same reserve (measured delta **0**) and both suspended services; prior Blueberry/GRIND and the hub bookmark survived.

**4 — final verification.** Supported Node 22.23.5: **80 tests passed**, TypeScript/production build and `git diff --check` passed. New coverage checks matched-condition slope changes, no instant recharge, essential drain, bounded state, rates, manual fixed ending, migration and causal restoration; existing transactional SUNLIGHT/replay tests still pass. The existing large shared bundle warning remains.

Final production playthroughs passed: full both-action route; separate full unskipped no-action route; Skip; pause/focus; restart; save/reload/Continue; archive/recovery/legacy; abort; replay with exactly-once SUNLIGHT and preserved GRIND. Clean full-run logs recorded no page errors or failed requests. Touch emulation at 390×844 with low quality, reduced motion and 18px large text passed service actions, pause, Skip/cards/return, restored D-pad and no horizontal overflow. Four repeated development entry/abort/return visits stabilized at mission **19 geometries / 35 textures**, hub **30 / 35**, with **one active loop**, zero chapter awards and no page errors.

## Performance

Windows, NVIDIA GeForce RTX 4060 Laptop GPU through ANGLE D3D11, HeadlessChrome 159.0.8154.6. Desktop comparison: 1440×900, fixed `(0,2)` rover pose, heading 0, camera yaw 0.33/pitch 0.095/distance 5.8, peak-darkness **silence** phase in both builds. Balanced buffer 1440×900/DPR 1/45 cap; low buffer 1152×720/DPR 0.8/30 cap. Same archival image/cache and shared models. Each five-second sample follows scene load and 1.5-second warm-up (plus initial capture delay); paired diagnostic uses two-second warm-up and four-second windows.

CPU measurements cover the rendered requestAnimationFrame callback including scene/UI and instrument overhead. GPU measurements use `EXT_disjoint_timer_query_webgl2` around the same callback's rendering, discarding disjoint results. Queries include all game passes; these are not isolated light shader timings. The harness adds no production code. Render intervals distinguish the existing cap cadence from CPU/GPU work.

Repeated matched desktop samples:

| Quality | CPU median before → after | GPU median before → after | GPU P95 before → after | Draw calls | Multipass triangles |
| --- | --- | --- | --- | ---: | ---: |
| Balanced | 0.70 → 0.80 ms | 2.975 → 3.091 ms | 5.353 → 5.749 ms | 74 → 74 | 203,950 → 203,950 |
| Low | 0.80 → 0.80 ms | 2.237 → 2.952 ms | 4.351 → 6.169 ms | 36 → 36 | 101,974 → 101,974 |

There were no >50 ms presentation intervals in these samples. Initial samples were materially different (e.g. low GPU medians 3.48 before / 5.87 after), so they are retained rather than omitted. A further alternating same-browser low-quality investigation is recorded in `paired-performance.json`; see its actual ranges below. Final implementation adds no light, pass, texture, geometry or draw submission. Numeric UI work is throttled to 10 Hz with immediate event refresh. No global quality reduction was used. Stable caps alone do not establish headroom, and short laptop samples do not certify sustained/mobile performance.

The alternating single-browser low-quality diagnostic (before/after, after/before, before/after) gave GPU medians **3.033–4.632 ms before** and **2.981–4.299 ms after**. Pairwise after-minus-before medians were **−0.333, −0.052, +0.099 ms**. GPU P95 ranges overlapped: **6.029–6.711 ms before**, **6.474–6.668 ms after**. Thus the earlier large median increase was not reproduced consistently in paired checks; no repeatable material rendering regression was established. The cause of all system-level timing variation remains unmeasured. Do not interpret this as a performance improvement or a hardware-independent guarantee.

## Evidence, sources and remaining limits

`before-*.png` and `after-*.png` are actual native production captures. Desktop silence pairs use the same phase and camera; both are at full storm obscuration. The original “peak” capture has already auto-advanced to silence; that behavior itself is part of the defect. Narrow framing was intentionally corrected and is not a pixel-matched camera comparison. `no-action-*.png` records the final natural arrival/onset/peak/silence sequence. `services.png`, `peak-services.png`, `silence-services.png` and touch captures show native feedback. No screenshot editing, archive pixel processing or generated visual evidence was used.

Metrics, full-route results and source/capture hashes sit beside this report. Local full-speed video and executable harnesses remain under `work/correction-acceptance/` and `work/correction-*.cjs`. Original snapshot: `work/correction-before/candidate-source.zip`, `candidate.diff`, `status.txt`, and unchanged `dist/`.

Historical/source boundaries are documented in [the correction plan](../../planning/mission-three-correction.md) and the existing M3 claim ledger/resource manifest. JPL science suspension and post-contact uncertainty were rechecked; the switches/loads/timing remain simplified gameplay, not a command log. Archival JPEG SHA-256 remains `db99314d10489da0937c3fb3ef67a89e087aca11deedafde39a67e27a79f794f`; its pixels, credits and chronology are unchanged. AI assisted code, design abstraction and verification; no historical image generation was used.

Remaining limits: physical phone/thermal testing, assistive-technology user testing, user comprehension and owner visual acceptance were not performed. Large text requires scrolling the compact card. Reflection/fill and the model are authored aids, not measured 2018 illumination or battery telemetry. Full map/finale/skill-graph integration remains outside this correction. No merge, push, deployment or release approval is implied.
