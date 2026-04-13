// Sales Slider Configuration
const SALES_SLIDES = [
  { 
    main: "./assets/images/promo/promo_rect73.webp", 
    copy: "16 лет оргкомитет проводит мегасштабную рекламную и PR-кампанию Премии (наружная и радио реклама, реклама на такси) с целью увеличения посещаемости сайта recordi.ru.<br><br>Следовательно, повышает узнаваемость ваших объектов и продажи" 
  },
  { 
    main: "./assets/images/promo/promo_rect72.webp", 
    copy: "Участие в премии открывает доступ к широкой аудитории покупателей и инвесторов, формируя устойчивый интерес к вашим проектам на рынке недвижимости." 
  },
  { 
    main: "./assets/images/promo/promo_rect71.webp", 
    copy: "Федеральные СМИ, новостные ленты крупнейших информагентств и социальные сети — ваш проект получает максимальный медийный охват по всей стране." 
  },
  { 
    main: "./assets/images/promo/promo_rect70.webp", 
    copy: "Победа в премии становится знаком качества, который усиливает доверие клиентов и выделяет ваш бренд среди конкурентов на протяжении всего года." 
  },
];

// Initialize Sales Slider
function initSalesSlider() {
  const salesGalleryMain = document.querySelector(".sales-gallery-main");
  const salesMeta = document.querySelector(".sales-meta");
  const salesCopy = document.querySelector(".sales-copy");
  const salesNavPrev = document.querySelector(".sales-nav-prev");
  const salesNavNext = document.querySelector(".sales-nav-next");

  if (!salesGalleryMain || !salesMeta || !salesNavPrev || !salesNavNext || typeof window.Swiper !== "function") {
    console.warn("Sales slider: missing elements or Swiper library");
    return;
  }

  const slides = SALES_SLIDES.slice();
  const wrapper = salesGalleryMain.querySelector(".swiper-wrapper");
  
  if (!wrapper) {
    console.warn("Sales slider: swiper-wrapper not found");
    return;
  }

  // Generate slides HTML
  wrapper.innerHTML = slides.map((slide, index) => `
    <div class="swiper-slide sales-gallery-slide" data-slide-index="${index}">
      <img
        class="sales-gallery-image"
        src="${slide.main}"
        alt="Слайд ${index + 1}"
        loading="${index === 0 ? "eager" : "lazy"}"
        decoding="async"
      />
    </div>
  `).join("");

  let salesSlideIndex = 0;

  // Update meta information and copy text
  const updateMeta = (index) => {
    salesSlideIndex = index;
    const current = String(index + 1).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");
    salesMeta.innerHTML = `${current} <span>/ ${total}</span>`;
    
    salesNavPrev.disabled = index <= 0;
    salesNavNext.disabled = index >= slides.length - 1;

    if (salesCopy && slides[index].copy) {
      salesCopy.classList.add("is-fading");
      setTimeout(() => {
        salesCopy.innerHTML = slides[index].copy;
        salesCopy.classList.remove("is-fading");
      }, 250);
    }
  };

  // Initialize Swiper
  const isMobile = window.innerWidth <= 1200;
  const swiper = new window.Swiper(salesGalleryMain, {
    slidesPerView: isMobile ? 1 : "auto",
    spaceBetween: isMobile ? 0 : 30,
    speed: 1100,
    loop: false,
    centeredSlides: isMobile,
    slidesOffsetAfter: isMobile ? 0 : 100,
    allowTouchMove: true,
    grabCursor: true,
    resistance: true,
    resistanceRatio: 0.72,
    threshold: 8,
    longSwipesRatio: 0.18,
    longSwipesMs: 220,
    shortSwipes: true,
    watchOverflow: true,
    effect: "slide",
    followFinger: true,
    navigation: {
      prevEl: salesNavPrev,
      nextEl: salesNavNext,
    },
    on: {
      init(instance) {
        updateMeta(instance.activeIndex);
      },
      slideChange(instance) {
        updateMeta(instance.activeIndex);
      },
    },
  });

  // Keyboard navigation
  salesGalleryMain.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      swiper.slidePrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      swiper.slideNext();
    }
  });

  // Accessibility
  salesGalleryMain.tabIndex = 0;
  salesGalleryMain.setAttribute("role", "group");
  salesGalleryMain.setAttribute("aria-label", "Слайдер продаж");

  updateMeta(0);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSalesSlider);
} else {
  initSalesSlider();
}

function pad2(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function initCountdownTimer() {
  const countScreen = document.getElementById("countScreen");
  if (!countScreen) return;

  const numberNodes = [...countScreen.querySelectorAll(".timer-card .number")];
  if (numberNodes.length < 4) return;

  const daysNode = numberNodes[0];
  const hoursNode = numberNodes[1];
  const minsNode = numberNodes[2];
  const secsNode = numberNodes[3];
  const targetDate = new Date(2026, 4, 28, 17, 0, 0, 0);

  const setTimerValue = (node, value) => {
    if (!node) return;
    const formatted = pad2(value);
    const currentNode = node.querySelector(".current");
    if (currentNode) {
      currentNode.textContent = formatted;
      return;
    }
    node.textContent = formatted;
  };

  const renderCountdown = () => {
    const now = new Date();
    const deltaSeconds = Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / 1000));
    const days = Math.floor(deltaSeconds / 86400);
    const hours = Math.floor((deltaSeconds % 86400) / 3600);
    const minutes = Math.floor((deltaSeconds % 3600) / 60);
    const seconds = deltaSeconds % 60;

    setTimerValue(daysNode, days);
    setTimerValue(hoursNode, hours);
    setTimerValue(minsNode, minutes);
    setTimerValue(secsNode, seconds);
  };

  const scheduleNextTick = () => {
    const delay = 1000 - (Date.now() % 1000);
    window.setTimeout(() => {
      renderCountdown();
      scheduleNextTick();
    }, delay);
  };

  renderCountdown();
  scheduleNextTick();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCountdownTimer);
} else {
  initCountdownTimer();
}










// LENIS
// ==========================================
// ИНИЦИАЛИЗАЦИЯ ПЛАВНОГО СКРОЛЛА (LENIS)
// ==========================================
const lenis = new Lenis({
  duration: 5.2, // Длительность скролла (чем больше, тем плавнее и медленнее)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Кривая замедления
  direction: 'vertical', 
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false, // На мобильных устройствах лучше оставлять нативный скролл для удобства
  touchMultiplier: 2,
  infinite: false,
});

// Функция для синхронизации скролла с частотой обновления экрана
function raf(time) {
  lenis.raf(time);
  if (typeof window._updateOrbitPhase === "function") {
    window._updateOrbitPhase();
  }
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ==========================================
// PROMO: текст к центру экрана, затем карточки снизу + доп. подъём по колонкам
// ==========================================
(function initPromoSlideUp() {
  const promoSection = document.getElementById('promoScreen');
  if (!promoSection) return;
  const promoContent = promoSection.querySelector('.promo-content');
  const promoHeader = promoSection.querySelector('.promo-header');
  const promoItems = [...promoSection.querySelectorAll('.promo-item')];
  if (!promoContent) return;

  const vh = () => window.innerHeight;
  /** Стартовый сдвиг карточек вниз: целый экран + доля vh (чтобы точно не было видно). */
  const PROMO_HIDE_BELOW_VH = 0.82;
  const startY = () => vh() * (1 + PROMO_HIDE_BELOW_VH);
  /** Доля скролла на заголовок; меньше значение — больше пикселей на фазу карточек над текстом (медленнее наезд). */
  const TEXT_PHASE = 0.36;
  let ticking = false;
  let shiftMaxCache = null;

  function measureHeaderShiftToCenter() {
    if (!promoHeader) return 0;
    promoHeader.style.transform = 'translateY(0)';
    const h = promoHeader.getBoundingClientRect();
    return vh() / 2 - (h.top + h.height / 2);
  }

  function resetItemRise() {
    promoItems.forEach((el) => el.style.removeProperty('--promo-item-rise'));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = promoSection.getBoundingClientRect();
      const sectionH = promoSection.offsetHeight;
      const overlapZone = sectionH - vh();
      if (overlapZone <= 0) {
        ticking = false;
        return;
      }

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / overlapZone));

      if (shiftMaxCache === null && rect.top <= 1 && scrolled >= 0) {
        shiftMaxCache = measureHeaderShiftToCenter();
      }
      const shiftMax = shiftMaxCache ?? 0;

      if (progress < TEXT_PHASE) {
        const pText = progress / TEXT_PHASE;
        if (promoHeader) {
          promoHeader.style.transform = `translateY(${pText * shiftMax}px)`;
        }
        promoContent.style.transform = `translate(-50%, ${startY()}px)`;
        resetItemRise();
      } else {
        const t = Math.max(0, Math.min(1, (progress - TEXT_PHASE) / (1 - TEXT_PHASE)));
        /* ease-out: мягкий разгон и спокойное замедление к финалу, без рывка по скроллу */
        const pCards = 1 - Math.pow(1 - t, 2.35);
        if (promoHeader) {
          promoHeader.style.transform = `translateY(${shiftMax}px)`;
        }
        const y0 = startY();
        const p = pCards;
        const overshoot = vh() * (0.09 * p + 0.14 * p * p);
        const offset = y0 * (1 - pCards) - overshoot;
        promoContent.style.transform = `translate(-50%, ${offset}px)`;
        const riseBase = pCards * Math.min(vh() * 0.55, 480);
        promoItems.forEach((el, i) => {
          el.style.setProperty('--promo-item-rise', `${riseBase * (1 + i * 0.52)}px`);
        });
      }

      if (scrolled < -2 || rect.top > vh() + 4) {
        shiftMaxCache = null;
        if (promoHeader) promoHeader.style.transform = '';
        resetItemRise();
        promoContent.style.transform = `translate(-50%, ${startY()}px)`;
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    shiftMaxCache = null;
    onScroll();
  });
  if (typeof lenis !== 'undefined' && lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', onScroll);
  }
  onScroll();
})();

