# The Long Night — implementation review

This is the original candidate record. Darkness, service feedback and the energy model are superseded by [the correction review](../mission-three-correction/REVIEW.md); original measurements and captures remain historical evidence.

15 November 2026. Playable local candidate, not owner-approved or released.

Implemented: purposeful rover approach, a 40-second compressed storm, two conservation choices with illustrative demand/reserve feedback, fixed loss of contact, unchanged PIA22929 archival image, a separately dated recovery campaign, legacy links to solar-powered Spirit and Ingenuity, and return to the bookmarked spirit with exactly-once SUNLIGHT. No alternate rescue or full-story completion is implied. The reserve display is an illustrative model, not battery telemetry or a tau conversion. Choices change its evaluated reserve; it is not a physical battery integrator.

## Isolation and integration

- Worktree: `C:/Nasa 2026/mars-echoes/work/mission-three`.
- Branch: `codex/mission-three`; base: `548ce49bbeecbd77404b868c1e47e615a6ef5fd9`.
- Uncommitted; no merge, push, deploy, dependency change or paid generation. Main remains on the same base with its concurrent staged/untracked resource work.
- Owned implementation: `game/src/scenes/episodes/rover/missions/long-night/`, `game/src/content/long-night.ts`, `game/public/assets/long-night/v1/`, `game/tests/long-night.test.ts`.
- Shared integration edits: `app/contracts.ts`, `app/save.ts`, `app/session.ts`, `main.ts`, `scenes/episodes/rover/index.ts`, `scenes/mars-hub/index.ts` (all under `game/src`). Reconcile with Mission 2 and spirit-comet owners before integrating. Do not overwrite their hub/contract/save patches.
- One existing renderer/composer/input/loop. Dynamic chapter import. Existing vehicle, camera, NASA MER model, texture caches and scene director. Chapter materials/geometry/environment/listeners are disposed; shared cached assets survive. D-pad state is restored on exit.
- `long-night` is a chapter/checkpoint kind, `sunlight` is the skill ID. Session uses sets; award commits after successful hub return. Aborts do not award. Full-story `completed` remains untouched. Existing version 1 migration and version 2 saves stay supported; invalid phases, ranges and inconsistent reward pairs are rejected.
- Hub now offers a native chapter selector near Opportunity. No forced sequence or fabricated Mission 2 completion. The existing Skills panel/map does not yet display SUNLIGHT as a graph node; chapter and hub text provide local feedback. The persisted reward is ready for that separate progression work.

## Play and controls

Production: http://127.0.0.1:5208/?mission=long-night (isolated preview; saves disabled).
Normal saved journey: http://127.0.0.1:5208/ — approach Opportunity and choose “2018 · The Long Night.” Development: port 5207. Only this task's preview processes use these ports; other worktrees' servers must remain alone.

Use Node 22 or newer supported by Vite. From this worktree:

```powershell
npm --prefix game test
npm --prefix game run build
npm --prefix game run preview -- --port 5208 --strictPort
```

This machine's default Node is 21.6.1. Verification used `C:/Users/Yooms/AppData/Local/npm-cache/_npx/52027bd8fc0022aa/node_modules/node/bin/node.exe` on PATH. Existing local dependencies were copied into this worktree after offline `npm ci` lacked a cached package; manifests/lockfile were not changed.

WASD/touch drives toward the observation point; arrows/drag look. E or the visible button observes/advances. Storm choices are native keyboard-focusable buttons. Skip omits only waiting; all evidence cards remain. Esc/Pause freezes the scene; pause menu supports restart, leave, save and photography through Skills. Reduced motion has no scripted camera movement to suppress. Large-text preference enlarges chapter copy. Small screens scroll the card; touch targets are at least 44 px high.

The authored scene is a compact, reference-informed sloping valley, not a measured final-pose reconstruction. No cinematic ejection, audio track, destruction or particles were added. This avoids falsely presenting designed audio as recorded Opportunity sound. Camera remains player controlled.

## Historical evidence and assets

- Design/integration plan: `outputs/planning/mission-three.md`.
- Full research handoff: `outputs/planning/mission-three-research.md`.
- Claim ledger: `assets/references/mission-three/v1/claims.json` (M3-C08–12, C18, C24, C28 in runtime; C34–35 abstraction proposals).
- Original-source/resource manifest: `assets/references/mission-three/v1/manifest.json`, plus `SOURCE.md`, offline source pages and catalog. Research originals copied intact from the completed research task, not redownloaded or transformed here.
- Runtime provenance: `game/public/assets/long-night/v1/SOURCE.md`.
- Runtime PIA22929: 1024 × 1024, 314,160 bytes, SHA-256 `db99314d10489da0937c3fb3ef67a89e087aca11deedafde39a67e27a79f794f`. Byte-identical JPEG; missing data and noise preserved. Only this small image is shipped as the chapter archive; large references remain outside public assets.
- Primary NASA/JPL caption, recovery and mission-conclusion pages were read again; Ingenuity's solar panel/battery connection was checked against JPL's April 16, 2024 account. Narrative distinguishes last transmitted partial full-frame image from later exposures/thumbnails and months of recovery from loss of contact.
- Open historical gaps: exact final internal state/pose, battery history, calibrated opacity-to-render/power model and authentic audio. None is invented.

