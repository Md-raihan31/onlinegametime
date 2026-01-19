// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('bestScore');
const bestScoreMenuElement = document.getElementById('bestScoreMenu');
const gameStatusElement = document.getElementById('gameStatus');
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const playBtn = document.getElementById('playBtn');

// Bird object
const bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 26,
    velocity: 0,
    gravity: 0.35,
    jumpPower: -9,
    color: '#FFD700'
};

// Pipe object template
const pipeGap = 180;
const pipeWidth = 60;
const pipeColor = '#22aa22';

let pipes = [];
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let gameActive = false;
let gameOver = false;
let lastPipeX = 150;

// Initialize best score display
bestScoreElement.textContent = bestScore;
bestScoreMenuElement.textContent = bestScore;

// Event listeners
document.addEventListener('keydown', handleKeyPress);
canvas.addEventListener('click', handleCanvasClick);
playBtn.addEventListener('click', startGameFromMenu);

function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (menuScreen.style.display !== 'none') {
            startGameFromMenu();
        } else if (!gameActive && !gameOver) {
            startGame();
        } else if (gameActive && !gameOver) {
            bird.velocity = bird.jumpPower;
        }
    }
}

function handleCanvasClick() {
    if (!gameActive && !gameOver) {
        startGame();
    } else if (gameActive && !gameOver) {
        bird.velocity = bird.jumpPower;
    }
}

function startGame() {
    gameActive = true;
    gameOver = false;
    gameStatusElement.textContent = '';
    gameStatusElement.style.visibility = 'hidden';
}

function startGameFromMenu() {
    // Reset game state
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    lastPipeX = 150;
    scoreElement.textContent = score;
    
    // Switch screens
    menuScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Start game
    startGame();
    
    // Create initial pipe
    createPipe();
}

function showMenu() {
    // Reset game state
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    lastPipeX = 150;
    scoreElement.textContent = score;
    gameActive = false;
    gameOver = false;
    gameStatusElement.textContent = 'Click or Press SPACE to Start';
    gameStatusElement.style.visibility = 'visible';
    
    // Update best score in menu
    bestScoreMenuElement.textContent = bestScore;
    
    // Switch screens
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'flex';
}

function createPipe() {
    const minTopHeight = 40;
    const maxTopHeight = canvas.height - pipeGap - 40;
    const topPipeHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;
    const bottomPipeY = topPipeHeight + pipeGap;

    pipes.push({
        x: canvas.width,
        topHeight: topPipeHeight,
        bottomY: bottomPipeY,
        passed: false
    });
}

function updateBird() {
    if (!gameActive || gameOver) return;

    // Apply gravity
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Check bounds
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (!gameActive || gameOver) return;

    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 2;

        // Check if bird passed the pipe
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = score;
        }

        // Remove pipes that are off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }

    // Create new pipes
    if (lastPipeX < canvas.width - 150) {
        createPipe();
        lastPipeX = canvas.width;
    }
}

function checkCollisions() {
    if (!gameActive || gameOver) return;

    for (let pipe of pipes) {
        // Check if bird is in horizontal range of pipe
        if (bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth) {
            // Check vertical collision
            if (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY) {
                endGame();
                return;
            }
        }
    }
}

function endGame() {
    gameActive = false;
    gameOver = true;
    gameStatusElement.textContent = `Game Over! Final Score: ${score}`;
    gameStatusElement.style.visibility = 'visible';

    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
        localStorage.setItem('flappyBirdBestScore', bestScore);
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);

    // Rotate bird based on velocity
    const angle = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.5);
    ctx.rotate(angle);

    // Draw bird body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(10, -5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird beak
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(16, -2);
    ctx.lineTo(16, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawPipes() {
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Top pipe cap
        ctx.fillStyle = '#1d3d0a';
        ctx.fillRect(pipe.x - 4, pipe.topHeight - 8, pipeWidth + 8, 8);

        // Bottom pipe
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

        // Bottom pipe cap
        ctx.fillStyle = '#1d3d0a';
        ctx.fillRect(pipe.x - 4, pipe.bottomY, pipeWidth + 8, 8);
    }
}

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const time = Date.now() * 0.0001;

    // Cloud 1
    drawCloud(50 + Math.sin(time) * 20, 50);

    // Cloud 2
    drawCloud(250 + Math.sin(time + 1) * 25, 100);

    // Cloud 3
    drawCloud(350 + Math.sin(time + 2) * 20, 150);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y - 10, 25, 0, Math.PI * 2);
    ctx.arc(x + 40, y, 20, 0, Math.PI * 2);
   Show menu on start
showMenu

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // Draw ground line
    ctx.strokeStyle = '#1d5e1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 20);
    ctx.lineTo(canvas.width, canvas.height - 20);
    ctx.stroke();

    drawClouds();
    drawPipes();
    drawBird();

    // Draw score
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    updateBird();
    updatePipes();
    checkCollisions();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Create initial pipe
createPipe();
