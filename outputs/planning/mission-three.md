# The Long Night

The current energy/readability implementation is specified in [mission-three-correction.md](mission-three-correction.md). It supersedes the original recomputed reserve and automatic 40-second advance described by the first candidate review.
15 November 2026. Base 548ce49; isolated codex/mission-three. No merge or push.

Selected design: drive from (0,10) to (0,2), observe the valley, then a 40-second compressed storm. Suspend imaging and stop sampling reduce illustrative demand. Both choices preserve more model reserve; neither changes history. Silence leads to unchanged PIA22929, a dated recovery campaign and SUNLIGHT linking solar-powered Spirit and Ingenuity. Final E returns control to the spirit. Skip retains all essential cards. No automatic camera motion, so reduced-motion users receive identical information. No audio was introduced.

Authored 60 m playable square in a larger scenic valley. Shared NASA rover, vehicle and camera. Scene-local deterministic rock instances and atmosphere, no particles, extra passes, fluid solver or physics dependency. Reuse materials and shared lifecycle. Scene-owned light/fog/sky/environment strength change together; no dynamic environment recapture. Exact pose and topography are not asserted.

Shared integration patch: contracts, episode dispatch, main preview, session and save validation, hub chapter selector. These changes are confined to this worktree and require reconciliation with Mission 2 and spirit changes during integration. Mission 1 source is untouched. Normal hub selection permits either available chapter without implying Mission 2 completion. Direct preview disables persistence as before.

Resources: copied completed research pack, unchanged originals. Runtime PIA22929 is a byte-identical 1024-square 314160-byte copy, no missing-data repair. Claim ledger is assets/references/mission-three/v1/claims.json; runtime IDs C08–12, C18, C24, C28. New creative choices are model abstractions (C34–35). Primary caption, mission-conclusion and recovery pages were re-read. No battery percentage or tau curve is represented as measured data.

Provisional performance budget: 28,800 ground triangles; 48 rocks in one batch; no new storm textures/draw calls; stable resources after repeated visits. Production arrival/onset/peak/archive/return samples use 1440x900 balanced, DPR 1 and the existing 45 fps cap. Report presentation timing separately from GPU cost. Low graphics retains the same minimal fog/light treatment and existing renderer settings.

Acceptance: normal journey, direct preview, conservation, keyboard/touch, pause/focus, skip, restart, save/reload, reward only after return, failure/retry, repeat cleanup, source/asset errors, existing suite and production build. Physical phone, thermal/GPU timings and owner visual acceptance remain unverified until separately recorded.
