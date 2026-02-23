// ============================================
// FIFA 3D - Antigravity Edition
// ball.js — Balón con físicas personalizadas
// ============================================
import * as THREE from 'three';
import {
    BALL_RADIUS, GRAVITY, BALL_FRICTION, BALL_AIR_DRAG,
    BOUNCE_FACTOR, PITCH_LENGTH, PITCH_WIDTH, GOAL_WIDTH
} from './config.js';

function createBallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#111111';
    const positions = [
        { x: 128, y: 128 }, { x: 384, y: 128 },
        { x: 256, y: 256 },
        { x: 128, y: 384 }, { x: 384, y: 384 },
        { x: 60, y: 256 }, { x: 452, y: 256 },
    ];
    positions.forEach(pos => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const px = pos.x + Math.cos(angle) * 38;
            const py = pos.y + Math.sin(angle) * 38;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    });
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 2;
    positions.forEach(pos => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const px = pos.x + Math.cos(angle) * 55;
            const py = pos.y + Math.sin(angle) * 55;
            ctx.moveTo(pos.x + Math.cos(angle) * 38, pos.y + Math.sin(angle) * 38);
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    });
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export function createBall(scene) {
    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: createBallTexture(),
        roughness: 0.35,
        metalness: 0.05,
    });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, BALL_RADIUS, 0);
    ball.castShadow = true;
    scene.add(ball);
    ball.userData.velocity = new THREE.Vector3(0, 0, 0);
    return ball;
}

export function updateBallPhysics(ball, dt) {
    const vel = ball.userData.velocity;
    vel.y -= GRAVITY * dt;
    ball.position.add(vel.clone().multiplyScalar(dt));
    if (ball.position.y < BALL_RADIUS) {
        ball.position.y = BALL_RADIUS;
        vel.y *= BOUNCE_FACTOR;
        vel.x *= BALL_FRICTION;
        vel.z *= BALL_FRICTION;
        if (Math.abs(vel.y) < 1) vel.y = 0;
        if (vel.lengthSq() < 0.1) vel.set(0, 0, 0);
    } else {
        vel.x *= BALL_AIR_DRAG;
        vel.z *= BALL_AIR_DRAG;
    }
    if (ball.position.z > PITCH_WIDTH / 2) {
        ball.position.z = PITCH_WIDTH / 2;
        vel.z *= -0.5;
    } else if (ball.position.z < -PITCH_WIDTH / 2) {
        ball.position.z = -PITCH_WIDTH / 2;
        vel.z *= -0.5;
    }
    if (Math.abs(ball.position.x) > PITCH_LENGTH / 2 && Math.abs(ball.position.z) > GOAL_WIDTH / 2) {
        ball.position.x = Math.sign(ball.position.x) * (PITCH_LENGTH / 2);
        vel.x *= -0.5;
    }
    if (vel.lengthSq() > 0.1 && ball.position.y <= BALL_RADIUS * 1.5) {
        const movementDir = new THREE.Vector3(vel.x, 0, vel.z).normalize();
        const cross = new THREE.Vector3(0, 1, 0).cross(movementDir);
        if (cross.lengthSq() > 0.001) {
            const rotSpeed = vel.length() * dt;
            ball.rotateOnWorldAxis(cross.normalize(), rotSpeed);
        }
    }
}
