// ============================================
// FIFA 3D - Antigravity Edition
// stadium.js — Gradas escalonadas y público masivo
// ============================================
import * as THREE from 'three';
import { PITCH_LENGTH, PITCH_WIDTH, COLORS } from './config.js';

function createConcreteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8a8d8f';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 40000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const op = Math.random() * 0.15;
        ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${op})` : `rgba(0,0,0,${op})`;
        ctx.fillRect(x, y, 2, 2);
    }
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 30 + 10;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(50, 50, 50, 0.08)');
        grad.addColorStop(1, 'rgba(50, 50, 50, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.5, 0.5);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const crowdVertexShaderChunk = `
    vec3 wPos = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float jumpFreq = 5.0;
    float phase = wPos.x * 0.5 + wPos.z * 0.5;
    float jumpHeight = max(0.0, sin(uTime * jumpFreq + phase)) * 0.4;
    float sway = sin(uTime * 3.0 + phase * 0.8) * 0.1;
    transformed.y += jumpHeight * position.y;
    transformed.x += sway * position.y;
`;

export function createStadium(scene) {
    const stadiumGroup = new THREE.Group();
    const concreteTex = createConcreteTexture();
    const standsMat = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.9, metalness: 0.1 });

    const stepWidth = 1.2;
    const stepHeight = 1.0;
    const numSteps = 12;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let i = 0; i < numSteps; i++) {
        shape.lineTo(i * stepWidth, i * stepHeight);
        shape.lineTo((i + 1) * stepWidth, i * stepHeight);
        shape.lineTo((i + 1) * stepWidth, (i + 1) * stepHeight);
    }
    const topX = numSteps * stepWidth;
    const topY = numSteps * stepHeight;
    shape.lineTo(topX + stepWidth, topY);
    const roofInnerY = topY + 8;
    shape.lineTo(topX + stepWidth, roofInnerY);
    const roofFrontX = 2.5;
    const roofFrontYBottom = roofInnerY - 1.5;
    shape.lineTo(roofFrontX, roofFrontYBottom);
    const roofFrontYTop = roofFrontYBottom + 0.8;
    shape.lineTo(roofFrontX, roofFrontYTop);
    const roofBackX = topX + stepWidth * 2.5;
    const roofBackYTop = roofInnerY + 2.0;
    shape.lineTo(roofBackX, roofBackYTop);
    shape.lineTo(roofBackX, -5);
    shape.lineTo(0, -5);
    shape.closePath();

    const extrudeSettingsLong = { depth: PITCH_LENGTH + 40, bevelEnabled: false };
    const extrudeSettingsShort = { depth: PITCH_WIDTH + 40, bevelEnabled: false };
    const longGeo = new THREE.ExtrudeGeometry(shape, extrudeSettingsLong);
    const shortGeo = new THREE.ExtrudeGeometry(shape, extrudeSettingsShort);

    const standNorth = new THREE.Mesh(longGeo, standsMat);
    standNorth.rotation.y = Math.PI / 2;
    standNorth.position.set(-(PITCH_LENGTH + 40) / 2, 0.1, -PITCH_WIDTH / 2 - 5);
    standNorth.receiveShadow = true; standNorth.castShadow = true;
    stadiumGroup.add(standNorth);

    const standSouth = new THREE.Mesh(longGeo, standsMat);
    standSouth.rotation.y = -Math.PI / 2;
    standSouth.position.set((PITCH_LENGTH + 40) / 2, 0.1, PITCH_WIDTH / 2 + 5);
    standSouth.receiveShadow = true; standSouth.castShadow = true;
    stadiumGroup.add(standSouth);

    const standEast = new THREE.Mesh(shortGeo, standsMat);
    standEast.rotation.y = 0;
    standEast.position.set(PITCH_LENGTH / 2 + 5, 0.1, -(PITCH_WIDTH + 40) / 2);
    standEast.receiveShadow = true; standEast.castShadow = true;
    stadiumGroup.add(standEast);

    const standWest = new THREE.Mesh(shortGeo, standsMat);
    standWest.rotation.y = Math.PI;
    standWest.position.set(-PITCH_LENGTH / 2 - 5, 0.1, (PITCH_WIDTH + 40) / 2);
    standWest.receiveShadow = true; standWest.castShadow = true;
    stadiumGroup.add(standWest);

    const personGeo = new THREE.CapsuleGeometry(0.28, 0.45, 4, 16);
    personGeo.translate(0, 0.45 + 0.28, 0);
    const crowdUniforms = { uTime: { value: 0 } };
    const crowdMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide });
    crowdMat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = crowdUniforms.uTime;
        shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`;
        shader.vertexShader = shader.vertexShader.replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>\n${crowdVertexShaderChunk}`
        );
    };

    const crowdColors = [
        new THREE.Color(COLORS.teamBlue),
        new THREE.Color(COLORS.teamBlue).offsetHSL(0, 0, -0.2),
        new THREE.Color(COLORS.teamRed),
        new THREE.Color(0xdcdcdc),
        new THREE.Color(0x222222),
        new THREE.Color(0xf1c40f)
    ];

    const perRowLong = Math.floor((PITCH_LENGTH + 40) / 0.9);
    const perRowShort = Math.floor((PITCH_WIDTH + 40) / 0.9);
    const maxInstances = (perRowLong * 2 + perRowShort * 2) * numSteps;
    const crowdInstanced = new THREE.InstancedMesh(personGeo, crowdMat, maxInstances);
    crowdInstanced.castShadow = true; crowdInstanced.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const colorObj = new THREE.Color();
    let index = 0;

    const addAudienceToStand = (standMesh, numRows, depth) => {
        standMesh.updateMatrixWorld();
        const perRow = Math.floor(depth / 0.9);
        for (let row = 0; row < numRows - 1; row++) {
            for (let col = 0; col < perRow; col++) {
                if (Math.random() > 0.85) continue;
                const localX = (row * stepWidth) + (stepWidth * 0.5) + (Math.random() * 0.2 - 0.1);
                const localY = row * stepHeight;
                const localZ = col * 0.9 + (Math.random() * 0.3);
                dummy.position.set(localX, localY, localZ);
                dummy.rotation.set(0, -Math.PI / 2, 0);
                const heightScale = 0.8 + Math.random() * 0.4;
                const shoulderWidth = 0.7 + Math.random() * 0.3;
                const chestDepth = 0.3 + Math.random() * 0.2;
                dummy.scale.set(shoulderWidth, heightScale, chestDepth);
                dummy.rotateX(0.1 + Math.random() * 0.1);
                dummy.updateMatrix();
                dummy.matrix.premultiply(standMesh.matrixWorld);
                crowdInstanced.setMatrixAt(index, dummy.matrix);
                const randColor = crowdColors[Math.floor(Math.random() * crowdColors.length)];
                colorObj.copy(randColor);
                crowdInstanced.setColorAt(index, colorObj);
                index++;
            }
        }
    };

    addAudienceToStand(standNorth, numSteps, PITCH_LENGTH + 40);
    addAudienceToStand(standSouth, numSteps, PITCH_LENGTH + 40);
    addAudienceToStand(standEast, numSteps, PITCH_WIDTH + 40);
    addAudienceToStand(standWest, numSteps, PITCH_WIDTH + 40);

    crowdInstanced.count = index;
    crowdInstanced.instanceMatrix.needsUpdate = true;
    if (crowdInstanced.instanceColor) crowdInstanced.instanceColor.needsUpdate = true;
    stadiumGroup.add(crowdInstanced);
    stadiumGroup.userData.crowdUniforms = crowdUniforms;

    scene.add(stadiumGroup);
    return stadiumGroup;
}

export function updateStadium(stadiumGroup, elapsed) {
    if (stadiumGroup && stadiumGroup.userData.crowdUniforms) {
        stadiumGroup.userData.crowdUniforms.uTime.value = elapsed;
    }
}
