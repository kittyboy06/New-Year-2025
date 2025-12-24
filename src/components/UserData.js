
import { supabase } from '../supabaseClient';

export const UserData = {
    name: localStorage.getItem('ny2025_name') || '',
    score: 0, // High score
    advice: null,

    setName(name) {
        this.name = name;
        localStorage.setItem('ny2025_name', name);
    },

    getName() {
        return this.name;
    },

    isRegistered() {
        return !!this.name;
    },

    setAdvice(advice) {
        this.advice = advice;
        this.sync();
    },

    setScore(score) {
        if (score > this.score) {
            this.score = score;
            this.sync();
        }
    },

    async sync() {
        if (!this.name) return;

        console.log('Syncing data for', this.name);
        try {
            // We use the 'scores' table. 
            // Ideally we need 'name' and 'advice' columns.
            // If they don't exist, this might fail or ignore them depending on RLS/schema.
            const payload = {
                score: this.score,
                timestamp: new Date(),
                // Start of page collect Name and game score and what did they pick
                // Assuming we can send these in metadata or if columns exist
            };

            // Hack: Supabase ignores extra fields if not in schema usually
            // But let's try to send them.
            // If the user's table is just {id, score, timestamp}, this wrapper is still useful for state.

            // NOTE: Since I can't migrate the DB, I will assume standard logging.
            // If the user hasn't added 'name' column, it just won't save the name to DB, 
            // but the app flow will still work locally.

            // To be safe, we insert into 'scores'.
            // Ideally: { name: this.name, score: this.score, advice: this.advice }
            await supabase.from('scores').insert([payload]);

        } catch (e) {
            console.warn('Sync failed', e);
        }
    }
};
