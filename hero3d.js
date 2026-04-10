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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = false;

  const canvas3d = renderer.domElement;
  canvas3d.style.cssText = 'display:block;width:100%;height:100%;opacity:0;transition:opacity 0.4s ease;';
  container.appendChild(canvas3d);

  // ─── Scene ───────────────────────────────────────────────────────
  const scene = new THREE.Scene();
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
  const isMobileHero = window.matchMedia('(max-width: 1200px)').matches;
  const isNarrowMobile = window.innerWidth < 400;
  const backgroundModelScale = isMobileHero ? 0.54 : 1;
  const mobileXOffset = isNarrowMobile ? -30 * PX : 0;

  function cssToWorld(l, t, w, h) {
    const cx = l + w * 0.5 - 960, cy = t + h * 0.5 - 540;
    return new THREE.Vector2(cx / 960 * HALF_W, -cy / 540 * HALF_H);
  }

  const mainRect = { l: 657, t: 88, w: 605, h: 1016 };
  const mainXY = cssToWorld(mainRect.l, mainRect.t, mainRect.w, mainRect.h);

  const camera = new THREE.PerspectiveCamera(CAM_FOV, 1920 / 1080, 0.1, 100);
  const CAM_Y = HALF_H * 1.25;
  camera.position.set(0, CAM_Y, CAM_Z);
  camera.lookAt(0, mainXY.y * 0.8, 0);

  // ─── Rapier ───────────────────────────────────────────────────────
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  world.numSolverIterations = 2;

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

      // Используем размеры оригинальной модели (gltf) для одинакового масштаба и центра
      const refBox = new THREE.Box3().setFromObject(gltf.scene);
      const refSize = new THREE.Vector3();
      const refCenter = new THREE.Vector3();
      refBox.getSize(refSize);
      refBox.getCenter(refCenter);
      const refDim = Math.max(refSize.x, refSize.y, refSize.z, 0.001);

      _box.setFromObject(mesh); _box.getSize(_size); _box.getCenter(_center);
      const scale = (BG_H * PX) / refDim * (0.9 + 0.14 * wz) * backgroundModelScale;

      mesh.scale.set(scale, scale, scale);
      mesh.rotation.order = 'YXZ';
      mesh.rotation.y = OSCAR_YAW_TO_CAMERA;
      if (tilt) mesh.rotation.x = (tilt * Math.PI) / 180;
      mesh.position.set(-refCenter.x * scale, -refCenter.y * scale, -refCenter.z * scale);

      const homePos = new THREE.Vector2(wx, wy);
      const homeQuat = new THREE.Quaternion();
      const g = new THREE.Group();
      g.position.set(wx, wy, wz);
      g.quaternion.copy(homeQuat);
      g.add(mesh); scene.add(g);

      // Rapier dynamic body
      const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(wx, wy, 0)
          .setLinearDamping(12.0)
          .setAngularDamping(12.0)
          .setCcdEnabled(true)
      );
      const sw = refSize.x * scale, sh = refSize.y * scale;
      const tall = sh / Math.max(sw, 0.01) > 1.8;
      const col = tall
        ? RAPIER.ColliderDesc.capsule(Math.max((sh - sw) / 2, 0.04), sw * 0.35)
        : RAPIER.ColliderDesc.ball(Math.max(sw, sh) * 0.35);
      col.setMass(4);
      col.setRestitution(0.08);
      col.setFriction(1.0);
      world.createCollider(col, rb);

      bodies.push({ group: g, rb, homePos, homeQuat, homeZ: wz });
      return g;
    }

    // ─── 5 фоновых моделей ───────────────────────────────────────────
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
          .setLinearDamping(12.0)
          .setAngularDamping(12.0)
          .setCcdEnabled(true)
      );
      const sw = _size.x * scale, sh = _size.y * scale;
      const col = RAPIER.ColliderDesc.ball(Math.max(sw, sh) * 0.35);
      col.setMass(2);
      col.setRestitution(0.08);
      col.setFriction(1.0);
      world.createCollider(col, rb);
      bodies.push({ group: g, rb, homePos, homeQuat, homeZ: wz });
    }

    const n1SpawnConfig = isMobileHero
      ? [
          [gltfN1b, -1.10 + mobileXOffset,  0.90, -0.3, -165, 0.6, 0.9,, '#7c2f25'],
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

    // ─── Курсор — кинематический шар (как в архиве) ───────────────────
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
    const SPRING_K = 5;
    const IDLE_SPRING_K = 2;
    const MAX_SPEED = 1.2;
    const ROT_LERP = 0.06;
    const _force = new THREE.Vector3();
    const _curQ = new THREE.Quaternion();
    let animId = 0;
    let parallaxX = 0, parallaxY = 0;
    let targetParallaxX = 0, targetParallaxY = 0;
    let mainSwingX = 0;
    let mainSwingY = 0;
    let lastPointerPx = 0;
    let lastPointerPy = 0;
    let hasPointerSample = false;
    let pointerActive = false;
    let pointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;

    // Oscar img parallax
    const oscarImg = document.getElementById('heroOscarImg');
    let oscarParallaxX = 0, oscarParallaxY = 0;
    let oscarTargetX = 0, oscarTargetY = 0;

    const isMobileDevice = window.innerWidth <= 1200;
    let physicsFrame = 0;
    let lastRenderTime = 0;
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    function tick(now) {
      animId = requestAnimationFrame(tick);

      // Throttle rendering to target FPS
      if (now - lastRenderTime < FRAME_TIME) {
        return;
      }
      lastRenderTime = now;

      // Физику обновляем каждый кадр при активном курсоре, иначе через кадр
      physicsFrame++;
      const shouldStepPhysics = pointerActive
        ? true
        : physicsFrame % 2 === 0;
      if (shouldStepPhysics) {
        world.step();
      }
      if (pointerActive) {
        if (mouseNDCFiltered.x < -1000 || mouseNDCFiltered.y < -1000) {
          mouseNDCFiltered.copy(mouseNDC);
        } else {
          mouseNDCFiltered.lerp(mouseNDC, 0.1);
        }
        syncMouseBall();
      }

      parallaxX += (targetParallaxX - parallaxX) * 0.06;
      parallaxY += (targetParallaxY - parallaxY) * 0.06;
      
      // Update camera only if parallax changed significantly
      const camDelta = Math.abs(camera.position.x - parallaxX) + Math.abs(camera.position.y - (CAM_Y + parallaxY));
      if (camDelta > 0.001) {
        camera.position.x = parallaxX;
        camera.position.y = CAM_Y + parallaxY;
        camera.lookAt(0, mainXY.y * 0.8, 0);
      }

      // Oscar img parallax
      if (oscarImg) {
        const oscarDelta = Math.abs(oscarParallaxX - oscarTargetX) + Math.abs(oscarParallaxY - oscarTargetY);
        if (oscarDelta > 0.1) {
          oscarParallaxX += (oscarTargetX - oscarParallaxX) * 0.06;
          oscarParallaxY += (oscarTargetY - oscarParallaxY) * 0.06;
          const tiltDeg = oscarParallaxX * 0.25;
          const tx = oscarParallaxX.toFixed(2);
          const ty = oscarParallaxY.toFixed(2);
          const td = tiltDeg.toFixed(3);
          if (oscarImg._lastTx !== tx || oscarImg._lastTy !== ty || oscarImg._lastTd !== td) {
            oscarImg.style.transform = `translate(${tx}px, ${ty}px) rotate(${td}deg)`;
            oscarImg._lastTx = tx; oscarImg._lastTy = ty; oscarImg._lastTd = td;
          }
        }
      }

      mainSwingX *= 0.9;
      mainSwingY *= 0.9;

      for (const { group, rb, homePos, homeQuat, homeZ } of bodies) {
        const t = rb.translation();
        const q = rb.rotation();

        // Clamp velocity
        const v = rb.linvel();
        const spd = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
        if (spd > MAX_SPEED) {
          const f = MAX_SPEED / spd;
          rb.setLinvel({ x: v.x*f, y: v.y*f, z: v.z*f }, true);
        }

        // Spring toward home
        const springK = pointerActive ? SPRING_K : IDLE_SPRING_K;
        _force.set(homePos.x - t.x, homePos.y - t.y, -t.z);
        const d = _force.length();
        if (d > 0.001) {
          _force.normalize().multiplyScalar(Math.min(d * springK, 15));
          rb.resetForces(true);
          rb.addForce({ x: _force.x, y: _force.y, z: _force.z }, true);
        }

        group.position.set(t.x, t.y, homeZ);
        _curQ.set(q.x, q.y, q.z, q.w).slerp(homeQuat, ROT_LERP);
        group.quaternion.copy(_curQ);
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
      if (e.isIntersecting) tick();
    }).observe(container);

    hdriPromise.then(() => {
      // Компилируем шейдеры заранее, потом прогреваем несколько кадров
      renderer.compile(scene, camera);
      let warmup = 0;
      function warmupTick() {
        renderer.render(scene, camera);
        warmup++;
        if (warmup < 8) {
          requestAnimationFrame(warmupTick);
        } else {
          canvas3d.style.opacity = '1';
          tick();
        }
      }
      requestAnimationFrame(warmupTick);
    }).catch(err => console.warn('[hero3d] HDRI failed:', err));

    const heroEl = document.getElementById('heroScreen')
                 ?? document.querySelector('.screen-hero')
                 ?? container;

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
      const r = heroEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      targetParallaxX = px * 0.15;
      targetParallaxY = py * 0.1;
      oscarTargetX = px * 30;
      oscarTargetY = py * 20;
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
      mouseNDC.set(-9999, -9999);
    };

    const resetPointerDown = () => {
      pointerDown = false;
    };

    heroEl.addEventListener('pointerup', resetPointerDown, { passive: true });
    heroEl.addEventListener('pointercancel', resetPointerDown, { passive: true });
    heroEl.addEventListener('pointerleave', resetPointerDown, { passive: true });

  } catch (err) {
    console.error('[hero3d] load failed:', err);
  }
}

// Lazy load 3D scene when hero section is near viewport
const heroContainer = document.getElementById('hero3dScene');
if (heroContainer) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initHero3D().catch(err => console.error('[hero3d]', err));
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' }); // Start loading 200px before visible
  
  observer.observe(heroContainer);
} else {
  // Fallback if container not found
  initHero3D().catch(err => console.error('[hero3d]', err));
}
