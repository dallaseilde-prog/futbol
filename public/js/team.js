// ============================================
// FIFA 3D - Antigravity Edition
// team.js — Equipos y formaciones
// ============================================
import { FORMATIONS, COLORS } from './config.js';
import { createPlayer, createActiveIndicator } from './player.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

let sharedModel = null;
let sharedAnimations = {};

export async function loadPlayerAssets() {
    const loader = new GLTFLoader();
    const gltfBase = await loader.loadAsync('assets/models/model_converted.glb');
    sharedModel = gltfBase.scene;
    sharedModel.traverse((child) => {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });

    const animIdle = await loader.loadAsync('assets/models/quieto.glb');
    const animRun = await loader.loadAsync('assets/models/correr.glb');
    const animKick = await loader.loadAsync('assets/models/pateo.glb');

    const getMixamoAnim = (animData) => {
        const clip = animData.animations.find(a => a.name === 'mixamo.com') || animData.animations[0];
        console.log('Animation tracks:', clip.tracks.map(t => t.name));
        clip.tracks = clip.tracks.filter(t => {
            const name = t.name.toLowerCase();
            if (name.includes('hips') && name.endsWith('.position')) return false;
            return true;
        });
        return clip;
    };

    sharedAnimations = {
        idle: getMixamoAnim(animIdle),
        run: getMixamoAnim(animRun),
        kick: getMixamoAnim(animKick)
    };
}

export async function createTeams(scene) {
    if (!sharedModel) await loadPlayerAssets();
    const teamBlue = [];
    const teamRed = [];

    FORMATIONS.blue.forEach((pos, i) => {
        const clonedModel = SkeletonUtils.clone(sharedModel);
        const p = createPlayer(scene, COLORS.teamBlue, i + 1, clonedModel, sharedAnimations);
        p.position.set(pos.x, 0, pos.z);
        teamBlue.push(p);
    });

    FORMATIONS.red.forEach((pos, i) => {
        const clonedModel = SkeletonUtils.clone(sharedModel);
        const p = createPlayer(scene, COLORS.teamRed, i + 1, clonedModel, sharedAnimations);
        p.position.set(pos.x, 0, pos.z);
        teamRed.push(p);
    });

    const activeIndicator = createActiveIndicator(scene);
    return { teamBlue, teamRed, activePlayer: teamBlue[10], activeIndicator };
}

export function resetTeamPositions(teamBlue, teamRed) {
    teamBlue.forEach((p, i) => p.position.set(FORMATIONS.blue[i].x, 0, FORMATIONS.blue[i].z));
    teamRed.forEach((p, i) => p.position.set(FORMATIONS.red[i].x, 0, FORMATIONS.red[i].z));
}
