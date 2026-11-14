import type { GameScene, SceneContext, SceneEntry } from './contracts';

export async function createScene(context:SceneContext,entry:SceneEntry,signal:AbortSignal):Promise<GameScene> {
  if(entry.scene==='mars-hub') {
    const {createMarsHub}=await import('../scenes/mars-hub');
    signal.throwIfAborted();return createMarsHub(context,entry,signal);
  }
  const {createRoverEpisode}=await import('../scenes/episodes/rover');
  signal.throwIfAborted();return createRoverEpisode(context,entry,signal);
}
