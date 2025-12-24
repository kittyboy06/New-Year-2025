
import { UserData } from './UserData.js';

export const Router = {
    routes: ['landing', 'home', 'game', 'resolutions', 'advice'],

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Initial load
    },

    navigate(route) {
        window.location.hash = route;
    },

    handleRoute() {
        let hash = window.location.hash.replace('#', '') || 'landing';

        // Protected Routes
        if (hash !== 'landing' && !UserData.isRegistered()) {
            this.navigate('landing');
            return;
        }

        // Show/Hide Sections
        this.routes.forEach(r => {
            const el = document.getElementById(`view-${r}`);
            if (el) {
                if (r === hash) el.classList.add('active');
                else el.classList.remove('active');
            }
        });

        // Toggle Nav Bar
        const nav = document.getElementById('main-nav');
        if (hash === 'landing') {
            nav.style.display = 'none';
        } else {
            nav.style.display = 'flex';
        }

        // Highlight Active Nav
        document.querySelectorAll('.nav-item').forEach(n => {
            n.classList.remove('active');
            if (n.getAttribute('href') === `#${hash}`) {
                n.classList.add('active');
            }
        });
    }
};
