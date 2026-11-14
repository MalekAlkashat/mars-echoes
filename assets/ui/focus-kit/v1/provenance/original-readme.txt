DETR0IET FOCUS / ORIGINAL FORENSIC INTERFACE KIT
Folder name: detroiet focus

OPEN FIRST
Double-click START HERE.html for the interactive scanning and reconstruction preview.
The gallery lets you inspect every component, change the preview surface, and download
each transparent PNG or scalable SVG. All previews work offline.

WHAT IS INCLUDED
59 static interface components, each as a portable outlined SVG, a transparent
PNG at 1x, and a transparent PNG at 2x. Editable text SVGs live in source/svg-editable/.
6 animations: target scan, analysis spinner, evidence pulse, progress bar, full-screen
scan sweep, and reconstruction reveal. Each includes an animated SVG, lossless APNG,
individual transparent PNG frames, and a PNG texture atlas with JSON frame coordinates.
6 original mono 44.1 kHz / 16-bit WAV interface sounds.
4 original static 3D ghost mannequins as self-contained GLB files, with an offline viewer.
Rajdhani typefaces and their original SIL Open Font License.
palette.json, manifest.json, asset-index.csv, and a full visual contact sheet.

THE TWO MODES
SCANNING HUD: target brackets, lock states, evidence pins, object cards, progress,
analysis results, warnings, keyboard prompts, blue veil, scan lines and screen frame.
CRIME-SCENE RECONSTRUCTION: four ghost subject poses, motion trails, footprints,
evidence links, movement trajectory, event labels, perspective grid, timeline,
replay buttons, confidence readout, and reconstruction status.

TRANSPARENCY
All asset PNGs and animations use actual alpha transparency, not a baked checkerboard.
Bounded interface cards have an intentionally translucent dark plate. The surrounding
canvas is transparent. Use normal alpha blending (straight alpha). Some GPU engines
convert textures to premultiplied alpha internally; let the engine handle that step.
APNGs use the .png extension and contain multiple frames. A file viewer may show only
the first frame; use a supporting browser or import the supplied frame sequence.

USING THE ARTWORK
PNG/1x: standard resolution. PNG/2x: sharper raster exports (1920x1080 overlays become
3840x2160). SVG: fully scalable, text outlined for reliable appearance on any computer.
SOURCE/SVG-EDITABLE: change text, colors and sample values in an SVG editor. Install the
included Rajdhani fonts only if you need to edit live text. PNG text is already rendered.
SOURCE/BUILD_PACK.PY: regenerate the 2D pack with Python; see the file header. Then run
SOURCE/BUILD_GHOST_MODELS.PY for the 3D files and offline 3D viewer. Run VALIDATE_PACK.PY
last to refresh thumbnails and verify all deliverables.

UNITY / UNREAL / GODOT
Place HUD images on a UI canvas above the 3D view. Use unlit transparent materials for
world-space evidence markers. Texture atlases use a 6-column grid; frameRects in the JSON
are pixel coordinates from the top left. Animation frame rate and pivots are in manifest.json.
Use an engine outline or post-process shader for highlighting actual 3D scene objects.

BLENDER / VIDEO EDITING
Import transparent PNGs or frame sequences as alpha overlays. Enable image-sequence
playback at the fps supplied in manifest.json. SVG files are mainly for vector editing;
use PNG for exact raster appearance in a render. Set the compositor output to RGBA.

RECONSTRUCTION LIMITS
The 2D ghost subjects are suitable for overlays, diagrams and billboards. The additional
3D-GHOST-MODELS directory contains four original faceless mannequins in static poses.
Those models have no skeleton or character animation. A full 3D reconstruction system
also needs your scene's character animation, path tracking and engine logic. This kit
supplies its interface, visual overlays and static subject proxies. Readouts are sample data.

STYLE AND RIGHTS
This is original artwork inspired by cinematic android scanning interfaces, including
the mood requested from Detroit: Become Human. It contains no extracted game files,
game audio, logos, screenshots, character likenesses or proprietary typefaces.
Original graphics, animations and audio: CC0 dedication; free for personal and commercial
use. Fonts: SIL Open Font License, with the original license included in fonts/OFL.txt.
See LICENSE.txt and SOURCES.txt.
