# Ready-made assets for the first test

A small prototype kit has been downloaded and structurally inspected. It contains nine GLB files totaling about 5.09 MB before archive compression. Use these to prove the game loop before custom model production.

| Source | Included files | Use |
| --- | --- | --- |
| Kenney Space Kit, CC0 | Rover, generator, satellite dish, structural piece | A lightweight controllable placeholder plus reusable mission-hardware props. |
| Kenney Nature Kit, CC0 | Three rock shapes and a cliff piece | Assemble the nearby route and rock boundaries; tune material color toward the selected orange environment. |
| NASA/JPL-Caltech | Perseverance rover | Higher-detail alternate for model loading, camera/arm structure and animation investigation. NASA media guidelines apply; this is not CC0. |

Sources: [Space Kit](https://kenney.nl/assets/space-kit), [Nature Kit](https://kenney.nl/assets/nature-kit), [NASA rover](https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/), [NASA usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

## Checks completed

All nine files have valid GLB headers, parsable glTF metadata and embedded resource references, with no external buffer or texture files needed. The Kenney files require no glTF extensions. The NASA file requires Draco mesh decoding and contains 88 nodes, 68 meshes and 23 animation clips. Its head and arm have separate named nodes; its wheels are grouped in one named mesh. Clip playback has not been tested.

The Kenney rover is 13,384 bytes, a single mesh and has no supplied animation clips. Use it first for driving, camera and environment integration; do not assume ready-made independent wheel or arm motion.

## Local organization and delivery

Runtime sources are in `assets/vendor/kenney/` and `assets/vendor/nasa/`. The downloadable `outputs/test-asset-kit.zip` preserves the models, source notes, license statement, asset manifest and inspection report.

The Kenney GLBs came from the [CC0 conversion mirror](https://github.com/Hidencod/tge-assets) after the original publisher's archive downloads returned access errors. The NASA GLB came directly from NASA. Exact URLs and SHA-256 hashes are recorded in `test-asset-manifest.json`.

## Proposed first use

Start with the lightweight Kenney rover and rock kit to test third-person movement, the graveyard route, camera changes and a separate optical-module interaction. A small optical-module test prop can be authored independently. Keep existing assets visibly categorized as placeholders. The approved larger-eye rover, stage-two deterioration and cold orange graveyard remain the visual target for later replacement.

This is an asset intake result, not a completed or visually verified gameplay scene.
