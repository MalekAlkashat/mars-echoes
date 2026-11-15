import type { EpisodeResult, HubBookmark, OpportunityJourney } from './contracts';

export class GameSession {
  bookmark?: HubBookmark;
  journey?: OpportunityJourney;
  opportunityComplete = false;
  opportunityEncountered = false;
  onJournalUpdate?: () => void;

  encounterOpportunity(): void {
    if(this.opportunityEncountered)return;
    this.opportunityEncountered=true;
    this.onJournalUpdate?.();
  }
  readonly completed = new Set<string>();
  readonly chapters = new Set<string>();
  readonly skills = new Set<string>();

  record(result: EpisodeResult): void {
    if (result.outcome !== 'completed') return;
    const previouslyRecorded = result.chapter ? this.chapters.has(result.chapter) : true;
    if(result.chapter==='blueberry-clue'){this.chapters.add('blueberry-clue');this.skills.add('grind');}
    else if(result.chapter==='purgatory'){this.chapters.add('purgatory');this.skills.add('sand');}
    else if(result.chapter==='long-night'){this.chapters.add('long-night');this.skills.add('sunlight');}
    else this.completed.add(result.wreckId);
    if(!previouslyRecorded){this.opportunityEncountered=true;this.onJournalUpdate?.();}
  }
}
