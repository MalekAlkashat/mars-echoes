# Mission 1 world continuity pass

15 November 2026. Worktree `work/mission-one-world-polish`, branch `codex/mission-one-world-polish`, base `d87c056`. Main's 1,484 tracked/untracked files and both stashes are snapshotted before work. No shared source, hub placements, dependency, save, input or progression change is planned.

**Observed:** fresh native captures at balanced 1440×900 show the hub's warm fine-grained surface, differentiated exposed rock, low grazing light and layered hazy distance. Mission 1 has a usable asymmetric exposure and clear approach but a smooth beige ground, near-identical thin slab silhouettes and flat horizon. The complete current investigation/ending was recorded before changes. Captures are under `work/world-polish/{before,hub-before}`.

**Source facts:** the hub uses `surfaceMaterial('dust',...,{terrainDust:true})`, world-space texture sampling/warp and normal filtering, baked ground dust and rock-ground planes, and `addAtmosphere`. Mission 1 uses a .3 m repeated generated sand tile, a shared centimetre-specimen material for metre-scale outcrops, a flat background color and a separate environment probe. Its heightfield samples exactly the visible .5 m triangles. Site positions, generous route, 21 exposure slabs, work trigger and 12-second reconstruction already exist.

**Inference:** material scale, rock/ground integration and distant composition are the main continuity problems, rather than insufficient scatter. The macro specimen's material is serving two scales; changing it globally would risk the scientific close-up and ending.

**Selected implementation plan:**

1. Keep the 21 exposure locations, current spawn `(4,7)`, heading .4, work area `(0,-1.5)`, 2.4 m trigger and ±11 m boundary. Preserve the ≥5.5 m approach and 8 m turning pocket from v3. Keep the southern/eastern apron as negative space.
2. Give the driving environment its own scene-local group. Reuse the hub's existing dust and rock material factories, filtered world scale, rock-ground-plane and ground-dust helpers without modifying them. Use a restrained pale warm rock variation to retain Eagle's layered exposure identity. Existing approved CC0 maps are visual analogues, not NASA scans.
3. Author six angular layered field-slab variants inside existing collision envelopes; vary thickness/tilt and bury their full bases against the actual heightfield. Place small fractured flakes beside exposures, keeping them nonblocking. Preserve the centimetre specimen geometry, textures, RAT and reconstruction unchanged.
4. Preserve all traversable height samples. Extend the ground seamlessly beyond its current square with low, asymmetric authored distant shoulders, not the hub's large crater wall. Reuse the atmosphere factory only for the driving scene. Maintain the prior macro lighting/environment/fog through explicit view switching and scene-owned cleanup.
5. Compare hub/mission normal gameplay and Mission 1 before/after at identical settings and repeatable routes. Inspect grain, burial, silhouette, horizon, shadow continuity and the macro transition. Iterate on actual defects.
6. Test contact/mesh agreement, slab bounds and base burial, route clearance, full mission flow, camera orbit/collision, pause/restart/save/reward and repeated returns. Run tests and production build with Node 22. Capture normal-speed traversal and final results. Verify the main snapshot/stashes and unchanged hub source.

**Reference basis:** retained NASA Eagle panorama and Berry Bowl images were opened; their source records remain under `assets/references/mission-one/v1`. The image's shallow basin and fractured light slabs guide this authored setting. No new science claim is introduced. Approved hub dust provenance: `game/public/assets/surfaces/dust/SOURCE.md`; rock maps: `assets/vendor/polyhaven/SOURCE.md`. Preserve all originals. No external generation/download is planned.

**Acceptance:** an agent-verified cohesive location, not a claim of owner acceptance, measured HiRISE terrain, a geological survey or a new physical simulation. Comparison footage, measured rendering costs and remaining limits accompany the handoff. No merge/push is included in this new task.

Status: implemented in the isolated branch; review evidence is in `outputs/review/mission-one-world-v4/REVIEW.md`. No main merge or owner aesthetic acceptance is implied.

Runtime review refined the selection: the hub's very low sun and full rock normal strength overwhelmed the compact exposure. The memory uses the same factories with a higher, coherent scene-local sun and quieter pale rock detail. Slabs retain the v3 positions but have six fractured outlines, bevelled low tops, irregular edges, terrain tilt and fully buried bases. Small flakes use a separate cheaper mesh. A side-view review caught a near/far material join; both meshes now share one filtered material and matching field normals, with a denser scenic transition. The playable heightfield is unchanged. The southern apron stays open, with low distant shoulders framing the north and west rather than extra blocking scatter.
