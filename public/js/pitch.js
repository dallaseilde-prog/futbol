// ============================================
// FIFA 3D - Antigravity Edition
// pitch.js — Campo de fútbol con texturas PBR
// ============================================
import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH } from './config.js';

function createPitchTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const stripeCount = 20;
    const stripeWidth = canvas.width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#348C31' : '#2E7D2B';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10;
        imageData.data[i] += noise;
        imageData.data[i + 1] += noise;
        imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 8;
    const margin = 30;
    const fieldW = canvas.width - margin * 2;
    const fieldH = canvas.height - margin * 2;
    ctx.strokeRect(margin, margin, fieldW, fieldH);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, margin);
    ctx.lineTo(canvas.width / 2, canvas.height - margin);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    const penaltyW = 160, penaltyH = 380;
    const penaltyY = (canvas.height - penaltyH) / 2;
    ctx.strokeRect(margin, penaltyY, penaltyW, penaltyH);
    ctx.strokeRect(canvas.width - margin - penaltyW, penaltyY, penaltyW, penaltyH);

    const smallW = 55, smallH = 160;
    const smallY = (canvas.height - smallH) / 2;
    ctx.strokeRect(margin, smallY, smallW, smallH);
    ctx.strokeRect(canvas.width - margin - smallW, smallY, smallW, smallH);

    ctx.beginPath();
    ctx.arc(margin + 140, canvas.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width - margin - 140, canvas.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(margin + 140, canvas.height / 2, 80, -0.65, 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width - margin - 140, canvas.height / 2, 80, Math.PI - 0.65, Math.PI + 0.65);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = 8;
    return texture;
}

function createGrassRoughnessTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 40;
        const val = Math.max(0, Math.min(255, 200 + noise));
        imageData.data[i] = val;
        imageData.data[i + 1] = val;
        imageData.data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

export function createPitch(scene) {
    const geometry = new THREE.PlaneGeometry(PITCH_LENGTH, PITCH_WIDTH, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: createPitchTexture(),
        roughnessMap: createGrassRoughnessTexture(),
        roughness: 0.85,
        metalness: 0.0,
    });
    const pitch = new THREE.Mesh(geometry, material);
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    const outerGeo = new THREE.PlaneGeometry(PITCH_LENGTH + 40, PITCH_WIDTH + 30);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0x2a6e1e, roughness: 0.95, metalness: 0.0 });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.01;
    outer.receiveShadow = true;
    scene.add(outer);

    return pitch;
}
