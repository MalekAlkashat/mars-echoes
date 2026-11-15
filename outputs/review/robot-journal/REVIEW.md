# Robot Journal — implementation handoff

15 November 2026 · Asia/Riyadh. Implemented candidate, agent-verified; owner visual acceptance and integration are separate.

The pause menu now opens **Journal**, a compact archive of Opportunity, Spirit rover and Ingenuity. Finding Opportunity reveals its record. Committed chapter returns add memories and sourced connections, accompanied by a small notice. The journal never opens automatically. Photography remains available from its fixed footer.

## Checkout and preview

- Worktree: `C:/Nasa 2026/mars-echoes/work/robot-journal`
- Branch: `codex/robot-journal`
- Base: `6eef598019efa8500d5b66db1be92720647a3cc9`
- Changes are **uncommitted in this isolated worktree**. No merge, push or deployment.
- Production: **http://127.0.0.1:5231/** — New Game / Continue → Pause → Journal.
- Development: http://127.0.0.1:5230/ (existing development diagnostics and failure injection).
- Both task-owned servers remain running. Existing servers and shared checkout were preserved.

Actual production launch, from this worktree's `game/` directory:

```powershell
& 'C:\Users\Yooms\AppData\Local\npm-cache\_npx\52027bd8fc0022aa\node_modules\node\bin\node.exe' node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5231 --strictPort
```

With Node 22.12+ on PATH, equivalent: `npm --prefix game run preview -- --port 5231 --strictPort` from the worktree root. Actual checks used Node **22.23.5** and the already-installed Vite **7.3.8** / TypeScript; no package or lockfile changes.

## Final design

The existing Bahnschrift/system font stack, charcoal surface, off-white text, square controls and warm selected rule carry into the archive. Desktop has a left record rail and a scrolling reading pane; phones use three compact selectors above it. Header and Back/photography footer stay visible. Sources expand within the reading pane and are reachable by keyboard. There is no graph, map, currency or upgrade system.

Opportunity uses the existing, unchanged PIA07984 wheel photograph, contained at its native aspect and credited. Spirit and Ingenuity use deliberately restrained initials with “Image not recorded”; no suitable reviewed portraits were present in the inspected runtime assets. Unknown slots expose no robot name, photograph or accessible identity. Future locations remain unrecorded in the player's knowledge, explicitly distinguished from NASA's documented historical locations.

Opportunity was implemented and inspected at 1440×900 and 390×844 before reviewing the expanded records. Iteration removed a notification showing behind the panel, made the surface opaque, reduced the large-text mobile fallback's footprint, and removed redundant rendering when opening an already-paused menu. Selected state, unknown state, sources and unavailable imagery were inspected in actual rendered game captures.

## Progress and shared interfaces

- Discoveries are derived by `journalRecords()` from `session.chapters`, not from a new reward ledger. Existing `grind`, `sand`, `sunlight` IDs remain compatible save data.
- There was no persistent encounter state in the base. Added optional `opportunityEncountered?: boolean` to version-2 saves and a session boolean. The real hub interaction radius calls idempotent `encounterOpportunity()`; it is retained after walking away and reload.
- Old valid chapter-completed saves derive the corresponding records immediately. A saved episode or legacy completed visit proves an Opportunity encounter, without inventing chapter completion. Arbitrary roaming bookmarks do not prove one. New Game clears encounter and journal emphasis.
- `GameSession.onJournalUpdate` is a single event callback, owned and detached by Game. Notifications occur only for a new encounter or new committed chapter. Replays do not repeat them. Unread emphasis is visit-local; it is not another saved progression field.
- `SceneDirector` is unchanged. Its successful-return transaction remains the authority for recording. Chapter completion is still separate from full-story/legacy completion.
- Fixed a pre-existing cancellation bug found by the native fault test: Purgatory retained `overlay.action === 'return'` after a failed return. Cancelling could submit that click again and commit completion. The candidate now consumes the action before requesting the transition. Retry still commits once; cancellation waits for fresh input.
- MainMenu retains pause ownership, inert backgrounds and its existing single keyboard listener. Its focus trap now includes visible source links, disclosure summaries and the reading pane. Back/Escape returns focus to Journal in the pause menu. Resume remains deliberate.
- No new renderer, canvas, frame loop, global listener set, framework or dependency. Journal content rebuilds on open, selection or discovery events only. Hidden UI has no animation; the transient notice uses one cleaned-up timeout.

## Verification actually performed

