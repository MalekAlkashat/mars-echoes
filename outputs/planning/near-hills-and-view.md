# Nearby hills, first person and menu audio

Applied 14 November 2026 on `terrain_fix/hazem`, continuing the uncommitted terrain pass based on `0becdac`. The user accepted the direction of the gravel/rock pass and requested closer hills using two new references, an F viewpoint switch, and the supplied `clicking.wav` for menu activation. The reference photos guide landform scale; they are not texture assets. Music is deferred until supplied.

The existing hub and Opportunity drive preview share the quiet terrain path. Its coordinates are metres, +Y up, -Z forward, spawn `(0,8)`, entrance `(0,-25)`. Added broad mound components:

| Feature | X/Z centre | Added peak contribution | X/Z spread |
| --- | --- | --- | --- |
| Left close shoulder | `(-16,-1)` | 4.6 m | `(10,17)` m |
| Right close shoulder | `(17,-13)` | 3.9 m | `(10,15)` m |
| Right rear roll | `(23,13)` | 1.7 m | `(12,9)` m |

Contributions taper to zero inside `abs(x) <= 4`, reaching full effect by `abs(x) >= 11`. Broad noise varies their shape slightly. Existing hills, valley, rocks, gravel, sky and lighting remain. Mesh, spirit grounding, rover contact and camera clearance continue to use the shared triangulated heightfield. The legacy repair terrain is unchanged. These are art-directed game hills, not surveyed Mars coordinates.

F reuses the existing shared one-frame optical/view action. In the spirit hub it toggles first/third person. First person cuts to the placeholder's 1.08 m head offset above its controlled position, uses a 68-degree lens and .06 m near plane, hides the replaceable spirit appearance, and keeps camera-relative movement and solid collision. Drag/arrow look supports up/down; zoom retains the stored third-person distance. Returning to third person restores its 48-degree lens and obstacle-aware chase view. The optional boolean `HubBookmark.firstPerson` persists view through save/Continue and equipment return, while older saves remain valid. Opportunity keeps its existing F optical-eye toggle.

One application-owned `MenuAudio` service preloads the supplied WAV, creates its single AudioContext on user activation, decodes once and caps short simultaneous voices at four. Main menu, pause, settings, confirmation, skills and loading buttons use the same click handler; keyboard button activation also works. Sliders preview on release. Master × Effects sets the gain; Mute silences it. Service/context/voices are disposed with the app. No music or synthesized replacement is added. Provenance and hash: `assets/audio/ui-v1/SOURCE.md`.

Acceptance: native nearby-hill and first-person captures; real glide/leap to the rover; F/menu input isolation; save/reload and memory-return viewpoint retention; actual Web Audio decoding/start/gain/mute; responsive Sound/Controls categories; production build, camera/save/contact/collision checks. Evidence belongs under `outputs/review/hills-view-audio/`. Owner visual/listening acceptance remains separate from automated verification.
