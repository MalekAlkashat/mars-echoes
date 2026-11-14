import './ui/style.css';
import { Game } from './app/Game';
import type { SceneEntry } from './app/contracts';

const scene = new URLSearchParams(location.search).get('scene');
const entry: SceneEntry = scene === 'episode-rover-01'
  ? {scene:'episode-rover-01',wreckId:'wreck-rover-01'}
  : {scene:'mars-hub'};
const game = new Game(entry, !new URLSearchParams(location.search).has('scene'));
const review = new URLSearchParams(location.search).get('review');
if (import.meta.env.DEV && (review === 'hub' || review === 'opportunity' || review === 'terrain')) {
  void import('./core/review').then(({installRecorder}) => {
    installRecorder(document.querySelector<HTMLCanvasElement>('#scene')!, `/__review_capture?scene=${review === 'terrain'?'terrain-100':review === 'hub' ? 'mars-hub' : 'opportunity'}`);
  });
}
if (import.meta.hot) import.meta.hot.dispose(() => game.dispose());
