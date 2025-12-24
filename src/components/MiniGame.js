
import { supabase } from '../supabaseClient';

export class MiniGame {
    constructor() {
        this.score = 0;
        this.scoreElement = document.getElementById('score-value');
        this.saveTimeout = null;
    }

    addScore(points) {
        this.score += points;
        this.updateUI();
        this.checkUnlock();
        this.saveScoreDebounced();
    }

    updateUI() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
    }

    checkUnlock() {
        if (this.score >= 2025) {
            document.body.classList.add('golden-theme');
            // Maybe show a notification?
        }
    }

    async saveScoreDebounced() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);

        this.saveTimeout = setTimeout(async () => {
            try {
                // Insert or update. For simplicity, just inserting a new record or updating a user's score if we had auth.
                // Since we don't have auth, we might just insert anonymous scores or use a fingerprint?
                // Let's just assume we insert for now as a log.
                // real implementation would need a 'player_id' or similar.
                // FOR NOW: We'll just try to insert to a 'scores' table.
                // If table doesn't exist or RLS blocks it, it will fail silently in console, which is expected for this demo level.

                await supabase.from('scores').insert([
                    { score: this.score, timestamp: new Date() }
                ]);
                console.log('Score saved to DB');
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }, 2000);
    }
}
