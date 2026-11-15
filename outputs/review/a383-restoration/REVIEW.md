# a38322f hub restoration

15 November 2026. User explicitly selected the terrain from a38322f after reviewing the history.

`createHubEnvironment` now defaults to the retained trough/basin world. The heightfield, scanned surface materials and rock dust implementation are unchanged from a38322f (verified with git diff). Cold cloudy atmosphere, varied scanned outcrops and fine dust are selected by the existing hub/drive options. Modern rock contact caching, tyre smoothing, missions, saves and concurrent spirit changes remain. The alternate100m map remains available with `legacyTerrain:false`; no assets were deleted. New-game spawn is `(0,8)`, entrance `(0,-25)`, near ground160m wide with the original circular navigation boundary. Saved positions are not cleared. Hub debug metadata now reads the actual world's identity and dimensions.

Native development review on a separate port5187: loaded the hub, captured new spawn, traversed the saddle/basin toward the rover, entered the Blueberry Clue mission, began it and applied forward input, paused and left memory, and returned to hub at `(0,-22.43)`. Final reload reports `hub-troughs-v1`, position `(0,8)`, grounded, one application loop. `hub.png` is the native final capture; `runtime.json` records its statistics. Retained new spirit art is concurrent work, not part of the historical terrain restoration.

Production build/typecheck succeeded; all81 current tests passed, including terrain, stone, mission and spirit checks. Final metadata-only correction also passes production build. No console errors observed; four startup Three.js warnings reported undefined texture-map constructor values before asynchronous surface loading. Final ready terrain renders the scanned surfaces. No claim of full campaign completion, user visual acceptance or thermal measurement is made.

Only our temporary review tab/server were closed; existing servers and tabs were left untouched. No commit/push was requested or performed for this restoration.
