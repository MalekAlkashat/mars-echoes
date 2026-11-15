# The Run: movement and trail study

Inspected 15 November 2026 through native browser play and the site's public
client bundle. No assets or client code were copied into the runtime.

Sources:

- [Playable reference](https://therun.montblanclegend.com/).
- [Gang / Merci-Michel production case](https://gang.tv/works/interparfums-montblanc-the-run).
- [Public game bundle](https://therun.montblanclegend.com/assets/installPlugins.e1d282c710e81862.js), identifying its build as 20240429-181823.

## Verified mechanisms

The player steers a spherical machine along an authored track. Forward progress
is automatic. Left/right input is eased; steering changes accumulated heading,
which in turn produces lateral movement. The body banks separately from the
movement root, with small speed-dependent secondary motion. This is procedural
transform animation rather than a humanoid skeleton animation system.

The code sets normal forward speed between 8 and 10.5 world units/second and
turbo speed to 19.8. Distance travelled on the luminous line fills charge;
25 units fills it. During turbo, an autopilot influence takes over steering.
These are the reference's racing rules, not proposed Mars mechanics.

The wake uses a small mutable mesh with a ring buffer of earlier world positions
and orientations. Distances along the trail, noise, width and state-dependent
length control its appearance. It records the travelled path rather than
attaching a long rigid cone to the current heading. A full fluid simulation is
unnecessary for this effect.

The camera follows the road frame, reacts to lateral movement, and smoothly
widens its field of view with speed. A restrained saturated-blue environment,
luminous white line, atmospheric depth and concentrated highlights reinforce
motion. Native play verified normal steering and track-following; boost/trail
internals were verified in the public source, not a successfully completed
boosted racing lap.

## Adaptation accepted by the user

- Free camera-relative WASD exploration, retaining terrain contact and solid
  collision. Shift smoothly changes 4.2 m/s glide to 7.5 m/s rush.
- Responsive movement with short coasting; no racing line, automatic forward
  travel, autopilot, meter, dash, phasing or unrestricted flight.
- The supplied flame image, rather than the reference machine, determines the
  character: white-cyan core, flowing blue envelope, bright internal filaments,
  sparse embers and a tapering world-space wake.
- Compact living flame at rest, longer flame while rushing. Motion state and
  real resolved displacement drive visual strength and camera response.
- Keep Mars's existing terrain, lighting and story. Bloom remains optional;
  the flame must remain visible on balanced quality with bloom disabled.

## Implementation contract

`SpiritController` owns movement and exposes actual world velocity after collision.
`SpiritAppearance` owns its body, world-space wake, private noise texture and
reset/update/disposal boundary. `SpiritCamera` owns the 48–54° speed response.
The existing app owns input, renderer, frame loop, transitions and pause.

64 history samples at 60 Hz, at most 32 embers (12 at low pixel ratio), six main
effect draws and 3,074 triangles. No additional render targets or shadow lights.
The shared periodic flow texture supplies coherent breakup and filaments.

Review evidence: `outputs/review/blue-flame-v1/REVIEW.md`.