// ==========================================
// STATUS SECTION SCROLL-PINNED ANIMATION
// ==========================================
(function initStatusScrollAnimation() {
  const statusSection = document.getElementById('statusScreen');
  if (!statusSection) return;

  const pinSpacer = statusSection.closest('.status-pin-spacer');
  const statusMainTrigger = document.querySelector('.status-title-main');
  const statusScaleTrigger = document.querySelector('.status-title-sub-1');
  const statusAchievementsTrigger = document.querySelector('.status-title-sub-2');
  const statusQuoteGold = document.querySelector('.status-quote-gold');
  const statusQuoteBlack = document.querySelector('.status-quote-black');
  const statusQuoteRuby = document.querySelector('.status-quote-ruby');

  if (!statusMainTrigger || !statusScaleTrigger || !statusAchievementsTrigger) return;

  const VARIANTS = ['gold', 'black', 'ruby'];
  const triggers = [statusMainTrigger, statusScaleTrigger, statusAchievementsTrigger];
  const quotes = [statusQuoteGold, statusQuoteBlack, statusQuoteRuby];

  let activeVariant = 'gold';
  let statusVirtualScroll = 0;
  const STATUS_VIRTUAL_MAX = window.innerHeight * 2.5;
  const STATUS_HOLD_TICKS = 4;
  let statusHoldTicks = 0;
  let lastScrollDirection = 1;
  let isStatusPinned = false;
  let statusCompleted = false;

  if (pinSpacer) {
    const statusH = statusSection.offsetHeight;
    const extraScroll = window.innerHeight * 0.5;
    pinSpacer.style.height = (statusH + extraScroll) + 'px';
  }

  function setActiveStatusVariant(variant) {
    if (variant === activeVariant) return;

    const oldIdx = VARIANTS.indexOf(activeVariant);
    const newIdx = VARIANTS.indexOf(variant);

    if (oldIdx >= 0) {
      triggers[oldIdx].classList.remove('is-active');
      if (quotes[oldIdx]) {
        quotes[oldIdx].classList.remove('is-active');
        quotes[oldIdx].classList.add('is-leaving');
        setTimeout(() => quotes[oldIdx].classList.remove('is-leaving'), 400);
      }
    }

    if (newIdx >= 0) {
      triggers[newIdx].classList.add('is-active');
      if (quotes[newIdx]) {
        setTimeout(() => quotes[newIdx].classList.add('is-active'), oldIdx >= 0 ? 150 : 0);
      }
    }

    activeVariant = variant;
  }

  function isStatusPinnedAtTop() {
    if (!statusSection) return false;
    const rect = statusSection.getBoundingClientRect();
    return Math.abs(rect.top) <= 3;
  }

  function getVariantFromProgress(progress, direction) {
    if (direction > 0) {
      return progress < 0.33 ? 'gold' : progress < 0.66 ? 'black' : 'ruby';
    }
    return progress > 0.66 ? 'ruby' : progress > 0.33 ? 'black' : 'gold';
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  triggers[0].classList.add('is-active');

  const statusOscarImg = document.getElementById('statusOscarImg');
  if (statusOscarImg) {
    statusOscarImg.style.removeProperty('transform');
    statusOscarImg.style.removeProperty('transition');
  }

  const isMobile = () => window.innerWidth <= 768;

  window.addEventListener('wheel', (e) => {
    if (isMobile()) return;

    const inView = isStatusPinnedAtTop();

    if (!inView) {
      if (isStatusPinned) {
        isStatusPinned = false;
        if (lenis.isStopped) lenis.start();
      }
      if (statusCompleted) {
        statusCompleted = false;
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
      }
      return;
    }

    if (statusCompleted) return;

    if (!isStatusPinned) {
      isStatusPinned = true;
      if (e.deltaY > 0) {
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
        setActiveStatusVariant('gold');
      } else {
        statusVirtualScroll = STATUS_VIRTUAL_MAX;
        statusHoldTicks = 0;
      }
    }

    if (statusVirtualScroll < STATUS_VIRTUAL_MAX) {
      e.preventDefault();
      if (!lenis.isStopped) lenis.stop();

      const prevScroll = statusVirtualScroll;
      if (e.deltaY !== 0) lastScrollDirection = e.deltaY > 0 ? 1 : -1;

      statusVirtualScroll = clamp(statusVirtualScroll + e.deltaY * 0.7, 0, STATUS_VIRTUAL_MAX);

      if (statusVirtualScroll <= 0 && lastScrollDirection < 0) {
        statusCompleted = true;
        isStatusPinned = false;
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
        if (lenis.isStopped) lenis.start();
        return;
      }

      if (prevScroll === 0 && statusVirtualScroll > 0 && lastScrollDirection > 0) {
        setActiveStatusVariant('gold');
      } else {
        const progress = statusVirtualScroll / STATUS_VIRTUAL_MAX;
        const newVariant = getVariantFromProgress(progress, lastScrollDirection);
        if (newVariant !== activeVariant) setActiveStatusVariant(newVariant);
      }
      return;
    }

    if (statusHoldTicks < STATUS_HOLD_TICKS) {
      e.preventDefault();
      if (!lenis.isStopped) lenis.stop();

      if (e.deltaY < 0) {
        lastScrollDirection = -1;
        statusVirtualScroll = clamp(statusVirtualScroll + e.deltaY * 0.7, 0, STATUS_VIRTUAL_MAX);
        statusHoldTicks = 0;
        const progress = statusVirtualScroll / STATUS_VIRTUAL_MAX;
        const newVariant = getVariantFromProgress(progress, -1);
        if (newVariant !== activeVariant) setActiveStatusVariant(newVariant);
        return;
      }

      lastScrollDirection = 1;
      statusHoldTicks++;
      if (statusHoldTicks >= STATUS_HOLD_TICKS) {
        statusCompleted = true;
        isStatusPinned = false;
        if (lenis.isStopped) lenis.start();
      }
      return;
    }

    if (lenis.isStopped) lenis.start();
    statusCompleted = true;
    isStatusPinned = false;
  }, { passive: false, capture: true });

  let touchStartY = 0;
  let touchActive = false;

  window.addEventListener('touchstart', (e) => {
    if (isMobile()) return;
    if (!isStatusPinnedAtTop()) return;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isMobile()) return;
    if (!touchActive) return;
    if (!isStatusPinnedAtTop()) {
      if (isStatusPinned) {
        isStatusPinned = false;
      }
      if (statusCompleted) {
        statusCompleted = false;
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
      }
      touchActive = false;
      return;
    }

    if (statusCompleted) return;

    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY;
    touchStartY = currentY;

    if (!isStatusPinned) {
      isStatusPinned = true;
      if (deltaY > 0) {
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
        setActiveStatusVariant('gold');
      } else {
        statusVirtualScroll = STATUS_VIRTUAL_MAX;
        statusHoldTicks = 0;
      }
    }

    if (statusVirtualScroll < STATUS_VIRTUAL_MAX) {
      if (deltaY !== 0) lastScrollDirection = deltaY > 0 ? 1 : -1;
      statusVirtualScroll = clamp(statusVirtualScroll + deltaY * 1.5, 0, STATUS_VIRTUAL_MAX);

      if (statusVirtualScroll <= 0 && lastScrollDirection < 0) {
        statusCompleted = true;
        isStatusPinned = false;
        statusVirtualScroll = 0;
        statusHoldTicks = 0;
        touchActive = false;
        return;
      }

      const progress = statusVirtualScroll / STATUS_VIRTUAL_MAX;
      const newVariant = getVariantFromProgress(progress, lastScrollDirection);
      if (newVariant !== activeVariant) setActiveStatusVariant(newVariant);
      return;
    }

    if (statusHoldTicks < STATUS_HOLD_TICKS) {
      if (deltaY < 0) {
        lastScrollDirection = -1;
        statusVirtualScroll = clamp(statusVirtualScroll + deltaY * 1.5, 0, STATUS_VIRTUAL_MAX);
        statusHoldTicks = 0;
        const progress = statusVirtualScroll / STATUS_VIRTUAL_MAX;
        const newVariant = getVariantFromProgress(progress, -1);
        if (newVariant !== activeVariant) setActiveStatusVariant(newVariant);
        return;
      }

      lastScrollDirection = 1;
      statusHoldTicks++;
      if (statusHoldTicks >= STATUS_HOLD_TICKS) {
        statusCompleted = true;
        isStatusPinned = false;
        touchActive = false;
      }
      return;
    }

    statusCompleted = true;
    isStatusPinned = false;
    touchActive = false;
  }, { passive: true });

  window.addEventListener('touchend', () => { touchActive = false; }, { passive: true });

  triggers.forEach((trigger, i) => {
    trigger.style.cursor = 'pointer';
    trigger.addEventListener('click', () => setActiveStatusVariant(VARIANTS[i]));
  });
})();

