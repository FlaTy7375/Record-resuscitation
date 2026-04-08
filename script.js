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
    slidesOffsetAfter: window.innerWidth <= 1200 ? 0 : 100,
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
