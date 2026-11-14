# Rover and opening scene asset brief

## Steady title music and immediate click, 14 November 2026

The supplied `Music intro.wav` is preserved under `assets/audio/menu-music-v1/`; a levelled, stretched middle-section loop is exported under the corresponding runtime folder. `scripts/prepare-menu-audio.py` reproduces it and the shorter first-transient click under `game/public/assets/audio/ui-v2/`. Original click/runtime v1 are retained. Processing, measured envelope and hashes are documented beside the music. Latest sky references guide a procedural dusty ochre atmosphere; they are not imported sky textures. Full native evidence lives in `outputs/review/map-boost-music-sky/`.

## Menu click, 14 November 2026

The user supplied `clicking.wav` for menu activation. The unchanged original is retained in `assets/audio/ui-v1/` and the byte-identical runtime copy is under `game/public/assets/audio/ui-v1/`. It is a 0.465-second stereo PCM WAV; hash/source metadata is in `assets/audio/ui-v1/SOURCE.md`. The shared menu audio service applies Master, Effects and Mute preferences. No music or external sound was added.

## Supplied Mars rock kit, 14 November 2026

The user requested replacing visible Earth-derived rocks with the supplied `assets/mars-rocks.zip` pack. Four of its 15 FBX meshes are now converted into the versioned runtime `game/public/assets/rocks/user-mars-v1/` kit, preserving source UVs and color/DirectX-normal maps. The normal Y sign is corrected at runtime. Authored sizes, hashes, extracted originals and conversion instructions are in `assets/vendor/user-mars-rocks/SOURCE.md`, `conversion.json` and `manifest.json`. The original ZIP remains unchanged. These user-supplied assets have no license/attribution document in their archive; provenance is recorded without inventing NASA/CC0 attribution. The other supplied `mars.zip` is retained and unused.

The terrain direction favors broken hardpan, shallow local relief, broad dust patches and varied angular rocks, following the user's references. The followup adds dense, uneven gravel deposits, small soil relief and a mixture of roughly half-metre stones and occasional two-metre boulders. Gravel chips are simplified from support points of the supplied fragment mesh and retain its UV samples; they do not introduce a new downloaded rock asset. Filtered procedural aggregate fills the finer scale. Existing broad hills, navigable approach and authored landmark coordinates remain. Near/far shading and finer outer terrain rings address visible distant panels. The reference images are not game textures and have not been downloaded from their stock-photo sources. The renderer's sky/lighting direction is unchanged.

## Main menu reference

The menu displays the landscape region of the user's supplied 505×445 concept screenshot, preserved unchanged in `assets/ui/main-menu-reference.png`, with an identical runtime copy under `game/public/assets/ui/`. See `assets/ui/SOURCE.md` for provenance and hash. This is a user-supplied preview background, not an approved higher-resolution export or a NASA photograph. The fixed menu and tabbed settings retain the Mars amber/brown palette; subsequent Ghost of Tsushima and Cyberpunk screenshots are layout references only.

## Current Opportunity model integration

The user selected `24883_MER_static.usdz` as Opportunity’s model. It is now converted locally to `game/public/assets/opportunity/opportunity-v1.glb` and replaces the visible hub and default playable rover. Six measured wheel pivots, steering/spin, model-specific terrain contact, bounded suspension approximation, camera and wheel effects are wired to it. Final arm/mast articulation remains unimplemented; the source is static. The normal rover episode is now a drive preview; the old fictional repair sequence is retained at `?scene=episode-rover-01&prototype=repair`. Build and all 33 automated checks pass, with native production/development motion review recorded in `outputs/review/opportunity-v1/REVIEW.md`. Historical missions and owner visual acceptance remain outstanding.

## Latest asset priority

Final spirit art is deferred while the design team prepares it; use the existing placeholder to build and test the required base exploration map. Prioritize shared Mars terrain, hub landmarks and Opportunity’s discovery site, coherent hill/rock/surface scale, a usable rover and chapter-specific scientific props. See `mission-foundation.md`. Preserve accepted references; Opportunity’s model treatment remains a design decision. The old fictional graveyard and optical module are prototype assets, not required historical mission dressing.

The first Mars-reference hub redesign is now implemented and agent-checked. It removes all decorative rover copies, uses shallow troughs, low shelves and a distant crater vista, and places the single memory entrance at `(0,-25)` from spawn `(0,8)`. Shared presentation now has a balanced pixel/frame budget and stops composing paused views. Build and all 26 automated checks pass; native development-browser traversal, entry/return and repeated abort checks pass. See `outputs/review/mars-hub-v1/REVIEW.md` and `outputs/references/mars-hub/reference-direction.md`. This is not user visual acceptance, a final Opportunity asset, a thermal measurement or the completed mission-host foundation.

