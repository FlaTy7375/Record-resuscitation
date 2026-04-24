// Масштабирование страницы пропорционально ширине экрана (только >1200px)
(function applyPageScale() {
  let lastWidth = window.innerWidth;
  // Запоминаем изначальную высоту для мобилок, чтобы она не прыгала
  let initialMobileHeight = window.innerHeight;

  function updateScale() {
    const w = window.innerWidth;
    
    if (w >= 1200) {
      const scale = Math.min(1, w / 1920);
      document.documentElement.style.zoom = scale;
      const compensatedVh = (window.innerHeight / scale) + 'px';
      document.documentElement.style.setProperty('--real-vh', compensatedVh);
    } else {
      document.documentElement.style.zoom = '';
      
      // Если ширина не изменилась (просто скрылась адресная строка), не обновляем высоту
      if (w === lastWidth && document.documentElement.style.getPropertyValue('--real-vh')) {
          return;
      }
      
      // Если перевернули телефон - берем новую высоту
      if (w !== lastWidth) {
          initialMobileHeight = window.innerHeight;
      }
      
      document.documentElement.style.setProperty('--real-vh', initialMobileHeight + 'px');
    }
    lastWidth = w;
  }
  
  updateScale();
  window.addEventListener('resize', updateScale, { passive: true });
})();

// Показываем блок статуи после инициализации JS
document.body.classList.add('js-ready');

// Глобальная функция получения текущего scale для JS-расчетов
// Глобальная функция получения текущего scale для JS-расчетов
function getPageScale() {
  const zoomVal = document.documentElement.style.zoom;
  if (zoomVal) {
    const scale = parseFloat(zoomVal);
    if (!isNaN(scale) && scale > 0) return scale;
  }
  return 1;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Одно слово: буква О в .sales-title-o (только если есть буква О в слове). */
function buildSingleWordSalesTitleRow(word) {
  const raw = String(word || "").trim();
  if (!raw) {
    return "";
  }
  if (raw.toLowerCase() === "продажи") {
    return '<span class="sales-title-part sales-title-part-left">пр</span><span class="sales-title-o">o</span><span class="sales-title-part sales-title-part-right">дажи</span>';
  }
  const chars = [...raw];
  if (chars.length === 1) {
    return `<span class="sales-title-part sales-title-part-left">${escapeHtml(chars[0])}</span>`;
  }
  // Ищем букву О/о/o в слове
  const oIndex = chars.findIndex(c => c === 'О' || c === 'о' || c === 'o' || c === 'O');
  if (oIndex === -1) {
    // Нет буквы О — выводим без искажений
    return `<span class="sales-title-part sales-title-part-left">${escapeHtml(raw)}</span>`;
  }
  const left = chars.slice(0, oIndex).join("");
  const mid = chars[oIndex];
  const right = chars.slice(oIndex + 1).join("");
  return `<span class="sales-title-part sales-title-part-left">${escapeHtml(left)}</span><span class="sales-title-o">${escapeHtml(mid)}</span><span class="sales-title-part sales-title-part-right">${escapeHtml(right)}</span>`;
}

/**
 * Заголовок слайда: строка (одно слово) или массив из 1–2 односложных строк (например СТАТУС + ИНФОПОВОД).
 */
function buildSalesTitleMarkup(title) {
  if (Array.isArray(title)) {
    const rows = title.map((w) => buildSingleWordSalesTitleRow(w)).filter(Boolean);
    if (!rows.length) {
      return "";
    }
    return `<span class="sales-title-stack">${rows.map((r) => `<span class="sales-title-line">${r}</span>`).join("")}</span>`;
  }
  return buildSingleWordSalesTitleRow(title);
}

/**
 * Слайды блока `.sales-top-layout-wrapp--before-sales` в index.html.
 * Здесь меняются: title (заголовок), main (путь к картинке), copy (текст под заголовком, HTML допускается).
 */
const BEFORE_SALES_SLIDES = [
  {
    title: "продажи",
    main: "./assets/sal1.jpg",
    copy: "Ваш проект попадает в рекламную орбиту премии с момента подачи заявки. Это не просто упоминание после церемонии — это полноценная анонсирующая кампания: публикации в крупнейших федеральных и деловых отраслевых СМИ, информационных агентствах, наружная реклама в Москве и регионах, эфиры на крупнейших радиостанциях, ежегодный путеводитель в журнале Forbes. Более 100 каналов продвижения работают на ваш объект.",
  },
  {
    title: "статус",
    main: "./assets/sal2.jpg",
    copy: "Статус номинанта «Рекордов» — сигнал рынку: этот проект прошёл трёхэтапное голосование покупателей, жюри и 600 профессионалов отрасли. Это репутация, которая формируется через признание рынка.",
  },
  {
    title: "ИНФОПОВОД",
    main: "./assets/sal3.jpg",
    copy: "Номинация на премию — готовый контент для ваших каналов: пресс-релиз, публикации, фото- и видеоматериалы с церемонии. Сильный информационный повод, который генерирует входящий трафик без дополнительного бюджета.",
  },
];

// Ceremonia Slider Configuration
const CEREMONIA_SLIDES = [
  {
    title: null,
    main: "./assets/ceremonia1.jpg",
    hostName: "Ксения Собчак",
    copy: "Самая медийная личность страны и главный трендсеттер. Её знают все, кто будет в зале, — и нет ведущей, равной ей по масштабу.<br><br>Своё СМИ, репутация одного из лучших интервьюеров поколения, безупречный вкус в моде. Когда Ксения на сцене, вечер автоматически становится событием.",
  },
  {
    title: null,
    main: "./assets/ceremonia2.jpg",
    mainMobile: "./assets/пряников.png",
    hostName: "Александр Пряников",
    copy: "Телеведущий и модератор, который умеет держать внимание зала и превращать церемонию в настоящее шоу.<br><br>За плечами — годы работы лицом, ведение премии «Муз-ТВ» и десятков корпоративных событий. Ироничные и остроумные реплики, безупречный темп, профессиональная подача.",
  },
];

// Initialize Sales Slider (each `.sales-top-layout-wrapp` gets its own Swiper)
function initSalesSlider() {
  if (typeof window.Swiper !== "function") {
    console.warn("Sales slider: Swiper library not found");
    return;
  }

  const wrappers = document.querySelectorAll(".sales-top-layout-wrapp");
  if (!wrappers.length) {
    return;
  }

  wrappers.forEach((wrapp) => {
    const salesGalleryMain = wrapp.querySelector(".sales-gallery-main");
    const salesMeta = wrapp.querySelector(".sales-meta");
    const salesCopy = wrapp.querySelector(".sales-copy");
    const isCeremoniaBlock = wrapp.classList.contains('ceremonia');
    const salesMainTitle = isCeremoniaBlock ? null : wrapp.querySelector("h2.sales-title");
    const salesNavPrev = wrapp.querySelector(".sales-nav-prev");
    const salesNavNext = wrapp.querySelector(".sales-nav-next");

    if (!salesGalleryMain || !salesMeta || !salesNavPrev || !salesNavNext) {
      return;
    }

    // Определяем какой массив слайдов использовать
    const isCeremonia = isCeremoniaBlock;
    const slides = isCeremonia ? CEREMONIA_SLIDES.slice() : BEFORE_SALES_SLIDES.slice();
    const wrapper = salesGalleryMain.querySelector(".swiper-wrapper");

    if (!wrapper) {
      console.warn("Sales slider: swiper-wrapper not found");
      return;
    }

    const isMobile = window.innerWidth <= 1200;

    wrapper.innerHTML = slides.map((slide, index) => {
      // Выбираем картинку: если есть mainMobile и мобилка - используем её, иначе main
      const imageSrc = (isMobile && slide.mainMobile) ? slide.mainMobile : slide.main;
      
      return `
    <div class="swiper-slide sales-gallery-slide" data-slide-index="${index}">
      <img
        class="sales-gallery-image"
        src="${imageSrc}"
        alt="Слайд ${index + 1}"
        loading="${index === 0 ? "eager" : "lazy"}"
        decoding="async"
        style="${isCeremonia ? (index === 0 ? 'transform: scale(1.5); transform-origin: top center; object-position: 50% 35%;' : index === 1 ? 'transform: scale(1.75) translateY(-4%); transform-origin: top left; object-position: left 8%;' : '') : ''}"
      />
    </div>
  `;
    }).join("");

    const updateMeta = (index, options = {}) => {
      const animate = options.animate !== false;
      const current = String(index + 1).padStart(2, "0");
      const total = String(slides.length).padStart(2, "0");
      salesMeta.innerHTML = `${current} <span>/ ${total}</span>`;

      salesNavPrev.disabled = index <= 0;
      salesNavNext.disabled = index >= slides.length - 1;

      const slide = slides[index];
      const titleMarkup = slide.title ? buildSalesTitleMarkup(slide.title) : "";
      const hostName = wrapp.querySelector(".ceremonia-host-name");

      const applyContent = () => {
        if (salesCopy && slide.copy) {
          salesCopy.innerHTML = slide.copy;
        }
        if (salesMainTitle && titleMarkup) {
          salesMainTitle.innerHTML = titleMarkup;
        }
        if (hostName && slide.hostName) {
          hostName.textContent = slide.hostName;
        }
      };

      if (!animate) {
        applyContent();
        if (salesCopy) {
          salesCopy.classList.remove("is-fading");
        }
        if (salesMainTitle) {
          salesMainTitle.classList.remove("is-fading");
        }
        return;
      }

      const needsFade = (salesCopy && slide.copy) || (salesMainTitle && titleMarkup);
      if (!needsFade) {
        return;
      }

      if (salesCopy && slide.copy) {
        salesCopy.classList.add("is-fading");
      }
      if (salesMainTitle && titleMarkup) {
        salesMainTitle.classList.add("is-fading");
      }
      window.setTimeout(() => {
        applyContent();
        if (salesCopy) {
          salesCopy.classList.remove("is-fading");
        }
        if (salesMainTitle) {
          salesMainTitle.classList.remove("is-fading");
        }
      }, 250);
    };

    const progressBar = wrapp.querySelector(".sales-slider-progress-bar");
    function updateProgressBar(index) {
      if (!progressBar || !isMobile) return;
      const total = slides.length;
      const segW = 100 / total;
      progressBar.style.marginLeft = `${segW * index}%`;
      progressBar.style.width = `${segW}%`;
    }

    const swiper = new window.Swiper(salesGalleryMain, {
      slidesPerView: isMobile ? 1 : (isCeremoniaBlock ? 1 : 1.15),
      spaceBetween: isMobile ? 0 : (isCeremoniaBlock ? 40 : 20),
      speed: 1100,
      loop: false,
      centeredSlides: isMobile ? true : false,
      slidesOffsetAfter: isMobile ? 0 : (isCeremoniaBlock ? 60 : 0),
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
          updateMeta(instance.activeIndex, { animate: false });
          if (isMobile) updateProgressBar(instance.activeIndex);
        },
        slideChange(instance) {
          updateMeta(instance.activeIndex);
          if (isMobile) updateProgressBar(instance.activeIndex);
        },
      },
    });

    salesGalleryMain.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        swiper.slidePrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        swiper.slideNext();
      }
    });

    salesGalleryMain.tabIndex = 0;
    salesGalleryMain.setAttribute("role", "group");
    salesGalleryMain.setAttribute("aria-label", "Слайдер продаж");

    // Добавляем свайп на весь контейнер для мобильной версии
    if (isMobile) {
      const salesTopLayout = wrapp.querySelector('.sales-top-layout');
      if (salesTopLayout) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;

        salesTopLayout.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        salesTopLayout.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          touchEndY = e.changedTouches[0].screenY;
          
          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;
          
          // Проверяем что горизонтальный свайп больше вертикального
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
              // Свайп вправо - предыдущий слайд
              swiper.slidePrev();
            } else {
              // Свайп влево - следующий слайд
              swiper.slideNext();
            }
          }
        }, { passive: true });
      }
    }
  });
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
// Только ПК (≥1200): плавный скролл колесом. На мобилке Lenis выключен — нативный скролл +
// отдельный потолок шага (см. initMobileDocumentScrollCap), без «липкой» интерполяции.
// ==========================================

