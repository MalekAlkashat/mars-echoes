# Project Endurance: public-client rendering analysis

Source: https://endurance-racing.vercel.app/

This is a static inspection of publicly delivered client code, not a performance measurement or a claim that every bundled feature is enabled in the user's current session. Root is separately reviewing the live game. The bundle contains circuit and city branches; a feature's presence is distinguished below from its actual branch activation. No site code or artwork was copied into the rover demo.

## Retrieval scope and evidence

Retrieved one public HTML document and its directly referenced application JS/CSS. The application bundle explicitly referenced six additional JS chunks, which were also retrieved. No unlinked endpoints, private repository paths, credentials or hidden source maps were requested. The main bundle has no `sourceMappingURL`. Readable files were produced locally by formatting the downloaded JavaScript without executing it.

Public URLs:

- https://endurance-racing.vercel.app/
- https://endurance-racing.vercel.app/assets/index-B9DY0o_4.js
- https://endurance-racing.vercel.app/assets/index-BQTZXbEr.css
- https://endurance-racing.vercel.app/assets/applyRealLook-CMJJebgX.js
- https://endurance-racing.vercel.app/assets/applyNeonLook-D-Rdtv0X.js
- https://endurance-racing.vercel.app/assets/realPaint-BPQxzWBp.js
- https://endurance-racing.vercel.app/assets/loadVehicleRig-BAkTE8im.js
- https://endurance-racing.vercel.app/assets/ringWorldStandby-BwVJGO3R.js
- https://endurance-racing.vercel.app/assets/index-CdBgRkwH.js

Hashes and byte sizes are in `manifest.json`. All evidence locations below refer to `index.readable.js`, a local formatted copy of the exact public main bundle. Names are minified symbols unless they are descriptive property/class names retained by the build.

## Confirmed rendering architecture

### Renderer and frame graph

The app constructs Three's WebGPU renderer (`nle`), with antialiasing disabled at the renderer level, opaque output and high-performance power preference. It awaits renderer initialization before creating dependent effects. The bundled renderer supports a WebGL2 fallback, but this does not prove full app parity under WebGL: GPU compute, shader variants and product requirements may constrain the application. The HTML explicitly identifies Three.js, WebGPU and TSL. Evidence: renderer construction `Vxe`, lines 41054–41069; bundled fallback around 24835.

The main scene pass exports multiple render targets: beauty/color, emissive, normal, optionally velocity, plus depth. These buffers are shared by ambient occlusion, bloom, lens distortion and anti-aliasing rather than independently rerendering the entire scene for each effect. Normals/velocity are enabled according to selected effect requirements. Evidence: `Qge`, 35480–35683.

Simplified frame order, confirmed by `UEe` (54480 onward): driving/physics → camera → collision-height pass → rain compute → sky/world/track → planar reflection → optional car probe → follow shadow → optional live feed → postprocessing. This is a deliberately staged renderer, not just a default Three scene plus one light.

### Surfaces and reflections

The terrain/track materials use separate roles for asphalt, paint, curb, paving, grass, gravel, buildings and vegetation. Those roles have distinct color, roughness, wetness and normal treatments. The code layers world-space noise at several scales, adds close-range detail normals, and fades fine detail with camera distance. Wetness modifies color and roughness instead of making every surface uniformly shiny. Evidence: role table and material conversion around 31670–31820; `fpe` around 31531; `ring-world.readable.js` around 737 onward also has terrain classification/detail sampling.

Ground reflections are **planar reflected-camera rendering**, not confirmed ray tracing or screen-space reflections. `bD` constructs a half-float reflection render target, reflects the camera across the surface and uses an oblique clipping plane. The shader distorts reflection coordinates with normal/ripple fields and blurs via mip levels or bicubic sampling according to roughness. It can render only selected light layers or the full scene. Evidence: `GroundPlanarReflection` and `bD`, around 30568–30706.

The circuit branch has a separate `RingMirror` implementation (`Lme`, 32688–32808). It estimates a local road plane from sampled track elevations, smooths the plane over movement, renders a reflected camera, and selectively includes nearby world geometry according to semantic role and distance. It is still an approximation to a locally planar surface, with deliberate limitations and culling. Its cost is another scene view plus post/material sampling.

The city branch optionally applies a small dynamic cubemap to car materials. It hides the car during capture, updates individual cube faces over time, filters visible layers and generates mipmaps. This is branch-specific, not evidence that every circuit car is captured this way. Evidence: `LEe`, 54376–54477; it is enabled under `metroMode` around 55085.

