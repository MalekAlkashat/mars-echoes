# M3 memory and interface pass

Requested 14 November 2026: reliably save the current journey, make the challenge name the main heading, add a Photograph Terrain skill, and move pause controls to a side menu.

1. Versioned progress and recovery: migrate existing exploration saves; retain active rover state; save periodically, at lifecycle boundaries and from a visible Save Game action; recover a validated backup if needed. Verify reload/Continue in the hub and rover, storage failure and explicit New Game.
2. Challenge title and pause direction: replace Echoes of Mars and its tagline with Abandoned but not Forgotten, use a condensed sans-serif treatment, and keep the paused world visible beside a fixed menu. Verify all actions and readability at desktop and smaller viewports with no scrolling.
3. Skills: one available Photograph Terrain node at the head of an observation branch, with selectable details and a real image capture. No invented XP, additional unlocks or historical mission completion. Verify capture contents and frozen gameplay/focus while the overlay is open.
4. Consolidated review: production build, existing tests, targeted persistence tests, actual browser layout and reload/return checks. Save evidence in `outputs/review/m3-memory-ui/`; distinguish local saves from cloud/account storage, and agent checks from user acceptance.

The existing TypeScript/Three.js lifecycle remains authoritative. No new framework, renderer, physics dependency, paid asset generation, deployment, or satellite cinematic is part of this pass. Sound integration is deferred until the user supplies assets. The persistence subtask is isolated in `work/save-resume-stage`; only its agreed files are integrated back into the UI branch.