AI disclosure: Codex assisted implementation, authored reconstruction, narrative abstraction, research synthesis and review automation. The NASA archive was not AI generated or filled. Existing model/material provenance remains authoritative. No paid generative service was used.

## Verification actually performed

- Supported-Node suite: **77 passed**, zero failures. TypeScript and production build pass. Existing shared ~739 kB bundle warning remains; new chapter JS is ~10.8 kB and CSS ~1.4 kB before gzip. `git diff --check` passes.
- New focused tests cover conservation/fixed outcome/reset/invalid delta, checkpoint corruption and prior progress, transactional failed-return retry, repeated exactly-once reward, direct completion and abort.
- Desktop native movement through the full storm, both switches, archive/recovery/return. Pause freezes elapsed time; focus loss pauses; restart restores arrival. Ground raycasts against the actual mesh: maximum sampled height/contact discrepancy ~9.03e-8 m.
- Production saved journey used a valid near-rover fixture with prior Blueberry/GRIND progress. Continue → chapter entry → storm Save Game → reload/Continue → finish retained both chapters and both skills, unchanged legacy completion and hub bookmark. This does not constitute a fresh full Mission 1 playthrough.
- Four development entry/abort/return cycles: one loop, stable per-scene geometries and textures after warm-up, no rewards on abort or page errors. Three additional production reentries/aborts preserved earned progress.
- Production touch emulation: 390 × 844, low quality, reduced motion and large text, actual CDP touch hold to drive and native taps through skip/evidence/return. No horizontal overflow/page errors. Full-height card content requires scrolling. Physical phone/GPU/thermal behavior is not certified.
- Clean direct-production smoke had zero page errors or failed requests. Separate deliberate archival-image failure recovered via Retry. Delayed-image cancellation and reentry, plus photography download, are recorded in `smoke.json` when passed.
- Initial persistence harness intentionally reloaded during asset loading; its three failed GLB requests are navigation cancellations, not a claim of zero failed requests. The clean smoke is the network-error check.
- Existing unit suite covers Mission 1/rover/terrain/session/preferences/save contracts. No new full legacy-repair or Mission 1 visual playthrough was performed.

## Performance evidence and limits

Hardware: NVIDIA GeForce RTX 4060 Laptop GPU, ANGLE D3D11; Windows, HeadlessChrome 159.0.8154.6, 20 reported logical cores. Production samples: 1440 × 900, DPR 1, balanced/45 FPS cap. Two-second windows after each phase begins; assets warm except initial arrival. These short windows are diagnostic, not a sustained thermal benchmark.

| Production phase | Samples | Median interval ms | P95 ms | Intervals >50 ms |
| --- | ---: | ---: | ---: | ---: |
| Arrival | 89 | 17.0 | 34.3 | 1 |
| Storm onset | 73 | 17.3 | 35.4 | 0 |
| Peak storm | 90 | 17.2 | 34.2 | 0 |
| Archive | 89 | 17.1 | 33.9 | 0 |
| Hub return | 89 | 17.0 | 34.4 | 0 |

Intervals are an instrumented WebGL-clear proxy grouped >5 ms apart, not GPU timer queries or CPU cost. The 17/34 ms pattern reflects capped rendering under browser scheduling. Hitting the cap does not prove spare GPU capacity. No pre-change performance improvement is claimed.

Equivalent clear → storm comparison in development instrumentation: 74 draw calls and 203,950 multipass triangles in both; 19 geometries/31 textures in the initial direct preview in both. After hub cache warm-up, repeated visits stabilize at mission 19 geometries/35 textures and hub 30/35. Shadow/postprocess accounting is included in triangle counts. Reentry tests used software/default browser setup and are resource checks, not timing comparisons to production hardware.

Provisional budgets met: 28,800 terrain triangles, 48 instanced rocks; storm adds zero geometry, textures or draw calls relative to arrival. It changes existing fog, sky, light and environment parameters, without environment recapture, transparent dust, extra passes or per-frame allocations of scene objects. Low quality uses the same minimal storm treatment with existing lower DPR, disabled ambient-occlusion pass and 30 FPS renderer settings; it does not omit narrative.

Local loading cost is in `smoke.json` (`coldReadyMs`, fresh browser context/direct chapter). It measures localhost navigation through ready UI, not internet download or device-independent load time. No bandwidth simulation or GPU-memory-byte measurement was performed.

## Evidence and remaining acceptance

Selected screenshots and compact metrics sit beside this report. Completed desktop recording: work/review/production-video/page@73ac77b7c6e14dbf8d37f49c49d81625.webm. Other recordings include earlier harness attempts. Full-speed desktop recordings and reproduction harnesses are local in `work/review/production-video/`, `work/production.cjs`, `work/mobile-final.cjs`, `work/smoke.cjs`, `work/cycles.cjs`. Earlier `work/review/arrival.png`/`peak.png` captures predate the corrected ground material; use the selected `production-*` images here.

Owner visual/narrative acceptance remains open. Other outstanding work belongs to the wider game: SUNLIGHT graph/map display, Memory Check/finale, sound, Mission 2/spirit integration, release and physical-device testing. Scene is deliberately restrained; no claim of measured reconstruction or final cinematic art acceptance. Recheck branch status and source hashes before integration; no automatic approval or deployment is implied.