// ── Спираль-змея вокруг башни (перенос из Record-main) ─────────────
(function initOrbitSnake() {
  const canvas = document.getElementById("countOrbitCanvas");
  if (!canvas) return;

  /** С тем же брейкпоинтом, что мобильные стили (`max-width: 1200px`). */
  const MOBILE_ORBIT_BREAKPOINT = 1200;

  const ctx = canvas.getContext("2d", { alpha: true });
  let isMobileOrbit = window.innerWidth <= MOBILE_ORBIT_BREAKPOINT;
  let W, H, cx, cy, rx, ry;
  let spiralPoints = [];
  let dpr = 1;
  let orbitVisible = true;
  let orbitDrawQueued = false;

  const TURNS = 3;
  const STEPS = 300;
  const TAIL = 0.15;
  let maxParticles = isMobileOrbit ? 0 : 25;

  let phase = 0;
  let targetPhase = 0;
  const particles = [];
  /** Документная Y верха #countScreen (обновляется, пока блок не sticky). */
  let countScreenDocY = 0;

  function countSectionDocumentTop(el) {
    let y = 0;
    let n = el;
    while (n) {
      y += n.offsetTop;
      n = n.offsetParent;
    }
    return y;
  }

  function readScrollY() {
    if (typeof lenis !== "undefined" && lenis) {
      try {
        const ls = lenis.scroll;
        if (typeof ls === "number" && !Number.isNaN(ls)) return ls;
      } catch (_) {
        /* ignore */
      }
    }
    return (
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.scrollingElement?.scrollTop ||
      0
    );
  }

  function resize() {
    isMobileOrbit = window.innerWidth <= MOBILE_ORBIT_BREAKPOINT;
    maxParticles = isMobileOrbit ? 0 : 25;
    const parent = canvas.parentElement;
    dpr = isMobileOrbit ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    W = parent.offsetWidth || 1920;
    H = parent.offsetHeight || 1080;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    cx = W * 0.5;
    /* Верх спирали (cy − ry) чуть выше середины блока (~0.46H) */
    cy = isMobileOrbit ? H * 0.685 : H * 0.7;
    rx = isMobileOrbit ? W * 0.46 : W * 0.13;
    ry = isMobileOrbit ? H * 0.32 : H * 0.24;

    spiralPoints = buildSpiral(TURNS, STEPS);

    const cs = document.getElementById("countScreen");
    if (cs) {
      const sy = readScrollY();
      const rtt = cs.getBoundingClientRect().top;
      if (rtt > 64) countScreenDocY = rtt + sy;
      else if (!countScreenDocY) countScreenDocY = countSectionDocumentTop(cs);
    }

    requestOrbitDraw();
  }

  function buildSpiral(turns, steps) {
    const ptsArray = [];
    const rxTop = isMobileOrbit ? W * 0.42 : W * 0.07;
    /* Не больше ~0.48W: иначе при cos=1 точка уезжает за правый край canvas */
    const rxBot = isMobileOrbit ? W * 0.48 : W * 0.18;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2 - Math.PI / 2;
      const rxT = rxTop + (rxBot - rxTop) * t;
      ptsArray.push([cx + Math.cos(angle) * rxT, cy - ry + t * ry * 2]);
    }
    return ptsArray;
  }

  window._updateOrbitPhase = function () {
    const countEl = document.getElementById("countScreen");
    if (!countEl) return;
    const vh = window.innerHeight || 1;
    const scrollY = readScrollY();
    const rt = countEl.getBoundingClientRect().top;
    if (rt > 64) {
      countScreenDocY = rt + scrollY;
    }
    const y0 = countScreenDocY > 0 ? countScreenDocY : countSectionDocumentTop(countEl);

    /* В pinned-секции спираль должна пройти во время дополнительного прокрута блока. */
    const narrow = window.innerWidth <= MOBILE_ORBIT_BREAKPOINT;
    /* Мобилка: секция ~210vh, sticky ~1.1·vh скролла — span укладываем в этот запас */
    const startScroll = y0 + vh * (narrow ? 0.14 : 0.02);
    const span = vh * (narrow ? 0.82 : 1.45);
    let raw = (scrollY - startScroll) / Math.max(1, span);
    raw = Math.max(0, Math.min(1, raw));

    const cr = canvas.getBoundingClientRect();
    const h = Math.max(1, cr.height);
    const visibleH = Math.min(cr.bottom, vh) - Math.max(cr.top, 0);
    const spiralInView = visibleH > h * 0.08 || visibleH > vh * 0.12;
    targetPhase = spiralInView ? raw : 0;
    requestOrbitDraw();
  };

  function spawnParticle(x, y) {
    if (particles.length >= maxParticles) return;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.0;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.04,
      size: 1 + Math.random() * 2,
    });
  }

  function draw() {
    orbitDrawQueued = false;

    let needsAnimationFrame = false;

    if (Math.abs(targetPhase - phase) > 0.001) {
      phase += (targetPhase - phase) * 0.06;
      needsAnimationFrame = true;
    } else {
      phase = targetPhase;
    }

    if (!orbitVisible) {
      if (needsAnimationFrame) requestOrbitDraw();
      return;
    }

    ctx.clearRect(0, 0, W, H);

    const total = spiralPoints.length;
    const headFloat = phase * (total - 1);
    const headIdx = headFloat | 0;
    const headFrac = headFloat - headIdx;
    const tailLen = (total * TAIL) | 0;

    if (headIdx >= 0 && headIdx < total - 1) {
      const p1 = spiralPoints[headIdx];
      const p2 = spiralPoints[headIdx + 1];
      const headX = p1[0] + (p2[0] - p1[0]) * headFrac;
      const headY = p1[1] + (p2[1] - p1[1]) * headFrac;

      if (!isMobileOrbit && needsAnimationFrame && Math.random() < 0.4) {
        spawnParticle(headX, headY);
      }
    }

    if (particles.length > 0) {
      needsAnimationFrame = true;
      ctx.shadowBlur = 0;
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.04;
        pt.life -= pt.decay;
        if (pt.life <= 0) {
          const last = particles.pop();
          if (p < particles.length) particles[p] = last;
          continue;
        }
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 230, 190, ${pt.life.toFixed(2)})`;
        ctx.fill();
      }
    }

    if (headIdx > 0 || (headIdx === 0 && phase > 1e-5 && total > 1)) {
      const baseEnd = Math.max(0, headIdx - tailLen);

      if (baseEnd > 0) {
        ctx.beginPath();
        ctx.moveTo(spiralPoints[0][0], spiralPoints[0][1]);
        for (let i = 1; i <= baseEnd; i++) {
          ctx.lineTo(spiralPoints[i][0], spiralPoints[i][1]);
        }
        ctx.strokeStyle = isMobileOrbit
          ? "rgba(255, 220, 180, 0.75)"
          : "rgba(255, 220, 180, 0.6)";
        ctx.lineWidth = isMobileOrbit ? 4.5 : 3;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      if (headIdx > baseEnd || (headIdx === baseEnd && headFrac > 1e-6)) {
        if (isMobileOrbit) {
          ctx.beginPath();
          ctx.moveTo(spiralPoints[baseEnd][0], spiralPoints[baseEnd][1]);
          for (let i = baseEnd + 1; i <= headIdx; i++) {
            ctx.lineTo(spiralPoints[i][0], spiralPoints[i][1]);
          }
          if (headIdx < total - 1) {
            const p1 = spiralPoints[headIdx];
            const p2 = spiralPoints[headIdx + 1];
            ctx.lineTo(
              p1[0] + (p2[0] - p1[0]) * headFrac,
              p1[1] + (p2[1] - p1[1]) * headFrac
            );
          }
          ctx.strokeStyle = "rgba(255, 230, 200, 0.95)";
          ctx.lineWidth = 6;
          ctx.stroke();
        } else {
          for (let i = baseEnd; i <= headIdx; i++) {
            if (i + 1 >= total) break;
            const isLast = i === headIdx;
            const p1 = spiralPoints[i];
            const p2 = spiralPoints[i + 1];

            const x1 = p1[0];
            const y1 = p1[1];
            const x2 = isLast ? p1[0] + (p2[0] - p1[0]) * headFrac : p2[0];
            const y2 = isLast ? p1[1] + (p2[1] - p1[1]) * headFrac : p2[1];

            const tailProgress = 1 - (headFloat - i) / tailLen;
            const alpha = 0.6 + tailProgress * 0.4;
            const g = (220 + alpha * 35) | 0;
            const b = (180 + alpha * 75) | 0;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(255, ${g}, ${b}, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 3 + Math.sin(tailProgress * Math.PI) * 4;
            ctx.shadowColor = `rgba(255, ${g}, ${b}, ${alpha.toFixed(2)})`;
            ctx.shadowBlur = 5 + tailProgress * 10;
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
      }
    }

    if (needsAnimationFrame) {
      requestOrbitDraw();
    }
  }

  function requestOrbitDraw() {
    if (orbitDrawQueued) return;
    orbitDrawQueued = true;
    requestAnimationFrame(draw);
  }

  resize();
  new ResizeObserver(() => {
    resize();
    requestOrbitDraw();
  }).observe(canvas.parentElement);

  if (typeof IntersectionObserver === "function") {
    const observedTarget = document.getElementById("countScreen") || canvas.parentElement;
    new IntersectionObserver((entries) => {
      orbitVisible = entries.some((entry) => entry.isIntersecting);
      if (orbitVisible) requestOrbitDraw();
    }, { threshold: 0.01 }).observe(observedTarget);
  }

  window._updateOrbitPhase();
})();

// ==========================================
// ПЛАВНЫЙ СКРОЛЛ ДЛЯ ЯКОРНЫХ ССЫЛОК
// ==========================================
// Делает так, чтобы при клике на кнопки (например, href="#heroScreen") 
// страница плавно ехала к блоку, а не прыгала резко.
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    
    // Пропускаем ссылки, которые открывают попапы (например, #salesPopup), 
    // если у вас для них написана своя логика
    if (targetId === '#salesPopup') return; 

    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      e.preventDefault();
      lenis.scrollTo(targetElement, {
        offset: 0, // Можно задать отступ сверху, если есть фиксированная шапка
        duration: 1.5 // Время полета до блока
      });
    }
  });
});











// ==========================================
// ADVERT 3D SLIDER
// ==========================================
function initAdvertSlider() {
  const ring = document.getElementById('advertRing');
  const caption = document.getElementById('advertCaption');
  if (!ring) return;

  const slides = ring.querySelectorAll('.slide');
  const container = ring.closest('.advert-3d-slider');

  const numSlides = slides.length;
  let currentAngle = 0;

  function getSlideParams() {
    const width = window.innerWidth;
    if (width <= 1200) {
      return { slideWidth: 277, gap: 15 };
    } else {
      return { slideWidth: 431, gap: 39 };
    }
  }

  function initSlides() {
    const { slideWidth, gap } = getSlideParams();
    const theta = 360 / numSlides;
    const radius = Math.round(((slideWidth + gap) / 2) / Math.tan(Math.PI / numSlides));

    slides.forEach((slide, index) => {
      slide.style.transform = `rotateY(${theta * index}deg) translateZ(${-radius}px)`;
    });

    return { theta, radius };
  }

  function updateRing(instant = false) {
    const { theta, radius } = initSlides();
    ring.style.transform = `rotateY(${currentAngle}deg)`;

    let activeIndex = Math.round(currentAngle / theta) * -1;
    activeIndex = ((activeIndex % numSlides) + numSlides) % numSlides;

    const isMobile = window.innerWidth <= 1200;

    slides.forEach((slide, index) => {
      let dist = Math.abs(index - activeIndex);
      dist = Math.min(dist, numSlides - dist);
      const base = `rotateY(${theta * index}deg) translateZ(${-radius}px)`;
      const slideCaption = slide.querySelector('.slide-caption');
      
      if (isMobile) {
        // На мобильных: активный слайд 100%, остальные 95% и без текста
        if (index === activeIndex) {
          slide.style.opacity = '1';
          slide.style.transform = base + ' scale(1)';
          if (slideCaption) slideCaption.style.opacity = '1';
        } else if (dist <= 2) {
          slide.style.opacity = '1';
          slide.style.transform = base + ' scale(0.95)';
          if (slideCaption) slideCaption.style.opacity = '0';
        } else {
          slide.style.opacity = '0';
          slide.style.transform = base + ' scale(0.8)';
          if (slideCaption) slideCaption.style.opacity = '0';
        }
      } else {
        // На десктопе: оригинальная логика
        if (dist <= 2) {
          slide.style.opacity = '1';
          slide.style.transform = base + ' scale(1)';
          if (slideCaption) slideCaption.style.opacity = dist <= 1 ? '1' : '0';
        } else {
          slide.style.opacity = '0';
          slide.style.transform = base + ' scale(0.8)';
          if (slideCaption) slideCaption.style.opacity = '0';
        }
      }
    });
  }

  // Click on left/right side of screen
  container.addEventListener('click', (e) => {
    const { theta } = initSlides();
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;
    
    if (clickX < halfWidth) {
      currentAngle += theta; // prev
    } else {
      currentAngle -= theta; // next
    }
    updateRing();
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', (e) => {
    const { theta } = initSlides();
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentAngle -= theta; // swipe left = next
      } else {
        currentAngle += theta; // swipe right = prev
      }
      updateRing();
    }
  }, { passive: true });

  // Initialize on load
  updateRing(true);

  // Resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateRing, 200);
  });

  updateRing(true);
}

// Initialize Advert Slider when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdvertSlider);
} else {
  initAdvertSlider();
}

// Reveal text animation on scroll
function initRevealText() {
    const targets = [...document.querySelectorAll(".reveal-text")];
    
    // Set reveal delays
    targets.forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${(i % 8) * 55}ms`);
    });
    
    // Special delay for letter-o elements
    targets
        .filter((el) => el.matches(".letter-o, .count-letter-o, .promo-letter-o, .promo-word-o, .radio-title-o"))
        .forEach((el) => {
            el.style.setProperty("--reveal-delay", "220ms");
        });
    
    // Intersection Observer for scroll-based reveal
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
        });
    }, { 
        threshold: 0.2, 
        rootMargin: "0px 0px -8% 0px" 
    });
    
    targets.forEach((el) => io.observe(el));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initRevealText();
});


