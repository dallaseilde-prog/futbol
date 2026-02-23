// ============================================
// FIFA 3D - Antigravity Edition
// hud.js — Marcador y anuncios
// ============================================
import { BALL_RADIUS, PITCH_LENGTH, GOAL_WIDTH, GOAL_HEIGHT } from './config.js';
import { resetTeamPositions } from './team.js';

export function updateHUD(gameState) {
    document.getElementById('blue-score').innerText = gameState.scoreBlue;
    document.getElementById('red-score').innerText = gameState.scoreRed;
}

export function checkGoal(gameState, ball) {
    if (gameState.isGoal) return;
    if (Math.abs(ball.position.z) < GOAL_WIDTH / 2 && ball.position.y < GOAL_HEIGHT) {
        if (ball.position.x > PITCH_LENGTH / 2) {
            gameState.scoreBlue++;
            triggerGoal(gameState, ball);
        } else if (ball.position.x < -PITCH_LENGTH / 2) {
            gameState.scoreRed++;
            triggerGoal(gameState, ball);
        }
    }
}

function triggerGoal(gameState, ball) {
    gameState.isGoal = true;
    updateHUD(gameState);
    const announcer = document.getElementById('goal-announcer');
    announcer.classList.add('show-goal');
    setTimeout(() => {
        announcer.classList.remove('show-goal');
        resetPositions(gameState, ball);
    }, 3000);
}

function resetPositions(gameState, ball) {
    resetTeamPositions(gameState.teamBlue, gameState.teamRed);
    gameState.activePlayer = gameState.teamBlue[10];
    ball.position.set(0, BALL_RADIUS, 0);
    ball.userData.velocity.set(0, 0, 0);
    gameState.isGoal = false;
}