The real-paint chunk uses physical node materials: color/metalness/roughness/clearcoat, several finish presets and view-distance-faded microflake normal variation. This is a layered material, not merely a higher-polygon car. Evidence: `realPaint-BPQxzWBp.js`. `applyRealLook` separately treats paint, trim, chrome, wheels and lamps.

### Authored assets and load pipeline

The scene is built around imported authored art, not generated primitive approximations. The public bundle contains explicit model references including `/models/game/mclaren_rig.glb`, `/models/game/quadra_rig.glb`, other vehicle rigs, `/models/game/npc_car.glb`, `/models/cyberpunk_compressed.glb`, and a separate `/models/colider.glb`. These references were inspected as strings; the large art assets were not downloaded or reused.

The vehicle loader requires `userData.rig === 'vehicle'`, a named `Body`, a wheel-node table and wheel pivots, and returns independent body/wheel transforms. The app applies role-specific materials to that imported rig. This is the relevant difference from our procedural placeholder: a finished vehicle's silhouette, bevels, surface definition and separate mechanics exist before the camera and post stack are applied. The exact polygon/texture budgets of those files have not been measured.

The circuit loader reads `https://endurance-racing.vercel.app/models/ring/ring.json`, then uses that metadata's visual GLB, collision data, height field and optional containment files. It explicitly references `ring_vegetation.glb`. The loader preserves semantic material roles and separately loads terrain detail textures. We did not fetch the metadata or infer unlisted visual filenames. Evidence: `u0e`, 33522–33548.

The shared GLTF loader is wired to Draco, KTX2/Basis and Meshopt support (`Wl`, 29354). That confirms decoder support, not that every file uses every format. The app has explicit compressed texture references such as `/textures/screens/ads.ktx2`, a city kit with plaster color/normal/ORM maps, and a circuit detail-normal naming pattern `detail_<role>_n.ktx2` under `/textures/ring/` (31488). KTX2 reduces transferred and resident texture cost where suitable; it is not itself a visual detail generator. Distinct model, collision and surface data help the artwork and gameplay agree without using the complete visual mesh for every physics operation.

### Sky, light, fog and shadows

Circuit sky is a custom procedural cloud/gradient/sun shader (`J2e`, 53781–53870), not just a flat background or an image pasted behind the scene. It includes several noise scales, cloud thickness, shading, sun direction, color gradients, haze, lower cloud bands, and quality tiers. These are shader approximations; volumetric raymarching is not established by this evidence.

The same atmosphere supplies a cubemap and filtered environment map for physical material illumination/reflections. It bakes the procedural sky into a cube and processes it through Three's environment generator. It can rebake when the look changes. The visible sky, lighting environment, sun and fog are therefore coordinated. Evidence: `bake` in `J2e` around 53836–53854; `xEe`, 54184–54220.

Fog combines integrated height-dependent density, a separate low mist layer, distance haze, sun-direction scattering and horizon matching. Far objects approach the sky color, which avoids the obvious hard meeting of ground and background. Evidence: `Xo`, `eH`, `mpe`, 31622–31655.

Direct lighting uses a shadowed directional sun and a separate fill direction. Circuit follow shadows use a limited orthographic volume ahead of the camera, snap that volume to shadow texels to reduce shimmer, filter the shadow, fade its edges and update on a controlled schedule. Evidence: `LW`, 53696–53720, and circuit configuration around 54218–54226. This is a purposeful shadow budget rather than an enormous map covering the entire world.

### Weather and photographic finish

Rain is a GPU-compute particle system in a camera-following region, not thousands of independent JavaScript objects. It samples a rendered collision-height field so drops/splashes track surfaces. Instanced streak geometry stretches/leans with camera velocity, with near-fade/width controls. Surface droplets and lens droplets are separate effects. Evidence: `CollisionRain` / `Efe`, around 30320–30560; car proximity update around 29620; lens-rain function `Fge`, 35273.

The post stack applies depth/normal ambient occlusion with bilateral denoising; emissive/highlight extraction into mip bloom; separate shadow/highlight tints; exposure, contrast and saturation; tonemapping; optional chromatic lens treatment and speed blur; vignette; AA/upscaling; film grain. Circuit tonemapping is explicitly performed in the composite, so renderer tonemapping is then disabled to avoid applying it twice. Evidence: `Qge` 35545–35683, `Ige` 35131–35205, and atmosphere renderer assignment around 54218. Heavy blur and grain are not the foundation of the lighting.