// Interview Section Logic
function setInterviewInfo(title, subtitle) {
  const interviewInfoCard = document.getElementById("interviewInfoCard");
  const interviewInfoTitle = document.getElementById("interviewInfoTitle");
  const interviewInfoSubtitle = document.getElementById("interviewInfoSubtitle");
  
  if (!interviewInfoCard || !interviewInfoTitle || !interviewInfoSubtitle) return;
  const nextTitle = title?.trim();
  const nextSubtitle = subtitle?.trim();
  if (!nextTitle || !nextSubtitle) return;
  if (interviewInfoTitle.textContent === nextTitle && interviewInfoSubtitle.textContent === nextSubtitle) return;
  
  interviewInfoCard.classList.add("is-fading");
  window.setTimeout(() => {
    interviewInfoTitle.textContent = nextTitle;
    interviewInfoSubtitle.textContent = nextSubtitle;
    interviewInfoCard.classList.remove("is-fading");
  }, 120);
}

function initInterviewInteractions() {
  const interviewInteractiveItems = [...document.querySelectorAll(".interview-dot, .interview-node[data-interview-title]")];
  
  interviewInteractiveItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const title = item.dataset.interviewTitle;
      const subtitle = item.dataset.interviewSubtitle;
      if (title && subtitle) {
        setInterviewInfo(title, subtitle);
      }
    });
  });
}

function initInterviewDots() {
  const interviewScreen = document.querySelector(".interview");
  const interviewRevealItems = [...document.querySelectorAll(".interview-reveal")];
  
  if (!interviewScreen || !interviewRevealItems.length) return;
  
  // Логика для эллипсов
  const ellipses = document.querySelectorAll('.interview-ellipse');
  
  if (ellipses.length > 0 && 'IntersectionObserver' in window) {
    const ellipseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            entry.target.classList.add('in-view');
          });
          ellipseObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '-15% 0px -15% 0px',
      threshold: 0.3
    });

    ellipses.forEach(ellipse => {
      ellipseObserver.observe(ellipse);
    });
  }

  // Логика для остальных элементов (кнопки и точки)
  const otherRevealItems = [...interviewRevealItems].filter(item => 
    !item.classList.contains('interview-ellipse')
  );
  
  if (otherRevealItems.length > 0) {
    const revealItems = otherRevealItems
      .sort((a, b) => Number(a.dataset.revealOrder || 0) - Number(b.dataset.revealOrder || 0));

    const revealDots = () => {
      revealItems.forEach((item, index) => {
        window.setTimeout(() => item.classList.add("is-visible"), index * 200);
      });
    };

    if (!("IntersectionObserver" in window)) {
      revealDots();
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealDots();
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.28 });
    io.observe(interviewScreen);
  }
}

function initInterviewPeriods() {
  const interviewPeriodPrev = document.getElementById("interviewPeriodPrev");
  const interviewPeriodNext = document.getElementById("interviewPeriodNext");
  const interviewYearTrailLeft = document.getElementById("interviewYearTrailLeft");
  const interviewYearTrailRight = document.getElementById("interviewYearTrailRight");
  const interviewYearTrailNextLeft = document.getElementById("interviewYearTrailNextLeft");
  const interviewYearTrailNextRight = document.getElementById("interviewYearTrailNextRight");
  
  const hideButtons = () => {
    if (interviewPeriodPrev) interviewPeriodPrev.classList.add("is-hidden");
    if (interviewPeriodNext) interviewPeriodNext.classList.add("is-hidden");
  };

  const closeTrail = (trail) => {
    if (!trail) return;
    trail.classList.remove("is-open");
    trail.setAttribute("aria-hidden", "true");
  };

  const openTrail = (trail) => {
    if (!trail) return;
    trail.classList.add("is-open");
    trail.setAttribute("aria-hidden", "false");
  };

  const openPrevPeriods = () => {
    hideButtons();
    openTrail(interviewYearTrailLeft);
    openTrail(interviewYearTrailRight);
    closeTrail(interviewYearTrailNextLeft);
    closeTrail(interviewYearTrailNextRight);
  };

  const openNextPeriods = () => {
    hideButtons();
    closeTrail(interviewYearTrailLeft);
    closeTrail(interviewYearTrailRight);
    openTrail(interviewYearTrailNextLeft);
    openTrail(interviewYearTrailNextRight);
  };

  interviewPeriodPrev?.addEventListener("click", openPrevPeriods);
  interviewPeriodNext?.addEventListener("click", openNextPeriods);
}

