// ============================================
// FIFA 3D - Antigravity Edition
// goal.js — Porterías con postes y red
// ============================================
import * as THREE from 'three';
import { PITCH_LENGTH, GOAL_WIDTH, GOAL_DEPTH, GOAL_HEIGHT, COLORS } from './config.js';

function createNetMaterial(color) {
    return new THREE.MeshStandardMaterial({
        color: color, transparent: true, opacity: 0.15,
        wireframe: true, side: THREE.DoubleSide, roughness: 0.9, metalness: 0.0,
    });
}

export function createGoal(scene, xPosition, color) {
    const goalGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: COLORS.goalPost, roughness: 0.3, metalness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.15, 0.15, GOAL_HEIGHT, 12);

    const postL = new THREE.Mesh(postGeo, postMat);
    postL.position.set(0, GOAL_HEIGHT / 2, -GOAL_WIDTH / 2);
    postL.castShadow = true;
    goalGroup.add(postL);

    const postR = new THREE.Mesh(postGeo, postMat);
    postR.position.set(0, GOAL_HEIGHT / 2, GOAL_WIDTH / 2);
    postR.castShadow = true;
    goalGroup.add(postR);

    const crossbarGeo = new THREE.CylinderGeometry(0.15, 0.15, GOAL_WIDTH + 0.3, 12);
    const crossbar = new THREE.Mesh(crossbarGeo, postMat);
    crossbar.rotation.x = Math.PI / 2;
    crossbar.position.set(0, GOAL_HEIGHT, 0);
    crossbar.castShadow = true;
    goalGroup.add(crossbar);

    const backPostGeo = new THREE.CylinderGeometry(0.08, 0.08, GOAL_HEIGHT * 0.7, 8);
    const backPostL = new THREE.Mesh(backPostGeo, postMat);
    backPostL.position.set(xPosition > 0 ? GOAL_DEPTH : -GOAL_DEPTH, GOAL_HEIGHT * 0.35, -GOAL_WIDTH / 2);
    goalGroup.add(backPostL);
    const backPostR = new THREE.Mesh(backPostGeo, postMat);
    backPostR.position.set(xPosition > 0 ? GOAL_DEPTH : -GOAL_DEPTH, GOAL_HEIGHT * 0.35, GOAL_WIDTH / 2);
    goalGroup.add(backPostR);

    const netMat = createNetMaterial(color);
    const netBackGeo = new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_HEIGHT * 0.7, 14, 7);
    const netBack = new THREE.Mesh(netBackGeo, netMat);
    netBack.position.set(xPosition > 0 ? GOAL_DEPTH : -GOAL_DEPTH, GOAL_HEIGHT * 0.35, 0);
    goalGroup.add(netBack);

    const netTopGeo = new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_DEPTH, 14, 3);
    const netTop = new THREE.Mesh(netTopGeo, netMat.clone());
    netTop.rotation.x = Math.PI / 2;
    netTop.position.set(xPosition > 0 ? GOAL_DEPTH / 2 : -GOAL_DEPTH / 2, GOAL_HEIGHT * 0.7, 0);
    goalGroup.add(netTop);

    const netSideGeo = new THREE.PlaneGeometry(GOAL_DEPTH, GOAL_HEIGHT * 0.7, 3, 7);
    const netSideL = new THREE.Mesh(netSideGeo, netMat.clone());
    netSideL.rotation.y = Math.PI / 2;
    netSideL.position.set(xPosition > 0 ? GOAL_DEPTH / 2 : -GOAL_DEPTH / 2, GOAL_HEIGHT * 0.35, -GOAL_WIDTH / 2);
    goalGroup.add(netSideL);
    const netSideR = new THREE.Mesh(netSideGeo, netMat.clone());
    netSideR.rotation.y = Math.PI / 2;
    netSideR.position.set(xPosition > 0 ? GOAL_DEPTH / 2 : -GOAL_DEPTH / 2, GOAL_HEIGHT * 0.35, GOAL_WIDTH / 2);
    goalGroup.add(netSideR);

    goalGroup.position.set(xPosition, 0, 0);
    scene.add(goalGroup);
    return goalGroup;
}

export function createGoals(scene) {
    const goalBlue = createGoal(scene, -PITCH_LENGTH / 2, COLORS.goalNetBlue);
    const goalRed = createGoal(scene, PITCH_LENGTH / 2, COLORS.goalNetRed);
    return { goalBlue, goalRed };
}
