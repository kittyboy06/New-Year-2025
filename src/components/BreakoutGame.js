
import { supabase } from '../supabaseClient';
import { UserData } from './UserData'; // Import UserData

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    resume() { if (this.ctx.state === 'suspended') this.ctx.resume(); }
    playTone(freq, type, duration) {
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    playHit() { this.playTone(400, 'square', 0.1); }
    playPaddle() { this.playTone(300, 'triangle', 0.1); }
    playBrick() { this.playTone(600 + Math.random() * 200, 'sine', 0.15); }
    playWin() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playTone(f, 'square', 0.3), i * 100)); }
}

export class BreakoutGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundManager();
        this.isPlaying = false;
        this.score = 0;
        this.lives = 3;

        // Listen for Route Changes logic remains same...
        window.addEventListener('routeChanged', (e) => {
            if (e.detail.route === 'game') {
                setTimeout(() => this.resize(), 100);
            } else {
                this.isPlaying = false;
            }
        });

        if (window.location.hash.includes('game')) {
            setTimeout(() => this.resize(), 100);
        }

        this.bindControls();
    }

    resize() {
        // Must take offsetWidth from parent container if canvas is weird
        const parent = this.canvas.parentElement;
        this.width = this.canvas.width = parent.offsetWidth || 300;
        this.height = this.canvas.height = 400;

        this.paddleHeight = 12;
        this.paddleWidth = 80;

        this.resetBall();
        this.initBricks();
        this.draw();
    }

    initBricks() {
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickPadding = 8;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 10;

        const availableWidth = this.width - (this.brickOffsetLeft * 2);
        this.brickWidth = (availableWidth - (this.brickPadding * (this.brickColumnCount - 1))) / this.brickColumnCount;
        this.brickHeight = 20;

        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: `hsl(${c * 45}, 80%, 60%)`
                };
            }
        }
    }

    bindControls() {
        this.canvas.style.touchAction = "none";
        const movePaddle = (x) => {
            this.paddleX = x - this.paddleWidth / 2;
            if (this.paddleX < 0) this.paddleX = 0;
            if (this.paddleX + this.paddleWidth > this.width) this.paddleX = this.width - this.paddleWidth;
        };

        const moveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const relativeX = clientX - rect.left;
            movePaddle(relativeX);
        };

        document.addEventListener("mousemove", (e) => {
            if (this.isPlaying) moveHandler(e);
        }, false);

        this.canvas.addEventListener("touchmove", (e) => {
            if (e.cancelable) e.preventDefault();
            if (this.isPlaying) moveHandler(e);
        }, { passive: false });

        this.canvas.addEventListener("click", () => {
            if (!this.isPlaying) {
                this.sound.resume();
                this.startGame();
            }
        });
    }

    startGame() {
        this.resize();
        this.isPlaying = true;
        this.score = 0;
        this.lives = 3;
        this.particles = [];
        this.resetBall();
        this.initBricks();
        this.animate();
    }

    resetBall() {
        this.x = this.width / 2;
        this.y = this.height - 40;
        this.speed = 4;
        this.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        this.dy = -3;
        this.paddleX = (this.width - this.paddleWidth) / 2;
    }

    // Abbreviated physics/draw methods same as before...
    createExplosion(x, y, color) {
        if (!this.particles) this.particles = [];
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    collisionDetection() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if (b.status === 1) {
                    if (this.x > b.x && this.x < b.x + this.brickWidth && this.y > b.y && this.y < b.y + this.brickHeight) {
                        this.dy = -this.dy;
                        b.status = 0;
                        this.score++;
                        this.sound.playBrick();
                        this.createExplosion(b.x + this.brickWidth / 2, b.y + this.brickHeight / 2, b.color);
                        if (this.speed < 8) {
                            this.speed += 0.1;
                            this.dx = (this.dx > 0 ? 1 : -1) * this.speed;
                            this.dy = (this.dy > 0 ? 1 : -1) * this.speed;
                        }
                        return;
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.bricks) this.drawBricks();
        this.drawBall();
        this.drawPaddle();
        if (this.particles) this.drawParticles();
        this.drawScore();
    }

    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const b = this.bricks[c][r];
                    b.x = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    b.y = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;

                    this.ctx.beginPath();
                    this.ctx.roundRect(b.x, b.y, this.brickWidth, this.brickHeight, 3);
                    this.ctx.fillStyle = b.color;
                    this.ctx.fill();
                    this.ctx.closePath();
                }
            }
        }
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddleX, this.height - this.paddleHeight - 5, this.paddleWidth, this.paddleHeight, 5);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03;
            p.vy += 0.1;
            if (p.life <= 0) { this.particles.splice(i, 1); continue; }
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawScore() {
        this.ctx.font = "bold 16px Inter";
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("Score: " + this.score, 15, 25);
    }

    updatePhysics() {
        if (this.x + this.dx > this.width - 6 || this.x + this.dx < 6) {
            this.dx = -this.dx;
            this.sound.playHit();
        }
        if (this.y + this.dy < 6) {
            this.dy = -this.dy;
            this.sound.playHit();
        }
        else if (this.y + this.dy > this.height - 6 - this.paddleHeight - 5) {
            if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
                this.dy = -this.speed;
                this.sound.playPaddle();
                if (navigator.vibrate) navigator.vibrate(20);
            } else if (this.y + this.dy > this.height) {
                this.lives--;
                if (!this.lives) this.gameOver();
                else this.resetBall();
            }
        }
        this.x += this.dx;
        this.y += this.dy;
        this.collisionDetection();
    }

    animate() {
        if (!this.isPlaying) return;
        this.draw();
        this.updatePhysics();
        requestAnimationFrame(() => this.animate());
    }

    gameOver() {
        this.isPlaying = false;
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Inter';
        this.ctx.fillText("Game Over", this.width / 2 - 70, this.height / 2);
        this.saveScore();
        setTimeout(() => this.isPlaying = false, 500);
    }

    async saveScore() {
        const name = UserData.getName();
        if (!name || name === 'Anonymous') {
            console.log("Score not saved: User not registered.");
            return;
        }

        console.log(`Saving Score for ${name}: ${this.score}`);

        try {
            // Include user_name in insert
            const { data, error } = await supabase.from('scores').insert([{
                user_name: name,
                score: this.score
            }]);

            if (error) {
                console.error("Supabase Error:", error);
                alert("Score Error: " + error.message); // Visible feedback for user
            } else {
                console.log("Score saved to DB Successfully", data);
            }
        } catch (e) {
            console.error("Score save failed fatally", e);
            alert("Score Save Failed: " + e.message);
        }
    }
}
