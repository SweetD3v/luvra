(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  Luvra.initCommonShell = function initCommonShell(drawers) {
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const categoriesNavItem = document.getElementById('nav-categories-item');
    const categoriesTrigger = document.getElementById('nav-categories-trigger');

    if (mobileBtn && mobileNav) {
      mobileBtn.addEventListener('click', () => {
        const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
        mobileBtn.setAttribute('aria-expanded', String(!expanded));
        mobileNav.classList.toggle('is-open', !expanded);
      });

      mobileNav.querySelectorAll('a, button').forEach((el) => {
        el.addEventListener('click', () => {
          mobileBtn.setAttribute('aria-expanded', 'false');
          mobileNav.classList.remove('is-open');
        });
      });
    }

    if (categoriesNavItem && categoriesTrigger) {
      categoriesTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = categoriesNavItem.classList.toggle('is-open');
        categoriesTrigger.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!categoriesNavItem.contains(e.target)) {
          categoriesNavItem.classList.remove('is-open');
          categoriesTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    document.addEventListener('click', (e) => {
      const variantBtn = e.target.closest('[data-select-variant]');
      if (variantBtn) {
        e.stopPropagation();
        const productId = variantBtn.getAttribute('data-select-variant');
        const label = variantBtn.getAttribute('data-variant-label');
        Luvra.store.setSelectedVariant(productId, label);
        return;
      }

      const favBtn = e.target.closest('[data-toggle-favorite]');
      if (favBtn) {
        e.stopPropagation();
        const productId = favBtn.getAttribute('data-toggle-favorite');
        Luvra.store.toggleFavorite(productId);
        return;
      }

      const addBtn = e.target.closest('[data-add-to-bag]');
      if (addBtn) {
        const productId = addBtn.getAttribute('data-add-to-bag');
        const added = Luvra.store.addToCart(productId);
        if (added) {
          const targets = document.querySelectorAll(
            `[data-product-id="${productId}"] [data-add-to-bag]`
          );
          const list = targets.length ? Array.from(targets) : [addBtn];
          list.forEach((btn) => {
            const originalText = btn.textContent;
            btn.classList.add('is-added');
            btn.textContent = 'Added to Bag';
            global.setTimeout(() => {
              btn.classList.remove('is-added');
              btn.textContent = originalText;
            }, 900);
          });
          if (drawers && drawers.openCart) {
            drawers.openCart();
          }
        }
        return;
      }

      const quickViewTrigger = e.target.closest('[data-quickview]');
      if (quickViewTrigger && drawers) {
        drawers.openQuickView(quickViewTrigger.getAttribute('data-quickview'));
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && drawers) {
        const mediaTrigger = e.target.closest('.product-card__media[data-quickview]');
        if (mediaTrigger) {
          e.preventDefault();
          drawers.openQuickView(mediaTrigger.getAttribute('data-quickview'));
        }
      }
    });
  };

  Luvra.initCatalogExplorer = function initCatalogExplorer(pageMode) {
    const params = new URLSearchParams(global.location.search);
    const initialCategory = params.get('category') || 'all';
    const initialCollection = params.get('collection') || 'all';
    const initialQuery = params.get('q') || '';
    const initialSort = params.get('sort') || 'featured';

    const filterState = {
      query: initialQuery,
      category: initialCategory,
      collection: initialCollection,
      price: params.get('price') || 'all',
      materials: [],
      features: [],
      availability: params.get('availability') || 'all',
      sort: initialSort,
    };

    let isHydrating = true;

    const gridEl = document.getElementById('shop-grid');
    const countEl = document.getElementById('catalog-count');
    const chipsEl = document.getElementById('active-chips');
    const sidebarEl = document.getElementById('filter-sidebar');
    const mobileFilterCountEl = document.getElementById('mobile-filter-count');
    const sortSelect = document.getElementById('catalog-sort-select');
    const searchInput = document.getElementById('catalog-search-input');
    const searchForm = document.getElementById('catalog-search-form');
    const searchClearBtn = document.getElementById('catalog-search-clear');
    const suggestionsEl = document.getElementById('inline-suggestions');
    const categoryStripEl = document.getElementById('category-strip');

    const heroKickerEl = document.getElementById('page-hero-kicker');
    const heroTitleEl = document.getElementById('page-hero-title');
    const heroDescEl = document.getElementById('page-hero-desc');

    function updateUrlParams() {
      const next = new URLSearchParams();
      if (filterState.query.trim()) next.set('q', filterState.query.trim());
      if (filterState.category !== 'all') next.set('category', filterState.category);
      if (filterState.collection !== 'all') next.set('collection', filterState.collection);
      if (filterState.price !== 'all') next.set('price', filterState.price);
      if (filterState.availability !== 'all') next.set('availability', filterState.availability);
      if (filterState.sort !== 'featured') next.set('sort', filterState.sort);
      const qs = next.toString();
      const targetUrl = qs ? `${global.location.pathname}?${qs}` : global.location.pathname;
      if (global.history && global.history.replaceState) {
        global.history.replaceState(null, '', targetUrl);
      }
    }

    function updateHeroHeader() {
      if (!heroTitleEl) return;
      if (pageMode === 'search') {
        heroKickerEl.textContent = 'Luvra Archive Search';
        heroTitleEl.innerHTML = filterState.query.trim()
          ? `Results for <em>“${escapeHtml(filterState.query.trim())}”</em>`
          : 'Search <em>The Archive</em>';
        heroDescEl.textContent =
          'Filter across silhouettes, botanical elixirs, materials, and whisper-quiet engineering.';
        return;
      }

      if (pageMode === 'collection') {
        const metaKey =
          filterState.collection !== 'all'
            ? filterState.collection
            : filterState.category !== 'all'
              ? filterState.category
              : 'all';
        const meta = Luvra.CATALOG.collectionMeta[metaKey] || Luvra.CATALOG.collectionMeta.all;
        heroKickerEl.textContent = meta.kicker;
        heroTitleEl.innerHTML = meta.title;
        heroDescEl.textContent = meta.description;
        return;
      }

      const catMeta =
        filterState.category !== 'all'
          ? Luvra.CATALOG.collectionMeta[filterState.category]
          : null;
      if (catMeta) {
        heroKickerEl.textContent = catMeta.kicker;
        heroTitleEl.innerHTML = catMeta.title;
        heroDescEl.textContent = catMeta.description;
      } else {
        heroKickerEl.textContent = 'Luvra Studio Catalog';
        heroTitleEl.innerHTML = 'Shop the <em>Collection</em>';
        heroDescEl.textContent =
          'Every piece is crafted in body-safe materials and shipped in plain, unmarked matte packaging.';
      }
    }

    function renderCategoryStrip() {
      if (!categoryStripEl) return;
      const items = [
        { type: 'category', slug: 'all', label: 'All Pieces' },
        ...Luvra.CATALOG.filterOptions.categories.map((c) => ({
          type: 'category',
          slug: c.slug,
          label: c.label,
        })),
      ];

      if (pageMode === 'collection') {
        items.push(
          { type: 'collection', slug: 'arsenal', label: 'The Arsenal' },
          { type: 'collection', slug: 'featured', label: 'Featured Edit' },
          { type: 'collection', slug: 'bestsellers', label: 'Most Loved' }
        );
      }

      categoryStripEl.innerHTML = items
        .map((item) => {
          const isActive =
            item.type === 'collection'
              ? filterState.collection === item.slug
              : filterState.collection === 'all' && filterState.category === item.slug;

          return `<button
            type="button"
            class="category-link-pill ${isActive ? 'is-active' : ''}"
            data-strip-type="${item.type}"
            data-strip-slug="${item.slug}"
          >${escapeHtml(item.label)}</button>`;
        })
        .join('');
    }

    function renderSuggestions() {
      if (!suggestionsEl) return;
      suggestionsEl.innerHTML = `
        <span class="inline-suggestions__label">Popular:</span>
        ${Luvra.CATALOG.searchSuggestions
          .map(
            (term) =>
              `<button type="button" class="suggestion-chip" data-inline-suggest="${escapeHtml(term)}">${escapeHtml(term)}</button>`
          )
          .join('')}
      `;
    }

    function getFilteredProducts() {
      const q = filterState.query.trim().toLowerCase();
      const priceRange = Luvra.CATALOG.filterOptions.priceRanges.find(
        (r) => r.id === filterState.price
      );

      let list = Luvra.CATALOG.products.filter((product) => {
        if (filterState.collection !== 'all') {
          if (!Array.isArray(product.collections) || !product.collections.includes(filterState.collection)) {
            return false;
          }
        }

        if (filterState.category !== 'all' && product.category !== filterState.category) {
          return false;
        }

        if (priceRange && (product.price < priceRange.min || product.price > priceRange.max)) {
          return false;
        }

        if (filterState.materials.length > 0) {
          const hasAllMaterials = filterState.materials.every((mat) =>
            (product.materials || []).includes(mat)
          );
          if (!hasAllMaterials) return false;
        }

        if (filterState.features.length > 0) {
          const hasAllFeatures = filterState.features.every((feat) =>
            (product.features || []).includes(feat)
          );
          if (!hasAllFeatures) return false;
        }

        if (
          filterState.availability !== 'all' &&
          product.availability !== filterState.availability
        ) {
          return false;
        }

        if (q) {
          const searchable = [
            product.name,
            product.categoryLabel,
            product.shortDesc,
            product.fullDesc,
            ...(product.materials || []),
            ...(product.features || []),
            ...(product.specs || []),
          ]
            .join(' ')
            .toLowerCase();
          if (!searchable.includes(q)) return false;
        }

        return true;
      });

      list = [...list];
      switch (filterState.sort) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          list.sort((a, b) => (b.releaseOrder || 0) - (a.releaseOrder || 0));
          break;
        case 'name-asc':
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
          break;
      }

      return list;
    }

    function renderFilterSidebar() {
      const { categories, priceRanges, materials, features, availability } =
        Luvra.CATALOG.filterOptions;
      const allProducts = Luvra.CATALOG.products;

      const countBy = (predicate) => allProducts.filter(predicate).length;

      document.getElementById('filter-categories').innerHTML = [
        `<label class="filter-option">
          <span class="filter-option__left">
            <input type="radio" name="filter-category" value="all" ${filterState.category === 'all' ? 'checked' : ''} />
            <span>All Categories</span>
          </span>
          <span class="filter-option__count">${allProducts.length}</span>
        </label>`,
        ...categories.map(
          (cat) => `<label class="filter-option">
            <span class="filter-option__left">
              <input type="radio" name="filter-category" value="${escapeHtml(cat.slug)}" ${filterState.category === cat.slug ? 'checked' : ''} />
              <span>${escapeHtml(cat.label)}</span>
            </span>
            <span class="filter-option__count">${countBy((p) => p.category === cat.slug)}</span>
          </label>`
        ),
      ].join('');

      document.getElementById('filter-prices').innerHTML = [
        `<label class="filter-option">
          <span class="filter-option__left">
            <input type="radio" name="filter-price" value="all" ${filterState.price === 'all' ? 'checked' : ''} />
            <span>All Prices</span>
          </span>
        </label>`,
        ...priceRanges.map(
          (r) => `<label class="filter-option">
            <span class="filter-option__left">
              <input type="radio" name="filter-price" value="${escapeHtml(r.id)}" ${filterState.price === r.id ? 'checked' : ''} />
              <span>${escapeHtml(r.label)}</span>
            </span>
            <span class="filter-option__count">${countBy((p) => p.price >= r.min && p.price <= r.max)}</span>
          </label>`
        ),
      ].join('');

      document.getElementById('filter-materials').innerHTML = materials
        .map(
          (mat) => `<label class="filter-option">
            <span class="filter-option__left">
              <input type="checkbox" data-filter-material="${escapeHtml(mat)}" ${filterState.materials.includes(mat) ? 'checked' : ''} />
              <span>${escapeHtml(mat)}</span>
            </span>
            <span class="filter-option__count">${countBy((p) => (p.materials || []).includes(mat))}</span>
          </label>`
        )
        .join('');

      document.getElementById('filter-features').innerHTML = features
        .map(
          (feat) => `<label class="filter-option">
            <span class="filter-option__left">
              <input type="checkbox" data-filter-feature="${escapeHtml(feat)}" ${filterState.features.includes(feat) ? 'checked' : ''} />
              <span>${escapeHtml(feat)}</span>
            </span>
            <span class="filter-option__count">${countBy((p) => (p.features || []).includes(feat))}</span>
          </label>`
        )
        .join('');

      document.getElementById('filter-availability').innerHTML = [
        `<label class="filter-option">
          <span class="filter-option__left">
            <input type="radio" name="filter-availability" value="all" ${filterState.availability === 'all' ? 'checked' : ''} />
            <span>All Availability</span>
          </span>
        </label>`,
        ...availability.map(
          (av) => `<label class="filter-option">
            <span class="filter-option__left">
              <input type="radio" name="filter-availability" value="${escapeHtml(av.id)}" ${filterState.availability === av.id ? 'checked' : ''} />
              <span>${escapeHtml(av.label)}</span>
            </span>
            <span class="filter-option__count">${countBy((p) => p.availability === av.id)}</span>
          </label>`
        ),
      ].join('');
    }

    function buildActiveChips() {
      const chips = [];
      if (filterState.query.trim()) {
        chips.push({ type: 'query', value: '', label: `Search: "${filterState.query.trim()}"` });
      }
      if (filterState.collection !== 'all') {
        chips.push({
          type: 'collection',
          value: 'all',
          label: `Collection: ${filterState.collection}`,
        });
      }
      if (filterState.category !== 'all') {
        const cat = Luvra.CATALOG.filterOptions.categories.find(
          (c) => c.slug === filterState.category
        );
        chips.push({
          type: 'category',
          value: 'all',
          label: `Category: ${cat ? cat.label : filterState.category}`,
        });
      }
      if (filterState.price !== 'all') {
        const pr = Luvra.CATALOG.filterOptions.priceRanges.find(
          (r) => r.id === filterState.price
        );
        chips.push({
          type: 'price',
          value: 'all',
          label: `Price: ${pr ? pr.label : filterState.price}`,
        });
      }
      filterState.materials.forEach((mat) => {
        chips.push({ type: 'material', value: mat, label: `Material: ${mat}` });
      });
      filterState.features.forEach((feat) => {
        chips.push({ type: 'feature', value: feat, label: `Feature: ${feat}` });
      });
      if (filterState.availability !== 'all') {
        const av = Luvra.CATALOG.filterOptions.availability.find(
          (a) => a.id === filterState.availability
        );
        chips.push({
          type: 'availability',
          value: 'all',
          label: av ? av.label : filterState.availability,
        });
      }
      return chips;
    }

    function renderActiveChips() {
      const chips = buildActiveChips();
      if (mobileFilterCountEl) {
        mobileFilterCountEl.textContent = chips.length ? `(${chips.length})` : '';
      }

      if (!chips.length) {
        chipsEl.innerHTML = '';
        return;
      }

      chipsEl.innerHTML = [
        ...chips.map(
          (chip) => `<button
            type="button"
            class="active-chip"
            data-remove-chip-type="${escapeHtml(chip.type)}"
            data-remove-chip-value="${escapeHtml(chip.value)}"
            aria-label="Remove ${escapeHtml(chip.label)}"
          >
            <span>${escapeHtml(chip.label)}</span>
            <span class="active-chip__x" aria-hidden="true">×</span>
          </button>`
        ),
        `<button type="button" class="clear-chips-btn" data-clear-all-filters>Clear All</button>`,
      ].join('');
    }

    function clearAllFilters() {
      filterState.query = '';
      filterState.category = 'all';
      filterState.collection = 'all';
      filterState.price = 'all';
      filterState.materials = [];
      filterState.features = [];
      filterState.availability = 'all';
      if (searchInput) searchInput.value = '';
      renderAll();
    }

    function renderResults() {
      if (isHydrating) {
        gridEl.setAttribute('aria-busy', 'true');
        gridEl.className = 'shop-grid';
        gridEl.innerHTML = `
          <div class="cart-skeleton-row" style="height: 290px;"></div>
          <div class="cart-skeleton-row" style="height: 290px;"></div>
          <div class="cart-skeleton-row" style="height: 290px;"></div>
        `;
        countEl.textContent = 'Loading catalog...';
        return;
      }

      gridEl.removeAttribute('aria-busy');
      const matches = getFilteredProducts();
      const total = Luvra.CATALOG.products.length;

      countEl.textContent = `Showing ${matches.length} of ${total} pieces`;

      if (searchClearBtn) {
        searchClearBtn.hidden = !filterState.query.trim();
      }

      if (!matches.length) {
        const fallbackPieces = Luvra.CATALOG.products.filter((p) => p.flagship).slice(0, 3);
        gridEl.className = '';
        gridEl.innerHTML = `
          <div class="no-results-card">
            <h2 class="no-results-card__title">No Pieces Matched Your Selection</h2>
            <p class="no-results-card__copy">
              ${
                filterState.query.trim()
                  ? `We couldn’t find any Luvra pieces matching “${escapeHtml(filterState.query.trim())}” with the active filters.`
                  : 'No pieces match this exact combination of filters.'
              }
              Try removing a filter or exploring one of our signature edits below.
            </p>
            <div class="no-results-actions">
              <button type="button" class="btn btn--primary" data-clear-all-filters>
                Clear All Filters
              </button>
              <a href="shop.html" class="btn btn--outline" style="width: auto; padding-inline: 1.4rem;">
                Browse Full Shop
              </a>
            </div>

            <div class="no-results-suggestions">
              <div class="inline-suggestions" style="justify-content: center;">
                <span class="inline-suggestions__label">Try searching:</span>
                ${Luvra.CATALOG.searchSuggestions
                  .map(
                    (term) =>
                      `<button type="button" class="suggestion-chip" data-inline-suggest="${escapeHtml(term)}">${escapeHtml(term)}</button>`
                  )
                  .join('')}
              </div>
            </div>

            <div class="no-results-fallback">
              <h3 class="no-results-fallback__heading">Signature Luvra Pieces</h3>
              <div class="shop-grid">
                ${fallbackPieces.map((p) => Luvra.renderProductCard(p, { variant: 'shop' })).join('')}
              </div>
            </div>
          </div>
        `;
        return;
      }

      gridEl.className = 'shop-grid';
      gridEl.innerHTML = matches
        .map((product) => Luvra.renderProductCard(product, { variant: 'shop' }))
        .join('');
    }

    function renderAll() {
      updateUrlParams();
      updateHeroHeader();
      renderCategoryStrip();
      renderFilterSidebar();
      renderActiveChips();
      renderResults();
    }

    // Initialize controls
    if (searchInput) {
      searchInput.value = filterState.query;
      searchInput.addEventListener('input', (e) => {
        filterState.query = e.target.value;
        renderAll();
      });
    }

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterState.query = searchInput ? searchInput.value : '';
        renderAll();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        filterState.query = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        renderAll();
      });
    }

    if (sortSelect) {
      sortSelect.value = filterState.sort;
      sortSelect.addEventListener('change', (e) => {
        filterState.sort = e.target.value;
        renderAll();
      });
    }

    // Mobile filter drawer toggles with keyboard & backdrop support
    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const closeFilterBtn = document.getElementById('filter-drawer-close');
    const applyFilterBtn = document.getElementById('filter-drawer-apply');
    const filterBackdrop = document.getElementById('overlay-backdrop');

    function closeMobileFilters() {
      if (!sidebarEl || !sidebarEl.classList.contains('is-open')) return;
      sidebarEl.classList.remove('is-open');
      if (filterBackdrop) filterBackdrop.classList.remove('is-open');
      document.body.style.overflow = '';
      if (mobileFilterBtn && typeof mobileFilterBtn.focus === 'function') {
        mobileFilterBtn.focus();
      }
    }

    if (mobileFilterBtn && sidebarEl) {
      mobileFilterBtn.addEventListener('click', () => {
        sidebarEl.classList.add('is-open');
        if (filterBackdrop) filterBackdrop.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        if (closeFilterBtn && typeof closeFilterBtn.focus === 'function') {
          global.setTimeout(() => closeFilterBtn.focus(), 30);
        }
      });
    }
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', closeMobileFilters);
    if (applyFilterBtn) applyFilterBtn.addEventListener('click', closeMobileFilters);
    if (filterBackdrop) filterBackdrop.addEventListener('click', closeMobileFilters);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileFilters();
    });

    // Delegated filter events
    sidebarEl.addEventListener('change', (e) => {
      const target = e.target;
      if (target.name === 'filter-category') {
        filterState.category = target.value;
        filterState.collection = 'all';
        renderAll();
      } else if (target.name === 'filter-price') {
        filterState.price = target.value;
        renderAll();
      } else if (target.name === 'filter-availability') {
        filterState.availability = target.value;
        renderAll();
      } else if (target.hasAttribute('data-filter-material')) {
        const mat = target.getAttribute('data-filter-material');
        filterState.materials = target.checked
          ? [...filterState.materials, mat]
          : filterState.materials.filter((m) => m !== mat);
        renderAll();
      } else if (target.hasAttribute('data-filter-feature')) {
        const feat = target.getAttribute('data-filter-feature');
        filterState.features = target.checked
          ? [...filterState.features, feat]
          : filterState.features.filter((f) => f !== feat);
        renderAll();
      }
    });

    document.addEventListener('click', (e) => {
      const stripBtn = e.target.closest('[data-strip-slug]');
      if (stripBtn) {
        const type = stripBtn.getAttribute('data-strip-type');
        const slug = stripBtn.getAttribute('data-strip-slug');
        if (type === 'collection') {
          filterState.collection = slug;
          filterState.category = 'all';
        } else {
          filterState.category = slug;
          filterState.collection = 'all';
        }
        renderAll();
        return;
      }

      const suggestBtn = e.target.closest('[data-inline-suggest]');
      if (suggestBtn) {
        const term = suggestBtn.getAttribute('data-inline-suggest');
        filterState.query = term;
        if (searchInput) searchInput.value = term;
        renderAll();
        return;
      }

      const chipBtn = e.target.closest('[data-remove-chip-type]');
      if (chipBtn) {
        const type = chipBtn.getAttribute('data-remove-chip-type');
        const val = chipBtn.getAttribute('data-remove-chip-value');
        if (type === 'query') {
          filterState.query = '';
          if (searchInput) searchInput.value = '';
        } else if (type === 'category') {
          filterState.category = 'all';
        } else if (type === 'collection') {
          filterState.collection = 'all';
        } else if (type === 'price') {
          filterState.price = 'all';
        } else if (type === 'availability') {
          filterState.availability = 'all';
        } else if (type === 'material') {
          filterState.materials = filterState.materials.filter((m) => m !== val);
        } else if (type === 'feature') {
          filterState.features = filterState.features.filter((f) => f !== val);
        }
        renderAll();
        return;
      }

      if (e.target.closest('[data-clear-all-filters]')) {
        clearAllFilters();
      }
    });

    Luvra.store.subscribe(() => {
      renderResults();
    });

    renderSuggestions();
    renderAll();
    global.setTimeout(() => {
      isHydrating = false;
      renderAll();
    }, 80);
  };
})(window);
