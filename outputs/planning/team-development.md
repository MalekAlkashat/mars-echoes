# Contributor handoffs

14 November 2026. Roles are proposed; actual colleague names and GitHub handles are not assigned. Root `ROADMAP.md` is the current vision. The runtime ownership folders below now exist and contain executable source. A placeholder hub and spirit controller connect to the isolated rover repair/call episode through shared app/core services. The original rover-only demo remains preserved at `rover-v2-baseline` (`179705b`). The complete past mission, shutdown and sound remain future work.

## Integrator: runtime and contracts

Outcome: other contributors can build a hub or episode without editing the frame loop, global input or each other's files.

Own `game/src/main.ts`, `app/`, `core/`, registry, shared UI and dependencies. The former `world.ts` and `progress.ts` responsibilities have been separated into generic Mars environment services and episode-local layout/mission modules. Start from `outputs/planning/architecture.md` and the actual shared contract in `game/src/app/contracts.ts`. Preserve original source at the baseline tag rather than duplicating the whole game tree.

Maintain the implemented scene/input/result contract in `game/src/app/contracts.ts`, registered production factories, independent preview entries, lifecycle cleanup and transition tests. Treat that source file as authoritative and coordinate any contract change through the integrator. Default controls remain WASD; the spirit glides and leaps with solid collision, without phasing. Only one active controller receives actions. Do not introduce a second renderer or general-purpose game framework. The production build and 23 automated checks pass; native development-browser review also passes the preserved rover sequence and return to Mars.

Recorded native development-browser evidence: the old rover repair-to-relay sequence remains playable after extraction, including bad-alignment retry and successful installation, and returns to Mars. Ten additional aborted visits retain one prior prototype completion, restore the same hub position and return to identical renderer resource counts; browser errors are empty. Automated director tests cover failure/cancellation and session logic, while native fault UI, mobile/production-browser checks and stage rehearsal are tracked separately. Assign each scene author a branch based on the agreed merged refactor commit, not the pre-extraction layout.

## Hub author: spirit and Mars exploration

Outcome: a readable spirit glides and leaps through a compact Mars area and can enter one designated wreck.

Own `game/src/entities/spirit/` and `game/src/scenes/mars-hub/`; coordinate `environments/mars/` changes with the integrator. Reuse the selected orange terrain and cold sky. Keep the tentative ghostly humanoid appearance separate from its controller. The reference is movement feel, not phasing, a consumable timer or imported Fortnite art.

The implemented hub/controller/appearance/camera are a simple integration starting point, not final spirit art or a finished level. Build through its factory and shared services without editing the global game loop. The default entry and `?scene=mars-hub` use that same production factory.

Acceptance: camera-relative WASD glide, bounded leap/landing, slopes, obstacles, no tunnelling or noclip, clean pause/reset and readable follow camera. Save a safe bookmark near `wreck-rover-01` before entering. Other wrecks have no false interact prompts. Return restores control beside the same wreck.

## Episode author: rover memory

Outcome: the player experiences Opportunity’s rock discovery, Purgatory Dune and final storm before returning to the spirit, with historical facts and reconstructions clearly distinguished.

Own `game/src/scenes/episodes/rover/`, including local `mission.ts`, `hud.ts`, layout and a future time-jump timeline. Use shared `entities/rover/`; request rig/controller interface changes rather than rewriting shared runtime. The current episode preserves the old repair/call sequence, not the complete memory story. Preserve the accepted expressive fictional rover reference; the visual treatment of real Opportunity still needs a decision. A functional earlier machine and deteriorated later machine are temporal states, not separate identities.

Prepare a sourced beat sheet and propose scoped interactions for the three selected historical moments; see `opportunity-story.md`. Specific puzzle controls, props and success conditions are not yet decided. Technical episode extraction now exists, and `?scene=episode-rover-01` previews it through the production factory. The existing optical-repair and unanswered-call sequence is fictional prototype material, not Opportunity history. Cinematic jumps will connect playable moments; game/presentation duration is not fixed.

Acceptance: clear playable actions and success conditions for the selected moments; time jumps communicate elapsed time; pause does not advance a cinematic timer; input/camera return predictably after a cut; completion returns the agreed typed result once. A present-day wreck is not physically revived or repaired by playing its memory.

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

The runtime refactor and placeholder hub entry/return route are implemented. Native development-browser rover/return and repeated-visit checks pass alongside the 23 automated tests and production build; other native/platform checks and owner acceptance remain separately tracked. Teammate worktrees are not created by this handoff, and no additional episode or complete new story is claimed. Branch from the agreed merged refactor commit and use the existing contracts; art and scene owners can now work in their actual separated directories.
