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

  function renderFeaturedSection() {
    const container = document.getElementById('featured-grid');
    if (!container) return;

    const { featuredEdit } = Luvra.CATALOG;
    const { featuredOffset } = Luvra.store.getState();

    const visibleItems = [];
    for (let i = 0; i < 3; i++) {
      visibleItems.push(featuredEdit[(featuredOffset + i) % featuredEdit.length]);
    }

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
  }

  function renderArsenalSection() {
    const container = document.getElementById('arsenal-grid');
    if (!container) return;

    container.innerHTML = Luvra.CATALOG.arsenal
      .map(
        (item) => `
        <button type="button" class="arsenal-card ${item.lead ? 'arsenal-card--lead' : ''}" data-quickview="${item.id}" aria-label="View ${item.title}">
          <img class="arsenal-card__img" src="${item.image}" alt="${item.title}" loading="lazy" />
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

  document.addEventListener('DOMContentLoaded', () => {
    const drawers = Luvra.initDrawers();
    if (Luvra.initCommonShell) {
      Luvra.initCommonShell(drawers);
    }
    initAtmosphere();

    const pageMode = document.body.dataset.page || 'home';

    if (pageMode === 'home') {
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

      if (prevBtn) prevBtn.addEventListener('click', () => Luvra.store.shiftFeatured(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => Luvra.store.shiftFeatured(1));
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
