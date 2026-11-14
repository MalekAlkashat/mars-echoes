# Rover visual and gameplay plan

Project Endurance combines convincing surfaces and light with visible consequences of driving. The user authorized a substantial visual/gameplay rebuild after finding the first rover blockout too basic, with interface work explicitly secondary. The v2 pass described below is now implemented; its final appearance and gameplay still await user acceptance. The approved pale damaged rover and orange graveyard remain the visual target.

## What the reference achieves

The live game keeps a detailed car readable against the track while its camera, surface reflections and motion effects communicate movement. Warm sunlight, cool shadows and distance haze separate foreground, middle distance and horizon. Small material details coexist with large, clear shapes.

The deployed client confirms authored GLB rigs, separate wheel transforms, Rapier vehicle forces and wheel contacts, contact-driven tire effects, a damped chase camera, and speed-dependent effects. Exact code locations and source hashes are in the companion technical inspection and manifest.

The author confirms that Endurance inherited its rain and wet-road systems from Threejs-Punk. Its atmosphere presets coordinate sun, sky, fog, exposure and surface response. The public wet-ground explanation describes a reflected-camera render and ripple normals; it does not require ray tracing. [Endurance development account](https://andersonmancini.dev/blog/endurance-racing), [wet-ground explanation](https://andersonmancini.dev/blog/wet-ground-without-ssr).

## Translate the principles to this game

| Priority | Implemented v2 behavior | Visible completion check |
| --- | --- | --- |
| Asset quality | Refined pale damaged procedural chassis, enlarged optics, suspension and arm, separate paint, dust, metal, rubber and glass finishes | The rover reads as believable machinery without relying on blur or grain |
| Ground contact | Six terrain contacts, bounded spring visual suspension, chassis pitch and roll, acceleration and braking settling | Wheels stay planted on a low ridge; the chassis responds without floating or arbitrary wobble |
| Terrain | Authored valley/contact ridges, fractured partially buried outcrops, Poly Haven scanned color/normal/roughness/AO maps and deliberate debris | Close ground has mineral detail, middle distance has varied forms, far terrain loses contrast into haze |
| Lighting | Heavy gray procedural sky, distant pale sun, cool fill, sky-derived filtered environment, follow shadows, contact AO and restrained bloom | Rover, wrecks and ground share one lighting environment, with readable optics |
| Contact effects | Contact-driven wheel dust and persistent tracks | Effects follow actual wheel speed and contact and stop after braking |
| Camera | Weighted follow motion, collision avoidance, restrained turn response and deliberate repair framing | Driving remains readable; the camera avoids wrecks; cartridge, gripper and socket stay visible |
| Repair | Continuous extraction, plausible service pose, fixed-length or explicitly telescopic arm, constrained alignment and visible latching | The part never teleports, joints stay attached and misalignment gives a recoverable physical stop |
| Before and after | Restored eye, steadier head and stable optical feed | The player sees what the repair changed before another objective arrives |

These systems are implemented, with subjective visual/gameplay acceptance still pending. The rover uses geometric terrain sampling and spring visual suspension rather than Endurance's full rigid-body tire-force simulation. Terrain height sampling is checked against the actual mesh. Rain, wet asphalt, nitro and racing camera shake belong to the reference's conditions and were not adopted for this planet.

## Current verification and next milestone

TypeScript, the production build and targeted movement/contact checks pass. The current implementation is split across terrain/world materials, atmosphere/world assembly, rover materials/rig, grounding/vehicle/wheel effects, camera and rendering modules under `game/src/`. Review captures and a normal-speed recording are under `outputs/review/visual-pass-v2/`. The final production desktop playthrough passes recovery, alignment retry, installation, calibration, the unanswered relay call, replay, pause/resume/restart, focus handling and optical views through both F and the button. All six mobile touch buttons and module pointer dragging pass, and browser error logs are empty.

Review the wake pocket, donor approach, repair and post-repair change with the user before expanding the map or adding puzzles. Keep WASD. The approved larger-eye reference remains the design authority; the refined procedural rover and exact layout have not become accepted final assets. Sound integration, later story content and target-hardware performance acceptance remain outstanding.

For this story, good gameplay means readable intent, responsive control and a meaningful physical consequence. Driving should convey a damaged machine's effort without fighting the controls. Installing the optic should make recovery tangible. The call to mission control should carry the hope created by that successful repair.

Three.js remains suitable. A graphics-backend migration alone would not supply asset quality, material response, terrain composition or vehicle animation. Evaluate advanced rendering features after the ordinary gameplay view has a coherent foundation.

## Evidence and reuse scope

`technical-inspection.md` contains the deployed-client analysis; `source-manifest.json` records URLs, retrieval sizes and hashes. `live-gameplay.jpg` captures the live reference. No reference artwork or client code has been imported into the rover game.

The new surface assets are independently sourced Poly Haven CC0 scans: `sandy_gravel_02` and `dry_riverbed_rock`. Originals, source pages, download URLs, licenses and hashes are retained under `assets/vendor/polyhaven/`; the game loads local runtime copies. They are not Endurance assets.

The author's public upstream [Threejs-Punk repository](https://github.com/ektogamat/threejs-conference) includes useful rendering code and technique documentation. Its application-code license excludes the models, textures, audio and videos under `public/`; individual shader sources can have separate terms. A separate public Endurance source repository was not verified.
