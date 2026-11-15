# Phaser filters skill: installation and application

Installed 15 November 2026 using `@skills-hub-ai/cli` 0.4.4, after inspecting npm
metadata, CLI help and a Codex-only dry run. Skill version: 1.0.0.

Installed at `/Users/morshu/.codex/skills/phaser-filters-and-postfx/SKILL.md`.
Command: `npx --yes @skills-hub-ai/cli@0.4.4 install phaser-filters-and-postfx --target codex --no-deps --no-save`.
No game package, project skill manifest or Phaser engine dependency was added.

The installed document is titled **Phaser 4 Filters and Post-FX**. Its APIs,
including `enableFilters`, `filters.internal` and `filters.external`, require
Phaser and cannot be invoked on our Three.js objects or cameras. A skill is
instructional material, not an executable rendering plugin.

Useful applications:

- Keep object effects local: retain the spirit's mesh/shader glow instead of
  adding separate full-screen buffers per object.
- Screen effects belong after scene composition: the existing film pass handles
  peripheral blur, vignette and restrained speed grading.
- Filter order and lifecycle matter: scene binding clears speed; other scenes
  default to zero; no effect-created listener or render loop.
- Adapt the barrel-distortion idea: a mild speed-weighted peripheral UV expansion
  now runs before the blur samples in our GLSL shader. The centre remains
  protected. This is original Three.js-compatible shader math, not copied Phaser
  engine code. No added sample, texture, render target or pass.
- Avoid stacking blur/glow/bokeh passes simply because the skill lists them.

The lens adaptation builds successfully and native forward/lateral rush checks
show an empty browser error log. The full speed-camera suite passes all 84 tests;
that suite predates the final arithmetic-only lens addition. Current captures:
`outputs/review/blue-flame-v1/lens-effects.jpg`. This demonstrates the adapted
Three.js treatment, not a Phaser renderer running inside the game.

The skill will be discoverable by Codex on the next turn; its document was read
and applied manually in this turn.
