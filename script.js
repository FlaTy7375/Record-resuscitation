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
  const swiper = new window.Swiper(salesGalleryMain, {
    slidesPerView: "auto",
    spaceBetween: 30,
    speed: 1100,
    loop: false,
    centeredSlides: false,
    slidesOffsetAfter: 100,
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
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0,
        centeredSlides: true,
        slidesOffsetAfter: 0,
      },
      1201: {
        slidesPerView: "auto",
        spaceBetween: 30,
        centeredSlides: false,
        slidesOffsetAfter: 100,
      }
    },
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

// Initialize interview on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initInterviewInteractions();
    initInterviewDots();
    initInterviewPeriods();
  });
} else {
  initInterviewInteractions();
  initInterviewDots();
  initInterviewPeriods();
}
