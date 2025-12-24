
export function initResolutions(containerId) {
    const container = document.getElementById(containerId);

    // Initial Markup
    container.innerHTML = `
    <div class="resolutions-card">
      <h2>My 2025 Resolutions</h2>
      <div class="input-group">
        <input type="text" id="res-input" placeholder="Enter a new resolution..." />
        <button id="add-res-btn">Add</button>
      </div>
      <ul id="res-list" class="res-list"></ul>
    </div>
  `;

    const input = document.getElementById('res-input');
    const btn = document.getElementById('add-res-btn');
    const list = document.getElementById('res-list');

    btn.addEventListener('click', addResolution);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addResolution();
    });

    function addResolution() {
        const text = input.value.trim();
        if (!text) return;

        const li = document.createElement('li');
        li.className = 'res-item fade-in-up';
        li.innerHTML = `
      <span>${text}</span>
      <button class="delete-btn">&times;</button>
    `;

        // Delete functionality
        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.remove();
        });

        list.appendChild(li);
        input.value = '';
    }
}