| Check | Result / evidence |
| --- | --- |
| Automated tests | **117/117 passed**, including six focused journal tests for discovery, v1/v2 compatibility, per-chapter mapping, failure/retry/replay and cancellation. Raw output: local `tests.txt`; command below. |
| TypeScript / production build | Passed on supported Node. Final main chunk about 763.08 kB / 205.31 kB gzip; existing large-chunk advisory remains. |
| Fresh normal journey | All identities hidden before encounter; real W traversal reveals only Opportunity. All three missions completed through normal UI; each committed return exposes exactly its memories/connections. Purgatory pose/soil save and Long Night archive Continue preserved. Long Night storm measured 16,004 ms. `journey/runtime.json`. |
| Old saves / reset | Old completed v2 save fills all three records without a new notification. Legacy v1 visit reveals Opportunity but no chapters. New Game clears discovery. Encounter survives walking away, save and reload. `interface.json`, `final-smoke.json`. |
| Failure / retry / cancel / replay | Native development failure injection using a genuine captured Purgatory end checkpoint; no recording on failed return, Retry records once, Cancel then abort records none. A repeated completed return gives no duplicate entry/notice. `transactions.json`. Unit tests cover each chapter and in-flight cancellation. |
| Photography | Actual PNG downloads from the current game view in full journey and interface checks. Local `photograph.png`. No journal reward required. |
| Keyboard / focus / pause | Source links and summaries included in focus loop; focus stays in dialog; Escape restores Journal button in pause. Held W while open leaves world position and render count unchanged. |
| Touch / layout / preferences | Actual Playwright touchscreen taps and CDP touch swipe at 390×844; 320×568 large-text stress check, 844×390 landscape, reduced motion, settings toggles, reload. Required header/rail/reading area/footer fit numerically and visually; reading area intentionally scrolls. |
| Repeated openings | 25 open/select/close cycles: **268 DOM elements, 1 journal, 30 geometries, 26 textures, 1 loop**, unchanged before/after. Paused frame count stayed 4; position stayed `0.00,-23.04`. Dev counters, `interface.json`. This does not measure spare GPU capacity. |
| Assets / console | Normal checks recorded no page errors or failed HTTP responses. Deliberately blocked image displayed an honest unavailable caption. External source links were verified separately with primary-source browsing. |

Commands from worktree root (using the Node executable above):

```powershell
node --experimental-strip-types --test game/tests/*.test.ts
node game/node_modules/typescript/bin/tsc --noEmit -p game
# Run Vite build from game/: node node_modules/vite/bin/vite.js build
```

Task-local browser harnesses: `work/qa/journey.cjs`, `interface.cjs`, `transactions.cjs`, `final-smoke.cjs`; installed Playwright with `PLAYWRIGHT_BROWSERS_PATH=C:\Users\Yooms\AppData\Local\ms-playwright`. Browser launches required an approved sandbox escalation; all tests used new isolated contexts, never user browser storage. The full journey predates the final source-link/ARIA additions and consumed-action fix; the affected return path, interface and final production smoke were checked separately after their respective changes. Final tests/typecheck/build passed after the runtime fix. Source fingerprints are in `source-sha256.json`.

## Captures and recording

Actual game rendering, not generated mockups. Desktop uses 1440×900 Chromium; mobile is Chromium touch emulation, not a physical phone.

- [Opportunity](desktop-opportunity.png), [Spirit](desktop-spirit.png), [Ingenuity](desktop-ingenuity.png).
- [Phone / large text](mobile-spirit-large.png), [320px stress view](mobile-320-large.png), [landscape](mobile-landscape.png).
- [Normal-speed interaction recording](interaction.webm): **7.60 seconds**, original 1440×900, 25 fps Playwright WebM; no speed changes or re-encoding. Uses an isolated older completed save to show selection, sources, closing and photography.
- Raw baseline/representative/journey captures and longer journey video remain local in this review directory; selected captures and compact JSON reports are allowed by `.gitignore`.

## Changed paths and integration notes

New: `game/src/content/robot-journal.ts`, `game/src/ui/robot-journal.ts`, `game/src/ui/robot-journal.css`, `game/tests/robot-journal.test.ts`, `outputs/planning/robot-journal.md`, this review/evidence.

Modified: `game/index.html`; `game/src/app/{Game,session,save}.ts`; `game/src/ui/main-menu.{ts,css}`; `game/src/scenes/mars-hub/index.ts`; `game/src/content/{blueberry-clue,long-night}.ts`; `game/src/scenes/episodes/rover/missions/long-night/index.ts`; Purgatory `index.ts` and `sequence-ui.ts`; `.gitignore`; `AI_USE.md`. Removed obsolete `game/src/ui/skills.ts` and its unused CSS. `SceneDirector.ts`, contracts, registry, mission maps, controllers, assets and dependencies remain untouched.

Transition work (`codex/continuous-journey`) and epilogue work (`codex/opportunity-epilogue`) started concurrently from the same base. Reconcile shared Game/session/save/hub and ending-copy hunks at integration; do not overwrite either checkout. Keep chapter commits transactional if the journey changes its return topology. The journal is currently entered through pause; an epilogue's new navigation should use this same UI, not duplicate its state. Do not interpret the journal's three memories as full-story completion.

Shared main was still `6eef598` at the final check. Its 35 staged resource paths and three original stashes were still present; this task did not modify their index, files or stash contents. Parent coordination context was not overwritten.

## Limits

No owner aesthetic acceptance, physical-phone testing, screen-reader user testing, GPU/thermal profiling or broad device performance certification. No Spirit/Ingenuity portraits are claimed; their intentional typographic fallback is complete for this scope. Locations and playable stories for those robots remain future work. No new historical claim is awaiting verification in the shipped journal copy; supporting evidence and caveats are in [SOURCES.md](SOURCES.md). Integration with the separately authored continuous journey and epilogue is not performed or claimed here.
