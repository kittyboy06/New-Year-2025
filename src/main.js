
import './style.css'
import { initCountdown } from './components/Countdown.js'
import { FireworkSystem } from './components/Fireworks.js'
import { BreakoutGame } from './components/BreakoutGame.js'
import { initResolutions } from './components/Resolutions.js'
import { Router } from './components/Router.js'
import { UserData } from './components/UserData.js'
import { initAdvicePicker } from './components/AdvicePicker.js'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core
  Router.init();
  initCountdown('countdown-display');
  // Fireworks (Background)
  new FireworkSystem('fireworks-canvas');

  // 2. Landing Page Logic
  const input = document.getElementById('username-input');
  const btn = document.getElementById('btn-enter');

  if (UserData.isRegistered()) {
    Router.navigate('home');
  }

  btn.addEventListener('click', () => {
    const name = input.value.trim();
    if (name) {
      UserData.setName(name);
      Router.navigate('home');
    } else {
      alert("Please enter a name to join the party!");
    }
  });

  // 3. Game Initialization
  // Only init game when view is active to save resources? 
  // For simplicity, we init it but maybe pause it.
  // Actually, BreakoutGame binds to canvas, which is always in DOM now.
  const game = new BreakoutGame('sparkler-canvas');

  // 4. Advice Picker
  initAdvicePicker('advice-container');

  // 5. Resolutions
  // We need to target the container inside view-resolutions
  // Adjust Resolutions.js to render entire card if needed, or just mount to ID
  // Let's assume initResolutions mounts the card content
  // We need to wrap it in a container in HTML which we did: #resolutions-container
  // But wait, Resolutions.js expects an ID to mount TO.
  // Let's modify Resolutions.js slightly or ensuring styling works.

  // Quick fix: Rename inner HTML ID in index.html to match
  // logic in Resolutions.js (it creates innerHTML).
  // We passed 'resolutions-container' (which was 'resolutions-section' before)
  initResolutions('resolutions-container');
});
