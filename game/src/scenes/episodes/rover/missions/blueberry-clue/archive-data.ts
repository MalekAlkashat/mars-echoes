/** NASA-delivered photographs, kept distinct from the chapter's reconstructed surfaces. */
export type ArchiveImage = {
  readonly id: string;
  readonly file: string;
  readonly title: string;
  readonly capture: string;
  readonly instrument: string;
  readonly color: string;
  readonly credit: string;
  readonly page: string;
  readonly alt: string;
  readonly context: string;
  readonly width: number;
  readonly height: number;
};

export const NASA_ARCHIVE = {
  abrasion: {
    id: 'PIA05459', file: 'mckittrick.jpg',
    title: 'McKittrick · the abraded surface',
    capture: 'Grinding event · Sol 30 · 23 February 2004',
    instrument: 'Front Hazard Avoidance Camera', color: 'Monochrome', credit: 'NASA/JPL',
    page: 'https://science.nasa.gov/photojournal/circular-signs-of-the-rock-abrasion-tool/',
    alt: 'NASA monochrome photograph of the shallow circular abrasion on McKittrick in the Eagle Crater outcrop.',
    context: 'A real abrasion result. The event date identifies the grinding, not a separately verified image capture time.',
    width: 1024, height: 1024,
  },
  comparison: {
    id: 'PIA05634', file: 'berry-bowl.jpg',
    title: 'Berry Bowl · the brushed comparison',
    capture: 'Sol 48 · early 2004',
    instrument: 'Panoramic Camera', color: 'Approximate true color', credit: 'NASA/JPL-Caltech/Cornell',
    page: 'https://science.nasa.gov/resource/discovery-served-up-in-a-bowl/',
    alt: 'NASA approximate true-color photograph of spherules on Berry Bowl and the brushed Near Empty comparison area.',
    context: 'Near Empty was brushed, not ground. Mineral identification came from instrument measurements, not appearance alone.',
    width: 768, height: 512,
  },
} as const satisfies Record<string, ArchiveImage>;
