# User-supplied Mars rocks, runtime version 1

Source: the user supplied `mars-rocks.zip`, copied unchanged from Downloads into `assets/mars-rocks.zip`. The archive contains one FBX and two JPEG maps; it contains no license or attribution document. The author, acquisition URL and public redistribution terms have not been supplied. These are user-provided art assets, not claimed NASA scans, CC0 assets or measured Martian rock samples.

Original extracted files are retained under `source/` and `textures/`. The archive and extracted files are unmodified. `manifest.json` records SHA-256 hashes, paths and byte sizes for originals and runtime copies.

The FBX contains 15 meshes. Four are exported with their original topology, normals and UVs, after applying source transforms, centering in X/Z, grounding the lowest point at Y=0 and uniformly scaling for this scene:

| Runtime shape | FBX node | Longest horizontal dimension | Triangles |
| --- | --- | --- | --- |
| ridge | Mars_rock015 | 1.8 m | 266 |
| slab | Mars_rock014 | 1.4 m | 344 |
| block | Mars_rock005 | 0.8 m | 264 |
| fragment | Mars_rock008 | 0.45 m | 194 |

These are authored gameplay sizes, not physical survey measurements. Runtime uses +Y up and metres. `conversion.json` retains conversion scales and resulting dimensions.

Runtime exports live at `game/public/assets/rocks/user-mars-v1/`: `mars-rocks.glb` (geometry/UVs), `color.jpeg` (sRGB) and `normal-dx.jpeg` (linear data). The JPEGs are identical copies of the supplied maps. The DirectX normal map is interpreted with negative normalScale.y; no pixels were edited. Source UV sampling is retained, with a scene-owned contact-dust blend joining the existing ground. Normal strength is .65, roughness .97 and metalness zero.

Rebuild from the repository root using the existing project dependencies: `node scripts/convert-mars-rocks.mjs`. It reads only these retained source assets and writes this versioned runtime directory and conversion record. No account, network download or paid generation is required.

The unrelated `assets/mars.zip` remains unchanged and unused by this pass; a whole-planet asset is not substituted for the playable terrain. The user's landscape/rock screenshots informed sparse placement and relief; no watermarked reference image was imported as game art.
