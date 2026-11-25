(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  const ICONS = {
    spark:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3v18M5.6 5.6l12.8 12.8M3 12h18M5.6 18.4L18.4 5.6"/></svg>',
    shield:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3Z"/></svg>',
    rings:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>',
    drop:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 2.5s6 6.8 6 11.2a6 6 0 1 1-12 0C6 9.3 12 2.5 12 2.5Z"/></svg>',
    box:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/></svg>',
    sound:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>',
    check:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>',
    lock:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></svg>',
  };

  let pendingFeaturedDirection = null;

  function renderFeaturedSection() {
    const container = document.getElementById('featured-grid');
    if (!container) return;

    const { featuredEdit } = Luvra.CATALOG;
    const { featuredOffset } = Luvra.store.getState();

    const visibleItems = [];
    for (let i = 0; i < 3; i++) {
      visibleItems.push(featuredEdit[(featuredOffset + i) % featuredEdit.length]);
    }

    container.classList.remove('is-sliding-next', 'is-sliding-prev');
    container.innerHTML = visibleItems
      .map((entry) => {
        if (entry.type === 'editorial') {
          return Luvra.renderEditorialCard(entry);
        }
        const product = Luvra.store.getProductById(entry.id);
        return product
          ? Luvra.renderProductCard(product, {
              variant: 'featured',
              badgeOverride: entry.badge,
              showVariants: false,
            })
          : '';
      })
      .join('');

    if (pendingFeaturedDirection === 'next' || pendingFeaturedDirection === 'prev') {
      const cls = pendingFeaturedDirection === 'next' ? 'is-sliding-next' : 'is-sliding-prev';
      pendingFeaturedDirection = null;
      void container.offsetWidth;
      container.classList.add(cls);
      global.setTimeout(() => container.classList.remove(cls), 500);
    }
  }

  function renderArsenalSection() {
    const container = document.getElementById('arsenal-grid');
    if (!container) return;

    container.innerHTML = Luvra.CATALOG.arsenal
      .map(
        (item) => `
        <button type="button" class="arsenal-card ${item.lead ? 'arsenal-card--lead' : ''}" data-quickview="${item.id}" aria-label="View ${item.title}">
          <img class="arsenal-card__img" src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" />
          <div class="arsenal-card__scrim" aria-hidden="true"></div>
          <div class="arsenal-card__content">
            <div>
              <h3 class="arsenal-card__title">${item.title}</h3>
              <p class="arsenal-card__sub">${item.subtitle}</p>
            </div>
            <span class="arsenal-card__price">$${item.price}</span>
          </div>
        </button>
      `
      )
      .join('');
  }

  function renderDesireCategories() {
    const container = document.getElementById('desire-tiles');
    if (!container) return;

    const { activeCategory } = Luvra.store.getState();

    container.innerHTML = Luvra.CATALOG.categories
      .map(
        (cat) => `
        <button type="button" class="desire-tile ${activeCategory === cat.slug ? 'is-active' : ''}" data-filter-jump="${cat.slug}">
          <span class="desire-tile__icon">${ICONS[cat.icon] || ''}</span>
          <span class="desire-tile__name">${cat.name}</span>
          <span class="desire-tile__sub">${cat.subtitle}</span>
        </button>
      `
      )
      .join('');
  }

  function renderCollectionSection() {
    const grid = document.getElementById('collection-grid');
    if (!grid) return;

    const toggleWrap = document.getElementById('collection-footer');
    const toggleBtn = document.getElementById('collection-toggle-btn');
    const { activeCategory, showAllCollection } = Luvra.store.getState();

    document.querySelectorAll('.filter-pill').forEach((pill) => {
      const isActive = pill.dataset.filter === activeCategory;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-pressed', String(isActive));
    });

    const filtered = Luvra.CATALOG.products.filter((product) => {
      if (activeCategory === 'all') {
        return showAllCollection ? !product.editorialOnly : product.flagship;
      }
      return product.category === activeCategory;
    });

    grid.innerHTML = filtered
      .map((product) => Luvra.renderProductCard(product, { variant: 'collection' }))
      .join('');

    if (toggleWrap && toggleBtn) {
      if (activeCategory === 'all') {
        toggleWrap.style.display = 'flex';
        toggleBtn.textContent = showAllCollection ? 'Show Featured 4' : 'View Full Edit';
      } else {
        toggleWrap.style.display = 'none';
      }
    }
  }

  function renderPromisesSection() {
    const container = document.getElementById('promise-cards');
    if (!container) return;

    container.innerHTML = Luvra.CATALOG.promises
      .map(
        (item) => `
        <article class="promise-card">
          <div class="promise-card__icon">${ICONS[item.icon] || ''}</div>
          <h3 class="promise-card__title">${item.title}</h3>
          <p class="promise-card__desc">${item.desc}</p>
        </article>
      `
      )
      .join('');
  }

  function renderTestimonialsSection() {
    const container = document.getElementById('testimonials-grid');
    if (!container) return;

    container.innerHTML = Luvra.CATALOG.testimonials
      .map(
        (item) => `
        <article class="testimonial-card">
          <p class="testimonial-card__quote">${item.quote}</p>
          <footer class="testimonial-card__meta">
            <span class="testimonial-card__author">${item.author}</span>
            <span class="testimonial-card__product">${item.product}</span>
          </footer>
        </article>
      `
      )
      .join('');
  }

  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email');
    const feedback = document.getElementById('newsletter-feedback');
    if (!form || !input || !feedback) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        feedback.textContent = 'Please enter a valid email address.';
        return;
      }
      feedback.textContent = `Welcome to the Inner Circle, ${email}. Your private invitation note is confirmed.`;
      input.value = '';
    });
  }

  function jumpToCollectionFilter(category) {
    Luvra.store.setCategory(category);
    const collectionEl = document.getElementById('collection');
    if (collectionEl) {
      collectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function initAtmosphere() {
    const prefersReduced =
      typeof global.matchMedia === 'function' &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Gentle ambient pointer glow on fine-pointer (desktop) devices
    const isFinePointer =
      typeof global.matchMedia === 'function' &&
      global.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (isFinePointer && document.createElement && document.body && global.requestAnimationFrame) {
      const glow = document.createElement('div');
      glow.className = 'luvra-ambient-glow';
      glow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glow);

      let targetX = -400;
      let targetY = -400;
      let currentX = -400;
      let currentY = -400;
      let rafRunning = false;

      function tickGlow() {
        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;
        glow.style.transform = `translate3d(${currentX - 220}px, ${currentY - 220}px, 0)`;
        if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
          global.requestAnimationFrame(tickGlow);
        } else {
          rafRunning = false;
        }
      }

      document.addEventListener('pointermove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        glow.classList.add('is-active');
        if (!rafRunning) {
          rafRunning = true;
          global.requestAnimationFrame(tickGlow);
        }
      });

      document.addEventListener('pointerleave', () => {
        glow.classList.remove('is-active');
      });
    }

    // Subtle scroll-triggered section reveal (keep newsletter-section free of transform layers)
    const sections = document.querySelectorAll('.section');
    if (!sections || !sections.length) return;

    if (typeof global.IntersectionObserver !== 'function') {
      sections.forEach((sec) => sec.classList.add('is-revealed'));
      return;
    }

    const observer = new global.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );

    sections.forEach((sec) => {
      sec.setAttribute('data-reveal', '');
      observer.observe(sec);
    });
  }

  /**
   * Drifting pinkish-white winter fog waves and subtle micro-sparkles behind hero text.
   */
  function initHeroWinterFog() {
    const canvas = document.getElementById('hero-fog-canvas');
    const heroSection = document.querySelector('.hero');
    if (!canvas || !heroSection || typeof canvas.getContext !== 'function') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof global.matchMedia === 'function' &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function hash(n) {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    }

    // Thin, elongated pinkish-white winter fog waves starting from upper-middle to bottom
    const fogClouds = Array.from({ length: 24 }, (_, idx) => ({
      startPhase: idx / 24 + hash(idx + 3) * 0.06,
      baseV: 0.42 + hash(idx + 19) * 0.52,
      tiltV: (hash(idx + 31) - 0.5) * 0.12,
      rx: 0.18 + hash(idx + 37) * 0.14,
      ry: 0.03 + hash(idx + 53) * 0.032,
      speed: 0.02 + hash(idx + 71) * 0.018,
      bobAmp: 0.018 + hash(idx + 83) * 0.018,
      bobFreq: 0.3 + hash(idx + 89) * 0.25,
      phase: hash(idx + 107) * Math.PI * 2,
      alpha: 0.14 + hash(idx + 131) * 0.08,
      spriteIdx: idx % 3,
    }));

    // Crisp GPU-composited micro-sparkles rendered in SVG/DOM layer (never upscaled/pixelated)
    const sparklesHost = document.getElementById('hero-sparkles');
    if (sparklesHost && typeof document.createElement === 'function') {
      const frag = document.createDocumentFragment ? document.createDocumentFragment() : null;
      for (let idx = 0; idx < 22; idx++) {
        const sp = document.createElement('span');
        const isStar = idx % 5 === 0;
        const sizePx = isStar ? 5 + hash(idx + 281) * 3 : 2.5 + hash(idx + 293) * 2.5;
        sp.className = isStar ? 'hero__sparkle hero__sparkle--star' : 'hero__sparkle';
        sp.style.left = `${(6 + hash(idx + 149) * 88).toFixed(2)}%`;
        sp.style.top = `${(8 + hash(idx + 167) * 82).toFixed(2)}%`;
        sp.style.width = `${sizePx.toFixed(1)}px`;
        sp.style.height = `${sizePx.toFixed(1)}px`;
        if (typeof sp.style.setProperty === 'function') {
          sp.style.setProperty('--sp-dur', `${(5.4 + hash(idx + 241) * 4.2).toFixed(2)}s`);
          sp.style.setProperty('--sp-delay', `${(-hash(idx + 211) * 6).toFixed(2)}s`);
          sp.style.setProperty('--sp-dx', `${((hash(idx + 181) - 0.35) * 18).toFixed(1)}px`);
          sp.style.setProperty('--sp-dy', `${(6 + hash(idx + 199) * 14).toFixed(1)}px`);
          sp.style.setProperty('--sp-max', `${(0.32 + hash(idx + 263) * 0.28).toFixed(2)}`);
        }
        if (frag) frag.appendChild(sp);
        else sparklesHost.appendChild(sp);
      }
      if (frag) sparklesHost.appendChild(frag);
    }

    let width = 0;
    let height = 0;
    let rafId = null;
    let isVisible = true;
    let lastDrawMs = 0;
    const startTime =
      typeof global.performance === 'object' && global.performance.now ? global.performance.now() : Date.now();

    // Pre-bake 3 reusable soft radial mist sprites once (zero per-frame gradient allocations)
    const mistPalette = ['250, 232, 239', '238, 198, 214', '246, 218, 229'];
    const mistSprites = mistPalette.map((rgb) => {
      if (typeof document.createElement !== 'function') return null;
      const off = document.createElement('canvas');
      if (!off || typeof off.getContext !== 'function') return null;
      off.width = 128;
      off.height = 128;
      const octx = off.getContext('2d');
      if (!octx) return null;
      const g = octx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, `rgba(${rgb}, 1)`);
      g.addColorStop(0.5, `rgba(${rgb}, 0.42)`);
      g.addColorStop(1, `rgba(${rgb}, 0)`);
      octx.fillStyle = g;
      octx.fillRect(0, 0, 128, 128);
      return off;
    });

    function syncSize() {
      const cssW = heroSection.clientWidth || 0;
      const cssH = heroSection.clientHeight || 0;
      if (!cssW || !cssH) return false;
      // Low internal resolution (~480px wide) makes GPU bilinear upscaling naturally dreamy without blur shaders
      const scale = Math.min(1, 480 / cssW);
      const w = Math.max(160, Math.round(cssW * scale));
      const h = Math.max(120, Math.round(cssH * scale));
      if (w !== width || h !== height) {
        width = w;
        height = h;
        canvas.width = w;
        canvas.height = h;
      }
      return true;
    }

    function renderFrame(nowMs) {
      if (!syncSize()) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const elapsed = Math.max(0, (nowMs - startTime) / 1000);

      // Overlapping soft pinkish-white winter fog waves drifting across the right 60% character side (full width on mobile)
      const isNarrow = (heroSection.clientWidth || width) <= 600;
      const uStart = isNarrow ? -0.18 : 0.32;
      const uSpan = isNarrow ? 1.36 : 0.86;

      fogClouds.forEach((c) => {
        const life = prefersReduced ? 0.5 : (c.startPhase + elapsed * c.speed) % 1;
        const lifeFade = Math.sin(life * Math.PI);
        if (lifeFade <= 0.01) return;

        const u = uStart + life * uSpan;
        const v =
          c.baseV +
          c.tiltV * (life - 0.5) +
          (prefersReduced ? 0 : Math.sin(elapsed * c.bobFreq + c.phase) * c.bobAmp);
        const swell = prefersReduced ? 1 : 0.94 + 0.12 * Math.sin(elapsed * 0.35 + c.phase);
        const cx = u * width;
        const cy = v * height;
        const rx = c.rx * width * swell;
        const ry = c.ry * height * swell;
        const sprite = mistSprites[c.spriteIdx];
        const effAlpha = c.alpha * lifeFade;

        if (sprite) {
          ctx.save();
          ctx.globalAlpha = effAlpha;
          ctx.drawImage(sprite, cx - rx, cy - ry, rx * 2, ry * 2);
          ctx.restore();
        } else {
          const rad = Math.max(rx, ry);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(rx / rad, ry / rad);
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
          grad.addColorStop(0, `rgba(246, 222, 232, ${effAlpha})`);
          grad.addColorStop(1, 'rgba(246, 222, 232, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    }

    function tick(now) {
      if (!isVisible || document.hidden) {
        rafId = null;
        return;
      }
      // Smooth 30fps cap for slow ambient mist saves half the GPU fill-rate
      if (now - lastDrawMs >= 32) {
        lastDrawMs = now;
        renderFrame(now);
      }
      rafId = global.requestAnimationFrame(tick);
    }

    function startLoop() {
      if (prefersReduced) {
        renderFrame(startTime);
        return;
      }
      if (!rafId && typeof global.requestAnimationFrame === 'function') {
        rafId = global.requestAnimationFrame(tick);
      }
    }

    if (typeof global.IntersectionObserver === 'function') {
      const obs = new global.IntersectionObserver(
        (entries) => {
          isVisible = Boolean(entries[0] && entries[0].isIntersecting);
          if (isVisible) startLoop();
        },
        { threshold: 0.01 }
      );
      obs.observe(heroSection);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isVisible) startLoop();
    });

    startLoop();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const drawers = Luvra.initDrawers();
    if (Luvra.initCommonShell) {
      Luvra.initCommonShell(drawers);
    }
    initAtmosphere();

    const pageMode = document.body.dataset.page || 'home';

    if (pageMode === 'home') {
      initHeroWinterFog();
      renderFeaturedSection();
      renderArsenalSection();
      renderDesireCategories();
      renderCollectionSection();
      renderPromisesSection();
      renderTestimonialsSection();
      initNewsletter();

      Luvra.store.subscribe(() => {
        renderFeaturedSection();
        renderDesireCategories();
        renderCollectionSection();
      });

      const prevBtn = document.getElementById('featured-prev');
      const nextBtn = document.getElementById('featured-next');
      const toggleBtn = document.getElementById('collection-toggle-btn');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          pendingFeaturedDirection = 'prev';
          Luvra.store.shiftFeatured(-1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          pendingFeaturedDirection = 'next';
          Luvra.store.shiftFeatured(1);
        });
      }
      if (toggleBtn) toggleBtn.addEventListener('click', () => Luvra.store.toggleShowAllCollection());

      document.querySelectorAll('.filter-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          Luvra.store.setCategory(pill.dataset.filter);
        });
      });

      document.addEventListener('click', (e) => {
        const filterJump = e.target.closest('[data-filter-jump]');
        if (filterJump) {
          jumpToCollectionFilter(filterJump.getAttribute('data-filter-jump'));
        }
      });
    } else if (pageMode === 'product' && Luvra.initProductDetailPage) {
      Luvra.initProductDetailPage();
    } else if (pageMode === 'quiz' && Luvra.initProductQuiz) {
      Luvra.initProductQuiz();
    } else if (pageMode === 'cart' && Luvra.initCartPage) {
      Luvra.initCartPage();
    } else if (pageMode === 'checkout' && Luvra.initCheckoutPage) {
      Luvra.initCheckoutPage();
    } else if (
      ['account', 'reset-password', 'orders', 'addresses', 'favorites'].includes(pageMode) &&
      Luvra.initAccountPage
    ) {
      Luvra.initAccountPage(pageMode);
    } else if (
      ['privacy', 'terms', 'shipping', 'returns', 'help'].includes(pageMode) &&
      Luvra.initPolicyPage
    ) {
      Luvra.initPolicyPage(pageMode);
    } else if (Luvra.initCatalogExplorer) {
      Luvra.initCatalogExplorer(pageMode);
    }
  });
})(window);
