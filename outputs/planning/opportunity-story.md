# Opportunity: current story direction

## Current build order

The user clarified that final spirit design is deferred, while the base exploration map is required first. Use the existing placeholder to roam Mars and discover Opportunity. Build the shared terrain and mission foundation described in `mission-foundation.md`, then implement three separate chapter maps in parallel. The spirit entry/return story below remains the player-facing structure; direct mission previews enable independent development. Runtime code has not yet been adapted for direct chapter hosting.

Updated 14 November 2026. The user selected the new story direction from the team's Echoes of Mars design pack. This document records that direction alongside the existing project; detailed mechanics and presentation still need design and review.

## Player journey

A spirit explores present-day Mars, enters the abandoned Opportunity rover, relives moments from its mission, and returns to the present. One complete Opportunity story is the first target; other machines can be glimpsed as future stories. Playable moments are connected by cinematic time jumps.

The design pack proposes three chapters:

1. **Evidence of water:** drive to an outcrop, use the rock abrasion tool and discover evidence preserved in the rocks. A clearly labeled reconstruction suggests the ancient wet environment.
2. **Purgatory Dune:** experience the rover becoming stuck and its eventual escape. A simplified command-sequence puzzle is proposed to convey the work of the team on Earth.
3. **The long storm:** encounter the dust storm and declining solar power, ending with Opportunity's last contact and the spirit's return.

The proposed finale connects the rover's capabilities and challenges to other real machines through skill links and a Mars map, followed by a short learning check and source credits. These features and the exact controls, pacing and priority need team review against the one-day budget. Other machines are teasers, not promised playable episodes. The pack's 10–12 minute estimate is a proposal, not a confirmed presentation length.

## Historical grounding and emotional treatment

Base factual captions, dates, locations, visuals and robot links on primary NASA records. Clearly label imagined ancient environments as reconstructions and compressed puzzles as simplified. The spirit and its journey are fiction. Use movement, sound, camera and player perspective for emotion without attributing invented speech or feelings to Opportunity. Verify specific historical claims and asset rights before putting them into the game. In particular, do not present the existing fictional repair, automated decommissioning or unanswered-call scene as Opportunity's history.

Starting points for research: [NASA mission overview](https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/), [NASA/JPL mission conclusion](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/), and [NASA/JPL view of Purgatory Dune](https://www.jpl.nasa.gov/images/pia07999-looking-back-at-purgatory-dune/). Check sources individually as each beat and caption is written.

## What exists and what is open

The existing Three.js/TypeScript build has a placeholder spirit hub, transitions and a fictional rover repair/relay episode. It does **not** implement the Opportunity chapters, historical ending, skill links, map, learning check or final art. The existing scene remains a technical baseline; its completion is not completion of this story.

Spirit movement remains near-ground glide and bounded leap with solid obstacles. Its appearance remains tentative. The team's suggested glowing wisp is an option, not an approved change. Grounded cinematic orange terrain, a pale distant light and a heavy sky remain the art direction. The prior expressive twin-eye rover concept is an approved reference for the fictional prototype, not evidence of Opportunity's actual appearance; how to reconcile recognizable historical machinery with the user's expressive design needs an explicit visual decision. Do not silently replace the accepted reference or label the existing model historically accurate.

Open decisions include exact chapter interactions and scope, how the spirit and rover look, how skill links and the check are presented, sound, duration, final title, team assignments, and the presentation computer. Maintain the existing scene ownership and stack unless the team explicitly agrees to change them; the downloaded pack's alternative framework and role assignments are proposals, not an instruction to rewrite the project.

## Selected rover asset

The user selected `24883_MER_static.usdz` as Opportunity’s model. It is now converted locally to `game/public/assets/opportunity/opportunity-v1.glb` and replaces the visible hub and default playable rover. Six measured wheel pivots, steering/spin, model-specific terrain contact, bounded suspension approximation, camera and wheel effects are wired to it. Final arm/mast articulation remains unimplemented; the source is static. The normal rover episode is now a drive preview; the old fictional repair sequence is retained at `?scene=episode-rover-01&prototype=repair`. Build and all 33 automated checks pass, with native production/development motion review recorded in `outputs/review/opportunity-v1/REVIEW.md`. Historical missions and owner visual acceptance remain outstanding.
