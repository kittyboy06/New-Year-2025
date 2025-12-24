
import './style.css'
import { initCountdown } from './components/Countdown.js'
import { FireworkSystem } from './components/Fireworks.js'
import { BreakoutGame } from './components/BreakoutGame.js'
import { initResolutions } from './components/Resolutions.js'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Countdown
  initCountdown('countdown-display');

  // 2. Initialize Breakout Game
  const game = new BreakoutGame('sparkler-canvas');

  // 3. Initialize Fireworks (Background Only)
  const fireworks = new FireworkSystem('fireworks-canvas');

  // 4. Initialize Resolutions
  initResolutions('resolutions-section');
});
