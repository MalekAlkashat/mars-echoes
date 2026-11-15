/** Primary-source metadata. Image capture dates are distinct from publication dates and the game's April 26 setting. */
export const NASA_ARCHIVE = {
  wheel: {
    id: 'PIA07984', file: 'PIA07984-right-front-wheel.jpg',
    title: 'Right front wheel during recovery',
    capture: 'Recovery sequence · May 2005', instrument: 'Hazard Avoidance Camera', credit: 'NASA/JPL',
    page: 'https://science.nasa.gov/photojournal/slow-progress-in-dune-right-front-wheel/',
    alt: 'NASA grayscale image of Opportunity’s right front wheel buried in soft sand during recovery.',
  },
  lookback: {
    id: 'PIA07999', file: 'PIA07999-looking-back.jpg',
    title: 'Looking back at Purgatory Dune',
    capture: '11 June 2005 · Sol 491', instrument: 'Navigation Camera', credit: 'NASA/JPL',
    page: 'https://www.jpl.nasa.gov/images/pia07999-looking-back-at-purgatory-dune/',
    alt: 'NASA grayscale navigation-camera image looking back at the wheel trenches in Purgatory Dune after Opportunity escaped.',
  },
} as const;

/** Authored pacing in seconds, not historical timing. Both longer holds include time to settle the camera. */
export const SEQUENCE_TIMING = { stuck: 3.8, outro: 5.2, sand: 3.4, archive: 6 } as const;
