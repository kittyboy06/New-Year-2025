
import { supabase } from '../supabaseClient';

export class BreakoutGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = 400;

        this.isPlaying = false;
        this.score = 0;
        this.lives = 3;

        // Paddle
        this.paddleHeight = 12;
        this.paddleWidth = 80;
        this.paddleX = (this.width - this.paddleWidth) / 2;

        // Ball
        this.ballRadius = 6;
        this.resetBall();

        // Bricks
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickPadding = 10;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 20; // Dynamic calc
        this.brickWidth = 0;
        this.brickHeight = 20;

        this.bricks = [];
        this.particles = [];

        this.initBricks();
        this.bindControls();

        // Initial draw
        this.drawStartScreen();
    }

    initBricks() {
        // Recalc width based on actual canvas size
        this.brickWidth = (this.width - (this.brickPadding * (this.brickColumnCount - 1)) - (this.brickOffsetLeft * 2)) / this.brickColumnCount;

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
        // Touch: Prevent scrolling!
        this.canvas.style.touchAction = "none";

        const movePaddle = (x) => {
            this.paddleX = x - this.paddleWidth / 2;

            // Clamp
            if (this.paddleX < 0) this.paddleX = 0;
            if (this.paddleX + this.paddleWidth > this.width) this.paddleX = this.width - this.paddleWidth;
        };

        const moveHandler = (e) => {
            // e.preventDefault(); // Stop scroll
            const relativeX = (e.clientX || e.touches[0].clientX) - this.canvas.getBoundingClientRect().left;
            movePaddle(relativeX);
        };

        document.addEventListener("mousemove", moveHandler, false);
        this.canvas.addEventListener("touchmove", (e) => {
            if (e.cancelable) e.preventDefault(); // CRITICAL: Stop Android scroll
            moveHandler(e);
        }, { passive: false });

        this.canvas.addEventListener("click", () => {
            if (!this.isPlaying) this.startGame();
        });
        // Also touchstart to start
        this.canvas.addEventListener("touchstart", (e) => {
            if (!this.isPlaying) {
                e.preventDefault();
                this.startGame();
            }
        }, { passive: false });
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.lives = 3;
        this.resetBall();
        this.initBricks();
        this.animate();
    }

    resetBall() {
        this.x = this.width / 2;
        this.y = this.height - 40;
        this.speed = 5; // Base speed
        const dir = Math.random() * Math.PI / 2 + Math.PI / 4; // Random angle up
        this.dx = this.speed * Math.cos(30 * Math.PI / 180) * (Math.random() > 0.5 ? 1 : -1);
        this.dy = -this.speed;
        this.paddleX = (this.width - this.paddleWidth) / 2;
    }

    createExplosion(x, y, color) {
        // More particles, varied sizes
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8, // Faster explosion
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
                        this.createExplosion(b.x + this.brickWidth / 2, b.y + this.brickHeight / 2, b.color);

                        // Slight speed up, but cap it
                        if (this.speed < 9) {
                            this.speed += 0.05;
                            // Normalizing velocity to match new speed
                            const angle = Math.atan2(this.dy, this.dx);
                            this.dx = Math.cos(angle) * this.speed;
                            this.dy = Math.sin(angle) * this.speed;
                        }

                        if (this.score === this.brickRowCount * this.brickColumnCount) {
                            // Respawn bricks logic or win? let's loop levels
                            this.initBricks();
                        }
                        return; // Only hit one brick per frame
                    }
                }
            }
        }
    }

    draw() {
        // Clear with trail for motion blur effect? No, clean clear.
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Elements
        this.drawBall();
        this.drawPaddle();
        this.drawBricks();
        this.drawParticles();
        this.drawScore();
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#FFD700";
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddleX, this.height - this.paddleHeight - 5, this.paddleWidth, this.paddleHeight, 5);
        this.ctx.fillStyle = "#FFD700"; // Golden Paddle
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        this.ctx.closePath();
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

    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.03; // Last longer
            p.vy += 0.1; // Gravity!

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

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
        this.ctx.fillText("Lives: " + this.lives, this.width - 80, 25);
    }

    updatePhysics() {
        // Wall Collision X
        if (this.x + this.dx > this.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
            this.dx = -this.dx;
        }

        // Ceiling
        if (this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        }
        // Floor (Paddle Check)
        else if (this.y + this.dy > this.height - this.ballRadius - this.paddleHeight - 5) {
            if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
                // Paddle Hit
                // Calculate relative hit position (-1 to 1)
                let hitPoint = 2 * (this.x - (this.paddleX + this.paddleWidth / 2)) / this.paddleWidth;

                // Angle bounce
                this.forceBounce(hitPoint);
            } else if (this.y + this.dy > this.height - this.ballRadius) {
                // Dead
                this.lives--;
                if (!this.lives) {
                    this.gameOver();
                } else {
                    this.resetBall();
                }
            }
        }

        this.x += this.dx;
        this.y += this.dy;

        this.collisionDetection();
    }

    forceBounce(hitPoint) {
        // Cap hitpoint
        if (hitPoint > 1) hitPoint = 1;
        if (hitPoint < -1) hitPoint = -1;

        // Max bounce angle 60 degrees
        let angle = hitPoint * Math.PI / 3;

        // Keep speed constant but change direction
        this.dx = this.speed * Math.sin(angle);
        this.dy = -this.speed * Math.cos(angle);
    }

    animate() {
        if (!this.isPlaying) return;
        this.draw();
        this.updatePhysics();
        requestAnimationFrame(() => this.animate());
    }

    drawStartScreen() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Break the Year", this.width / 2, this.height / 2 - 20);
        this.ctx.font = '16px Inter';
        this.ctx.fillText("Tap to Start", this.width / 2, this.height / 2 + 20);
    }

    gameOver() {
        this.isPlaying = false;
        this.draw(); // Draw final state

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Game Over!", this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Inter';
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);

        this.saveScore();

        setTimeout(() => {
            this.drawStartScreen(); // Reset UI
            this.canvas.addEventListener('click', () => {
                if (!this.isPlaying) this.startGame();
            }, { once: true });
        }, 2000);
    }

    async saveScore() {
        try {
            await supabase.from('scores').insert([
                { score: this.score, timestamp: new Date() }
            ]);
        } catch (err) { }
    }
}
