# Mission 2 "Stuck in Purgatory": references and level blueprint (Sprint 1)

15 November 2026. Worktree `work/mission-two`, branch `codex/mission-two`, base `main` at `548ce49`. Nothing is committed.

**Sprint 1 historical proposal.** The original planning statements below describe that sprint. A representative development slice was subsequently implemented in this worktree and its controls/pacing were repaired on 15 November; see `remediation-review.md` for current implementation, runtime evidence and remaining limits. This is still not an integrated chapter. The dimensional plan remains applicable; controls now support WASD plus optional command planning.

Files in this folder:

| File | What it is |
| --- | --- |
| `level-plan.json` | Marker manifest: frame, rover measures, mesh levels, ripples, zones, markers, cameras, route. Source of truth for the drawing. |
| `level-plan.svg`, `level-plan.png` | Dimensioned top-down plan drawn from the manifest. |
| `level-plan-checks.json` | 44 geometric checks run on the manifest (all pass). |
| `reference-board.html` | Dated reference board, self-contained. |
| `resource-catalog.json` | Every reference file as found on disk, with hash, size, category and dates; derived crops; palette samples. |
| `claims-ledger.json` | Claims ledger, revision sprint-1. |
| `sprint-0-audit.md` | Sprint 0 audit, moved here from `work/mission-two-sprint0`. |
| `tools/build_plan.py`, `tools/build_board.py` | Planning scripts. Not game code. |

## 1. What the references establish

Measurements are my readings of the pack originals. They are reference dimensions, not a survey.

| ID | Reading | Source | Confidence |
| --- | --- | --- | --- |
| M-01 | The overhead mosaic is 20 × 20 m at 1 cm per pixel, centred on the rover's camera mast | Tick labels printed on PIA07922 (−10.0 to +10.0, 100 px apart) | Read directly |
| M-02 | Track gauge reads 0.92 to 1.04 m; the model's is 1.06 m | PIA07922 against `rig-metadata.json` | Agreement within about 10% confirms the scale |
| M-03 | Ripple crests are sinuous, with junctions and dead ends, 2 to 4 m apart | PIA07922 | Visual reading, ±0.3 m |
| M-04 | Crests run within roughly 10 to 20 degrees of the direction of travel. The rover followed a trough and climbed the nose of a ridge. | PIA07922 and Figure 1 | Visual reading |
| M-05 | The last crest crossed lies 3.5 to 4 m before the stuck mast position, crossed at roughly 40 degrees | PIA07922; PIA07216 caption names this crest | Visual reading |
| M-06 | Ground is low along the entry tracks and higher to the south of the rover | PIA07922 Figure 1 (caption: about 70 cm between extremes) | Colour-coded figure, not a numeric model |
| M-07 | No rocks, outcrops or hills are visible anywhere to the horizon | PIA07216, PIA07999 | Direct observation |
| M-08 | Ground is much darker than the sky. Churned sand is brighter and redder than undisturbed soil and breaks into clods. | PIA07216 samples (below) | Study samples of an "approximately true-color" image |
| M-09 | Undisturbed soil carries fine dark granules and faint centimetre-scale secondary ripples | PIA07216 at native resolution | Direct observation |

Palette samples (mean encoded JPEG values in fixed boxes; not calibrated):

| Region | Hex |
| --- | --- |
| Sky | `#d8ae76` |
| Far plain | `#4d3722` |
| Undisturbed, mid distance | `#4d3521` |
| Undisturbed, near | `#563a23` |
| Between the tracks | `#5d4128` |
| Churned track | `#75482a` |

Ground luminance is about 32% of the sky's in encoded values.

## 2. Orientation, resolved from imagery

| Step | Evidence | Kind |
| --- | --- | --- |
| The rover entered rear-first | PIA07922 caption and the 6 May 2005 release: "driving backwards at the time" | Text, verified |
| The model's front is the mast and arm end | `opportunity-v1.glb`: mast at z −0.46 to −0.28, arm at z −0.50 to −0.22, with −Z as front | Asset measurement |
| On sol 446 the mast end faces the entry tracks | PIA07922: the camera origin sits nearer the track-side edge of the deck | Image observation |
| While stuck, the sundial end faces away from the tracks | PIA07216: the centre looks north along the tracks; the edges (opposite direction) show the deck with the sundial calibration target | Image observation |
| The rover left the way it came | PIA07999: the tracks stop at the trench heads and nothing continues beyond them | Image observation |
| After escape the sundial end faces the trap | PIA07999: the deck in the foreground carries the sundial | Image observation |