Prepare a small, consistent asset set for a grounded cinematic Three.js opening. Concepts establish design; actual model files, materials, pivots and terrain establish usable game assets. Keep those statuses separate.

## Revised protagonist and asset scope, 14 November 2026

The new protagonist is a spirit that explores Mars, enters a wreck and replays its past mission. Root `ROADMAP.md` records the new scope. The spirit currently suggests a ghostly humanoid silhouette, explicitly tentative. A simple procedural humanoid placeholder now exists in `game/src/entities/spirit/appearance.ts`; movement and camera are separate modules in that directory. This is not an approved final spirit model, rig or palette, and no final character-generation job has been submitted. Movement is glide and leap with solid obstacles, not phasing or unrestricted flight.

The first equipment memory follows the real Opportunity rover through the rock discovery, Purgatory Dune and the final dust storm; see `opportunity-story.md`. Identify historically grounded props for those chapters. The expressive fictional rover's selected design and pale damage references remain preserved, while how to represent real Opportunity needs an explicit visual decision; do not label the existing model accurate or silently replace the accepted reference. Present-day wreck art and past-mission damage/functional states must be separately configurable; the previous stage-two opening does not force the memory to begin in the same condition. The user removed the decorative hub rover graveyard; only the registered memory rover remains.

The runtime module organization in `architecture.md` is now implemented, including `entities/`, `environments/mars/`, the isolated rover episode and placeholder hub. The proposed versioned asset-export directories are still future work; current `game/public/assets/kenney` and `surfaces` URLs remain unchanged. New exports should use stable IDs/versions, scale/orientation, node names and pivots, source/license/prompt and hashes. The current integration remains silent and uses the preserved fictional repair/relay sequence as placeholder episode material; the complete past mission and shutdown are not implemented.

## Rover reference preparation

Create one clearly labeled design candidate at a time. The initial study uses a neutral gray background, soft readable lighting, an unobstructed silhouette and enough space around the machine to inspect it. Dramatic lighting belongs in the scene study, not the primary modeling reference. Gray is a practical choice, not a technical requirement; contrast and visibility matter.

Wheel count, chassis proportions, optics or face-like features, mast position, arm arrangement and distinctive markings are candidate design decisions until selected. Keep the mechanism believable and the geometry manageable. Avoid human facial detail and decorative parts that obscure mechanical construction.

The selected concept is now a six-wheel rover with a cream chassis and enlarged twin optical eyes. The side reference must keep the camera housing facing rover-forward; do not rotate its optical front toward the viewer or paint eyes onto its side. The deterioration revisions use a paler, faded finish and greater body damage: chipped/dented surfaces, then torn panels and exposed mechanisms, then major panel loss and a collapsed wheel assembly. These are visual proposals; specific gameplay failures are not yet selected.

After selection, preserve the master image unchanged. Produce only useful additional views, using it as the reference: a front view, a side view and a rear view where they resolve hidden geometry. A three-quarter concept helps communicate shape. Check that each view depicts the same machine; generated multiviews can contradict each other and are not calibrated engineering drawings. Export individual images if the chosen modeling service expects separate inputs.

Use reference-guided edits for changes. Preserve the camera housing, lens arrangement, proportions and component placement unless the requested change explicitly alters them. Once a dependable 3D model exists, render additional angles from that model wherever practical instead of independently regenerating its appearance.

References remain useful after modeling: compare geometry and textures, evaluate damage states, communicate repairs and guide future revisions. They need not ship with the runtime. Multiple images do not automatically create a better mesh; compatibility with the chosen tool and cross-view consistency matter.

## Minimum asset set

| Asset ID | Required contents | Acceptance |
| --- | --- | --- |
| rover-main | Chassis and the chosen movable parts; distinct faded paint, exposed metal, rubber, dust and optical finishes | Separate transforms for moving parts, useful pivots, coherent dimensions, source preserved. |
| ground-opening | Compact traversable ground | Surface height and collision agree; space exists for the chosen camera and opening action. |
| rubble-kit | A few reusable stones or debris pieces | Readable scale, reusable materials, simple collision proxies and sufficient route clearance. |
| wreck-kit | Repeated broken-machine silhouettes derived from shared chassis, wheel, mast and panel parts | Clearly inactive; varied pose, partial burial and missing components; preserve the main route and camera clearance. |
| donor-optic | Removable replacement optical module from a discarded rover | Matches the protagonist's optical socket, readable connector/orientation, independent transform for the alignment puzzle. |
| donor-rover | A nearby completely inactive wreck based on the shared rover construction, with an accessible optical housing | Clear extraction position, no intersection with the protagonist or arm path, no active donor lights or behavior. |

