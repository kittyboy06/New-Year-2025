
import { supabase } from '../supabaseClient';

export class BreakoutGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Set internal resolution but scale with CSS
        this.width = this.canvas.width = this.canvas.offsetWidth;
        this.height = this.canvas.height = 400;

        this.isPlaying = false;
        this.score = 0;
        this.lives = 3;

        // Paddle
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.paddleX = (this.width - this.paddleWidth) / 2;

        // Ball
        this.ballRadius = 6;
        this.x = this.width / 2;
        this.y = this.height - 30;
        this.dx = 4;
        this.dy = -4;

        // Bricks
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickPadding = 10;
        this.brickOffsetTop = 30;
        this.brickOffsetLeft = 30;
        this.brickWidth = (this.width - (this.brickPadding * (this.brickColumnCount - 1)) - (this.brickOffsetLeft * 2)) / this.brickColumnCount;
        this.brickHeight = 20;

        this.bricks = [];
        this.particles = [];

        this.initBricks();
        this.bindControls();
        this.drawStartScreen();
    }

    initBricks() {
        // Create a grid. Ideally we'd map "2024" but for now let's just do a nice colorful grid
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: `hsl(${c * 40}, 70%, 50%)`
                };
            }
        }
    }

    bindControls() {
        // Touch / Mouse
        const moveHandler = (e) => {
            const relativeX = (e.clientX || e.touches[0].clientX) - this.canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < this.width) {
                this.paddleX = relativeX - this.paddleWidth / 2;
            }
        };

        document.addEventListener("mousemove", moveHandler, false);
        document.addEventListener("touchmove", (e) => { e.preventDefault(); moveHandler(e); }, { passive: false });

        this.canvas.addEventListener("click", () => {
            if (!this.isPlaying) this.startGame();
        });
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
        this.y = this.height - 30;
        this.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.dy = -4;
        this.paddleX = (this.width - this.paddleWidth) / 2;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1,
                color: color
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

                        if (this.score === this.brickRowCount * this.brickColumnCount) {
                            alert("YOU WIN, CONGRATS!");
                            this.gameOver();
                        }
                    }
                }
            }
        }
    }

    drawBall() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = "#FFD700";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawPaddle() {
        this.ctx.beginPath();
        this.ctx.rect(this.paddleX, this.height - this.paddleHeight, this.paddleWidth, this.paddleHeight);
        this.ctx.fillStyle = "#0095DD";
        this.ctx.fill();
        this.ctx.closePath();
    }

    drawBricks() {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    this.ctx.beginPath();
                    this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
                    this.ctx.fillStyle = this.bricks[c][r].color;
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
            p.life -= 0.05;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawScore() {
        this.ctx.font = "16px Inter";
        this.ctx.fillStyle = "#fff";
        this.ctx.fillText("Score: " + this.score, 8, 20);
        this.ctx.fillText("Lives: " + this.lives, this.width - 65, 20);
    }

    update() {
        if (!this.isPlaying) return;

        this.drawBall();
        this.drawPaddle();
        this.drawBricks();
        this.drawParticles();
        this.drawScore();
        this.collisionDetection();

        if (this.x + this.dx > this.width - this.ballRadius || this.x + this.dx < this.ballRadius) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        } else if (this.y + this.dy > this.height - this.ballRadius) {
            if (this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
                // Hit paddle
                // Add some english based on where it hit
                const hitPoint = this.x - (this.paddleX + this.paddleWidth / 2);
                this.dx = hitPoint * 0.15; // English
                this.dy = -this.dy * 1.05; // Speed up slightly
            } else {
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
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.update();
        if (this.isPlaying) {
            requestAnimationFrame(() => this.draw());
        }
    }

    animate() {
        this.draw();
    }

    drawStartScreen() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Break the Year", this.width / 2, this.height / 2 - 20);
        this.ctx.font = '16px Inter';
        this.ctx.fillText("Click to Start", this.width / 2, this.height / 2 + 20);
    }

    gameOver() {
        this.isPlaying = false;
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '30px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Game Over!", this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Inter';
        this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);

        this.saveScore();

        // Allow restart after short delay
        setTimeout(() => {
            this.canvas.addEventListener('click', () => {
                if (!this.isPlaying) this.startGame();
            }, { once: true });
        }, 1000);
    }

    async saveScore() {
        try {
            await supabase.from('scores').insert([
                { score: this.score, timestamp: new Date() }
            ]);
        } catch (err) {
            console.error(err);
        }
    }
}
