# Blueberry continuity — navigation first

15 November 2026. Isolated `codex/blueberry-continuity`, base `47bc217`; main and the prior polish worktree remain untouched.

Source findings: main.ts defaults to the hub; Game New Game opens/resets that factory. The hub environment is created before navigation and recreated on memory return. It has no concretion population. Mission 1 creates 150 deterministic concretions in a hidden macro group, then explicitly gates their visibility to comparison/evidence. Reconstruction fades those grains and adds 36 overlapping transient grains. Save/progression does not currently create hub concretions; there are none to persist.

Plan: (1) Add independent deterministic geological clusters during hub layout setup, including the initial camera foreground and rover approach. (2) Reuse a small shared geometry/material factory, with scene-owned instanced batches and no physics or per-frame generation. (3) Keep the existing 150-grain specimen arrangement as one object through approach and magnification; remove phase visibility gates and overlapping reconstruction copies. Keep wetting and its clearly labeled interpretation without replacing observed stones. (4) Preserve distinct hub/history identity and the existing separate-observation wording. (5) Capture an isolated-storage New Game before memory entry, all mission phases and return, then test restart/reload/repeated visits, matrix identity, resources and production build.

Placement is authored visual dressing, not surveyed NASA data. Macro grain dimensions remain the existing millimetre-scale specimen. Navigation clusters are a separate, modestly enlarged presentation for third-person readability; do not describe those as measured geological size or the same physical stones in both locations. Natural burial, warm charcoal material and asymmetric clusters follow the retained NASA Berry Bowl reference rather than a blue pigment interpretation.

No shared app/input/save/renderer contract or terrain height/collision change is planned. Existing user browser storage is not accessed; automation uses new ephemeral contexts.

Implemented: one 640-grain hub batch is created unconditionally in `createHubWorld`, before navigation. Mission 1 has a separate 240-grain field population and the original 150-grain specimen, with unchanged local matrices. The specimen is present at the work point during approach and is reframed intact for magnification. A shared coarse geometry serves navigation; the existing fine geometry serves close inspection. No per-frame regeneration occurs. The old phase visibility gate and 36-grain duplicate reconstruction overlay are removed. Wet material changes retain opaque, stationary grains.

Verification and remaining limits are recorded in `outputs/review/blueberry-continuity-v5/REVIEW.md`. This is a local branch implementation, not an integration into main or owner aesthetic acceptance.
