# Mission 2 resources: Stuck in Purgatory

Acquired and reviewed 14 November 2026. Open [the offline visual catalog](index.html) to browse the pack. The manifest records each original's URL, credit, capture context, dimensions, byte count and SHA256. Originals remain unchanged; downsampled static previews are identified separately.

## Start here

| Need | Local resource | Use |
| --- | --- | --- |
| Setting, palette, horizon and 2005 dust condition | [PIA07216 full panorama](images/PIA07216-rub-al-khali.jpg) | Approximate true-color, 22,780 × 6,000; primary visual authority. Use its static preview for browsing. |
| Trap shape and ruts | [PIA07999](images/PIA07999-looking-back.jpg) | View after escape; grayscale geometry reference. |
| Overhead placement | [PIA07922 mosaic](images/PIA07922-overhead-mosaic.jpg) | Plan-view ripple layout and rover orientation. |
| Relative elevation | [PIA07922 Figure 1](images/PIA07922-relative-heights-figure1.jpg) | Height-coded analytical figure, not ground color or a numeric DEM. |
| Wheel burial and cleat detail | [Left front](images/PIA07983-left-front-wheel.jpg), [right front](images/PIA07984-right-front-wheel.jpg), [right rear](images/PIA07985-right-rear-wheel.jpg), [left rear](images/PIA07986-left-rear-wheel.jpg) | Four complementary grayscale contact views. These original stills are only 256 × 256; upscaling does not add detail. |
| Recovery motion | [PIA07983 time-lapse](motion/PIA07983-left-front-wheel.gif) | 77 decoded frames. Deliberately open to animate; no autoplay in catalog. Not real-time footage. |
| Ground-team testing | [PIA07895](images/PIA07895-earth-recovery-tests.jpg) | Earth laboratory test rover and simulated sand; useful for a planning/interlude reference. |
| Surface audition | [Dense Sand 2K maps](material-candidates/dense-sand/) | CC0 Earth scan: diffuse, OpenGL normal, roughness, AO. Candidate for churned-sand detail; requires in-engine acceptance. |
| Historical captions | [sources/](sources/) and [recovery notes](sources/recovery-notes.md) | Local NASA caption text, usage guidance, material metadata and primary-source recovery/engineering links. |

## Production use

Build a compact reference-based reconstruction of the low ripple field. Purgatory's trap was roughly 0.33 m high and 2.5 m wide; adjacent ripples shown in the panorama are often only 0.10–0.15 m high. Preserve a low horizon, irregular crests, dark granular undisturbed ground and brighter disturbed material. The hero features are wheel burial, compressed/churned sand, deep ruts and tiny progress despite wheel rotation. Use the originals to decide the form; avoid turning this into a large mountainous dune field.

The sand texture's nominal patch is 1.8 × 1.8 m (supplier dimensions rounded from 1800 mm). Use diffuse as sRGB and normal/roughness/AO as linear data. The normal is OpenGL convention; the sand is nonmetallic. AO is a material map, not a substitute for correct wheel/ground contact shadows. Its clumps and pits may be too crusted or coarse for the close-up, and its color needs comparison with the panorama. No displacement map was selected: form the ripple and ruts with controlled geometry/masks, then audition microdetail. Do not infer soil traction or sinkage from a texture or roughness map.

The supplier also tags this scan as compacted/trampled sand with footprints. Do not accept a full unedited tile if human-shaped marks read in the shot. Audition only clean detail patches or a repaired derivative; use a custom material if those cannot meet the NASA comparison. The downloaded candidate is useful authoring input, not a final surface selection.

Reuse the existing selected NASA MER model, measured wheel pivots, rover controls/camera and provenance. [reuse.json](reuse.json) lists local paths and hashes for the retained assets; no alternate rover was downloaded. The current suspension/contact system is an approximation and will need mission-local support for visible sinkage and slip. Existing `sandy_gravel_02` can be auditioned for firmer granular areas. Hub lunar textures and Earth boulder scans do not establish Purgatory's surface or layout.

## What still needs creation

- Authored ripple geometry, a credible soft-sand working area and firmer escape area, with matching visible/contact surfaces.
- Local rut/deformation shapes, displaced powder, sand packed into wheel cleats, and scene-owned material masks that reset on replay.
- Mission-specific slip/sinkage presentation and carefully composed wheel shots; shared rover changes require integrator coordination.
- A clearly labeled compressed recovery interaction and Earth-team/time-jump presentation. This pack does not choose the final command puzzle or controls.
- Appropriate subtle sound/feedback if selected; no authentic external wheel-on-Mars recording is supplied.

No suitable ready-made NASA Purgatory game mesh, PBR set or exact site DTM was established in this search. The acquired observations support a custom reconstruction. Runtime copying, visual acceptance, gameplay, physics and final chapter integration remain future work.

## Verify or reproduce

From this folder, with Python 3.12+ and Pillow available:

```powershell
python acquire.py --validate
python acquire.py --download --validate
python build_board.py
```

Downloads require network access. The acquisition script uses fixed manifest destinations within this pack, a source-host allowlist and a 30 MB per-file cap, rejects image-as-HTML responses, and refuses changed existing original hashes. It preserves completed receipts if one download fails. The panorama is intentionally large; use previews for UI and do not ship the full pack to the browser by default. The catalog uses static posters and no remote scripts, fonts or styles.