const LENIS_LAYOUT_BREAKPOINT = 1200;
let lenis = null;

// Инициализируем Lenis только для десктопа (>= 1200px)
if (typeof Lenis === "function" && window.innerWidth >= LENIS_LAYOUT_BREAKPOINT) {
  lenis = new Lenis({
    wrapper: window,
    content: document.documentElement,
    orientation: "vertical",
    gestureOrientation: "vertical",
    infinite: false,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.6, // Баланс между 0.8 (летает) и 0.4 (туго)
    duration: 1.0,        // Средняя продолжительность инерции
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });
}

/**
 * Один источник правды для вертикального скролла (Lenis или window).
 * При zoom на documentElement нельзя опираться на getBoundingClientRect для progress —
 * смешение с rect ломает «виртуальный» скролл и пошаговые анимации.
 */
function getDocumentScrollY() {
  let sy = 0;
  if (typeof lenis !== "undefined" && lenis && lenis.scroll !== undefined) {
    sy = lenis.scroll;
  } else {
    sy = window.scrollY || document.documentElement.scrollTop || 0;
  }
  // Конвертируем физический скролл в координаты Layout'а
  return sy / getPageScale(); 
}

function getElementDocumentOffsetTop(el) {
  let y = 0;
  let n = el;
  while (n) {
    y += n.offsetTop;
    n = n.offsetParent;
  }
  return y;
}

/**
 * Высота вьюпорта в координатах скролла документа (как для scrollY + «один экран»).
 */
function getScrollViewportHeight() {
  // Забираем значение из нашей стабилизированной CSS переменной на мобилках
  if (window.innerWidth <= 1200) {
      const realVhStr = document.documentElement.style.getPropertyValue('--real-vh');
      if (realVhStr) {
          return parseFloat(realVhStr);
      }
  }

  let vh = window.innerHeight || document.documentElement.clientHeight || 1;
  if (window.visualViewport && Number.isFinite(window.visualViewport.height)) {
    vh = Math.max(1, window.visualViewport.height);
  }
  return vh / getPageScale(); 
}

