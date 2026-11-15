# Visible sky only: Mission 1 and Mission 2

15 November 2026. Worktree `C:/Nasa 2026/mars-echoes/work/visible-sky-only`, branch `codex/visible-sky-only`, base `ac65d6e`. Uncommitted. No merge, push or deployment. This is separate from the discarded atmosphere-wide experiment.

Production: http://127.0.0.1:5267/ (direct chapters: `?mission=blueberry-clue`, `?mission=purgatory`). Baseline: http://127.0.0.1:5266/. Development: http://127.0.0.1:5265/.

## Findings and implementation

The running base at port 5216 was inspected and freshly captured before editing. It has a gray-blue procedural cloudy dome. Mission 1 already used that shader with a raised sun direction, sharing its material with the reflection capture. Purgatory had a warm solid background and separate lights/probe.

Changed source paths:

- `game/src/environments/mars/sky.ts`: material-only factory extracted verbatim from the old atmosphere shader. No lights, fog, environment maps or renderer ownership.
- `game/src/environments/mars/atmosphere.ts`: uses that factory with identical parameters and direction-vector sharing. The extracted material body was compared exactly to HEAD. Base-map behavior is unchanged.
- `game/src/scenes/episodes/rover/missions/blueberry-clue/landscape.ts`: replaces only the existing dome's visible material; preserves the original material for the original light vector and PMREM. Disposes that private original explicitly. No duplicate dome.
- `game/src/scenes/episodes/rover/missions/blueberry-clue/art.ts`: ticks only visible clouds using the existing scene clock. Original close-up visibility/background/fog/environment/light switches remain.
- `game/src/scenes/episodes/rover/missions/purgatory/world.ts`: one visible dome inside the unchanged 900 m camera range. Does not cast shadows or enter contact AO. Original fog, lights and warm reflection capture remain unchanged; normal scene cleanup owns the dome.
- `game/src/scenes/episodes/rover/missions/purgatory/index.ts`: visible cloud clock update/reset/resume only.

Also changed: `.gitignore` permits this review directory. No terrain, normals, ground/rover materials, light parameters/positions, shadow settings, camera ranges, exposure, quality presets, dependencies, NASA imagery, gameplay, saves or rewards changed. Base-map scene files and Mission 3 files are untouched. Reflection generation remains setup-only.

## Observed result and constraints

Comparable production views show the base map's sky palette, gradient and cloud treatment in both missions. Camera rotation shows continuous sky without dome clipping. Ground/rover colors, highlights and shadow directions/footprints retain their previous appearance. Mission 1 close-ups retain their warm scientific presentation; restart restores the outdoor sky.

Purgatory deliberately retains its **warm horizon fog band and warm reflections**. The visible sun is an artistic backdrop, independent of each mission's preserved direct-light direction. This is required by the sky-only constraint, not calibrated historical Martian weather or a unified physical lighting setup.

## Checks actually performed

- Supported Node 22.23.5: **141/141 existing tests pass**; TypeScript/Vite production build and `git diff --check` pass. Existing large-bundle advisory remains.
- Chromium/D3D11, 1440x900, DPR 1, balanced graphics: production before/after horizon, upward tilt and reverse-facing captures for hub, M1 and M2. Existing camera pitch limits remain; upward views are not unrestricted zenith views. Separate real-time runs have small cloud/film/spirit timing differences.
- Diff audit preserves light/shadow/fog/probe settings; actual captures confirm retained foreground appearance. `preservation-checks.json` records foreground image differences and exact shader extraction. These are not pixel-identical renders or performance measurements.
- M1 macro inspection before/after, frozen paused canvas, restart and outdoor restoration pass: `closeup-checks.json`.
- Normal production entry from fresh hub, native M1 driving/brush/held grind/comparisons/water/single centered Berry Bowl reveal, bridge into Purgatory, held-W recovery and NASA archive pass: `journey-checks.json`. No page/HTTP errors. Test stops at M2 reflection and does not recertify the ending.
- Purgatory intro/stuck/recovery, six camera modes, frozen pause, resume drive and restart pass: `camera-checks.json`.
- Six alternating M1/M2 entry/abort/return cycles: all returned hub samples have 30 geometries, 26 textures, one loop, one Journal and no leftover bridge; no page errors: `resource-checks.json`. Bounded cleanup evidence, not indefinite leak certification.

## Actual captures

[Open the comparison gallery](index.html). All PNGs are native runtime captures, not generated art. Full horizon/upward/reverse comparisons are included. Scripts, test/build logs and the real-time Mission 1-to-2 video are under `work/sky-qa/` in this worktree.

| View | Before | After |
| --- | --- | --- |
| Base map | [Horizon](before-hub-horizon.png) | [Horizon](after-hub-horizon.png) |
| Mission 1 | [Horizon](before-m1-horizon.png) | [Horizon](after-m1-horizon.png) |
| Mission 2 | [Horizon](before-m2-horizon.png) | [Horizon](after-m2-horizon.png) |
| M1 close-up | [Inspection](before-m1-macro.png) | [Inspection](after-m1-macro.png) |
| M1 restart | | [Outdoor restoration](after-m1-restored.png) |

Commands with supported Node on PATH:

```powershell
npm --prefix game test
npm --prefix game run build -- --outDir ../work/sky-qa/dist
node game/node_modules/vite/bin/vite.js preview game --outDir ../work/sky-qa/dist --host 127.0.0.1 --port 5267 --strictPort
```

## Remaining limits

Owner aesthetic acceptance, physical phones, other browsers, GPU/thermal cost and long-duration leakage: **not verified**. No spare-GPU or performance improvement claim. Mission 3 runtime and the ending on this candidate: **not verified**; their source was not changed. High/low presets were not separately re-reviewed. Picasso-level is a quality target, not measured or approved completion.

Main's existing staged resources, local notes and other worktrees were not edited. No files were staged or committed by this task.
