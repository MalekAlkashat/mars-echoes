# Mars startup recovery — 15 November 2026

Latest main pulled: caa8a35. Repository visibility changed to PUBLIC only after explicit user confirmation. Local game was available at http://127.0.0.1:5195/.

## Observed cause and recovery

New Game failed scene preparation with `Could not load rock/ao.jpg`. The texture path existed, but macOS reported `compressed,dataless`; Vite returned HTTP 200 headers with zero body bytes before timing out. 106 tracked files under game/src, game/public and game/tests were cloud placeholders (about 19 MB). This was a local byte-availability problem; upstream GitHub assets were intact.

Recovered those 106 files from exact commit caa8a35. Each download matched its Git index blob SHA-1 before atomic replacement. Untracked files and already-hydrated files were preserved. The missing AO texture then served HTTP 200 with all 712243 bytes; a subsequent scan found zero game placeholders. Recovery tooling is retained at tools/restore_game_placeholders.py.

A speculative full-screen SVG-filter mitigation was reverted after the concrete missing-file cause was established. The only runtime code change logs scene-load failures in development; production copy is unchanged.

## Native verification

In Chrome, refreshed the root/default game URL, observed New Game become ready, selected it successfully, and entered present-day Mars. A 650 ms W hold moved the spirit, with rover distance decreasing from 34 m to 31 m. mars-loaded.jpg records the recovered scene. Earlier console errors are retained in the browser’s historical log; no new failure was observed during the successful reload/play path.

The whole in-app browser/app closure reported by the user was not independently reproduced; the recovered scene is verified in Chrome. No GPU-process root cause or thermal certification is claimed.

Final verification: exact locked dependencies reinstalled with npm ci after finding 2017 dataless dependency files. No package versions changed. Production build and all 144 tests pass; the existing renderer chunk-size advisory remains. Local server responds HTTP 200.
