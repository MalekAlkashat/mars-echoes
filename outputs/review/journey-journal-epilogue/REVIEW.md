# Continuous journey, Robot Journal and automatic ending

15 November 2026. Combined in `work/journey-journal-epilogue`, branch `codex/integrate-journey-journal-epilogue`, from main **b028e01**. Original worktrees and their uncommitted indexes were preserved; isolated snapshot commits supplied the actual candidate contents, including the slideshow revision on top of cf8bf4f.

The normal player route is now **hub → Blueberry Clue → Purgatory → OVERTIME → Long Night → one spirit return → automatic ending**. The Robot Journal replaces Skills, retaining sourced robot connections, discovery, recorded chapters and photography. Explicit chapter replay stays separate from an unfinished journey. The latest ending is an automatic 39-active-second slideshow/departure with Pause, Skip, replay, credits and exploration/menu actions; it has no quiz or W gate.

## Conflict resolution and behavior

- Combined journey checkpoints, encounter state and optional finale state in version-2 saves; retained old valid saves and former quiz-save migration. New Game clears all three systems together.
- Preserved intermediate chapter-boundary recording and the original journey bookmark. Final SUNLIGHT, story completion and the epilogue wait for a **successful hub return**. Failed return, retry, cancellation and standalone replay cannot prematurely initiate an ending over an unfinished journey.
- Kept Journal notifications tied to committed chapter/discovery changes. The Journal stays in the pause flow and never opens automatically. Existing photography and sourced links remain.
- Preserved Purgatory's consumed-action cancellation fix and journey-aware Continue/OVERTIME action.
- Added a small cinematic-boundary capability to the existing scene interface. Normal internal preparation keeps the authored mask visible instead of showing the generic loading dialog. Genuine errors still show Retry/Cancel; the visible Leave action and Escape can cancel preparation. This adds no renderer or input listener.
- Retained the latest epilogue's private effect disposal, automatic departure, focus-loss pause behavior and static completed-screen rendering suspension. Hub cleanup removes the selector, epilogue and private flame resources.
- Kept the approved a38322f terrain, teammate flame, existing chapter assets, NASA pixels, dependencies and graphics policy.

## Actual verification

**135 tests pass**, supported Node 22.23.5 TypeScript and Vite production build pass. The new combined regression checks that a saved final return boundary retains Journal progress while SUNLIGHT/finale remain unawarded until return. The former journey assertion granting SUNLIGHT before hub recovery was deliberately changed to the combined transactional behavior.

Production preview: **http://127.0.0.1:5245/**. Development/fault diagnostics: port **5244**. Both serve this isolated integration, not the older source candidates. Build is `game/dist/`; no deployment is implied.

### Full production desktop journey

Actual keyboard/pointer input at 1440×900, balanced graphics:

1. Empty ephemeral storage → New Game → visible opening grains → real hub traversal.
2. Full Mission 1 approach, brush, held grind, comparison, water reconstruction and dry evidence; direct bridge to Purgatory without hub return.
3. Actual held-W recovery, unchanged NASA imagery and reflection; OVERTIME then direct Long Night entry.
4. Conservation choices, naturally paced storm (**16,007 ms**), silence, archive, recovery and legacy; one hub return with GRIND/SAND/OVERTIME/SUNLIGHT and no fabricated prototype completion.
5. Automatic ending, opening Journal while paused, all three robot records, actual nonempty PNG download, completion and saved Continue without forced ending replay.

No page errors or HTTP error responses occurred. A DOM observer recorded **no generic preparing-scene popup during cinematic boundaries**. `full-runtime.json` records the actual result; its production-mode metadata corrects an inherited old-port heuristic, while raw original output remains under `work/combined-qa/full/`.

Native screenshots: [initial exploration](01-fresh-hub.png), [rock bridge](bridge-1-rock.png), [wheel arrival](bridge-1-wheel.png), [OVERTIME](bridge-2-years.png), [Journal](journal-complete.png), [completed ending](ending-complete.png). Original full-speed WebM recordings remain under `work/combined-qa/full/video/` and are not added as large Git binaries. No fabricated frames or synthetic simulation advancement were used for the full route.

### Targeted transaction, continuation and touch checks

`edge-checks.json` uses explicitly seeded valid checkpoints for focused coverage:

- Chapter-boundary pause/reload/Skip and exact Purgatory pose/soil continuation.
- Blocked next-chapter image → visible failure → Retry, retaining only earned progress.
- Delayed preparation keeps the cinematic mask, remains cancellable, then allows leaving and resuming the saved journey.
- Injected final hub-load failure leaves SUNLIGHT/finale absent. Successful Retry commits both, and the pending ending survives reload and Skip.
- Production touch at 390×844, low graphics, large text and reduced motion: held Purgatory recovery, ending, pause, Journal, sources/credits and Skip fit without horizontal overflow.
- Six native standalone replay/abort/return cycles keep one Journal, no leftover journey overlay and **30 geometries / 26 textures / one loop** in every sampled returned hub.

These are bounded resource checks and browser touch emulation, not physical-phone, GPU-memory or indefinite leak certification. The full desktop captures precede only an ASCII correction to the pending-load label; targeted checks used the rebuilt final source. Initial sandbox/loopback access failures and a fault-injection harness that retained its failure URL across reload were resolved; those failed attempts are not counted as passes.

The original candidate reports are retained as historical evidence. This combined report and source hashes supersede their unmerged status and old UI/quiz claims. Source fingerprints are in `source-sha256.json`; reproduction scripts and raw logs are under `work/combined-qa/`.

## Preservation and limits

Audit: `C:/Nasa 2026/mars-echoes/work/full-integration-de74/`. Main's **39 pre-existing local files**, exact **35-path staged resource diff**, all **three stashes**, and the original source worktrees' heads/indexes/dirty-file bytes were checked unchanged before main integration. Snapshot/content audits retain the source identities. The shared checkout's branch was not switched, and no original stash was applied or dropped.

Existing bundle advisory remains (about **777 kB** minified shared main chunk); no new dependency or performance-preset change was made. Native captures establish readable tested layouts, not owner aesthetic acceptance. Physical-device, accessibility-user, thermal/low-end/GPU performance and exhaustive camera/contact coverage remain open. Halo, broader map, additional audio and public release acceptance are outside this integration.
