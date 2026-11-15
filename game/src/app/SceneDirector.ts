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
    if(succeeded){
      if(entry.scene==='episode-rover-01'&&entry.journey&&this.options.session.journey?.boundary==='next'){const j=this.options.session.journey;this.options.session.journey={chapter:j.chapter,bookmark:j.bookmark};}
      this.options.hooks.settled?.();
    }
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
    source?.setPreparing?.(true);
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
      destination.setPaused(this.paused);
    } catch (error) {
      destination?.dispose();
      if (this.pending !== transaction || this.disposed) return false;
      this.active = source;
      this.entry = oldEntry;
      if (source) {
        source.setPreparing?.(false);
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
      const savedJourney=session.journey;
      const entry=request.entry.journey && savedJourney
        ? {scene:'episode-rover-01' as const,wreckId:request.entry.wreckId,chapter:savedJourney.chapter,journey:true as const,resume:savedJourney.resume}
        : request.entry;
      const succeeded = await this.transition(entry,{kind:'request',request});
      if (succeeded) {
        session.bookmark = {...request.bookmark, position: [...request.bookmark.position]};
        if(entry.journey && !savedJourney)session.journey={chapter:entry.chapter??'blueberry-clue',bookmark:session.bookmark};
        if(entry.journey && savedJourney){session.bookmark=savedJourney.bookmark;if(savedJourney.boundary==='next')session.journey={chapter:savedJourney.chapter,bookmark:savedJourney.bookmark};}
        this.options.hooks.settled?.();
      }
      return succeeded;
    }
    if (this.active?.id !== 'episode-rover-01' || this.entry?.scene !== 'episode-rover-01') return false;
    if(request.kind==='remember-overtime'){
      if(!this.entry.journey||!session.chapters.has('purgatory')||!((this.entry.chapter==='purgatory'&&session.journey?.boundary==='next')||this.entry.chapter==='long-night'))return false;
      session.skills.add('overtime');this.options.hooks.settled?.();return true;
    }
    if (request.result.episodeId !== this.active.id || request.result.wreckId !== this.entry.wreckId) return false;
    if (request.result.chapter !== this.entry.chapter) return false;
    const journey=this.entry.journey && session.journey;
    const next=this.entry.chapter==='blueberry-clue'?'purgatory':this.entry.chapter==='purgatory'?'long-night':undefined;
    if(request.kind==='chapter-boundary') {
      if(!journey || request.result.outcome!=='completed')return false;
      if(next)session.record(request.result);
      session.journey={chapter:next??'long-night',bookmark:journey.bookmark,boundary:next?'next':'return',
        ...(!next?{resume:(this.active.getSaveEntry?.() as Extract<SceneEntry,{scene:'episode-rover-01'}>)?.resume}:{})};
      // Save the earned chapter before any asynchronous destination work begins.
      this.options.hooks.settled?.();
      return true;
    }
    if(journey && request.result.outcome==='completed' && next) {
      if(session.journey?.boundary!=='next' || session.journey.chapter!==next)return false;
      const succeeded=await this.transition({scene:'episode-rover-01',wreckId:this.entry.wreckId,chapter:next,journey:true},{kind:'request',request});
      if(succeeded){session.journey={chapter:next,bookmark:journey.bookmark};this.options.hooks.settled?.();}
      return succeeded;
    }
    // Keep an unfinished checkpoint even when the player deliberately leaves the memory.
    if(journey && request.result.outcome==='aborted' && !journey.boundary) {
      const saved=this.active.getSaveEntry?.();
      if(saved?.scene==='episode-rover-01')journey.resume=saved.resume;
    }
    const finished=Boolean(journey && request.result.outcome==='completed' && this.entry.chapter==='long-night');
    if(finished && journey && journey.boundary!=='return')return false;
    const succeeded = await this.transition({scene:'mars-hub',bookmark:journey?journey.bookmark:session.bookmark,...(finished?{memoryReturn:true as const}:{})},{kind:'request',request});
    if (succeeded) {
      session.record(request.result,!session.journey||finished);
      if(finished){session.opportunityComplete=['blueberry-clue','purgatory','long-night'].every(id=>session.chapters.has(id));session.journey=undefined;}
      this.options.hooks.settled?.();
    }
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
    if (!this.disposed) {
      pending.source?.setPreparing?.(false);
      pending.source?.setPaused(this.paused);
    }
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
