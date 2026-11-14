# Focus UI asset kit, v1

Asset-only import from the user-supplied `detroiet focus.zip`. No website, preview application, build scripts, installed fonts or game changes are included. Files retain descriptive kebab-case names; `catalog.json` provides namespaced properties such as `reticles.focusIdle`, `panels.analysisCard`, `animations.targetScan`, `audio.targetLock` and `fonts.rajdhaniMedium`.

## Layout

- `svg/<category>/`: portable outlined vectors, preferred for scalable HUD images.
- `png/1x/` and `png/2x/`: raster alternatives, with dimensions and pivots in the catalog.
- `source/svg-editable/<category>/`: editable text/vector originals.
- `animations/`: animated SVG, APNG, frame sequences and atlases with frame rectangles/timing. Use one representation per animation; do not preload all alternatives. APNG files have `.png` extensions. `reducedMotionPoster` supplies a static alternative.
- `audio/`: six WAV feedback cues with measured format/duration. Playback is opt-in; sound quality has not been auditioned.
- `fonts/`: Rajdhani 500/600 TTF files and the original OFL license.
- `models/`: four static reconstruction mannequins, each explicitly unrigged/unanimated and +Z forward. These are optional references, not a replacement for the game’s spirit.
- `provenance/`: original manifest/readme/index plus archive hash and source-to-destination file mapping.

## Property conventions

All catalog paths are relative to this directory, not public browser URLs. No files are copied to `game/public` until an integration chooses what it needs. Static graphic dimensions use 1x pixels; 2x exports double each dimension. Pivots are normalized with a top-left origin. Sprite rectangles also use top-left pixel coordinates. Color textures are sRGB with straight alpha. `placement` and `intendedUse` are proposed integration roles, not implemented bindings. Baked labels/readouts are sample data: use editable originals and live game values when integrating. Do not rely on an image as an accessible button label.

The source pack declares original graphics, animations, audio and mannequin models CC0. Fonts use SIL OFL. Original declarations are preserved in `LICENSE.txt`, `SOURCES.txt` and `fonts/OFL.txt`; this is supplier-provided provenance, not an independent authorship audit. `checksums.json` verifies imported deliverables. The preview website, thumbnails and generator scripts remain in the original ZIP and are intentionally omitted.

Validation: all catalog paths resolve; 59 SVG/PNG export sets and raster dimensions, six animation frame counts/metadata, six WAV headers and four GLB headers were checked during import. No game implementation changed, so a gameplay build or visual acceptance is not implied.
