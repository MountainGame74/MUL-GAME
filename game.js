const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- RÉGLAGES ---
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let gravity = 0.6;
let frames = 0;
let obstacles = [];

// --- LE DINO (Carré Gris Chrome) ---
let dino = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    dy: 0,
    jumpForce: 12,
    grounded: false
};

// --- CONTRÔLES ---
function jump() {
    if (isGameOver) {
        resetGame();
    } else if (dino.grounded) {
        dino.dy = -dino.jumpForce;
        dino.grounded = false;
    }
}

window.addEventListener('keydown', (e) => { if (e.code === "Space") jump(); });
window.addEventListener('mousedown', jump);
window.addEventListener('touchstart', (e) => { jump(); e.preventDefault(); }, {passive: false});

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    isGameOver = false;
    dino.y = 150;
    dino.dy = 0;
    frames = 0;
    gameLoop();
}

function spawnObstacle() {
    let height = 20 + Math.random() * 40;
    obstacles.push({
        x: canvas.width,
        y: 190 - height,
        width: 20,
        height: height
    });
}

function gameLoop() {
    if (isGameOver) return;

    frames++;

    // 1. PHYSIQUE
    dino.dy += gravity;
    dino.y += dino.dy;
    if (dino.y > 150) {
        dino.y = 150;
        dino.dy = 0;
        dino.grounded = true;
    }

    // 2. OBSTACLES (Apparition plus fluide)
    if (frames % 100 === 0) { // Un obstacle toutes les 100 frames environ
        spawnObstacle();
    }

    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;

        // Collision
        if (dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y) {
            isGameOver = true;
        }

        // Score et nettoyage
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
            if (score % 5 === 0) gameSpeed += 0.2; // Accélère tous les 5 points
        }
    });

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    // Fond
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sol (Ligne grise)
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.lineTo(canvas.width, 190);
    ctx.stroke();

    // Dino (Carré Gris Foncé)
    ctx.fillStyle = "#535353";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles (Carrés Gris un peu plus clairs)
    ctx.fillStyle = "#707070";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Score
    ctx.fillStyle = "#535353";
    ctx.font = "20px Courier New";
    ctx.fillText(score.toString().padStart(5, '0'), 520, 30);

    if (isGameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "#535353";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, 100);
        ctx.font = "14px Courier New";
        ctx.fillText("CLIQUE OU ESPACE POUR RECOMMENCER", canvas.width/2, 130);
        ctx.textAlign = "start";
    }
}

// Lancer le jeu
gameLoop();
