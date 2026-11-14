# Rover and opening scene asset brief

Prepare a small, consistent asset set for a grounded cinematic Three.js opening. Concepts establish design; actual model files, materials, pivots and terrain establish usable game assets. Keep those statuses separate.

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

The current rover is an editable procedural Three.js asset in `game/src/rover.ts` with finishes in `roverMaterials.ts`. It refines the pale damaged six-wheel silhouette, enlarged twin optics, exposed mechanisms and mechanical arm while retaining the approved reference as the authority. It is a technical model awaiting user visual acceptance, not an exact or approved reconstruction of that reference. The first blockout's enhanced Kenney rover has been superseded in the current presentation; NASA's rover remains unused.

The environment now has a high-resolution authored contact terrain, mild traversable ridges, more distant valley geometry and reusable deformed/fractured rock shapes. Rock placements sample their terrain footprints and use partial burial. Near and distant wrecks share the refined rover construction and are batched as static inactive geometry. The donor keeps its editable hierarchy for the recoverable optic. Local Kenney hardware remains placeholder scenery, with a smaller partly buried service frame rather than a large architectural focal point.

Poly Haven CC0 `sandy_gravel_02` and `dry_riverbed_rock` supply 1K color, OpenGL normal, roughness and AO maps. Original downloads, exact source URLs and hashes are retained in `assets/vendor/polyhaven/`; runtime copies are under `game/public/assets/surfaces/`. Color maps use sRGB; normal, roughness and AO maps use linear data. Triplanar mapping and material tinting preserve the selected orange terrain while retaining scanned surface detail. The runtime waits for the eight maps to load and uses no generation API.

The visible procedural gray sky also supplies the filtered environment used by metal and glass. Sun, sky, fog and follow shadows share one scene setup. Six terrain contacts, bounded spring visual suspension, chassis settling, weighted camera movement, wheel dust and tracks are implemented around the same ground surface. These are geometric contact and visual response systems, not full vehicle dynamics. The rebuilt arm/optic puzzle passes the final production desktop loop, including recovery, alignment retry, installation, calibration and the unanswered relay call; replay, pause/resume/restart, focus handling and optical views through F/button also pass. All six mobile touch buttons and module pointer dragging pass, with empty browser error logs.

TypeScript, production build and targeted motion checks pass; current evidence is under `outputs/review/visual-pass-v2/`. Final user visual/gameplay acceptance is pending. Integrated sound, later mission/story content, final models and target-hardware performance acceptance remain open.
