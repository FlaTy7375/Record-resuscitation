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
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

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

// Initialize interview on page load
document.addEventListener("DOMContentLoaded", () => {
  initInterviewInteractions();
  initInterviewDots();
  initInterviewPeriods();
  initNewsGallery();
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
