
import { supabase } from '../supabaseClient';
import { UserData } from './UserData';

export const AdminDashboard = {
    async init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Render Layout
        container.innerHTML = `
          <div class="glass-card">
            <div class="admin-header">
                <h1 class="title" style="margin:0; font-size:2rem;">Dashboard</h1>
                <button id="refresh-admin-btn" class="refresh-btn">🔄 Refresh Data</button>
            </div>
            
            <h3 class="section-title">New Year Resolutions</h3>
            <div class="data-table-container" id="admin-resolutions">Loading...</div>

            <h3 class="section-title">Fortune Picked</h3>
            <div class="data-table-container" id="admin-advice">Loading...</div>

            <h3 class="section-title">Game Leaderboard</h3>
            <div class="data-table-container" id="admin-scores">Loading...</div>
          </div>
        `;

        document.getElementById('refresh-admin-btn').addEventListener('click', () => this.refreshData());

        this.refreshData();
    },

    async refreshData() {
        this.fetchResolutions();
        this.fetchAdvice();
        this.fetchScores();
    },

    async fetchResolutions() {
        const div = document.getElementById('admin-resolutions');
        try {
            const { data, error } = await supabase
                .from('resolutions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            this.renderTable(div, data, ['user_name', 'content', 'created_at'], ['User', 'Resolution', 'Time']);
        } catch (e) { div.innerHTML = `<div style="color:red">Error: ${e.message || JSON.stringify(e)}</div>`; console.error(e); }
    },

    async fetchAdvice() {
        const div = document.getElementById('admin-advice');
        try {
            const { data, error } = await supabase
                .from('advice')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            this.renderTable(div, data, ['user_name', 'advice_text', 'created_at'], ['User', 'Fortune Picked', 'Time']);
        } catch (e) { div.innerHTML = `<div style="color:red">Error: ${e.message || JSON.stringify(e)}</div>`; console.error(e); }
    },

    async fetchScores() {
        const div = document.getElementById('admin-scores');
        try {
            const { data, error } = await supabase
                .from('scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(50);

            if (error) throw error;
            this.renderTable(div, data, ['user_name', 'score', 'created_at'], ['User', 'Score', 'Time']);
        } catch (e) { div.innerHTML = `<div style="color:red">Error: ${e.message || JSON.stringify(e)}</div>`; console.error(e); }
    },

    renderTable(container, data, fields, headers) {
        if (!data || data.length === 0) {
            container.innerHTML = "<div style='padding:10px; color:#666;'>No data found</div>";
            return;
        }

        console.log("Rendering Data:", data); // Debug log

        let html = `<table class="data-table"><thead><tr>`;
        headers.forEach(h => html += `<th>${h}</th>`);
        html += `</tr></thead><tbody>`;

        data.forEach(row => {
            html += `<tr>`;
            fields.forEach(f => {
                let val = row[f];

                // Format Date Safe
                if (f === 'created_at') {
                    if (val) {
                        try {
                            val = new Date(val).toLocaleString(undefined, {
                                dateStyle: 'short', timeStyle: 'short'
                            });
                        } catch (e) { val = 'Invalid Date'; }
                    } else {
                        val = ''; // Empty string if null
                    }
                }

                // Handle Names
                if (f === 'user_name') {
                    val = val || 'Anonymous';
                }

                html += `<td>${val ?? '-'}</td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    }
};
