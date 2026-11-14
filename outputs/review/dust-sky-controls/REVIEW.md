# Dust sky and Controls revision

Rollback note, 14 November 2026: the user requested reverting environment work to avoid conflicts with a teammate. `atmosphere.ts` and `hub.ts` have been restored to `41f41bf`; the warm sky/fog/lighting implementation and screenshots below are historical evidence, not the current scene. The Controls menu and removed gameplay overlays remain in place. No terrain geometry had been changed by this experiment.

14 November 2026, local `Hazem` branch based on `41f41bf`. This revision is not committed or pushed and is not owner-accepted.

Requested: remove the circled persistent objective, distance, keyboard legend and Pause button; add Controls in Pause; match the new warm orange sky reference.

Implementation: persistent HUD elements are concealed while the contextual Enter memory button remains actionable. Escape opens the existing side pause menu with a new Controls guide. Its modal is integrated into existing focus/input ownership; Back/Escape returns to Pause and restores focus. The hub/Opportunity atmosphere uses an optional dusty shader path with broad direction-space dust veils, warm horizon/ceiling colors, matched fog, sky environment and fill. The legacy repair atmosphere retains its prior branch. No assets, renderer or dependencies were added.

Checks: production build/typecheck and all 43 existing automated checks pass. Twelve headed Chromium checks pass in the actual Vite game: removed overlays; world input frozen in Controls; guide text/buttons fit at 1440×900, 1366×768, 390×844, 320×568 and 568×320; Escape to Pause, restored focus, second Escape to resume; hub movement and Opportunity scene load; no uncaught JavaScript errors. Sky appearance was visually inspected in native captures for both the hub and Opportunity. No performance or owner-acceptance claim follows from these checks.

Evidence in this directory: `hub-sky.png`, `opportunity-sky.png`, and `controls-1440x900.png`, `controls-320x568.png`, `controls-568x320.png`. All are actual runtime captures, not concept renders. One-off browser scenario retained in ignored `work/dust-sky-controls-review.js`. Existing large-bundle warning remains. The guide is intentionally simple pending the user's later control-design pass. Terrain, spirit art, missions, saves, sound and main menu background are unchanged by this revision.
