/** Journal knowledge is a view of committed progress, never a second reward ledger. */
export type RobotId = 'opportunity' | 'spirit' | 'ingenuity';
export type JournalProgress = { opportunityEncountered: boolean; chapters: ReadonlySet<string> };
export const memories = [
  { id: 'blueberry-clue', title: 'The Blueberry Clue', year: '2004', lesson: 'Reading the history held in rock.' },
  { id: 'purgatory', title: 'Stuck in Purgatory', year: '2005', lesson: 'Finding a way through soft ground.' },
  { id: 'long-night', title: 'The Long Night', year: '2018', lesson: 'Understanding a dependence on sunlight.' },
] as const;
export const journalSources = {
  opportunity: { title: 'NASA · Opportunity mission', url: 'https://science.nasa.gov/mission/mer-opportunity/' },
  spirit: { title: 'NASA · Spirit mission', url: 'https://science.nasa.gov/mission/mer-spirit/' },
  recovery: { title: 'JPL · Opportunity rolls free, 2005', url: 'https://www.jpl.nasa.gov/news/nasas-opportunity-rover-rolls-free-on-mars/' },
  instruments: { title: 'NASA · Rock Abrasion Tool', url: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/science-instruments/' },
  sunlight: { title: 'JPL · The solar-powered rovers', url: 'https://www.jpl.nasa.gov/edu/resources/teachable-moment/mars-rover-mission-comes-to-an-end-but-science-legacy-live-on/' },
  ingenuity: { title: 'JPL · Ingenuity spacecraft and power', url: 'https://www.jpl.nasa.gov/news/press_kits/ingenuity/landing/quick_facts/' },
  image: { title: 'NASA · PIA07984 image and caption', url: 'https://science.nasa.gov/photojournal/slow-progress-in-dune-right-front-wheel/' },
} as const;
export const connections = [
  { id: 'rock-spirit', chapter: 'blueberry-clue', robot: 'spirit', title: 'Rock abrasion tools', explanation: 'Opportunity and Spirit both carried a Rock Abrasion Tool to expose rock beneath its weathered surface.', sources: ['instruments'] },
  { id: 'ground-spirit', chapter: 'purgatory', robot: 'spirit', title: 'Soft-ground challenges', explanation: 'Opportunity escaped Purgatory in 2005. Spirit became stuck in soft soil in 2009. A shared challenge, with different outcomes.', sources: ['recovery', 'spirit'] },
  { id: 'sun-spirit', chapter: 'long-night', robot: 'spirit', title: 'Dependence on sunlight', explanation: 'Spirit and Opportunity used solar panels for power. Dust and seasonal changes could limit the energy available to them.', sources: ['sunlight', 'spirit'] },
  { id: 'sun-ingenuity', chapter: 'long-night', robot: 'ingenuity', title: 'Dependence on sunlight', explanation: 'Ingenuity’s solar panel charged its batteries. Like Opportunity, it depended on sunlight, but its hardware and mission ending were different.', sources: ['sunlight', 'ingenuity'] },
] as const;
export const robots = [
  { id: 'opportunity', name: 'Opportunity', kind: 'Mars Exploration Rover', description: 'A robotic geologist that studied rocks and signs of past water on Mars.', source: 'opportunity' },
  { id: 'spirit', name: 'Spirit rover', kind: 'Mars Exploration Rover', description: 'Opportunity’s twin rover, exploring a different part of Mars for evidence of past water.', source: 'spirit' },
  { id: 'ingenuity', name: 'Ingenuity', kind: 'Mars Helicopter', description: 'A small helicopter built to demonstrate powered flight on Mars.', source: 'ingenuity' },
] as const;
export function journalRecords(progress: JournalProgress) {
  const recorded = memories.filter(memory => progress.chapters.has(memory.id));
  const discovered = connections.filter(connection => progress.chapters.has(connection.chapter));
  return robots.map(robot => ({ ...robot,
    available: robot.id === 'opportunity' ? progress.opportunityEncountered || recorded.length > 0 : discovered.some(connection => connection.robot === robot.id),
    memories: robot.id === 'opportunity' ? recorded : [],
    connections: robot.id === 'opportunity' ? discovered : discovered.filter(connection => connection.robot === robot.id),
  }));
}
/** Old completed/episode saves prove a visit; an arbitrary roaming bookmark does not. */
export function hasOpportunityEncounter(save: { opportunityEncountered?: boolean; chapters?: readonly string[]; completed: readonly string[]; entry: { scene: string } }): boolean {
  return save.opportunityEncountered === true || Boolean(save.chapters?.some(id => memories.some(memory => memory.id === id))) || save.completed.includes('wreck-rover-01') || save.entry.scene === 'episode-rover-01';
}
