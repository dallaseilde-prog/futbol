// ============================================
// FIFA 3D - Antigravity Edition
// config.js — Constantes globales del juego
// ============================================

// --- Dimensiones del campo ---
export const PITCH_LENGTH = 100;
export const PITCH_WIDTH = 60;

// --- Portería ---
export const GOAL_WIDTH = 14;
export const GOAL_DEPTH = 3;
export const GOAL_HEIGHT = 4.5;

// --- Balón ---
export const BALL_RADIUS = 0.45;

// --- Jugador ---
export const PLAYER_SPEED = 12;
export const SPRINT_MULTIPLIER = 1.6;

// --- Disparo / Físicas ---
export const SHOOT_POWER = 35;
export const PASS_POWER = 28;
export const GRAVITY = 25;
export const BALL_FRICTION = 0.98;
export const BALL_AIR_DRAG = 0.995;
export const BOUNCE_FACTOR = -0.6;

// --- Formaciones (4-3-3) ---
export const FORMATIONS = {
    blue: [
        { x: -48, z: 0 },
        { x: -30, z: -15 }, { x: -30, z: 15 }, { x: -20, z: -25 }, { x: -20, z: 25 },
        { x: -10, z: -15 }, { x: -10, z: 15 }, { x: -15, z: 0 },
        { x: -5, z: -20 }, { x: -5, z: 20 }, { x: -2, z: 0 }
    ],
    red: [
        { x: 48, z: 0 },
        { x: 30, z: 15 }, { x: 30, z: -15 }, { x: 20, z: 25 }, { x: 20, z: -25 },
        { x: 10, z: 15 }, { x: 10, z: -15 }, { x: 15, z: 0 },
        { x: 5, z: 20 }, { x: 5, z: -20 }, { x: 2, z: 0 }
    ]
};

// --- Colores ---
export const COLORS = {
    sky: 0x87CEEB,
    ground: 0x3B7A2B,
    teamBlue: 0x0055ff,
    teamRed: 0xff0000,
    goalPost: 0xffffff,
    goalNetBlue: 0x4facfe,
    goalNetRed: 0xff4b4b,
    skin: 0xffccaa,
    indicator: 0x00ff00,
    directionMarker: 0xffff00,
};
