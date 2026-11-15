# Blueberry Clue runtime materials v1

Original project-authored procedural maps, 14 November 2026. These files contain no sampled NASA image pixels, scanned geology, Earth asset maps, or generated-provider media. They are authored reconstructions informed by the separately retained NASA reference pack.

Generator: `assets/references/mission-one/v1/build-materials.py`, seed 4912. Six 2048-pixel maps; 0.3 m nominal tile width. Base color uses sRGB; normal and roughness use linear sampling. Normal convention is OpenGL +Y. The same grain/meso-relief/pit field drives color, normals and roughness. Mipmaps and anisotropic filtering bound distant microdetail. Materials are nonmetallic; no metallic blueberry treatment.

`manifest.json` retains SHA256, size and generation settings. Procedural map authorship does not imply calibrated Mars reflectance or a measured geology dataset. NASA images are references, never tiled textures.

Geometry is source-authored in `game/src/scenes/episodes/rover/missions/blueberry-clue/art.ts` and `surface.ts`: a compact basin, laminated slabs, instanced gray grains, a RAT instrument reconstruction and an explanatory sediment cutaway. Scene units are metres. The abrasion cavity uses 0.0455 m diameter and 0.0044 m depth as a McKittrick-inspired teaching operation; grain diameters vary artistically around 0.004 m. The separate brushed comparison is not a drilled target.

Reference provenance, per-image credits, dates, image interpretation and original URLs: `assets/references/mission-one/v1/manifest.json` and `SOURCE.md`. Claim crosswalk: `outputs/planning/mission-one/claims.json`. NASA media are subject to their own media guidelines and institutional credits; this project does not imply NASA endorsement.

The unchanged NASA Opportunity GLB remains in `assets/opportunity/opportunity-v1.glb` relative to public. It uses the original source material identities and wheel system. No full arm rig or historically measured early-mission weathering profile is claimed. The tool close-up is explicitly labeled as a separate reconstruction.

## NASA archive photographs, 15 November 2026

Prepared 15 November 2026. The two runtime JPEGs are byte-identical copies of retained NASA-delivered reference files in `assets/references/mission-one/v1/`. The reference service supplied these resolutions; they are not asserted to be archival full-resolution originals. No cropping, recoloring, generative editing, resizing or re-encoding was performed. `source-records.json` retains the acquisition URLs, source pages, observation context, dimensions, byte counts and SHA256 hashes copied from the verified source manifest. The originals and their manifest remain unchanged.

| File | Source and observation context | Credit | Dimensions | Bytes | SHA256 |
| --- | --- | --- | --- | --- | --- |
| mckittrick.jpg | [PIA05459 — Circular Signs of the Rock Abrasion Tool](https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/). Front Hazard Avoidance Camera view of McKittrick's abrasion. The documented grinding event was Sol 30, 23 February 2004; do not label this as an independently established image-capture date. Published 27 February 2004. | NASA/JPL | 1024 × 1024 | 146292 | ff5f72bdd930e7d82d2de341c47cdd5d815f5e6984b28475ec74d2b8dbd90753 |
| berry-bowl.jpg | [PIA05634 — Discovery Served Up in a Bowl](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/). Panoramic Camera approximate true-color view of Berry Bowl and the brushed comparison at Near Empty, Sol 48. Published 25 March 2004; publication is not capture time. | NASA/JPL-Caltech/Cornell | 768 × 512 | 70018 | 91c5f44ce53584b2b6ee6bcfff66b151e1ac502abf88e0b59f508e83b11006e5 |

McKittrick and Berry Bowl are different targets and observations. McKittrick's shallow abrasion exposed fresh rock. Berry Bowl's comparison needed brushing, not grinding; mineral identification depended on instrument measurements. The chapter may compress actions and travel, but its photographs must retain those distinctions. Neither image depicts ancient water or validates the chapter's reconstructed geometry.

Use follows [NASA images and media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/), as documented by the retained pack. These images are not labeled CC0 and do not imply NASA endorsement. Retain each institutional credit. No NASA logos or seals are used. Present unchanged aspect-contained photographs separately from generated/reconstructed content, and identify any later crops or transformations in a new record rather than replacing these files.
