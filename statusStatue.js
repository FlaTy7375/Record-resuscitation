import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/loaders/GLTFLoader.js';
import { DRACOLoader } from './vendor/three/loaders/DRACOLoader.js';
import { RGBELoader } from './vendor/three/loaders/RGBELoader.js';
import { addOscarRawLights, prepareModelForViewer } from './oscarViewerShared.js';

// ─── Позиции камеры ───────────────────────────────────────────────────────────
// camZ — расстояние от модели, camY — высота камеры, lookY — куда смотрит
const CAM_TARGETS = {
  idle:  { camY: 3.5, lookY: 3.5, camZ: 6.5 },
  gold:  { camY: 4.0, lookY: 4.0, camZ: 4.2 },
  black: { camY: 4.3, lookY: 4.3, camZ: 4.2 },
  ruby:  { camY: 4.6, lookY: 4.6, camZ: 4.2 },
};

let camTargetY   = CAM_TARGETS.idle.camY;
let lookTargetY  = CAM_TARGETS.idle.lookY;
let camTargetZ   = CAM_TARGETS.idle.camZ;
let camCurrentY  = CAM_TARGETS.idle.camY;
let lookCurrentY = CAM_TARGETS.idle.lookY;
let camCurrentZ  = CAM_TARGETS.idle.camZ;

let currentImgZoom = 1;
let currentImgTilt = 0;

let scene, camera, renderer, statue;
let currentVariant = 'gold';
let isVisible = false;

const OSCAR_SRC = 'models/oscar-gold.glb';

export async function initStatusStatue() {
  const canvas = document.getElementById('statusStatueCanvas');
  if (!canvas) return;

  scene = new THREE.Scene();
  // Белый directional light для нейтрализации жёлтого HDRI
  const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
  dirLight.position.set(0, 5, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0xccddff, 3.0);
  dirLight2.position.set(-3, 2, -2);
  scene.add(dirLight2);
  const dirLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight3.position.set(3, 1, 2);
  scene.add(dirLight3);
  scene.add(new THREE.AmbientLight(0xffffff, 2.0));

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, camCurrentY, camCurrentZ);
  camera.lookAt(0, lookCurrentY, 0);

  const isMobile = window.innerWidth <= 1200;
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // HDRI
  await new Promise((resolve) => {
    new RGBELoader().load('./models/pillars.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromEquirectangular(texture).texture;
      scene.environmentIntensity = 0.8;
      pmrem.dispose(); texture.dispose(); resolve();
    });
  });

  addOscarRawLights(scene);
  scene.traverse(obj => { if (obj.isLight) obj.color.setRGB(1, 1, 1); });

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./vendor/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const gltf = await loader.loadAsync('./' + OSCAR_SRC.split('/').map(encodeURIComponent).join('/'));
  prepareModelForViewer(gltf.scene, renderer);

  gltf.scene.traverse(child => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((mat, i) => {
        const m = mat.clone();
        m.color.setRGB(0.08, 0.08, 0.09);
        m.metalness = 1.0;
        m.roughness = 0.05;
        if (Array.isArray(child.material)) child.material[i] = m;
        else child.material = m;
      });
    }
  });

  // Масштаб — модель занимает ~3 единицы высоты (видна в полный рост при Z=4.5)
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size); box.getCenter(center);
  const scale = 3.0 / Math.max(size.x, size.y, size.z);
  gltf.scene.scale.setScalar(scale);
  // Ставим ноги на Y=0, центрируем по X/Z, поднимаем модель вверх
  gltf.scene.position.set(-center.x * scale, -box.min.y * scale + 3, -center.z * scale);

  statue = new THREE.Group();
  statue.add(gltf.scene);
  scene.add(statue);

  resize();
  renderer.compile(scene, camera);
  renderer.domElement.style.opacity = '0';
  let warmup = 0;
  const warmupLoop = () => {
    renderer.render(scene, camera);
    if (++warmup < 10) {
      requestAnimationFrame(warmupLoop);
    } else {
      renderer.domElement.style.opacity = '1';
      animate();
      initStatusStatueVisibility();
    }
  };
  requestAnimationFrame(warmupLoop);
}

