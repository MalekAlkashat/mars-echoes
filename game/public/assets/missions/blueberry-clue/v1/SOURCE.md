# Blueberry Clue runtime materials v1

Original project-authored procedural maps, 14 November 2026. These files contain no sampled NASA image pixels, scanned geology, Earth asset maps, or generated-provider media. They are authored reconstructions informed by the separately retained NASA reference pack.

Generator: `assets/references/mission-one/v1/build-materials.py`, seed 4912. Six 2048-pixel maps; 0.3 m nominal tile width. Base color uses sRGB; normal and roughness use linear sampling. Normal convention is OpenGL +Y. The same grain/meso-relief/pit field drives color, normals and roughness. Mipmaps and anisotropic filtering bound distant microdetail. Materials are nonmetallic; no metallic blueberry treatment.

`manifest.json` retains SHA256, size and generation settings. Procedural map authorship does not imply calibrated Mars reflectance or a measured geology dataset. NASA images are references, never tiled textures.

Geometry is source-authored in `game/src/scenes/episodes/rover/missions/blueberry-clue/art.ts` and `surface.ts`: a compact basin, laminated slabs, instanced gray grains, a RAT instrument reconstruction and an explanatory sediment cutaway. Scene units are metres. The abrasion cavity uses 0.0455 m diameter and 0.0044 m depth as a McKittrick-inspired teaching operation; grain diameters vary artistically around 0.004 m. The separate brushed comparison is not a drilled target.

Reference provenance, per-image credits, dates, image interpretation and original URLs: `assets/references/mission-one/v1/manifest.json` and `SOURCE.md`. Claim crosswalk: `outputs/planning/mission-one/claims.json`. NASA media are subject to their own media guidelines and institutional credits; this project does not imply NASA endorsement.

The unchanged NASA Opportunity GLB remains in `assets/opportunity/opportunity-v1.glb` relative to public. It uses the original source material identities and wheel system. No full arm rig or historically measured early-mission weathering profile is claimed. The tool close-up is explicitly labeled as a separate reconstruction.