function initNewsGallery() {
  const NEWS_DROPDOWN_BREAKPOINT = 1200;
  const newsGallery = document.getElementById("newsGallery");
  const newsTrack = document.getElementById("newsTrack");
  const newsTabs = document.querySelector(".news-tabs");
  const newsTabsDropdown = document.getElementById("newsTabsDropdown");
  const newsTabsTrigger = document.querySelector(".news-tab");
  const newsTabButtons = [...document.querySelectorAll(".news-tab")];
  const newsCursor = document.getElementById("newsCursor");
  const newsCards = [...document.querySelectorAll("[data-news-card]")];

  if (!newsGallery || !newsTrack || !newsCards.length) return;

  const STEP_LOCK_MS = 820;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const getNewsSlideMetrics = () => {
    const scope = newsGallery.closest(".screen-news") || document.documentElement;
    const s = getComputedStyle(scope);
    const width = parseFloat(s.getPropertyValue("--news-card-width"));
    const gap = parseFloat(s.getPropertyValue("--news-card-gap"));
    const cardWidth = Number.isFinite(width) && width > 0 ? width : 400;
    const cardGap = Number.isFinite(gap) ? gap : 40;
    return { width: cardWidth, step: cardWidth + cardGap };
  };
  let newsActiveIndex = window.innerWidth <= 480 ? 0 : (newsCards.length >= 3 ? 1 : 0);
  let newsStepLocked = false;
  let newsStepUnlockTimer = 0;

  const getNewsIndexBounds = () => {
    if (window.innerWidth <= 480 || newsCards.length < 3) {
      return { minIndex: 0, maxIndex: Math.max(0, newsCards.length - 1) };
    }
    return { minIndex: 1, maxIndex: Math.max(1, newsCards.length - 2) };
  };

  const renderNewsGallery = () => {
    const { width: cardWidth, step: cardStep } = getNewsSlideMetrics();
    if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT) {
      newsTrack.style.removeProperty("--news-track-shift-px");
      newsTrack.style.setProperty(
        "transform",
        `translateX(${-newsActiveIndex * cardStep}px)`
      );
      return;
    }
    newsTrack.style.removeProperty("transform");
    const galleryRect = newsGallery.getBoundingClientRect();
    const viewportCenterX = window.innerWidth * 0.5;
    const viewportCenterInGallery = viewportCenterX - galleryRect.left;
    const centeredShiftPx = viewportCenterInGallery - (cardWidth * 0.5) - (newsActiveIndex * cardStep);
    newsTrack.style.setProperty("--news-track-shift-px", `${centeredShiftPx}px`);
  };

  const setNewsActiveIndex = (nextIndex) => {
    const { minIndex, maxIndex } = getNewsIndexBounds();
    newsActiveIndex = clamp(nextIndex, minIndex, maxIndex);
    renderNewsGallery();
  };

  const stepNewsGallery = (direction) => {
    if (!direction || newsStepLocked || newsCards.length < 2) return false;
    newsStepLocked = true;
    window.clearTimeout(newsStepUnlockTimer);
    newsStepUnlockTimer = window.setTimeout(() => {
      newsStepLocked = false;
    }, STEP_LOCK_MS);
    setNewsActiveIndex(newsActiveIndex + direction);
    return true;
  };

  setNewsActiveIndex(newsActiveIndex);

  if (newsTabs && newsTabsTrigger && newsTabButtons.length) {
    newsTabsTrigger.setAttribute("aria-expanded", "false");
    newsTabsTrigger.addEventListener("click", (event) => {
      if (window.innerWidth > NEWS_DROPDOWN_BREAKPOINT) return;
      event.preventDefault();
      const next = !newsTabs.classList.contains("is-expanded");
      newsTabs.classList.toggle("is-expanded", next);
      newsTabsTrigger.setAttribute("aria-expanded", next ? "true" : "false");
    });

  }

  const updateCursor = (event) => {
    if (window.innerWidth <= 480) return;
    const rect = newsGallery.getBoundingClientRect();
    const scale = rect.width / newsGallery.offsetWidth;
    const localX = clamp((event.clientX - rect.left) / scale, 0, newsGallery.offsetWidth);
    const localY = clamp((event.clientY - rect.top) / scale, 0, newsGallery.offsetHeight);
    const isLeftZone = localX < newsGallery.offsetWidth * 0.5;
    newsGallery.classList.add("is-cursor-active");
    newsGallery.classList.toggle("is-left-zone", isLeftZone);
    newsGallery.classList.toggle("is-right-zone", !isLeftZone);
    if (newsCursor) {
      newsCursor.style.setProperty("left", `${localX}px`);
      newsCursor.style.setProperty("top", `${localY}px`);
    }
  };

  newsGallery.addEventListener("pointerenter", updateCursor);
  newsGallery.addEventListener("pointermove", updateCursor);
  newsGallery.addEventListener("pointerleave", () => {
    newsGallery.classList.remove("is-cursor-active", "is-left-zone", "is-right-zone");
  });

  let pointerActive = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let lastSwipeAt = 0;
  const swipeThresholdPx = 32;
  const swipeClickSuppressMs = 420;

  newsGallery.addEventListener("pointerdown", (event) => {
    if (window.innerWidth > 480 || event.pointerType === "mouse") return;
    pointerActive = true;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  });

  newsGallery.addEventListener("pointerup", (event) => {
    if (!pointerActive) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    if (Math.abs(dx) >= swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) {
      if (stepNewsGallery(dx < 0 ? 1 : -1)) {
        lastSwipeAt = Date.now();
      }
    }
    pointerActive = false;
  });

  newsGallery.addEventListener("pointercancel", () => {
    pointerActive = false;
  });

  newsGallery.addEventListener("click", (event) => {
    if (window.innerWidth <= 480 && Date.now() - lastSwipeAt < swipeClickSuppressMs) return;
    const rect = newsGallery.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    stepNewsGallery(localX < rect.width * 0.5 ? -1 : 1);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > NEWS_DROPDOWN_BREAKPOINT && newsTabs?.classList.contains("is-expanded")) {
      newsTabs.classList.remove("is-expanded");
      newsTabsTrigger?.setAttribute("aria-expanded", "false");
    }
    if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT && newsTabsDropdown) {
      newsTabsDropdown.scrollTop = 0;
    }
    setNewsActiveIndex(newsActiveIndex);
  });
}

