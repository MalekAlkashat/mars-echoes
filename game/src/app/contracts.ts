import type { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { AssetCache } from '../core/assets';
import type { UI } from '../ui';
import type { GameSession } from './session';
import type {PurgatoryCheckpointData} from '../scenes/episodes/rover/missions/purgatory/checkpoint';

export type MissionPhase = 'approach'|'brush'|'grind'|'inspect'|'compare'|'water'|'evidence';
export type OpportunityChapter = 'blueberry-clue' | 'purgatory' | 'long-night';
export type OpportunityJourney = {chapter:OpportunityChapter; bookmark:HubBookmark; resume?:RoverCheckpoint; boundary?:'next'|'return'};
export type SceneId = 'mars-hub' | 'episode-rover-01';
export type HubBookmark = {
  position: readonly [number, number, number];
  heading: number;
  cameraYaw: number;
  cameraPitch: number;
  cameraDistance: number;
};
/** Serializable gameplay checkpoint. Transient vehicle velocity is deliberately not restored. */
export type RoverCheckpoint = {
  position: readonly [number, number]; heading: number;
  cameraYaw: number; cameraPitch: number; cameraDistance: number;
  started: boolean; time: number;
} & (({kind:'purgatory'} & PurgatoryCheckpointData) | {kind:'long-night'; phase:'arrival'|'storm'|'silence'|'archive'|'recovery'|'legacy'; elapsed:number; imaging:boolean; science:boolean; reserve?:number} | {kind:'opportunity'; optical:boolean} | {kind:'blueberry-clue'; phase:MissionPhase} | {
  kind:'repair'; phase:'ready'|'drive'|'scan'|'extract'|'align'|'insert'|'calibrate'|'relay'|'transmit'|'end';
  elapsed:number; offset:{x:number;y:number;angle:number}; failedAttempts:number; repaired:boolean;
  serviceHeading:number; opticalRemaining:number;
});
export type SceneEntry =
  | { scene: 'mars-hub'; bookmark?: HubBookmark; memoryReturn?:true }
  | { scene: 'episode-rover-01'; wreckId: string; chapter?: OpportunityChapter; journey?:true; resume?: RoverCheckpoint };
export type EpisodeEntry = Extract<SceneEntry, {scene: 'episode-rover-01'}>;
export type EpisodeResult = {
  episodeId: 'episode-rover-01'; wreckId: string; outcome: 'completed' | 'aborted'; chapter?: 'blueberry-clue' | 'purgatory' | 'long-night';
};
export type SceneRequest =
  | { kind: 'enter-memory'; entry: Extract<SceneEntry, {scene: 'episode-rover-01'}>; bookmark: HubBookmark }
  | { kind: 'remember-overtime' }
  | { kind: 'chapter-boundary'; result: EpisodeResult }
  | { kind: 'return-to-hub'; result: EpisodeResult };
export interface InputFrame {
  moveX: number; moveY: number; rotate: number; lookX: number; lookY: number;
  rushHeld: boolean;
  dragX: number; dragY: number; zoom: number;
  interactHeld: boolean; startPressed: boolean; interactPressed: boolean; confirmPressed: boolean;
  opticalPressed: boolean; replayPressed: boolean; returnPressed: boolean; leapPressed: boolean;
}
export function emptyInput(): InputFrame {
  return {moveX:0,moveY:0,rotate:0,lookX:0,lookY:0,rushHeld:false,dragX:0,dragY:0,zoom:0,
    interactHeld:false,startPressed:false,interactPressed:false,confirmPressed:false,opticalPressed:false,
    replayPressed:false,returnPressed:false,leapPressed:false};
}
export interface GameScene {
  readonly id: SceneId;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly effects: {time: number; degraded: number; speed?: number};
  activate(): void;
  update(dt: number, input: Readonly<InputFrame>): void;
  resize(width: number, height: number): void;
  setPaused(paused: boolean): void;
  restart(): void;
  dispose(): void;
  debug(): Record<string, string | number | boolean>;
  /** Optional safe exploration checkpoint; airborne spirits keep their last grounded save. */
  getBookmark?(): HubBookmark | undefined;
  /** Current scene-local progress, supplied by the scene rather than inferred from debug labels. */
  getSaveEntry?(): SceneEntry;
  /** Scene-local cinematic adapter; never interpolates between different maps. */
  journeyShot?(direction:'in'|'out', seconds:number, reduced:boolean):void;
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
