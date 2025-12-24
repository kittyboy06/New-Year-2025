
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

    if (UserData.advice) {
        showAdvice(container, UserData.advice);
        return;
    }

    // Render Envelope Grid
    container.innerHTML = `
        <h3 style="margin-bottom:20px; color:#FFD700; text-shadow:0 0 10px #000;">Pick a Golden Envelope</h3>
        <div class="envelope-grid">
            ${[1, 2, 3, 4, 5, 6].map(i => `
                <div class="envelope-wrapper" data-idx="${i}">
                    <div class="envelope">
                        <div class="flap"></div>
                        <div class="seal">?</div>
                        <div class="paper-insert"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const envelopes = container.querySelectorAll('.envelope-wrapper');
    envelopes.forEach(wrapper => {
        wrapper.addEventListener('click', async () => {
            const envelope = wrapper.querySelector('.envelope');
            // Animate Open
            envelope.classList.add('open');

            // Wait for animation then reveal
            setTimeout(async () => {
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
            }, 800); // 0.8s Matches CSS transitions
        });
    });
}

function showAdvice(container, text) {
    container.innerHTML = `
        <div class="advice-card-revealed">
            <div class="sparkles">✨</div>
            <p class="advice-text">"${text}"</p>
            <p style="margin-top:20px; color:#aaa; font-size:0.9rem;">(Saved to Database)</p>
        </div>
    `;
}
