import './ui/style.css';
import { Game } from './app/Game';
import type { SceneEntry } from './app/contracts';

const scene = new URLSearchParams(location.search).get('scene');
const entry: SceneEntry = scene === 'episode-rover-01'
  ? {scene:'episode-rover-01',wreckId:'wreck-rover-01'}
  : {scene:'mars-hub'};
const game = new Game(entry);
if (import.meta.hot) import.meta.hot.dispose(() => game.dispose());
