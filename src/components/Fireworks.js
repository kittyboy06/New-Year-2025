
export class FireworkSystem {
    constructor(canvasId, onHitCallback) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.fireworks = [];
        this.onHit = onHitCallback;
        this.resize();

        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createFirework(x, y) {
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                alpha: 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            };
            this.particles.push(particle);
        }
    }

    launchFirework() {
        // Launch from bottom
        const x = Math.random() * this.canvas.width;
        const targetY = Math.random() * (this.canvas.height / 2);
        this.fireworks.push({
            x: x,
            y: this.canvas.height,
            targetY: targetY,
            vx: 0,
            vy: -10 - Math.random() * 5,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // Trail effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update rising fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const f = this.fireworks[i];
            f.x += f.vx;
            f.y += f.vy;

            // Gravity roughly
            f.vy += 0.1;

            // Draw rising
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = f.color;
            this.ctx.fill();

            // Explode condition
            if (f.vy >= 0 || f.y <= f.targetY) {
                this.createFirework(f.x, f.y);
                this.fireworks.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravity
            p.alpha -= 0.01;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        // Random launches
        if (Math.random() < 0.05) {
            this.launchFirework();
        }
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check hits on rising fireworks (easier to hit) changes
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const f = this.fireworks[i];
            const dist = Math.hypot(f.x - clickX, f.y - clickY);
            if (dist < 30) { // Hit radius
                this.createFirework(f.x, f.y); // Explode
                this.fireworks.splice(i, 1);
                if (this.onHit) this.onHit(10); // 10 points per hit
                break; // One hit per click
            }
        }
    }
}
