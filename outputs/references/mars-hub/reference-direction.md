# Mars hub reference direction

14 November 2026. User authorized Mars-reference-based terrain redesign, retaining the general start-to-Opportunity structure, removing the decorative rover graveyard, and emphasizing engaging movement, apparent scale and laptop rendering cost. This is an authored Mars-informed landscape, not a surveyed site reconstruction. The science references guide landforms; the selected orange ground, distant pale light and heavy cold sky remain the cinematic art direction.

## Reference selection

- NASA/JPL [PIA22909: Opportunity Legacy Panorama, true color](https://www.jpl.nasa.gov/images/pia22909-opportunity-legacy-pan-true-color/): primary palette/ground authority; shallow troughs, exposed rock and a distant Endeavour rim. [NASA-hosted JPG](https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA22909.jpg).
- NASA/JPL [PIA21724: down Perseverance Valley](https://www.jpl.nasa.gov/images/pia21724-view-down-perseverance-valley-after-entry-at-top/): slope-to-valley depth and a broad horizon; grayscale is morphology, not palette.
- NASA/JPL [PIA21495: rim and plain at the valley head](https://www.jpl.nasa.gov/images/pia21495-crater-rim-and-plain-at-head-of-perseverance-valley-mars/): an offset notch opening toward a broad interior and distant rim.
- NASA [PIA11048: Cape Verde layered textures at dusk](https://science.nasa.gov/photojournal/dusk-lighting-of-layered-textures-in-cape-verde/): secondary low layered shelf reference; not a reason to turn the hub into a giant canyon. This is Victoria Crater, not Perseverance Valley.
- NASA [PIA03270: rim of Erebus](https://science.nasa.gov/resource/on-the-rim-of-erebus/): sand/bedrock balance, with broad unbroken intervals between outcrops.
- NASA [PIA08424: rolling ripple](https://science.nasa.gov/photojournal/rolling-ripple/): banded sand ripples and shallow swales; grayscale morphology reference.

Research agent read the official source pages. PIA21723 is enhanced color and is not the palette authority. References are links; no NASA image is silently imported into the game. Existing Poly Haven CC0 PBR maps remain runtime surface assets.

## Applied design brief

Keep the existing hub ID, movement abilities, return bookmark and single enterable wreck ID. Retain spawn (0,8), move Opportunity from (0,1) to (0,-25), and keep its stable ID. The 33 m approach crosses a low saddle before descending into the basin; the deliberate placement change makes discovery a traversal rather than an immediate interaction. Open the former symmetrical corridor into a broad descending crater shoulder, with asymmetric shelves, low traversable rises and side loops. Main playable ground stays inside the controller's existing radius 63.5 m. Distant terrain extends to roughly 1 km from the origin; it has no gameplay/collision and uses coarse geometry/simple shading. This scale is an authored effect, not an actual NASA site dimension.

Use one mesh-consistent height sampler, fine near grid, coarse stitched outer ring, repeated low-detail instanced rocks, a few layered rock shelves and an atmosphere-separated rim. Remove all decorative rover copies from the hub; retain one registered rover as the memory entrance. The fictional repair episode is separately preserved and is not historical Opportunity content.

Before/after native review and performance limits are recorded under `outputs/review/mars-hub-v1/`. User acceptance and measured battery/temperature improvement remain unclaimed.
