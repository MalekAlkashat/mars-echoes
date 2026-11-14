# Mission 1: a polished, historically grounded experience

Reviewed 14 November 2026 against `origin/main` **`0becdac`**. This is the current Mission 1 implementation plan, reconciled with the supplied creative brief. Direction is approved; assets, runtime quality and gameplay acceptance remain to be demonstrated. The original brief is preserved in the user's attachment. Section 6 resolves implementation details and checkpoint ordering below.

**Runtime slice implemented and verified, 14 November:** the source/reference pack and [design review](mission-one/design-review.md) now feed a playable isolated chapter. Normal hub entry, brush/hold-grind/inspection, separate cluster/control comparison, labeled water interpretation, saved continuation and one-time GRIND reward are implemented. Build and 54 checks pass; desktop, production touch, failed-return retry and repeated visits are documented in [runtime review](../review/mission-one-v1/REVIEW.md). Main and ongoing terrain files are unchanged. This is a playable candidate; final cinematic/hero-art quality and owner acceptance remain open.

## 1. Creative direction and scope

Astra should approach this as a senior game designer and technical artist: make coherent decisions about **player experience, composition, assets, materials, animation, camera and feedback** before expanding implementation.

The target is grounded cinematic exploration: recognizable Opportunity, convincing Martian geology, restrained movement and a clear scientific discovery. Every visible element must support that direction.

**Mission first**, as selected. Final spirit design remains deferred; its primitive placeholder is development-only and does not count as presentation-ready art.

**Retain the requested Astra design-review gate before mission coding.** This plan review and repository sync do not themselves establish that gate's acceptance. Build one representative playable sequence to the required standard before expanding the map or content.

## 2. Historical setting, conditions and asset production

Mission 1 is a compact reconstruction of **Eagle Crater in early 2004**, separate from the present-day hub. Its landscape, lighting, scientific targets and rover condition use a dated NASA reference pack.

### Asset sourcing

For each required asset:

1. Search NASA imagery, models and relevant planetary-data holdings.
2. If no suitable runtime asset is available, evaluate closely matching licensed alternatives.
3. If those fail the reference comparison, create a custom reconstruction using authored geometry and procedural/baked materials.

Generated studies can assist production but cannot establish historical accuracy. No paid generation is assumed.

| Asset | Required result |
|---|---|
| **Opportunity** | Preserve the selected NASA model, proportions and material identities. Show believable wheel contact, steering, suspension and braking. |
| **Hero outcrop** | Low, fractured, finely layered rock with embedded spherules, dust-filled seams and a convincing exposed interior. |
| **Ground** | Reference-matched sand, darker granular deposits and exposed bedrock, with coherent physical texture scale. |
| **Blueberries** | Small gray spherules and natural clusters, readable through magnification rather than exaggerated world scale. |
| **Grinding tool** | A detailed, reference-matched close-up asset with plausible contact and orientation. Full rover-arm articulation remains deferred. |
| **Background** | Deliberately composed crater context and horizon, supporting the hero area without unrelated scenery. |
| **Water reconstruction** | A restrained, clearly labeled interpretation of ancient conditions, distinct from observed history. |

Existing lunar-themed textures and Earth scans require individual assessment. A suitable license alone does not make an asset geologically appropriate.

