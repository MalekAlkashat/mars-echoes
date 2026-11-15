import type { EpisodeResult, HubBookmark, OpportunityJourney } from './contracts';

export class GameSession {
  bookmark?: HubBookmark;
  journey?: OpportunityJourney;
  opportunityComplete = false;
  readonly completed = new Set<string>();
  readonly chapters = new Set<string>();
  readonly skills = new Set<string>();

  record(result: EpisodeResult): void {
    if (result.outcome !== 'completed') return;
    if(result.chapter==='blueberry-clue'){this.chapters.add('blueberry-clue');this.skills.add('grind');}
    else if(result.chapter==='purgatory'){this.chapters.add('purgatory');this.skills.add('sand');}
    else if(result.chapter==='long-night'){this.chapters.add('long-night');this.skills.add('sunlight');}
    else this.completed.add(result.wreckId);
  }
}
