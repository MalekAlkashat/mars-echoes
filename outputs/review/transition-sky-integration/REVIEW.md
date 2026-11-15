# Transition and visible-sky integration

15 November 2026. Prepared in `work/transition-sky-integration`, branch `codex/integrate-transition-sky`, from main **ac65d6e**. This combines the completed `journey-polish` and `visible-sky-only` candidates without changing their worktrees or indexes. The discarded atmosphere-wide experiment is excluded.

## Result and integration

The existing continuous campaign, Robot Journal, automatic ending, centered Mission I photograph, chapter saves and rewards remain intact.

- Internal chapter preparation retains the authored cinematic mask and accessible Cancel. Delayed feedback appears after 2.5 active seconds; user pause survives destination activation, failure and cancellation.
- The final return uses the accepted blue spirit and silent rover in a two-subject composition, then restores the saved camera exactly before the existing ending begins. Reduced motion and narrow layouts use the candidate's corresponding treatment.
- Missions I and II reuse the hub's visible sky palette/gradient/cloud shader. Original light positions/intensities, shadows, fog, reflection probes, terrain, surface materials and renderer settings are preserved. Mission I's scientific close-up background remains intentional. Purgatory retains its authored warm horizon fog/reflections.
- No new dependency, archival-media edit, global graphics preset, second renderer/loop/input service or public deployment is introduced.

The feature snapshots are **2dba066** (transition polish) and **e878eb0** (visible sky) in this integration branch. Their sole merge conflict was the adjacent review-evidence blocks in `.gitignore`; both were retained.

### Preparation-clock correction

Combined controlled-load QA exposed a real frame-cap edge case: a throttled callback reset `lastTime` while preparation UI was still supposed to advance. At the observed cadence, the waiting clock stayed at zero and its delayed message never appeared. The integration changes the reset guard to exclude active cosmetic preparation. Normal paused/frozen views still reset timing; missions and rendering remain frozen during asynchronous preparation.

A production regression run now verifies both low (30 FPS preset) and balanced (45 FPS preset): the message appeared at 2.503 / 2.509 active seconds, paused without advancing, and a destination completing during pause remained paused. This is a UI-clock check, not a measured FPS/GPU benchmark. The original candidate files remain unchanged.

## Verification

Supported cached **Node 22.23.5**: **144/144 tests**, TypeScript and Vite production build pass. The existing approximately 778 kB shared-bundle advisory remains. Package/lockfile are unchanged; installed dependencies were copied from the same-lockfile main checkout without installing packages.

The final source received:

- A fresh isolated production New Game through native Mission I investigation, one centered NASA reveal, Purgatory recovery/images, OVERTIME, the 16-second storm/conservation/archive, final reveal, automatic ending, Journal, real PNG photography and saved Continue. No forced chapter phases or synthetic time advancement were used for this full journey; no page/required-request errors occurred.
- Controlled slow preparation at all three boundaries: authored UI, waiting feedback, immediate cancellation and pause carried through activation without generic-modal focus theft.
- Actual blocked archival-image failure/retry, final-hub failure/retry, cancellation with late completion, boundary reload, Skip and prior-reward preservation.
- Held W/Shift/E isolation across entry, paused failure/cancel focus recovery, incoming restart and absence of leftover bridge UI.
- 390×844 touch emulation with large text, reduced motion, focus loss and final Skip; no horizontal overflow or premature ending over the reveal.
- Nine native desktop hub/Mission I/Mission II sky views, including camera rotation; Mission I macro pause and outdoor restart restoration.
- Six alternating Mission I/II entry/abort/return cycles, with all six returned hub samples at 30 geometries / 26 textures / one loop. Active low-preset field samples were 53 draws / 240,820 rendered triangles for Mission I and 36 / 176,414 for Mission II; these include renderer passes, not unique geometry or GPU timing. Exact samples are in `checks.json`; they are bounded cleanup evidence, not indefinite leak or hardware-memory certification.

[Machine-readable checks](checks.json) · [source/test/lock fingerprints](source-sha256.json) · [original recording provenance](recordings.json).

Native captures: [Mission I sky](mission-one-sky.png), [Mission II sky](mission-two-sky.png), [scientific close-up](mission-one-macro.png), [delayed preparation](slow-load-message.png), [desktop return](return-desktop.png), [touch return](return-touch.png). These are unretouched game screenshots. Raw runs/scripts/videos remain under this worktree's ignored `work/qa/`; the full final run is `combined-final/`.

The inherited specialist reports retain their original candidate/base/test counts and historical unmerged wording. This combined report and source fingerprints identify the integrated result. Existing valid specialist evidence is reused; no parallel runtime test framework was added.

## Preservation and publication

Ignored audit: `C:/Nasa 2026/mars-echoes/work/transition-sky-integration-audit/`. It retains main's original 39 changed/untracked file bytes and staged patch, both complete candidate fingerprints, snapshot metadata and final preservation checks. Main's 35 staged resource additions are outside these commits. All three existing stash identities/order/messages and both original candidate heads/index diffs/file contents are preserved.

Publication uses a normal fast-forward of main and ordinary push after checking the current remote; no shared branch switch, reset, stash application, force-push or deployment is required. The final parent-workspace `MAIN_CHAT_CONTEXT.md` records the resulting main revision and publication state.

Production candidate: [loopback 5283](http://127.0.0.1:5283/). Development fault/cleanup checks: loopback 5282. Other chats' previews were preserved.

## Limits and failed attempts

The first Chromium launch was blocked by the execution sandbox, and an external browser could not reach its sandbox-hosted server. Approved loopback-only previews and an isolated browser resolved that setup problem with Chromium's sandbox enabled. One regression attempt started before a rebuild had finished and received a temporary HTTP failure; it was rerun only after build completion. Failed setup attempts and the original waiting-clock failure are not counted as passes.

Sky comparison is desktop evidence. Touch checks are browser emulation. Physical phones, accessibility-user/comprehension testing, other hardware/browsers, comparative GPU/thermal performance and indefinite leakage remain unverified. Existing initialization stalls may still occur under the authored mask. Artistically matching a visible sky while preserving separate light/fog/probe setups is not a calibrated historical atmosphere. Final cinematic/art judgment remains the user's.
