# Mission 1 reference pack v2

Inspected 14 November 2026. This pack supplements v1 with instrument engineering references and the four user-supplied visual references. None of these photographs or the paper's illustrations is shipped as a runtime texture. `manifest.json` records provenance and SHA256. `board.html` provides an offline comparison.

## Instrument sources and boundaries

- [Myrick, Davis and Wilson, Rock Abrasion Tool (2004)](https://esmats.eu/amspapers/pastpapers/pdfs/2004/myrick.pdf), Honeybee Robotics, Proceedings of the 37th Aerospace Mechanisms Symposium, NASA Johnson Space Center. Read the mechanism description and inspected Figures 1–3. The retained PDF and page renders are research references, not CC0 game assets; no blanket public-domain status is claimed. Reconstruction uses the documented envelope, offset cutter, feed mechanism, butterfly supports and contact feet. It is authored geometry, not flight CAD. Real rotation speeds and operation duration are not reproduced in game.
- [NASA PIA05446, Grinding Wheel Profile](https://science.nasa.gov/photojournal/grinding-wheel-profile/) shows the short paddle and two abrasive ends, with separate spin and revolution. Transmission/compression defects in the image are not rock features. NASA's caption rounds the paddle length differently from the engineering paper; the mesh follows the paper's 23.37 mm dimension.
- [NASA PIA08625, RAT working face](https://science.nasa.gov/photojournal/rock-abrasion-tool-exhibits-the-deep-red-pigment-of-mars/) shows Spirit in July 2006. Used only to interpret working-face organization. Its heavy later dust coating is not copied onto early-2004 Opportunity.
- Retain NASA's per-image credits and [media terms](https://www.nasa.gov/nasa-brand-center/images-and-media/). No logo or endorsement is implied. Engineering-paper rights remain with its respective owners.

## User images

1. **Hazcam outcrop:** grayscale; useful for low fractured plates, dark sediment seams and rover scale. The exact image ID/sol is unverified. No color is inferred from grayscale.
2. **Close spherules:** useful for irregular outlines, slight elongation and partial burial. The repost's exact product/filter provenance is unverified. Its saturated cyan is not a natural-color material reference.
3. **Warm Berry Bowl repost:** matched visually against the NASA Berry Bowl image retained in v1. The repost says “Curiosity”; that is inconsistent with NASA's Opportunity attribution and is not carried into game copy.
4. **Enhanced Berry Bowl comparison:** useful for distribution, exposed slabs and dark material between plates. The enhanced blue is not used as a literal grain color.

For verified location/instrument/science claims, use v1's primary NASA pages. [JPL's later Endurance caption](https://www.jpl.nasa.gov/images/pia06777-two-types-of-round-pebbles-in-endurance/) explicitly describes blueberries as gray. That corroborates the color choice; it does not relocate the Eagle chapter to Endurance. Attachments are preserved byte-for-byte for internal reference, with no independently verified redistribution rights asserted for the reposts.

## What reaches the game

`geology.ts` creates fractured plate geometry, embedded/loose matte gray grains and a shallow excavation that preserves the specimen outline. `rat.ts` reconstructs the stationary case, support wings, feet, cables, brush and offset cutter. Dimensions are in metres. Full arm articulation is still outside this pass.

The four existing Poly Haven **Dry Riverbed Rock** maps provide an Earth analog for surface microdetail, under CC0; they are not NASA-derived Mars scans. Original files, URLs and license remain in `assets/vendor/polyhaven/SOURCE.md` and its manifest. The shader derives luminance from the scan and applies the authored warm palette. V1's generated sand maps remain in use. No originals were replaced.

The opening uses locally hosted Rajdhani from the user's Focus kit, with its SIL OFL license. Live HTML date/location/title text and CSS corner lines adapt the kit's visual language; no sample scientific labels or blue screen overlay are baked into the scene. The February–March 2004 date spans the chapter's combined operations and observations, rather than inventing one common sol.

AI assistance: Codex authored the reconstruction geometry, procedural material adaptation, cinematic code and documentation. No new generative-image or paid 3D service was used in this pass. These assets remain a representative, labeled reconstruction, subject to owner visual review.
