// ============================================
// FIFA 3D - Antigravity Edition
// lighting.js — Iluminación y sombras
// ============================================
import * as THREE from 'three';
import { COLORS, PITCH_LENGTH, PITCH_WIDTH } from './config.js';

export function setupLighting(scene) {
    const hemiLight = new THREE.HemisphereLight(COLORS.sky, COLORS.ground, 0.5);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4e5, 1.0);
    sunLight.position.set(30, 60, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    const dX = PITCH_LENGTH / 2 + 5;
    const dZ = PITCH_WIDTH / 2 + 5;
    sunLight.shadow.camera.left = -dX;
    sunLight.shadow.camera.right = dX;
    sunLight.shadow.camera.top = dZ;
    sunLight.shadow.camera.bottom = -dZ;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.bias = -0.0002;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    scene.add(sunLight.target);
    return { hemiLight, sunLight };
}