function initReviewsSliders() {
  const reviewsFeedbackStage = document.getElementById("reviewsFeedbackStage");
  const reviewsFeedbackCards = [...document.querySelectorAll("[data-feedback-card]")];
  const reviewsFeedbackPrev = document.querySelector(".reviews-feedback-nav-left");
  const reviewsFeedbackNext = document.querySelector(".reviews-feedback-nav-right");
  const reviewsGratitudeGallery = document.getElementById("reviewsGratitudeGallery");
  const reviewsGratitudeCursor = document.getElementById("reviewsGratitudeCursor");
  const reviewsGratitudeCards = [...document.querySelectorAll("[data-gratitude-card]")];
  const STEP_LOCK_MS = 820;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  let reviewsFeedbackActiveIndex = 0;
  let reviewsFeedbackStepLocked = false;
  let reviewsFeedbackStepUnlockTimer = 0;
  const FEEDBACK_CAROUSEL_LOCK_MS = 560;
  const reviewsFeedbackList = reviewsFeedbackStage?.querySelector(".reviews-feedback-list");

  const signedFeedbackDistance = (index, center, total) => {
    let d = index - center;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    return d;
  };

  const layoutReviewsFeedbackCarousel = () => {
    if (!reviewsFeedbackList || !reviewsFeedbackCards.length) return;
    reviewsFeedbackList.classList.add("reviews-feedback-3d");
    const total = reviewsFeedbackCards.length;
    const stageRect = reviewsFeedbackStage.getBoundingClientRect();
    let w = reviewsFeedbackList.clientWidth || reviewsFeedbackList.offsetWidth;
    let h = reviewsFeedbackList.clientHeight || reviewsFeedbackList.offsetHeight;
    if (w < 40 || h < 40) {
      w = Math.max(stageRect.width, Math.min(window.innerWidth, 1920) * 0.72, 360);
      h = Math.max(stageRect.height, window.innerHeight * 0.5, 420);
    }

    const aspect = 805.19 / 842.64;
    const centerW = Math.min(842.64, w * 0.46);
    const centerH = centerW * aspect;
    const maxR = Math.min(3, Math.floor(total / 2));

    reviewsFeedbackCards.forEach((card, index) => {
      const d = signedFeedbackDistance(index, reviewsFeedbackActiveIndex, total);
      const ad = Math.abs(d);
      const sign = d === 0 ? 0 : d > 0 ? 1 : -1;

      card.classList.remove(
        "is-center",
        "is-left-1",
        "is-left-2",
        "is-left-3",
        "is-right-1",
        "is-right-2",
        "is-right-3",
        "is-hidden",
      );

      if (ad > maxR) {
        card.style.left = "50%";
        card.style.top = "50%";
        card.style.width = `${centerW}px`;
        card.style.height = `${centerH}px`;
        card.style.opacity = "0";
        card.style.visibility = "hidden";
        card.style.pointerEvents = "none";
        card.style.transform = "translate3d(-50%, -50%, -420px) scale(0.28)";
        card.style.filter = "none";
        card.style.zIndex = "0";
        card.setAttribute("aria-hidden", "true");
        card.alt = "";
        return;
      }

      const scale = Math.max(0.34, Math.pow(0.82, ad));
      const tz = -ad * 108;
      const gap0 = w * 0.19;
      let txAbs = 0;
      for (let k = 1; k <= ad; k += 1) {
        txAbs += gap0 * Math.pow(0.87, k - 1);
      }
      const tx = sign * txAbs;
      const ty = ad * 10;

      card.style.left = "50%";
      card.style.top = "50%";
      card.style.width = `${centerW}px`;
      card.style.height = `${centerH}px`;
      card.style.opacity = "1";
      card.style.visibility = "visible";
      card.style.pointerEvents = "auto";
      card.style.transformOrigin = "50% 50%";
      card.style.transform = `translate3d(calc(-50% + ${tx}px), calc(-50% + ${ty}px), ${tz}px) scale(${scale})`;
      card.style.filter = "none";
      card.style.zIndex = String(36 - ad);
      card.style.cursor = ad === 0 ? "default" : "pointer";

      if (ad === 0) {
        card.setAttribute("aria-hidden", "false");
        card.alt = card.dataset.feedbackLabel || "";
      } else {
        card.setAttribute("aria-hidden", "true");
        card.alt = "";
      }
    });
  };

  const stepReviewsFeedbackCarousel = (direction) => {
    if (!direction || reviewsFeedbackStepLocked || reviewsFeedbackCards.length < 2) return false;
    reviewsFeedbackStepLocked = true;
    const total = reviewsFeedbackCards.length;
    reviewsFeedbackActiveIndex = (reviewsFeedbackActiveIndex + direction + total) % total;
    layoutReviewsFeedbackCarousel();
    window.clearTimeout(reviewsFeedbackStepUnlockTimer);
    reviewsFeedbackStepUnlockTimer = window.setTimeout(() => {
      reviewsFeedbackStepLocked = false;
    }, FEEDBACK_CAROUSEL_LOCK_MS);
    return true;
  };

  const goToFeedbackSlide = (index) => {
    if (reviewsFeedbackStepLocked || !reviewsFeedbackCards.length) return;
    const total = reviewsFeedbackCards.length;
    const target = ((index % total) + total) % total;
    if (target === reviewsFeedbackActiveIndex) return;
    reviewsFeedbackStepLocked = true;
    reviewsFeedbackActiveIndex = target;
    layoutReviewsFeedbackCarousel();
    window.clearTimeout(reviewsFeedbackStepUnlockTimer);
    reviewsFeedbackStepUnlockTimer = window.setTimeout(() => {
      reviewsFeedbackStepLocked = false;
    }, FEEDBACK_CAROUSEL_LOCK_MS);
  };

  if (reviewsFeedbackStage && reviewsFeedbackList && reviewsFeedbackCards.length) {
    layoutReviewsFeedbackCarousel();

    reviewsFeedbackPrev?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      stepReviewsFeedbackCarousel(-1);
    }, { capture: true });
    reviewsFeedbackNext?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      stepReviewsFeedbackCarousel(1);
    }, { capture: true });

    const swipeClickSuppressMs = 380;
    let feedbackLastSwipeAt = 0;
    reviewsFeedbackList.addEventListener("click", (event) => {
      if (Date.now() - feedbackLastSwipeAt < swipeClickSuppressMs) return;
      const img = event.target.closest("[data-feedback-card]");
      if (!img || !reviewsFeedbackList.contains(img)) return;
      const idx = reviewsFeedbackCards.indexOf(img);
      if (idx < 0) return;
      const dist = signedFeedbackDistance(idx, reviewsFeedbackActiveIndex, reviewsFeedbackCards.length);
      if (dist === 0) return;
      goToFeedbackSlide(idx);
    });

    const swipeThresholdPx = 40;
    let feedbackPointerActive = false;
    let feedbackPointerStartX = 0;
    let feedbackPointerStartY = 0;

    reviewsFeedbackList.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      feedbackPointerActive = true;
      feedbackPointerStartX = event.clientX;
      feedbackPointerStartY = event.clientY;
    });
    reviewsFeedbackList.addEventListener("pointerup", (event) => {
      if (!feedbackPointerActive) return;
      const dx = event.clientX - feedbackPointerStartX;
      const dy = event.clientY - feedbackPointerStartY;
      if (Math.abs(dx) >= swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) {
        if (stepReviewsFeedbackCarousel(dx < 0 ? 1 : -1)) {
          feedbackLastSwipeAt = Date.now();
        }
      }
      feedbackPointerActive = false;
    });
    reviewsFeedbackList.addEventListener("pointercancel", () => {
      feedbackPointerActive = false;
    });

    const scheduleFeedbackLayout = () => {
      window.requestAnimationFrame(() => {
        layoutReviewsFeedbackCarousel();
        window.requestAnimationFrame(() => layoutReviewsFeedbackCarousel());
      });
    };
    window.addEventListener("resize", scheduleFeedbackLayout, { passive: true });
    window.addEventListener("reviews:tabchange", (event) => {
      if (event.detail?.tab === "feedback") scheduleFeedbackLayout();
    });

    if (typeof ResizeObserver !== "undefined") {
      const feedbackResizeObserver = new ResizeObserver(() => scheduleFeedbackLayout());
      feedbackResizeObserver.observe(reviewsFeedbackList);
      feedbackResizeObserver.observe(reviewsFeedbackStage);
    }
  }

  let reviewsGratitudeActiveIndex = 0;
  let reviewsGratitudeStepLocked = false;
  let reviewsGratitudeStepUnlockTimer = 0;

  const renderReviewsGratitudeCarousel = () => {
    if (!reviewsGratitudeCards.length) return;
    const total = reviewsGratitudeCards.length;
    const stateClasses = ["is-left-edge", "is-main-left", "is-main-right", "is-right-edge"];
    reviewsGratitudeCards.forEach((card, index) => {
      const slot = ((index - reviewsGratitudeActiveIndex) % total + total) % total;
      card.classList.remove(...stateClasses);
      card.classList.add(stateClasses[slot]);
      card.setAttribute("aria-hidden", slot > 1 ? "true" : "false");
    });
  };

  const stepReviewsGratitudeCarousel = (direction) => {
    if (!direction || reviewsGratitudeStepLocked || reviewsGratitudeCards.length < 2) return false;
    reviewsGratitudeStepLocked = true;
    const total = reviewsGratitudeCards.length;
    reviewsGratitudeActiveIndex = ((reviewsGratitudeActiveIndex + direction) % total + total) % total;
    renderReviewsGratitudeCarousel();
    window.clearTimeout(reviewsGratitudeStepUnlockTimer);
    reviewsGratitudeStepUnlockTimer = window.setTimeout(() => {
      reviewsGratitudeStepLocked = false;
    }, STEP_LOCK_MS);
    return true;
  };

  if (reviewsGratitudeGallery && reviewsGratitudeCards.length) {
    renderReviewsGratitudeCarousel();
    const swipeThresholdPx = 36;
    const swipeClickSuppressMs = 400;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerActive = false;
    let lastSwipeAt = 0;

    const releasePointer = (event) => {
      if (typeof reviewsGratitudeGallery.releasePointerCapture === "function" && reviewsGratitudeGallery.hasPointerCapture?.(event.pointerId)) {
        reviewsGratitudeGallery.releasePointerCapture(event.pointerId);
      }
    };

    const updateCursor = (event) => {
      const rect = reviewsGratitudeGallery.getBoundingClientRect();
      const localX = clamp(event.clientX - rect.left, 0, rect.width);
      const localY = clamp(event.clientY - rect.top, 0, rect.height);
      const isLeftZone = localX < rect.width * 0.5;
      reviewsGratitudeGallery.classList.add("is-cursor-active");
      reviewsGratitudeGallery.classList.toggle("is-left-zone", isLeftZone);
      reviewsGratitudeGallery.classList.toggle("is-right-zone", !isLeftZone);
      reviewsGratitudeCursor?.style.setProperty("left", `${localX}px`);
      reviewsGratitudeCursor?.style.setProperty("top", `${localY}px`);
    };

    reviewsGratitudeGallery.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerActive = true;
      if (typeof reviewsGratitudeGallery.setPointerCapture === "function") {
        reviewsGratitudeGallery.setPointerCapture(event.pointerId);
      }
      updateCursor(event);
    });
    reviewsGratitudeGallery.addEventListener("pointerenter", updateCursor);
    reviewsGratitudeGallery.addEventListener("pointermove", (event) => {
      updateCursor(event);
      if (!pointerActive) return;
      const dx = event.clientX - pointerStartX;
      const dy = event.clientY - pointerStartY;
      if (Math.abs(dx) < swipeThresholdPx || Math.abs(dx) <= Math.abs(dy)) return;
      if (stepReviewsGratitudeCarousel(dx < 0 ? 1 : -1)) {
        lastSwipeAt = Date.now();
      }
      pointerActive = false;
      releasePointer(event);
    });
    reviewsGratitudeGallery.addEventListener("pointerleave", () => {
      reviewsGratitudeGallery.classList.remove("is-cursor-active", "is-left-zone", "is-right-zone");
    });
    reviewsGratitudeGallery.addEventListener("pointerup", (event) => {
      if (!pointerActive) return;
      pointerActive = false;
      releasePointer(event);
    });
    reviewsGratitudeGallery.addEventListener("pointercancel", (event) => {
      pointerActive = false;
      releasePointer(event);
    });
    reviewsGratitudeGallery.addEventListener("click", (event) => {
      if (Date.now() - lastSwipeAt < swipeClickSuppressMs) return;
      const rect = reviewsGratitudeGallery.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      stepReviewsGratitudeCarousel(localX < rect.width * 0.5 ? -1 : 1);
    });
  }
}

