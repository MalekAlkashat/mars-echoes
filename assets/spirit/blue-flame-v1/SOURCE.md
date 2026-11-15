# Blue flame spirit v1

Design authority: the blue flame image supplied by the user on 15 November 2026,
retained unchanged as `reference.png`.

- Original attachment: `codex-clipboard-27464a5a-3e50-4523-81ef-22588801eb86.png`.
- SHA-256: `053830823e5e140ade650ef44d1e34d58b8ba4cd18906a12c70d07db15cb2b3e`.
- The image is a visual reference, not a runtime texture. No third-party
  redistribution license is asserted for the supplied image.
- Accepted direction: compact white-cyan nucleus and short blue wisps at rest;
  longer flowing blue flame and a fading wake during rushing. No humanoid or face.
- Authoring source: `game/src/entities/spirit/appearance.ts`, `flame-materials.ts`,
  `wake.ts` and `trail-history.ts`. These are original procedural implementation;
  no Montblanc artwork, shader code, model or texture was imported.
- Runtime uses metres, +Y up and -Z forward. A local body animates independently
  of a world-space trail. No external model, rig, paid generation or new package.
- The only new runtime texture is a deterministic, periodic 128 × 128 RGBA noise
  field generated locally in `createFlowNoise()`. It is owned by the appearance.
- Motion inspiration and technical findings: `outputs/references/montblanc-run/study.md`.

The user accepted the direction and controls; final runtime visual acceptance
remains open.
