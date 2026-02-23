// ============================================
// FIFA 3D - Antigravity Edition
// ai.js — Inteligencia artificial
// ============================================
import * as THREE from 'three';
import {
    FORMATIONS, PITCH_LENGTH, PITCH_WIDTH, GOAL_WIDTH, PLAYER_SPEED,
    SPRINT_MULTIPLIER, SHOOT_POWER, PASS_POWER, GOAL_HEIGHT, BALL_RADIUS
} from './config.js';
import { keys } from './input.js';
import { animatePlayer } from './player.js';

export function updateGameLogic(gameState, ball, dt) {
    const { teamBlue, teamRed, activeIndicator } = gameState;
    const vel = ball.userData.velocity;
    if (gameState.isGoal) return;

    // Stamina
    if (keys.shift && gameState.stamina > 0) {
        gameState.stamina -= dt * 25;
        if (gameState.stamina < 0) gameState.stamina = 0;
    } else if (!keys.shift && gameState.stamina < 100) {
        gameState.stamina += dt * 12;
        if (gameState.stamina > 100) gameState.stamina = 100;
    }
    const staminaBar = document.getElementById('stamina-fill');
    if (staminaBar) {
        staminaBar.style.width = gameState.stamina + '%';
        staminaBar.style.backgroundColor = gameState.stamina > 30 ? '#4facfe' : '#ff4444';
    }

    // Auto-switch active player
    let closestBlue = gameState.activePlayer;
    let minDistBlue = Infinity;
    let playerHasBall = false;
    teamBlue.forEach(p => {
        const d = p.position.distanceTo(ball.position);
        if (d < minDistBlue) { minDistBlue = d; closestBlue = p; }
        if (d < 2.5 && ball.position.y < 2) playerHasBall = true;
    });
    if (keys.k) { gameState.activePlayer = closestBlue; keys.k = false; }
    else if (!playerHasBall && !keys.j && vel.lengthSq() > 50) { gameState.activePlayer = closestBlue; }

    activeIndicator.position.x = gameState.activePlayer.position.x;
    activeIndicator.position.z = gameState.activePlayer.position.z;

    // Player controller
    let moveX = 0, moveZ = 0;
    if (keys.w) moveZ -= 1;
    if (keys.s) moveZ += 1;
    if (keys.a) moveX -= 1;
    if (keys.d) moveX += 1;
    const inputDir = new THREE.Vector3(moveX, 0, moveZ).normalize();
    const isMoving = inputDir.lengthSq() > 0.1;
    let currentSpeed = PLAYER_SPEED;
    const canSprint = keys.shift && gameState.stamina > 0;
    if (canSprint) currentSpeed *= SPRINT_MULTIPLIER;
    if (isMoving) {
        gameState.targetRotation = Math.atan2(inputDir.x, inputDir.z);
        gameState.activePlayer.position.add(inputDir.clone().multiplyScalar(currentSpeed * dt));
    }
    const currentRot = gameState.activePlayer.rotation.y;
    let diff = gameState.targetRotation - currentRot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    gameState.activePlayer.rotation.y += diff * 10 * dt;
    animatePlayer(gameState.activePlayer, dt, isMoving, currentSpeed);
    gameState.activePlayer.position.x = THREE.MathUtils.clamp(gameState.activePlayer.position.x, -PITCH_LENGTH / 2 - 2, PITCH_LENGTH / 2 + 2);
    gameState.activePlayer.position.z = THREE.MathUtils.clamp(gameState.activePlayer.position.z, -PITCH_WIDTH / 2 - 1, PITCH_WIDTH / 2 + 1);

    // Blue AI teammates
    teamBlue.forEach((p, index) => {
        if (p === gameState.activePlayer) return;
        let targetPos = new THREE.Vector3(FORMATIONS.blue[index].x, 0, FORMATIONS.blue[index].z);
        if (index === 0) {
            const gkX = -PITCH_LENGTH / 2 + 2;
            const gkZ = THREE.MathUtils.clamp(ball.position.z * 0.7, -GOAL_WIDTH / 2 + 1, GOAL_WIDTH / 2 - 1);
            targetPos.set(gkX, 0, gkZ);
        } else if (index >= 8) {
            targetPos.x += ball.position.x * 0.45 + 10;
            targetPos.z += (ball.position.z - targetPos.z) * 0.2;
        } else if (index >= 5) {
            targetPos.x += ball.position.x * 0.4;
            targetPos.z += (ball.position.z - targetPos.z) * 0.15;
        } else {
            targetPos.x += ball.position.x * 0.2;
        }
        targetPos.x = THREE.MathUtils.clamp(targetPos.x, -PITCH_LENGTH / 2 + 2, PITCH_LENGTH / 2 - 5);
        targetPos.z = THREE.MathUtils.clamp(targetPos.z, -PITCH_WIDTH / 2 + 2, PITCH_WIDTH / 2 - 2);
        const dir = targetPos.clone().sub(p.position);
        const aiMoving = dir.lengthSq() > 1;
        if (aiMoving) {
            dir.normalize();
            const spd = (index === 0 ? 9 : 7) * dt;
            p.position.add(dir.multiplyScalar(spd));
            p.rotation.y = Math.atan2(dir.x, dir.z);
        }
        animatePlayer(p, dt, aiMoving, 7);
    });

    // Red CPU AI
    const redDistances = teamRed.map((p, i) => ({ player: p, index: i, dist: p.position.distanceTo(ball.position) }));
    redDistances.sort((a, b) => a.dist - b.dist);
    const pressers = new Set();
    if (redDistances.length > 1) {
        pressers.add(redDistances[0].player);
        if (redDistances[1].dist < 25) pressers.add(redDistances[1].player);
    }
    teamRed.forEach((p, index) => {
        let targetPos = new THREE.Vector3(FORMATIONS.red[index].x, 0, FORMATIONS.red[index].z);
        let aiSpeed = 8;
        if (index === 0) {
            const dist = ball.position.x - (PITCH_LENGTH / 2 - 5);
            const gkX = PITCH_LENGTH / 2 - 2 + Math.min(0, dist * 0.3);
            targetPos.set(
                THREE.MathUtils.clamp(gkX, PITCH_LENGTH / 2 - 12, PITCH_LENGTH / 2 - 1), 0,
                THREE.MathUtils.clamp(ball.position.z * 0.8, -GOAL_WIDTH / 2 + 1, GOAL_WIDTH / 2 - 1)
            );
            aiSpeed = 10;
        } else if (pressers.has(p) && ball.position.x > -PITCH_LENGTH / 3) {
            targetPos.copy(ball.position); aiSpeed = 10;
        } else if (index >= 8) {
            targetPos.x += ball.position.x * 0.35 - 8;
            targetPos.z += (ball.position.z - targetPos.z) * 0.2;
        } else if (index >= 5) {
            targetPos.x += ball.position.x * 0.3;
        } else {
            targetPos.x += ball.position.x * 0.15;
        }
        targetPos.x = THREE.MathUtils.clamp(targetPos.x, -PITCH_LENGTH / 2 + 5, PITCH_LENGTH / 2 - 2);
        targetPos.z = THREE.MathUtils.clamp(targetPos.z, -PITCH_WIDTH / 2 + 2, PITCH_WIDTH / 2 - 2);
        const dir = targetPos.clone().sub(p.position);
        const aiMoving = dir.lengthSq() > 0.5;
        if (aiMoving) {
            dir.normalize();
            p.position.add(dir.multiplyScalar(aiSpeed * dt));
            p.rotation.y = Math.atan2(dir.x, dir.z);
        }
        animatePlayer(p, dt, aiMoving, aiSpeed);
        if (p.position.distanceTo(ball.position) < 2.0 && ball.position.y < 2) {
            if (index === 0) {
                vel.set(-30, 10, (Math.random() - 0.5) * 20);
                p.userData.isKicking = true; setTimeout(() => p.userData.isKicking = false, 300);
            } else {
                const goalDir = new THREE.Vector3(-PITCH_LENGTH / 2, 0, 0).sub(ball.position).normalize();
                const distToGoal = ball.position.distanceTo(new THREE.Vector3(-PITCH_LENGTH / 2, 0, 0));
                if (distToGoal < 35) {
                    vel.copy(goalDir).multiplyScalar(SHOOT_POWER * 0.85);
                    vel.y = 6 + Math.random() * 4;
                    vel.z += (Math.random() - 0.5) * 8;
                } else {
                    vel.set(-18 - Math.random() * 5, 3, (Math.random() - 0.5) * 12);
                }
                p.userData.isKicking = true; setTimeout(() => p.userData.isKicking = false, 300);
            }
        }
    });

    // Player interactions
    const distToBall = gameState.activePlayer.position.distanceTo(ball.position);
    const playerForward = new THREE.Vector3(
        Math.sin(gameState.activePlayer.rotation.y), 0,
        Math.cos(gameState.activePlayer.rotation.y)
    ).normalize();
    if (gameState.kickCooldown === undefined) gameState.kickCooldown = 0;
    if (gameState.kickCooldown > 0) gameState.kickCooldown -= dt;

    if (distToBall < 2.5 && ball.position.y < 2.5 && gameState.kickCooldown <= 0) {
        const ballOffset = playerForward.clone().multiplyScalar(0.6);
        const targetBallPos = gameState.activePlayer.position.clone().add(ballOffset);
        targetBallPos.y = BALL_RADIUS;
        ball.position.copy(targetBallPos);
        vel.set(0, 0, 0);
        if (isMoving) {
            const rotAxis = new THREE.Vector3(0, 1, 0).cross(playerForward).normalize();
            ball.rotateOnWorldAxis(rotAxis, currentSpeed * dt * 0.8);
        }
        if (keys.space) {
            const goalCenter = new THREE.Vector3(PITCH_LENGTH / 2, GOAL_HEIGHT / 3, 0);
            const toGoal = goalCenter.sub(ball.position).normalize();
            const shootDir = playerForward.clone().multiplyScalar(0.7).add(toGoal.multiplyScalar(0.3)).normalize();
            vel.copy(shootDir).multiplyScalar(SHOOT_POWER);
            vel.y = 6 + Math.random() * 6;
            keys.space = false;
            gameState.kickCooldown = 0.3;
            const p = gameState.activePlayer; p.userData.isKicking = true; setTimeout(() => p.userData.isKicking = false, 300);
        }
        if (keys.j) {
            let bestMate = null, bestScore = -Infinity;
            teamBlue.forEach(mate => {
                if (mate === gameState.activePlayer) return;
                const dirToMate = mate.position.clone().sub(gameState.activePlayer.position).normalize();
                const dot = playerForward.dot(dirToMate);
                const dist = gameState.activePlayer.position.distanceTo(mate.position);
                const advanceBonus = mate.position.x > gameState.activePlayer.position.x ? 15 : 0;
                let minRedDist = Infinity;
                teamRed.forEach(r => { const rd = r.position.distanceTo(mate.position); if (rd < minRedDist) minRedDist = rd; });
                const freeBonus = minRedDist > 8 ? 20 : 0;
                if (dot > 0.2 && dist < 60) {
                    const score = (dot * 80) - dist + advanceBonus + freeBonus;
                    if (score > bestScore) { bestScore = score; bestMate = mate; }
                }
            });
            if (bestMate) {
                const passDist = gameState.activePlayer.position.distanceTo(bestMate.position);
                const passDir = bestMate.position.clone().sub(ball.position).normalize();
                const power = THREE.MathUtils.clamp(PASS_POWER * (passDist / 45), 12, PASS_POWER);
                vel.copy(passDir).multiplyScalar(power);
                vel.y = passDist > 25 ? 5 : 2;
                gameState.activePlayer = bestMate;
                gameState.kickCooldown = 0.3;
                const p = gameState.activePlayer; p.userData.isKicking = true; setTimeout(() => p.userData.isKicking = false, 300);
            }
            keys.j = false;
        }
    }
    if (keys.k && distToBall < 4 && distToBall > 1.5) {
        const lungeDir = ball.position.clone().sub(gameState.activePlayer.position).normalize();
        gameState.activePlayer.position.add(lungeDir.multiplyScalar(3 * dt * 20));
        if (distToBall < 2.5) { vel.copy(playerForward).multiplyScalar(8); vel.y = 1; }
    }
}
