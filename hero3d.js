import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/loaders/GLTFLoader.js';
import { DRACOLoader } from './vendor/three/loaders/DRACOLoader.js';
import { RGBELoader } from './vendor/three/loaders/RGBELoader.js';
import { prepareModelForViewer } from './oscarViewerShared.js';
import RAPIER from 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.12.0/rapier.es.js';

let initialized = false;

async function initHero3D() {
  if (initialized) return;
  initialized = true;
  
  const container = document.getElementById('hero3dScene');
  if (!container) return;

  try {
    const probe = document.createElement('canvas');
    if (!probe.getContext('webgl2') && !probe.getContext('webgl')) return;
  } catch (_) { return; }

  const isMobileHero = window.matchMedia('(max-width: 1200px)').matches;

  // ─── Renderer ────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: isMobileHero ? false : window.devicePixelRatio < 2, // Отключено на мобильных
    alpha: true,
    powerPreference: 'high-performance',
    precision: isMobileHero ? 'lowp' : 'mediump', // Снижена точность для мобильных
    stencil: false,
    depth: true,
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileHero ? 1.0 : 1.25));
  if (isMobileHero) {
    container.style.pointerEvents = 'none';
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = false;

  const canvas3d = renderer.domElement;
  canvas3d.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 0.4s ease;';
  container.appendChild(canvas3d);

  // ─── Scene & Lights ──────────────────────────────────────────────
  const scene = new THREE.Scene();
  const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
  dirLight.position.set(0, 5, 5);
  scene.add(dirLight);
  
  if (!isMobileHero) {
    // Полное освещение для десктопа
    const dirLight2 = new THREE.DirectionalLight(0xccddff, 3.0);
    dirLight2.position.set(-3, 2, -2);
    scene.add(dirLight2);
    const dirLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight3.position.set(3, 1, 2);
    scene.add(dirLight3);
  } else {
    // Упрощенное освещение для мобилки (снижение draw calls)
    const dirLightMobile = new THREE.DirectionalLight(0xccddff, 2.5);
    dirLightMobile.position.set(-2, 2, 0);
    scene.add(dirLightMobile);
  }
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
  scene.add(ambientLight);
  
  const rgbeLoader = new RGBELoader();
  const hdriPromise = new Promise((resolve, reject) => {
    rgbeLoader.load('./models/pillars.hdr', (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromEquirectangular(texture).texture;
      scene.environmentIntensity = 0.09;
      pmrem.dispose(); texture.dispose(); resolve();
    }, undefined, reject);
  });

  // ─── Camera ───────────────────────────────────────────────────────
  const CAM_FOV = 55, CAM_Z = 3.2;
  const HALF_H = Math.tan((CAM_FOV / 2) * (Math.PI / 180)) * CAM_Z;
  const HALF_W = HALF_H * (1920 / 1080);
  const PX = HALF_H / 540;
  const isNarrowMobile = window.innerWidth < 400;
  const backgroundModelScale = isMobileHero ? 0.79 : 1;
  const mobileXOffset = isNarrowMobile ? -12 * PX : 0;

  function cssToWorld(l, t, w, h) {
    const cx = l + w * 0.5 - 960, cy = t + h * 0.5 - 540;
    return new THREE.Vector2(cx / 960 * HALF_W, -cy / 540 * HALF_H);
  }

  const mainRect = { l: 657, t: 88, w: 605, h: 1016 };
  const mainXY = cssToWorld(mainRect.l, mainRect.t, mainRect.w, mainRect.h);
  const mainXY_y = mainXY.y;
  const mobClusterY = isMobileHero ? mainXY_y * 0.50 : mainXY_y * 0.52;
  const springHomeXY = new THREE.Vector2(0, mainXY_y * 0.8 + 0.08);
  const cameraLookY = isMobileHero ? mobClusterY * 0.92 : mainXY_y * 0.8;

  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1920 / 1080, 0.1, 100);
  const CAM_Y = HALF_H * 1.25;
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.lookAt(0, cameraLookY, 0);

  // ─── Rapier ───────────────────────────────────────────────────────
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  // Облегченные настройки солвера для мобилок
  world.numSolverIterations = isMobileHero ? 2 : 8; 
  world.numInternalPgsIterations = isMobileHero ? 1 : 2;

  function getRandomScatterDir() {
    const angle = Math.random() * Math.PI * 2;
    return new THREE.Vector2(Math.cos(angle), Math.sin(angle));
  }

  // ─── GLB loader ───────────────────────────────────────────────────
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./vendor/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  const OSCAR_YAW_TO_CAMERA = -Math.PI / 2;
  const BG_H = 843;

  try {
    await hdriPromise;
    const [gltf, gltfN1b, gltfN1s, gltfOscar2, gltfOscar3] = await Promise.all([
      loader.loadAsync('./models/oscar-gold.glb'),
      loader.loadAsync('./models/n1-black.glb'),
      loader.loadAsync('./models/n1-silver.glb'),
      loader.loadAsync('./models/oscar2.glb'),
      loader.loadAsync('./models/oscar3.glb'),
    ]);

    const _box = new THREE.Box3(), _size = new THREE.Vector3(), _center = new THREE.Vector3();
    const bodies = [];

    const matCache = {};
    function getMat(type, base, op, dark) {
      const k = `${type}_${op}_${dark||1}`;
      if (matCache[k]) return matCache[k];
      const m = base.clone();
      if (type === 'black') { m.color.setRGB(0.035, 0.035, 0.04); m.metalness = 1; m.roughness = 0.15; }
      else if (type === 'red') { m.color.setRGB(0.04, 0.002, 0.002); m.metalness = 1; m.roughness = 0.2; }
      if (dark && dark < 1) m.color.multiplyScalar(dark);
      if (op < 1) { m.transparent = true; m.opacity = op; }
      matCache[k] = m; return m;
    }

    const refBox = new THREE.Box3().setFromObject(gltf.scene);
    const refSize = new THREE.Vector3();
    const refCenter = new THREE.Vector3();
    refBox.getSize(refSize);
    refBox.getCenter(refCenter);
    const refDim = Math.max(refSize.x, refSize.y, refSize.z, 0.001);

    const COLLIDER_SHELL_BG = isMobileHero ? 1.28 : 1.22;
    const COLLIDER_SHELL_N1 = isMobileHero ? 1.35 : 1.3;

    function spawn(m, wx, wy, wz, tilt, op, dark) {
      const srcGltf = m === 2 ? gltfOscar2 : m === 1 ? gltfOscar3 : gltf;
      const mesh = srcGltf.scene.clone(true);
      prepareModelForViewer(mesh, renderer);
      const type = m === 1 ? 'black' : 'gold';
      mesh.traverse(c => {
        if (c.isMesh && c.material) {
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((mat, i) => {
            const fm = (m !== 1 && op >= 1 && !dark) ? mat : getMat(type, mat, op, dark);
            if (Array.isArray(c.material)) c.material[i] = fm; else c.material = fm;
          });
        }
      });

      _box.setFromObject(mesh); _box.getSize(_size); _box.getCenter(_center);
      let scale = (BG_H * PX) / refDim * (0.9 + 0.14 * wz) * backgroundModelScale;
      if (isMobileHero && m === 0) scale *= 1.05;
      if (isMobileHero && m === 2 && wx > 0) scale *= 0.88;

      mesh.scale.set(scale, scale, scale);
      mesh.rotation.order = 'YXZ';
      mesh.rotation.y = OSCAR_YAW_TO_CAMERA;
      if (tilt) {
        const tiltDeg = isMobileHero ? tilt * 0.14 : tilt;
        mesh.rotation.x = (tiltDeg * Math.PI) / 180;
      }
      if (isMobileHero) {
        const topAwayDeg = THREE.MathUtils.clamp(wx * -7.2, -15, 15);
        mesh.rotation.z = (topAwayDeg * Math.PI) / 180;
      }
      mesh.position.set(-refCenter.x * scale, -refCenter.y * scale, -refCenter.z * scale);

      const homePos = new THREE.Vector2(wx, wy);
      const spawnAnchor = new THREE.Vector2(wx, wy);
      const homeQuat = new THREE.Quaternion();
      const g = new THREE.Group();
      g.position.set(wx, wy, wz);
      g.quaternion.copy(homeQuat);
      g.add(mesh); scene.add(g);

      const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(wx, wy, 0)
          .setLinearDamping(2.2)
          .setAngularDamping(5.2)
          .setCcdEnabled(true)
          .enabledTranslations(true, true, false)
      );
      const sw = refSize.x * scale, sh = refSize.y * scale;
      const tall = sh / Math.max(sw, 0.01) > 1.8;
      
      const col = tall
        ? RAPIER.ColliderDesc.capsule(
            Math.max((sh - sw) / 2, 0.04) * COLLIDER_SHELL_BG,
            sw * 0.42 * COLLIDER_SHELL_BG
          )
        : RAPIER.ColliderDesc.ball(Math.max(sw, sh) * 0.42 * COLLIDER_SHELL_BG);
        
      col.setMass(4);
      col.setRestitution(0.45); 
      col.setFriction(0.2);     
      world.createCollider(col, rb);

      bodies.push({
        group: g,
        rb,
        homePos,
        spawnAnchor,
        homeQuat,
        homeZ: wz,
        isBackground: true,
        visPos: new THREE.Vector3(wx, wy, wz),
        visQuat: homeQuat.clone(),
        scatterDir: getRandomScatterDir(),
      });
      return g;
    }

    const mobBgLayoutX = 0.49;
    const mobBgLayoutY = 0.66;
    const mobBgYRef = mainXY_y * 0.52;
    const mobBgShiftX = 0;
    const mobBgWx = (wx) => wx * mobBgLayoutX + mobileXOffset + mobBgShiftX;
    const mobBgWy = (wy) => mobBgYRef + (wy - mobBgYRef) * mobBgLayoutY;
    const mobBgRowWorldY = mobClusterY;
    const mobBgRowZ = -0.56;
    
    const backgroundSpawnConfig = isMobileHero
      ? [
          [1, mobBgWx(-0.82), -1.2, mobBgRowZ,  -100,  1.0, null],
          [2, mobBgWx(-0.8), -1.1, mobBgRowZ,  100,  1.0, null],
          [0, mobBgWx(-0.2), -0.3, mobBgRowZ, 100,  0.72, 0.58],
          [2, mobBgWx(0.8), 0.4, mobBgRowZ, -100,  1.0, null],
        ]
      : [
          [1, -1.90, mainXY_y - 0.4,  0.20,  15,  1.0, null],
          [2, -0.40, -0.2,            -0.5,   10,  1.0, null],
          [0,  0.3,   0.2,            -1.80, -15,  0.7, 0.6],
          [2,  0.40,  0.1,             0.30, -15,  1.0, null],
          [1,  0.8, mainXY_y - 0.4,  -1.10, -30,  1.0, null],
        ];

    backgroundSpawnConfig.forEach((args) => spawn(...args));

    // ─── Модели №1 (цифры «1») ───────────────────
    /** Вращение вокруг своей вертикальной оси (рад/с), базовая скорость с лёгким разбросом по экземплярам */
    const N1_SELF_AXIS_SPIN_RPS = 0.52;

    const N1_H = isMobileHero ? 88 : 134;
    function spawnN1(gltfSrc, wx, wy, wz, tiltDeg, op, brighten, color) {
      const mesh = gltfSrc.scene.clone(true);
      prepareModelForViewer(mesh, renderer);
      _box.setFromObject(mesh); _box.getSize(_size); _box.getCenter(_center);
      const natDim = Math.max(_size.x, _size.y, _size.z, 0.001);
      const sizeMultiplier = isMobileHero ? 1.14 : 1.5;
      const scale = (N1_H * PX) / natDim * sizeMultiplier;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.order = 'YXZ';
      if (isMobileHero) {
        mesh.rotation.y = OSCAR_YAW_TO_CAMERA + Math.PI;
        mesh.rotation.x = 0;
      } else {
        mesh.rotation.y = OSCAR_YAW_TO_CAMERA + Math.PI;
        mesh.rotation.x = Math.PI;
      }
      let zRad = 0;
      if (tiltDeg) {
        const zDeg = isMobileHero ? tiltDeg * 0.055 : tiltDeg;
        zRad = (zDeg * Math.PI) / 180;
      }
      if (isMobileHero) {
        const topAwayDeg = THREE.MathUtils.clamp(wx * -6.0, -16, 16);
        zRad += (topAwayDeg * Math.PI) / 180;
      }
      mesh.rotation.z = zRad;
      mesh.userData.baseRotX = mesh.rotation.x;
      mesh.userData.baseRotY = mesh.rotation.y;
      mesh.userData.baseRotZ = mesh.rotation.z;
      mesh.position.set(-_center.x * scale, -_center.y * scale, -_center.z * scale);
      mesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
          if (isMobileHero) c.material.side = THREE.DoubleSide;
          if (op < 1) { c.material.transparent = true; c.material.opacity = op; }
          if (color) {
            c.material.map = null;
            c.material.roughnessMap = null;
            c.material.metalnessMap = null;
            c.material.normalMap = null;
            c.material.color.set(color);
            c.material.roughness = 0.05;
            c.material.metalness = 1.08;
            c.material.emissive = new THREE.Color(color);
            c.material.emissiveIntensity = 0.2;
          }
          if (brighten && brighten !== 1) c.material.color.multiplyScalar(brighten);
          c.material.needsUpdate = true;
        }
      });

      const homePos = new THREE.Vector2(wx, wy);
      const homeQuat = new THREE.Quaternion();
      const g = new THREE.Group();
      g.position.set(wx, wy, wz);
      g.quaternion.copy(homeQuat);
      if (isMobileHero) {
        const flip = new THREE.Group();
        flip.scale.x = -1;
        flip.add(mesh);
        g.add(flip);
      } else {
        g.add(mesh);
      }
      scene.add(g);

      const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(wx, wy, 0)
          .setLinearDamping(2.2)
          .setAngularDamping(5.2)
          .setCcdEnabled(true)
          .enabledTranslations(true, true, false)
      );
      const sw = _size.x * scale, sh = _size.y * scale;
      const col = RAPIER.ColliderDesc.ball(Math.max(sw, sh) * 0.42 * COLLIDER_SHELL_N1);
      
      col.setMass(2);
      col.setRestitution(0.45); 
      col.setFriction(0.2);     
      world.createCollider(col, rb);
      
      const n1BallR = Math.max(sw, sh) * 0.42 * COLLIDER_SHELL_N1;
      bodies.push({
        group: g,
        rb,
        homePos,
        spawnAnchor: homePos.clone(),
        homeQuat,
        homeZ: wz,
        isBackground: false,
        visPos: new THREE.Vector3(wx, wy, wz),
        visQuat: homeQuat.clone(),
        scatterDir: getRandomScatterDir(),
        spinMesh: mesh,
        spinAngle: 0,
        spinRate: N1_SELF_AXIS_SPIN_RPS * (0.75 + Math.random() * 0.55) * (Math.random() < 0.5 ? 1 : -1),
        /** Радиус в мировых единицах: курсор внутри — крутимся вокруг своей оси */
        n1HoverRadius: n1BallR * 1.35,
      });
    }

    const n1MobYRef = mainXY_y * 0.50;
    const n1MobLayoutX = isMobileHero ? 0.42 : 0.46;
    const n1MobLayoutY = 0.60;
    const n1MobWx = (wx) => wx * n1MobLayoutX + mobileXOffset + mobBgShiftX;
    const n1MobWy = (wy) => n1MobYRef + (wy - n1MobYRef) * n1MobLayoutY;
    const n1SpawnConfig = isMobileHero
      ? [
          [gltfN1b, n1MobWx(-1.8), n1MobWy(mainXY.y + 1.3), -0.3, -165, 0.6, 0.9, '#7c2f25'],
          [gltfN1s, n1MobWx(-2), n1MobWy(mainXY.y - 2.4), -0.5, -144, 0.50, 1, '#e3e3e3'],
          [gltfN1b, n1MobWx(2), n1MobWy(mainXY.y + 1), -0.3, -165, 0.85, 0.9, '#424242'],
          [gltfN1b, n1MobWx(1.86), n1MobWy(mainXY.y - 1.7), 0.8, -144, 0.6, 0.9, '#7c2f25'],
        ]
      : [
          [gltfN1b, -3.00, mainXY.y + 0.4, -0.3, -165, 0.6, 0.9, '#7c2f25'],
          [gltfN1s,   -3.70, mainXY.y - 1.7, -0.5, -144, 0.50, 1, '#e3e3e3'],
          [gltfN1b,    2.10, mainXY.y + 0.7, -0.3, -165, 0.85, 0.9, '#424242'],
          [gltfN1b,  3.30, mainXY.y - 1.7, 0.8, -144, 0.6, 0.9, '#7c2f25'],
        ];

    n1SpawnConfig.forEach((args) => spawnN1(...args));

    if (isMobileHero) {
      const mobileScatterDirs = [
        new THREE.Vector2(1, -1),
        new THREE.Vector2(-1, -1),
        new THREE.Vector2(-1, 1),
        new THREE.Vector2(1, 1),
      ];
      bodies.forEach((body, i) => {
        body.scatterDir.copy(mobileScatterDirs[i % 4]).normalize();
      });
    } else {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      bodies.forEach((body, i) => {
        const angle = goldenAngle * (i + 0.37);
        body.scatterDir.set(Math.cos(angle), Math.sin(angle)).normalize();
      });
    }

    // ─── Курсор — кинематический шар ───────────────────
    const mouseNDC = new THREE.Vector2(-9999, -9999);
    const mouseNDCFiltered = new THREE.Vector2(-9999, -9999);
    const mouseWorld = new THREE.Vector3();
    const mouseWorldLast = new THREE.Vector3(-9999, -9999, 0);
    const _ray = new THREE.Raycaster();
    const _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const mouseRB = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-9999, -9999, 0)
    );
    world.createCollider(RAPIER.ColliderDesc.ball(0.22), mouseRB);

    function syncMouseBall() {
      _ray.setFromCamera(mouseNDCFiltered, camera);
      if (_ray.ray.intersectPlane(_plane, mouseWorld)) {
        const dx = mouseWorld.x - mouseWorldLast.x;
        const dy = mouseWorld.y - mouseWorldLast.y;
        if ((dx * dx + dy * dy) > 0.00005) {
          mouseWorldLast.copy(mouseWorld);
          mouseRB.setNextKinematicTranslation({ x: mouseWorld.x, y: mouseWorld.y, z: 0 });
        }
      }
    }

    // ─── Render loop ──────────────────────────────────────────────────
    const SPRING_K = isMobileHero ? 15.0 : 11.5;
    const IDLE_SPRING_K = isMobileHero ? 11.5 : 8.8;

    const MAX_SPEED = isMobileHero ? 3.1 : 2.95;
    const MAX_FORCE = isMobileHero ? 82.0 : 70.0;
    const IDLE_SPEED_FACTOR = 0.55;
    const IDLE_FORCE_FACTOR = 0.78;
    const IDLE_VEL_DAMP = isMobileHero ? 0.88 : 0.93;
    const IDLE_FREE_DIST = isMobileHero ? 0.26 : 0.68;
    const IDLE_MAX_DIST = isMobileHero ? 1.4 : 2.4;
    
    const REPULSION_RADIUS = isMobileHero ? 2.0 : 2.5;     
    const REPULSION_FORCE = isMobileHero ? 25.0 : 35.0;    
    const REPULSION_MIN_DIST = isMobileHero ? 0.18 : 0.14;
    const REPULSION_FORCE_CAP = isMobileHero ? 15.0 : 20.0; 
    
    const ROT_LERP = 0.08;
    const VISUAL_POS_DAMP = 38;
    const VISUAL_ROT_DAMP = 20;
    const N1_REACTION_MUL = isMobileHero ? 0.55 : 0.55;
    const N1_REPULSION_MUL = 1.0; 
    
    const SCATTER_DISTANCE = isMobileHero ? 3.0 : 5.5;
    
    const _force = new THREE.Vector3();
    const _curQ = new THREE.Quaternion();
    const _targetQ = new THREE.Quaternion();
    let animId = 0;
    let parallaxX = 0, parallaxY = 0;
    let targetParallaxX = 0, targetParallaxY = 0;
    let mainSwingX = 0;
    let mainSwingY = 0;
    let lastPointerPx = 0;
    let lastPointerPy = 0;
    let hasPointerSample = false;
    let pointerActive = false;
    let lastPointerMoveTime = 0;
    let pointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    /** Пока false — фоновые GLB не притягиваются к springHomeXY (кластер в центре), только к своим homePos. */
    let heroPointerEngaged = false;
    let scatterProgress = 0;
    /** Пока .hero-bleed sticky с top≈0, -rect.top/vh ≈ 0 — без этого scatter не растёт при скролле. */
    let scatterPinScrollY = null;
    let mobileFloatTime = 0;

    const oscarImg = document.getElementById('heroOscarImg');
    let oscarParallaxX = 0, oscarParallaxY = 0;
    let oscarTargetX = 0, oscarTargetY = 0;
    const repulsionCenter = new THREE.Vector2(-9999, -9999);
    const heroEl = document.getElementById('heroScreen')
                 ?? document.querySelector('.screen-hero')
                 ?? container;

    let lastFrameTime = 0;
    let physicsAccumulator = 0;
    const FIXED_STEP_ACTIVE = 1 / 90;
    // Оптимизация: на мобилках реже считаем физику в фоне
    const FIXED_STEP_IDLE = isMobileHero ? 1 / 30 : 1 / 90; 
    const MAX_STEPS_PER_FRAME = isMobileHero ? 2 : 6;

    function applyN1LocalAxisSpin(body, delta, pointerNear) {
      const sm = body.spinMesh;
      if (!sm || body.isBackground || sm.userData.baseRotY === undefined) return;
      if (pointerNear) {
        body.spinAngle += delta * body.spinRate * 1.35;
      } else {
        const relax = 1 - Math.exp(-11 * delta);
        body.spinAngle += (0 - body.spinAngle) * relax;
      }
      sm.rotation.x = sm.userData.baseRotX;
      sm.rotation.y = sm.userData.baseRotY + body.spinAngle;
      sm.rotation.z = sm.userData.baseRotZ;
    }

    function tick(now) {
      animId = requestAnimationFrame(tick);

      const dt = Math.min((now - lastFrameTime) / 1000 || 0.016, 0.05);
      lastFrameTime = now;
      
      const livePointer = pointerActive;
      
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1080;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop ?? 0;

      let scrollRaw;
      if (rect.top > 0) {
        scatterPinScrollY = null;
        scrollRaw = 0;
      } else {
        if (scatterPinScrollY === null) scatterPinScrollY = scrollY;
        scrollRaw = (scrollY - scatterPinScrollY) / windowHeight;
      }
      const scatterScrollMul = isMobileHero ? 0.8 : 1.2;
      let targetScatter = Math.max(0, Math.min(1, scrollRaw * scatterScrollMul));
      
      const scatterLerp = 1 - Math.exp(-72 * dt);
      scatterProgress += (targetScatter - scatterProgress) * scatterLerp;

      if (isMobileHero) {
        mobileFloatTime += dt;
      }

      const fixedStep = livePointer ? FIXED_STEP_ACTIVE : FIXED_STEP_IDLE;
      physicsAccumulator = Math.min(physicsAccumulator + dt, fixedStep * MAX_STEPS_PER_FRAME);
      let steps = 0;
      while (physicsAccumulator >= fixedStep && steps < MAX_STEPS_PER_FRAME) {
        world.step();
        physicsAccumulator -= fixedStep;
        steps++;
      }
      
      if (livePointer) {
        if (mouseNDCFiltered.x < -1000 || mouseNDCFiltered.y < -1000) {
          mouseNDCFiltered.copy(mouseNDC);
        } else {
          mouseNDCFiltered.lerp(mouseNDC, 1 - Math.exp(-6 * dt));
        }
        syncMouseBall();
        if (repulsionCenter.x < -1000 || repulsionCenter.y < -1000) {
          repulsionCenter.set(mouseWorld.x, mouseWorld.y);
        } else {
          const repulsionLerp = 1 - Math.exp(-5 * dt);
          repulsionCenter.x += (mouseWorld.x - repulsionCenter.x) * repulsionLerp;
          repulsionCenter.y += (mouseWorld.y - repulsionCenter.y) * repulsionLerp;
        }
      }

      const cameraLerp = 1 - Math.exp(-6 * dt);
      parallaxX += (targetParallaxX - parallaxX) * cameraLerp;
      parallaxY += (targetParallaxY - parallaxY) * cameraLerp;
      
      const camDelta = Math.abs(camera.position.x - parallaxX) + Math.abs(camera.position.y - (CAM_Y + parallaxY));
      if (camDelta > 0.001) {
        camera.position.x = parallaxX;
        camera.position.y = CAM_Y + parallaxY;
        camera.lookAt(0, cameraLookY, 0);
      }

      if (oscarImg) {
        if (isMobileHero) {
          const tf = mobileFloatTime;
          /* Заметное покачивание на мобилке — только Y и поворот, X не трогаем */
          oscarTargetX = 0;
          oscarTargetY = Math.cos(tf * 0.28) * 7 + Math.cos(tf * 0.13) * 2.5;
        }
        const oscarDelta = Math.abs(oscarParallaxX - oscarTargetX) + Math.abs(oscarParallaxY - oscarTargetY);
        /* На мобилке кадр всегда пересчитываем — нужно непрерывное покачивание (rockDeg). */
        if (isMobileHero || oscarDelta > 0.1) {
          const oscarLerp = 1 - Math.exp(-7 * dt);
          oscarParallaxX += (oscarTargetX - oscarParallaxX) * oscarLerp;
          oscarParallaxY += (oscarTargetY - oscarParallaxY) * oscarLerp;
          const tiltDeg = isMobileHero ? oscarParallaxX * 0.12 : oscarParallaxX * 0.25;
          const tx = oscarParallaxX;
          const ty = oscarParallaxY;
          /* Заметное покачивание: увеличенная амплитуда */
          const rockDeg = isMobileHero ? Math.sin(mobileFloatTime * 0.95) * 3.5 : 0;
          const td = tiltDeg + rockDeg;
          if (
            isMobileHero ||
            Math.abs((oscarImg._lastTx ?? 0) - tx) > 0.02 ||
            Math.abs((oscarImg._lastTy ?? 0) - ty) > 0.02 ||
            Math.abs((oscarImg._lastTd ?? 0) - td) > 0.01
          ) {
            oscarImg.style.transform = `translateX(-50%) translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${td.toFixed(3)}deg)`;
            oscarImg._lastTx = tx;
            oscarImg._lastTy = ty;
            oscarImg._lastTd = td;
          }
        }
      }

      mainSwingX *= 0.9;
      mainSwingY *= 0.9;

      function isN1PointerNear(tx, ty, b) {
        if (!livePointer || !b.n1HoverRadius || b.isBackground || !b.spinMesh) return false;
        if (mouseNDCFiltered.x < -500) return false;
        const r = b.n1HoverRadius;
        const dx = tx - mouseWorld.x;
        const dy = ty - mouseWorld.y;
        return dx * dx + dy * dy <= r * r;
      }

      for (let bi = 0; bi < bodies.length; bi++) {
        const body = bodies[bi];
        const { group, rb, homePos, homeQuat, homeZ, isBackground, visPos, visQuat, scatterDir } = body;
        const t = rb.translation();

        const pullToClusterCenter = isBackground && !isMobileHero && heroPointerEngaged;
        const baseTargetPos = pullToClusterCenter ? springHomeXY : homePos;
        const scatterX = scatterDir.x * SCATTER_DISTANCE * scatterProgress;
        const scatterY = scatterDir.y * SCATTER_DISTANCE * scatterProgress;

        if (isMobileHero && !livePointer) {
          let mx = homePos.x + scatterX;
          let my = homePos.y + scatterY;
          
          // Плавное исчезновение моделей после разлёта для оптимизации
          if (scatterProgress > 0.7) {
            // Начинаем затухание с 0.7, полностью скрываем на 0.95
            const fadeStart = 0.7;
            const fadeEnd = 0.95;
            const fadeProgress = (scatterProgress - fadeStart) / (fadeEnd - fadeStart);
            const opacity = Math.max(0, 1 - fadeProgress);
            
            if (scatterProgress >= fadeEnd) {
              group.visible = false;
              continue;
            } else {
              group.visible = true;
              // Применяем opacity ко всем мешам в группе
              group.traverse(obj => {
                if (obj.isMesh && obj.material) {
                  if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => {
                      mat.transparent = true;
                      mat.opacity = opacity;
                    });
                  } else {
                    obj.material.transparent = true;
                    obj.material.opacity = opacity;
                  }
                }
              });
            }
          } else {
            group.visible = true;
            // Восстанавливаем полную видимость
            group.traverse(obj => {
              if (obj.isMesh && obj.material) {
                if (Array.isArray(obj.material)) {
                  obj.material.forEach(mat => {
                    mat.opacity = 1;
                  });
                } else {
                  obj.material.opacity = 1;
                }
              }
            });
          }
          
          if (scatterProgress < 0.005) {
            const swayK = Math.min(1, (0.005 - scatterProgress) / 0.005);
            const tf = mobileFloatTime;
            const ph = bi * 1.21;
            const ax = isBackground ? 0.0062 : 0.0045;
            const ay = isBackground ? 0.0052 : 0.0038;
            mx += (Math.sin(tf * 0.32 + ph) * ax + Math.sin(tf * 0.11 + ph * 2.0) * (ax * 0.32)) * swayK;
            my += (Math.cos(tf * 0.29 + ph * 1.03) * ay + Math.cos(tf * 0.10 + ph * 0.88) * (ay * 0.3)) * swayK;
          }
          rb.setTranslation({ x: mx, y: my, z: 0 }, true);
          rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
          rb.resetForces(true);
          rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rb.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true);
          
          visPos.set(mx, my, homeZ);
          group.position.copy(visPos);
          const qF = rb.rotation();
          _targetQ.set(qF.x, qF.y, qF.z, qF.w);
          _curQ.copy(_targetQ).slerp(homeQuat, ROT_LERP);
          const rotLerpF = 1 - Math.exp(-VISUAL_ROT_DAMP * dt);
          visQuat.slerp(_curQ, rotLerpF);
          group.quaternion.copy(visQuat);
          applyN1LocalAxisSpin(body, dt, isN1PointerNear(mx, my, body));
          continue;
        }

        const targetPos = new THREE.Vector2(baseTargetPos.x + scatterX, baseTargetPos.y + scatterY);
        const reactionMul = isBackground ? 1 : N1_REACTION_MUL;
        const springK = (livePointer ? SPRING_K : IDLE_SPRING_K) * reactionMul;
        
        _force.set(targetPos.x - t.x, targetPos.y - t.y, 0);
        const d = _force.length();
        const idleFarT = Math.max(0, Math.min(1, (d - IDLE_FREE_DIST) / Math.max(1e-5, IDLE_MAX_DIST - IDLE_FREE_DIST)));
        const idleSpeedFactor = IDLE_SPEED_FACTOR + (0.85 - IDLE_SPEED_FACTOR) * idleFarT;
        const idleForceFactor = IDLE_FORCE_FACTOR + (0.9 - IDLE_FORCE_FACTOR) * idleFarT;
        const idleVelDamp = IDLE_VEL_DAMP + (0.97 - IDLE_VEL_DAMP) * idleFarT;

        const v = rb.linvel();
        const spd = Math.sqrt(v.x * v.x + v.y * v.y);
        const maxSpBase = livePointer ? MAX_SPEED : MAX_SPEED * idleSpeedFactor;
        const maxSp = maxSpBase * reactionMul;
        if (spd > maxSp) {
          const f = maxSp / spd;
          rb.setLinvel({ x: v.x * f, y: v.y * f, z: 0 }, true);
        }
        if (!livePointer) {
          const vv = rb.linvel();
          rb.setLinvel({ x: vv.x * idleVelDamp, y: vv.y * idleVelDamp, z: 0 }, true);
        }

        if (d > 0.001) {
          const maxForceBase = livePointer ? MAX_FORCE : MAX_FORCE * idleForceFactor;
          const maxForce = maxForceBase * reactionMul;
          _force.normalize().multiplyScalar(Math.min(d * springK, maxForce));
          rb.resetForces(true);
          rb.addForce({ x: _force.x, y: _force.y, z: 0 }, true);
        }

        if (livePointer) {
          const dx = t.x - repulsionCenter.x;
          const dy = t.y - repulsionCenter.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = REPULSION_RADIUS * REPULSION_RADIUS;
          if (distSq > 1e-6 && distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const safeDist = Math.max(dist, REPULSION_MIN_DIST);
            const tNorm = Math.max(0, 1 - safeDist / REPULSION_RADIUS);
            const smoothFalloff = tNorm * tNorm * (3 - 2 * tNorm);
            const repulsionMul = isBackground ? 1 : N1_REPULSION_MUL;
            const push = Math.min(REPULSION_FORCE * smoothFalloff * repulsionMul, REPULSION_FORCE_CAP * repulsionMul);
            rb.addForce({ x: (dx / safeDist) * push, y: (dy / safeDist) * push, z: 0 }, true);
          }
        }

        if (isMobileHero) {
          rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
          rb.setRotation({ w: 1, x: 0, y: 0, z: 0 }, true);
        }

        const q = rb.rotation();
        const posLerp = 1 - Math.exp(-VISUAL_POS_DAMP * dt);
        visPos.x += (t.x - visPos.x) * posLerp;
        visPos.y += (t.y - visPos.y) * posLerp;
        visPos.z += (homeZ - visPos.z) * posLerp;
        group.position.copy(visPos);

        _targetQ.set(q.x, q.y, q.z, q.w);
        _curQ.copy(_targetQ).slerp(homeQuat, ROT_LERP);
        const rotLerp = 1 - Math.exp(-VISUAL_ROT_DAMP * dt);
        visQuat.slerp(_curQ, rotLerp);
        group.quaternion.copy(visQuat);
        applyN1LocalAxisSpin(body, dt, isN1PointerNear(t.x, t.y, body));

        const av = rb.angvel();
        const angSp = Math.sqrt(av.x * av.x + av.y * av.y + av.z * av.z);
        if (angSp > 0.7) {
          const f = 0.7 / angSp;
          rb.setAngvel({ x: av.x * f, y: av.y * f, z: av.z * f }, true);
        }
      }

      renderer.render(scene, camera);
    }

    function onResize() {
      const w = container.offsetWidth || 1920, h = container.offsetHeight || 1080;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    new ResizeObserver(onResize).observe(container);
    onResize();

    new IntersectionObserver(([e]) => {
      cancelAnimationFrame(animId);
      if (e.isIntersecting) tick(performance.now());
    }).observe(container);

    hdriPromise.then(() => {
      renderer.compile(scene, camera);
      let warmup = 0;
      function warmupTick() {
        renderer.render(scene, camera);
        warmup++;
        if (warmup < 8) {
          requestAnimationFrame(warmupTick);
        } else {
          canvas3d.style.opacity = '1';
          tick(performance.now());
        }
      }
      requestAnimationFrame(warmupTick);
    }).catch(err => console.warn('[hero3d] HDRI failed:', err));

    if (!isMobileHero) {
      heroEl.addEventListener('pointerdown', e => {
        heroPointerEngaged = true;
        pointerDown = true;
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
      }, { passive: true });

      heroEl.addEventListener('pointermove', e => {
        const isTouchLike = e.pointerType === 'touch' || e.pointerType === 'pen';
        if (isTouchLike && pointerDown) {
          const dx = e.clientX - pointerStartX;
          const dy = e.clientY - pointerStartY;
          if ((dx * dx + dy * dy) < 144) return;
        }

        heroPointerEngaged = true;
        pointerActive = true;
        lastPointerMoveTime = performance.now();
        const r = heroEl.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        targetParallaxX = px * 0.1;
        targetParallaxY = py * 0.07;
        oscarTargetX = px * 20;
        oscarTargetY = py * 14;
        if (hasPointerSample) {
          const pointerDeltaX = px - lastPointerPx;
          const pointerDeltaY = py - lastPointerPy;
          mainSwingX += pointerDeltaX * 0.55;
          mainSwingY += pointerDeltaY * 0.4;
        }
        lastPointerPx = px;
        lastPointerPy = py;
        hasPointerSample = true;
        mouseNDC.set(px * 2, -(py * 2));
      }, { passive: true });

      const resetPointerInteraction = () => {
        pointerDown = false;
        pointerActive = false;
        hasPointerSample = false;
        targetParallaxX = 0;
        targetParallaxY = 0;
        oscarTargetX = 0;
        oscarTargetY = 0;
        repulsionCenter.set(-9999, -9999);
        mouseNDC.set(-9999, -9999);
      };

      const resetPointerDown = () => {
        pointerDown = false;
      };

      heroEl.addEventListener('pointerup', resetPointerDown, { passive: true });
      heroEl.addEventListener('pointercancel', resetPointerDown, { passive: true });
      heroEl.addEventListener('pointerleave', resetPointerInteraction, { passive: true });
    }

  } catch (err) {
    console.error('[hero3d] load failed:', err);
  }
}

const heroContainer = document.getElementById('hero3dScene');
if (heroContainer) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initHero3D().catch(err => console.error('[hero3d]', err));
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' }); 
  
  observer.observe(heroContainer);
} else {
  initHero3D().catch(err => console.error('[hero3d]', err));
}