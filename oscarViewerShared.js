import * as THREE from 'three';
import { toCreasedNormals } from './vendor/three/utils/BufferGeometryUtils.js';

/** Студийное освещение в стиле Footprint Court - софтбоксы и нейтральный фон */
export function buildNeutralEnvTexture() {
  const W = 512;
  const H = 256;
  const px = new Float32Array(W * H * 4);
  
  for (let py = 0; py < H; py++) {
    for (let qx = 0; qx < W; qx++) {
      const idx = (py * W + qx) * 4;
      const phi = (py / H) * Math.PI;
      const theta = (qx / W) * Math.PI * 2;
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.cos(phi);
      const dz = Math.sin(phi) * Math.sin(theta);
      
      // Верхний софтбокс (большой, мягкий)
      const topSoft = Math.pow(Math.max(0, dy), 8) * 12.0;
      
      // Передний софтбокс (key light)
      const frontKey = Math.pow(Math.max(0, dx * -0.3 + dy * 0.5 + dz * 0.8), 16) * 18.0;
      
      // Боковые софтбоксы (fill lights)
      const leftFill = Math.pow(Math.max(0, dx * -0.9 + dy * 0.3 + dz * 0.1), 12) * 8.0;
      const rightFill = Math.pow(Math.max(0, dx * 0.9 + dy * 0.3 + dz * 0.1), 12) * 8.0;
      
      // Задний rim light
      const backRim = Math.pow(Math.max(0, dx * 0.2 + dy * 0.2 + dz * -0.95), 20) * 10.0;
      
      // Ambient (пол и стены студии)
      const ambient = 0.15;
      
      const total = topSoft + frontKey + leftFill + rightFill + backRim + ambient;
      
      // Теплый оттенок студийного света
      px[idx]     = total * 1.0;   // R
      px[idx + 1] = total * 0.98;  // G
      px[idx + 2] = total * 0.95;  // B
      px[idx + 3] = 1;
    }
  }
  
  const envTex = new THREE.DataTexture(px, W, H, THREE.RGBAFormat, THREE.FloatType);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.LinearSRGBColorSpace;
  envTex.needsUpdate = true;
  return envTex;
}

export function prepareModelForViewer(root, renderer) {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.geometry) return;
    const g = obj.geometry;
    if (!g.isBufferGeometry) return;
    const old = g;
    try {
      const neu = toCreasedNormals(g, Math.PI / 3);
      obj.geometry = neu;
      old.dispose();
      if (
        neu.hasAttribute('index') &&
        neu.hasAttribute('uv') &&
        neu.hasAttribute('normal') &&
        neu.attributes.position
      ) {
        try {
          neu.computeTangents();
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[prepareModelForViewer] toCreasedNormals:', e);
    }
  });

  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (const m of mats) {
      if (!m) continue;
      m.flatShading = false;
      for (const key of [
        'map',
        'normalMap',
        'roughnessMap',
        'metalnessMap',
        'aoMap',
        'emissiveMap',
      ]) {
        const t = m[key];
        if (t && t.isTexture) t.anisotropy = maxAniso;
      }
    }
  });
}

export function applyOscarRawEnvironment(renderer, scene) {
  const envTex = buildNeutralEnvTexture();
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromEquirectangular(envTex).texture;
  scene.environmentIntensity = 1.2; // Увеличил для лучших отражений на металле
  pmrem.dispose();
  envTex.dispose();
}

export function addOscarRawLights(scene) {
  // Ambient light для общего освещения
  const amb = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(amb);
  
  // Key light (основной свет сверху-спереди)
  const key = new THREE.DirectionalLight(0xfff8f0, 2.2);
  key.position.set(2.5, 5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0001;
  scene.add(key);
  
  // Fill light (заполняющий свет сбоку)
  const fill = new THREE.DirectionalLight(0xfff5f0, 0.8);
  fill.position.set(-3, 2, -2);
  scene.add(fill);
  
  // Rim light (контровой свет сзади)
  const rim = new THREE.DirectionalLight(0xe8f0ff, 0.6);
  rim.position.set(0, -1, 4);
  scene.add(rim);
  
  // Additional point lights для бликов на металле
  const highlight1 = new THREE.PointLight(0xffffff, 1.5, 10);
  highlight1.position.set(-2, 3, 2);
  scene.add(highlight1);
  
  const highlight2 = new THREE.PointLight(0xffffff, 1.5, 10);
  highlight2.position.set(2, 3, 2);
  scene.add(highlight2);
}
