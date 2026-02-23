// ============================================
// FIFA 3D - Antigravity Edition
// minimap.js — Radar táctico 2D
// ============================================
import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH, COLORS } from './config.js';

let canvas, ctx;
const MAP_WIDTH = 250;
const MAP_HEIGHT = (PITCH_WIDTH / PITCH_LENGTH) * MAP_WIDTH;

export function initMinimap() {
    const container = document.getElementById('minimap-container');
    if (!container) return null;
    canvas = document.createElement('canvas');
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    return canvas;
}

export function updateMinimap(gameState, ball) {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(15, 30, 20, 0.7)';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(MAP_WIDTH / 2, 0);
    ctx.lineTo(MAP_WIDTH / 2, MAP_HEIGHT);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(MAP_WIDTH / 2, MAP_HEIGHT / 2, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(0, MAP_HEIGHT / 2 - 25, 20, 50);
    ctx.strokeRect(MAP_WIDTH - 20, MAP_HEIGHT / 2 - 25, 20, 50);

    const toMapX = (x) => ((x + PITCH_LENGTH / 2) / PITCH_LENGTH) * MAP_WIDTH;
    const toMapY = (z) => ((z + PITCH_WIDTH / 2) / PITCH_WIDTH) * MAP_HEIGHT;

    const drawPlayer = (p, colorHex, isHighlight) => {
        const mx = toMapX(p.position.x);
        const my = toMapY(p.position.z);
        ctx.beginPath();
        ctx.arc(mx, my, isHighlight ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#' + new THREE.Color(colorHex).getHexString();
        ctx.fill();
        if (isHighlight) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };

    gameState.teamBlue.forEach(p => drawPlayer(p, COLORS.teamBlue, p === gameState.activePlayer));
    gameState.teamRed.forEach(p => drawPlayer(p, COLORS.teamRed, false));

    const bx = toMapX(ball.position.x);
    const by = toMapY(ball.position.z);
    ctx.beginPath();
    ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
}
