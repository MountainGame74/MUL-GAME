const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- SYSTÈME RESPONSIVE ---
function resize() {
    // On donne au canvas la largeur de la fenêtre
    canvas.width = window.innerWidth;
    if (canvas.width > 1200) canvas.width = 1200; // Limite max
    canvas.height = 200; // Hauteur fixe pour la logique
}
window.addEventListener('resize', resize);
resize();

// --- VARIABLES ---
let score = 0;
let gameSpeed = 6;
let isGameOver = false;
let gravity = 0.6;
let frames = 0;
let obstacles = [];

// --- LE DINO ---
let dino = {
    x: 50,
    y: 150,
    width: 40,
    height: 40,
    dy: 0,
    jumpForce: 12,
    grounded: false
};

// --- ENTRÉES (Clavier + Souris + Tactile) ---
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
window.addEventListener('touchstart', (e) => { 
    jump(); 
    e.preventDefault(); 
}, {passive: false});

function resetGame() {
    score = 0;
    gameSpeed = 6;
    obstacles = [];
    isGameOver = false;
    dino.y = 150;
    dino.dy = 0;
    frames = 0;
    gameLoop();
}

function spawnObstacle() {
    let height = 25 + Math.random() * 35;
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

    // 2. OBSTACLES (Vitesse s'ajustant à la fréquence)
    if (frames % 90 === 0) {
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

        // Nettoyage et Score
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
            if (score % 10 === 0) gameSpeed += 0.3; // Accélération
        }
    });

    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sol
    ctx.strokeStyle = "#535353";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.lineTo(canvas.width, 190);
    ctx.stroke();

    // Dino
    ctx.fillStyle = "#535353";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles
    ctx.fillStyle = "#707070";
    obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Score (Toujours placé par rapport au bord droit)
    ctx.fillStyle = "#535353";
    ctx.font = "bold 20px Courier New";
    ctx.textAlign = "right";
    ctx.fillText("HI " + score.toString().padStart(5, '0'), canvas.width - 20, 30);
    ctx.textAlign = "left"; // Reset pour le reste

    if (isGameOver) {
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = "#535353";
        ctx.textAlign = "center";
        ctx.font = "bold 24px Courier New";
        ctx.fillText("G A M E  O V E R", canvas.width / 2, 100);
        ctx.font = "14px Courier New";
        ctx.fillText("CLIQUE POUR RECOMMENCER", canvas.width / 2, 130);
    }
}

// Lancer le moteur
gameLoop();
