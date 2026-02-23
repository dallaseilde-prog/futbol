// ============================================
// FIFA 3D - Antigravity Edition
// input.js — Controles del jugador
// ============================================
import { CAMERA_MODES, CAMERA_NAMES } from './camera.js';

export const keys = {
    w: false, a: false, s: false, d: false,
    space: false, shift: false, j: false, k: false,
};

export function setupInput(cameraSystem) {
    window.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': keys.w = true; break;
            case 'KeyA': keys.a = true; break;
            case 'KeyS': keys.s = true; break;
            case 'KeyD': keys.d = true; break;
            case 'Space': keys.space = true; e.preventDefault(); break;
            case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
            case 'KeyJ': keys.j = true; break;
            case 'KeyK': keys.k = true; break;
            case 'Digit1': switchCamera(cameraSystem, CAMERA_MODES.BROADCAST); break;
            case 'Digit2': switchCamera(cameraSystem, CAMERA_MODES.PLAYER); break;
            case 'Digit3': switchCamera(cameraSystem, CAMERA_MODES.SIDE); break;
            case 'Digit4': switchCamera(cameraSystem, CAMERA_MODES.TACTICAL); break;
        }
    });
    window.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': keys.w = false; break;
            case 'KeyA': keys.a = false; break;
            case 'KeyS': keys.s = false; break;
            case 'KeyD': keys.d = false; break;
            case 'Space': keys.space = false; break;
            case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
            case 'KeyJ': keys.j = false; break;
            case 'KeyK': keys.k = false; break;
        }
    });
}

function switchCamera(cameraSystem, mode) {
    cameraSystem.mode = mode;
    const label = document.getElementById('camera-label');
    if (label) {
        label.textContent = '📷 ' + CAMERA_NAMES[mode];
        label.classList.add('show-camera');
        setTimeout(() => label.classList.remove('show-camera'), 1500);
    }
}
