# Mars Echoes (working name)

Explore present-day Mars as a spirit, enter Opportunity's memories, then return beside the silent rover. The default Opportunity memory now plays all three chapters continuously, followed by one spirit return and an automatic cinematic ending. Standalone chapter replays remain available in the existing Three.js/TypeScript/Vite runtime.

## Run and play

Use Node 22.12 or newer. From this repository:

```sh
npm --prefix game ci
npm --prefix game run dev -- --port 5180 --strictPort
```

Start New Game, cross the valley and enter Opportunity’s full memory journey. The chapter selector also offers standalone replays. WASD moves/drives; drag or arrows look; Escape pauses. Restart is a deliberate pause-menu action. Existing saves, settings and PNG photography remain available.

- **The Blueberry Clue:** approach, brush, hold E to grind, compare separate observations and watch the labeled ancient-water interpretation. The completed chapter boundary records GRIND in the Robot Journal.
- **Stuck in Purgatory:** cinematic entrapment, hold W for metered recovery, optional planning and unchanged, labeled NASA images. The completed chapter boundary records SAND; the OVERTIME bridge leads into 2018. Touch uses the existing direction pad.
- **The Long Night:** drive to observe, make illustrative conservation choices during a 16-second storm, then follow silence, archival evidence and the later recovery campaign. Successful return records SUNLIGHT.

The full journey advances Blueberry Clue → Purgatory → OVERTIME → Long Night without intermediate hub returns. Continue resumes the unfinished journey. Final SUNLIGHT/story completion and the ending start only after the hub return succeeds. The 39-second ending advances automatically, supports pause/Skip/replay and preserves earned memories; it has no quiz or movement gate.

Pause → Journal opens sourced robot connections, recorded chapters and photography. Old valid saves remain supported. Chapter replays do not fabricate other completions or finish an unfinished journey. Purgatory retains pose/soil checkpoints. Halo, a broader map, audio, physical-device testing and final artistic/release acceptance remain separate work.

Developer previews use the production factories and do not overwrite the normal saved journey:

| Query | Experience |
| --- | --- |
| `?mission=blueberry-clue` | Mission 1 |
| `?mission=purgatory` | Mission 2 |
| `?mission=long-night` | Mission 3 |
| `?scene=mars-hub` | Hub |
| `?scene=episode-rover-01` | Opportunity drive preview |
| `?scene=episode-rover-01&prototype=repair` | Preserved fictional repair/call prototype |

The earlier `?scene=episode-rover-01&slice=purgatory` link remains an alias. The fictional prototype is not Opportunity history.

```sh
npm --prefix game test
npm --prefix game run build
npm --prefix game run preview -- --port 5181 --strictPort
```

The static build uses local runtime assets without a generation account. The existing large-bundle advisory remains. See [combined journey/journal/ending verification](outputs/review/journey-journal-epilogue/REVIEW.md) for verified scenarios and limits. A local build does not establish deployment or remote CI acceptance.

## Ownership and provenance

Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md) and the integration handoff before editing. Older roadmap paragraphs retain historical status snapshots.

- The integrator owns `app/`, `core/`, bootstrap, registry, shared UI and dependencies. `app/contracts.ts` defines the shared boundary. Keep one renderer, loop and input service.
- Hub/spirit code owns exploration. Each chapter owns its directory under `scenes/episodes/rover/missions/`; coordinate shared vehicle/environment changes.
- The default hub restores the approved a38322f trough terrain and cold sky; reference100 remains an explicit alternate. Contact is geometric, not rigid-body simulation or measured Mars elevation.
- The selected NASA MER model is used. Final mast/arm articulation is unfinished. The teammate’s blue flame spirit is integrated, with solid collision, bounded leap, Shift rush and a world-space wake. The separate abandoned comet experiment remains excluded.
- Mission reference packs retain claim ledgers and rights. Runtime NASA images remain unchanged and labeled. Earth material analogues are not Mars scans.

Retain originals, SOURCE records, item-specific rights and credits. NASA-hosted material is not automatically CC0. Kenney/Poly Haven and dependency licenses remain with their assets. [AI_USE.md](AI_USE.md) records assistance. A project-wide license and final release acceptance are not established here.
