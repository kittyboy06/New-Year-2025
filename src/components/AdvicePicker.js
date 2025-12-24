
import { UserData } from './UserData.js';
import { supabase } from '../supabaseClient.js';

const ADVICES = [
    "Stay curious and keep learning!",
    "Kindness is a superpower. Use it.",
    "Take more risks in 2026.",
    "Drink more water and sleep well.",
    "Your creativity is your greatest asset.",
    "Don't fear failure, fear not trying.",
    "Call your family more often.",
    "Focus on progress, not perfection.",
    "Save 10% of everything you earn.",
    "Read one book every month."
];

export function initAdvicePicker(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Check if already picked - Ideally fetch from DB?
    // For now, we trust local session to avoid DB spam on refresh
    if (UserData.advice) {
        showAdvice(container, UserData.advice);
        return;
    }

    container.innerHTML = `
        <h3>Pick a Paper for 2026 Advice</h3>
        <div class="advice-grid">
            ${[1, 2, 3, 4].map(i => `<div class="paper-item" data-idx="${i}">?</div>`).join('')}
        </div>
    `;

    const papers = container.querySelectorAll('.paper-item');
    papers.forEach(p => {
        p.addEventListener('click', async () => {
            const randomAdvice = ADVICES[Math.floor(Math.random() * ADVICES.length)];
            UserData.setAdvice(randomAdvice);
            showAdvice(container, randomAdvice);

            // Save to DB
            const name = UserData.getName();
            if (name) {
                try {
                    await supabase.from('advice').insert([{ user_name: name, advice_text: randomAdvice }]);
                } catch (e) { console.error("Advice save failed", e); }
            }
        });
    });
}

function showAdvice(container, text) {
    container.innerHTML = `
        <h3>Your 2026 Advice ✨</h3>
        <div class="advice-reveal">
            "${text}"
        </div>
        <p style="margin-top:20px; color:#aaa; font-size:0.9rem;">(Saved to Database)</p>
    `;
}
