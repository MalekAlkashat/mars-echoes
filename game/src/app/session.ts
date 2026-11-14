import type { EpisodeResult, HubBookmark } from './contracts';

export class GameSession {
  bookmark?: HubBookmark;
  readonly completed = new Set<string>();

  record(result: EpisodeResult): void {
    if (result.outcome === 'completed') this.completed.add(result.wreckId);
  }
}
