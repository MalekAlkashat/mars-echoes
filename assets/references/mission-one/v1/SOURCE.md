# Mission 1 reference pack v1

Acquired and inspected 14 November 2026. Six reference images are stored byte-for-byte as delivered by the URLs in `manifest.json`. The NASA dynamic image service delivered resized JPEGs: these are reference copies, **not archival full-resolution originals or calibrated material maps**. No recoloring, AI generation or geometric reconstruction was applied to these files. `acquire.py` records dimensions, byte counts and SHA256; it does not replace existing files. The HTML board uses these local files and works offline.

NASA media terms: https://www.nasa.gov/nasa-brand-center/images-and-media/
Retain the per-image institutional credits. NASA assets are not automatically CC0; inspect third-party credits before redistribution. No NASA endorsement or logo is used. Last Chance's current NASA page has a credit typo (`ASA`); the manifest retains the NASA/JPL-Caltech/Cornell/USGS institutional attribution, explicitly recording that normalization here.

## How to use the references

- PIA05755: Eagle Crater composition and approximate true-color palette, sols 58/60. A stitched panorama with missing black regions and foreground hardware: never use it as seamless terrain texture or unedited sky dome.
- PIA05634: Berry Bowl color, cluster placement and brushed comparison. Sol 48. Preserve the difference between brushing and abrasion.
- PIA18885: Last Chance layering, embedded grains and weathered voids. Sol 39, 3 March 2004; about 5 cm across. Monochrome; do not infer white rock color from its brightness.
- PIA05521: Flatrock/Mojo 2 abrasion geometry and instrument limitation. Sol 44. Color interpretation is not specified on the page; do not use it as palette authority.
- PIA05459: McKittrick geometry, working distance and shallow cut. Its grinding event is sol 30; do not claim the reference acquisition occurred on that same sol unless independently established.
- RAT photograph: hardware organization only. Acquisition date and exact as-flown configuration are not specified on the instrument page. It is a production reference, not proof of every tool dimension or operational pose.

## Search outcome and limits

NASA Science, JPL photojournal and NASA technical-report search supplied the above images and instrument specifications. The existing official MER model is reusable. This search did **not locate a vetted, ready-to-use Eagle outcrop or separately articulated RAT GLB**; this is not a claim that NASA holds no relevant models or data. A search hit labeled Rock Abrasion Tool resolved to a 2001 MER thermal-design slide deck (NTRS 20030000773); it was rejected as an as-flown RAT geometry authority. No unrelated Spirit/Fram/Endurance image is presented as Eagle Crater.

Hero geology and tool detail therefore need documented custom reconstruction or a later verified asset. The approved rover source remains under `assets/vendor/nasa/opportunity`; its source and runtime hashes were independently checked in `outputs/planning/mission-one/asset-audit.json`.