function resize() {
  if (!renderer) return;
  const parent = renderer.domElement.parentElement;
  if (!parent) return;
  const w = parent.clientWidth, h = parent.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

let animFrameId = 0;

function animate() {
  animFrameId = requestAnimationFrame(animate);
  if (!isVisible) return;

  camCurrentY  += (camTargetY  - camCurrentY)  * 0.06;
  lookCurrentY += (lookTargetY - lookCurrentY) * 0.06;
  camCurrentZ  += (camTargetZ  - camCurrentZ)  * 0.06;
  camera.position.set(0, camCurrentY, camCurrentZ);
  camera.lookAt(0, lookCurrentY, 0);

  renderer.render(scene, camera);
}

export function initStatusStatueVisibility() {
  if (!renderer) return;
  const target = document.getElementById('statusScreen') || renderer.domElement.parentElement;
  if (!target) return;
  let firstShow = true;
  new IntersectionObserver(([e]) => {
    isVisible = e.isIntersecting;
    if (isVisible) {
      if (firstShow) {
        camCurrentY = camTargetY;
        lookCurrentY = lookTargetY;
        camCurrentZ = camTargetZ;
        camera.position.set(0, camCurrentY, camCurrentZ);
        camera.lookAt(0, lookCurrentY, 0);
        firstShow = false;
      }
      if (!animFrameId) animate();
      renderer.render(scene, camera);
    } else {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = 0;
      }
      firstShow = true;
    }
  }, { threshold: 0, rootMargin: '200px 0px 200px 0px' }).observe(target);
}

export function setStatueRotation(azimuthDeg) {
  if (statue) {
    statue.rotation.y = THREE.MathUtils.degToRad(azimuthDeg + 180);
  }
  // Для img не применяем поворот — только zoom/shift из setStatueCameraFocus
}

export function setStatueCameraFocus(variant) {
  const t = CAM_TARGETS[variant] || CAM_TARGETS.idle;
  camTargetY = t.camY; lookTargetY = t.lookY; camTargetZ = t.camZ;

  // gold: приближение к поясу (zoom)
  // black: смещение к груди (translateY вверх, тот же zoom)
  // ruby: смещение к голове (translateY ещё выше, тот же zoom)
  const configs = {
    idle:  { scale: 1,   y: '0%'  },
    gold:  { scale: 1.6, y: '5%' },
    black: { scale: 1.6, y: '20%' },
    ruby:  { scale: 1.6, y: '35%' },
  };
  const cfg = configs[variant] || configs.idle;
  currentImgZoom = cfg.scale;

  const img = document.getElementById('statusOscarImg');
  if (img) {
    // На мобилке (<=1200px) картинка всегда в одном положении
    const isMobile = window.innerWidth <= 1200;
    img.style.transition = 'transform 0.8s cubic-bezier(0.22, 0.8, 0.22, 1)';
    if (isMobile) {
      img.style.transform = 'translateY(70px)';
    } else {
      img.style.transform = `translateY(${cfg.y}) scale(${cfg.scale})`;
    }
  }
}

export function applyStatueVariant(variant) {
  currentVariant = variant;
}

export function resetStatueCamera() {
  const t = CAM_TARGETS.idle;
  camTargetY = t.camY; lookTargetY = t.lookY; camTargetZ = t.camZ;
  currentImgZoom = 1;
  const img = document.getElementById('statusOscarImg');
  if (img) {
    const isMobile = window.innerWidth <= 1200;
    img.style.transition = 'transform 0.8s cubic-bezier(0.22, 0.8, 0.22, 1)';
    if (isMobile) {
      img.style.transform = 'translateY(70px)';
    } else {
      img.style.transform = 'scale(1)';
    }
  }
}

window.addEventListener('resize', resize);
