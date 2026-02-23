// ============================================
// FIFA 3D - Antigravity Edition
// player.js — Creación de jugadores (Alta Fidelidad)
// ============================================
import * as THREE from 'three';
import { COLORS } from './config.js';

function createJerseyTexture(number, teamColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const color = new THREE.Color(teamColor);
    ctx.fillStyle = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 256; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 100, 256);
        ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(128, 0); ctx.lineTo(168, 0); ctx.lineTo(128, 40); ctx.lineTo(88, 0);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(78, 80, 100, 25);
    ctx.fillStyle = teamColor;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ANTIGRAVITY', 128, 92);

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 4;
    ctx.font = 'bold 80px Outfit, Arial, sans-serif';
    ctx.strokeText(String(number), 256, 120);
    ctx.fillText(String(number), 256, 120);
    ctx.strokeText(String(number), 0, 120);
    ctx.fillText(String(number), 0, 120);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createBlobShadow() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
const shadowTexture = createBlobShadow();

export function createPlayer(scene, teamColor, number = 0, gltfModel = null, animations = null) {
    const playerGroup = new THREE.Group();

    const dropShadowGeo = new THREE.PlaneGeometry(1.8, 1.8);
    const dropShadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture, transparent: true, depthWrite: false, opacity: 0.8
    });
    const dropShadow = new THREE.Mesh(dropShadowGeo, dropShadowMat);
    dropShadow.rotation.x = -Math.PI / 2;
    dropShadow.position.y = 0.02;
    playerGroup.add(dropShadow);

    if (gltfModel) {
        gltfModel.scale.set(2.2, 2.2, 2.2);
        gltfModel.position.set(0, 0, 0);
        playerGroup.add(gltfModel);

        const jerseyTex = createJerseyTexture(number, teamColor);
        gltfModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material && child.material.name && child.material.name.includes('Joints')) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
                } else {
                    child.material = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(teamColor).lerp(new THREE.Color(0xffffff), 0.2),
                        map: jerseyTex, roughness: 0.6, metalness: 0.1
                    });
                }
            }
        });
    }

    const dirGeo = new THREE.ConeGeometry(0.12, 0.5, 6);
    const dirMat = new THREE.MeshStandardMaterial({
        color: COLORS.directionMarker, emissive: COLORS.directionMarker,
        emissiveIntensity: 0.4, roughness: 0.5, metalness: 0.0,
    });
    const dirMarker = new THREE.Mesh(dirGeo, dirMat);
    dirMarker.rotation.x = Math.PI / 2;
    dirMarker.scale.set(0.6, 0.6, 0.6);
    dirMarker.position.set(0, 0.05, 0.7);
    playerGroup.add(dirMarker);

    playerGroup.userData.isMoving = false;
    scene.add(playerGroup);
    return playerGroup;
}

export function animatePlayer(player, dt, isMoving, speed) {
    player.userData.isMoving = isMoving;
}

export function createActiveIndicator(scene) {
    const geo = new THREE.TorusGeometry(0.9, 0.1, 8, 32);
    const mat = new THREE.MeshStandardMaterial({
        color: COLORS.indicator, emissive: COLORS.indicator,
        emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.3,
        transparent: true, opacity: 0.85,
    });
    const indicator = new THREE.Mesh(geo, mat);
    indicator.rotation.x = Math.PI / 2;
    indicator.position.y = 0.05;
    scene.add(indicator);
    return indicator;
}

export function animateIndicator(indicator, elapsed) {
    const pulse = 0.9 + Math.sin(elapsed * 4) * 0.15;
    indicator.scale.set(pulse, pulse, 1);
    indicator.material.emissiveIntensity = 0.6 + Math.sin(elapsed * 6) * 0.3;
}