function initReviewsTabs() {
  const reviewsScreen = document.getElementById("reviewsScreen");
  const reviewsTabs = [...document.querySelectorAll(".reviews-media-tab[data-reviews-tab]")];
  const reviewsOfficialStage = document.getElementById("reviewsOfficialStage");
  const reviewsGratitudeStage = document.querySelector(".reviews-media-stage-gratitude");
  const reviewsFeedbackStage = document.getElementById("reviewsFeedbackStage");
  if (!reviewsScreen || !reviewsTabs.length) return;

  const setTab = (tabName) => {
    const state = tabName === "feedback" || tabName === "gratitude" ? tabName : "official";
    reviewsScreen.dataset.reviewsTab = state;

    const isOfficial = state === "official";
    const isGratitude = state === "gratitude";
    const isFeedback = state === "feedback";

    if (reviewsOfficialStage) {
      reviewsOfficialStage.hidden = !isOfficial;
      reviewsOfficialStage.style.display = isOfficial ? "" : "none";
      reviewsOfficialStage.setAttribute("aria-hidden", isOfficial ? "false" : "true");
    }
    if (reviewsGratitudeStage) {
      reviewsGratitudeStage.hidden = !isGratitude;
      reviewsGratitudeStage.style.display = isGratitude ? "" : "none";
      reviewsGratitudeStage.setAttribute("aria-hidden", isGratitude ? "false" : "true");
    }
    if (reviewsFeedbackStage) {
      reviewsFeedbackStage.hidden = !isFeedback;
      reviewsFeedbackStage.style.display = isFeedback ? "" : "none";
      reviewsFeedbackStage.setAttribute("aria-hidden", isFeedback ? "false" : "true");
    }

    reviewsTabs.forEach((tab) => {
      const isActive = tab.dataset.reviewsTab === state;
      tab.classList.toggle("is-active", isActive);
      tab.classList.toggle("reviews-media-tab-active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    window.dispatchEvent(new CustomEvent("reviews:tabchange", { detail: { tab: state } }));
  };

  reviewsTabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.reviewsTab || "official"));
  });

  setTab(reviewsScreen.dataset.reviewsTab || "official");
}

function initReviewsOfficialScrollEffect() {
  const reviewsScreen = document.getElementById("reviewsScreen");
  const stage = document.getElementById("reviewsOfficialStage");
  if (!stage || !reviewsScreen) return;

  const slides = stage.querySelectorAll(".reviews-slide");
  if (!slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  const isReviewsMobileStack = () =>
    window.innerWidth <= 1200 ||
    document.documentElement.clientWidth <= 1200 ||
    window.matchMedia("(max-width: 1200px)").matches;

  function initMobileStackState() {
    currentSlide = 0;
    slides.forEach((slide) => {
      slide.classList.remove("active");
      slide.style.opacity = "";
      slide.style.filter = "";
      slide.style.transform = "";
      slide.style.pointerEvents = "";
    });
  }

  function initDesktopStackState() {
    slides.forEach((s, i) => s.classList.toggle("active", i === 0));
    currentSlide = 0;
    slides.forEach((slide, index) => {
      const portrait = slide.querySelector(".reviews-portrait-img");
      const letter = slide.querySelector(".reviews-letter-img");
      const person = slide.querySelector(".reviews-person-info");
      const frame = slide.querySelector(".reviews-letter-frame");
      if (frame) {
        frame.style.transformOrigin = "";
        frame.style.transform = "";
      }
      if (index === 0) {
        if (portrait) portrait.style.transform = "translateY(0)";
        if (letter) letter.style.transform = "scale(1)";
        if (person) {
          person.style.transform = "translateY(0)";
          person.style.opacity = "1";
        }
      } else {
        if (portrait) portrait.style.transform = "translateY(100%)";
        if (letter) letter.style.transform = "scale(0)";
        if (person) {
          person.style.transform = "translateY(0)";
          person.style.opacity = "1";
        }
      }
    });
  }

  if (isReviewsMobileStack()) initMobileStackState();
  else initDesktopStackState();

  function handleScroll() {
    if (reviewsScreen.dataset.reviewsTab !== "official") return;

    if (isReviewsMobileStack()) {
      slides.forEach((slide) => {
        slide.style.opacity = "";
        slide.style.filter = "";
        slide.style.transform = "";
        slide.style.pointerEvents = "";
      });
      return;
    }

    const rect = reviewsScreen.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = reviewsScreen.offsetHeight;
    if (rect.bottom < 0 || rect.top > windowHeight) return;

    const maxScroll = Math.max(1, sectionHeight - windowHeight);
    const currentScroll = Math.max(0, -rect.top);

    let scrollProgress;
    if (currentScroll < maxScroll * 0.1) {
      scrollProgress = 0;
    } else {
      const animatedScroll = currentScroll - maxScroll * 0.1;
      const animatedMaxScroll = maxScroll * 0.9;
      scrollProgress = Math.min(3, (animatedScroll / animatedMaxScroll) * 2 + 1);
    }

    const textScrollProgress = Math.min(3, (currentScroll / maxScroll) * 3);
    const textSlide = Math.min(Math.floor(textScrollProgress), totalSlides - 1);
    const textLocalProgress = Math.min(1, textScrollProgress - textSlide);

    const targetSlide = Math.min(Math.floor(scrollProgress), totalSlides - 1);
    const localProgress = Math.min(1, scrollProgress - targetSlide);

    if (targetSlide !== currentSlide) {
      slides.forEach((s) => s.classList.remove("active"));
      if (slides[targetSlide]) slides[targetSlide].classList.add("active");
      currentSlide = targetSlide;
    }

    if (currentSlide === 0) {
      const firstSlide = slides[0];
      const portrait = firstSlide.querySelector(".reviews-portrait-img");
      const letter = firstSlide.querySelector(".reviews-letter-img");
      if (portrait) portrait.style.transform = "translateY(0)";
      if (letter) letter.style.transform = "scale(1)";

      if (slides[1]) {
        const nextPortrait = slides[1].querySelector(".reviews-portrait-img");
        const nextLetter = slides[1].querySelector(".reviews-letter-img");
        if (nextPortrait) nextPortrait.style.transform = "translateY(100%)";
        if (nextLetter) nextLetter.style.transform = "scale(0)";
      }
    }

    if (currentSlide > 0) {
      const activeSlide = slides[currentSlide];
      const portrait = activeSlide.querySelector(".reviews-portrait-img");
      const letter = activeSlide.querySelector(".reviews-letter-img");
      const frame = activeSlide.querySelector(".reviews-letter-frame");

      if (portrait) {
        const portraitY = (1 - localProgress) * 100;
        portrait.style.transform = `translateY(${portraitY}%)`;
      }
      if (letter) {
        const letterScale = localProgress;
        letter.style.transform = `scale(${letterScale})`;
      }
      if (frame) {
        const frameScale = localProgress;
        frame.style.transformOrigin = "50.25% 45%";
        frame.style.transform = `scale(${frameScale})`;
      }

      for (let i = currentSlide + 1; i < totalSlides; i += 1) {
        const nextSlide = slides[i];
        const nextPortrait = nextSlide.querySelector(".reviews-portrait-img");
        const nextLetter = nextSlide.querySelector(".reviews-letter-img");
        if (nextPortrait) nextPortrait.style.transform = "translateY(100%)";
        if (nextLetter) nextLetter.style.transform = "scale(0)";
      }
    }

    slides.forEach((slide, index) => {
      const slidePerson = slide.querySelector(".reviews-person-info");
      if (!slidePerson) return;

      if (index < textSlide) {
        slidePerson.style.transform = "translateY(-800px)";
        slidePerson.style.opacity = "0";
      } else if (index === textSlide) {
        let personY;
        let personOpacity;
        if (textLocalProgress < 0.5) {
          personY = (1 - textLocalProgress * 2) * 200;
          personOpacity = 1;
        } else {
          const exitProgress = (textLocalProgress - 0.5) * 2;
          personY = -exitProgress * 800;
          personOpacity = Math.max(0, 1 - exitProgress * 1.5);
        }
        slidePerson.style.transform = `translateY(${personY}px)`;
        slidePerson.style.opacity = String(personOpacity);
      } else {
        slidePerson.style.transform = "translateY(200px)";
        slidePerson.style.opacity = "0";
      }
    });
  }

  window.addEventListener("resize", () => {
    if (isReviewsMobileStack()) initMobileStackState();
    else initDesktopStackState();
    handleScroll();
  }, { passive: true });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("reviews:tabchange", () => {
    requestAnimationFrame(handleScroll);
  });

  handleScroll();
  requestAnimationFrame(() => handleScroll());
  setTimeout(() => handleScroll(), 250);
}

// Initialize interview on page load
document.addEventListener("DOMContentLoaded", () => {
  initInterviewInteractions();
  initInterviewDots();
  initInterviewPeriods();
  initNewsGallery();
  initReviewsSliders();
  initReviewsTabs();
  initReviewsOfficialScrollEffect();
});

// ============================================
// MEDIA LIBRARY 3D CAROUSEL
// ============================================

function initMediaLibCarousel() {
  const carousel = document.getElementById('mediaLibCarousel');
  if (!carousel) return;

  const rings = [
    document.getElementById('mediaLibRing0'),
    document.getElementById('mediaLibRing1'),
    document.getElementById('mediaLibRing2'),
  ].filter(Boolean);
  if (!rings.length) return;

  let currentAngle = 0;

  function getSlideParams() {
    const vw = window.innerWidth;
    const isMobile = vw <= 1200;
    return {
      slideWidth: Math.round(vw * (isMobile ? 0.58 : 0.35)),
      gap: Math.round(vw * (isMobile ? 0.16 : 0.02)),
    };
  }

  function initRing(ring, rowIndex) {
    const slides = [...ring.querySelectorAll('.media-lib-slide')];
    const n = slides.length;
    const { slideWidth, gap } = getSlideParams();
    const slideHeight = Math.round(window.innerHeight * 0.25);
    const theta = 360 / n;
    const radius = Math.round(((slideWidth + gap) / 2) / Math.tan(Math.PI / n));
    const phaseOffset = rowIndex === 1 ? theta / 2 : 0;

    slides.forEach((slide, i) => {
      slide.style.width = slideWidth + 'px';
      slide.style.marginLeft = `-${slideWidth / 2}px`;
      slide.style.marginTop = `-${slideHeight / 2}px`;
      slide.style.transform = `rotateY(${theta * i + phaseOffset}deg) translateZ(${radius}px)`;
    });

    return { slides, n, theta, radius, phaseOffset };
  }

  const ringData = rings.map((ring, i) => initRing(ring, i));

  function updateAll() {
    rings.forEach((ring, ri) => {
      const { slides, n, theta, radius, phaseOffset } = ringData[ri];
      ring.style.transform = `rotateY(${currentAngle}deg)`;

      let activeIndex = Math.round((currentAngle + phaseOffset) / theta) * -1;
      activeIndex = ((activeIndex % n) + n) % n;

      slides.forEach((slide, i) => {
        let dist = Math.abs(i - activeIndex);
        dist = Math.min(dist, n - dist);
        const base = `rotateY(${theta * i + phaseOffset}deg) translateZ(${radius}px)`;
        const maxDist = Math.floor(n / 2);
        const isFar = dist > maxDist / 2;
        const opacity = isFar ? Math.max(0.45, 1 - (dist / maxDist) * 0.55) : Math.max(0.75, 1 - (dist / maxDist) * 0.25);
        slide.style.opacity = opacity.toFixed(2);
        slide.style.transform = base;
      });
    });
  }

  updateAll();

  let velocity = 0;
  let isDragging = false;
  let lastX = 0;
  let lastTime = 0;
  let rafId = 0;

  const AUTO_SPEED = 0.08;

  function spin() {
    if (isDragging) return;
    if (Math.abs(velocity) > 0.01) {
      currentAngle += velocity;
      velocity *= 0.94;
    } else {
      velocity = 0;
      currentAngle += AUTO_SPEED;
    }
    updateAll();
    rafId = requestAnimationFrame(spin);
  }

  carousel.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastTime = performance.now();
    velocity = 0;
    cancelAnimationFrame(rafId);
    carousel.setPointerCapture(e.pointerId);
  });

  carousel.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dt = now - lastTime || 1;
    const { theta } = ringData[0];
    const { slideWidth, gap } = getSlideParams();
    const degPerPx = theta / (slideWidth + gap);
    currentAngle += dx * degPerPx;
    velocity = dx * degPerPx * (16 / dt);
    lastX = e.clientX;
    lastTime = now;
    updateAll();
  });

  carousel.addEventListener('pointerup', () => {
    isDragging = false;
    rafId = requestAnimationFrame(spin);
  });

  carousel.addEventListener('pointercancel', () => {
    isDragging = false;
    rafId = requestAnimationFrame(spin);
  });

  rafId = requestAnimationFrame(spin);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      rings.forEach((ring, i) => { ringData[i] = initRing(ring, i); });
      updateAll();
    }, 200);
  });
}