// Единый цикл отрисовки (RequestAnimationFrame)
function raf(time) {
  if (lenis) {
    lenis.raf(time);
  }
  // Сохраняем вызов твоей функции, так как она была в оригинальном коде
  if (typeof window._updateOrbitPhase === "function") {
    window._updateOrbitPhase();
  }
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ==========================================
// PROMO: липкий блок → ещё ~1 скролл — margin-top + CSS transition к центру → затем карточки.
// ==========================================
// ==========================================
// PROMO: липкий блок → ещё ~1 скролл — margin-top + CSS transition к центру → затем карточки.
// ==========================================
// ==========================================
// PROMO: липкий блок → ещё ~1 скролл — margin-top + CSS transition к центру → затем карточки.
// ==========================================
// ==========================================
// PROMO: жесткая привязка анимации к прогрессу скролла.
// Фаза 1: Текст смещается в центр.
// Фаза 2: Карточки поднимаются снизу вверх через весь блок.
// ==========================================
(function initPromoSection() {
  const promoStage = document.getElementById('promoStage');
  const promoSection = document.getElementById('promoScreen');
  if (!promoStage || !promoSection) return;

  const promoContent = promoStage.querySelector('.promo-content');
  const promoHeader = promoSection.querySelector('.promo-header');
  const promoItems = [...promoStage.querySelectorAll('.promo-content > .promo-item')];

  // КРИТИЧЕСКИ ВАЖНО: отключаем CSS-переходы для заголовка. 
  // Мы управляем позицией напрямую через JS-скролл, transition будет только вызывать лаги.
  if (promoHeader) {
    promoHeader.style.transition = 'none';
  }

  let maxHeaderShiftLayout = 0;

  // Вычисляем статичные метрики один раз (и при ресайзе), чтобы избежать дерганий
  function updateMetrics() {
    if (!promoHeader) return;
    const scale = getPageScale();
    const layoutVh = window.innerHeight / scale;
    // Находим центр заголовка относительно верха секции
    const headerCenterY = promoHeader.offsetTop + (promoHeader.offsetHeight / 2);
    // Центр заголовка — ровно на середине экрана (50% высоты вьюпорта)
    const targetY = layoutVh * 0.5;
    // Считаем, на сколько пикселей нужно сдвинуть заголовок вниз (translateY)
    maxHeaderShiftLayout = Math.max(0, targetY - headerCenterY);
  }

  function applyPromoScroll() {
    const physicalVh = window.innerHeight;
    const scale = getPageScale();
    const layoutVh = physicalVh / scale;

    const rect = promoStage.getBoundingClientRect();
    // Сколько пикселей мы проскроллили от начала блока promoStage
    const scrolledLayout = -rect.top / scale;
    // Общая дистанция "липкого" пути (высота трека минус один экран)
    const trackHeightLayout = promoStage.offsetHeight - layoutVh;

    if (trackHeightLayout <= 0) return;

    // Строгий прогресс скролла внутри секции: от 0.0 до 1.0
    const progress = Math.max(0, Math.min(1, scrolledLayout / trackHeightLayout));

    // --- НАСТРОЙКА ТАЙМЛАЙНА ---
    // Первые 30% скролла тратим на то, чтобы опустить текст.
    // Оставшиеся 70% скролла тратим на то, чтобы протянуть карточки.
    const TEXT_PHASE_END = 0.3;

    // Высчитываем локальный прогресс для каждой из фаз (от 0 до 1)
    const pText = Math.min(1, progress / TEXT_PHASE_END);
    const pCards = Math.max(0, (progress - TEXT_PHASE_END) / (1 - TEXT_PHASE_END));

    // 1. АНИМАЦИЯ ТЕКСТА
    if (promoHeader) {
      // Сдвигаем пропорционально локальному прогрессу текста
      const currentShift = maxHeaderShiftLayout * pText;
      promoHeader.style.setProperty('--promo-header-shift', `${currentShift}px`);

      // На случай, если этот класс используется в CSS для изменения opacity/цвета
      if (pText > 0) {
        promoHeader.classList.add('promo-header--nudge-center');
      } else {
        promoHeader.classList.remove('promo-header--nudge-center');
      }
    }

    // 2. АНИМАЦИЯ КАРТОЧЕК — вертикаль задаётся на каждом .promo-item (--promo-layer-y), не на .promo-content
    if (promoContent && promoItems.length) {
      const narrow = window.innerWidth <= 1200;

      if (narrow) {
        // На мобилке: карточки просто располагаются одна за другой, без сложной анимации
        promoItems.forEach((el) => {
          el.style.setProperty('--promo-layer-y', '0px');
          el.style.setProperty('--promo-item-rise', '0px');
        });
      } else {
        // На десктопе: сохраняем оригинальную анимацию
        // Откуда начинают ехать карточки (1.1 vh — чуть ниже границы экрана)
        const startY = layoutVh * 1.1;
        // Докуда доезжают (отрицательные — выше центра экрана)
        const endY = -layoutVh * 0.1;

        /**
         * Вертикальный слой для карточки (px). Сейчас все индексы делят один pCards;
         * сюда можно вынести разные диапазоны progress по itemIndex.
         */
        function getPromoLayerYForItem(_itemIndex) {
          return startY - (startY - endY) * pCards;
        }

        promoItems.forEach((el, i) => {
          el.style.setProperty('--promo-layer-y', `${getPromoLayerYForItem(i)}px`);
        });

        const pCardsEased = pCards; // линейно — без ускорения в конце
        const riseCap = Math.min(layoutVh * 0.55, 480);
        const riseBase = pCardsEased * riseCap;

        promoItems.forEach((el, i) => {
          const rise = riseBase * (1 + i * 0.52);
          el.style.setProperty('--promo-item-rise', `${rise}px`);
        });
      }
    }
  }

  let promoRaf = 0;
  function requestPromoTick() {
    if (promoRaf) return;
    promoRaf = requestAnimationFrame(() => {
      promoRaf = 0;
      applyPromoScroll();
    });
  }

  // --- ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ ---
  updateMetrics();
 let promoLastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 1200 && window.innerWidth === promoLastWidth) return;
    promoLastWidth = window.innerWidth;
    
    updateMetrics();
    requestPromoTick();
  });

  if (typeof lenis !== 'undefined' && lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', requestPromoTick);
  } else {
    window.addEventListener('scroll', requestPromoTick, { passive: true });
  }

  // Делаем финальный пересчет после загрузки шрифтов, чтобы позиция текста была идеальной
  if (document.fonts && typeof document.fonts.ready !== 'undefined') {
    document.fonts.ready.then(() => {
      updateMetrics();
      requestPromoTick();
    });
  }

  requestPromoTick();
})();
// ==========================================
// STATUS SECTION: липкий блок + шаги по реальному скроллу
// Вниз: Статус → Масштаб → Достижения → (виртуально) ещё ниже картинка. Вверх — обратный порядок.
// ==========================================
(function initStatusScrollAnimation() {
  const statusSection = document.getElementById("statusScreen");
  if (!statusSection) return;

  const pinSpacer = statusSection.closest(".status-pin-spacer");
  const statusMainTrigger = document.querySelector(".status-title-main");
  const statusScaleTrigger = document.querySelector(".status-title-sub-1");
  const statusAchievementsTrigger = document.querySelector(".status-title-sub-2");
  const statusQuoteGold = document.querySelector(".status-quote-gold");
  const statusQuoteBlack = document.querySelector(".status-quote-black");
  const statusQuoteRuby = document.querySelector(".status-quote-ruby");

  if (!statusMainTrigger || !statusScaleTrigger || !statusAchievementsTrigger) return;

  const VARIANTS = ["gold", "black", "ruby", "rubyDeep"];
  const triggers = [statusMainTrigger, statusScaleTrigger, statusAchievementsTrigger];
  const quotes = [statusQuoteGold, statusQuoteBlack, statusQuoteRuby];

  /** Индекс кнопки заголовка: rubyDeep = тот же, что «Достижения» (виртуальный шаг) */
  function getTriggerIndexForVariant(v) {
    if (v === "rubyDeep") return 2;
    const i = VARIANTS.indexOf(v);
    return i >= 0 && i < triggers.length ? i : 0;
  }

  /** Индекс цитаты: rubyDeep — та же ruby-цитата */
  function getQuoteIndexForVariant(v) {
    if (v === "rubyDeep") return 2;
    const i = VARIANTS.indexOf(v);
    return i >= 0 && i < quotes.length ? i : 0;
  }

  const statusOscarImg = document.getElementById("statusOscarImg");

  let activeVariant = "gold";
  /** true, пока скролл ниже зоны pin-spacer (блок status уже не зафиксирован) */
  let statusStatuePastPin = false;

  let statusQuoteActivateTimer = 0;
  let statusQuoteLeaveTimer = 0;

  function statusStatueIsNarrowLayout() {
    return window.innerWidth <= 1200;
  }

  /** Позиция PNG статуи: инлайн, чтобы не терялась в каскаде и при resize без смены шага */
  function applyStatusStatueImgTransform(variant) {
    if (!statusOscarImg) return;
    const narrow = statusStatueIsNarrowLayout();
    statusOscarImg.style.transition =
      "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
    
    // На мобилке картинка всегда в одном положении (70px), не двигается
    if (narrow) {
      statusOscarImg.style.transform = `translateY(70px)`;
    } else {
      // На десктопе применяем разные позиции
      if (variant === "gold") {
        statusOscarImg.style.transform = "translateY(-144px) scale(1.444)";
      } else if (variant === "black") {
        statusOscarImg.style.transform = "translateY(106px) scale(1.444)";
      } else if (variant === "ruby") {
        statusOscarImg.style.transform = "translateY(356px) scale(1.444)";
      } else if (variant === "rubyDeep") {
        statusOscarImg.style.transform = "translateY(606px) scale(1.444)";
      }
    }
    
    // Управляем позицией блока .status-statue-overlay--award на мобилке
    const awardOverlay = document.querySelector('.status-statue-overlay--award');
    if (awardOverlay && narrow) {
      awardOverlay.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
      // На мобилке блок award всегда в одном положении (70px), не двигается
      awardOverlay.style.transform = "translateY(70px)";
    }
    
  }

  /** Как при первом показе блока: без zoom, базовая вертикаль (как шаг «Статус») */
  function resetStatusStatueImgAfterPin() {
    if (!statusOscarImg) return;
    statusOscarImg.style.transition =
      "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
    if (statusStatueIsNarrowLayout()) {
      statusOscarImg.style.transform = "translateY(70px)";
    } else {
      statusOscarImg.style.removeProperty("transform");
    }
    
    // Сбрасываем позицию блока award на мобилке
    const awardOverlay = document.querySelector('.status-statue-overlay--award');
    if (awardOverlay && statusStatueIsNarrowLayout()) {
      awardOverlay.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
      awardOverlay.style.transform = "translateY(70px)";
    }
  }

  function setActiveStatusVariant(variant, opts) {
    const skipStatueImg = opts && opts.skipStatueImg === true;
    if (variant === activeVariant) return;

    window.clearTimeout(statusQuoteActivateTimer);
    statusQuoteActivateTimer = 0;
    window.clearTimeout(statusQuoteLeaveTimer);
    statusQuoteLeaveTimer = 0;

    const oldQuoteIdx = getQuoteIndexForVariant(activeVariant);
    const newQuoteIdx = getQuoteIndexForVariant(variant);
    const newTriggerIdx = getTriggerIndexForVariant(variant);

    triggers.forEach((t, i) => {
      t.classList.toggle("is-active", i === newTriggerIdx);
    });

    if (oldQuoteIdx !== newQuoteIdx) {
      quotes.forEach((q) => {
        if (!q) return;
        q.classList.remove("is-active", "is-leaving");
      });

      if (quotes[oldQuoteIdx]) {
        const leaveEl = quotes[oldQuoteIdx];
        leaveEl.classList.add("is-leaving");
        statusQuoteLeaveTimer = window.setTimeout(() => {
          statusQuoteLeaveTimer = 0;
          leaveEl.classList.remove("is-leaving");
        }, 400);
      }

      if (quotes[newQuoteIdx]) {
        const narrow = statusStatueIsNarrowLayout();
        if (narrow) {
          quotes[newQuoteIdx].classList.add("is-active");
        } else {
          const targetVariant = variant;
          const qi = newQuoteIdx;
          const delay = oldQuoteIdx >= 0 ? 150 : 0;
          statusQuoteActivateTimer = window.setTimeout(() => {
            statusQuoteActivateTimer = 0;
            if (activeVariant !== targetVariant) return;
            if (quotes[qi]) quotes[qi].classList.add("is-active");
          }, delay);
        }
      }
    }

    activeVariant = variant;
    statusSection.setAttribute("data-status-variant", variant);
    if (!skipStatueImg) {
      applyStatusStatueImgTransform(variant);
    }
  }

  const STATUS_PIN_EXTRA_VH = 2.425;
  const STATUS_PIN_VH_STRETCH_CAP = 920;
  const STATUS_PIN_MIN_SCROLL_TRACK_PX = 1360;

 function updatePinSpacerHeight() {
    if (!pinSpacer) return;
    const statusH = statusSection.offsetHeight;
    const svh = getScrollViewportHeight();
    const stretchVh = Math.min(svh, STATUS_PIN_VH_STRETCH_CAP);
    const extraScroll = stretchVh * STATUS_PIN_EXTRA_VH;
    const fromStretch = statusH + extraScroll;
    const withFloor = Math.max(fromStretch, svh + STATUS_PIN_MIN_SCROLL_TRACK_PX);
    
    // Возвращаем как было изначально, убираем + svh
    pinSpacer.style.height = `${withFloor}px`; 
  }

  updatePinSpacerHeight();

  // Начальное состояние — ничего не активно, без приближения
  triggers.forEach(t => t.classList.remove("is-active"));
  quotes.forEach(q => { if (q) { q.classList.remove("is-active"); q.classList.remove("is-leaving"); } });
  statusSection.setAttribute("data-status-variant", "gold");
  if (statusOscarImg) {
    statusOscarImg.style.transition = "none";
    if (statusStatueIsNarrowLayout()) {
      statusOscarImg.style.transform = "translateY(70px)";
    } else {
      statusOscarImg.style.removeProperty("transform");
    }
    setTimeout(() => {
      if (statusOscarImg) statusOscarImg.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
    }, 50);
  }
  
  // Начальное состояние для блока award на мобилке
  const awardOverlay = document.querySelector('.status-statue-overlay--award');
  if (awardOverlay && statusStatueIsNarrowLayout()) {
    awardOverlay.style.transition = "none";
    awardOverlay.style.transform = "translateY(70px)";
    setTimeout(() => {
      if (awardOverlay) awardOverlay.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
    }, 50);
  }

  // На мобилке: когда цитата gold (текст при кнопке СТАТУС) становится видимой — опускаем statueStage на 90px
  if (statusQuoteGold) {
    const observer = new MutationObserver(() => {
      if (!statusStatueIsNarrowLayout()) return;
      const statueStage = document.querySelector('.status-statue-stage');
      if (!statueStage) return;
      const isActive = statusQuoteGold.classList.contains('is-active');
      statueStage.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
      // Опускаем на 90px когда gold активен, оставляем на всех последующих шагах
      if (isActive) {
        statueStage.style.setProperty('transform', 'translateX(-50%) translateY(90px)', 'important');
      }
    });
    observer.observe(statusQuoteGold, { attributes: true, attributeFilter: ['class'] });
  }

  // На мобилке: когда активна кнопка МАСШТАБ — опускаем картинку и правый блок (дата) на 20px
  if (statusQuoteBlack) {
    const observerBlack = new MutationObserver(() => {
      if (!statusStatueIsNarrowLayout()) return;
      const img = document.getElementById('statusOscarImg');
      const dateOverlay = document.querySelector('.status-statue-overlay--date');
      const isActive = statusQuoteBlack.classList.contains('is-active');
      const t = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
      if (img) {
        img.style.transition = t;
        img.style.transform = isActive ? 'translateY(105px)' : 'translateY(70px)';
      }
      if (dateOverlay) {
        dateOverlay.style.transition = t;
        dateOverlay.style.transform = isActive ? 'translateY(35px)' : '';
      }
    });
    observerBlack.observe(statusQuoteBlack, { attributes: true, attributeFilter: ['class'] });
  }

  // Флаг: был ли уже активирован хотя бы один шаг (чтобы не активировать gold до входа в зону)
  let statusAnimStarted = false;

  let ticking = false;

  // Шаги: 0=gold(Статус), 1=black(Масштаб), 2=ruby(Достижения), 3=rubyDeep(финал)
  // Каждый шаг занимает 25% диапазона скролла
  const STATUS_PHASE_GOLD_END  = 0.25;
  const STATUS_PHASE_BLACK_END = 0.50;
  const STATUS_PHASE_RUBY_END  = 0.75;

  function stepFromProgress(p) {
    const t = Math.max(0, Math.min(1, p));
    if (t < STATUS_PHASE_GOLD_END)  return 0;
    if (t < STATUS_PHASE_BLACK_END) return 1;
    if (t < STATUS_PHASE_RUBY_END)  return 2;
    return 3;
  }

  function activateStep(step) {
    const nextVariant = VARIANTS[step];
    const idx = getTriggerIndexForVariant(nextVariant);
    const qi  = getQuoteIndexForVariant(nextVariant);

    triggers.forEach((t, i) => t.classList.toggle("is-active", i === idx));

    if (qi !== getQuoteIndexForVariant(activeVariant) || !statusAnimStarted) {
      quotes.forEach(q => { if (q) q.classList.remove("is-active", "is-leaving"); });
      if (quotes[qi]) quotes[qi].classList.add("is-active");
    }

    statusAnimStarted = true;
    activeVariant = nextVariant;
    statusSection.setAttribute("data-status-variant", nextVariant);
    applyStatusStatueImgTransform(nextVariant);
  }

  function deactivateAll() {
    statusAnimStarted = false;
    activeVariant = "gold";
    triggers.forEach(t => t.classList.remove("is-active"));
    quotes.forEach(q => { if (q) q.classList.remove("is-active", "is-leaving"); });
    statusSection.setAttribute("data-status-variant", "gold");
    if (statusOscarImg) {
      statusOscarImg.style.transition = "transform 1.2s cubic-bezier(0.22, 0.8, 0.22, 1)";
      if (statusStatueIsNarrowLayout()) {
        statusOscarImg.style.transform = "translateY(70px)";
      } else {
        statusOscarImg.style.removeProperty("transform");
      }
    }
  }

  function onScrollStatus() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      if (!pinSpacer) return;

      const svh = getScrollViewportHeight();
      const spacerH = pinSpacer.offsetHeight;
      const spacerTop = getElementDocumentOffsetTop(pinSpacer);
      const scrollY = getDocumentScrollY();
      const sectionScrollRange = Math.max(1, spacerH - svh);

      // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ---
      if (scrollY <= spacerTop) {
        // Верх viewport ещё не достиг блока — сбрасываем всё
        statusStatuePastPin = false;
        deactivateAll();

      } else if (scrollY >= spacerTop + spacerH) {
        // Блок уже прокручен — фиксируем на последнем активном шаге
        if (!statusStatuePastPin) {
          resetStatusStatueImgAfterPin();
          statusStatuePastPin = true;
        }
        // Оставляем ruby активным (не переключаем)

      } else {
        statusStatuePastPin = false;
        const rawScrolled = scrollY - spacerTop;
        // Мёртвая зона: ждём пока блок войдёт на 50% высоты viewport
        const deadZone = svh * 0.5;
        if (rawScrolled < deadZone) {
          deactivateAll();
        } else {
          const progress = Math.max(0, Math.min(1, (rawScrolled - deadZone) / (sectionScrollRange - deadZone)));
          const step = stepFromProgress(progress);
          const nextVariant = VARIANTS[step];
          if (!statusAnimStarted || nextVariant !== activeVariant) {
            activateStep(step);
          }
        }
      }

      // --- ЛОГИКА ОСТАНОВКИ ---
      const statusH = statusSection.offsetHeight;
      const stableVh = (window.innerHeight || document.documentElement.clientHeight) / getPageScale();
      const freezeY = spacerTop + spacerH - Math.min(statusH, stableVh);

      if (scrollY >= freezeY) {
          statusSection.style.position = "fixed";
          statusSection.style.left = "50%";
          statusSection.style.transform = "translateX(-50%)";
          statusSection.style.width = "100%";
          statusSection.style.maxWidth = "1920px";
          statusSection.style.zIndex = "2";
          if (statusH >= stableVh) {
              statusSection.style.bottom = "0px";
              statusSection.style.top = "auto";
          } else {
              statusSection.style.top = "0px";
              statusSection.style.bottom = "auto";
          }
          // Скрываем только когда spacer полностью прокручен
          statusSection.style.visibility = scrollY >= spacerTop + spacerH ? "hidden" : "";
      } else {
          statusSection.style.position = "";
          statusSection.style.bottom = "";
          statusSection.style.top = "";
          statusSection.style.left = "";
          statusSection.style.width = "";
          statusSection.style.maxWidth = "";
          statusSection.style.zIndex = "";
          statusSection.style.visibility = "";
          statusSection.style.transform = "";
      }
    });
  }
  /** После resize: не возвращать zoom, если скролл уже ниже pin-spacer */
  function syncStatusStatueImgForScrollPosition() {
    if (!pinSpacer || !statusOscarImg) return;
    const svh = getScrollViewportHeight();
    const spacerH = pinSpacer.offsetHeight;
    const spacerTop = getElementDocumentOffsetTop(pinSpacer);
    const scrollY = getDocumentScrollY();
    if (scrollY >= spacerTop + spacerH) {
      resetStatusStatueImgAfterPin();
    } else {
      applyStatusStatueImgTransform(activeVariant);
    }
  }

  /** Макс. скролл в тех же координатах, что getDocumentScrollY (учёт zoom layout). */
  function getLayoutMaxScrollY() {
    const se = document.documentElement;
    return Math.max(0, se.scrollHeight - window.innerHeight) / getPageScale();
  }

  /**
   * Целевой scrollY: нижняя граница #statusScreen совпадает с низом вьюпорта.
   * Если такую позицию достичь нельзя — null.
   */
