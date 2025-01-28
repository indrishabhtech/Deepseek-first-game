const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const joystick = document.getElementById('joystick');
const joystickContainer = document.getElementById('joystickContainer');
const shootButton = document.getElementById('shootButton');
const scoreBoard = document.getElementById('scoreBoard');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

let score = 0;
let gameOver = false;
let playerX = 50;
let joystickX = 0;
let joystickY = 0;

// Joystick movement
joystickContainer.addEventListener('touchmove', (e) => {
    if (gameOver) return;
    const touch = e.touches[0];
    const rect = joystickContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2;

    if (distance < maxDistance) {
        joystickX = deltaX / maxDistance;
        joystickY = deltaY / maxDistance;
        joystick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    } else {
        const angle = Math.atan2(deltaY, deltaX);
        joystickX = Math.cos(angle);
        joystickY = Math.sin(angle);
        joystick.style.transform = `translate(${Math.cos(angle) * maxDistance}px, ${Math.sin(angle) * maxDistance}px)`;
    }
});

joystickContainer.addEventListener('touchend', () => {
    joystickX = 0;
    joystickY = 0;
    joystick.style.transform = 'translate(-50%, -50%)';
});

// Player movement
function updatePlayerPosition() {
    if (gameOver) return;
    playerX += joystickX * 5;
    if (playerX < 0) playerX = 0;
    if (playerX > 100) playerX = 100;
    player.style.left = `${playerX}%`;
    requestAnimationFrame(updatePlayerPosition);
}

updatePlayerPosition();

// Shooting
shootButton.addEventListener('touchstart', () => {
    if (gameOver) return;
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.left = `${playerX}%`;
    gameArea.appendChild(bullet);

    let bulletY = 100;
    const bulletInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(bulletInterval);
            return;
        }
        bulletY -= 2;
        bullet.style.bottom = `${bulletY}%`;
        if (bulletY < 0) {
            bullet.remove();
            clearInterval(bulletInterval);
        }
    }, 20);
});

// Game over and restart
function endGame() {
    gameOver = true;
    gameOverScreen.style.display = 'flex';
    finalScore.textContent = `Score: ${score}`;
}

restartButton.addEventListener('click', () => {
    gameOver = false;
    gameOverScreen.style.display = 'none';
    score = 0;
    scoreBoard.textContent = `Score: ${score}`;
    updatePlayerPosition();
});

// Enemy spawning
function spawnEnemy() {
    if (gameOver) return;
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${Math.random() * 90}%`;
    gameArea.appendChild(enemy);

    let enemyY = 0;
    const enemyInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(enemyInterval);
            return;
        }
        enemyY += 1;
        enemy.style.top = `${enemyY}%`;
        if (enemyY > 100) {
            enemy.remove();
            clearInterval(enemyInterval);
            endGame();
        }
    }, 50);
}

setInterval(spawnEnemy, 1000);

// Collision detection
function checkCollisions() {
    const bullets = document.querySelectorAll('.bullet');
    const enemies = document.querySelectorAll('.enemy');
    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            const bulletRect = bullet.getBoundingClientRect();
            const enemyRect = enemy.getBoundingClientRect();
            if (bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top) {
                bullet.remove();
                enemy.remove();
                score += 10;
                scoreBoard.textContent = `Score: ${score}`;
            }
        });
    });
    requestAnimationFrame(checkCollisions);
}

checkCollisions();