Keep source files, usage terms, credits, dimensions, hashes and transformations. Distinguish NASA originals, derived reconstructions, external analogues and generated reconstructions. Use approximate true-color imagery for palette; identify monochrome and false-color references. [NASA Eagle Crater panorama](https://science.nasa.gov/photojournal/opportunity-captures-lion-king-panorama/)

## 3. Guided discovery with authored presentation

The mission remains a **guided demonstration**, with generous interaction zones and automatic fine alignment.

1. **Arrival and approach:** establish the rover, landscape and destination in one readable composition. Use geological forms and lighting to guide attention.
2. **Positioning:** stop in a generous working area. Smoothly settle the rover and transition to the inspection camera.
3. **Surface preparation:** show brushing removing obscuring dust.
4. **Grinding:** hold E for a three-second, explicitly time-compressed close-up. Show tool contact, shallow abrasion and localized powder.
5. **Instrument limits:** briefly explain the documented difficulty of grinding around hard spherules, without forcing a failure or repair puzzle. [NASA’s Flatrock account](https://www.jpl.nasa.gov/images/pia05521-focus-on-flatrock/)
6. **Cluster analysis:** inspect the exposed textures, then analyze a nearby blueberry cluster and a brushed comparison area.
7. **Ancient-water reconstruction:** show the approximately 12-second interpretation, with Skip and reduced-motion treatment.
8. **Discovery and return:** restore the dry scene, present hematite evidence and GRIND’s connection to Spirit, then return beside Opportunity.

Grinding and Berry Bowl analysis represent separate, compressed observations. Berry Bowl’s comparison surface was brushed without grinding; the grinder must not create blueberries. [NASA’s investigation account](https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/)

The conditions and hardships are conveyed through dusty surfaces, tiny targets, careful instrument placement and limited tool capability. Additional numerical environmental constraints require relevant sources.

### Presentation requirements

- Compose foreground, working area and background deliberately; procedural scatter follows geological placement rules.
- Keep the rover recognizable at the normal gameplay camera distance.
- Author chase, inspection and discovery shots with clear transitions and restored control.
- Make tool, wheel and dust motion follow actual contact and activity.
- Give rock, dust, metal, foil and glass distinct material responses.
- Keep UI brief, consistent and readable, with contextual prompts and restrained scientific overlays.
- Use lighting and atmosphere that preserve material detail and match the historical reference direction.

## 4. Wear and tear across the story

Separate **dust coverage**, **physical wear** and **documented mechanical limitations**.

Use dated evidence where available. Otherwise use three clearly identified reconstruction profiles:

| Profile | Application |
|---|---|
| **Early mission** | Mission 1: intact machinery, restrained environmental dust and limited visible use. |
| **Field-used** | Mission 2: reference-informed dust distribution and operational age. |
| **Long-serving** | Mission 3: late-mission condition and storm effects, with supported operational limitations. |

Dust is not a simple measure of age: wind sometimes cleaned Opportunity’s panels. Configure it independently from permanent wear. [NASA’s cleaning comparison](https://science.nasa.gov/resource/cleaned-solar-arrays-gleam-in-mars-rovers-new-selfie/)

Preserve original assets and use versioned masks with scene-owned materials. Add restrained temporary dust from movement and tool use. Replaying a chapter restores its historical baseline; entering an earlier memory must not clean or repair the present-day rover.

Prepare the three profiles, but implement only Mission 1 gameplay now. Changes to driving or instrument capability require dated evidence.

## 5. Implementation checkpoints and acceptance

### A. Visual target and asset proof

Create a reference board, asset assessment and representative scene using the actual runtime rover, ground, outcrop and tool.

Capture:

- Normal driving view.
- Rover beside the hero outcrop.
- Surface preparation and grinding close-up.
- Magnified blueberry cluster.
- Ancient-water transition.

Assess historical fit, geological form, scale, material response, composition and animation. A concept image or isolated beauty render does not satisfy this checkpoint.

### B. Shared foundation

Use an isolated worktree and preserve ongoing terrain work. Reuse the renderer, input service, rover and scene lifecycle.

Add chapter-owned map configuration, shared bounds, held-interaction input and a direct Mission 1 preview. Keep chapter completion and rewards separate from completion of Opportunity’s entire story.

### C. One polished playable sequence

Complete approach → preparation → grinding → analysis with the intended assets, camera transitions and feedback. Review normal-speed gameplay before expanding the environment.

If production cost exceeds the budget, reduce map extent and decorative variety before reducing hero-asset quality.

### D. Complete the loop

Add reconstruction, wear profile, reward, return and restart behavior. Reconcile the terrain task’s committed work before integration.

### E. Final checks

Require both technical and visual acceptance:

- Source-backed assets and explicit reconstruction labels.
- No visible placeholder hero geometry.
- Stable ground contact, believable tool contact and coherent motion.
- Correct texture channels, scale, filtering and material isolation.
- Readable UI and reliable control handoffs.
- Interrupted interaction, pause, skip, restart and failed-return recovery.
- Rewards recorded once after successful return.
- Existing tests/build and preserved drive/repair previews.
- Ten entry/return cycles with cleanup checks.
- Normal-speed captures and measured performance on the target machine.

Start with 2K inspected hero textures and 1K background textures; adjust from rendered evidence. The milestone is complete only when the full playable sequence meets the visual standard—not merely when it compiles.

## 6. Production review and integration decisions

### Baseline and impact of the pull

`0becdac` merges `f200ba0`: an asset-only Focus UI library under `assets/ui/focus-kit/v1/`. No runtime, terrain, dependency or shared-contract changes were introduced by this pull. The terrain baseline `a38322f` remains intact. Both main and the isolated mission worktree were fast-forwarded; ten pre-existing local files in main retained identical SHA256 hashes.

The library supplies UI candidates, not implemented mission features or scientific assets. It does not resolve the hero outcrop, RAT, rock interior, ancient-water environment or character quality requirements. Do not replace the NASA rover, adopt its static unrigged mannequins as the spirit, or introduce human reconstructions into Opportunity's history.

Use a small selection: target brackets, contextual hold progress, an analysis card, evidence-complete feedback and reconstruction skip/status. Assess these against actual Mars lighting and the existing menu typography before accepting them. Avoid a permanent blue veil, dense screen grid or repeated scan effects that obscure rock detail. The kit is a visual vocabulary, not a new game direction.

- Prefer outlined SVG for static decorative shapes; render scientific text, key bindings and progress as live UI. Remove sample measurements, confidence percentages, forensic labels and other baked example content. Show interaction progress without implying a measured scientific confidence score.
- Copy only chosen runtime derivatives into a versioned `game/public/assets/ui/` directory, retaining source/catalog links and hashes. Catalog paths are not browser URLs. Choose one animation format, lazy-load where practical, and use static reduced-motion alternatives.
- Use semantic controls, keyboard and touch operation, visible focus, scalable text and adequate contrast. Decorative images must not intercept input. Hold progress cancels safely on release, blur, pause or scene exit; resume requires a fresh deliberate action.
- Supplier declarations identify graphics/audio/models as CC0 and fonts as OFL; retain both records and identify supplier provenance accurately. Sound is unauditioned. Audition before use; respect existing mute/volume settings and user-gesture playback. Do not treat synthesized tool sound as an authentic recording or imply sound propagates to an external camera as on Earth.

### Existing foundation that must be extended

Menus, settings, photography and browser-local saves already exist. Reuse them. `app/contracts.ts` currently distinguishes only Opportunity driving and repair checkpoints. `app/save.ts` validates v2 saves, migrates v1 and retains a backup. `GameSession.completed` records wreck IDs, not chapters or GRIND. `SceneDirector` records results only after successful hub return. A plain `completed` result for Mission 1 would incorrectly imply the existing wreck-level completion meaning.

Before gameplay expansion, the integrator must agree and implement chapter identity, typed chapter checkpoints/results and separate chapter completion/unlock state. Preserve old drive/repair routes and saves; do not reinterpret legacy prototype completion as completion of all historical chapters. Extend validation, serialization and restoration together, including per-map bounds rather than relying on the current fixed 64 m checkpoint validation. Test migration, invalid saves, backup fallback and storage failure. No second save service or duplicated input loop.

Commit Mission 1 completion and GRIND once, after a successful return. Aborts, failed transitions and replay must not grant duplicates. Persist the reward and completion coherently; if storage fails, preserve the in-session result and show the existing save failure feedback without falsely promising durable progress. Keep enough validated state to retry a failed return. Checkpoints belong at stable phase boundaries: never resume with an intersecting tool, moving rover or half-restored reconstruction. Exact schema/API is a foundation deliverable, not an already implemented contract.

### Historical and visual quality gates

Keep a claim-to-source register with capture date/sol where available, image ID, color interpretation, actual observation and the gameplay simplification. In particular: Eagle Crater is the setting; grinding and Berry Bowl analysis are distinct observations; the cluster comparison supports a mineral interpretation; water is inferred ancient history. The game must never portray grinding as creating spherules, analyzing one tiny bead as a full instrument result, or the water sequence as footage of an observed event. Define a reference-backed abrasion diameter/depth and spherule scale before modeling.

For each hero asset, record: NASA search outcome; chosen source or reconstruction method; scale and palette comparison; license/provenance; needed corrections; runtime status; acceptance evidence. An unavailable ready-to-use NASA asset permits a sourced reconstruction, not an unsupported claim that NASA has no relevant data. Earth/lunar analogues pass only after geological, color and scale review. Preserve original materials and clone all mutable scene-owned materials/masks.

The quality review uses these concrete rejection criteria:

| Area | Required evidence / reject when |
|---|---|
| Landscape | Reference comparison plus gameplay view: low laminated fractured slabs and coherent grain scale. Reject rounded generic boulders standing in for the hero outcrop, visible texture repetition or unrelated Earth surface features. |
| Rover | Normal-speed drive/stop over the working route. Reject floating wheels, obvious sliding, abrupt chassis changes or impossible tool deployment. |
| Tool shot | Approach/contact/withdrawal readable in motion; shallow abrasion and localized dust. Reject cuts that conceal contradictory arm placement or a tool clipping through rock. Full arm rig remains deferred; use an explicitly compressed close-up without pretending the static arm articulates. |
| Discovery | Magnified cluster and comparison surface readable before UI. Reject oversized world-space berries, uniform bead scatter, magical mineral detection or grinding-generated spheres. |
| Materials | Inspect sand, rock, powder, metal, foil and glass at gameplay and macro distance. Reject plastic rock, metallic dust, wrong normal orientation, stretched UVs or loss of detail under lighting. |
| Camera/UI | Approach target visible, transitions preserve orientation, control restoration is clear. Reject camera penetration, unreadable labels, missing touch equivalents or effects that mask geology. |
| Reconstruction | Explicit interpretation label, intentional transition and reliable dry-state restoration. Skip/reduced motion convey the same scientific point without required camera travel. |

Track each as pass / revise / not tested with captures; do not average a failed hero asset into a passing score. Owner aesthetic acceptance remains separate from technical checks. Spirit art stays deferred and must not be described as final-quality presentation.

### Execution order and deliverables

1. **Reference and art target:** dated reference board, claim register, asset assessment and shot/blocking sheet for arrival, work area, RAT, cluster and water interpretation. Resolve geological scale, tool placement and early-2004 condition. Exit: every hero asset has a credible production route and every scientific beat has evidence or a reconstruction label. No new gameplay is claimed at this step.
2. **Representative runtime proof:** render the NASA rover, one hero outcrop, ground and close-up tool/cluster in the existing scene lifecycle on port 5182. Use only the minimum preview wiring required; first capture dry views and tool-contact motion. Prototype the water transition after those pass. This separates the dry asset proof from the later complete interactive sequence, avoiding a requirement to finish the whole mission before foundation work. Record material/texture/geometry budgets from the actual view.
3. **Shared foundation:** implement the agreed chapter host, mission-owned layout/bounds, held input, preview route, checkpoint/save migration and chapter/reward distinction. Preserve one renderer, one loop and one input service. Exit: preview entry, abort, pause, checkpoint reload and hub return work without changing the drive/repair previews or hub terrain.
4. **Polished guided sequence:** approach, settle, brush, hold-to-grind, inspect and cluster comparison. Define phase entry/exit, allowed inputs, camera ownership and cancellation behavior in a small explicit state table. Movement is disabled during tool contact, restored predictably afterward; generous placement assistance replaces precision punishment. Review normal-speed play before expanding dressing.
5. **Complete discovery loop:** labeled water interpretation, skip/reduced motion, dry-state restoration, evidence summary, Spirit/GRIND connection and exactly-once reward on successful return. Add Mission 1 wear/dust; define but do not implement later chapter gameplay. Replay resets historical/local transient state without mutating the hub rover.
6. **Acceptance and integration:** tests/build, production browser playthrough, ten entry/return cycles, save/reload and fault recovery, keyboard/touch, settings, captures and performance comparison. Reconcile latest main before integration. Do not publish an unreviewed full-mission claim or deploy automatically.

Measure on the same machine, viewport, DPR and graphics settings: frame-time median/P95, long frames, draw calls, triangles and post-return resource counts after warm-up. Establish the baseline before tuning; investigate repeatable >5% regression and visible stutter. A capped 45 FPS result alone does not prove GPU headroom. Require stable resource counts across repeated visits, no new console errors or failed asset requests. Record the actual test environment; device-wide acceptance remains unproven until measured.

### Scope, ownership and readiness

Worktree: `C:/Nasa 2026/mars-echoes/work/mission-one`, branch `codex/mission-one`, base `0becdac`. Proposed chapter-owned source: `game/src/scenes/episodes/rover/missions/blueberry-clue/`; versioned Mission 1 assets and reference/review records. Shared `app/`, `core/`, rover, environment interfaces and registry changes remain integrator-owned and must be coordinated before editing. Do not alter hub defaults to get the historical scene's appearance. Reserve preview port 5182; a running preview is not asserted by this plan.

Mandatory: hero quality, scientific distinctions, guided core loop, reconstruction, wear isolation, return/reward/save correctness and the above acceptance checks. Deferred: final spirit, full arm articulation, larger map, extra decorative variety and later chapter mechanics. If time is tight, reduce traversable extent and background variants first. A credible close-up tool asset and hero geology remain required; primitive replacements do not satisfy the milestone.

Readiness at this review: repository synchronized and plan revised; Mission 1 remains unimplemented. Step 1 reference/asset deliverables and runtime visual acceptance are still outstanding. No budget, delivery date or final performance capability is invented. The next work is the reference and art-target package, followed by the explicit design gate and representative runtime proof.
