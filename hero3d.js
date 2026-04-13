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

  // ─── Renderer ────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio < 2,
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'mediump',
    stencil: false,
    depth: true,
  });
  const isMobileHero = window.matchMedia('(max-width: 1200px)').matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileHero ? 1.0 : 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = false;

  const canvas3d = renderer.domElement;
  canvas3d.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 0.4s ease;';
  container.appendChild(canvas3d);

  // ─── Scene ───────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
  dirLight.position.set(0, 5, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0xccddff, 3.0);
  dirLight2.position.set(-3, 2, -2);
  scene.add(dirLight2);
  const dirLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
  dirLight3.position.set(3, 1, 2);
  scene.add(dirLight3);
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
  const backgroundModelScale = isMobileHero ? 0.54 : 1;
  const mobileXOffset = isNarrowMobile ? -30 * PX : 0;

  function cssToWorld(l, t, w, h) {
    const cx = l + w * 0.5 - 960, cy = t + h * 0.5 - 540;
    return new THREE.Vector2(cx / 960 * HALF_W, -cy / 540 * HALF_H);
  }

  const mainRect = { l: 657, t: 88, w: 605, h: 1016 };
  const mainXY = cssToWorld(mainRect.l, mainRect.t, mainRect.w, mainRect.h);
  const springHomeXY = new THREE.Vector2(0, mainXY.y * 0.8 + (isMobileHero ? 0.18 : 0.08));

  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1920 / 1080, 0.1, 100);
  const CAM_Y = HALF_H * 1.25;
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.lookAt(0, mainXY.y * 0.8, 0);

  // ─── Rapier ───────────────────────────────────────────────────────
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.numSolverIterations = 8;
  world.numInternalPgsIterations = 2;

  // ─── Вспомогательная функция для случайного кругового вектора ──────
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
      const scale = (BG_H * PX) / refDim * (0.9 + 0.14 * wz) * backgroundModelScale;

      mesh.scale.set(scale, scale, scale);
      mesh.rotation.order = 'YXZ';
      mesh.rotation.y = OSCAR_YAW_TO_CAMERA;
      if (tilt) mesh.rotation.x = (tilt * Math.PI) / 180;
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
          .setLinearDamping(4.8)
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
        // Используем 360-градусный вектор разлета
        scatterDir: getRandomScatterDir(),
      });
      return g;
    }

    const mainXY_y = mainXY.y;
    const backgroundSpawnConfig = isMobileHero
      ? [
          [1, -0.84 + mobileXOffset,  -0.18,            0.10,  15,  1.0, null],
          [2, -0.18 + mobileXOffset,  0.72,           -0.5,   10,  1.0, null],
          [0,  0.04 + mobileXOffset,  0.92,           -1.80, -15,  0.7, 0.6],
          [2,  0.14 + mobileXOffset,  0.50,            0.10, -15,  1.0, null],
          [1,  -0.46 + mobileXOffset,  0.86,           -0.80, -30,  1.0, null],
        ]
      : [
          [1, -1.90, mainXY_y - 0.4,  0.20,  15,  1.0, null],
          [2, -0.40, -0.2,            -0.5,   10,  1.0, null],
          [0,  0.3,   0.2,            -1.80, -15,  0.7, 0.6],
          [2,  0.40,  0.1,             0.30, -15,  1.0, null],
          [1,  0.8, mainXY_y - 0.4,  -1.10, -30,  1.0, null],
        ];

    backgroundSpawnConfig.forEach((args) => spawn(...args));

    // ─── Модели №1 (2 слева, 2 справа) ───────────────────────────────
    const N1_H = isMobileHero ? 96 : 134;
    function spawnN1(gltfSrc, wx, wy, wz, tiltDeg, op, brighten, color) {
      const mesh = gltfSrc.scene.clone(true);
      prepareModelForViewer(mesh, renderer);
      _box.setFromObject(mesh); _box.getSize(_size); _box.getCenter(_center);
      const natDim = Math.max(_size.x, _size.y, _size.z, 0.001);
      const sizeMultiplier = 1.5;
      const scale = (N1_H * PX) / natDim * sizeMultiplier;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.order = 'YXZ';
      mesh.rotation.y = OSCAR_YAW_TO_CAMERA + Math.PI;
      mesh.rotation.x = Math.PI;
      if (tiltDeg) mesh.rotation.z = (tiltDeg * Math.PI) / 180;
      mesh.position.set(-_center.x * scale, -_center.y * scale, -_center.z * scale);
      mesh.traverse(c => {
        if (c.isMesh && c.material) {
          c.material = c.material.clone();
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
      g.add(mesh); scene.add(g);

      const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(wx, wy, 0)
          .setLinearDamping(4.8)
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
        // 360-градусный вектор разлета для цифр 1
        scatterDir: getRandomScatterDir(),
      });
    }

    const n1SpawnConfig = isMobileHero
      ? [
          [gltfN1b, -1.10 + mobileXOffset,  0.90, -0.3, -165, 0.6, 0.9, '#7c2f25'],
          [gltfN1s,   -0.82 + mobileXOffset, -1.32, -0.5, -194, 0.50, 1, '#e3e3e3'],
          [gltfN1b,    1.00 + mobileXOffset,  0.98, -0.3, -165, 0.85, 0.9, '#424242'],
          [gltfN1b,  0.96 + mobileXOffset, -1.32, -0.5, -194, 0.6, 0.9, '#7c2f25'],
        ]
      : [
          [gltfN1b, -3.00, mainXY.y + 0.4, -0.3, -165, 0.6, 0.9, '#7c2f25'],
          [gltfN1s,   -3.70, mainXY.y - 1.7, -0.5, -144, 0.50, 1, '#e3e3e3'],
          [gltfN1b,    2.10, mainXY.y + 0.7, -0.3, -165, 0.85, 0.9, '#424242'],
          [gltfN1b,  3.30, mainXY.y - 1.7, 0.8, -144, 0.6, 0.9, '#7c2f25'],
        ];

    n1SpawnConfig.forEach((args) => spawnN1(...args));

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
    const SPRING_K = 5.0;      
    const IDLE_SPRING_K = 1.2; 
    
    const MAX_SPEED = 1.35;
    const MAX_FORCE = 22.0;
    const IDLE_SPEED_FACTOR = 0.12;
    const IDLE_FORCE_FACTOR = 0.2;
    const IDLE_VEL_DAMP = 0.84;
    const IDLE_FREE_DIST = isMobileHero ? 0.42 : 0.68;
    const IDLE_MAX_DIST = isMobileHero ? 1.4 : 2.4;
    
    // Настройки отталкивания от курсора
    const REPULSION_RADIUS = isMobileHero ? 2.0 : 2.5;     
    const REPULSION_FORCE = isMobileHero ? 25.0 : 35.0;    
    const REPULSION_MIN_DIST = isMobileHero ? 0.18 : 0.14;
    const REPULSION_FORCE_CAP = isMobileHero ? 15.0 : 20.0; 
    
    const ROT_LERP = 0.08;
    const VISUAL_POS_DAMP = 12;
    const VISUAL_ROT_DAMP = 14;
    const N1_REACTION_MUL = 0.22;
    const N1_REPULSION_MUL = 1.0; 
    
    // Дистанции для разлета по скроллу (можно увеличить, если нужно раскидать их еще дальше)
    const SCATTER_DISTANCE_X = isMobileHero ? 5.0 : 9.0;
    const SCATTER_DISTANCE_Y = isMobileHero ? 4.0 : 7.0;
    
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
    let centerPullArmed = true;
    let lastPointerMoveTime = 0;
    let pointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let scatterProgress = 0;

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
    const FIXED_STEP_IDLE = 1 / 60;
    const MAX_STEPS_PER_FRAME = 3;

    function tick(now) {
      animId = requestAnimationFrame(tick);

      const dt = Math.min((now - lastFrameTime) / 1000 || 0.016, 0.05);
      lastFrameTime = now;
      
      const livePointer = pointerActive;
      
      // ─── ЛОГИКА СКРОЛЛА (Новый расчет разлета) ─────────────────────────
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight || 1080;
      
      // Вычисляем, насколько глубоко мы проскроллили. 
      // 0 = мы на самом верху. 1 = контейнер ушел вверх на высоту экрана.
      let scrollRaw = -rect.top / windowHeight; 
      // Коэффициент 1.5 означает, что полный разлет случится быстрее (до того, как секция полностью исчезнет)
      let targetScatter = Math.max(0, Math.min(1, scrollRaw * 1.5));
      
      const scatterLerp = 1 - Math.exp(-12 * dt);
      scatterProgress += (targetScatter - scatterProgress) * scatterLerp;

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
        camera.lookAt(0, mainXY.y * 0.8, 0);
      }

      if (oscarImg) {
        const oscarDelta = Math.abs(oscarParallaxX - oscarTargetX) + Math.abs(oscarParallaxY - oscarTargetY);
        if (oscarDelta > 0.1) {
          const oscarLerp = 1 - Math.exp(-7 * dt);
          oscarParallaxX += (oscarTargetX - oscarParallaxX) * oscarLerp;
          oscarParallaxY += (oscarTargetY - oscarParallaxY) * oscarLerp;
          const tiltDeg = oscarParallaxX * 0.25;
          const tx = oscarParallaxX;
          const ty = oscarParallaxY;
          const td = tiltDeg;
          if (
            Math.abs((oscarImg._lastTx ?? 0) - tx) > 0.02 ||
            Math.abs((oscarImg._lastTy ?? 0) - ty) > 0.02 ||
            Math.abs((oscarImg._lastTd ?? 0) - td) > 0.01
          ) {
            oscarImg.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${td.toFixed(3)}deg)`;
            oscarImg._lastTx = tx;
            oscarImg._lastTy = ty;
            oscarImg._lastTd = td;
          }
        }
      }

      mainSwingX *= 0.9;
      mainSwingY *= 0.9;

      for (const body of bodies) {
        const { group, rb, homePos, spawnAnchor, homeQuat, homeZ, isBackground, visPos, visQuat, scatterDir } = body;
        const t = rb.translation();
        const q = rb.rotation();

        // ─── ПРИМЕНЕНИЕ РАЗЛЕТА И ПРУЖИН ─────────────────────────
        // Фон стягивается в центр, единицы — на свои места (homePos).
        const baseTargetPos = isBackground ? springHomeXY : homePos; 
        
        // Чем больше скролл (scatterProgress), тем дальше они улетают по своим круговым векторам
        const scatterX = scatterDir.x * SCATTER_DISTANCE_X * scatterProgress;
        const scatterY = scatterDir.y * SCATTER_DISTANCE_Y * scatterProgress;
        const targetPos = new THREE.Vector2(
          baseTargetPos.x + scatterX,
          baseTargetPos.y + scatterY
        );
        
        const reactionMul = isBackground ? 1 : N1_REACTION_MUL;
        const springK = (livePointer ? SPRING_K : IDLE_SPRING_K) * reactionMul;
        
        // Вектор силы тянет объект к вычисленному targetPos
        _force.set(targetPos.x - t.x, targetPos.y - t.y, 0);
        const d = _force.length();
        const idleFarT = Math.max(
          0,
          Math.min(1, (d - IDLE_FREE_DIST) / Math.max(1e-5, IDLE_MAX_DIST - IDLE_FREE_DIST))
        );
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
            const push = Math.min(
              REPULSION_FORCE * smoothFalloff * repulsionMul,
              REPULSION_FORCE_CAP * repulsionMul
            );
            rb.addForce(
              { x: (dx / safeDist) * push, y: (dy / safeDist) * push, z: 0 },
              true
            );
          }
        }

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

    heroEl.addEventListener('pointerdown', e => {
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

      pointerActive = true;
      lastPointerMoveTime = performance.now();
      centerPullArmed = true;
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