function getStatusBottomAlignScrollY() {
    const top = getElementDocumentOffsetTop(pinSpacer);
    
    // Здесь тоже используем стабильную высоту
    const stableVh = (window.innerHeight || document.documentElement.clientHeight) / getPageScale();
    const statusH = statusSection.offsetHeight;
    const spacerH = pinSpacer.offsetHeight;
    
    const freezeY = top + spacerH - Math.min(statusH, stableVh);
    
    if (freezeY < 0) return null;
    const maxY = getLayoutMaxScrollY();
    if (freezeY > maxY + 1) return null;
    return Math.min(freezeY, maxY);
  }

  /** Небольшая «магнитная» фиксация после остановки скролла у позиции выравнивания низа блока status. */
  const STATUS_BOTTOM_SNAP_ZONE_PX = 56;
  const STATUS_BOTTOM_SNAP_DEBOUNCE_MS = 160;
  const STATUS_BOTTOM_SNAP_DURATION_SEC = 0.48;
  let statusBottomSnapDebounceTimer = 0;
  let statusBottomSnapSuppressUntil = 0;

  function trySnapScrollToStatusBottom() {
    const now = performance.now();
    if (now < statusBottomSnapSuppressUntil) return;
    const targetY = getStatusBottomAlignScrollY();
    if (targetY === null) return;
    const y = getDocumentScrollY();
    const d = y - targetY;
    if (Math.abs(d) < 1.2) return;
    if (Math.abs(d) > STATUS_BOTTOM_SNAP_ZONE_PX) return;

    statusBottomSnapSuppressUntil = now + 650;

    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(targetY, {
        duration: STATUS_BOTTOM_SNAP_DURATION_SEC,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: targetY * getPageScale(),
        behavior: "smooth",
      });
    }
  }

  function scheduleStatusBottomSnap() {
    window.clearTimeout(statusBottomSnapDebounceTimer);
    statusBottomSnapDebounceTimer = window.setTimeout(
      trySnapScrollToStatusBottom,
      STATUS_BOTTOM_SNAP_DEBOUNCE_MS,
    );
  }

function onScrollStatusAndSnap() {
    onScrollStatus();
    scheduleStatusBottomSnap();
  }

  // --- НАЧАЛО БЛОКА СО СЛУШАТЕЛЯМИ ---

  // Переменная для отслеживания ширины экрана
  let statusLastWidth = window.innerWidth;

  // Наша защищённая функция ресайза
  const handleStatusResize = () => {
    const currentWidth = window.innerWidth;
    // Если на мобилке изменилась только высота (скрылась строка) — игнорируем
    if (currentWidth <= 1200 && currentWidth === statusLastWidth) {
      return;
    }
    statusLastWidth = currentWidth;

    updatePinSpacerHeight();
    onScrollStatus();
    syncStatusStatueImgForScrollPosition();
  };

  // 1. ВАЖНО: ВОЗВРАЩАЕМ СЛУШАТЕЛИ СКРОЛЛА (именно они запускают анимацию)
  window.addEventListener("scroll", onScrollStatusAndSnap, { passive: true });
  if (typeof lenis !== "undefined" && lenis && typeof lenis.on === "function") {
    lenis.on("scroll", onScrollStatusAndSnap);
  }

  // 2. Ставим слушатели ресайза с нашей проверкой
  window.addEventListener("resize", handleStatusResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleStatusResize, { passive: true });
  }

  // 3. Наблюдатель за размером самого блока (ResizeObserver)
  const statusScrollRo = new ResizeObserver(() => {
    updatePinSpacerHeight();
    onScrollStatus();
    syncStatusStatueImgForScrollPosition();
  });
  
  statusScrollRo.observe(statusSection);
  if (pinSpacer) statusScrollRo.observe(pinSpacer);

  // 4. Запускаем просчёт при первичной загрузке страницы
  onScrollStatusAndSnap();

})(); // Конец функции initStatusScrollAnimation

// ── Спираль-змея вокруг башни (перенос из Record-main) ─────────────











(function initOrbitSnake() {
  const canvas = document.getElementById("countOrbitCanvas");
  const countEl = document.getElementById("countScreen"); // Кэшируем DOM-элемент
  if (!canvas || !countEl) return;

  const MOBILE_ORBIT_BREAKPOINT = 1200;
  const WIDE_ORBIT_BREAKPOINT = 1500;
  const ctx = canvas.getContext("2d", { alpha: true });
  
  let isMobileOrbit = window.innerWidth <= MOBILE_ORBIT_BREAKPOINT;
  let isNarrowDesktopOrbit =
    window.innerWidth > MOBILE_ORBIT_BREAKPOINT && window.innerWidth < WIDE_ORBIT_BREAKPOINT;
  let W, H, cx, cy, rx, ry;
  let spiralPoints = [];
  /** Те же точки, порядок index 0 = конец пути (для «роста» при скролле снизу вверх). */
  let spiralPointsRev = [];
  let dpr = 1;
  let orbitVisible = true;
  let orbitDrawQueued = false;

  const TURNS = 3;
  let STEPS = isMobileOrbit ? 150 : 300; 
  const TAIL = 0.15;
  let maxParticles = isMobileOrbit ? 0 : 25;

  let phase = 0;
  let targetPhase = 0;
  const particles = [];

  let cachedStartScroll = 0;
  let cachedSpan = 1;

  /** Рисуем по spiralPointsRev — тот же рост фазы, но от противоположного конца пути. */
  let orbitSpiralFromEnd = false;

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
    return getDocumentScrollY();
  }

  function resize() {
    isMobileOrbit = window.innerWidth <= MOBILE_ORBIT_BREAKPOINT;
    isNarrowDesktopOrbit =
      window.innerWidth > MOBILE_ORBIT_BREAKPOINT && window.innerWidth < WIDE_ORBIT_BREAKPOINT;
    maxParticles = isMobileOrbit ? 0 : 25;
    STEPS = isMobileOrbit ? 150 : 300;

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
    cy = isMobileOrbit ? H * 0.86 : isNarrowDesktopOrbit ? H * 0.695 : H * 0.7;
    rx = isMobileOrbit ? W * 0.46 : isNarrowDesktopOrbit ? W * 0.22 : W * 0.13;
    ry = isMobileOrbit ? H * 0.36 : isNarrowDesktopOrbit ? H * 0.28 : H * 0.27;

    spiralPoints = buildSpiral(TURNS, STEPS);
    spiralPointsRev = spiralPoints.length ? spiralPoints.slice().reverse() : [];

    const vh = getScrollViewportHeight();
    const y0 = countSectionDocumentTop(countEl);
    // Общая дистанция скролла: высота всей секции минус 1 экран (момент открепления)
    const sectionScrollRange = Math.max(1, countEl.offsetHeight - vh);
    
    // Убираем искусственные задержки (startAfter), чтобы спираль шла ровно от начала до конца
    cachedStartScroll = y0;
    cachedSpan = sectionScrollRange;
    requestOrbitDraw();
  }

  /** Полностью выше вьюпорта / полностью ниже / пересечение. */
  function countSectionSide() {
    const r = countEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (r.bottom <= 0) return "above";
    if (r.top >= vh) return "below";
    return "intersecting";
  }

  function buildSpiral(turns, steps) {
    const ptsArray = [];
    let rxTop;
    let rxBot;
    if (isMobileOrbit) {
      rxTop = W * 0.41;
      rxBot = W * 0.6;
    } else if (isNarrowDesktopOrbit) {
      rxTop = W * 0.11;
      rxBot = W * 0.3;
    } else {
      rxTop = W * 0.07;
      rxBot = W * 0.18;
    }

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2 - Math.PI / 2;
      const radialT = isMobileOrbit ? t * t : t;
      const rxT = rxTop + (rxBot - rxTop) * radialT;
      ptsArray.push([cx + Math.cos(angle) * rxT, cy - ry + t * ry * 2]);
    }
    return ptsArray;
  }

  window._updateOrbitPhase = function () {
  const scrollY = readScrollY();
  
  // Вычисляем чистый прогресс скролла: 0 = только прилипли, 1 = сейчас отлипнем
  const pRaw = (scrollY - cachedStartScroll) / Math.max(1, cachedSpan);
  
  // Строго ограничиваем от 0 до 1
  const clamped = Math.max(0, Math.min(1, pRaw));

  // Если прогресс изменился — обновляем спираль
  if (Math.abs(targetPhase - clamped) > 0.0001) {
    targetPhase = clamped;
    orbitSpiralFromEnd = false; // Всегда рисуем в нормальном направлении
    requestOrbitDraw();
  }
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

   // Жесткая привязка спирали к скроллу без отставания
    if (Math.abs(targetPhase - phase) > 0.0001) {
      phase = targetPhase; // Мгновенная синхронизация
      needsAnimationFrame = true; // Оставляем для эффекта летящих искр
    } else {
      phase = targetPhase;
    }

    // ВАЖНО: Всегда очищаем канвас! Это предотвращает эффект "застывшей" спирали,
    // когда блок моментально уходит с экрана.
    ctx.clearRect(0, 0, W, H);

    // Если блок скрыт и спираль сброшена, дальше нет смысла производить вычисления
    if (!orbitVisible && phase < 0.001) {
      if (needsAnimationFrame) requestOrbitDraw();
      return;
    }

    const pathPts = orbitSpiralFromEnd ? spiralPointsRev : spiralPoints;
    const total = pathPts.length;
    const headFloat = phase * (total - 1);
    const headIdx = headFloat | 0;
    const headFrac = headFloat - headIdx;
    const tailLen = (total * TAIL) | 0;

    if (headIdx >= 0 && headIdx < total - 1) {
      const p1 = pathPts[headIdx];
      const p2 = pathPts[headIdx + 1];
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
        ctx.moveTo(pathPts[0][0], pathPts[0][1]);
        for (let i = 1; i <= baseEnd; i++) {
          ctx.lineTo(pathPts[i][0], pathPts[i][1]);
        }
        ctx.strokeStyle = isMobileOrbit
          ? "rgba(255, 220, 180, 0.75)"
          : "rgba(255, 220, 180, 0.6)";
        ctx.lineWidth = isMobileOrbit ? 2.4 : 3;
        ctx.shadowBlur = 0;
        ctx.stroke();
      }

      if (headIdx > baseEnd || (headIdx === baseEnd && headFrac > 1e-6)) {
        if (isMobileOrbit) {
          ctx.beginPath();
          ctx.moveTo(pathPts[baseEnd][0], pathPts[baseEnd][1]);
          for (let i = baseEnd + 1; i <= headIdx; i++) {
            ctx.lineTo(pathPts[i][0], pathPts[i][1]);
          }
          if (headIdx < total - 1) {
            const p1 = pathPts[headIdx];
            const p2 = pathPts[headIdx + 1];
            ctx.lineTo(
              p1[0] + (p2[0] - p1[0]) * headFrac,
              p1[1] + (p2[1] - p1[1]) * headFrac
            );
          }
          ctx.strokeStyle = "rgba(255, 230, 200, 0.95)";
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          for (let i = baseEnd; i <= headIdx; i++) {
            if (i + 1 >= total) break;
            const isLast = i === headIdx;
            const p1 = pathPts[i];
            const p2 = pathPts[i + 1];

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
  const orbitResizeRo = new ResizeObserver(() => {
    resize();
    requestOrbitDraw();
  });
  orbitResizeRo.observe(countEl);
  orbitResizeRo.observe(canvas.parentElement);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      resize();
      requestOrbitDraw();
    });
  }

  if (typeof IntersectionObserver === "function") {
    const observedTarget = countEl || canvas.parentElement;
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#salesPopup') return; 

    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      e.preventDefault();
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(targetElement, {
          offset: 0, 
          duration: 1.5 
        });
      } else {
        targetElement.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }
  });
});

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollWindowToTop(durationMs) {
  const startY = window.scrollY || document.documentElement.scrollTop || 0;
  if (startY <= 0) return;
  const t0 = performance.now();
  const tick = (now) => {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / durationMs);
    const y = startY * (1 - easeInOutCubic(t));
    window.scrollTo(0, y);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

document.getElementById("footerToTop")?.addEventListener("click", () => {
  const durationSec = 2.6;
  const durationMs = durationSec * 1000;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(0, {
      duration: durationSec,
      easing: (t) => easeInOutCubic(t),
    });
  } else {
    smoothScrollWindowToTop(durationMs);
  }
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

  container.addEventListener('click', (e) => {
    const { theta } = initSlides();
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;
    
    if (clickX < halfWidth) {
      currentAngle -= theta; 
    } else {
      currentAngle += theta; 
    }
    updateRing();
  });

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
        currentAngle += theta; 
      } else {
        currentAngle -= theta; 
      }
      updateRing();
    }
  }, { passive: true });

  updateRing(true);

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateRing, 200);
  });

  updateRing(true);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdvertSlider);
} else {
  initAdvertSlider();
}