Conclusion: Opportunity entered with its rear leading and left by retreating along its own tracks with its front leading. "Backed out" in the 2019 education page describes the retreat, not reverse gear. No text source states this; it rests on the six rows above. The one assumption is that the rover did not turn around while mired, which the sundial rows support.

**Command language (recommended):** tiles use the rover's own frame, FORWARD and REVERSE, and every queued plan draws its predicted path on the ground before SEND. Practice and the replay drive then use REVERSE to travel south, with the caption about wheel lubrication. Recovery uses FORWARD to return north. The path preview removes any doubt about which way a tile moves the rover. The alternative is ground-relative tiles ("toward firm ground", "deeper into ripple").

## 3. The map

Frame: metres. +X east, +Z south, +Y up. Heading 0 faces north. The replay drive runs south.

![Level plan](level-plan.png)

| Element | Value | Basis |
| --- | --- | --- |
| Authored square | 60 × 60 m, x −30 to 30, z −34 to 26 | Brief: 60 to 80 m |
| Initial approach, spawn to trap | 24.2 m | Brief: 15 to 25 m |
| Practice lane | 6.0 m wide, 17.5 m long | Brief: 5 to 6 m. Rover is 2.28 m wide; pivot circle 2.82 m |
| Practice ripples R1, R2 | 0.10 and 0.14 m tall, 1.6 and 2.0 m wide, firm | PG-08: 10 to 15 cm |
| Last crest L | 0.12 m tall, crossed 3.6 m north of the stuck mast at 40 degrees | M-05 |
| Hero ripple H | 2.5 m wide, 0.33 m tall, 13.6 m long, axis 8 degrees off the track line, tapered northern nose | PG-03, M-04 |
| Hero mean face slope | 14.8 degrees | PG-08 reports "about 15 degrees on part of its face" |
| Soft footprint | Ellipse 2.5 × 4.8 m on the ripple body | Design: the ripple is the trap |
| Replay drive | 9.8 m, announced as the sol 446 drive | Compressed from nearly 40 m (PG-05) |
| Soft-sand travel to get free | About 2.3 m for the last wheels | Tuning |
| Recovery corridor | 5.0 m wide, 11.7 m long | Pivot circle 2.82 m |
| Recovery distance | 7.8 m, re-crossing L | Design |
| Command envelope | x −6 to 6, z −25.5 to 5.2 | Game rule: plans leaving it are refused with a reason |

Markers, in play order:

| Marker | Position (x, z) | Role |
| --- | --- | --- |
| `M-spawn` | (0, −22) | Start and establishing view |
| `M-practice-1` | (0, −18.5) | First plan: one straight drive |
| `M-practice-2` | (0.4, −13) | Across R1; planned and actual agree |
| `M-observe` | (0, −7.6) | End of practice, across R2. The replay starts here |
| `M-stuck` | (0.3, 2.2), heading 0.10 | End of the replay; all six wheels in the soft footprint |
| `M-deep-limit` | (0.3, 4.2) | Farthest south the rover can dig itself |
| `M-escape` | (0, −5.6) | All six wheels on firm ground north of L |
| `M-tracks-in` | polyline to the north edge | Static entry tracks (PIA07216) |

`M-observe` and `M-escape` overlap on the drawing; they are used at different times.

Background: the same low ripple field fades into a flat plain out to 400 m. There are no landmarks, because the reference shows none. The boundary is the command envelope, not a wall.

**Entrapment and agency.** The trap is not a choice. At `M-observe` the game announces the historical drive and runs it. Before that, the player plans freely on firm ground. After it, the player chooses what to inspect, what to send and when to revise.

### Terrain field (proposal for Sprint 2)

