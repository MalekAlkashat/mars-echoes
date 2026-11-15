/**
 * Mission 2 slice copy. Claim IDs resolve to outputs/planning/mission-two/claims-ledger.json.
 * Opportunity does not speak and has no feelings here; the text describes what the team saw and did.
 */
export const purgatoryText = {
  title: 'Stuck in Purgatory',
  location: 'Meridiani Planum · 26 April 2005 · Sol 446', // PG-01, PG-02
  intro: 'Drive across the firm plain, then replay the encounter with Purgatory. Read the wheels, test short moves and find your way back to firmer ground.',
  disclaimer: 'Compact reconstruction. The command puzzle is simplified, and weeks of work are compressed for play.',
  labels: 'Reconstruction · simplified puzzle · time compressed',
  ending: {
    title: 'Patience made progress.',
    purpose: 'You learned to read the difference between spinning wheels and real movement.',
    history: 'In 2005, Opportunity became trapped in a sand ripple. The team tested recovery moves on Earth, then freed the rover through cautious, closely watched drives.', // PG-04, PG-12, PG-14; JPL June 6, 2005
    lesson: 'Observe. Test a small move. Compare the result. Adapt. That is how exploration keeps going.', // educational interpretation, not a NASA quote
  },
  phases: {
    practice: { title: 'Find your footing', body: 'WASD drives the rover. Try the firm ground, then run the reconstructed sol 446 drive to begin the recovery.' },
    replay: { title: 'The drive on sol 446', body: 'A long drive south, replayed. Watch the wheels and the distance.' }, // PG-05, PG-07
    recover: { title: 'Get back to firm ground', body: 'Hold W to ease forward. Short recovery moves are metered for you. Follow the guide toward firm ground.' }, // PG-04; assistance and guide are gameplay choices
    free: { title: 'On firmer ground', body: 'All six wheels are on firm ground. The real recovery took more than five weeks of planning, testing and careful driving.' }, // PG-14
  },
  clues: {
    ready: 'W / S forward / reverse · A / D steer. The optional planner shows a route before you send it.',
    firm: 'Planned and actual agree. This is firm ground.',
    softSmall: 'Short moves made progress in the soft sand.',
    softBig: 'The wheels spun and dug deeper. Try shorter moves.',
    softTurn: 'Turning in soft sand mostly digs in.',
    deeper: 'That way lies deeper sand. The plan was cut short.',
    envelope: 'That would leave the ground the team has imaged. The plan was cut short.',
    refused: 'This plan would leave the imaged ground. Change it before sending.',
    replayDone: 'The wheels kept turning. The rover barely moved, and after a turn that did not work it stopped itself.', // PG-07
    interrupted: 'Plan stopped. The rover is where the last move left it.',
  },
  sources: [
    ['Looking back at Purgatory (PIA07999)', 'https://www.jpl.nasa.gov/images/pia07999-looking-back-at-purgatory-dune/'],
    ['Sol 446 position (PIA07922)', 'https://www.jpl.nasa.gov/images/pia07922-opportunitys-sol-446-position-with-relative-heights/'],
    ['Rover rolls free, 6 June 2005', 'https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/'],
    ['Tests on Earth, 6 May 2005', 'https://www.jpl.nasa.gov/news/rover-team-tests-mars-moves-on-earth/'],
    ['Learning to drive the rovers', 'https://robotics.jpl.nasa.gov/news/learning-to-drive-the-mars-rovers/'],
  ],
} as const;
