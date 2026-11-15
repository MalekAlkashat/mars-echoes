# Long Night: NASA archive presentation

**Reverted at the user's request, 15 November 2026.** This report and its captures
are historical only. The three modified source files were restored byte-for-byte
from `work/imagery-v4/before.zip`; the added runtime imagery, quote metadata,
archive tests and chapter-local guardrail file were removed. The prior cinematic
presentation, original PIA22929 image and 16-second storm remain. Restored build
and all 81 tests pass. The removed candidate is preserved in ignored
`work/imagery-v4/reverted-version.zip`.

15 November 2026. User-requested follow-up to PRESENTATION-V3.md. Implemented in
`work/mission-three`, branch `codex/mission-three`, base `548ce49bbeecbd77404b868c1e47e615a6ef5fd9`.
Uncommitted, unmerged, unpushed, undeployed. No other worktree changed.
Preview: http://127.0.0.1:5208/?mission=long-night&review=archive-v4

## Result and visual direction

Mission 2's contained, unaltered NASA photographs and accompanying captions informed
this chapter's presentation. Long Night now moves from an attributed human tribute
over the full final panorama to a two-column transmission exhibit, then to a later
orbital observation beside the recovery timeline. Warm typography and a dark stage
frame the original images. Mobile stacks the same content and permits vertical
scrolling; large-text captions and source links remain reachable. Each new screen
starts at its heading, with keyboard focus moved there without an unwanted scroll.
The 16-second storm, service model, phase/save schema and SUNLIGHT award are unchanged.

## Factual boundaries

| Material | Primary evidence and presentation limit |
| --- | --- |
| PIA22909 / M3-R04 | [NASA panorama caption](https://science.nasa.gov/photojournal/opportunity-legacy-pan-true-color/): May 13–June 10, 2018 mosaic, approximate true color. Black margins and monochrome areas retained. |
| PIA22929 / M3-R01 | [NASA transmission caption](https://science.nasa.gov/photojournal/opportunitys-last-message/): last transmitted partial full frame; black missing data and white camera noise preserved. Not the last exposure. |
| PIA22930 / M3-R02 | [NASA thumbnail caption](https://science.nasa.gov/photojournal/last-images-opportunity-took/): later exposures received only as thumbnails. No generated full-resolution replacement. |
| PIA22549 / M3-R06 | [NASA orbital caption](https://science.nasa.gov/photojournal/opportunity-after-the-dust-storm/), retained S11 source: September 20, 2018 HiRISE observation. No inference about battery condition or new motion. |
| Iconic line | [Jacob Margolis's own explanation](https://laist.com/news/jpl-mars-rover-opportunity-battery-is-low-and-its-getting-dark), February 16, 2019: human interpretation of scientists' descriptions. The game displays the author, February 2019 date and explicit non-literal clarification beside the quotation. No rover voice or invented dialogue. |

All four runtime image files are byte-identical to reviewed research originals,
with full partner credits and source links. Added image payload is 518,465 bytes.
No image generation, cropping, recoloring, retouching, upscaling or recompression
was performed. The panorama is limited to its 900-pixel native display width.
NASA educational/informational media guidance and item credits remain recorded
in `game/public/assets/long-night/v1/SOURCE.md`; no CC0 or endorsement claim.

Guardrails are concrete: authored metadata rather than generated runtime facts,
visible processing/date/attribution labels, hash/credit/provenance tests, and a
chapter-local `AGENTS.md` governing future changes. These prevent the known
misrepresentations; they do not imply that tests can prove every historical claim.
Failed image requests display an unavailable notice and the original source link;
they neither block the chapter nor synthesize replacement imagery.

## Verification

- 83 tests passed, including every selected image's original SHA256, dimensions,
  credit and source host, and the tribute's non-literal classification. TypeScript
  and production build pass under Node 22; existing shared-bundle warning remains.
- Final production keyboard and touch playthroughs reached silence at 16,004 ms
  and 16,001 ms, retained both service choices, traversed all story screens and
  returned to the hub. Browser errors empty; no horizontal overflow.
- Desktop 1440×900 and touch-emulated 390×844, large text/reduced motion:
  all four story screens, image decode, source/quote visibility, heading position,
  Pause/resume and return checked. Archive/recovery intentionally scroll vertically
  on small screens; footer screenshots demonstrate reachable controls.
- Valid saved-story entry retained prior GRIND and awarded SUNLIGHT on completion.
  A separate fault run aborted all four image requests and completed the chapter
  with source-linked fallbacks and no page errors.
- Review found and corrected mobile centering that clipped the beginning of tall
  content, plus focus/scroll ordering when advancing between screens. One full-run
  harness overlapped a rebuild and could not load the return chunk; the final run
  used the completed build and passed. An initial harness used an invalid non-storm
  elapsed value; corrected fixture, no change to save validation.
- `git diff --check` passes. No dependency/shared-runtime/world/render-loop changes
  in this increment. No new GPU benchmark, physical-device or screen-reader-user
  acceptance; aesthetic owner acceptance remains separate.

Evidence: `v4-*.png`, `v4-runtime.json`, `v4-fault-runtime.json`,
`v4-full-runtime.json`, and `v4-hashes.json` in this directory. Actual production
captures, not mockups. Normal-speed recordings and scripts remain under ignored
`work/imagery-v4/`; `before.zip` preserves the prior presentation source.

Incremental ownership: `game/src/content/long-night.ts`, chapter `index.ts`,
`style.css`, `AGENTS.md`, local archival assets/SOURCE, one provenance test and
review notes. Existing earlier Mission 3 shared-file changes are still present;
they were not modified by this pass. Integrator must reconcile the full branch.
