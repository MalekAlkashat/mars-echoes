# Rover game workspace

Current direction, 14 November 2026: root `ROADMAP.md` supersedes this earlier rover-only overview. The player now explores Mars as a spirit, enters abandoned equipment, plays its past mission and returns to the spirit. The first episode is the rover's complete mission-to-shutdown story with cinematic time jumps; its original assignment is undecided. The source is still the preserved rover-only v2 prototype. The older context below does not mean the new loop is implemented.

The project is set up at:

`/Users/morshu/Documents/Codex/2026-11-11/https-youtu-be-czsnialtgwq-si-s9rjjxd2ai8bkvlb-3`

## Where things live

| Folder | Purpose |
| --- | --- |
| `.agents/skills/` | Nine imported game-planning, reference, modeling and review workflows with their supporting resources. |
| `outputs/planning/` | Living game plan, asset brief, installation record and image provenance. |
| `outputs/assets/` | Rover concepts, side/top references and deterioration studies; environment concepts are added here. |
| `assets/` | Reserved for usable model, texture and sound assets. |
| `game/` | Reserved for the Three.js game source. No gameplay is implemented yet. |
| `work/` | Scratch files and the downloaded upstream source. |

## Installation evidence

The nine local workflows were checked against upstream revision `cf1e1260253a61499dc67fe2332a330bf1b85c14`: all 378 imported files matched. Root licenses and attribution were preserved beside the imported workflows. These are project-local installations; the full Mr. Mak desktop application was not installed.

The workflows cover planning, handoff, image references, character sheets, procedural Three.js modeling, materials, level design and gameplay review. The fal.ai workflow was included to preserve referenced dependencies. The user has since installed and connected the fal plugin separately. Tripo CLI 0.9.0 is also prepared locally for a segmented-model pilot; its dry run passed, but developer-account sign-in and actual generation remain outstanding.

## Current creative decisions

One development day, two people assisted by AI, Three.js, direct driving/look/tool controls. Grounded cinematic machinery with expressive twin optical lenses. The rover wakes discarded after automated decommissioning, in stage-two deterioration, and first recovers an optical module. Emotion is mostly movement and sound, with minimal text.

Next: develop orange, Mars-like terrain that feels harsh, cold and sad; select the environment reference; then prepare usable rover/map assets before scene implementation.