function initPromoHeaderReveal() {
  const header = document.querySelector(".promo-header");
  const promoScreen = document.getElementById("promoScreen");
  if (!header || !promoScreen) return;

  const lines = [...header.querySelectorAll(".reveal-text")];
  if (!lines.length) return;

  if (typeof IntersectionObserver !== "function") {
    lines.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const STAGGER_MS = 95;
  lines.forEach((el, i) => {
    el.style.setProperty("--reveal-delay", `${i * STAGGER_MS}ms`);
  });

  let done = false;
  const activate = (obs) => {
    if (done) return;
    done = true;
    lines.forEach((el) => el.classList.add("in-view"));
    if (obs) {
      try {
        obs.unobserve(promoScreen);
      } catch (_) {
        /* ignore */
      }
    }
  };

  /* Секция #promoScreen выше порога, чем сам header: threshold 0.18 на высоком .promo-header часто не срабатывал */
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        activate(obs);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -4% 0px" }
  );

  io.observe(promoScreen);

  const maybeAlreadyVisible = () => {
    const r = promoScreen.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    if (vh <= 0) return;
    if (r.bottom > vh * 0.04 && r.top < vh * 0.96) {
      activate(io);
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(maybeAlreadyVisible);
  });
}

function initRevealText() {
    const targets = [...document.querySelectorAll(".reveal-text")].filter(
        (el) =>
            !el.closest(".promo-item") &&
            !el.closest(".promo-header") &&
            !el.classList.contains("status-footer"),
    );

    targets.forEach((el, i) => {
        el.style.setProperty("--reveal-delay", `${(i % 8) * 55}ms`);
    });
    
    targets
        .filter((el) => el.matches(".letter-o, .count-letter-o, .promo-letter-o, .promo-word-o, .radio-title-o"))
        .forEach((el) => {
            el.style.setProperty("--reveal-delay", "220ms");
        });
    
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

/** «28 МАЯ»: появление снизу вверх при каждом скролле к блоку (in-view снимается при уходе из зоны). */
function initStatusFooterReveal() {
  const el = document.querySelector(".status-footer.reveal-text");
  if (!el) return;

  const isMobile = window.innerWidth <= 1200;

  // На мобильной версии всегда показываем текст
  if (isMobile) {
    el.classList.add("in-view");
    return;
  }

  if (typeof IntersectionObserver !== "function") {
    el.classList.add("in-view");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        } else {
          entry.target.classList.remove("in-view");
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  io.observe(el);
}

function initBenefitItemsScrollActive() {
  const BP = 1200;
  const items = [...document.querySelectorAll(".screen-benefits .benefit-item")];
  if (!items.length) return;

  let rafId = 0;

  const tick = () => {
    if (window.innerWidth > BP) {
      items.forEach((el) => el.classList.remove("is-scroll-active"));
      return;
    }
    const vh = window.innerHeight;
    const focalY = vh * 0.42;
    let best = null;
    let bestDist = Infinity;
    for (const el of items) {
      if (!el.classList.contains("in-view")) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 56 || r.top > vh - 56) continue;
      const cy = (r.top + r.bottom) / 2;
      const dist = Math.abs(cy - focalY);
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }
    const prev = items.find((el) => el.classList.contains("is-scroll-active"));
    const HY = 80;
    if (prev && best && prev !== best) {
      const pr = prev.getBoundingClientRect();
      if (pr.bottom > 48 && pr.top < vh - 48) {
        const dPrev = Math.abs((pr.top + pr.bottom) / 2 - focalY);
        if (dPrev < bestDist + HY) {
          best = prev;
        }
      }
    }
    for (const el of items) {
      el.classList.toggle("is-scroll-active", el === best && best !== null);
    }
  };

  const schedule = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      tick();
    });
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
  requestAnimationFrame(() => {
    requestAnimationFrame(schedule);
  });
}

function initRevealAndPromoHeader() {
  initPromoHeaderReveal();
  initRevealText();
  initStatusFooterReveal();
  initBenefitItemsScrollActive();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRevealAndPromoHeader);
} else {
  initRevealAndPromoHeader();
}


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

function initInterviewEllipseRevealOnce() {
  const section = document.querySelector(".interview");
  const ellipses = [...document.querySelectorAll(".interview-ellipse")].sort(
    (a, b) => Number(a.dataset.revealOrder || 0) - Number(b.dataset.revealOrder || 0),
  );
  if (!section || ellipses.length === 0) return;

  const staggerMs = 320;
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealSequential() {
    ellipses.forEach((el, i) => {
      const delay = reducedMotion ? 0 : i * staggerMs;
      window.setTimeout(() => el.classList.add("is-visible"), delay);
    });
  }

  if (!("IntersectionObserver" in window)) {
    revealSequential();
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        obs.disconnect();
        revealSequential();
        break;
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
  );
  io.observe(section);
}

