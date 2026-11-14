# Mars Echoes (working name)

A Three.js narrative game in development: a spirit explores Mars, enters abandoned equipment and lives through its past mission, then returns to the present. The hackathon target is one complete rover story with cinematic time jumps. The title and spirit appearance are provisional.

Start with [ROADMAP.md](ROADMAP.md) for the current vision and development stages. Read [CONTRIBUTING.md](CONTRIBUTING.md) before parallel work. AI contributors also read [AGENTS.md](AGENTS.md).

The local build command below is verified. A GitHub Actions build template is prepared at `outputs/planning/build-workflow.yml`; it is not installed as an active workflow because the current GitHub login lacks permission to publish workflows. Repository code can still be pushed and shared normally.

## What runs now

`game/` now has the actual owner-responsibility structure: shared application/input/assets/rendering services, a placeholder Mars hub and spirit controller, and an isolated rover episode. The default opens the hub. Approach its registered abandoned rover to enter the preserved repair/call sequence, then return to Mars. The earlier rover-only source is tagged `rover-v2-baseline`.

This proves the shared runtime and entry/return foundation, not the complete selected past mission. The original assignment, cinematic time jumps, eventual shutdown, final spirit art and sound remain unfinished. The spirit's procedural humanoid silhouette is a tentative placeholder.

Use Node.js 22.12 or newer, then from the repository root:

```sh
npm --prefix game ci
npm --prefix game run dev -- --port 5180 --strictPort
```

Open [the development preview](http://127.0.0.1:5180/) while that server is running. The default and `?scene=mars-hub` use the hub factory. `?scene=episode-rover-01` previews the rover episode directly through the same production factory.

- In the hub, click **Enter the graveyard**, use WASD to glide, Space to leap and E near the rover to enter. Obstacles remain solid; there is no phasing.
- In the rover episode, click **Wake the rover**. WASD drives; E interacts; F briefly shows the optical feed. Repair uses WASD positioning, Q/E rotation and Enter insertion.
- Drag or arrow keys look; scroll changes camera distance. Escape pauses; R restarts the active scene. The episode pause menu allows leaving early, and **Return to Mars** is available after its unanswered call. An early exit does not complete the sequence.

Run the automated checks:

```sh
npm --prefix game test
```

Build and serve the production version:

```sh
npm --prefix game run build
npm --prefix game run preview -- --port 5181 --strictPort
```

Open [the production preview](http://127.0.0.1:5181/) while that server is running. Runtime assets are local, and no generation account or paid service is needed to run the prototype. The build is still silent. Production build/typecheck and 23 automated tests pass. Native development-browser review passes the preserved rover sequence, return to Mars and ten additional aborted visits with stable returned resource counts; mobile, fault UI, production-browser review and stage-machine acceptance are tracked separately. Historical v2 evidence remains in `outputs/review/visual-pass-v2/REVIEW.md` and does not replace current review. Larger captures and packaged ZIPs remain local and are intentionally excluded from Git.

## Sources and repository contents

- `game/src/app/` and `core/`: the shared runtime, contracts, director, input, asset cache and presentation, owned by the integrator.
- `game/src/entities/spirit/` and `scenes/mars-hub/`: the hub author's actual source boundaries.
- `game/src/scenes/episodes/rover/`: episode-local factory, mission, HUD and layout. `entities/rover/` contains reusable machinery/control code; `environments/mars/` contains shared terrain and dressing.
- `game/src/content/equipment.ts`: stable wreck-to-episode registration; shared `ui/` contains presentation primitives/styles. `main.ts` is bootstrap only. `app/contracts.ts` is the authoritative contract for contributor work.
- `game/public/assets/`: runtime GLBs and surface maps.
- `assets/vendor/`: original Kenney, Poly Haven and unused NASA material, with source and rights records. NASA's rover is not used in the game.
- `outputs/assets/`: selected design references; acceptance of an image does not imply approval of its procedural model.
- `outputs/planning/`: architecture, asset provenance, decisions and contributor handoffs.
- `.agents/`: retained project workflows and their source/license records. Read only the workflow relevant to a task.

Kenney and Poly Haven assets are CC0; their exact origins are recorded beside the originals. Three.js and other installed packages retain their own licenses in the dependency distribution. The NASA model follows its recorded NASA usage terms rather than a blanket CC0 claim. Project Endurance and Fortnite inform selected references; their code, characters and artwork are not imported into the game. No project-wide open-source license has been selected.