```text
world x, z (metres)
  → macro:   southward rise (about 0.35 m from z −10 to z 20), undulation under 0.05 m
  → meso:    four authored ripples + warped ripple field (2–4 m apart, 0.08–0.15 m tall in the north,
             up to 0.3 m in the south), with junctions and dead ends; flattened inside lane and corridor
  → derived: slope, crest proximity, softness (authored), disturbance (written by wheels)
  → channels: colour, roughness, normal, trench height
```

Named controls: `rippleSpacing`, `crestSharpness`, `southwardRise`, `crestDustLift`, `trenchDepth`, `bermHeight`. One field drives the mesh, the contact height and the material masks.

### Mesh levels

| Level | Cell | Rectangle (x0, z0, x1, z1) | Planned triangles |
| --- | --- | --- | --- |
| L0 field | 0.5 m | −30, −34, 30, 26 | 26,272 |
| L1 lane | 0.25 m | −4, −24, 4, −4 | 5,120 |
| L1 hero surround | 0.25 m | −6, −4, 6, 9 | 2,864 |
| L2 hero | 0.125 m | −3.5, −2.5, 3.5, 7 | 6,328 |
| L3 trench | 0.0625 m | −1.5, 0.25, 1.75, 5.5 | 8,736 |
| Vista | 5 rings | to 400 m | 4,800 |
| Stitching | fans | level borders | about 448 |
| **Total** | | | **54,568** (ceiling 58,880; 7.3% headroom) |

Each finer rectangle sits on its parent's grid lines, at least one parent cell inside it. Border cells are re-triangulated as fans, so there are no T-junctions. The wheel is 0.161 m wide, so L3 gives about 2.5 cells across a trench; Sprint 2 must show whether that reads at the inspection camera or needs a finer core.

## 4. Route

| Step | From → to | Mode | Ground |
| --- | --- | --- | --- |
| 1 | `M-spawn` → `M-practice-1` | Player plan | Firm |
| 2 | `M-practice-1` → `M-practice-2` | Player plan | Firm, crosses R1 |
| 3 | `M-practice-2` → `M-observe` | Player plan | Firm, crosses R2 |
| 4 | `M-observe` → `M-stuck` | Announced historical replay | Firm, crosses L, then soft |
| 5 | `M-stuck` → `M-escape` | Repeated player plans | Soft, then firm, re-crosses L |

## 5. Cameras

| Camera | Position (x, y, z) | Looks at | FOV | Use |
| --- | --- | --- | --- | --- |
| `C-establish` | (−6.5, 2.6, −29.5) | (0.6, 0.4, −8) | 40 | Opening: rover small, open horizon, entry tracks in the foreground |
| `C-chase` | follows | rover | 44 | Trails the direction of travel so the goal is up-screen. Starts from the shared rig (distance 5.8) with pitch raised to about 0.22 |
| `C-wheel-rf` | (1.75, 0.32, 1.35) | right front wheel | 36 | Sink depth against the hub (PIA07984) |
| `C-wheel-lf` | (−1.15, 0.32, 1.20) | left front wheel | 36 | Packed cleats and berm (PIA07983) |
| `C-wheel-rear` | (0.45, 0.42, 4.55) | both rear wheels | 40 | The leading wheels at the trench heads |
| `C-overview` | (5.2, 3.4, −3.6) | (0.2, 0.2, 1.2) | 42 | Recovery overview with the escape point in frame |
| `C-final` | (0.05, 1.5, −5.95) | (0.3, 0.05, 1.9) | 45 | Mast-height look back over the rear deck, after PIA07999 |

Sun: azimuth 262 degrees, elevation 32 degrees, across the crest lines so low relief reads. This is a lighting choice; no checked source gives the local time of the sol 446 drive.

## 6. Visual rejection criteria

Reject the Sprint 2 slice if any of these is true.

**Form**
1. Any feature in the authored square stands more than 0.45 m above its surroundings, or anything breaks the flat horizon.
2. One repeating wave is visible across the map from `C-establish`, or two ripples in one view are copies.
3. The built hero ripple is outside 2.5 ± 0.15 m wide or 0.33 ± 0.03 m tall.
4. Any rock, pebble mesh or prop with a silhouette is present.

