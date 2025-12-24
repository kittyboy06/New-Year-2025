
import './style.css'
import { initCountdown } from './components/Countdown.js'
import { FireworkSystem } from './components/Fireworks.js'
import { BreakoutGame } from './components/BreakoutGame.js'
import { initResolutions } from './components/Resolutions.js'
import { Router } from './components/Router.js'
import { UserData } from './components/UserData.js'
import { initAdvicePicker } from './components/AdvicePicker.js'
import { AdminDashboard } from './components/Admin.js'

document.addEventListener('DOMContentLoaded', () => {
  console.log("App Initializing...");

  // 1. Core Router
  try {
    Router.init();
  } catch (e) { console.error("Router Init Failed", e); }

  // 2. Countdown (Home)
  try {
    initCountdown('countdown-display');
  } catch (e) { console.error("Countdown Init Failed", e); }

  // 3. Fireworks (Background)
  try {
    new FireworkSystem('fireworks-canvas');
  } catch (e) { console.error("Fireworks Init Failed", e); }

  // 4. Landing Page Logic
  try {
    const input = document.getElementById('username-input');
    const btn = document.getElementById('btn-enter');

    if (UserData.isRegistered()) {
      Router.navigate('home');
    }

    if (btn && input) {
      btn.addEventListener('click', async () => {
        const name = input.value.trim();
        if (name) {
          btn.innerText = "Joining...";
          btn.disabled = true;

          const success = await UserData.registerUser(name);

          btn.innerText = "Enter";
          btn.disabled = false;

          if (success) {
            Router.navigate('home');
          }
        } else {
          alert("Please enter a name to join the party!");
        }
      });
    }
  } catch (e) { console.error("Landing Logic Failed", e); }

  // 5. Game
  try {
    if (document.getElementById('sparkler-canvas')) {
      new BreakoutGame('sparkler-canvas');
    }
  } catch (e) { console.error("Game Init Failed", e); }

  // 6. Advice Picker
  try {
    initAdvicePicker('advice-container');
  } catch (e) { console.error("Advice Picker Failed", e); }

  // 7. Resolutions
  try {
    initResolutions('resolutions-container');
  } catch (e) { console.error("Resolutions Failed", e); }

  // 8. Admin Dashboard
  try {
    AdminDashboard.init('admin-container');
  } catch (e) { console.error("Admin Init Failed", e); }
});
