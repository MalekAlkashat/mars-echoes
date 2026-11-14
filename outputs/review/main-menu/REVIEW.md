# Main menu and settings review

14 November 2026. Branch `codex/m3-main-menu`, based on `origin/main` at `8d200b1`. Local work is not committed or user-accepted.

## Requested direction

The menu stays fixed and vertically centered, with left alignment and the supplied Mars landscape. The user's Ghost of Tsushima and Cyberpunk settings references guide selection highlights, category tabs, aligned rows and controls. Retain the Mars amber/brown palette. No Credits option. No scrolling or positional hover animation in the main menu.

## Implementation

- Replace the menu's scroll container and content minimum height with a fixed viewport frame and responsive spacing. Hover/focus changes color and highlight without moving buttons.
- Replace the tall settings form with Display, Sound and Accessibility tabs. Each has two compact rows, a fixed footer and no scroll container. Use graphics preset arrows, styled switches and a custom range track/thumb rather than native select/checkbox decoration.
- Keep large-text, persisted preferences, keyboard tab navigation and Escape/back. Hidden category controls are excluded from the focus trap. Conceal menu lettering behind settings and confirmation dialogs.
- Keep Continue disabled until scene preparation finishes. Previously an immediate Continue after reload could skip readiness and leave New Game disabled on returning to the menu. Set readiness before focusing the primary menu action.

## Observed browser checks

Actual Vite development game at `http://127.0.0.1:5182/`, headed Chromium controlled through the temporary Playwright CLI. No project dependencies were added. Test browser storage is separate from the user's regular browser.

Viewport sizes: 1440×900, 1366×768, 1024×600, 390×844, 320×568, 844×390 and 568×320.

- Main menu remains fixed after wheel and Page Down input. No document/menu scroll, offscreen menu controls or settings-body overflow at these sizes.
- All three settings categories fit at every size with standard and larger interface text. Three-option Continue/New Game/Settings menu also fits at every size.
- Graphics cycles Balanced → High → Low → Balanced; runtime render caps change to 60/30 as expected. Volume keyboard adjustment, mute, reduced-motion and large-text switches work; preferences survive reload.
- Tab arrow navigation, focus trapping among visible controls and Escape returning focus to the Settings action pass.
- New Game goes directly into the existing hub; actual W movement, Escape pause, pause settings, menu return, Continue, save-protection confirmation and a confirmed fresh start pass. Continue after reload restores the saved hub position.
- No uncaught JavaScript errors observed. The initial load logged the existing renderer shader precision warnings and a favicon 404; later reloads had no console errors.
- The automated browser refused fullscreen despite advertising API support. The explanatory fallback was verified; successful native fullscreen entry/exit is not claimed.

Production build/typecheck and all 33 existing automated tests pass. Vite retains its existing large-bundle warning. These checks do not establish final art acceptance, mobile device performance, audio quality or completion of the satellite cinematic.

## Captures and local reproduction

Original PNG captures in this directory: `before-menu-desktop.png` (settings), `before-menu-mobile.png`, `menu-1440x900.png`, `menu-390x844.png`, `menu-568x320.png`, matching `settings-…` captures, and `menu-with-continue-desktop.png`. These are actual runtime captures, not concept renders. The supplied backdrop is low-resolution; it has not been regenerated.

One-off browser scenarios are in ignored scratch files `work/menu-layout-review.js` and `work/menu-flow-review.js`. Review images and these scripts remain local under the repository's existing ignore rules.
