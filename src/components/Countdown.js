
export function initCountdown(elementId) {
  console.log("Initializing Countdown...");
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("Countdown Element Not Found!");
    return;
  }

  // Dynamic Year Calculation
  const now = new Date();
  const currentYear = now.getFullYear();

  // Logic: 
  // If Today is Jan 1st -> Show "Happy New Year [Current Year]!" and Hide Title
  // Else -> Count down to Next Year Jan 1st.

  // Check for Jan 1st (Month 0, Date 1)
  if (now.getMonth() === 0 && now.getDate() <= 2) {
    // Celebrate for first 2 days of Jan
    element.innerHTML = `
          <div class="celebration-container animate-pop-in">
              <h1 class="new-year-wish" style="font-size: 3rem; color: var(--color-primary); text-shadow: 0 0 30px gold;">✨ HAPPY NEW YEAR ${currentYear}! ✨</h1>
              <p class="new-year-subtitle" style="font-size: 1.5rem; color: #fff;">May your resolutions come true! 🚀</p>
          </div>
      `;
    // Hide the "Countdown" title since we are celebrating
    const titleEl = document.querySelector('.title');
    if (titleEl) titleEl.style.display = 'none';
    return;
  }

  const nextYear = currentYear + 1;
  const targetDate = new Date(nextYear, 0, 1, 0, 0, 0).getTime();

  console.log(`Current Year: ${currentYear}, Target Year: ${nextYear}`);

  // Update Title UI if possible
  const titleYearSpan = document.querySelector('.title .gold');
  if (titleYearSpan) {
    titleYearSpan.textContent = nextYear;
    document.querySelector('.title').style.display = 'block'; // Ensure visible
  }

  function updateTimer() {
    try {
      const currentTime = new Date().getTime();
      const distance = targetDate - currentTime;

      if (distance < 0) {
        element.innerHTML = `<div class="celebration-message">HAPPY NEW YEAR ${nextYear}!</div>`;
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      element.innerHTML = `
              <div class="time-unit">
                <span class="number">${days}</span>
                <span class="label">Days</span>
              </div>
              <div class="time-unit">
                <span class="number">${hours}</span>
                <span class="label">Hours</span>
              </div>
              <div class="time-unit">
                <span class="number">${minutes}</span>
                <span class="label">Mins</span>
              </div>
              <div class="time-unit">
                <span class="number" style="color: #ff4d4d;">${seconds}</span>
                <span class="label">Secs</span>
              </div>
            `;
    } catch (e) {
      console.error("Timer Update Error", e);
      element.innerText = "Timer Error";
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}
