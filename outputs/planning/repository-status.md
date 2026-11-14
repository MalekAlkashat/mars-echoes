# Repository setup record

Prepared 14 November 2026 for the spirit and equipment-memory planning delivery.

- Repository: https://github.com/MalekAlkashat/mars-echoes
- Visibility selected at creation: private.
- Working repository name: `mars-echoes`; final game title is undecided.
- Default integration branch: `main`.
- Remote: `origin`, connected over HTTPS to the repository above, using the existing GitHub CLI credential helper scoped to this local repository.
- Preserved rover source baseline: commit `179705b`, annotated tag `rover-v2-baseline`.
- Canonical roadmap: root `ROADMAP.md`. `outputs/planning/ROADMAP.md` is an identical delivery copy for the document viewer; edit the root original and refresh the delivery copy when changing it.
- Contributor guidance: root `CONTRIBUTING.md`, with architecture and role handoffs alongside this record.
- Build verification: `npm --prefix game run build` passes locally on this delivery. It reports the existing large-chunk advisory; the production bundle is still about 744 kB before compression. No runtime source was changed by this delivery.
- GitHub build check: the ready-to-enable template at `outputs/planning/build-workflow.yml` installs locked dependencies and runs typecheck/production build. The current GitHub login can publish code but lacks workflow-publication scope; GitHub rejected a push containing an active workflow. The template is therefore not installed at `.github/workflows/build.yml` and no remote CI success is claimed. Run the verified local build before each merge. This does not establish visual or gameplay acceptance.
- No branch protection, collaborator invitations, teammate branches/worktrees or runtime migration are configured by this delivery. Those are distinct from creating a remote and defining ownership.
- Selected references, project workflows, originals/provenance and runtime assets are versioned. Local packaged ZIPs, generated build directories, larger gameplay captures, scratch tools/jobs, dependency installs and environment credentials are excluded.

The game currently runs the preserved rover-only sequence. Spirit movement, hub/episode switching, the complete past mission, shutdown and sound are roadmap work. Historical runtime tests remain under `outputs/review/visual-pass-v2/`; the new scene lifecycle and transition tests cannot pass until that implementation exists.
