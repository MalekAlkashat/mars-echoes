# Working together during the contest

Current phase: final spirit art is deferred, but the base hub is required first and uses the existing placeholder for roaming and discovering Opportunity. Read `outputs/planning/mission-foundation.md` before new mission or terrain work. The current code has one fictional repair episode, not three isolated Opportunity chapters. The integrator must establish the shared mission host/interface and configurable terrain before parallel chapter integrations; authors can prepare puzzle logic, references and assets independently meanwhile. Use `codex/` for new branch names. The older hub/episode examples below describe the existing source.

Read `ROADMAP.md`, `outputs/planning/architecture.md` and your role in `outputs/planning/team-development.md`. The source now implements the ownership directories below, shared runtime services, a placeholder Mars hub and an isolated rover repair/call episode. `game/src/app/contracts.ts` is the authoritative implemented scene/input/result interface. Coordinate changes through the integrator; do not independently replace shared services or copy the frame loop into a level.

## Ownership

| Role | Existing owned source under `game/src/` | Shared changes to coordinate |
| --- | --- | --- |
| Integrator (normally user + AI) | `app/`, `core/`, `main.ts`, registry, contracts, shared UI, dependencies, build workflow | Final contract changes, merges and release tags |
| Hub owner (can be the integrator) | `entities/spirit/`, `scenes/mars-hub/` | Mars environment interfaces and hub return bookmarks |
| Episode owner (colleague + AI) | `scenes/episodes/rover/`, episode progression and authored timeline | Shared rover rig/controller, environment and result types |
| Asset owner (optional third person or shared role) | Assigned versioned asset directories and provenance | Loader registrations, materials, pivots and budgets |

These directories contain executable source, not empty scaffolding. The former global `progress.ts` is now the episode's `mission.ts`, and the former world setup is divided between reusable `environments/mars/` and scene-owned layouts. The integrator owns contract/registry changes and shared dependencies. An episode-specific HUD stays beside its mission; it does not belong in global UI state. Audio service and authored time-jump timeline modules are future work, not part of the current contract.

## Isolated work

Different computers each use a clone and their own branch. Several simultaneous sessions on one computer each need their own worktree; changing branches in a shared folder does not isolate their file edits. Worktrees isolate files, not global Git configuration, remote services or external asset folders. Do not use one shared absolute export directory for multiple workers.

Examples from the repository root, after the integrator commits and pushes the verified refactor and everyone has fetched that agreed base:

```sh
git worktree add ../mars-echoes-spirit -b feat/spirit-hub main
git worktree add ../mars-echoes-rover -b feat/rover-memory main
git worktree add ../mars-echoes-assets -b art/rover-assets main
```

These are commands for contributors; this refactor does not create teammate branches or worktrees. Give each AI task the exact worktree path, branch, owned files, shared contract revision and acceptance checks. An agent must not edit the integration checkout or another contributor's worktree. Actual colleague names, handles and access are not assigned by this documentation.

Install dependencies in each worktree with `npm --prefix game ci`. The integrator's previews use 5180 for development and 5181 for production; use different ports such as 5182, 5183 and 5184 for parallel previews. `?scene=mars-hub` and `?scene=episode-rover-01` select actual production factories for independent scene work. Do not change the shared lockfile just to get a different port. Coordinate any new package with the integrator before installing it.

## Small merge cycle

1. Pull/fetch the current integration baseline before starting a small task. Commit your own work before incorporating changes from `main`.
2. Keep one behavior or asset change per small commit. Commit source, runtime assets and provenance; leave builds, node_modules, scratch jobs and credentials ignored.
3. Run `npm --prefix game test`, `npm --prefix game run build` and any checks relevant to your change. Capture actual gameplay for visual or motion work.
4. Open a pull request with what changed, owned paths, test results, visual evidence and any shared contract implications. A branch can be a draft while work continues.
5. The integrator merges one branch at a time, runs the build, then checks the changed scene and its transitions. Merge regular playable increments, roughly every 30–60 minutes, rather than waiting for the end of the day.
6. If a merged change breaks the demonstration, revert that merge/commit or restore a known-good release checkout. Do not force-push teammates' branches or use a destructive reset on shared work.

Build checks alone do not prove input ownership, resource cleanup, story readability or camera quality. Hub/episode changes need an enter/exit/pause/reset test, and renderer changes need a check of both modes. A prepared build template is at `outputs/planning/build-workflow.yml`; it is not active because the current GitHub login lacks workflow-publication scope. After an authorized account enables it at `.github/workflows/build.yml`, enable required reviews/checks separately if desired and supported by the repository plan. Run the local build for every merge in the meantime.

## Asset handoff

Use stable IDs and new versions instead of overwriting an accepted binary. Assign one person per GLB/Blender source/version; binary files cannot be meaningfully line-merged. Small current assets remain ordinary Git files. If future authoring sources become large, agree on Git LFS/storage before adding them; everyone must be able to fetch the same version.

New assets use metres, +Y up and local -Z forward unless a manifest explicitly describes an import conversion. Deliver a GLB, authoring source where applicable, pivots/part names, material/texture links, a scale preview, source/license/prompt and hashes. New moving parts should have stable node names. Mechanical pivots can use rigid transforms; do not add a humanoid skeleton to the rover. A humanoid spirit may need a rig, while its placeholder can be simpler.

Keep vendor originals intact under `assets/`; place reviewed runtime exports under `game/public/assets/`. Shared downloaded assets remain at their existing paths until their migration is coordinated. An asset contributor can supply a preview and proposed registration without independently editing the global loader or scene registry.

## Completion handoff

Record the branch/base commit, files changed, current run command, local preview port, checks actually performed and remaining limits. Separate implemented behavior from proposals and owner acceptance. Never mark a memory complete just because it loads. The current completion marker means the preserved prototype repair/call sequence was completed, not that the full mission-to-shutdown story has been built. Aborted visits and failed loads must not add completion.

Workflow reference: [Git worktrees](https://git-scm.com/docs/git-worktree).
