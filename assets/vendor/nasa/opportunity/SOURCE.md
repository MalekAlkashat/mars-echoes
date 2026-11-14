# Mars Exploration Rover source and runtime conversion

Acquired 14 November 2026. The user supplied `24883_MER_static.usdz` as the Opportunity model and authorized replacing the placeholder and wiring movement to it.

- User download: https://media.milanote.com/p/files/1Xs99B1m0NEufv/btd/24883_MER_static.usdz
- Official source: https://science.nasa.gov/resource/mars-exploration-rovers-3d-model/
- Official matching USDZ: https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/m/MER_static.usdz
- NASA description: a model of the twin Mars Exploration Rovers, Spirit and Opportunity.
- Credit: **NASA Visualization Technology Applications and Development (VTAD)**.
- NASA page publication: 22 April 2019; download listing 9 September 2023.
- Source byte count: 3,154,523.
- Source SHA256: `ce21bd6ed7763e1e5cc893a60b53b99e3c3de77e989b75b0da1a18ad5652bcab`.
- The user-provided file and the official NASA download were compared and have identical hashes. No alternate/newer rover asset was substituted.
- Source archive contains `MER_static.usdc` and 12 JPEG material images. No separate license text is bundled in the archive. This is a NASA media asset, not labeled CC0. Retain NASA/VTAD credit and refer to [NASA image and media guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/) for use. Do not imply NASA endorses this game.

## Conversion

Runtime asset: `game/public/assets/opportunity/opportunity-v1.glb`; exact output SHA256 and wheel metadata are in `inspection.json` and the runtime `rig-metadata.json`.

Local OpenUSD (`usd-core` 26.11, isolated Python 3.11 environment) reads the source USDC. `convert_source.py` is the retained conversion source and runs from the repository root with `usd-core` installed. It gates the original source hash, extracts source materials and textures, and writes a GLB directly. Three r181's USDCParser is an empty stub, so it was not used to parse this binary USD source.

Source is Y-up with 0.01 metres per unit. World transforms are baked, centimetres converted to metres, a Y rotation of pi maps source +Z forward to game -Z, and source minimum ground Y is shifted to zero. Source UV V is inverted for glTF's image convention. All 31,450 triangles and original normals/UVs/material membership are retained; all 12 embedded JPEGs were checked byte-for-byte against the archive. Nine source materials remain. No decimation, new damage, added eyes or invented parts.

Six wheel/tread connected components and their disconnected outer circular axle caps are separated from the material-combined suspension mesh. They are exported at their measured axle centres with the names in `rig-metadata.json` and +X spin axes. Wheel geometry is translated relative to its pivot, without changing its world shape. `suspension-components.json` records the source mesh component bounds and original triangle membership for future joint work. Runtime `suspension-metadata.json` provides the same component analysis in normalized game coordinates and associates each component with the nearest axle geometrically; it does not assert authentic joint membership.

The source model is static. Its mast and arm exist as material-combined meshes (`tex_mast`, `foil_silver`, `tex_arm`) but do not supply authentic skeletal joints. The remaining suspension structure is `suspension-body`; motor/knuckle structures are retained there. Wheel steering/suspension integration in game code should acknowledge this mechanical approximation rather than claim the static source included a full articulated rocker-bogie rig. Browser material, pivot and motion review is owned by the integrator; file validation alone does not establish appearance or animation acceptance.
