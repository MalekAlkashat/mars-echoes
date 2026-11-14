# Hub rock kit v1

Geometry source: [Boulder 01](https://polyhaven.com/a/boulder_01), Rico Cilliers / Poly Haven. [CC0 1.0](https://polyhaven.com/license). Original glTF and textures remain in `assets/vendor/polyhaven/boulder_01`.

Offline preparation: `assets/vendor/polyhaven/boulder_01/prepare_hub_kit.py`, Blender 4.2. Weld coincident scan vertices; make deliberate oblique fracture cuts with planar caps; simplify separate ridge, slab, block and fragment meshes; validate duplicate faces; export positions/normals without material/texture payloads. No runtime vertex jitter or non-uniform stretching. The original scan and earlier runtime candidates are preserved.

- Ridge: 700 triangles.
- Slab: 539 triangles.
- Block: 420 triangles.
- Fragment: 120 triangles.
- GLB: 35,028 bytes. SHA256 `dc6f1a867fcd04a069032806f8e69634ad1066f7106b1a8bd820653e6babb8cd`.
- Units: metres, +Y up in GLB; origin at footprint centre and underside.
- Runtime: one existing rock material shared with surrounding rubble; world-space projection at the established scale. Neutral vertex colors supplied during scene setup. Four instanced batches, scene-owned geometries/material, existing scene disposal.

Two placements per primary shape plus eight small fragments total 4,278 triangles. The fragments replace eight existing scatter slots. Final six principal reliefs are 1.476, 1.045, 1.273, 0.789, 1.290 and 1.032 m.

Placement/shape reference: [NASA/JPL Perseverance Valley panorama, PIA21723](https://www.jpl.nasa.gov/images/pia21723-panorama-above-perseverance-valley-on-mars/) (NASA/JPL-Caltech/Cornell/Arizona State Univ.). Its color is enhanced; used to guide low exposed geology, broken rock and sandy gaps, not as a literal color calibration or texture source. The terrain and this Earth-derived scan kit are an artistic approximation, not measured Martian meshes or HiRISE terrain.
