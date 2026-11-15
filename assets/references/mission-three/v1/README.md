# Mission 3 resources: The Long Night

Prepared 15 November 2026 in isolated `work/mission-three-research`, branch `codex/mission-three-research`, base `548ce49`. Research and reference preparation only; no runtime code or terrain changed.

Open [the offline catalog](index.html), then read [the research and production handoff](../../../../outputs/planning/mission-three-research.md). [claims.json](claims.json) separates verified evidence, conflicts, unverified claims and proposals. [manifest.json](manifest.json) records exact media URLs, dates, credits, dimensions, hashes and limitations.

## Start with these

| Need | Resource |
| --- | --- |
| Correct archival ending | R01 / PIA22929 partial transmitted frame and R02 / PIA22930 later thumbnail pair |
| Atmosphere direction | R03 / PIA22521, explicitly a simulation |
| Final-site composition and color | R04 approximate true-color overview; R05 annotated false-color panorama |
| Later orbital context | R06 and R07, September 20 HiRISE observations |
| Engineering briefing | R08 original opacity chart; R09 June 6 MARCI map; R10 Smith/Guzewich research paper |

There are **nine acquired image/chart originals and one PDF**, with nine static previews and a labeled contact sheet. Nineteen original source pages are retained offline; five more were read but remain link-only because direct downloads returned empty bodies. [Source notes](source-notes.md) record access limits and caption errors.

The true-color JPEG is only **900 × 201**. Its larger TIFF remains link-only. The last-taken image pair is only **224 × 96**. Neither upscaling nor generation can supply missing historical detail.

## Production boundaries

Use these to author a labeled reconstruction. Keep archival images unchanged and distinguish opacity, solar energy generation and stored battery energy. Future player conservation choices are an educational abstraction; the historical outcome stays fixed. Exact final pose, post-contact battery trajectory, authentic storm audio and a calibrated tau-to-render/power model were not established.

Reuse the project's selected NASA MER model and approved materials; [reuse.json](reuse.json) inventories local dependencies. A late-mission dust mask, compact site geometry, optimized storm treatment, accessible power feedback, time transitions and archival cards still need authoring and runtime acceptance.

## Reproduce and check

Python 3.12 and the already-available Pillow 10.4 were used; no package was installed.

```powershell
python assets/references/mission-three/v1/acquire.py --pages --assets --validate
python assets/references/mission-three/v1/build_catalog.py
python assets/references/mission-three/v1/acquire.py --check-main
```

Downloads need network access. Original files are hash-checked and never silently replaced. The downloader uses fixed destinations, an explicit host allowlist, redirect checks and a 30 MiB per-resource cap. Originals remain separate from labeled previews. See [SOURCE.md](SOURCE.md) for rights and transformations.

