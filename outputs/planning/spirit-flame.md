# Blue flame spirit: implemented slice

## Rounded trail turns and dissolving reversals

The turn treatment now uses a smoothed world-space path and cubic collar at the
core, persistent ribbon frames, curvature-based narrowing and distance-based
filament coordinates. The body gathers during hard turns and its visual heading
has a 4.5 rad/s limit. Old wake portions ahead of a reversal dissolve smoothly;
history is retained rather than cleared. Controller handling and speed-driven
pulses remain. See `../review/spirit-turn-v2/REVIEW.md` for native before/final
captures and the 86 passing checks. Owner visual acceptance remains open.

## Skill-guided movement refinement

The refreshed catalog includes `filters-and-postfx`. Applied the existing
Three.js gameplay/game-feel, camera-direction, procedural-animation and visual
review guidance, retaining Phaser guidance only for compatible filter concepts.
The trail now transports a continuous lateral frame across nearly camera-aligned
or stationary segments, avoiding abrupt edge flips and zigzag folds. Camera
look-ahead follows resolved movement with a smoothed 0.4 m limit; collision
clearance still starts at the core. Reset clears the lead, and reduced motion
suppresses it. No new effect passes, textures or dependencies.

## Cinematic speed treatment

The first speed-filter pass adds eased follow-distance expansion (up to 0.55 m),
48–58° lens widening, subtle lateral bank and peripheral radial blur plus speed
vignette. It uses the existing film pass, with no new textures or render targets.
Low graphics skips the filters; system reduced motion also suppresses the added
camera motion. This supersedes the earlier 48–54° lens range. See
`../references/montblanc-run/speed-effects-study.md` for researched alternatives,
implementation details and verification limits. Build and 84 tests pass.

## Soft contained soul revision

The user rejected the horn-like rear projection and heavily fragmented core.
The outer body no longer curls upward into a point at rest. The internal soul
returns to a gently morphing rounded form contained inside that envelope, with
continuous low-contrast density rather than noise-cut holes. Both layers fade
to transparency at their silhouette; reduced opacity and filament contrast keep
the soul light and soft rather than a hard ball. Velocity-driven pulse and wake
behavior are retained. This supersedes the core dissolution description below.

## Velocity pulse and dissolved core revision

The user's follow-up makes actual resolved velocity directly control the entire
effect: pulse frequency rises continuously from 0.65 to 3 Hz over 0–7.5 m/s,
with integrated phase to avoid jumps when speed changes. Trail lifetime scales
from 0.18 to 0.73 seconds across that same range, rather than using the rush
threshold. Slow/idle motion keeps short local wisps; old wake samples fade out.
The core now morphs through larger coherent deformation and noise-based alpha
dissolution, preserving a luminous centre without a solid circular silhouette.
These values supersede the initial tuning below. Geometry, texture and draw
budgets are unchanged.

Accepted 15 November 2026: replace the white humanoid placeholder with the user's
floating blue flame reference. Keep free surface gliding, bounded leap, real
obstacles and the existing Mars-to-Opportunity memory flow.

## Controls and response

- WASD: camera-relative 4.2 m/s glide; normalized diagonal movement.
- Either Shift: smooth 7.5 m/s rush, without a timer or meter.
- Space: existing 3.8 m/s leap impulse and gravity of 8 m/s².
- Acceleration damping 8/s; braking damping 12/s gives approximately 95% speed
  reduction in 0.25 s and less than 0.65 m total coasting from full rush.
- Body: approximately 0.6 m across; core near 0.63 m above ground, softly breathing.
- Wake: 0.38–0.65 s life, reaching approximately 5 m during full rush, recorded
  in world space. Idle wisps, body stretch, turn lag and leap/landing response
  share motion fields; resolved displacement prevents false boost at a wall.
- Camera: retained drag/arrow orbit, zoom and collision constraints; core-centred
  framing and smooth 48–54° FOV response. Return/reset restores 48°.

## Ownership and limits

Spirit modules own appearance/controller/camera. The hub composes them and resets
transient effects on restore. Shared input adds `rushHeld`, defaults it to false,
and clears it with normal pause/focus handling. Neither renderer nor asset-cache
ownership changes. No new package, paid generation, skeleton or external GLB.

Six effect draws, 3,074 triangles, a 128 × 128 private noise texture, 64 fixed-time
trail samples and 32 pooled embers. No additional full-screen pass. The existing
graphics preferences, DPR/frame caps and pause scheduling remain intact.

## Verification

Production build and 81 tests pass. Native review covers rushing, turning,
leaping, braking, orbit, solid rover contact, ten memory returns and production
browser controls. See `outputs/review/blue-flame-v1/REVIEW.md` for evidence and
measurement limits. Final user visual acceptance and a thermal benchmark remain
outstanding. Spirit lore, sound and the rest of the campaign remain separate work.
