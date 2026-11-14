# Environment investigation for the rover opening

The user selected a hybrid: A's bright rust-orange terrain and distant pale light, B's heavier gray sky, and a graveyard of discarded machines using repeated wreck silhouettes. The combined study is saved as `outputs/assets/environment-c-orange-graveyard.png`. It retains an open basin and a compact disposal hollow while adding broken-machine variations around a clear route. This is art direction for a Mars-like fictional planet, rather than a commitment to literal Mars. The precise level layout and combined image remain to be reviewed.

## Science that can inform the design

NASA describes Mars as a cold, dusty desert with a very thin atmosphere. Orange or red ground therefore does not imply a hot environment. Iron minerals account for its reddish surface appearance. [NASA Mars facts](https://science.nasa.gov/mars/facts/)

NASA's rover images show that Martian twilight can have a blue region around the Sun, while much of the surrounding sky remains yellow-orange. Do not turn the entire sky Earth-blue and describe that as a faithful Mars sunset. Camera processing also changes how published images appear. [NASA sunrise and sunset explanation](https://science.nasa.gov/solar-system/planets/mars/what-does-a-sunrise-sunset-look-like-on-mars/)

Frost is a real visual reference, but it should be placed deliberately rather than covering all orange ground in snow. NASA documents water and carbon-dioxide frost; ESA shows rusty ridges, exposed dark dunes and frost together, with low-angle sunlight making some ridges appear golden. Some orbital images use enhanced colors, so their blue patches are not direct paint samples for ground-level natural color. [NASA winter landscapes](https://www.nasa.gov/missions/mars-reconnaissance-orbiter/nasa-explores-a-winter-wonderland-on-mars/), [ESA Christmas craterscape](https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/Christmas_craterscape), [ESA frost-covered chaos](https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/Frost-covered_chaos_on_Mars)

NASA has observed frost building overnight and disappearing after sunrise. A dawn version could use patchy frost in sheltered areas without implying an Earth-like snowy climate. [NASA frost at sunrise](https://www.nasa.gov/missions/odyssey/science-at-sunrise-solving-the-mystery-of-frost-hiding-on-mars/)

These sources support the terrain and weather references. Sadness, loneliness and color grading are artistic interpretations, not scientific conclusions.

## Visual ingredients

| Direction | Visual construction | Plot fit and production cost |
| --- | --- | --- |
| Orange basin at dying daylight | Bright rust on exposed ground and rock faces; charcoal broken rock; cool blue-gray shadow; pale dusty horizon; sparse frost in deep shelter. Low sun reaches only the upper ridges and small portions of the rover. | Selected terrain and distant-light foundation. A compact discard hollow can reveal a vast basin without building it. |
| Frosted orange shelf at dawn | Rust-orange ridges interrupted by thin dirty frost; gray-white shaded ground; long shadows; pale light over a low horizon. | Makes coldness especially explicit and pairs with the rover's pale shell. More frost-material work, and excessive white could weaken the desired orange identity. A useful alternate study. |
| Heavy sky and dust-front atmosphere | Orange ground under a cold heavy gray ceiling; dark hardware silhouettes; restrained drifting dust; a narrow pale light break. | The heavier sky is selected for the hybrid. Keep the near route visible and avoid an opaque storm that obscures the optical-repair interaction. |

## Recommended visual specification

Proposed palette: exposed rust-orange ground `#C96A2E`, occasional sunlit ochre edges `#E49A52`, basalt/dead hardware `#30383D`, shaded dust and rock `#596674`, horizon haze `#B5B8B8`, small frost accents `#D8DAD4`. These are concept targets, not calibrated Mars measurements or final renderer values.

Keep orange as a surface color. A frame lit orange everywhere will tend toward warmth; reserve stronger orange for illuminated ground and rock faces, while a larger share of the frame sits in cool neutral shadow. Avoid decorative teal illumination. Maintain enough neutral fill to see the rover's eyes and navigable ground. One low directional light, a subdued sky/ambient contribution and inexpensive distance fog can establish the study. Exact settings need testing in Three.js.

Use broken plate-like rock, abrasive dust, wind-carved ripples and a few stripped mission-machine parts. The environment is dry and exposed. For motion, propose occasional low dust streamers with long pauses. Earth-like rain, lush clouds, rolling thunder, fire and a constant cinematic storm would shift the selected setting and add production work.

The rover should be visually small but readable against orange or charcoal ground. Its pale shell can carry the clearest light/dark contrast. The selected graveyard uses inactive wreck variations nearby and repeated silhouettes in the distance. Keep machine remains at the sides of the navigable route and preserve visible ground around the first interaction. Avoid adding colossal buildings or elaborate industrial infrastructure without a new decision.

## Compact opening layout

This is a layout proposal, not an authored scene or accepted map.

1. A shallow rubble hollow contains the waking rover, with one clear route and sufficient space to turn and operate its arm.
2. A broken service assembly or donor unit provides the recoverable optical module. The exact source and repair action remain for the user to choose.
3. The recovery path bends around one rock/mission-debris landmark, giving a controlled framing change without a large level.
4. A low ridge beyond the repair site reveals a distant basin and a far, inactive mission silhouette. The distant landscape can be background geometry; only the near route needs traversal and collision.

Use damaged vision without hiding the path or making the audience stare at an unreadable dark screen. Keep the one repair target distinguishable by shape, placement and light; the cue need not be a floating quest marker.

## Minimum modular asset kit

- One compact terrain mesh or heightfield with a hollow, approach and ridge exit.
- Three rock forms reused through scale and rotation, plus one distant ridge/mesa silhouette set.
- One shared wreck chassis with variations in pose, missing wheels, mast position and partial burial; two panel/debris forms and the selected optical module.
- One orange regolith material, one dark rock material and one shared aged hardware material; a simple frost mask is optional.
- Simple collision proxies for the near route; restrained dust particles and distance fog.

This is plausible for a one-day first-scene attempt because lighting, distant silhouettes and asset reuse do much of the work. It still requires a functioning rover model and a tested import route. Defer dynamic terrain, weather simulation, full day/night cycles, open-world terrain and many unique wreck designs. A static time of day is sufficient for the first scene; chapter changes can later reuse this environment with different lighting and dust.

## Questions most useful for the next visual iteration

Choose the gameplay camera, the source of the replacement optical module and the repair interaction. The graveyard layout proposal is saved in `graveyard-layout.md`; it remains separate from the selected visual ingredients.
