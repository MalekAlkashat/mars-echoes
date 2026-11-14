# Contributor handoffs

14 November 2026. Roles are proposed; actual colleague names and GitHub handles are not assigned. Root `ROADMAP.md` is the current vision. The code still runs the preserved rover-only demo at `rover-v2-baseline` (`179705b`). New runtime folders below are migration destinations.

## Integrator: runtime and contracts

Outcome: other contributors can build a hub or episode without editing the frame loop, global input or each other's files.

Own current `game/src/main.ts`, scene-related extraction from `world.ts`/`progress.ts`, shared camera/rendering changes, and future `app/`, `core/`, registry, UI and dependencies. Start from `outputs/planning/architecture.md`. First extract an unchanged rover episode, then prove stub hub entry and return. Preserve original source at the baseline tag rather than duplicating the whole game tree.

Deliver a small frozen scene/input/result contract, working production factories, independent preview entries, lifecycle cleanup and transition tests. Default controls remain WASD; the spirit glides and leaps with solid collision, without phasing. Only one active controller receives actions. Do not introduce a second renderer or general-purpose game framework.

Acceptance: old rover repair-to-relay sequence remains playable after extraction; repeated and failed/cancelled transitions recover; pause/reset disposes old state; ten switches do not multiply input handlers or loops. Assign each scene author a branch based on the merged contract milestone, not the pre-extraction layout.

## Hub author: spirit and Mars exploration

Outcome: a readable spirit glides and leaps through a compact Mars area and can enter one designated wreck.

Own future `entities/spirit/` and `scenes/mars-hub/`; coordinate `environments/mars/` changes with the integrator. Reuse the selected orange terrain and cold sky. Keep the tentative ghostly humanoid appearance separate from its controller. The reference is movement feel, not phasing, a consumable timer or imported Fortnite art.

Before M1: prepare a proposed layout, scale study and placeholder silhouette in your own files, without rewriting current `main.ts`. After M1: build through the frozen factory and services, using the same entry route as production.

Acceptance: camera-relative WASD glide, bounded leap/landing, slopes, obstacles, no tunnelling or noclip, clean pause/reset and readable follow camera. Save a safe bookmark near `wreck-rover-01` before entering. Other wrecks have no false interact prompts. Return restores control beside the same wreck.

## Episode author: rover memory

Outcome: the player experiences purposeful machine work, mission completion, abandonment, continued effort and eventual shutdown before returning to the spirit.

Own future `scenes/episodes/rover/`, local mission progression, layout and time-jump timeline. Use shared `entities/rover/`; request rig/controller interface changes rather than rewriting shared runtime. Preserve the accepted pale six-wheel design and twin optics. A functional earlier machine and deteriorated later machine are temporal states, not separate identities.

The original assignment is deliberately undecided. Prepare a beat sheet and technical episode extraction while waiting; mission-specific puzzles, success conditions and props depend on that choice. The existing optical-repair and unanswered-call sequence is reusable material, not the complete mission/shutdown story. Cinematic jumps connect playable moments; game/presentation duration is not fixed.

Acceptance: clear playable action and success condition after mission selection; time jumps communicate elapsed time; pause does not advance a cinematic timer; input/camera return predictably after a cut; completion returns the agreed typed result once. A present-day wreck is not physically revived or repaired by playing its memory.

## Asset author: reviewed imports and audio

Outcome: scene authors receive assets they can import without pivot, scale or material repair during final integration.

Own assigned `assets/` authoring/source records and versioned `game/public/assets/` exports. Start with current vendor originals and selected references under `outputs/assets/`. Do not overwrite accepted references, existing binaries or another author's export. Do not submit paid generation jobs without explicit scope/provider approval.

Deliver stable ID/version, source/license/prompt, hashes, GLB and authoring source when available, scale/orientation, node names/pivots and an actual Three.js import preview. Use metres, +Y up and -Z local forward or document the conversion. Do not require a skeleton for the mechanical rover; humanoid spirit rig requirements remain dependent on final appearance. Keep the environment in the selected orange/cold-gray language.

Prioritize one spirit placeholder/approved silhouette, rover damage/animation readiness, a small wreck kit, and a few meaningful sound cues. Exact spirit art, sounds and new episode props are not approved yet. The asset author supplies proposed registration changes; the integrator owns global loader/registry changes. Listen to audio before calling its quality accepted.

Acceptance: maps use correct color/data spaces, files load locally in production, moving parts have useful pivots, supported formats need no account at runtime, credits are retained, and the scene camera clearly reads scale and silhouette.

## Instructions to put in each AI task

Provide these actual values before starting work:

```text
Working folder: <this worker's clone or worktree>
Branch and base commit: <branch> / <merged contract commit>
Outcome: <one bounded playable feature or asset>
Owned paths: <explicit list>
Shared contract: <revision and entry/result/input types>
Do not edit: <other workers' paths, dependencies, registry unless assigned>
Run and preview port: <actual command and unique port>
Acceptance: <behavior checks, visual capture, failure/reset path>
Handoff: changed files, tests actually run, evidence and unresolved decisions
```

Do not fill unknown colleague names, mission choices or performance targets with invented values. Commit your own work before incorporating integration changes, and do not operate on another agent's checkout.

## Relevant retained workflows

- `.agents/skills/plan/SKILL.md`: bounded deliverables and acceptance checks.
- `.agents/skills/feature-handoff/SKILL.md`: continuation and merge handoff.
- `.agents/skills/game-level-design/SKILL.md`: spatial layouts and route checks.
- `.agents/skills/gameplay-visual-review/SKILL.md`: actual runtime visuals and motion evidence.
- `.agents/skills/image-reference-workflow/SKILL.md`: accepted reference edits.
- `.agents/skills/character-sheet-pipeline/SKILL.md`: model-ready character references when needed.
- `.agents/skills/materials-to-game/SKILL.md`: surface/import/material verification.
- `.agents/skills/fal-ai-generation/SKILL.md`: only when that provider/workflow is selected.

No runtime refactor, teammate worktrees or new episodes are implemented by this handoff. Begin with the integrator's M1 task; parallel art and layout proposals can start before that contract is ready.
