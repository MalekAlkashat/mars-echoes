# Rover 3D service workflow

For the playable mechanical rover, use the official Tripo CLI, optionally exposed as MCP. It offers local image inputs, editable-part generation, post-generation segmentation and GLB output. fal is already connected and remains an available route for model drafts and other assets, but the current Tripo generation schema exposed through fal omits direct editable-part generation.

This recommendation is based on current first-party documentation and live fal schema inspection on November 11, 2026. No paid model task has been submitted.

## Comparison

| Route | Integration | Fit for this game |
| --- | --- | --- |
| Tripo direct CLI or MCP | Local tool with browser sign-in; CLI also runs as an MCP server | Recommended for the protagonist: direct API supports editable-part generation and segmentation. Correct separation and useful pivots still need inspection. |
| Existing fal connection | Already available in this chat; Hunyuan, Tripo and Trellis endpoints were inspected | Useful for a mesh draft or static assets. Available schemas do not promise separately movable rover parts. Hunyuan supports optional top and side images; Tripo multiview expects front/left/back/right, so top views are not interchangeable inputs. |
| Meshy official MCP | Separate Meshy account/API key and MCP setup | A documented alternative for generation and post-processing. Its Auto Split is designed for printable solids and can alter thin regions; it should not be assumed to create a mechanical animation hierarchy. |

Sources: [Tripo CLI and MCP mode](https://developers.tripo3d.ai/en/docs/cli), [Tripo editable-part parameters](https://developers.tripo3d.ai/en/docs/generation-image-to-model/standard), [Tripo segmentation](https://developers.tripo3d.ai/en/docs/mesh-segment), [Meshy MCP](https://docs.meshy.ai/en/api/ai), [Meshy Auto Split](https://docs.meshy.ai/en/api/auto-split).

## Prepared pilot

Tripo CLI 0.9.0 is installed inside the project's `work/tools/tripo/` folder. Node is available. Version and bundled documentation checks passed. The local dry run in `tripo-pilot-dryrun.json` reports `valid: true`, one GLB deliverable, no errors and no warnings.

The prepared request uses the larger-eye master image, H3.1 (`v3.1-20260211`), `generate_parts: true`, `texture: false`, `pbr: false`, a 50,000-face limit and seed 112026. The dry-run estimate is 40 credits, or $0.40 at the published $0.01-per-credit rate. That is an estimate for this untextured generation, not the cost of a finished asset or a retry budget. A later standard texture operation is currently listed at 10 credits. [Tripo pricing](https://developers.tripo3d.ai/en/pricing)

Part generation requires an untextured first pass; texturing is a later operation. Keep the first output for inspection before chaining paid transformations. Do not generate all deterioration states independently: preserve the accepted face and use the reviewed base parts to build damage variants where practical.

## Production sequence

1. Create a Tripo developer account, select its site explicitly and authorize the local tool through browser sign-in. No sign-in or generation has happened yet. The user currently has no Tripo account.
2. Generate one untextured segmented rover from the main reference. Keep side/top references for comparison; do not force them into unsupported view slots. Reconcile the inferred head depth before relying on multiview generation.
3. Inspect six wheels, chassis silhouette, twin optics, mast, antenna and arm. Check whether returned parts actually support the intended motions. Segmented output alone does not establish an animation-ready asset.
4. Correct separation and set pivots for wheels, mast/head, arm and the replaceable optical module. Use a rigid-part hierarchy. Humanoid skeleton generation is unnecessary for this route.
5. Apply materials, inspect the textured GLB in Three.js, then prepare the selected stage-two damage state. Reuse simpler broken variants for graveyard wrecks.
6. Assemble a compact terrain and reusable rock/debris kit around the selected environment reference. A generated landscape image is a visual target, not navigable terrain. Keep the ground, collisions and placements editable.
7. Integrate third-person movement, optical-feed moments and the alignment puzzle, then verify in the running scene.

## Access and handoff

Use the project-local executable `work/tools/tripo/node_modules/.bin/tripo`. Keep its state under `work/tripo-state/` using `TRIPO_HOME`; `work/` is excluded from version control. Set `TRIPO_ANALYTICS_ENABLED=0` and `TRIPO_NO_UPDATE_CHECK=1` for the prepared workflow. Never put credentials into the game or shared reports.

The official CLI supports international and mainland China account sites. Ask the user to choose before starting sign-in; do not infer a site from language or location. Sign-in requires their browser authorization. Save task handles immediately and resume an existing task after a timeout rather than resubmitting it.

Blender was not found on PATH or at the two checked standard application paths. If geometry cleanup needs Blender, establish an available installation before assigning work to it. This check does not prove it is absent everywhere on the computer.
