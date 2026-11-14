# Working together during the contest

Read `ROADMAP.md`, `outputs/planning/architecture.md` and your role in `outputs/planning/team-development.md`. The source is currently a rover-only prototype; the modular architecture is a migration target. Do not independently move shared runtime files while another contributor is extracting them.

## Ownership

| Role | Owns after M1 extraction | Shared changes to coordinate |
| --- | --- | --- |
| Integrator (normally user + AI) | `app/`, `core/`, `main.ts`, registry, contracts, shared UI, dependencies, build workflow | Final contract changes, merges and release tags |
| Hub owner (can be the integrator) | `entities/spirit/`, `scenes/mars-hub/` | Mars environment interfaces and hub return bookmarks |
| Episode owner (colleague + AI) | `scenes/episodes/rover/`, episode progression and authored timeline | Shared rover rig/controller, environment and result types |
| Asset owner (optional third person or shared role) | Assigned versioned asset directories and provenance | Loader registrations, materials, pivots and budgets |

Before M1, those destination folders do not exist. The integrator owns current `main.ts`, `progress.ts`, `world.ts` and shared camera/input extraction. Other workers can prepare asset imports, a proposed hub layout and a story beat sheet without touching those files.

## Isolated work

Different computers each use a clone and their own branch. Several simultaneous sessions on one computer each need their own worktree; changing branches in a shared folder does not isolate their file edits. Worktrees isolate files, not global Git configuration, remote services or external asset folders. Do not use one shared absolute export directory for multiple workers.

Examples from the repository root, after the contract milestone has merged:

```sh
git worktree add ../mars-echoes-spirit -b feat/spirit-hub main
git worktree add ../mars-echoes-rover -b feat/rover-memory main
git worktree add ../mars-echoes-assets -b art/rover-assets main
```

These are commands for future contributors; no worktrees or teammate branches are created by this planning delivery. Give each AI task the exact worktree path, branch, owned files, shared contract version and acceptance checks. An agent must not edit the integration checkout or another contributor's worktree.

Install dependencies in each worktree with `npm --prefix game ci`. Use ports such as 5176, 5177 and 5178 for parallel previews. Do not change the shared lockfile just to get a different port. Coordinate any new package with the integrator before installing it.

## Small merge cycle

1. Pull/fetch the current integration baseline before starting a small task. Commit your own work before incorporating changes from `main`.
2. Keep one behavior or asset change per small commit. Commit source, runtime assets and provenance; leave builds, node_modules, scratch jobs and credentials ignored.
3. Run `npm --prefix game run build` and the checks relevant to your change. Capture actual gameplay for visual or motion work.
4. Open a pull request with what changed, owned paths, test results, visual evidence and any shared contract implications. A branch can be a draft while work continues.
5. The integrator merges one branch at a time, runs the build, then checks the changed scene and its transitions. Merge regular playable increments, roughly every 30–60 minutes, rather than waiting for the end of the day.
6. If a merged change breaks the demonstration, revert that merge/commit or restore a known-good release checkout. Do not force-push teammates' branches or use a destructive reset on shared work.

Build checks alone do not prove input ownership, resource cleanup, story readability or camera quality. Hub/episode changes need an enter/exit/pause/reset test, and renderer changes need a check of both modes. A prepared build template is at `outputs/planning/build-workflow.yml`; it is not active because the current GitHub login lacks workflow-publication scope. After an authorized account enables it at `.github/workflows/build.yml`, enable required reviews/checks separately if desired and supported by the repository plan. Run the local build for every merge in the meantime.

## Asset handoff

Use stable IDs and new versions instead of overwriting an accepted binary. Assign one person per GLB/Blender source/version; binary files cannot be meaningfully line-merged. Small current assets remain ordinary Git files. If future authoring sources become large, agree on Git LFS/storage before adding them; everyone must be able to fetch the same version.

New assets use metres, +Y up and local -Z forward unless a manifest explicitly describes an import conversion. Deliver a GLB, authoring source where applicable, pivots/part names, material/texture links, a scale preview, source/license/prompt and hashes. New moving parts should have stable node names. Mechanical pivots can use rigid transforms; do not add a humanoid skeleton to the rover. A humanoid spirit may need a rig, while its placeholder can be simpler.

Keep vendor originals intact under `assets/`; place reviewed runtime exports under `game/public/assets/`. Shared downloaded assets remain at their existing paths until their migration is coordinated. An asset contributor can supply a preview and proposed registration without independently editing the global loader or scene registry.

## Completion handoff

Record the branch/base commit, files changed, current run command, local preview port, checks actually performed and remaining limits. Separate implemented behavior from proposals and owner acceptance. Never mark a memory complete just because it loads; never call the preserved rover demo proof that the new spirit loop works.

Workflow reference: [Git worktrees](https://git-scm.com/docs/git-worktree).