function initInterviewDots() {
  const interviewScreen = document.querySelector(".interview");
  if (interviewScreen) {
    initInterviewEllipseRevealOnce();
  }

  const interviewRevealItems = [...document.querySelectorAll(".interview-reveal")];
  
  if (!interviewScreen || !interviewRevealItems.length) return;

  const otherRevealItems = [...interviewRevealItems].filter(item => 
    !item.classList.contains('interview-ellipse')
  );
  
  if (otherRevealItems.length > 0) {
    const revealItems = otherRevealItems
      .sort((a, b) => Number(a.dataset.revealOrder || 0) - Number(b.dataset.revealOrder || 0));

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(item => item.classList.add("is-visible"));
      return;
    }

    revealItems.forEach((item, index) => {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(() => item.classList.add("is-visible"), index * 150);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
      io.observe(item);
    });
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
  const newsViewport = newsGallery?.querySelector(".news-gallery-viewport");
  const newsTrack = document.getElementById("newsTrack");
  const newsTabs = document.querySelector(".news-tabs");
  const newsTabsDropdown = document.getElementById("newsTabsDropdown");
  const newsTabsTrigger = document.querySelector(".news-tabs > .news-tab:first-child");
  const newsTabButtons = [...document.querySelectorAll(".news-tab")];
  const newsCursor = document.getElementById("newsCursor");
  const newsCards = [...document.querySelectorAll("[data-news-card]")];

  if (!newsGallery || !newsTrack || !newsCards.length) return;

  const STEP_LOCK_MS = 820;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  let currentNewsFilter = "all";
  let newsActiveIndex = 0;
  let newsStepLocked = false;
  let newsStepUnlockTimer = 0;

  const getVisibleNewsCards = () =>
    newsCards.filter((c) => getComputedStyle(c).display !== "none");

  const syncNewsTabUi = () => {
    newsTabButtons.forEach((btn) => {
      const f = btn.dataset.newsFilter;
      if (f === undefined) return;
      const active = f === currentNewsFilter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  };

  const applyNewsFilter = () => {
    for (const card of newsCards) {
      const cat = card.dataset.newsCategory || "news";
      const show = currentNewsFilter === "all" || cat === currentNewsFilter;
      card.style.display = show ? "" : "none";
    }
    const visible = getVisibleNewsCards();
    newsActiveIndex = clamp(newsActiveIndex, 0, Math.max(0, visible.length - 1));
    syncNewsTabUi();
    window.requestAnimationFrame(() => {
      renderNewsGallery();
    });
  };

  const getNewsIndexBounds = () => {
    const n = getVisibleNewsCards().length;
    return {
      minIndex: 0,
      maxIndex: Math.max(0, n - 1),
    };
  };

  /** Минимум видимой ширины следующего слайда справа (если он есть). */
  const MIN_NEXT_SLIDE_PEEK_PX = 36;

  /**
   * Сдвиг трека: сначала выравнивание по левому краю активной карточки; если справа не хватает «peek» следующего,
   * сдвигаем окно вправо по треку (часть активной может уйти за левый край вьюпорта).
   */
  const computeNewsTrackShiftPx = () => {
    const visible = getVisibleNewsCards();
    const n = visible.length;
    const measureEl = newsViewport || newsGallery;
    const innerW = Math.max(0, measureEl.getBoundingClientRect().width);

    if (n === 0) {
      return 0;
    }

    const i = clamp(newsActiveIndex, 0, n - 1);
    const activeCard = visible[i];
    const lastCard = visible[n - 1];

    let viewportLeftOnTrack = activeCard.offsetLeft;
    if (i < n - 1) {
      const nextCard = visible[i + 1];
      const nextLeft = nextCard.offsetLeft;
      const minViewportLeftForPeek = nextLeft + MIN_NEXT_SLIDE_PEEK_PX - innerW;
      viewportLeftOnTrack = Math.max(viewportLeftOnTrack, minViewportLeftForPeek);
    }

    const lastRight = lastCard.offsetLeft + lastCard.offsetWidth;
    let shift = -viewportLeftOnTrack;
    const shiftMax = 0;
    const shiftMin = Math.min(0, innerW - lastRight);
    return clamp(shift, shiftMin, shiftMax);
  };

  const renderNewsGallery = () => {
    const shiftPx = computeNewsTrackShiftPx();
    if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT) {
      newsTrack.style.removeProperty("--news-track-shift-px");
      newsTrack.style.setProperty("transform", `translateX(${shiftPx}px)`);
      return;
    }
    newsTrack.style.removeProperty("transform");
    newsTrack.style.setProperty("--news-track-shift-px", `${shiftPx}px`);
  };

  const setNewsActiveIndex = (nextIndex) => {
    const { minIndex, maxIndex } = getNewsIndexBounds();
    newsActiveIndex = clamp(nextIndex, minIndex, maxIndex);
    renderNewsGallery();
  };

  const stepNewsGallery = (direction) => {
    const visible = getVisibleNewsCards();
    if (!direction || newsStepLocked || visible.length < 2) return false;
    newsStepLocked = true;
    window.clearTimeout(newsStepUnlockTimer);
    newsStepUnlockTimer = window.setTimeout(() => {
      newsStepLocked = false;
    }, STEP_LOCK_MS);

    if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT) {
      const total = visible.length;
      newsActiveIndex = ((newsActiveIndex + direction) % total + total) % total;
      renderNewsGallery();
    } else {
      setNewsActiveIndex(newsActiveIndex + direction);
    }
    return true;
  };

  applyNewsFilter();

  if (newsTabs && newsTabsTrigger && newsTabButtons.length) {
    newsTabsTrigger.setAttribute("aria-expanded", "false");
    newsTabsTrigger.addEventListener("click", (event) => {
      if (window.innerWidth > NEWS_DROPDOWN_BREAKPOINT) return;
      event.preventDefault();
      const next = !newsTabs.classList.contains("is-expanded");
      newsTabs.classList.toggle("is-expanded", next);
      newsTabsTrigger.setAttribute("aria-expanded", next ? "true" : "false");
    });

    newsTabs.addEventListener("click", (event) => {
      const tab = event.target.closest(".news-tab");
      if (!tab || tab.dataset.newsFilter === undefined) return;

      if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT && tab === newsTabsTrigger) {
        return;
      }

      event.preventDefault();
      currentNewsFilter = tab.dataset.newsFilter;
      newsActiveIndex = 0;
      applyNewsFilter();

      if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT) {
        newsTabs.classList.remove("is-expanded");
        newsTabsTrigger.setAttribute("aria-expanded", "false");
      }
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

  newsGallery.addEventListener("pointerdown", (event) => {
    if (window.innerWidth > NEWS_DROPDOWN_BREAKPOINT) return;
    pointerActive = true;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  });

  newsGallery.addEventListener("pointerup", (event) => {
    if (!pointerActive) return;
    const dx = event.clientX - pointerStartX;
    const dy = event.clientY - pointerStartY;
    if (Math.abs(dx) >= swipeThresholdPx && Math.abs(dx) > Math.abs(dy)) {
      const direction = dx < 0 ? 1 : -1;
      stepNewsGallery(direction);
      lastSwipeAt = Date.now();
    }
    pointerActive = false;
  });

  newsGallery.addEventListener("pointercancel", () => {
    pointerActive = false;
  });

  newsGallery.addEventListener("click", (event) => {
    if (window.innerWidth <= NEWS_DROPDOWN_BREAKPOINT) {
      event.preventDefault();
      return;
    }
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
  const FEEDBACK_CAROUSEL_LOCK_MS = 560;
  
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  // =====================================
  // СЛАЙДЕР: ОТЗЫВЫ (КАСКАД)
  // =====================================
  let reviewsFeedbackActiveIndex = 0;
  let reviewsFeedbackStepLocked = false;
  let reviewsFeedbackStepUnlockTimer = 0;
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
    
    const isMobile = window.innerWidth <= 1200;
    
    if (w < 40 || h < 40) {
      w = Math.max(stageRect.width, Math.min(window.innerWidth, 1920) * 0.72, 360);
      // На мобилке используем фиксированную высоту вместо vh
      h = isMobile ? 620 : Math.max(stageRect.height, window.innerHeight * 0.5, 420);
    }

    const maxCardW = isMobile ? Math.min(w * 0.88, 720) : Math.min(w * 0.5, 900);
    const maxCardH = isMobile ? Math.min(h * 0.88, 920) : Math.min(h * 0.95, 1100);

    const activeCard = reviewsFeedbackCards[reviewsFeedbackActiveIndex];
    let imgRatio = 0.8; 
    if (activeCard && activeCard.naturalWidth && activeCard.naturalHeight) {
      imgRatio = activeCard.naturalWidth / activeCard.naturalHeight;
    }

    let uniW = maxCardW;
    let uniH = uniW / imgRatio;

    if (uniH > maxCardH) {
      uniH = maxCardH;
      uniW = uniH * imgRatio;
    }

    // Масштаб для каскада (каждый следующий строго меньше предыдущего)
    const scaleAd = (ad) => {
      if (ad === 0) return 1.15; 
      if (ad === 1) return 0.75; 
      if (ad === 2) return 0.55; 
      if (ad === 3) return 0.40; 
      return Math.max(0.25, 0.40 - (ad - 3) * 0.15); 
    };

    // Точный расчет отступа: каждый следующий слайд выглядывает ровно на 124px
    const txAbsForRings = (ad) => {
      if (ad <= 0) return 0;
      const PEEK_PX = 124; 
      let tx = 0;
      for (let i = 1; i <= ad; i++) {
        const scalePrev = scaleAd(i - 1);
        const scaleCurr = scaleAd(i);
        tx += PEEK_PX + (uniW / 2) * (scalePrev - scaleCurr);
      }
      return tx;
    };

    const maxR = Math.min(3, Math.floor(total / 2));

    reviewsFeedbackCards.forEach((card, index) => {
      const d = signedFeedbackDistance(index, reviewsFeedbackActiveIndex, total);
      const ad = Math.abs(d);
      const sign = d === 0 ? 0 : d > 0 ? 1 : -1;

      card.classList.remove(
        "is-center", "is-left-1", "is-left-2", "is-left-3",
        "is-right-1", "is-right-2", "is-right-3", "is-hidden"
      );

      if (ad > maxR) {
        card.style.left = "50%";
        card.style.top = "50%";
        card.style.width = `${uniW}px`;
        card.style.height = `${uniH}px`;
        card.style.opacity = "0";
        card.style.visibility = "hidden";
        card.style.pointerEvents = "none";
        card.style.transform = "translate3d(-50%, -50%, -420px) scale(0.28)";
        card.style.filter = "none";
        card.style.zIndex = "0";
        card.setAttribute("aria-hidden", "true");
        return;
      }

      const scale = scaleAd(ad);
      const tz = -ad * 50; 
      const txAbs = txAbsForRings(ad);
      const tx = sign * txAbs;
      const ty = 0; 

      card.style.left = "50%";
      card.style.top = "50%";
      card.style.width = `${uniW}px`;
      card.style.height = `${uniH}px`;
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
      } else {
        card.setAttribute("aria-hidden", "true");
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
    
    reviewsFeedbackCards.forEach((img) => {
      img.addEventListener("load", scheduleFeedbackLayout, { passive: true });
    });
    
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

  // =====================================
  // СЛАЙДЕР: БЛАГОДАРНОСТИ
  // =====================================
  // СЛАЙДЕР: БЛАГОДАРНОСТИ (Бесконечная прокрутка)
  // =====================================
  let reviewsGratitudeOffset = 0;
  let reviewsGratitudeStepLocked = false;
  let reviewsGratitudeStepUnlockTimer = 0;

  const GRATITUDE_CARD_BORDER_PX = 0;
  const GRATITUDE_SLIDE_W_PX = 578;
  const GRATITUDE_SLIDE_H_PX = 780;
  const GRATITUDE_SLIDE_GAP = 620; // Расстояние между центрами слайдов

  const layoutReviewsGratitudeIntrinsics = () => {
    if (!reviewsGratitudeGallery || !reviewsGratitudeCards.length) return;
    const isMobile = window.matchMedia("(max-width: 1200px)").matches;
    let b;
    let slideW;
    let slideH;
    if (isMobile) {
      b = GRATITUDE_CARD_BORDER_PX;
      const gw = reviewsGratitudeGallery.clientWidth;
      if (gw < 4) return;
      slideW = Math.max(Math.floor(gw - 52), 168);
      slideH = (slideW * 480) / 302;
    } else {
      b = GRATITUDE_CARD_BORDER_PX;
      slideW = GRATITUDE_SLIDE_W_PX;
      slideH = GRATITUDE_SLIDE_H_PX;
    }
    const innerW = slideW - 2 * b;
    const innerH = slideH - 2 * b;
    const CERT_APERTURE_W = 0.72;
    const CERT_APERTURE_H = 0.76;
    const certMaxW = innerW * CERT_APERTURE_W;
    const certMaxH = innerH * CERT_APERTURE_H;

    reviewsGratitudeGallery.style.setProperty("--rg-card-w", `${slideW}px`);
    reviewsGratitudeGallery.style.setProperty("--rg-card-h", `${slideH}px`);

    reviewsGratitudeCards.forEach((figure) => {
      const cert = figure.querySelector(".reviews-gratitude-card-image");
      if (!cert) return;
      const cw = cert.naturalWidth;
      const ch = cert.naturalHeight;
      if (!cw || !ch) return;
      const cs = Math.min(certMaxW / cw, certMaxH / ch);
      cert.style.width = `${cw * cs}px`;
      cert.style.height = `${ch * cs}px`;
      cert.style.left = "50%";
      cert.style.top = "50%";
      cert.style.transform = "translate(-50%, -50%)";
    });
  };

  const scheduleGratitudeLayout = () => {
    window.requestAnimationFrame(() => {
      layoutReviewsGratitudeIntrinsics();
      window.requestAnimationFrame(() => layoutReviewsGratitudeIntrinsics());
    });
  };

  const renderReviewsGratitudeCarousel = () => {
    if (!reviewsGratitudeCards.length) return;
    const isMobile = window.matchMedia("(max-width: 1200px)").matches;
    
    if (isMobile) {
      // Мобильная версия - старая логика
      const total = reviewsGratitudeCards.length;
      const stateClasses = ["is-left-edge", "is-main-left", "is-main-right", "is-right-edge"];
      const activeIndex = Math.abs(reviewsGratitudeOffset) % total;
      
      reviewsGratitudeCards.forEach((card, index) => {
        const slot = ((index - activeIndex) % total + total) % total;
        card.classList.remove(...stateClasses, "is-hidden");
        if (slot < stateClasses.length) {
          card.classList.add(stateClasses[slot]);
        } else {
          card.classList.add("is-hidden");
        }
        card.setAttribute("aria-hidden", slot > 1 ? "true" : "false");
      });
    } else {
      // Десктопная версия - всегда 4 слайда: 2 по центру + 2 по краям
      const total = reviewsGratitudeCards.length;
      
      // Позиции для 4 слайдов: левый край, левый центр, правый центр, правый край
      const positions = [-930, -310, 310, 930];
      
      // Определяем какие слайды показывать
      for (let i = 0; i < 4; i++) {
        const cardIndex = ((reviewsGratitudeOffset + i) % total + total) % total;
        const card = reviewsGratitudeCards[cardIndex];
        
        if (card) {
          card.style.transform = `translate(calc(-50% + ${positions[i]}px), -50%)`;
          card.classList.remove("is-hidden");
        }
      }
      
      // Скрываем остальные слайды
      reviewsGratitudeCards.forEach((card, index) => {
        let isVisible = false;
        for (let i = 0; i < 4; i++) {
          const visibleIndex = ((reviewsGratitudeOffset + i) % total + total) % total;
          if (index === visibleIndex) {
            isVisible = true;
            break;
          }
        }
        if (!isVisible) {
          card.classList.add("is-hidden");
        }
      });
    }
  };

  const stepReviewsGratitudeCarousel = (direction) => {
    if (!direction || reviewsGratitudeStepLocked || reviewsGratitudeCards.length < 2) return false;
    reviewsGratitudeStepLocked = true;
    
    reviewsGratitudeOffset += direction;
    renderReviewsGratitudeCarousel();
    
    window.clearTimeout(reviewsGratitudeStepUnlockTimer);
    reviewsGratitudeStepUnlockTimer = window.setTimeout(() => {
      reviewsGratitudeStepLocked = false;
    }, STEP_LOCK_MS);
    return true;
  };

  if (reviewsGratitudeGallery && reviewsGratitudeCards.length) {
    renderReviewsGratitudeCarousel();
    scheduleGratitudeLayout();
    
    reviewsGratitudeGallery.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", scheduleGratitudeLayout, { passive: true });
    });
    
    window.addEventListener("resize", scheduleGratitudeLayout, { passive: true });
    
    window.addEventListener("reviews:tabchange", (event) => {
      if (event.detail?.tab === "gratitude") scheduleGratitudeLayout();
    });
    
    if (typeof ResizeObserver !== "undefined") {
      const gratitudeResizeObserver = new ResizeObserver(() => scheduleGratitudeLayout());
      gratitudeResizeObserver.observe(reviewsGratitudeGallery);
    }
    
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
      const scale = rect.width / reviewsGratitudeGallery.offsetWidth;
      const localX = clamp((event.clientX - rect.left) / scale, 0, reviewsGratitudeGallery.offsetWidth);
      const localY = clamp((event.clientY - rect.top) / scale, 0, reviewsGratitudeGallery.offsetHeight);
      const isLeftZone = localX < reviewsGratitudeGallery.offsetWidth * 0.5;
      reviewsGratitudeGallery.classList.add("is-cursor-active");
      reviewsGratitudeGallery.classList.toggle("is-left-zone", isLeftZone);
      reviewsGratitudeGallery.classList.toggle("is-right-zone", !isLeftZone);
      
      if (reviewsGratitudeCursor) {
        reviewsGratitudeCursor.style.setProperty("left", `${localX}px`);
        reviewsGratitudeCursor.style.setProperty("top", `${localY}px`);
      }
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
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.reviewsTab || "official";
      const previousTab = reviewsScreen.dataset.reviewsTab;

      if (tabName === previousTab) return;

      // При любом переключении табов — сначала прокручиваем к началу блока
      const reviewsTop = reviewsScreen.getBoundingClientRect().top + window.scrollY / getPageScale();
      const currentScrollY = getDocumentScrollY();

      // Прокручиваем только если мы не в начале блока
      if (Math.abs(currentScrollY - reviewsTop) > 5) {
        if (lenis && typeof lenis.scrollTo === "function") {
          lenis.scrollTo(reviewsScreen, { offset: 0, immediate: true });
        } else {
          window.scrollTo({ top: reviewsTop * getPageScale(), behavior: "auto" });
        }
      }

      requestAnimationFrame(() => {
        setTab(tabName);
      });
    });
  });

  setTab(reviewsScreen.dataset.reviewsTab || "official");
}

