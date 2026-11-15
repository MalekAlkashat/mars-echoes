# Opportunity epilogue — implementation contract

Base 6eef598, branch codex/opportunity-epilogue, isolated work/epilogue. User clarified that “Mission 4” means long-night, followed by Memory Check and epilogue. No fourth chapter.

Source boundary: SceneDirector records the completed long-night result only AFTER hub preparation and activation succeed. GameSession.record will mark the finale pending at that existing boundary. Hub observes committed pending state on its next update. Abort, failed load, cancellation, unrelated chapter results cannot start it. Direct previews remain storage-isolated. No new renderer, input listeners or loop.

| Beat | Active duration | Ownership and composition |
| --- | --- | --- |
| Return / settle | 4 s | Existing safe bookmark; one hub camera eases from its restored view to a clear rover/spirit composition. Movement locked; Pause retained. |
| Memory Check | Untimed | Three choices, feedback and explicit Continue. First answers retained; no pass threshold. Never marked finished by Skip. |
| Reflection | 6 s | “What else is waiting to be understood?” Earned memories only, one tiny point batch gathering near spirit. |
| Curiosity | 4 s | A small fictional blue echo appears down a setup-validated open route. Camera holds the silent rover. |
| Choice | Untimed | W / existing touch Forward begins a short departure; Move onward button is equivalent. No quest or new level. |
| Departure / hold | 9 s | Existing controller accelerates at normal glide speed down a bounded clear 18 m route; camera stays behind. |
| Fade | 4 s | Overall scene fades, no brightness flash or new pass. |
| Titles | 8 s | “Missions end. Discoveries don’t.” then “Other echoes are waiting.” |
| Completed screen | Untimed | Explicit story complete; credits, sources, Memory Check result, replay ending, return to exploration, existing main menu. |

Target timed total 35 s. Refine against real runtime. Skip routes through unfinished Memory Check before the same completed screen. Reduced motion uses a fixed composed camera and restrained fades, without orbit or gathering particles. Pause freezes clocks/effects through scene lifecycle; no CSS animation clocks. Reload pending restarts settle and resumes unanswered questions; complete reload returns to exploration with Revisit ending available. Replays retain the first-attempt score.

Owned: scene-local epilogue/progress/CSS plus hub adapter, optional typed finale state in session/save and Game save plumbing. SceneDirector is unchanged. A small optional GameScene.isPresentationIdle hook stops 3D work after the opaque ending has been presented and saved; replay wakes the existing loop. Continuous-journey task owns its separate director/contracts changes; Robot Journal owns separate UI work. Integration must preserve both; no merge/push authorized here.

Verification: transaction failures/retries, parse validation/old saves, first responses/Skip, route clearance, actual Long Night completion and desktop/narrow playback, pause/reload/menu/replay, normal-speed video, production build, matching-condition renderer/performance samples and repeated cleanup. User aesthetic acceptance remains outstanding.