**Material**
5. Ground is not clearly darker than the sky in the chase view (reference: about 32% of sky luminance in encoded values; accept 25 to 45%).
6. Churned sand is darker than undisturbed sand.
7. Tiling is visible from the chase camera, or a single grain feature is wider than about 2 cm at a wheel camera (the 16 cm wheel is the ruler).
8. Footprints or trampled clumps from the Dense Sand scan are readable.
9. The sky has clouds, strong gradients or storm colour.

**Contact and motion**
10. A wheel floats more than 1 cm above the ground, or is buried with no visible trench.
11. Visible trench depth and the sink value differ by more than 2 cm at a wheel camera.
12. Tracks do not start at the wheels, or continue where the rover has not been.
13. Wheels turn while the chassis barely moves and nothing on screen says so.
14. A crack, light leak or shading seam shows at a mesh-level border from any authored camera.

**Camera and labels**
15. The rover is not whole in the chase frame, or the ripple ahead is hidden behind it.
16. A wheel camera clips the ground or the body.
17. "Reconstruction" or "Simplified" is missing.
18. The rover shows damage or dust that the 2005 references do not.

## 7. Performance budgets

| Item | Budget | Planned |
| --- | --- | --- |
| Terrain triangles | 58,880 | 54,568 |
| Extra environment detail | 5,000 | Track pool 1,536 + static entry tracks up to 800 + trench berms up to 1,200 |
| New runtime textures | 1K, at most four maps | Reuse Mission 1 `fine-sand` and `surfaces/regolith` first |
| New materials | Two | One terrain, one track |
| Extra draw calls over the drive preview | Six | To be measured |
| Per-frame allocations in update paths | None | Reused vectors and pools |
| Trench updates | Only during command execution, only touched L3 vertices | At most about 4,600 vertices |
| Dust and track pools | Existing `WheelEffects` pools (360 puffs, 768 marks) | Reused |
| Renderer quality, shadows, post-processing | Unchanged | Unchanged |

Measurement protocol for Sprint 2:

1. Baselines: `?scene=episode-rover-01` (drive preview) and `?mission=blueberry-clue` (approach), on the same machine, at 1280 × 720, "balanced" preset.
2. Drive a fixed 20-second route three times in each scene and in the Mission 2 slice.
3. Record frame intervals (median and 95th percentile), `renderCpuMs`, draw calls, triangles, geometries and textures from the counters `Game.ts` already exposes in development builds.
4. Record GPU time if the browser offers a timer query; otherwise say it was unavailable.
5. Because the balanced preset caps at 45 FPS, also record the "high" preset so headroom is visible.
6. Investigate any repeatable regression above about 5%. Do not lower quality to pass.

On record from another task, not re-measured here: the terrain-100 review lists 44 draw calls and 416,500 rendered triangles across passes for the drive preview at the "low" preset.

## 8. Material plan

1. Firm ground: Mission 1 `fine-sand` (already 1K at runtime), tinted toward the panorama samples.
2. Granular breakup: `surfaces/regolith`, auditioned at low strength.
3. Churned sand: a 1K derivative of Dense Sand, only if a footprint-free patch can be cut and made tileable. It becomes a new derived resource with its own hash record. Diffuse is sRGB; normal (OpenGL), roughness and AO are linear data.
4. Trench and berm shape come from geometry and masks, not from a texture.

## 9. Open decisions

1. Command tiles: rover-frame FORWARD/REVERSE with a path preview (recommended), or ground-relative labels.
2. Ground colour: follow the panorama's dark brown (recommended), or stay closer to the hub's brighter orange family.
3. Who lands the shared routing change Sprint 2 needs: one `?mission=purgatory` value in `main.ts`, one dispatch branch in `rover/index.ts`, and `'purgatory'` in the chapter type in `contracts.ts`.
4. Carried from Sprint 0: solution wording, montage ending in 2018, how the hub reaches Chapter 2.

## 10. Limits of this sprint

- No game build, test run or runtime capture. Camera and mesh values are untested.
- The board's structure (17 cards, 7 sections) was checked in the browser pane and its 17 embedded images decode, but I could not view the finished page rendered with images.
- Crest spacing, crossing angle and the last-crest distance are visual readings.
- No new downloads were supplied. The Biesiadecki and Maimone paper, saved article pages and the other three wheel time-lapses remain outstanding; none blocks Sprint 2.
