
export function initCountdown(elementId) {
    const element = document.getElementById(elementId);
    const targetDate = new Date('January 1, 2025 00:00:00').getTime();

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            element.innerHTML = '<div class="celebration-message">HAPPY NEW YEAR 2025!</div>';
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
        <span class="label">Minutes</span>
      </div>
      <div class="time-unit">
        <span class="number">${seconds}</span>
        <span class="label">Seconds</span>
      </div>
    `;
    }

    setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
}
