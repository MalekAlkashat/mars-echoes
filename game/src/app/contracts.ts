import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { AssetCache } from '../core/assets';
import type { UI } from '../ui';
import type { GameSession } from './session';

export type SceneId = 'mars-hub' | 'episode-rover-01';
export type HubBookmark = {
  position: readonly [number, number, number];
  heading: number;
  cameraYaw: number;
  cameraPitch: number;
  cameraDistance: number;
};
export type SceneEntry =
  | { scene: 'mars-hub'; bookmark?: HubBookmark }
  | { scene: 'episode-rover-01'; wreckId: string };
export type EpisodeEntry = Extract<SceneEntry, {scene: 'episode-rover-01'}>;
export type EpisodeResult = {
  episodeId: 'episode-rover-01'; wreckId: string; outcome: 'completed' | 'aborted';
};
export type SceneRequest =
  | { kind: 'enter-memory'; entry: Extract<SceneEntry, {scene: 'episode-rover-01'}>; bookmark: HubBookmark }
  | { kind: 'return-to-hub'; result: EpisodeResult };
export interface InputFrame {
  moveX: number; moveY: number; rotate: number; lookX: number; lookY: number;
  dragX: number; dragY: number; zoom: number;
  startPressed: boolean; interactPressed: boolean; confirmPressed: boolean;
  opticalPressed: boolean; replayPressed: boolean; returnPressed: boolean; leapPressed: boolean;
}
export function emptyInput(): InputFrame {
  return {moveX:0,moveY:0,rotate:0,lookX:0,lookY:0,dragX:0,dragY:0,zoom:0,
    startPressed:false,interactPressed:false,confirmPressed:false,opticalPressed:false,
    replayPressed:false,returnPressed:false,leapPressed:false};
}
export interface GameScene {
  readonly id: SceneId;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly effects: {time: number; degraded: number};
  activate(): void;
  update(dt: number, input: Readonly<InputFrame>): void;
  resize(width: number, height: number): void;
  setPaused(paused: boolean): void;
  restart(): void;
  dispose(): void;
  debug(): Record<string, string | number | boolean>;
}
export interface SceneContext {
  assets: AssetCache;
  renderer: WebGLRenderer;
  ui: UI;
  session: GameSession;
  request(request: SceneRequest): void;
  clearInput(): void;
}
export type SceneFactory = (context: SceneContext, entry: SceneEntry, signal: AbortSignal) => Promise<GameScene>;
export function assertActive(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('Scene preparation cancelled', 'AbortError');
}
