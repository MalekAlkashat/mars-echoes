# Mars Echoes (working name)

A Three.js narrative game in development: a spirit explores Mars, enters abandoned equipment and lives through its past mission, then returns to the present. The hackathon target is one complete rover story with cinematic time jumps. The title and spirit appearance are provisional.

Start with [ROADMAP.md](ROADMAP.md) for the current vision and development stages. Read [CONTRIBUTING.md](CONTRIBUTING.md) before parallel work. AI contributors also read [AGENTS.md](AGENTS.md).

The local build command below is verified. A GitHub Actions build template is prepared at `outputs/planning/build-workflow.yml`; it is not installed as an active workflow because the current GitHub login lacks permission to publish workflows. Repository code can still be pushed and shared normally.

## What runs now

`game/` contains the preserved rover-only v2 prototype, not the spirit/memory game yet. It includes driving, optical repair, a relay call and reset. The baseline is tagged `rover-v2-baseline`; current source and baseline have the same gameplay until migration begins.

Use Node.js 22.12 or newer, then from the repository root:

```sh
npm --prefix game ci
npm --prefix game run dev -- --port 5173
```

Open the address printed by Vite. WASD drives; drag or arrow keys look; scroll changes camera distance; E interacts; F briefly shows the optical feed. Repair uses WASD position, Q/E rotation and Enter insertion. Escape pauses; R restarts.

Build and serve the production version:

```sh
npm --prefix game run build
npm --prefix game run preview -- --port 5174
```

Runtime assets are local. No generation account or paid service is needed to run the prototype. The current build is silent; sound and the new story/movement are planned work. Historical visual and behavior evidence is in `outputs/review/visual-pass-v2/REVIEW.md`; larger captures and packaged ZIPs remain local and are intentionally excluded from Git.

## Sources and repository contents

- `game/src/`: current executable source. The modular destination is documented in the roadmap; it has not been applied yet.
- `game/public/assets/`: runtime GLBs and surface maps.
- `assets/vendor/`: original Kenney, Poly Haven and unused NASA material, with source and rights records. NASA's rover is not used in the game.
- `outputs/assets/`: selected design references; acceptance of an image does not imply approval of its procedural model.
- `outputs/planning/`: architecture, asset provenance, decisions and contributor handoffs.
- `.agents/`: retained project workflows and their source/license records. Read only the workflow relevant to a task.

Kenney and Poly Haven assets are CC0; their exact origins are recorded beside the originals. Three.js and other installed packages retain their own licenses in the dependency distribution. The NASA model follows its recorded NASA usage terms rather than a blanket CC0 claim. Project Endurance and Fortnite inform selected references; their code, characters and artwork are not imported into the game. No project-wide open-source license has been selected.
