# Opening scene visual direction

Reading this as: a playable stage demonstration for a narrative rover game, in grounded cinematic science fiction, dial ENERGY 1 / RHYTHM 2 / MOTION 3.

The user supplies the direction: rust-orange Mars-like terrain, distant pale sunlight, a heavy cold gray sky, a graveyard of discarded machines, and a pale battered rover with large relatable optics. The scene should feel harsh, cold and sad. Third-person driving gives way to brief optical views and a close external repair view. Movement and restraint carry the emotion, with minimal text.

## Implementation reasons

- Orange terrain and cold neutral fill reproduce the selected environment study and keep the pale protagonist readable.
- A low sun under an oppressive sky gives distance and a route toward the relay.
- Repeated, buried wreck silhouettes communicate abandonment with a small reusable asset kit.
- The damaged twin-optic head is the scene's focal point; only the functioning lens has a restrained pale reflection.
- Camera easing and authored service transitions make machinery feel weighted while driving input remains responsive.
- A stable repair close-up gives the keyed connector readable geometry and avoids an impossible view through the rover's own eye.
- UI sits at the edges of the actual game canvas, leaving the landscape and rover as the main composition.
- Off-white text on opaque charcoal backing maintains contrast regardless of terrain behind it.
- A restrained warm accent marks the current interaction; it does not decorate every control.
- System sans-serif type keeps short controls readable at stage distance without introducing a competing typographic identity.
- Square controls and fine mechanical reticles repeat the keyed-socket motif; no card grid, logo or ornamental icons are needed.
- Fixed scene lighting serves the chosen narrative mood; a light/dark website theme would change the game art rather than improve this demo.
- Dust drift, physical wheel rotation and the eye settling after repair are functional scene motion, not looping UI decoration.

The imported Kenney models are technical placeholders. Added rigid geometry supports interaction and silhouette, not a claim that the approved custom rover has been modeled faithfully. This demo is the opening loop, not the full game's duration or ending.

Visual checks apply during the build, as chosen by the user on 11 November 2026.

## Implemented second visual pass

- Scanned regolith and fractured-rock material maps give close surfaces a physical scale without adding objects to the driving lane.
- The visible sky also supplies the environment reflections, while matching fog and pale directional light keep the rover and landscape in one atmosphere.
- Beveled pale panels, exposed cables, tread blocks and glass optics make the protagonist readable as worn machinery at the gameplay camera distance.
- Six contact samples, bounded suspension travel and damped body response communicate wheel contact; the vehicle remains a lightweight driving simulation rather than a full rigid-body simulation.
- Dust and tire imprints follow actual wheel displacement so motion leaves visible consequences and a blocked rover does not continue spinning its wheels.
- The arm approaches, grips, extracts and carries the optic into the keyed socket view, making the recovery action visible rather than hiding it behind a text prompt.
- Project Endurance informs coordinated materials, lighting, camera and vehicle response. The orange valley, quiet pacing and damaged rover retain this game's chosen direction.

The second pass is implemented and agent-checked. Owner acceptance of its appearance is pending. Sound, a final custom rover asset and the later story are still outside this opening prototype.

## Runtime organization preview

The integration hub uses a visibly provisional humanoid silhouette to test control ownership, solid collision and return bookmarks before final spirit art. The existing landscape remains the visual baseline. Loading, Retry, Cancel and Return to Mars controls expose real transition states; the opaque shared backing keeps them legible over either scene. A separate hub instruction strip distinguishes glide/leap from rover driving, and the small-screen leap button sits above the D-pad to leave interaction space clear. Scene switches use the same rendering pipeline and deliberately avoid a new decorative transition style. These are integration choices, not approval of final spirit appearance or story pacing.