Sun flare uses occlusion tests and smooth visibility, not a permanently visible lens-flare sprite. Evidence: `nEe`, 53880 onward.

### Camera

The close chase preset is low: distance 4.2, height 1.3, look height .8, base FOV 62 with a speed-dependent boost. Separate damping controls heading, height, focus and inertial offset; it blends body heading and slip/velocity direction, permits manual orbit, returns smoothly, and raycasts toward the desired camera to avoid clipping. It also contains fixed hood/bumper and wider chase presets. Evidence: `vd`, `Wwe`, 42971–43090. The exact user's selected camera still needs the live review.

## Confirmed performance decisions

Current desktop ultra defaults in `be` (25625), before saved preferences, quality tiers or URL overrides:

| Setting | Value |
| --- | --- |
| Max device pixel ratio | 1.5 |
| Adaptive DPR | Enabled |
| Main rendering scale / upscale filter | .85 / Catmull |
| AA | SMAA |
| AO scale / samples | .5 / 12 |
| Bloom scale | .7 |
| Ground and circuit mirror scale | .5 |
| Reflection frame skip | 1 |
| Follow shadow | 4096, extent 90 |
| Optional car cubemap | 64px, one face per update, skip 3 at low speed |
| Circuit rain count | 1600 |
| Generic collision rain count | 2750 |

Medium reduces mirrors, shadow resolution, DPR and AO resolution. Low disables circuit mirrors, AO, lens rain, car surface rain and car probes, swaps FXAA, reduces weather/detail and draw distance. Mobile has a separate budget; an additional lite path cuts it further. There are runtime selectors and GPU/CPU pass profiling with frame-time percentiles, draw counts and triangle counts. No FPS was measured during this static analysis. Some console help text is stale: it mentions quarter-resolution reflection and six AO samples, while the current `be` object above specifies .5 and 12.

## Confirmed gameplay and visible world response

This section focuses on vehicle/world behavior, not menus or HUD. The important pattern is that a single simulated cause produces several coordinated visible responses.

- **Real wheel contact drives the pose.** `G4` creates a dynamic Rapier rigid body with explicit mass, center of mass, inertia and rounded chassis colliders; continuous collision detection is enabled. Each wheel casts against the world, tracks surface normal/material, suspension compression and compression velocity, and computes spring/bump/rebound/bump-stop and anti-roll responses. Body pitch/roll can emerge from those forces and the rigid body's orientation; it is not established as a cosmetic sine-wave bob. Tire forces depend on longitudinal/lateral slip, load and surface/weather grip. Evidence: 42462–42630. This is far beyond moving one object across a height field.
- **Wheel visuals follow that state.** `V4` interpolates fixed physics snapshots for smooth rendered chassis position/orientation and independent wheel suspension, spin and steering pivots. Loaded models must provide named body/wheel nodes and vehicle-rig metadata. Evidence: 42838–42881 and `loadVehicleRig-BAkTE8im.js`. These are moving parts with meaningful pivots, rather than rotating an entire static car model.
- **Input is eased, not binary motion.** Throttle, braking and steering use different response rates; keyboard/gamepad/touch inputs are smoothed. Steering includes speed-dependent limits and assisted countersteer, and front-wheel steering uses an Ackermann blend. Evidence: 42500–42518 and 42940–42952. Forward velocity can differ from the direction the body faces because of slip.
- **Camera communicates force and speed.** Chase heading blends car heading and velocity/slip, then damps separately from camera position. Longitudinal acceleration offsets the camera. FOV opens progressively with speed, then receives an additional nitro boost. Impact shake decays; nitro adds fine vibration. Speed blur and wet-lens smear are driven by speed and nitro rather than looping constantly. Evidence: `Wwe` 43026–43075; `h_e` 44192 onward; `zge` 35313 onward. These parameters are racing-specific; the transferable part is causal camera response.
- **The road remembers contact.** Skid strips are placed at wheel contact points with the actual contact normal and tire width. They begin only above a skid threshold, bridge successive points and fade with age; jumps/teleports break the strip. Evidence: `skid-marks`, 44082–44123. Tire spray is emitted from contacted rear wheels, depends on grounded speed and wetness, inherits a proportion of vehicle velocity, spreads, drags, falls and expires. Evidence: `u_e`, 44126–44174. Spray is not an always-on cloud parented rigidly to the car.
- **Acceleration and impacts have coordinated consequences.** Nitro has charge/drain/recharge and requires sufficient wheel contact and an allowed gear/brake state. It changes driving force, exhaust flame/spark output, camera/FOV and speed effects together. Contact-force callbacks trigger proportional camera shake, impact audio callbacks and crash state with a short cooldown. Dynamic colliders provide the mechanical response; particles and camera shake communicate it. Evidence: 42786–42802, 45255–45262, 45162–45174. These are code findings; audio has not been auditioned here.