const REVIEWS_STICKY_HIDE_TABS_EXTRA_PX = 150;

function updateReviewsStickySlideOffset() {
  const reviewsScreen = document.getElementById("reviewsScreen");
  if (!reviewsScreen) return;
  const wrap = reviewsScreen.querySelector(".reviews-sticky-wrapper");
  if (!wrap) return;

  const narrow =
    window.innerWidth <= 1200 ||
    document.documentElement.clientWidth <= 1200 ||
    window.matchMedia("(max-width: 1200px)").matches;

  if (!narrow || reviewsScreen.dataset.reviewsTab !== "official") {
    wrap.style.removeProperty("--reviews-sticky-slide-offset");
    return;
  }

  const stage = document.getElementById("reviewsOfficialStage");
  if (!stage || stage.getAttribute("aria-hidden") === "true" || stage.offsetParent === null) {
    wrap.style.removeProperty("--reviews-sticky-slide-offset");
    return;
  }

  const wrapBox = wrap.getBoundingClientRect();
  const stageBox = stage.getBoundingClientRect();
  const offsetPx = stageBox.top - wrapBox.top;
  const topPx = -Math.round(offsetPx) - REVIEWS_STICKY_HIDE_TABS_EXTRA_PX;
  wrap.style.setProperty("--reviews-sticky-slide-offset", `${topPx}px`);
}

function initReviewsStickyAlign() {
  let resizeTimer;
  const schedule = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(updateReviewsStickySlideOffset);
    });
  };

  updateReviewsStickySlideOffset();
  schedule();
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(schedule, 120);
  });
  window.addEventListener("orientationchange", schedule);
  window.addEventListener("reviews:tabchange", schedule);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
}

/** Как у благодарностей: рамка + «окно» под скан; размеры картинок из naturalWidth/Height. */
function layoutReviewsOfficialLetterIntrinsics() {
  const stage = document.getElementById("reviewsOfficialStage");
  if (!stage) return;
  const borderPx = 0;
  const certApertureW = 0.72;
  const certApertureH = 0.76;
  stage.querySelectorAll(".reviews-letter-wrapper").forEach((wrap) => {
    const innerW = wrap.clientWidth - 2 * borderPx;
    const innerH = wrap.clientHeight - 2 * borderPx;
    const cert = wrap.querySelector(".reviews-letter-img");
    if (!cert || innerW <= 0 || innerH <= 0) return;
    const certMaxW = innerW * certApertureW;
    const certMaxH = innerH * certApertureH;
    const cw = cert.naturalWidth;
    const ch = cert.naturalHeight;
    if (cw && ch) {
      const cs = Math.min(certMaxW / cw, certMaxH / ch);
      cert.style.width = `${cw * cs}px`;
      cert.style.height = `${ch * cs}px`;
    }
    cert.style.left = "50%";
    cert.style.top = "50%";
  });
}

