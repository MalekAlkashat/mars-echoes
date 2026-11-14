# Mission 2 resource handoff

Prepared 14 November 2026 for **Stuck in Purgatory**, Opportunity's April–June 2005 memory. This increment acquires references and a material candidate; it does not implement the mission or change Mission 1's design.

## Deliverable

Pack: [`assets/references/mission-two/v1/`](../../assets/references/mission-two/v1/README.md). Open its `index.html` for the offline visual catalog. It contains full-resolution NASA panorama/observations, wheel time-lapse, test-lab photograph, offline captions/usage guidance, four 2K CC0 sand maps, supplier metadata, provenance/hashes and historical/recovery notes. Original imagery and material maps remain unchanged. Derived static previews have a separate manifest.

Acquisition worktree: `C:/Nasa 2026/mars-echoes/work/mission-two-resources`, branch `codex/mission-two-resources`, source base `0becdac`. Owned changes: this resource directory and this handoff only. The main checkout's existing local edits and active `work/mission-one` are outside this task. No preview server or gameplay port is needed for this pack.

## Starting points and remaining work

Use PIA07216 for composition/palette and 2005 condition; PIA07999 and PIA07922 for low ripple/track layout; PIA07983 GIF and four wheel stills for slip, burial and powder packing. The Earth-test photo supports the work of the ground team. `sources/recovery-notes.md` supplies checked claim IDs and primary records, including the warning that the rover was already driving backwards when it became stuck.

`reuse.json` lists the existing NASA rover and material assets. Reuse their paths and original credits rather than substituting another rover. Dense Sand is an audition candidate: its 1.8 m scan patch is not a 1.8 m dune, and its soil appearance does not define traction. Correct sRGB/data channels, scale and in-scene comparison are required before selecting it. Hero ripple/rut geometry, deforming sand/cleat masks, mission-local slip/sinkage and guided recovery gameplay still need authored implementation. No surveyed terrain or validated soil physics is supplied.

The receiving mission would live in `game/src/scenes/episodes/rover/missions/purgatory/` under the agreed mission-host foundation. The integrator owns shared `app/`, `core/`, contracts, saves, registry and rover/environment interfaces. Follow current source contracts; do not independently scaffold a new renderer, input service, physics package or save system. Preserve default hub behavior, drive/repair previews and Mission 1's ongoing work.

Relevant workflow instructions: `.agents/skills/plan/SKILL.md`, `feature-handoff/SKILL.md`, `materials-to-game/SKILL.md`, `game-level-design/SKILL.md`, `gameplay-visual-review/SKILL.md`, and `threejs-camera-direction/SKILL.md` (all under `.agents/skills/`). The project/ownership guidance takes precedence over imported skill defaults.

## Acceptance of this resource increment

Verify every original file against `manifest.json`; decode all stills and GIF frames; compare material files to supplier sizes/MD5; inspect the preview sheet for correct subject/labels and distinguish true-color, grayscale, height-coded and Earth-test images. Verify catalog links locally. This demonstrates asset acquisition and reference suitability, not runtime quality. Gameplay tests/build are not required for an asset-only addition outside `game/`; no new runtime visual or performance claim is made.

Before calling the eventual mission ready: review normal-speed drive/slip/escape shots, visible/contact agreement, restored historical wear on replay, pause/skip/control handoffs, successful return and exactly-once reward/save behavior through the shared foundation. Require in-engine hero quality and source-backed interpretation labels, matching the Mission 1 standard.
