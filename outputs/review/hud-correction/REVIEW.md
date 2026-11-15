# Mission UI correction — 15 November 2026

Implemented locally on branch2, starting with existing HUD and concurrent graphics edits. No Git mutations, deployment, audio, camera, terrain or post-processing changes in this correction.

## Content audit

- Current objectives: Mission I approach, brush and grind remain upper-right; headings reduced to 18px, warm #D8D4CC. Shared objective text uses the same soft white.
- Critical understanding: inspect, both comparison steps, water interpretation and instrument conclusion use the lower-center passage. Headings 23px, body 17px on desktop; 22/16px on narrow screens. The final photograph retains a 23px heading and the instrument evidence below it.
- Immediate actions: same phase/input eligibility and queued intents. Passage/action are in one flow; no independent fixed overlay within transformed passage. Grinding uses the existing hold input and meter.
- Optional detail: existing sources, photo metadata and reconstruction caveat retained. Mission II command planner/cameras and Mission III energy/services are functional interfaces, not explanatory copy; this correction leaves their behavior intact.
- Emphasis: authored text segments rendered with text nodes and semantic em elements. No HTML parsing; qualification "may have", observed grains and instrument-derived hematite remain distinct. Two tests verify phase classification and exact preservation of existing scientific wording.

## Actual checks

1280x720 actual development browser: approached target, unavailable action while far, available clickable preparation nearby, brush, deliberate keyboard-held grind, inspect, both comparison steps, natural-time water reconstruction, final photo. No one-click phase skipping observed. Saved comparable before/after objective and water captures. Same production scene/camera, with small unavoidable approach-distance and reconstruction-time differences.

390x844: complete approach/preparation/comparison path; coordinate pointer held on existing Hold E for 4.5 seconds completes grinding. Captured water and final photo with larger-interface and reduced-motion settings enabled. Text wraps and actions remain visibly separate; no clipped passage/photo or required control in these captures. Existing keyboard, pointer clicking, Pause, Settings, resume and sources remain accessible. Restored original text/motion settings and viewport afterward.

Pause hides evidence, resume restores it. Leaving memory returns to hub; actual DOM counts afterward are zero discovery panels and zero archives. No full campaign/save migration recertification is claimed.

1920x1080 read-only DOM measurement: archive matches 1920x1080, document scrollHeight 1080, Continue top/bottom 896.8/940.8. Native screenshot was clipped/scaled and an alternate screenshot API returned an unstyled initial frame; this size has bounds evidence only, not reliable visual certification. The inconclusive screenshot is retained with an explicit name and excluded from comparisons.

Final existing suite: 164 passing tests. Production typecheck/Vite build passes with existing large shared-bundle advisory. Logs: work/hud-correction-final-tests.log and work/hud-correction-final-build.log. Concurrent graphics tests are included in that total, not authored by this correction.

## Captures

- before-objective.png / after-objective.png
- before-water.png / after-water.png
- after-evidence.png (dark historical surface and selective amber words)
- mobile-evidence.png / mobile-large-evidence.png
- mobile-water.png (large text and reduced motion)

## Limits

Physical touch device, full journey/replay/save-resume rehearsal and fresh Mission II/III playthrough remain unverified in this correction. Native 1920 screenshot capture is inconclusive. Browser tooling had intermittent timeouts and hot reload resets; only completed observed checks above are counted. Owner aesthetic acceptance remains separate.

## Changed source

Mission I index.ts, style.css, archive-view.ts, new passage.ts; shared ui/style.css; new tests/discovery-passage.test.ts. Earlier task edits and concurrent graphics work remain preserved.

## UI push validation

The isolated UI-only tree (excluding concurrent graphics/terrain/title-menu edits) passes all 159 tests and the production build. It reuses retained public/source assets, planning fixtures and installed dependencies through local junctions. No dependency changes. Earlier 164-test total describes the combined local checkout.