Fog, lighting, dust and camera framing are scene systems. A generated environment illustration supplies visual direction; it does not supply terrain geometry, placements, collisions or a playable route. Build the map from a deliberate layout and usable pieces.

The user selected A's orange terrain and distant pale light with B's heavier gray sky, and a graveyard of discarded machines. The first layout proposal is a wake pocket, a short recovery lane and a basin shoulder. Reuse wreck geometry and make distant machines simple silhouettes to establish scale without authoring many unique robots.

The gameplay camera is third person with brief optical-feed views for scanning and repair. The selected first interaction salvages an optic from another rover and uses a small component-positioning puzzle. Model the optic as a replaceable cartridge with a clear keyed connection. Verify arm reach and a plausible mast service pose before committing geometry. An external close-up may be needed for socket alignment; the rover's active eye cannot directly see its own optical socket. Keep any such camera arrangement a proposal until reviewed.

## Modeling route

After selecting a rover design, choose among an existing suitable asset, an image-to-3D service, Blender modeling or procedural Three.js reconstruction. Prioritize editable parts and repeatable integration. Do not assume that a mesh generator separates wheels or provides correct pivots. A mechanical rover may use hierarchical rigid-part animation without a humanoid skeleton.

Prefer GLB for exchanged game models, while preserving editable source files. For a procedural model, preserve the source and parameters. Confirm scale, axes, UVs where needed, texture links, material appearance and collision proxies in Three.js. Set numerical budgets after the target camera and hardware are known.

## Provenance and review

Record stable asset ID, version, status, prompt, provider or source URL, source image, applicable license and file hashes. Keep candidate, accepted-reference, model-in-progress and accepted-model statuses distinct. Inspect exports rather than relying on generation success messages. Never overwrite an accepted reference or model with a new experiment.

## Implemented v2 asset and scene pass

The current rover is an editable procedural Three.js asset now organized in `game/src/entities/rover/model.ts` with finishes in `materials.ts`. It refines the pale damaged six-wheel silhouette, enlarged twin optics, exposed mechanisms and mechanical arm while retaining the approved reference as the authority. It is a technical model awaiting user visual acceptance, not an exact or approved reconstruction of that reference. The first blockout's enhanced Kenney rover has been superseded in the current presentation; NASA's rover remains unused.

The environment now has a high-resolution authored contact terrain, mild traversable ridges, more distant valley geometry and reusable deformed/fractured rock shapes. Rock placements sample their terrain footprints and use partial burial. Near and distant wrecks share the refined rover construction and are batched as static inactive geometry. The donor keeps its editable hierarchy for the recoverable optic. Local Kenney hardware remains placeholder scenery, with a smaller partly buried service frame rather than a large architectural focal point.

Poly Haven CC0 `sandy_gravel_02` and `dry_riverbed_rock` supply 1K color, OpenGL normal, roughness and AO maps. Original downloads, exact source URLs and hashes are retained in `assets/vendor/polyhaven/`; runtime copies are under `game/public/assets/surfaces/`. Color maps use sRGB; normal, roughness and AO maps use linear data. Triplanar mapping and material tinting preserve the selected orange terrain while retaining scanned surface detail. The runtime waits for the eight maps to load and uses no generation API.

The visible procedural gray sky also supplies the filtered environment used by metal and glass. Sun, sky, fog and follow shadows share one scene setup under `game/src/environments/mars/`. Six terrain contacts, bounded spring visual suspension, chassis settling, weighted camera movement, wheel dust and tracks remain in the reusable rover modules. These are geometric contact and visual response systems, not full vehicle dynamics. Earlier v2 production review remains historical evidence. The refactor's native development-browser review now separately passes recovery, alignment retry, installation, calibration, the unanswered relay call and return to Mars. Mobile, production-browser and fault UI checks are tracked separately rather than inferred from old evidence.

The production build and 23 director/lifecycle, rover and spirit checks pass. Ten additional actual aborted visits after one prototype completion return to 134 geometries and 34 textures every time, with the same hub position and no browser errors. Those counts support stable returned scene resources in that run; they do not certify memory size or all devices. Final user acceptance, integrated sound, later mission/story content, final models and target-hardware performance acceptance remain open. Scene-owned asset cleanup and shared cache ownership are explicit so contributors can replace assets without giving each episode its own renderer or global listeners.
