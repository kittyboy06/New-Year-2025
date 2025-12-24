
import './style.css'
import { initCountdown } from './components/Countdown.js'
import { FireworkSystem } from './components/Fireworks.js'
import { MiniGame } from './components/MiniGame.js'
import { initResolutions } from './components/Resolutions.js'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Countdown
  initCountdown('countdown-display');

  // 2. Initialize MiniGame
  const game = new MiniGame();

  // 3. Initialize Fireworks (with hit callback)
  const fireworks = new FireworkSystem('fireworks-canvas', (score) => {
    game.addScore(score);
  });

  // 4. Initialize Resolutions
  initResolutions('resolutions-section');
});
