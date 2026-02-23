// ============================================
// FIFA 3D - Antigravity Edition
// camera.js — Sistema de cámaras múltiples
// ============================================
import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH } from './config.js';

export const CAMERA_MODES = { BROADCAST: 0, PLAYER: 1, SIDE: 2, TACTICAL: 3 };
export const CAMERA_NAMES = ['BROADCAST', 'JUGADOR', 'LATERAL', 'TÁCTICA'];

export function createCameraSystem() {
    return { mode: CAMERA_MODES.BROADCAST, smoothness: 3, offset: new THREE.Vector3() };
}

export function updateCamera(camera, camSystem, ball, activePlayer, dt) {
    const mode = camSystem.mode;
    const lerp = camSystem.smoothness * dt;
    const targetPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    switch (mode) {
        case CAMERA_MODES.BROADCAST: {
            targetPos.copy(ball.position).add(new THREE.Vector3(0, 50, 42));
            targetPos.x *= 0.55;
            lookTarget.copy(ball.position);
            break;
        }
        case CAMERA_MODES.PLAYER: {
            const forward = new THREE.Vector3(Math.sin(activePlayer.rotation.y), 0, Math.cos(activePlayer.rotation.y));
            targetPos.copy(activePlayer.position).sub(forward.clone().multiplyScalar(12)).add(new THREE.Vector3(0, 8, 0));
            lookTarget.copy(activePlayer.position).add(forward.clone().multiplyScalar(8)).add(new THREE.Vector3(0, 2, 0));
            break;
        }
        case CAMERA_MODES.SIDE: {
            const sideX = THREE.MathUtils.clamp(ball.position.x * 0.3, -PITCH_LENGTH / 4, PITCH_LENGTH / 4);
            targetPos.set(sideX, 70, PITCH_WIDTH / 2 + 65);
            lookTarget.set(sideX, 0, 0);
            break;
        }
        case CAMERA_MODES.TACTICAL: {
            targetPos.set(0, 75, 5);
            lookTarget.set(0, 0, 0);
            break;
        }
    }

    camera.position.lerp(targetPos, Math.min(lerp, 1));
    const dummyCam = camera.clone();
    dummyCam.position.copy(camera.position);
    dummyCam.lookAt(lookTarget);
    camera.quaternion.slerp(dummyCam.quaternion, Math.min(lerp * 1.5, 1));
}