function initReviewsOfficialScrollEffect() {
  const reviewsScreen = document.getElementById("reviewsScreen");
  const stage = document.getElementById("reviewsOfficialStage");
  if (!stage || !reviewsScreen) return;

  const slides = stage.querySelectorAll(".reviews-slide");
  if (!slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  const letterCenterTf = "translate(-50%, -50%)";

  const isReviewsMobileStack = () =>
    window.innerWidth <= 1200 ||
    document.documentElement.clientWidth <= 1200 ||
    window.matchMedia("(max-width: 1200px)").matches;

  function initMobileStackState() {
    slides.forEach((s, i) => s.classList.toggle("active", i === 0));
    currentSlide = 0;
    slides.forEach((slide, index) => {
      const portrait = slide.querySelector(".reviews-portrait-img");
      const letter = slide.querySelector(".reviews-letter-img");
      const person = slide.querySelector(".reviews-person-info");
      const frame = slide.querySelector(".reviews-letter-frame");
      
      slide.style.opacity = index === 0 ? "1" : "0";
      
      if (frame) {
        frame.style.transformOrigin = "";
        frame.style.transform = "";
      }
      if (portrait) portrait.style.transform = "";
      if (letter) letter.style.transform = letterCenterTf;
      if (person) {
        person.style.transform = "";
        person.style.opacity = "1";
      }
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
      
      slide.style.opacity = "";
      
      if (frame) {
        frame.style.transformOrigin = "";
        frame.style.transform = "";
      }
      if (index === 0) {
        if (portrait) portrait.style.transform = "translateY(0)";
        if (letter) letter.style.transform = `${letterCenterTf} scale(1)`;
        if (person) {
          person.style.transform = "translateY(0)";
          person.style.opacity = "1";
        }
      } else {
        if (portrait) portrait.style.transform = "translateY(100%)";
        if (letter) letter.style.transform = `${letterCenterTf} scale(0)`;
        if (person) {
          person.style.transform = "translateY(0)";
          person.style.opacity = "1";
        }
      }
    });
  }

  if (isReviewsMobileStack()) initMobileStackState();
  else initDesktopStackState();

  layoutReviewsOfficialLetterIntrinsics();

  function handleScroll() {
    if (reviewsScreen.dataset.reviewsTab !== "official") return;

    const rect = reviewsScreen.getBoundingClientRect();
    const physicalWindowHeight = window.innerHeight;
    const layoutWindowHeight = physicalWindowHeight / getPageScale(); 
    const sectionHeight = reviewsScreen.offsetHeight;
    
    if (rect.bottom < 0 || rect.top > physicalWindowHeight) return;

    const maxScroll = Math.max(1, sectionHeight - layoutWindowHeight);
    const sectionTop = getElementDocumentOffsetTop(reviewsScreen);
    const currentScroll = Math.max(
      0,
      Math.min(maxScroll, getDocumentScrollY() - sectionTop),
    );

    const narrow = isReviewsMobileStack();

    if (narrow) {
      const virtualScroll = (currentScroll / maxScroll) * (maxScroll * 6);
      const totalScrollRange = maxScroll * 6;
      const slideScrollSpace = totalScrollRange / totalSlides;
      let activeSlideIndex = 0;
      let fadeProgress = 0;
      
      for (let i = 0; i < totalSlides; i++) {
        const slideStart = i * slideScrollSpace;
        const slideEnd = (i + 1) * slideScrollSpace;
        
        if (virtualScroll >= slideStart && virtualScroll < slideEnd) {
          activeSlideIndex = i;
          fadeProgress = (virtualScroll - slideStart) / slideScrollSpace;
          break;
        } else if (i === totalSlides - 1 && virtualScroll >= slideStart) {
          activeSlideIndex = i;
          fadeProgress = 1;
        }
      }

      if (activeSlideIndex !== currentSlide) {
        slides.forEach((s) => s.classList.remove("active"));
        if (slides[activeSlideIndex]) slides[activeSlideIndex].classList.add("active");
        currentSlide = activeSlideIndex;
      }

      slides.forEach((slide, index) => {
        if (index < activeSlideIndex) {
          slide.style.opacity = "0";
        } else if (index === activeSlideIndex) {
          if (index === totalSlides - 1) {
            slide.style.opacity = "1";
          } else if (fadeProgress < 0.3) {
            slide.style.opacity = "1";
          } else if (fadeProgress < 0.5) {
            slide.style.opacity = String(1 - ((fadeProgress - 0.3) / 0.2));
          } else {
            slide.style.opacity = "0";
          }
        } else if (index === activeSlideIndex + 1) {
          if (fadeProgress < 0.5) {
            slide.style.opacity = "0";
          } else {
            slide.style.opacity = String((fadeProgress - 0.5) / 0.5);
          }
        } else {
          slide.style.opacity = "0";
        }
      });
    } else {
      let scrollProgress;
      if (currentScroll < maxScroll * 0.1) {
        scrollProgress = 0;
      } else {
        const animatedScroll = currentScroll - maxScroll * 0.1;
        const animatedMaxScroll = maxScroll * 0.9;
        scrollProgress = (animatedScroll / animatedMaxScroll) * (totalSlides - 1) + 1;
      }

      const textScrollProgress = (currentScroll / maxScroll) * totalSlides;
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
        const frame0 = firstSlide.querySelector(".reviews-letter-frame");
        if (portrait) portrait.style.transform = "translateY(0)";
        if (letter) letter.style.transform = `${letterCenterTf} scale(1)`;
        if (frame0) {
          frame0.style.transformOrigin = "";
          frame0.style.transform = "";
        }

        if (slides[1]) {
          const nextPortrait = slides[1].querySelector(".reviews-portrait-img");
          const nextLetter = slides[1].querySelector(".reviews-letter-img");
          if (nextPortrait) nextPortrait.style.transform = "translateY(100%)";
          if (nextLetter) nextLetter.style.transform = `${letterCenterTf} scale(0)`;
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
          letter.style.transform = `${letterCenterTf} scale(${letterScale})`;
        }
        if (frame) {
          const frameScale = localProgress;
          /* Тот же центр, что у .reviews-letter-img (центр «окна»), иначе рамка уезжает вверх относительно грамоты */
          frame.style.transformOrigin = "center center";
          frame.style.transform = `scale(${frameScale})`;
        }

        for (let i = currentSlide + 1; i < totalSlides; i += 1) {
          const nextSlide = slides[i];
          const nextPortrait = nextSlide.querySelector(".reviews-portrait-img");
          const nextLetter = nextSlide.querySelector(".reviews-letter-img");
          if (nextPortrait) nextPortrait.style.transform = "translateY(100%)";
          if (nextLetter) nextLetter.style.transform = `${letterCenterTf} scale(0)`;
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

      slides.forEach((slide) => {
        slide.style.opacity = "";
      });
    }
  }

  window.addEventListener("resize", () => {
    layoutReviewsOfficialLetterIntrinsics();
    if (isReviewsMobileStack()) initMobileStackState();
    else initDesktopStackState();
    handleScroll();
  }, { passive: true });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("reviews:tabchange", (event) => {
    if (event.detail?.tab === "official") {
      layoutReviewsOfficialLetterIntrinsics();
      if (isReviewsMobileStack()) initMobileStackState();
      else initDesktopStackState();
    }
    requestAnimationFrame(() => {
      requestAnimationFrame(handleScroll);
    });
  });

  stage.querySelectorAll(".reviews-letter-img").forEach((img) => {
    const onLetterImgReady = () => {
      layoutReviewsOfficialLetterIntrinsics();
      handleScroll();
    };
    img.addEventListener("load", onLetterImgReady, { passive: true });
    if (img.complete && img.naturalWidth) onLetterImgReady();
  });

  handleScroll();
  requestAnimationFrame(() => handleScroll());
  setTimeout(() => handleScroll(), 250);
}

function initSubscribeNewsCheck() {
  const btn = document.getElementById("subscribeCheck");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const on = btn.classList.toggle("is-checked");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initInterviewInteractions();
  initInterviewDots();
  initInterviewPeriods();
  initNewsGallery();
  initReviewsSliders();
  initReviewsTabs();
  initReviewsOfficialScrollEffect();
  initReviewsStickyAlign();
  initSubscribeNewsCheck();
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
      slideWidth: Math.round(vw * (isMobile ? 0.638 : 0.385)),
      gap: Math.round(vw * (isMobile ? 0.176 : 0.022)),
    };
  }

  function initRing(ring, rowIndex) {
    const slides = [...ring.querySelectorAll('.media-lib-slide')];
    const n = slides.length;
    const { slideWidth, gap } = getSlideParams();
    const isMobile = window.innerWidth <= 1200;
    // На мобилке используем фиксированную высоту вместо vh
    const slideHeight = isMobile ? 300 : Math.round(window.innerHeight * 0.275);
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

initMediaLibCarousel();

// ============================================
// VIDEOTEKA TABS WRAPPER
// ============================================

function initVideotekaTabs() {
  const BREAKPOINT = 1200;
  const tabs = document.querySelector('.videoteka-tabs');
  if (!tabs || tabs.dataset.initialized) return;
  tabs.dataset.initialized = 'true';

  const title = tabs.querySelector('.videoteka-title-mobile');
  const buttons = Array.from(tabs.querySelectorAll('.videoteka-tab'));
  const extraBtn = tabs.querySelector('.videoteba-tab-btn');
  if (!title || !buttons.length) return;

  const firstActive = buttons.find(b => b.classList.contains('is-active')) || buttons[0];

  const trigger = document.createElement('button');
  trigger.className = 'videoteka-tabs-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `<span>${firstActive.querySelector("span").textContent}</span><img src="./assets/doun.svg" alt="" aria-hidden="true" />`;

  const dropdown = document.createElement('div');
  dropdown.className = 'videoteka-tabs-dropdown';

  const list = document.createElement('div');
  list.className = 'videoteka-tabs-dropdown-list';

  buttons.forEach(btn => {
    const clone = btn.cloneNode(true);
    clone.classList.add('videoteka-tab-dropdown-item');
    clone.querySelectorAll("img").forEach((img) => img.remove());
    list.appendChild(clone);
  });
  dropdown.appendChild(list);

  const wrapper = document.createElement('div');
  wrapper.className = 'videoteka-tabs-wrapper';
  buttons.forEach(btn => wrapper.appendChild(btn));
  if (extraBtn) wrapper.appendChild(extraBtn);
  tabs.appendChild(wrapper);

  tabs.insertBefore(trigger, wrapper);
  tabs.appendChild(dropdown);

  trigger.addEventListener('click', (e) => {
    if (window.innerWidth > BREAKPOINT) return;
    e.preventDefault();
    const next = !tabs.classList.contains('is-expanded');
    tabs.classList.toggle('is-expanded', next);
    trigger.setAttribute('aria-expanded', next ? 'true' : 'false');
  });

  const allDropdownBtns = Array.from(list.querySelectorAll('.videoteka-tab'));
  allDropdownBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth > BREAKPOINT) return;
      const label = btn.querySelector('span')?.textContent || '';
      trigger.querySelector('span').textContent = label;

      allDropdownBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      buttons.forEach(b => b.classList.remove('is-active'));
      const matchIdx = allDropdownBtns.indexOf(btn);
      if (buttons[matchIdx]) {
        buttons[matchIdx].classList.add('is-active');
        buttons[matchIdx].click();
      }

      tabs.classList.remove('is-expanded');
      trigger.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > BREAKPOINT && tabs.classList.contains('is-expanded')) {
      tabs.classList.remove('is-expanded');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

if (document.querySelector('.videoteka-tabs')) {
  initVideotekaTabs();
}

(function initVideotekaFilter() {
  const tabs = document.querySelector('.videoteka-tabs');
  const list = document.querySelector('.videoteka-list');
  if (!tabs || !list) return;

  const items = Array.from(list.querySelectorAll('.videoteka-item'));

  function filterByCategory(category) {
    items.forEach(item => {
      if (!category || category === 'all' || item.dataset.category === category) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  filterByCategory('all');

  function showAllVideotekaVideos() {
    tabs.querySelectorAll('.videoteka-tab').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    tabs.querySelectorAll('.videoteka-tabs-dropdown .videoteka-tab').forEach(b => {
      b.classList.remove('is-active');
    });
    filterByCategory('all');
    const triggerSpan = tabs.querySelector('.videoteka-tabs-trigger span');
    if (triggerSpan) triggerSpan.textContent = 'Смотреть все видео';
    tabs.classList.remove('is-expanded');
    const trig = tabs.querySelector('.videoteka-tabs-trigger');
    if (trig) trig.setAttribute('aria-expanded', 'false');
  }

  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.videoteka-tab');
    const allBtn = e.target.closest('.videoteba-tab-btn');

    if (allBtn) {
      showAllVideotekaVideos();
      return;
    }

    if (!btn) return;

    tabs.querySelectorAll('.videoteka-tab').forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');

    filterByCategory(btn.dataset.category);
  });

  const allVideosFooterBtn = document.querySelector('.videoteka-all-videos-btn');
  if (allVideosFooterBtn) {
    allVideosFooterBtn.addEventListener('click', () => showAllVideotekaVideos());
  }
})();

// ============================================
// YOUTUBE PLAYER
// ============================================

function closeYtPlayer(player) {
  player.classList.remove('is-playing');
  const iframe = player.querySelector('iframe');
  if (iframe) iframe.remove();
}

document.querySelectorAll('.yt-player').forEach(player => {
  player.addEventListener('click', (e) => {
    e.stopPropagation();
    if (player.classList.contains('is-playing')) return;
    document.querySelectorAll('.yt-player.is-playing').forEach(closeYtPlayer);
    const rutubeId = player.dataset.rutubeId;
    const ytId = player.dataset.ytId;
    if (!rutubeId && !ytId) return;

    player.classList.add('is-playing');
    const iframe = document.createElement('iframe');
    if (rutubeId) {
      iframe.src = `https://rutube.ru/play/embed/${rutubeId}?autoplay=1`;
    } else {
      iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    }
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    player.appendChild(iframe);

    iframe.addEventListener('error', () => {
      iframe.remove();
      player.classList.remove('is-playing');
      const url = rutubeId
        ? `https://rutube.ru/video/${rutubeId}/`
        : `https://www.youtube.com/watch?v=${ytId}`;
      window.open(url, '_blank');
    });
  });
});

document.addEventListener('click', () => {
  document.querySelectorAll('.yt-player.is-playing').forEach(closeYtPlayer);
});

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
      
      footerColumns.forEach((item) => {
        item.classList.remove('is-open');
        const itemTitle = item.querySelector('.footer-column-title');
        if (itemTitle) itemTitle.setAttribute('aria-expanded', 'false');
      });

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

// ==========================================
// SALES POPUP
// ==========================================
(function initSalesPopup() {
  const salesPopup = document.getElementById("salesPopup");
  const salesPopupClose = document.getElementById("salesPopupClose");
  const salesPopupCheck = document.getElementById("salesPopupCheck");
  const salesPopupForm = document.querySelector(".sales-popup-form");
  const salesPopupSubmit = document.querySelector(".sales-popup-submit");
  const salesPopupBackdrop = document.querySelector(".sales-popup-backdrop");
  const salesPopupTriggers = [...document.querySelectorAll('a[href="#salesPopup"]')];

  if (!salesPopup || !salesPopupClose || !salesPopupCheck || !salesPopupForm || !salesPopupSubmit) return;

  const setOpen = (isOpen) => {
    if (isOpen) {
      salesPopup.classList.remove("is-closing");
      salesPopup.classList.add("is-open");
      salesPopup.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    } else {
      salesPopup.classList.add("is-closing");
      setTimeout(() => {
        salesPopup.classList.remove("is-open", "is-closing");
        salesPopup.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }, 300);
    }
  };

  salesPopupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(true);
    });
  });

  salesPopupClose.addEventListener("click", () => setOpen(false));
  salesPopupBackdrop?.addEventListener("click", () => setOpen(false));

  salesPopupCheck.addEventListener("click", () => {
    const nextChecked = !salesPopupCheck.classList.contains("is-checked");
    salesPopupCheck.classList.toggle("is-checked", nextChecked);
    salesPopupCheck.setAttribute("aria-pressed", nextChecked ? "true" : "false");
  });

  salesPopupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setOpen(false);
  });

  salesPopupSubmit.addEventListener("click", () => {
    setOpen(false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && salesPopup.classList.contains("is-open")) {
      setOpen(false);
    }
  });
})();

// Плавное изменение цвета фона тёмных карточек партнёров при скролле
(function initPartnersScrollEffect() {
  const partnersSection = document.getElementById('partnersScreen');
  if (!partnersSection) return;

  const darkCards = partnersSection.querySelectorAll('.partners-card-dark');
  if (!darkCards.length) return;

  // Добавляем новые элементы к каждой тёмной карточке
  darkCards.forEach(card => {
    // Добавляем новую стрелку brown-arrow.svg
    const arrow = card.querySelector('.partners-card-arrow');
    if (arrow) {
      const newArrow = document.createElement('div');
      newArrow.className = 'partners-card-arrow-new';
      card.appendChild(newArrow);
    }
    
    // Добавляем новый логотип runline.svg
    const logoWrap = card.querySelector('.partners-logo-wrap');
    if (logoWrap) {
      const newLogo = document.createElement('div');
      newLogo.className = 'partners-logo-new';
      logoWrap.appendChild(newLogo);
    }
  });

  function updatePartnersCards() {
    const sectionRect = partnersSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Добавляем класс только когда секция находится в центре экрана или выше
    // sectionRect.top < 0 означает что верх секции уже выше верха экрана
    if (sectionRect.top < 0 && sectionRect.bottom > viewportHeight * 0.5) {
      darkCards.forEach(card => card.classList.add('is-scrolled'));
    } else {
      darkCards.forEach(card => card.classList.remove('is-scrolled'));
    }
  }

  window.addEventListener('scroll', updatePartnersCards, { passive: true });
  updatePartnersCards(); // Проверяем при загрузке
})();
