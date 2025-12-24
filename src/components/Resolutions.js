
import { supabase } from '../supabaseClient';
import { UserData } from './UserData';

export async function initResolutions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Markup
  container.innerHTML = `
    <div class="resolutions-card">
      <h2>Resolutions for ${UserData.getName() ? UserData.getName() : 'You'}</h2>
      <div class="input-group">
        <input type="text" id="res-input" placeholder="My goal for 2025..." />
        <button id="add-res-btn">Add</button>
      </div>
      <div class="actions" style="margin-top: 10px; text-align: right;">
        <button id="download-btn" style="background: transparent; border: 1px solid var(--color-primary); color: var(--color-primary); font-size: 0.8rem; padding: 5px 10px;">⬇ Download .txt</button>
      </div>
      <div id="loading-indicator">Loading...</div>
      <ul id="res-list" class="res-list"></ul>
    </div>
  `;

  const input = document.getElementById('res-input');
  const btn = document.getElementById('add-res-btn');
  const downloadBtn = document.getElementById('download-btn');
  const list = document.getElementById('res-list');
  const loader = document.getElementById('loading-indicator');

  // Load from DB
  await fetchResolutions();

  btn.addEventListener('click', addResolution);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addResolution();
  });

  downloadBtn.addEventListener('click', () => {
    const items = list.querySelectorAll('li span'); // Get span content
    if (items.length === 0) {
      alert("No resolutions to download!");
      return;
    }

    const name = UserData.getName() || 'Dreamer';
    const date = new Date().toLocaleDateString();

    let content = `
==================================================
      ✨  NEW YEAR RESOLUTIONS 2025  ✨
==================================================

  Name: ${name}
  Date: ${date}

--------------------------------------------------

  "The future belongs to those who believe 
   in the beauty of their dreams."

--------------------------------------------------

  MY GOALS:

`;

    items.forEach((span, i) => {
      content += `  [ ${i + 1} ]  ${span.innerText}\n\n`;
    });

    content += `
==================================================
        Make 2025 Your Best Year Yet! 🚀
==================================================
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolutions_2025_${name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  async function fetchResolutions() {
    try {
      // Fetch resolutions for specific user
      // OR fetch all? Let's fetch for current user name
      const userName = UserData.getName();
      if (!userName) return; // Should be handled by router guard

      const { data, error } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false });

      if (error) throw error;

      list.innerHTML = '';
      data.forEach(item => renderItem(item));
    } catch (err) {
      console.error('Error loading resolutions:', err);
      list.innerHTML = `<li style="color:red">Failed to load list. Check database!</li>`;
    } finally {
      if (loader) loader.style.display = 'none';
    }
  }

  async function addResolution() {
    const text = input.value.trim();
    const userName = UserData.getName();
    if (!text || !userName) return;

    // Optimistic UI Update (Instant feel)
    const tempId = Date.now();
    const tempItem = { id: tempId, content: text, user_name: userName };
    renderItem(tempItem);
    input.value = '';

    try {
      const { data, error } = await supabase
        .from('resolutions')
        .insert([{ user_name: userName, content: text }])
        .select();

      if (error) throw error;

      // Optionally replace temp item with real one or just leave it
      // Real refresh would ensure consistency but flicker.
    } catch (err) {
      console.error('Error adding resolution:', err);
      alert("Failed to save to database!");
      // Remove the optimistic item?
      const el = document.getElementById(`res-${tempId}`);
      if (el) el.remove();
    }
  }

  function renderItem(item) {
    const li = document.createElement('li');
    li.id = `res-${item.id}`;
    li.className = 'res-item fade-in-up';
    li.innerHTML = `
            <span>${item.content}</span>
            <button class="delete-btn" data-id="${item.id}">&times;</button>
        `;

    // Delete
    li.querySelector('.delete-btn').addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      li.remove(); // Optimistic delete

      try {
        await supabase.from('resolutions').delete().eq('id', id);
      } catch (err) {
        console.error("Delete failed", err);
      }
    });

    list.appendChild(li);
  }
}
