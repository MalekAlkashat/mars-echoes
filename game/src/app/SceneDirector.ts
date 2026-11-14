import type { GameScene, SceneEntry, SceneRequest } from './contracts.ts';
import type { GameSession } from './session.ts';

export interface DirectorOptions {
  create(entry: SceneEntry, signal: AbortSignal, request: (request: SceneRequest) => void): Promise<GameScene>;
  session: GameSession;
  hooks: {
    switch(scene: GameScene): void;
    loading(loading: boolean): void;
    error(message: string): void;
    clearInput(): void;
    /** Successful route and associated session mutations have committed. */
    settled?(): void;
  };
}

type PendingScene = { controller: AbortController; source?: GameScene };
type TransitionIntent =
  | {kind:'open';entry:SceneEntry}
  | {kind:'request';request:SceneRequest};

export class SceneDirector {
  active?: GameScene;
  entry?: SceneEntry;
  transitioning = false;
  paused = false;
  private pending?: PendingScene;
  private disposed = false;
  private readonly options: DirectorOptions;
  private failedIntent?: TransitionIntent;

  constructor(options: DirectorOptions) { this.options = options; }

  async open(entry: SceneEntry): Promise<boolean> {
    const succeeded=await this.transition(entry,{kind:'open',entry});
    if(succeeded)this.options.hooks.settled?.();
    return succeeded;
  }

  private async transition(entry: SceneEntry, intent: TransitionIntent): Promise<boolean> {
    if (this.disposed || this.transitioning) return false;
    const source = this.active;
    const oldEntry = this.entry;
    const transaction: PendingScene = {controller: new AbortController(), source};
    const {hooks} = this.options;
    this.pending = transaction;
    this.failedIntent = undefined;
    this.transitioning = true;
    hooks.clearInput();
    source?.setPaused(true);
    hooks.loading(true);
    let destination: GameScene | undefined;
    try {
      destination = await this.options.create(entry, transaction.controller.signal, request => {
        if (destination && this.active === destination && !this.disposed) void this.request(request);
      });
      if (this.pending !== transaction || transaction.controller.signal.aborted || this.disposed) {
        destination.dispose();
        return false;
      }
      if (destination.id !== entry.scene) throw new Error('Scene factory returned an unexpected scene.');
      this.active = destination;
      this.entry = entry;
      hooks.switch(destination);
      destination.activate();
      destination.setPaused(false);
      this.paused = false;
    } catch (error) {
      destination?.dispose();
      if (this.pending !== transaction || this.disposed) return false;
      this.active = source;
      this.entry = oldEntry;
      if (source) {
        hooks.switch(source);
        source.activate();
        source.setPaused(this.paused);
      }
      this.failedIntent = intent;
      hooks.error(error instanceof Error ? error.message : 'The destination could not load.');
      return false;
    } finally {
      if (this.pending === transaction) {
        this.pending = undefined;
        this.transitioning = false;
        hooks.clearInput();
        hooks.loading(false);
      }
    }
    // The source stays recoverable until destination activation has succeeded.
    source?.dispose();
    return true;
  }

  async request(request: SceneRequest): Promise<boolean> {
    if (this.disposed || this.transitioning) return false;
    const {session} = this.options;
    if (request.kind === 'enter-memory') {
      if (this.active?.id !== 'mars-hub') return false;
      const succeeded = await this.transition(request.entry,{kind:'request',request});
      if (succeeded) session.bookmark = {...request.bookmark, position: [...request.bookmark.position]};
      if (succeeded) this.options.hooks.settled?.();
      return succeeded;
    }
    if (this.active?.id !== 'episode-rover-01' || this.entry?.scene !== 'episode-rover-01') return false;
    if (request.result.episodeId !== this.active.id || request.result.wreckId !== this.entry.wreckId) return false;
    const succeeded = await this.transition({scene:'mars-hub', bookmark: session.bookmark},{kind:'request',request});
    if (succeeded) session.record(request.result);
    if (succeeded) this.options.hooks.settled?.();
    return succeeded;
  }

  cancel(): void {
    this.failedIntent = undefined;
    if (!this.pending) return;
    const pending = this.pending;
    this.pending = undefined;
    pending.controller.abort();
    this.transitioning = false;
    this.options.hooks.clearInput();
    if (!this.disposed) pending.source?.setPaused(this.paused);
    this.options.hooks.loading(false);
  }

  retry(): Promise<boolean> {
    const intent = this.failedIntent;
    if (!intent || this.disposed || this.transitioning) return Promise.resolve(false);
    return intent.kind === 'open' ? this.open(intent.entry) : this.request(intent.request);
  }

  setPaused(paused: boolean): void {
    if (this.disposed) return;
    this.paused = paused;
    this.options.hooks.clearInput();
    this.active?.setPaused(this.transitioning || paused);
  }

  restart(): void {
    if (this.disposed) return;
    this.cancel();
    this.active?.restart();
    this.setPaused(false);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cancel();
    this.options.hooks.clearInput();
    this.active?.dispose();
    this.active = undefined;
    this.entry = undefined;
  }
}
