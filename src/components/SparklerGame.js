
import { supabase } from '../supabaseClient';

export class SparklerGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = 300; // Fixed height for game area

        this.isPlaying = false;
        this.score = 0;
        this.highScore = 0;
        this.gameSpeed = 5;
        this.gravity = 0.6;

        // Player (Sparkler)
        this.player = {
            x: 50,
            y: 200,
            width: 30,
            height: 50,
            dy: 0,
            jumpForce: -12,
            grounded: true,
            color: '#FFD700'
        };

        this.obstacles = [];
        this.particles = [];
        this.frameCount = 0;
        this.saveTimeout = null;

        // Bind inputs
        this.handleInput = this.handleInput.bind(this);
        this.canvas.addEventListener('click', this.handleInput);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this.handleInput(e);
            }
        });

        // Start Screen
        this.drawStartScreen();
    }

    handleInput(e) {
        if (e.type === 'keydown') e.preventDefault(); // Stop scrolling

        if (!this.isPlaying) {
            this.startGame();
            return;
        }

        if (this.player.grounded) {
            this.player.dy = this.player.jumpForce;
            this.player.grounded = false;
            this.createSparkles(this.player.x + this.player.width / 2, this.player.y + this.player.height, 10);
        }
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.gameSpeed = 5;
        this.obstacles = [];
        this.particles = [];
        this.animate();
    }

    createSparkles(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 50%)` // Gold/Yellow
            });
        }
    }

    spawnObstacle() {
        const height = 40 + Math.random() * 40;
        this.obstacles.push({
            x: this.width,
            y: this.height - height - 20, // 20px ground buffer
            width: 30,
            height: height,
            passed: false,
            text: '2024' // Obstacle label
        });
    }

    update() {
        // Player Physics
        this.player.y += this.player.dy;
        if (this.player.y + this.player.height < this.height - 20) {
            this.player.dy += this.gravity;
            this.player.grounded = false;
        } else {
            this.player.dy = 0;
            this.player.grounded = true;
            this.player.y = this.height - 20 - this.player.height;
        }

        // Continuous Sparkles for player
        if (this.frameCount % 5 === 0) {
            this.createSparkles(this.player.x + this.player.width / 2, this.player.y, 2);
        }

        // Obstacles
        if (this.frameCount % 100 === 0) { // Spawn rate
            this.spawnObstacle();
            this.gameSpeed += 0.05; // Slowly increase speed
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Collision
            if (
                this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y
            ) {
                this.gameOver();
            }

            // Remove off-screen
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                this.updateScoreUI();
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.frameCount++;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Ground
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);

        // Player (Simple rect for now, maybe add glow)
        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;

        // Obstacles
        this.ctx.fillStyle = '#ff4d4d'; // Red for 2024 (old year)
        this.ctx.font = 'bold 14px Inter';
        for (const obs of this.obstacles) {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(obs.text, obs.x, obs.y - 5);
            this.ctx.fillStyle = '#ff4d4d';
        }

        // Particles
        for (const p of this.particles) {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }

        // Score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Inter';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    }

    animate() {
        if (!this.isPlaying) return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    gameOver() {
        this.isPlaying = false;
        this.drawGameOver();
        this.saveScore();
    }

    updateScoreUI() {
        // Optional: Update HTML element if it exists, or just rely on canvas draw
        const el = document.getElementById('sparkler-score');
        if (el) el.textContent = this.score;
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Sparkler Jump", this.width / 2, this.height / 2 - 20);
        this.ctx.font = '16px Inter';
        this.ctx.fillText("Tap or Space to Jump", this.width / 2, this.height / 2 + 20);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Game Over!", this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Inter';
        this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
        this.ctx.font = '14px Inter';
        this.ctx.fillText("Tap to Restart", this.width / 2, this.height / 2 + 40);
    }

    async saveScore() {
        try {
            await supabase.from('scores').insert([
                { score: this.score, timestamp: new Date() }
            ]);
            console.log("Score saved:", this.score);
        } catch (err) {
            console.error("Error saving score:", err);
        }
    }
}