### Specific rover mechanics to borrow in spirit

These are proposed improvements, not already implemented findings about the rover:

1. **Weight before speed:** acceleration/braking inertia, a damped steering response, small acceleration-dependent body pitch and restrained turn lean. Keep an exploration rover slow and deliberate; do not import racing drift or nitro behavior.
2. **Six visible ground contacts:** sample terrain below each wheel; adjust each wheel's suspension/rocker pose, derive chassis pitch/roll from axle/contact heights, and use damped bounded travel so the wheels neither float nor bury themselves. Ground contact should also decide whether wheel dust is emitted. A geometric six-point contact approximation is a reasonable one-day route; a complete tire-force solver is not required.
3. **Travel leaves evidence:** wheel spin should follow actual contact travel, with subtle steering geometry and persistent shallow track/decal strips on dusty ground. Emit low orange mineral puffs at contacted wheels proportional to movement, acceleration and slipping, with wind/inherited velocity and gradual dissipation. Stopping should stop new emissions while existing dust settles.
4. **Collision is a physical event:** brake motion against an obstacle, add a short suspension/head settling response, a small motor-load/impact feedback cue and a recoverable camera nudge. Avoid a full-body jitter loop or unexplained pass-through. Keep contact clearances aligned with visible wheels and debris.
5. **The face follows the task:** damp the optical head toward interesting objects or the donor while the chassis settles independently. Stage-two damage may produce a brief load-dependent hesitation, not random continuous twitching. Repair should visibly reduce the affected motion and restore optical clarity.
6. **Repair should read as machinery:** stop and brace, place the arm, grasp the donor cartridge, support it during extraction, move it on a continuous reachable path, expose the keyed receiving socket, align the cartridge, insert along the socket axis, latch, then settle. A failed alignment should visibly meet the housing and permit correction. Fixed-length arm segments or an explicit telescopic mechanism are more convincing than rods that stretch without construction. Coordinate glass/vision restoration with completed insertion, not the start of the animation.

The biggest transferable gameplay lesson is coherent cause and effect: contact changes pose; pose and speed change the camera; contact and slip change dust/tracks; damage changes motion; a completed mechanical action changes the rover's capabilities. A passive particle layer or more atmospheric fog does not supply that response.

## Transfer to the orange graveyard: recommendation, not copied implementation

Highest-value one-day changes, in order:

1. **Coordinate the scene's light.** A heavy gray procedural/cloud-textured sky, pale low sun, cool fill, and a matching low-resolution environment for metal and lens reflections. Preserve orange ground rather than washing it into uniform brown/black. Match fog to the horizon and reduce contrast in distant wrecks.
2. **Give terrain several scales.** Broad authored ridges and a clear route, medium sediment/rock breakup, then small mineral normals/roughness close to the rover. More random boulders cannot substitute for terrain shape and surface response.
3. **Give machinery material separation.** Faded paint, rough dust, exposed worn metal, rubber and clean optical glass should react differently. A coherent hero asset and believable joints remain necessary; postprocessing cannot turn a box placeholder into the approved model.
4. **Ground the scene.** Tight stable shadows around rover/wreck contact, restrained contact AO, and scale-consistent debris. Keep depth in cavities without crushing the eye and wheel mechanics.
5. **Compose the camera and depth.** Low close third-person framing that keeps the rover readable; wreck silhouettes at near/middle/far distances; the recovery objective near a deliberate pale lighting break. Use frame-rate-independent damping and collision-aware camera movement.
6. **Finish lightly.** Subtle highlight bloom, cool shadows, controlled contrast, fine grain and a restrained vignette. Replace race rain/spray with sparse wind-driven mineral dust only if time permits.

Do not spend this day porting WebGPU, a full TSL frame graph, temporal upscaling, dynamic cubemap probes, planar wet-road mirrors or rain compute. Those systems solve the reference's racing/weather requirements. Three's existing WebGL renderer can implement the high-value lighting, environment, physical material, shadow, terrain detail and postprocessing improvements needed here. Treat any wet/icy patches as an explicit art-direction choice, not an excuse to import the reference's road appearance.

Live appearance, hardware performance, asset quality and integration cost remain to be reviewed in the actual rover scene. This report confirms techniques in the reference's public client; it does not promise visual parity in a day.
