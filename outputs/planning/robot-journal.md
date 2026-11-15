# Robot Journal implementation

Base: main `6eef598`, isolated `work/robot-journal`, branch `codex/robot-journal`.
Preview ports: 5230 development, 5231 production. No merge/push/deploy authorized.

## Design and delivery

Replace the Skills panel with a compact three-record archive, using the existing Bahnschrift/system sans typography, charcoal backing, warm selection rule and off-white copy. A desktop record rail sits beside a reading pane; mobile uses three compact record selectors above the pane. Unknown slots reveal no identity. Sources are expandable. Photography remains an always-available footer tool. Back returns to pause; Resume is deliberate.

1. Inspect baseline desktop/mobile menu and pause panel. Build Opportunity first; inspect both sizes before filling Spirit/Ingenuity.
2. Derive memories and connections from committed chapter IDs, retaining legacy skill IDs. Add only an optional encounter boolean: current state has no persistent encounter record. Set it at the existing entry radius, infer old-save discovery from real episode/completion evidence. No new progression API or full-story completion.
3. Add sourced robot connections and unobtrusive event-driven notification. No automatic modal, map, powers, or playable robot additions.
4. Verify fresh encounter, each committed return, old saves, abort/failure/retry/cancel/replay, photo download, focus/input/pause, touch, large text/reduced motion, missing imagery and repeated-open resources. Run supported-Node tests, TypeScript/build. Deliver native captures, recording and explicit limitations.

## Ownership / compatibility

This task owns new journal content/UI/CSS/tests and small compatible changes in Game.ts, session.ts, save.ts, main-menu.ts, hub encounter/copy, index.html and mission-ending copy. Transition and epilogue tasks are independently active; do not modify their worktrees or overwrite main context. Shared-file hunks require reconciliation at integration. SceneDirector transaction and chapter pacing stay intact. No dependencies or generation jobs.

## QA inventory

Controls: Journal navigation; three record selections; source disclosure and links; photograph; Back/Escape; pause Resume; keyboard focus loop. All states need desktop and 390px touch review, with 320px/large-text stress checks.
Progression: hidden initial identities; actual proximity encounter; three successful returns; no new discovery on abort/failed return; exactly-once retry/replay; valid old v1/v2 saves; fresh New Game resets. Missing image uses honest fallback. Repeated opens preserve DOM and renderer counts and stop rendering while paused.

Skills read: plan, feature-handoff, threejs-game-ui-designer (+ ui-patterns), gameplay-visual-review, threejs-debug-profiler (+ debug-playbook), playwright-interactive. Repo overrides its package-install/sandbox examples; use installed Playwright and isolated browser storage.

## Delivered candidate

Implementation and review are complete in this isolated worktree. See `outputs/review/robot-journal/REVIEW.md` for 117 passing tests, successful build/typecheck, native full-journey and UI checks, the consumed Purgatory return-action fix, screenshots, preview commands and integration limits. No merge/push/deployment was performed. Main context is preserved for concurrent coordination.
