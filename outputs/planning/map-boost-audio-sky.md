# Map, boost, menu audio and dusty sky

14 November 2026. Continuing local `terrain_fix/hazem` from `0becdac`. User requests: shorter click timing, slightly smaller settings window, held Shift speed boost, a stable extended loop from the supplied music, an M terrain map with live player/objective pins, then a dusty Mars sky using three new references. The sky request supersedes the previous pass's instruction to leave sky unchanged.

## Applied controls and map

Shift increases the spirit's target glide speed from 4.2 to 6.93 m/s while held, using the existing acceleration, diagonal normalization, bounded leap, collision substeps and circular boundary. Releasing Shift returns to normal. It is a held sprint, with no dash, phasing, new ability timer or altered rover physics.

M opens a paused, north-up terrain map; M/Escape/Close returns to the prior gameplay or pause state. Map is also accessible from Pause. It consumes gameplay keys and traps focus while open. Settings, title, unstarted scenes and loading do not stack another map. The default hub and Opportunity drive preview supply their actual current controller/vehicle position, heading, current terrain sampler and objective through optional `GameScene.getMapSnapshot()`. This is a runtime read model, not saved progress.

The map samples the real heightfield at 1 m spacing over `[-80,80]²`, uses shaded relief/2 m contours, and dims beyond the shared playable radius 63.5 m. North is -Z, east is +X. Hub objective comes from the actual wreck transform at `(0,-25)`; Opportunity's existing Explore the basin objective uses basin centre `(9,-37)`. The old repair prototype supplies no map rather than displaying incorrect hub terrain. Marker centres, direction, distance and 20 m scale share the same world coordinates. A bounded terrain-raster cache uses terrain identity/bounds. All scratch canvases stay off-DOM; there is one game canvas and one renderer/input loop.

## Applied audio

The click source contained 100 ms digital silence and two transients. Runtime v2 keeps only .108–.175 s with short edge fades: a single 67 ms click. The application warms decoding on pointer-down/key gestures and starts cached clicks directly. Originals and runtime v1 remain preserved; no unrelated sound is substituted.

The supplied 6.33 s music is mostly a swell/fade. Its 1.75–4.0 s middle is levelled with stereo-linked gain, extended using waveform-similarity overlap-add at3× without playback-rate pitch change, and crossfaded over 400 ms into a 6.22 s repeating loop. Quarter-second stereo RMS is approximately .132–.146, avoiding the original large rise/fade. The original and reproducible standard-library processing script/hashes are retained.

Music plays only on the title, including Settings reached from that title. It fades out for gameplay and background windows, then resumes its loop offset on return. One application AudioContext handles bounded click voices and music. First audio requires a browser user gesture. Master, Effects, Music and Mute are saved independently. Settings shrinks from 1000×620 to 940×590 desktop limits, with adaptive mobile/short-landscape layout.

## Applied sky

The current hub/Opportunity environment opts into a dusty atmosphere: ochre ceiling, warm horizon/fog, low-contrast three-dimensional dust fields, soft sun and matched environment/hemi/fill lighting. Sky shading derives from the viewing ray to avoid the old projected triangle artifacts. Fog and PMREM use the same palette; shadow resolution, exposure, renderer and terrain geometry are unchanged. The old repair prototype retains its prior sky. The reference images guide color/mood; no stock image, star field or external sky texture is imported.

## Verification record

Build/typecheck, controller/map projection tests and native browser checks are recorded in `outputs/review/map-boost-music-sky/REVIEW.md`. Test saves/preferences are isolated in a nonpersistent browser context. Owner visual/listening acceptance remains separate from agent checks. No commit/push or deployment is included in this request.
