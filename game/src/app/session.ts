import type { EpisodeResult, HubBookmark } from './contracts';

export class GameSession {
  bookmark?: HubBookmark;
  readonly completed = new Set<string>();
  readonly chapters = new Set<string>();
  readonly skills = new Set<string>();

  record(result: EpisodeResult): void {
    if (result.outcome !== 'completed') return;
    if(result.chapter==='blueberry-clue'){this.chapters.add('blueberry-clue');this.skills.add('grind');}
    else this.completed.add(result.wreckId);
  }
}
