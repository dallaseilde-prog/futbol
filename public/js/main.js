// ============================================
// FIFA 3D - Antigravity Edition
// main.js — Game loop y orquestación
// ============================================
import * as THREE from 'three';
import { createScene, createCamera, createRenderer, setupResize } from './scene.js';
import { setupLighting } from './lighting.js';
import { createPitch } from './pitch.js';
import { createGoals } from './goal.js';
import { createBall, updateBallPhysics } from './ball.js';
import { createTeams } from './team.js';
import { setupInput } from './input.js';
import { updateGameLogic } from './ai.js';
import { checkGoal } from './hud.js';
import { createCameraSystem, updateCamera } from './camera.js';
import { animateIndicator } from './player.js';
import { initMinimap, updateMinimap } from './minimap.js';
import { createStadium, updateStadium } from './stadium.js';

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
setupResize(camera, renderer);
setupLighting(scene);
createPitch(scene);
createGoals(scene);
const stadium = createStadium(scene);
const ball = createBall(scene);

let gameState;
let cameraSystem;
const clock = new THREE.Clock();

async function init() {
    const teams = await createTeams(scene);
    cameraSystem = createCameraSystem();
    setupInput(cameraSystem);

    gameState = {
        teamBlue: teams.teamBlue,
        teamRed: teams.teamRed,
        activePlayer: teams.activePlayer,
        activeIndicator: teams.activeIndicator,
        targetRotation: 0,
        scoreBlue: 0, scoreRed: 0,
        isGoal: false, stamina: 100,
    };

    clock.start();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();

    if (gameState) {
        // Update animation mixers
        gameState.teamBlue.forEach(p => p.userData.mixer?.update(dt));
        gameState.teamRed.forEach(p => p.userData.mixer?.update(dt));

        // Lock root motion: prevent Hips bone from displacing the model
        const lockRootMotion = (player) => {
            player.traverse((child) => {
                if (child.isBone && child.name.toLowerCase().includes('hips')) {
                    child.position.x = 0;
                    child.position.z = 0;
                }
            });
        };
        gameState.teamBlue.forEach(lockRootMotion);
        gameState.teamRed.forEach(lockRootMotion);

        updateGameLogic(gameState, ball, dt);
        updateBallPhysics(ball, dt);
        checkGoal(gameState, ball);
        animateIndicator(gameState.activeIndicator, elapsed);
        updateCamera(camera, cameraSystem, ball, gameState.activePlayer, dt);
    }

    if (stadium) updateStadium(stadium, elapsed);
    renderer.render(scene, camera);
}

init();