// Initialize media library carousel
initMediaLibCarousel();

// ============================================
// VIDEOTEKA TABS WRAPPER
// ============================================

function initVideotekaTabs() {
  const tabs = document.querySelector('.videoteka-tabs');
  if (!tabs) return;

  const title = tabs.querySelector('.videoteka-title-mobile');
  const buttons = Array.from(tabs.querySelectorAll('.videoteka-tab'));
  
  if (!title || !buttons.length) return;

  // Create wrapper for buttons
  const wrapper = document.createElement('div');
  wrapper.className = 'videoteka-tabs-wrapper';
  
  // Move buttons to wrapper
  buttons.forEach(btn => wrapper.appendChild(btn));
  
  // Append wrapper after title
  tabs.appendChild(wrapper);
}

// Initialize videoteka tabs
if (document.querySelector('.videoteka-tabs')) {
  initVideotekaTabs();
}

// ============================================
// FOOTER ACCORDION
// ============================================

function initFooterAccordion() {
  const footerColumns = document.querySelectorAll('.footer-column');
  
  if (!footerColumns.length) return;

  footerColumns.forEach((column) => {
    const title = column.querySelector('.footer-column-title');
    if (!title) return;

    title.setAttribute('tabindex', '0');
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', 'false');
    column.classList.remove('is-open');

    const toggle = () => {
      if (window.innerWidth > 1200) return;
      
      const isOpen = column.classList.contains('is-open');
      
      // Close all columns
      footerColumns.forEach((item) => {
        item.classList.remove('is-open');
        const itemTitle = item.querySelector('.footer-column-title');
        if (itemTitle) itemTitle.setAttribute('aria-expanded', 'false');
      });

      // Open clicked column if it was closed
      if (!isOpen) {
        column.classList.add('is-open');
        title.setAttribute('aria-expanded', 'true');
      }
    };

    title.addEventListener('click', toggle);
    title.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggle();
    });
  });
}

// Initialize footer accordion
if (document.querySelector('.footer-column')) {
  initFooterAccordion();
}

function initSiteMenu() {
  const menu = document.getElementById("siteMenuPanel");
  const openButton = document.getElementById("pageMenuToggle");
  if (!menu || !openButton) return;

  const closeButtons = [...menu.querySelectorAll("[data-site-menu-close]")];
  const accordionButtons = [...menu.querySelectorAll("[data-site-menu-group]")];
  const menuGroups = [...menu.querySelectorAll(".site-menu__group")];

  const closeMenu = () => {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    openButton.setAttribute("aria-expanded", "false");
    openButton.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("site-menu-open");
  };

  const openMenu = () => {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    openButton.setAttribute("aria-expanded", "true");
    openButton.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("site-menu-open");
  };

  openButton.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) {
      closeMenu();
      return;
    }
    openMenu();
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeMenu);
  });

  accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-site-menu-group");
      if (!targetId) return;
      const targetGroup = document.getElementById(targetId);
      if (!targetGroup) return;

      const isExpanded = targetGroup.classList.contains("is-expanded");
      menuGroups.forEach((group) => group.classList.remove("is-expanded"));
      if (!isExpanded) targetGroup.classList.add("is-expanded");
    });
  });

  menu.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".site-menu__submenu-link, .site-menu__btn")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSiteMenu);
} else {
  initSiteMenu();
}

function initMediaBookClickZones() {
  const mediaBookFrame = document.getElementById("mediaBookFrame");
  const hitPrev = document.getElementById("mediaBookHitPrev");
  const hitNext = document.getElementById("mediaBookHitNext");
  if (!mediaBookFrame || !hitPrev || !hitNext) return;

  const sendToBook = (action) => {
    mediaBookFrame.contentWindow?.postMessage(action, "*");
  };

  hitPrev.addEventListener("click", () => sendToBook("book:prev"));
  hitNext.addEventListener("click", () => sendToBook("book:next"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMediaBookClickZones);
} else {
  initMediaBookClickZones();
}
