# Mission 3: The Long Night — research and production handoff

Prepared **15 November 2026, Asia/Riyadh**. The pack provides an evidence-based foundation for authoring the chapter: nine image/chart originals, one primary atmospheric paper, 19 offline source pages, five additional web-read/link-only pages, and a 39-entry claim ledger. The most important corrections concern the final images and uncertainty after communication ceased.

**Worktree:** `C:/Nasa 2026/mars-echoes/work/mission-three-research`. **Branch:** `codex/mission-three-research`. **Base:** `548ce49bbeecbd77404b868c1e47e615a6ef5fd9`. **Owned additions:** `assets/references/mission-three/v1/` and this report. Nothing was implemented, committed, merged, pushed or deployed. Main's existing staged resources, local notes, stashes and other worktrees were left outside this task.

Start with [the offline visual catalog](../../assets/references/mission-three/v1/index.html), [claims](../../assets/references/mission-three/v1/claims.json), [file manifest](../../assets/references/mission-three/v1/manifest.json) and [source-access audit](../../assets/references/mission-three/v1/source-notes.md). The ledger contains the precise evidence locators and qualifications; its source IDs are used below.

## A. Timeline and engineering

| Interval | Evidence and safe interpretation |
| --- | --- |
| Late May–early June 2018 | MRO detection on May 30 preceded Opportunity's reduced operations by June 6. The June 6 MARCI map is a dated regional view, not a map of an already uniformly obscured planet. [S01](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/), R09. |
| June 10 | Opportunity still communicated while science remained suspended. [S01, dated June 10 update](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/). |
| Around 09:30 PDT, June 10, sol 5111 | Exposure represented in PIA22929. Its caption gives later relay/receipt times; these are distinct events. [S02](https://science.nasa.gov/photojournal/opportunitys-last-message/). |
| Around 09:33 PDT | Later Pancam exposures survive as PIA22930 thumbnails; their full frames never arrived. The caption's EDT a.m. text is inconsistent with PDT; use the latter. [S03](https://science.nasa.gov/photojournal/last-images-opportunity-took/). |
| June 12 | After a failed contact attempt, engineers described an assumed low-power state. This was not a received transcript of a final shutdown. [S01, dated June 12 update](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/). |
| June 19–20 onward | The event became planet-encircling; the contemporary update and retrospective paper differ by a day in describing classification/circumnavigation. The paper places global peak intensity later, in early July. [S01](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/), [S20, abstract and pp.4–5](https://ntrs.nasa.gov/citations/20190027303). |
| September 11 and 20 | More frequent commanding accompanied improving atmospheric estimates; HiRISE then observed the rover on September 20. Neither established its battery state or solar-array dust loading. [S07](https://www.jpl.nasa.gov/news/update-on-opportunity-rover-recovery-efforts/), [S10](https://www.uahirise.org/ESP_056955_1775). |
| November–January | Teams hoped seasonal winds might remove deposited array dust. This was an uncertain recovery opportunity. [S07, October updates](https://www.jpl.nasa.gov/news/update-on-opportunity-rover-recovery-efforts/). |
| January–February 2019 | Additional commands investigated unlikely radio/clock scenarios. The final attempt was late February 12 in JPL's account; the mission conclusion was announced February 13. [S08](https://www.jpl.nasa.gov/news/rover-team-beaming-new-commands-to-opportunity-on-mars/), [S09](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/). |

June 2018 to February 2019 is roughly eight months. That rounded interval is not a continuous daily command log or a measured duration of a particular internal fault.

**Engineering explanation:** atmospheric dust attenuated sunlight needed by a solar-powered rover. Deposited dust on arrays is a separate mechanism that can persist as the sky clears. Tau is optical opacity, not layer thickness or a battery percentage. The dated recovery account gives a site average near 0.5 and a final reported value near 10.8; these are contextual observations, not a continuous global peak dataset. [S06, “A tau below 2”](https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/).

The proposed switching interaction has a defensible broad basis in reducing science activity and energy demand. Actual low-power protection was automatic; sources describe several possible faults after silence. A few player choices can teach conservation, but their subsystem watts, thresholds and order would be authored simplifications. A mandatory heater-off action or hidden saving combination would misrepresent the evidence. [S01](https://www.jpl.nasa.gov/news/opportunity-hunkers-down-during-dust-storm/), [S06, “Rover faults out”](https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/).

Do not label Curiosity's ultraviolet/temperature curves as Opportunity measurements. The paper's figures identify different instruments/sites; no tau-to-screen-brightness, tau-to-energy or energy-to-survival model was derived here. [S20, pp.5–7](https://ntrs.nasa.gov/citations/20190027303).

## B. Evidence matrix and source conflicts

[claims.json](../../assets/references/mission-three/v1/claims.json) records 30 verified entries, five unverified entries, two conflicts and two design proposals. Each supported entry has a primary URL and caption/heading/PDF-page locator. Related captions and duplicated NASA releases are identified as related records rather than independent measurements.

| Claim group | Ledger IDs | Production implication |
| --- | --- | --- |
| Site and mapping | C01, C26–27 | Reconstruct the region; do not invent exact rover coordinates or heading. |
| Opacity and storm chronology | C02–08, C16–17, C30 | Use dated observations and explicit time compression. |
| Final archival images | C09–15 | Preserve acquisition/transmission distinctions and missing data. |
| Faults and recovery | C18–25 | Show human persistence and uncertainty, not a confirmed mechanical death sequence. |
| SUNLIGHT / legacy | C28–29 | Shared energy dependence and historical odometry; distinct robot outcomes. |
| Rejected precision and other gaps | C31–33, C36–39 | No fabricated battery trace, pose, wind damage, authentic audio or corrected sol by guesswork. |

Specific corrections to supplied facts:
- **F-23:** qualify “last image.” R01 is last transmitted partial full frame; R02 contains later exposures. The black unreceived lower portion of R01 is not evidence that the landscape itself was black. [S02](https://science.nasa.gov/photojournal/opportunitys-last-message/), [S03](https://science.nasa.gov/photojournal/last-images-opportunity-took/).
- **F-24:** “dust thickness” is too imprecise. Use atmospheric opacity. The 0.5 reference is a site average; 10.8 is an approximate final reported observation, not a measured end-to-end maximum for every site. [S06](https://www.jpl.nasa.gov/news/six-things-about-opportunitys-recovery-efforts/).
- Do not silently repair the final-panorama caption's June 3 / sol 5014 mismatch; omit that pair. [S05](https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/).
- The January count above 600 attempts and February count above 1,000 commands describe different times/count wording. They do not identify each command in a counter animation. [S08](https://www.jpl.nasa.gov/news/rover-team-beaming-new-commands-to-opportunity-on-mars/), [S09](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/).

## C. Prioritized resource catalog

All listed originals below were downloaded, hashed and format-checked. Exact dimensions, byte sizes, SHA256, creators, credits, observation/publication dates, URLs and restrictions are in the manifest.

| Priority | ID | Resource and use |
| --- | --- | --- |
| Essential | R01 | PIA22929: 1024 × 1024 partial transmitted image; archival ending card. |
| Essential | R02 | PIA22930: 224 × 96 thumbnail pair; last-taken distinction. |
| Essential | R03 | PIA22521: 1500 × 1000 official simulated opacity views; atmosphere reference. |
| Essential | R04 | PIA22909: 900 × 201 approximate true-color final-site panorama; broad palette/composition only. |
| Useful | R05 | 3000 × 670 annotated false-color panorama; targets, tracks and horizon relationships. |
| Useful | R06 | PIA22549: 2170 × 1390 post-storm HiRISE view. |
| Useful | R07 | ESP_056955_1775: 840 × 333 publisher context image, including its rover-location box. |
| Useful | R08 | 2023 × 1236 original seasonal opacity chart; briefing, not numeric telemetry. |
| Useful | R09 | 1400 × 788 June 6 MARCI map; regional storm context. |
| Optional | R10 | Smith & Guzewich, *The Mars Global Dust Storm of 2018*, 8-page ICES 2019 paper, NASA NTRS 20190027303. Text and figure captions read; no plot-render QA claimed. |

**Link-only / deliberately not acquired:** full 23,123 × 5,163 panorama TIFFs linked from [true color S21](https://www.jpl.nasa.gov/images/pia22909-opportunity-legacy-pan-true-color/) and [false color S22](https://www.jpl.nasa.gov/images/pia22908-opportunity-legacy-pan-false-color/); 730 MB and 380 MB HiRISE JP2 products, associated labels and other large products on [S10](https://www.uahirise.org/ESP_056955_1775); five web-readable source pages whose direct responses were empty. Large products require a specific terrain/detail need and a deliberate download/processing plan. No exact final-site DTM was established.

**Reuse:** [reuse.json](../../assets/references/mission-three/v1/reuse.json) records 15 local model/provenance/rig/material/source dependencies and hashes. Keep the chosen NASA MER GLB, not another rover download. A shared model and material library do not establish dated wear, correct terrain or final articulation.

## D. Visual guide and authenticity traps

Observed in the acquired images: the true-color overview shows shallow sloping terrain, sandy gaps, fragmented/tabular rock and the descending valley/crater context. The false-color annotated version makes feature relationships readable but has deliberately altered colors. The later orbital views add location context, not a rover-eye lighting reference.

PIA22521's six panels are simulated; their apparent sun sizes and displayed RGB values are not a physical lighting calibration. R01 contains camera noise and unreceived data. R02 has only thumbnail detail. R04/R05 are mosaics accumulated over weeks; lower-left monochrome areas lack a full filter set. None is an instantaneous final look around the rover.

Use separate labels for observation, processed panorama, false color, orbital context, simulation and authored reconstruction. Preserve originals. Do not recolor or generatively complete archival evidence, infer sunlight from displayed pixel brightness, or stretch a perspective panorama into a seamless material. The true-color JPEG is too small for a detailed skybox or rock authoring.

The HiRISE coordinates are the image center; its 25 cm/pixel metadata applies to the full map-projected product, not our context JPEG. No body heading, pitch/roll, exact panel dust amount or final hardware failure was recovered.

## E. Mapping to mission beats, HUD, ending and SUNLIGHT

| Beat / element | Evidence | Safe implementation target |
| --- | --- | --- |
| Establish final region | R04/R05, C01/C14–15 | Compact labeled reconstruction with a readable horizon and brief purposeful driving. |
| Storm progression | R03/R08/R09, C02–05/C16–17 | Coherent obscuration and reduced solar input; separate compressed dates from animation seconds. |
| Power decisions | C18–20, C34 | A few clearly simplified demand choices; preserve essential pause/exit readability. |
| Loss of contact | R01/R02, C08–13 | Correctly captioned archival evidence; no invented last words or exact battery-zero animation. |
| Later recovery campaign | R06/R07, C21–25 | Explicit period break; aggregate “more than 1,000 commands” text, not a fake transmission log. |
| Return and reward | C35, existing game contract | Fictional spirit transition back beside the silent rover; SUNLIGHT only after successful completion/return integration. |
| SUNLIGHT links | C28; [S14](https://www.jpl.nasa.gov/news/nasas-ingenuity-mars-helicopter-team-says-goodbye-for-now/), [S15](https://science.nasa.gov/mission/mer-spirit/) | Explain that Spirit, Opportunity and Ingenuity relied on sunlight. Do not imply matching hardware or matching mission endings. |
| Memory Check | C02/C20/C24 | Ask what dust blocked, whether clearing sky proves clean panels, and whether engineers kept trying; avoid unsupported numeric battery answers. |
| Legacy | C29 and [S09](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-mission-on-mars-comes-to-end/) | Historical achievement and continuing scientific work; final distance is not a claim of today's record. |

## F. Feasible version and fallback — proposals only

**Small playable version:** one compact map, one short drive/observation task, a legible two-stage conservation choice, controlled atmosphere transition, archival card, a clearly separated recovery interlude and return. Sunlight feedback can use qualitative states such as available/reduced/insufficient; any stored-energy meter must say illustrative. Display the reported tau sample as an observation card rather than a pretend continuous telemetry stream.

Give choices immediate, understandable feedback while the historical outcome remains fixed. Do not reward an apparent rescue solution or punish the player for not preventing the real loss of contact. Pause must freeze chapter time; skip/reduced motion must retain the essential explanation.

**Fallback:** retain a brief interactive observation and conservation explanation, then use a lightweight dated sequence of locally hosted evidence cards and restrained atmospheric changes. This fallback is a proposal, not an authorized scope cut or implemented behavior.

Performance direction: reuse the renderer/rover/materials, keep effects scene-owned, avoid huge source imagery at runtime and start with inexpensive sky/fog/light changes. Add bounded particles only if useful and measured. These are design recommendations, not performance results.

## G. Missing/custom assets and decisions, ordered by production impact

1. **Shared integration boundary:** source at base 548ce49 supports blueberry-clue only in chapter/checkpoint/reward types. Coordinate Mission 3 routing, saves, validation/migration and exactly-once SUNLIGHT with the integrator. No generic chapter host is assumed.
2. **Level and rover pose:** author the compact site and safe bounds. Exact final body/arm pose is unresolved; use a clearly labeled interpretation or retrieve appropriate PDS product/pose metadata first.
3. **Atmosphere and feedback:** author an optimized coherent storm and a defensible illustrative energy presentation; no calibrated parameter curve is supplied.
4. **Dated rover condition:** the existing static GLB needs scene-owned late-mission dust/material treatment if selected. A complete late-June close-up dust/pose mask was not found; do not paint invented damage.
5. **Archival UI and timing:** produce accessible image cards, full credits, missing-data explanation and period breaks. Larger overview imagery is optional pending actual camera needs.
6. **Audio:** no authentic Opportunity storm recording was found. Any synthesized, composed, Earth or other-mission audio needs provenance, licensing and honest labeling. No audio was downloaded.
7. **Optional depth:** a numeric power series, exact final coordinates/attitude, verified site DTM and higher-resolution true-color reference remain unresolved. They do not justify inventing telemetry or a surveyed map.

## H. Final audit and handoff limits

The source audit excludes invented speech/feelings, NASA-abandonment language, an alternative rescue ending, unsupported destructive winds, continuous post-contact telemetry and a known final mechanical cause. Source contradictions and failed accesses are retained in source-notes.md; missing evidence remains missing.

Checks performed: media hashes/sizes, Pillow decode/format/dimensions for all nine images, PDF signature and NTRS metadata/eight-page web text, source-page hashes, resource/category/credit review, labeled contact-sheet inspection and offline catalog checks recorded with the pack. No new package, runtime import, gameplay test, game build, calibrated rendering benchmark or user acceptance is claimed for this research-only change.

Use `.agents/skills/{plan,feature-handoff,game-level-design,materials-to-game,gameplay-visual-review,threejs-gameplay-systems,threejs-debug-profiler}/SKILL.md` as applicable in later implementation, subject to repository overrides. Later acceptance needs a normal hub → chapter → archival/recovery sequence → hub journey, pause/reduced motion, save/reload, aborted/failed return, once-only reward, asset/error checks and measured resource cleanup. No gameplay preview server was started for this research task.

Final validation passes for 29 acquired originals/source HTML files, 10 preview derivatives and all 39 claim/evidence structures. The catalog was checked at 1440 × 1000 and 390 × 844: nine decoded images, no horizontal overflow, missing local links, browser errors, failed requests or external requests. Its desktop/mobile screenshots were visually inspected; this is catalog QA, not game or physical-phone QA.

Main preservation is recorded in [preservation.json](../../assets/references/mission-three/v1/preservation.json): HEAD, index, status and stashes match the starting snapshot; all 39 protected local files retain their hashes. Media originals total 4,199,959 bytes; the complete pack, including original page snapshots, documentation and QA, is approximately 11.6 MB. Acquisition/validation results and catalog QA are alongside it. Deliver this isolated directory/report for review and later integration. Main's newer commits or concurrent changes must be reconciled before any future merge.
