// Game constants
const TILE_SIZE = 20;
const COLS = 28;
const ROWS = 30;

// Game states
const GAME_STATES = {
    IDLE: 'idle',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    WIN: 'win'
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameState = GAME_STATES.IDLE;
let score = 0;
let lives = 3;
let level = 1;
let pelletsRemaining = 0;

// Pac-Man object
const pacman = {
    x: 1,
    y: 1,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    speed: 1,
    mouthOpen: true
};

// Ghosts
const ghosts = [
    { x: 12, y: 13, color: '#FF0000', direction: 'LEFT', speed: 1 },
    { x: 13, y: 14, color: '#FFB6C1', direction: 'UP', speed: 1 },
    { x: 14, y: 13, color: '#00FFFF', direction: 'RIGHT', speed: 1 },
    { x: 15, y: 14, color: '#FFB347', direction: 'DOWN', speed: 1 }
];

let ghostFrightened = false;
let frightenedTimer = 0;

// Game map
let gameMap = [];
let pellets = [];
let powerPellets = [];

// Initialize game
function initGame() {
    createMap();
    createPellets();
    resetPositions();
    gameState = GAME_STATES.IDLE;
    updateUI();
}

// Create game map with walls
function createMap() {
    gameMap = [];
    for (let row = 0; row < ROWS; row++) {
        gameMap[row] = [];
        for (let col = 0; col < COLS; col++) {
            if (row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1) {
                gameMap[row][col] = 1;
            }
            else if ((row === 5 || row === 15 || row === 25) && (col > 2 && col < 10 || col > 18 && col < 26)) {
                gameMap[row][col] = 1;
            }
            else if ((col === 7 || col === 20) && (row > 5 && row < 15)) {
                gameMap[row][col] = 1;
            }
            else {
                gameMap[row][col] = 0;
            }
        }
    }
}

// Create pellets
function createPellets() {
    pellets = [];
    powerPellets = [];
    
    for (let row = 1; row < ROWS - 1; row++) {
        for (let col = 1; col < COLS - 1; col++) {
            if (gameMap[row][col] === 0) {
                if ((row === 1 && col === 1) || (row === 1 && col === COLS - 2) ||
                    (row === ROWS - 2 && col === 1) || (row === ROWS - 2 && col === COLS - 2)) {
                    powerPellets.push({ x: col, y: row });
                } else if (Math.random() > 0.15) {
                    pellets.push({ x: col, y: row });
                }
            }
        }
    }
    
    pelletsRemaining = pellets.length + powerPellets.length;
}

// Reset positions
function resetPositions() {
    pacman.x = 1;
    pacman.y = 1;
    pacman.direction = 'RIGHT';
    pacman.nextDirection = 'RIGHT';
    
    ghosts[0].x = 12;
    ghosts[0].y = 13;
    ghosts[1].x = 13;
    ghosts[1].y = 14;
    ghosts[2].x = 14;
    ghosts[2].y = 13;
    ghosts[3].x = 15;
    ghosts[3].y = 14;
    
    ghostFrightened = false;
    frightenedTimer = 0;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            pacman.nextDirection = 'UP';
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            pacman.nextDirection = 'DOWN';
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            pacman.nextDirection = 'LEFT';
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            pacman.nextDirection = 'RIGHT';
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button handlers
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

function startGame() {
    if (gameState === GAME_STATES.IDLE) {
        gameState = GAME_STATES.PLAYING;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        gameLoop();
    }
}

function togglePause() {
    if (gameState === GAME_STATES.PLAYING) {
        gameState = GAME_STATES.PAUSED;
        document.getElementById('pauseBtn').textContent = 'RESUME';
    } else if (gameState === GAME_STATES.PAUSED) {
        gameState = GAME_STATES.PLAYING;
        document.getElementById('pauseBtn').textContent = 'PAUSE';
        gameLoop();
    }
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    initGame();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'PAUSE';
    updateUI();
}

// Move Pac-Man
function movePacman() {
    let newX = pacman.x;
    let newY = pacman.y;
    
    if (pacman.nextDirection === 'UP' && canMove(pacman.x, pacman.y - 1)) {
        pacman.direction = 'UP';
    }
    if (pacman.nextDirection === 'DOWN' && canMove(pacman.x, pacman.y + 1)) {
        pacman.direction = 'DOWN';
    }
    if (pacman.nextDirection === 'LEFT' && canMove(pacman.x - 1, pacman.y)) {
        pacman.direction = 'LEFT';
    }
    if (pacman.nextDirection === 'RIGHT' && canMove(pacman.x + 1, pacman.y)) {
        pacman.direction = 'RIGHT';
    }
    
    switch(pacman.direction) {
        case 'UP':
            if (canMove(pacman.x, pacman.y - 1)) newY--;
            break;
        case 'DOWN':
            if (canMove(pacman.x, pacman.y + 1)) newY++;
            break;
        case 'LEFT':
            if (canMove(pacman.x - 1, pacman.y)) newX--;
            break;
        case 'RIGHT':
            if (canMove(pacman.x + 1, pacman.y)) newX++;
            break;
    }
    
    pacman.x = newX;
    pacman.y = newY;
    
    checkPelletCollision();
    
    pacman.mouthOpen = !pacman.mouthOpen;
}

// Check if position is walkable
function canMove(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    return gameMap[y][x] === 0;
}

// Check pellet collision
function checkPelletCollision() {
    for (let i = pellets.length - 1; i >= 0; i--) {
        if (pellets[i].x === pacman.x && pellets[i].y === pacman.y) {
            score += 10;
            pellets.splice(i, 1);
            pelletsRemaining--;
        }
    }
    
    for (let i = powerPellets.length - 1; i >= 0; i--) {
        if (powerPellets[i].x === pacman.x && powerPellets[i].y === pacman.y) {
            score += 50;
            powerPellets.splice(i, 1);
            pelletsRemaining--;
            ghostFrightened = true;
            frightenedTimer = 300;
        }
    }
    
    if (pelletsRemaining === 0) {
        levelUp();
    }
}

// Move ghosts
function moveGhosts() {
    for (let ghost of ghosts) {
        let directions = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        let validDirections = directions.filter(dir => {
            let newX = ghost.x;
            let newY = ghost.y;
            
            if (dir === 'UP') newY--;
            if (dir === 'DOWN') newY++;
            if (dir === 'LEFT') newX--;
            if (dir === 'RIGHT') newX++;
            
            return canMove(newX, newY);
        });
        
        if (validDirections.length > 0) {
            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
        
        let newX = ghost.x;
        let newY = ghost.y;
        
        if (ghost.direction === 'UP') newY--;
        if (ghost.direction === 'DOWN') newY++;
        if (ghost.direction === 'LEFT') newX--;
        if (ghost.direction === 'RIGHT') newX++;
        
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }
    }
}

// Check ghost collision
function checkGhostCollision() {
    for (let ghost of ghosts) {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            if (ghostFrightened) {
                score += 200;
                ghost.x = 12 + Math.random() * 4;
                ghost.y = 13 + Math.random() * 4;
            } else {
                lives--;
                if (lives <= 0) {
                    gameState = GAME_STATES.GAME_OVER;
                } else {
                    resetPositions();
                }
                updateUI();
            }
        }
    }
}

// Level up
function levelUp() {
    level++;
    score += 500;
    for (let ghost of ghosts) {
        ghost.speed = Math.min(ghost.speed + 0.2, 2);
    }
    createPellets();
    resetPositions();
    updateUI();
}

// Draw game
function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0066FF';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameMap[row][col] === 1) {
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    ctx.fillStyle = '#FFB6C1';
    for (let pellet of pellets) {
        ctx.beginPath();
        ctx.arc(pellet.x * TILE_SIZE + TILE_SIZE / 2, pellet.y * TILE_SIZE + TILE_SIZE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.fillStyle = '#FFB6C1';
    for (let pellet of powerPellets) {
        ctx.beginPath();
        ctx.arc(pellet.x * TILE_SIZE + TILE_SIZE / 2, pellet.y * TILE_SIZE + TILE_SIZE / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPacman();
    
    for (let ghost of ghosts) {
        drawGhost(ghost);
    }
    
    if (gameState === GAME_STATES.GAME_OVER) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Draw Pac-Man
function drawPacman() {
    const x = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    const y = pacman.y * TILE_SIZE + TILE_SIZE / 2;
    const radius = TILE_SIZE / 2 - 2;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    if (pacman.mouthOpen) {
        switch(pacman.direction) {
            case 'RIGHT':
                startAngle = 0.3;
                endAngle = Math.PI * 2 - 0.3;
                break;
            case 'LEFT':
                startAngle = Math.PI + 0.3;
                endAngle = Math.PI - 0.3;
                break;
            case 'UP':
                startAngle = Math.PI * 1.5 + 0.3;
                endAngle = Math.PI * 1.5 - 0.3;
                break;
            case 'DOWN':
                startAngle = Math.PI * 0.5 + 0.3;
                endAngle = Math.PI * 0.5 - 0.3;
                break;
        }
    }
    
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
}

// Draw ghost
function drawGhost(ghost) {
    const x = ghost.x * TILE_SIZE;
    const y = ghost.y * TILE_SIZE;
    
    if (ghostFrightened) {
        ctx.fillStyle = '#0066FF';
    } else {
        ctx.fillStyle = ghost.color;
    }
    
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 6);
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE - 4, TILE_SIZE / 2 - 2, Math.PI, 0);
    ctx.fill();
    
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE - 6, y + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE - 6, y + 6, 1, 0, Math.PI * 2);
    ctx.fill();
}

// Update frightened state
function updateFrightened() {
    if (ghostFrightened) {
        frightenedTimer--;
        if (frightenedTimer <= 0) {
            ghostFrightened = false;
        }
    }
}

// Main game loop
let frameCount = 0;
function gameLoop() {
    if (gameState !== GAME_STATES.PLAYING) {
        if (gameState !== GAME_STATES.GAME_OVER) {
            return;
        }
    }
    
    frameCount++;
    
    if (frameCount % 2 === 0) {
        movePacman();
        moveGhosts();
        checkGhostCollision();
        updateFrightened();
        updateUI();
    }
    
    draw();
    
    if (gameState === GAME_STATES.PLAYING) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    initGame();
    draw();
});
