# Purgatory recovery: implementation reference

Reviewed 14 November 2026. These are paraphrased research notes, not a finished game script or a calibrated soil model. The original caption text beside this file and the linked primary records take precedence.

| Claim ID | Checked observation | Source / implementation implication |
| --- | --- | --- |
| M2-01 | Entrapment occurred April 26, 2005, sol 446 in the cited NASA record. | [PIA07999](https://science.nasa.gov/photojournal/looking-back-at-purgatory-dune/). Use this NASA date/sol pair consistently. |
| M2-02 | Ripple approximately one-third metre high and 2.5 m wide; wheels dug more than 10 cm deep. | PIA07999 and [PIA07922](https://science.nasa.gov/photojournal/opportunitys-sol-446-position-with-relative-heights/). Establish scale from the rover and low ripple before detail work. |
| M2-03 | The 360° approximate true-color panorama was acquired sols 456–464, May 6–14. Nearby ripples described in it are 10–15 cm high. | [PIA07216](https://science.nasa.gov/photojournal/opportunitys-rub-al-khali-panorama/). Palette/setting authority, with multi-sol lighting seams and smoothed sky. |
| M2-04 | Opportunity was driving backwards when it became stuck; directions were routinely alternated for lubrication. | PIA07922. A simple "reverse fixes the mistake" narrative would be misleading. Author the vehicle orientation and escape route consistently. |
| M2-05 | Eight drives during the wheel-image sequence yielded 26 cm of travel for wheel rotation equivalent to 46 m without slip. | [PIA07983](https://science.nasa.gov/photojournal/slow-progress-in-dune-left-front-wheel/). Rotation and translation must be visibly separable. This is a particular interval, not a constant slip coefficient. |
| M2-06 | The wheel sequence spans sols 460–471. Apparent acceleration near its end comes from frame spacing. | PIA07983. Use it for contact/deformation, not real-time timing curves. |
| M2-07 | Engineers tested powdery mixtures on Earth that reproduced material packing into wheel cleats. | [PIA07895](https://science.nasa.gov/photojournal/tests-to-help-plan-opportunity-moves/). Packed dry powder is not evidence of mud or liquid water. |
| M2-08 | Recovery involved testing and monitored drives, with commanded attempts May 13–June 4; extreme wheel rotation produced little actual travel. | [JPL recovery account, June 6, 2005](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/). Show a compressed sequence of observation, cautious commands and reassessment. |

## Recovery accounts

[Rover Team Tests Mars Moves on Earth — JPL, May 6, 2005](https://www.jpl.nasa.gov/news/rover-team-tests-mars-moves-on-earth/): the team paused new wheel commands while designing tests. Ordinary test sand gave overly favorable traction; engineers developed a finer mixture to reproduce the wheel/cleat behavior seen on Mars. One part of the ripple face was described as about 15°. Test ingredients were a terrestrial analogue, not a measurement of Martian composition. Use this for the Earth-team contribution and care behind a simplified puzzle, rather than presenting escape as brute acceleration.

[NASA's Opportunity Rover Rolls Free on Mars — JPL, June 6, 2005](https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/): cautious increments and review led to escape by June 4, then investigation of the troublesome ripple. The article describes 192 m worth of rotation before about 1 m of travel; this summarizes a different recovery interval than PIA07983's 46 m/26 cm example. Do not combine these into one event or turn either into the game's universal traction formula. These linked articles were read through web research; direct JPL article downloads returned HTTP 403, so these local notes are authored summaries, not archived article originals.

## Engineering reading

- [Biesiadecki & Maimone, *The Mars Exploration Rover Surface Mobility Flight Software: Driving Ambition*](https://robotics.jpl.nasa.gov/media/documents/biesiadecki_maimone06.pdf), 2006 IEEE Aerospace Conference. JPL-hosted author paper; Figure 4 concerns sol 446, soft terrain and subsequent slip checks. Useful for understanding why obstacle avoidance alone does not detect all soil hazards. Do not copy later software safeguards backwards into the initial trap without explaining chronology.
- [Maimone, Cheng & Matthies, *Two Years of Visual Odometry on the Mars Exploration Rovers*](https://robotics.jpl.nasa.gov/media/documents/rob-06-0081.R4.pdf). JPL-hosted author manuscript. Useful for image-based motion checking and incremental recovery. Publication-specific rights apply; not bundled here or labeled CC0.
- [Pancam science-team mosaics index](https://pancam.sese.asu.edu/mosaics.html): additional sols 447–448 track/ripple observations, if a later asset pass needs more detail. These additional files were not acquired in this pack.

## Conditions, wear and design constraints

Use the 2005 panorama for exposed hardware/dust context and the wheel views for packed sand and surface disturbance. Dust can change independently of permanent wear. Do not apply late-2018 condition, 2018 storm lighting, Curiosity's wheel tears or Spirit's 2009 entrapment to this scene. Do not invent damage, overheating, a timed battery crisis or capability penalties to make the puzzle harder. Any chosen numerical limits need their own dated evidence.

Keep compact low crests, convincing sand packing, nearly stationary body motion while slipping, controlled rocking/settling and local ruts. Short gameplay is a labeled time-compressed interpretation of weeks of work; it is not literal remote driving in real time. The resource pack supports a polished guided sequence, while the final mechanics, shot design, later robot skill connection and acceptance remain to be decided through the existing mission plan.
