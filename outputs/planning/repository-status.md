# Repository setup record

Updated 14 November 2026 for the runtime-organization delivery. The earlier planning-only snapshot is retained in Git history.

- Repository: https://github.com/MalekAlkashat/mars-echoes
- Visibility selected at creation: private.
- Working repository name: `mars-echoes`; final game title is undecided.
- Default integration branch: `main`.
- Remote: `origin`, connected over HTTPS to the repository above, using the existing GitHub CLI credential helper scoped to this local repository.
- Preserved rover source baseline: commit `179705b`, annotated tag `rover-v2-baseline`.
- Canonical roadmap: root `ROADMAP.md`. `outputs/planning/ROADMAP.md` is an identical delivery copy for the document viewer; edit the root original and refresh the delivery copy when changing it.
- Contributor guidance: root `CONTRIBUTING.md`, with architecture and role handoffs alongside this record.
- Runtime organization: `game/src/main.ts` is bootstrap only. Shared `app/` and `core/` services compose separate hub and rover factories, entities, Mars environment, content registration and UI. `app/contracts.ts` is the authoritative contributor interface. This is actual source organization, not a proposed folder tree.
- Build/test verification: `npm --prefix game run build` and `npm --prefix game test` pass. The suite has 23 director/lifecycle, rover and spirit checks. Runtime source has changed through the staged extraction and placeholder hub integration; the original rover source remains at the baseline tag.
- Native development-browser verification: full preserved repair/call sequence, invalid-alignment retry, installation/calibration, Return to Mars and ten additional aborted visits pass. Every sampled hub return reports 134 geometries/34 textures, the same horizontal position and one prior prototype completion; browser errors are empty. Fault UI, mobile and production-browser results are tracked separately in the integrator's review report.
- GitHub build check: the ready-to-enable template at `outputs/planning/build-workflow.yml` installs locked dependencies and runs typecheck/production build. The current GitHub login can publish code but lacks workflow-publication scope; GitHub rejected a push containing an active workflow. The template is therefore not installed at `.github/workflows/build.yml` and no remote CI success is claimed. Run the verified local build before each merge. This does not establish visual or gameplay acceptance.
- No branch protection, collaborator invitations or teammate branches/worktrees are configured by this delivery. Actual owned paths and contributor boundaries are now available; use the integrator's committed/pushed refactor revision as the branch base, not the earlier flat source layout.
- Selected references, project workflows, originals/provenance and runtime assets are versioned. Local packaged ZIPs, generated build directories, larger gameplay captures, scratch tools/jobs, dependency installs and environment credentials are excluded.

The game now opens a placeholder spirit hub and can enter/return from the preserved rover repair/call episode. The complete past mission, cinematic time jumps, shutdown, final spirit art and sound remain roadmap work; its original assignment is still undecided. Historical v2 tests remain under `outputs/review/visual-pass-v2/` and do not substitute for current refactor review. The extraction release is identified by Git tag `runtime-foundation`, the contributor branch base. The compiled production playthrough and 390 by 844 controls also pass; current evidence and limitations are recorded under `outputs/review/runtime-refactor/REVIEW.md`.
