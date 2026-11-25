(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMoney(amount) {
    return Luvra.formatMoney ? Luvra.formatMoney(amount) : `$${Number(amount || 0).toFixed(2)}`;
  }

  function ensureSharedOverlays() {
    if (document.getElementById('cart-drawer')) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="overlay-backdrop" id="overlay-backdrop" aria-hidden="true"></div>

      <aside
        class="cart-drawer"
        id="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden="true"
      >
        <div class="cart-drawer__header">
          <div>
            <h2 class="cart-drawer__title" id="cart-drawer-title">Your Bag</h2>
            <p class="cart-drawer__sub" id="cart-drawer-sub">Discreet unmarked matte packaging</p>
          </div>
          <button type="button" class="btn--icon-circle" data-close-overlay aria-label="Close bag">✕</button>
        </div>

        <div class="cart-drawer__body" id="cart-drawer-body"></div>

        <div class="cart-drawer__footer" id="cart-drawer-footer">
          <form class="drawer-promo-form" id="drawer-promo-form" novalidate>
            <label for="drawer-promo-input" class="sr-only">Promo code</label>
            <input
              type="text"
              id="drawer-promo-input"
              class="drawer-promo-input"
              placeholder="Promo code (e.g. LUVRA10)"
              autocomplete="off"
            />
            <button type="submit" class="drawer-promo-btn" id="drawer-promo-btn">Apply</button>
          </form>
          <p class="drawer-promo-feedback" id="drawer-promo-feedback" role="alert"></p>
          <div id="drawer-promo-active"></div>

          <div class="cart-summary-rows" id="drawer-summary-rows"></div>

          <div class="cart-drawer__cta-stack">
            <a href="checkout.html" class="btn btn--primary" id="drawer-checkout-btn">
              Proceed to Checkout →
            </a>
            <a href="cart.html" class="btn btn--outline" id="drawer-view-cart-btn">
              View Full Bag &amp; Estimates
            </a>
          </div>
        </div>
      </aside>

      <div
        class="modal"
        id="quickview-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Product quick view"
        aria-hidden="true"
      >
        <div class="modal__dialog">
          <button type="button" class="btn--icon-circle modal__close" data-close-overlay aria-label="Close quick view">✕</button>
          <div id="quickview-content"></div>
        </div>
      </div>

      <div
        class="modal"
        id="search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        aria-hidden="true"
      >
        <div class="modal__dialog modal__dialog--compact">
          <button type="button" class="btn--icon-circle modal__close" data-close-overlay aria-label="Close search">✕</button>
          <span class="kicker">Luvra Archive</span>
          <h2 class="section-title" id="search-modal-title" style="font-size: 1.5rem;">Search Collection</h2>
          <form class="search-box" id="modal-search-form">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              id="search-input"
              placeholder="Search by piece, material, or feature..."
              aria-label="Search Luvra products"
            />
            <button type="submit" class="search-box__submit" aria-label="Open full search">→</button>
          </form>
          <div class="search-suggestions" id="search-modal-suggestions"></div>
          <div class="search-results" id="search-results"></div>
          <div class="search-modal__footer" id="search-modal-footer"></div>
        </div>
      </div>

      <div
        class="modal"
        id="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        aria-hidden="true"
      >
        <div class="modal__dialog modal__dialog--compact">
          <button type="button" class="btn--icon-circle modal__close" data-close-overlay aria-label="Close account menu">✕</button>
          <div id="account-modal-content"></div>
        </div>
      </div>

      <div
        class="modal age-gate-modal"
        id="age-gate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-desc"
        aria-hidden="true"
      >
        <div class="modal__dialog modal__dialog--compact age-gate-dialog">
          <span class="kicker">Luvra · 18+</span>
          <h2 class="section-title" id="age-gate-title" style="font-size: 1.7rem;">Age Confirmation</h2>
          <p class="section-subtitle" id="age-gate-desc" style="margin-bottom: 1.35rem;"></p>
          <p class="age-gate-declined" id="age-gate-declined" role="alert" hidden>
            Access is restricted to adults 18 and older. You may close this window or visit our
            <a href="privacy.html" style="color: var(--gold); text-decoration: underline;">Privacy Policy</a>.
          </p>
          <div class="age-gate-actions">
            <button type="button" class="btn btn--primary" id="age-gate-confirm-btn">I am 18 or older</button>
            <button type="button" class="quiz-btn-ghost" id="age-gate-decline-btn">Exit</button>
          </div>
        </div>
      </div>
    `;

    while (wrapper.firstElementChild) {
      document.body.appendChild(wrapper.firstElementChild);
    }
  }

  Luvra.matchProducts = function matchProducts(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    return Luvra.CATALOG.products.filter((item) => {
      const haystacks = [
        item.name,
        item.categoryLabel,
        item.shortDesc,
        item.fullDesc,
        ...(item.materials || []),
        ...(item.features || []),
        ...(item.specs || []),
      ];
      return haystacks.some((h) => String(h).toLowerCase().includes(q));
    });
  };

  Luvra.initDrawers = function initDrawers() {
    ensureSharedOverlays();

    const backdrop = document.getElementById('overlay-backdrop');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBody = document.getElementById('cart-drawer-body');
    const cartFooter = document.getElementById('cart-drawer-footer');
    const cartCountEl = document.getElementById('header-cart-count');
    const drawerSummaryRows = document.getElementById('drawer-summary-rows');
    const drawerPromoForm = document.getElementById('drawer-promo-form');
    const drawerPromoInput = document.getElementById('drawer-promo-input');
    const drawerPromoBtn = document.getElementById('drawer-promo-btn');
    const drawerPromoFeedback = document.getElementById('drawer-promo-feedback');
    const drawerPromoActive = document.getElementById('drawer-promo-active');

    const quickViewModal = document.getElementById('quickview-modal');
    const quickViewContent = document.getElementById('quickview-content');
    const searchModal = document.getElementById('search-modal');
    const modalSearchForm = document.getElementById('modal-search-form');
    const searchInput = document.getElementById('search-input');
    const searchSuggestionsEl = document.getElementById('search-modal-suggestions');
    const searchResultsEl = document.getElementById('search-results');
    const searchModalFooter = document.getElementById('search-modal-footer');
    const accountModal = document.getElementById('account-modal');
    const accountModalContent = document.getElementById('account-modal-content');
    const ageGateModal = document.getElementById('age-gate-modal');
    const ageGateTitle = document.getElementById('age-gate-title');
    const ageGateDesc = document.getElementById('age-gate-desc');
    const ageGateConfirmBtn = document.getElementById('age-gate-confirm-btn');
    const ageGateDeclineBtn = document.getElementById('age-gate-decline-btn');
    const ageGateDeclinedMsg = document.getElementById('age-gate-declined');

    let activeQuickViewId = null;
    let drawerLoading = false;
    let ageGateActive = false;
    let activeDialogEl = null;
    let lastTriggerEl = null;

    function getFocusable(container) {
      if (!container || !container.querySelectorAll) return [];
      const nodes = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(nodes).filter((el) => !el.hidden && el.offsetParent !== null);
    }

    function focusInsideDialog(dialogEl, fallbackEl) {
      activeDialogEl = dialogEl;
      global.setTimeout(() => {
        if (fallbackEl && typeof fallbackEl.focus === 'function') {
          fallbackEl.focus();
          return;
        }
        const focusable = getFocusable(dialogEl);
        if (focusable.length && typeof focusable[0].focus === 'function') {
          focusable[0].focus();
        }
      }, 30);
    }

    function closeAllOverlays() {
      backdrop.classList.remove('is-open');
      cartDrawer.classList.remove('is-open');
      quickViewModal.classList.remove('is-open');
      searchModal.classList.remove('is-open');
      accountModal.classList.remove('is-open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      quickViewModal.setAttribute('aria-hidden', 'true');
      searchModal.setAttribute('aria-hidden', 'true');
      accountModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      activeQuickViewId = null;
      activeDialogEl = null;
      if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
        lastTriggerEl.focus();
      }
      lastTriggerEl = null;
    }

    function openCart() {
      lastTriggerEl = document.activeElement || null;
      closeAllOverlays();
      backdrop.classList.add('is-open');
      cartDrawer.classList.add('is-open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderCart();
      focusInsideDialog(cartDrawer);
    }

    function renderQuickView(productId) {
      const product = Luvra.store.getProductById(productId);
      if (!product) return;

      const isWaitlist = product.availability === 'waitlist';
      const isFav = Luvra.store.isFavorite(product.id);
      const selectedVariant = Luvra.store.getSelectedVariant(product.id);
      const variants = Array.isArray(product.variants) ? product.variants : [];

      quickViewContent.innerHTML = `
        <div class="quickview-grid">
          <div class="quickview-media">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
          </div>
          <div class="quickview-details">
            <span class="kicker">${escapeHtml(product.categoryLabel)} · ${isWaitlist ? 'Waitlist' : 'In Stock'}</span>
            <h3>${escapeHtml(product.name)}</h3>
            <p class="quickview-price">$${product.price}</p>
            <p class="quickview-desc">${escapeHtml(product.fullDesc)}</p>
            ${
              variants.length
                ? `<div class="quickview-variants">
                    <span class="quickview-variants__label">Finish / Size: <strong>${escapeHtml(selectedVariant)}</strong></span>
                    <div class="product-card__variants">
                      ${variants
                        .map((v) => {
                          const isSel = v.label === selectedVariant;
                          return `<button
                            type="button"
                            class="variant-pill ${isSel ? 'is-selected' : ''}"
                            data-select-variant="${escapeHtml(product.id)}"
                            data-variant-label="${escapeHtml(v.label)}"
                          >${escapeHtml(v.label)}</button>`;
                        })
                        .join('')}
                    </div>
                  </div>`
                : ''
            }
            <div class="quickview-specs">
              ${product.specs.map((spec) => `<span class="quickview-spec">${escapeHtml(spec)}</span>`).join('')}
            </div>
            <div class="quickview-cta-row">
              ${
                isWaitlist
                  ? `<button type="button" class="btn btn--outline" disabled>Currently Restocking</button>`
                  : `<button type="button" class="btn btn--primary" data-add-to-bag="${escapeHtml(product.id)}">
                      Add to Bag — $${product.price}
                    </button>`
              }
              <button
                type="button"
                class="btn--icon-circle ${isFav ? 'is-favorited' : ''}"
                data-toggle-favorite="${escapeHtml(product.id)}"
                aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
                aria-pressed="${isFav}"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.7-9.4-9.2C1.2 7.9 3.5 4.5 7 4.5c2 0 3.7 1 5 2.6 1.3-1.6 3-2.6 5-2.6 3.5 0 5.8 3.4 4.4 6.8-1.9 4.5-9.4 9.2-9.4 9.2Z"/>
                </svg>
              </button>
            </div>
            <div style="margin-top: 0.95rem;">
              <a href="product.html?id=${escapeHtml(product.id)}" class="text-link">
                View Full Product Details →
              </a>
            </div>
          </div>
        </div>
      `;
    }

    function openQuickView(productId) {
      if (!Luvra.store.getProductById(productId)) return;
      lastTriggerEl = document.activeElement || null;
      closeAllOverlays();
      activeQuickViewId = productId;
      renderQuickView(productId);
      backdrop.classList.add('is-open');
      quickViewModal.classList.add('is-open');
      quickViewModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      focusInsideDialog(quickViewModal);
    }

    function renderSearchResults(query) {
      const q = query.trim();

      if (searchSuggestionsEl) {
        searchSuggestionsEl.innerHTML = `
          <span class="search-suggestions__label">Suggestions</span>
          <div class="search-suggestions__list">
            ${Luvra.CATALOG.searchSuggestions
              .map(
                (term) => `<button type="button" class="suggestion-chip" data-search-suggest="${escapeHtml(term)}">${escapeHtml(term)}</button>`
              )
              .join('')}
          </div>
        `;
      }

      const matches = q
        ? Luvra.matchProducts(q)
        : Luvra.CATALOG.products.filter((item) => item.flagship);

      if (!matches.length) {
        searchResultsEl.innerHTML = `
          <div class="search-empty-inline">
            <p class="product-card__desc">No Luvra pieces matched "${escapeHtml(q)}".</p>
            <p class="search-empty-inline__hint">Try searching "Warming", "Silicone", "Couples", or browse the full archive.</p>
          </div>
        `;
        if (searchModalFooter) {
          searchModalFooter.innerHTML = `<a href="search.html?q=${encodeURIComponent(q)}" class="text-link">Open Search Page →</a>`;
        }
        return;
      }

      searchResultsEl.innerHTML = matches
        .slice(0, 5)
        .map(
          (item) => `
          <button type="button" class="search-result-row" data-quickview="${escapeHtml(item.id)}">
            <span class="search-result-row__left">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />
              <span>
                <span class="search-result-row__title">${escapeHtml(item.name)}</span><br/>
                <span class="search-result-row__sub">${escapeHtml(item.categoryLabel)} · ${escapeHtml(item.shortDesc)}</span>
              </span>
            </span>
            <span class="search-result-row__price">$${item.price}</span>
          </button>
        `
        )
        .join('');

      if (searchModalFooter) {
        const href = q ? `search.html?q=${encodeURIComponent(q)}` : 'search.html';
        const label = q ? `View all ${matches.length} results in Search →` : 'Open Full Search & Filters →';
        searchModalFooter.innerHTML = `<a href="${href}" class="text-link">${escapeHtml(label)}</a>`;
      }
    }

    function openSearch() {
      lastTriggerEl = document.activeElement || null;
      closeAllOverlays();
      backdrop.classList.add('is-open');
      searchModal.classList.add('is-open');
      searchModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      renderSearchResults(searchInput.value || '');
      focusInsideDialog(searchModal, searchInput);
    }

    function renderAccountModal() {
      if (!accountModalContent) return;
      const account = Luvra.store.getCurrentAccount();
      const favCount = Luvra.store.getState().favorites.length;
      const orderCount = Luvra.store.getOrderHistory().length;

      accountModalContent.innerHTML = `
        <span class="kicker">${account ? 'Signed In' : 'Guest Mode · Optional Account'}</span>
        <h2 class="section-title" id="account-modal-title" style="font-size: 1.55rem;">
          ${account ? escapeHtml(account.name) : 'Private Account'}
        </h2>
        <p class="section-subtitle" style="margin-bottom: 1.15rem;">
          ${
            account
              ? `Signed in as ${escapeHtml(account.email)}.`
              : 'You can browse, save favorites, and complete checkout as a guest—or sign in to keep orders and addresses organized.'
          }
        </p>
        <div class="account-quick-links">
          <a href="account.html" class="account-quick-link" data-close-overlay>
            <span>${account ? 'Account Overview' : 'Sign In / Create Account'}</span>
            <span>→</span>
          </a>
          <a href="favorites.html" class="account-quick-link" data-close-overlay>
            <span>Saved Favorites (${favCount})</span>
            <span>→</span>
          </a>
          <a href="orders.html" class="account-quick-link" data-close-overlay>
            <span>Order History (${orderCount})</span>
            <span>→</span>
          </a>
          <a href="addresses.html" class="account-quick-link" data-close-overlay>
            <span>Saved Addresses</span>
            <span>→</span>
          </a>
          <a href="reset-password.html" class="account-quick-link" data-close-overlay>
            <span>Reset Password</span>
            <span>→</span>
          </a>
        </div>
        ${
          account
            ? `<button type="button" class="quiz-btn-ghost" id="modal-signout-btn" style="margin-top: 1rem; width: 100%;">Sign Out</button>`
            : `<button type="button" class="btn btn--outline" data-close-overlay style="margin-top: 1rem;">Continue as Guest</button>`
        }
      `;

      const signOutBtn = document.getElementById('modal-signout-btn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
          Luvra.store.signOutDemo();
          renderAccountModal();
        });
      }
    }

    function openAccountPreview() {
      if (ageGateActive) return;
      lastTriggerEl = document.activeElement || null;
      closeAllOverlays();
      renderAccountModal();
      backdrop.classList.add('is-open');
      accountModal.classList.add('is-open');
      accountModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      focusInsideDialog(accountModal);
    }

    function initAgeGate() {
      const pageMode = (document.body.dataset && document.body.dataset.page) || 'home';
      const nonProductPages = ['privacy', 'terms', 'shipping', 'returns', 'help', 'account'];
      if (nonProductPages.includes(pageMode)) return;

      const cfg =
        (Luvra.CATALOG && Luvra.CATALOG.siteConfig && Luvra.CATALOG.siteConfig.ageGate) || {
          enabled: true,
        };
      if (!cfg.enabled || Luvra.store.isAgeConfirmed()) return;

      const mainEl = document.querySelector('main');
      ageGateActive = true;
      if (mainEl) {
        mainEl.classList.add('is-age-gated');
        mainEl.setAttribute('aria-hidden', 'true');
      }

      if (ageGateTitle && cfg.title) ageGateTitle.textContent = cfg.title;
      if (ageGateDesc && cfg.message) ageGateDesc.textContent = cfg.message;
      if (ageGateConfirmBtn && cfg.confirmLabel) ageGateConfirmBtn.textContent = cfg.confirmLabel;
      if (ageGateDeclineBtn && cfg.declineLabel) ageGateDeclineBtn.textContent = cfg.declineLabel;

      backdrop.classList.add('is-open');
      ageGateModal.classList.add('is-open');
      ageGateModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      focusInsideDialog(ageGateModal, ageGateConfirmBtn);

      if (ageGateConfirmBtn) {
        ageGateConfirmBtn.addEventListener('click', () => {
          Luvra.store.confirmAge();
          ageGateActive = false;
          activeDialogEl = null;
          if (mainEl) {
            mainEl.classList.remove('is-age-gated');
            mainEl.removeAttribute('aria-hidden');
          }
          ageGateModal.classList.remove('is-open');
          ageGateModal.setAttribute('aria-hidden', 'true');
          backdrop.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      }

      if (ageGateDeclineBtn) {
        ageGateDeclineBtn.addEventListener('click', () => {
          if (ageGateDeclinedMsg) ageGateDeclinedMsg.hidden = false;
          if (ageGateConfirmBtn) ageGateConfirmBtn.hidden = true;
          ageGateDeclineBtn.hidden = true;
        });
      }
    }

    function renderCart() {
      const summary = Luvra.store.getCartSummary();
      if (cartCountEl) cartCountEl.textContent = String(summary.totalCount);

      if (drawerLoading) {
        cartBody.setAttribute('aria-busy', 'true');
        cartBody.innerHTML = `
          <div class="cart-loading-state" role="status">
            <div class="cart-skeleton-row"></div>
            <div class="cart-skeleton-row"></div>
            <p class="cart-loading-label">Updating bag estimates...</p>
          </div>
        `;
        return;
      }

      cartBody.removeAttribute('aria-busy');

      if (!summary.items.length) {
        cartBody.innerHTML = `
          <div class="cart-empty">
            <p>Your private bag is currently empty.</p>
            <div style="display: flex; flex-direction: column; gap: 0.65rem; align-items: center;">
              <a href="shop.html" class="btn btn--primary" data-close-overlay>Explore Shop →</a>
              <a href="quiz.html" class="text-link" data-close-overlay>Take Finder Quiz →</a>
            </div>
          </div>
        `;
        if (cartFooter) cartFooter.hidden = true;
        return;
      }

      if (cartFooter) cartFooter.hidden = false;

      const unavailableNotice = summary.unavailableItems.length
        ? `<div class="cart-alert" role="status">
            <span>${summary.unavailableItems.length} ${summary.unavailableItems.length === 1 ? 'item is' : 'items are'} currently unavailable and excluded from your estimate.</span>
            <button type="button" class="cart-alert__action" data-clear-unavailable>Remove</button>
          </div>`
        : '';

      const shippingProgress =
        summary.discountedSubtotal > 0 && summary.shippingMethod === 'standard'
          ? summary.amountToFreeShipping === 0
            ? `<p class="cart-shipping-note is-unlocked">Complimentary discreet shipping unlocked.</p>`
            : `<p class="cart-shipping-note">Add ${formatMoney(summary.amountToFreeShipping)} more for complimentary standard shipping.</p>`
          : '';

      cartBody.innerHTML = `
        ${unavailableNotice}
        ${shippingProgress}
        ${summary.items
          .map((item) => {
            if (!item.product) {
              return `
                <div class="cart-item is-unavailable">
                  <div class="cart-item__placeholder" aria-hidden="true">—</div>
                  <div>
                    <div class="cart-item__top">
                      <h4 class="cart-item__name">Unavailable Piece</h4>
                      <span class="cart-item__price">—</span>
                    </div>
                    <p class="cart-item__meta">This item is no longer in our active catalog.</p>
                    <div class="cart-item__controls">
                      <button type="button" class="cart-item__remove" data-cart-remove="${escapeHtml(item.key)}">Remove</button>
                    </div>
                  </div>
                </div>
              `;
            }

            const variantMeta = item.variant ? ` · ${escapeHtml(item.variant)}` : '';
            const statusTag = !item.available
              ? '<span class="cart-item__status">Currently Unavailable</span>'
              : '';

            return `
              <div class="cart-item ${!item.available ? 'is-unavailable' : ''}">
                <a href="product.html?id=${escapeHtml(item.id)}" data-close-overlay>
                  <img class="cart-item__img" src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}" />
                </a>
                <div>
                  <div class="cart-item__top">
                    <h4 class="cart-item__name">
                      <a href="product.html?id=${escapeHtml(item.id)}" data-close-overlay>${escapeHtml(item.product.name)}</a>
                    </h4>
                    <span class="cart-item__price">
                      ${item.available ? formatMoney(item.lineTotal) : 'Excluded'}
                    </span>
                  </div>
                  <p class="cart-item__meta">${escapeHtml(item.product.categoryLabel)}${variantMeta}</p>
                  ${statusTag}
                  <div class="cart-item__controls">
                    <div class="qty-stepper" aria-label="Quantity for ${escapeHtml(item.product.name)}">
                      <button type="button" data-cart-dec="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                      <span>${item.qty}</span>
                      <button type="button" data-cart-inc="${escapeHtml(item.key)}" aria-label="Increase quantity" ${!item.available ? 'disabled' : ''}>+</button>
                    </div>
                    <button type="button" class="cart-item__remove" data-cart-remove="${escapeHtml(item.key)}">Remove</button>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      `;

      if (drawerPromoActive) {
        if (summary.appliedPromo) {
          drawerPromoActive.innerHTML = `
            <div class="promo-applied-pill">
              <span>${escapeHtml(summary.appliedPromo.code)} · ${escapeHtml(summary.appliedPromo.description)}</span>
              <button type="button" data-remove-promo aria-label="Remove promo code">×</button>
            </div>
          `;
        } else if (summary.promoNotice) {
          drawerPromoActive.innerHTML = `<p class="drawer-promo-feedback">${escapeHtml(summary.promoNotice)}</p>`;
        } else {
          drawerPromoActive.innerHTML = '';
        }
      }

      if (drawerSummaryRows) {
        drawerSummaryRows.innerHTML = `
          <div class="cart-summary-row">
            <span>Subtotal</span>
            <span>${formatMoney(summary.subtotal)}</span>
          </div>
          ${
            summary.discount > 0
              ? `<div class="cart-summary-row is-discount">
                  <span>Promo (${escapeHtml(summary.appliedPromo.code)})</span>
                  <span>−${formatMoney(summary.discount)}</span>
                </div>`
              : ''
          }
          <div class="cart-summary-row">
            <span>Shipping Estimate</span>
            <span>${summary.shippingEstimate === 0 && summary.discountedSubtotal > 0 ? 'Complimentary' : formatMoney(summary.shippingEstimate)}</span>
          </div>
          <div class="cart-summary-row">
            <span>Estimated Tax</span>
            <span>${formatMoney(summary.taxEstimate)}</span>
          </div>
          <div class="cart-subtotal">
            <span class="cart-subtotal__label">Estimated Total</span>
            <span class="cart-subtotal__value">${formatMoney(summary.total)}</span>
          </div>
        `;
      }
    }

    const cartOpenBtn = document.getElementById('cart-open-btn');
    const searchOpenBtn = document.getElementById('search-open-btn');
    const accountOpenBtn = document.getElementById('account-open-btn');

    if (cartOpenBtn) cartOpenBtn.addEventListener('click', () => !ageGateActive && openCart());
    if (searchOpenBtn) searchOpenBtn.addEventListener('click', () => !ageGateActive && openSearch());
    if (accountOpenBtn) accountOpenBtn.addEventListener('click', openAccountPreview);
    backdrop.addEventListener('click', () => {
      if (!ageGateActive) closeAllOverlays();
    });

    document.querySelectorAll('[data-close-overlay]').forEach((btn) => {
      btn.addEventListener('click', closeAllOverlays);
    });

    if (drawerPromoForm && drawerPromoInput) {
      drawerPromoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (drawerPromoFeedback) drawerPromoFeedback.textContent = '';
        drawerLoading = true;
        if (drawerPromoBtn) drawerPromoBtn.disabled = true;
        renderCart();

        const code = drawerPromoInput.value;
        global.setTimeout(() => {
          drawerLoading = false;
          if (drawerPromoBtn) drawerPromoBtn.disabled = false;
          const res = Luvra.store.applyPromoCode(code);
          if (!res.ok && drawerPromoFeedback) {
            drawerPromoFeedback.textContent = res.error;
          } else {
            drawerPromoInput.value = '';
          }
          renderCart();
        }, 180);
      });
    }

    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    if (modalSearchForm) {
      modalSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        global.location.href = q ? `search.html?q=${encodeURIComponent(q)}` : 'search.html';
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !ageGateActive && activeDialogEl) {
        closeAllOverlays();
        return;
      }

      if (e.key === 'Tab' && activeDialogEl) {
        const focusable = getFocusable(activeDialogEl);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    document.addEventListener('click', (e) => {
      const suggestBtn = e.target.closest('[data-search-suggest]');
      if (suggestBtn) {
        const term = suggestBtn.getAttribute('data-search-suggest');
        searchInput.value = term;
        renderSearchResults(term);
        searchInput.focus();
        return;
      }

      const decBtn = e.target.closest('[data-cart-dec]');
      if (decBtn) {
        Luvra.store.updateQty(decBtn.getAttribute('data-cart-dec'), -1);
        return;
      }
      const incBtn = e.target.closest('[data-cart-inc]');
      if (incBtn) {
        Luvra.store.updateQty(incBtn.getAttribute('data-cart-inc'), 1);
        return;
      }
      const removeBtn = e.target.closest('[data-cart-remove]');
      if (removeBtn) {
        Luvra.store.removeFromCart(removeBtn.getAttribute('data-cart-remove'));
        return;
      }
      if (e.target.closest('[data-clear-unavailable]')) {
        Luvra.store.clearUnavailableItems();
        return;
      }
      if (e.target.closest('[data-remove-promo]')) {
        if (drawerPromoFeedback) drawerPromoFeedback.textContent = '';
        Luvra.store.removePromoCode();
        return;
      }
      const closeTarget = e.target.closest('[data-close-overlay]');
      if (closeTarget) {
        closeAllOverlays();
      }
    });

    Luvra.store.subscribe(() => {
      renderCart();
      if (activeQuickViewId) {
        renderQuickView(activeQuickViewId);
      }
    });
    renderCart();
    initAgeGate();
    if (Luvra.initThemedSelects) {
      Luvra.initThemedSelects();
    }

    return {
      openCart,
      openQuickView,
      openSearch,
      closeAllOverlays,
    };
  };

  function closeAllThemedSelects(exceptWrapper) {
    if (!document.querySelectorAll) return;
    document.querySelectorAll('.luvra-select.is-open').forEach((wrap) => {
      if (wrap === exceptWrapper) return;
      wrap.classList.remove('is-open', 'is-dropup');
      const trig = wrap.querySelector('.luvra-select__trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
    });
  }

  Luvra.enhanceThemedSelects = function enhanceThemedSelects(root) {
    const scope = root && typeof root.querySelectorAll === 'function' ? root : document;
    if (!scope || typeof scope.querySelectorAll !== 'function' || !document.createElement) return;

    scope.querySelectorAll('select').forEach((nativeSelect) => {
      if (nativeSelect.dataset.luvraSelectEnhanced === 'true') return;
      const parent = nativeSelect.parentNode;
      if (!parent || typeof parent.insertBefore !== 'function') return;

      nativeSelect.dataset.luvraSelectEnhanced = 'true';

      const wrapper = document.createElement('div');
      wrapper.className = 'luvra-select';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'luvra-select__trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      if (nativeSelect.id) {
        trigger.id = `${nativeSelect.id}--trigger`;
      }

      const labelSpan = document.createElement('span');
      labelSpan.className = 'luvra-select__label';

      const chevron = document.createElementNS
        ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        : document.createElement('span');
      if (chevron.setAttribute) {
        chevron.setAttribute('class', 'luvra-select__chevron');
        chevron.setAttribute('width', '12');
        chevron.setAttribute('height', '12');
        chevron.setAttribute('viewBox', '0 0 24 24');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('stroke-width', '2');
        chevron.setAttribute('stroke-linecap', 'round');
        chevron.setAttribute('stroke-linejoin', 'round');
        chevron.setAttribute('aria-hidden', 'true');
        chevron.innerHTML = '<path d="m6 9 6 6 6-6" />';
      }

      trigger.appendChild(labelSpan);
      trigger.appendChild(chevron);

      const backdrop = document.createElement('div');
      backdrop.className = 'luvra-select__backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

      const menu = document.createElement('div');
      menu.className = 'luvra-select__menu';
      menu.setAttribute('role', 'listbox');
      menu.tabIndex = -1;

      function syncOptions() {
        const opts = Array.from(nativeSelect.options || []);
        const selectedOpt =
          opts[nativeSelect.selectedIndex] || opts.find((o) => o.selected) || opts[0];
        labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
        if (nativeSelect.hasAttribute('aria-invalid')) {
          trigger.setAttribute('aria-invalid', nativeSelect.getAttribute('aria-invalid'));
        } else {
          trigger.removeAttribute('aria-invalid');
        }
        menu.innerHTML = '';

        opts.forEach((opt, idx) => {
          const optBtn = document.createElement('button');
          optBtn.type = 'button';
          optBtn.className = 'luvra-select__option';
          optBtn.setAttribute('role', 'option');
          optBtn.dataset.value = opt.value;
          optBtn.dataset.index = String(idx);
          const isSelected = opt.value === nativeSelect.value;
          optBtn.setAttribute('aria-selected', String(isSelected));
          if (isSelected) optBtn.classList.add('is-selected');
          optBtn.disabled = Boolean(opt.disabled);

          const textSpan = document.createElement('span');
          textSpan.textContent = opt.textContent;

          const checkSvg = document.createElementNS
            ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            : document.createElement('span');
          if (checkSvg.setAttribute) {
            checkSvg.setAttribute('class', 'luvra-select__check');
            checkSvg.setAttribute('width', '13');
            checkSvg.setAttribute('height', '13');
            checkSvg.setAttribute('viewBox', '0 0 24 24');
            checkSvg.setAttribute('fill', 'none');
            checkSvg.setAttribute('stroke', 'currentColor');
            checkSvg.setAttribute('stroke-width', '2.2');
            checkSvg.setAttribute('stroke-linecap', 'round');
            checkSvg.setAttribute('stroke-linejoin', 'round');
            checkSvg.setAttribute('aria-hidden', 'true');
            checkSvg.innerHTML = '<path d="M20 6 9 17l-5-5" />';
          }

          optBtn.appendChild(textSpan);
          optBtn.appendChild(checkSvg);
          menu.appendChild(optBtn);
        });
      }

      function openMenu() {
        closeAllThemedSelects(wrapper);
        syncOptions();
        if (typeof trigger.getBoundingClientRect === 'function' && global.innerHeight) {
          const rect = trigger.getBoundingClientRect();
          const spaceBelow = global.innerHeight - rect.bottom;
          if (spaceBelow < 240 && rect.top > 240) {
            wrapper.classList.add('is-dropup');
          } else {
            wrapper.classList.remove('is-dropup');
          }
        }
        wrapper.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        const activeBtn =
          menu.querySelector('.luvra-select__option.is-selected') ||
          menu.querySelector('.luvra-select__option');
        if (activeBtn && typeof activeBtn.focus === 'function') {
          global.setTimeout(() => activeBtn.focus(), 10);
        }
      }

      function closeMenu(returnFocus) {
        if (!wrapper.classList.contains('is-open')) return;
        wrapper.classList.remove('is-open', 'is-dropup');
        trigger.setAttribute('aria-expanded', 'false');
        if (returnFocus && typeof trigger.focus === 'function') {
          trigger.focus();
        }
      }

      function selectValue(val) {
        const changed = nativeSelect.value !== val;
        nativeSelect.value = val;
        syncOptions();
        closeMenu(true);
        if (changed && typeof global.Event === 'function') {
          nativeSelect.dispatchEvent(new global.Event('change', { bubbles: true }));
        }
      }

      parent.insertBefore(wrapper, nativeSelect);
      wrapper.appendChild(nativeSelect);
      wrapper.appendChild(trigger);
      wrapper.appendChild(backdrop);
      wrapper.appendChild(menu);

      nativeSelect.classList.add('luvra-select-native');
      nativeSelect.tabIndex = -1;
      nativeSelect.setAttribute('aria-hidden', 'true');
      syncOptions();

      if (nativeSelect.id && document.querySelector) {
        const assocLabel = document.querySelector(`label[for="${nativeSelect.id}"]`);
        if (assocLabel && assocLabel.dataset.luvraLabelBound !== 'true') {
          assocLabel.dataset.luvraLabelBound = 'true';
          assocLabel.addEventListener('click', (e) => {
            e.preventDefault();
            openMenu();
          });
        }
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains('is-open')) {
          closeMenu(true);
        } else {
          openMenu();
        }
      });

      backdrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu(true);
      });

      menu.addEventListener('click', (e) => {
        const optBtn = e.target.closest('.luvra-select__option');
        if (!optBtn || optBtn.disabled) return;
        e.stopPropagation();
        selectValue(optBtn.dataset.value);
      });

      wrapper.addEventListener('keydown', (e) => {
        const optionBtns = Array.from(menu.querySelectorAll('.luvra-select__option:not([disabled])'));
        if (!optionBtns.length) return;
        const isOpen = wrapper.classList.contains('is-open');

        if (e.key === 'Escape') {
          if (isOpen) {
            e.preventDefault();
            e.stopPropagation();
            closeMenu(true);
          }
          return;
        }

        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          openMenu();
          return;
        }

        if (!isOpen) return;
        const curIdx = optionBtns.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = optionBtns[curIdx < optionBtns.length - 1 ? curIdx + 1 : 0];
          if (next) next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = optionBtns[curIdx > 0 ? curIdx - 1 : optionBtns.length - 1];
          if (prev) prev.focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          optionBtns[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          optionBtns[optionBtns.length - 1].focus();
        } else if ((e.key === 'Enter' || e.key === ' ') && curIdx >= 0) {
          e.preventDefault();
          selectValue(optionBtns[curIdx].dataset.value);
        }
      });

      nativeSelect.addEventListener('change', syncOptions);
      nativeSelect.addEventListener('luvra:select-sync', syncOptions);
    });
  };

  let themedSelectObserverStarted = false;
  Luvra.initThemedSelects = function initThemedSelects() {
    Luvra.enhanceThemedSelects(document);
    if (themedSelectObserverStarted) return;
    themedSelectObserverStarted = true;

    document.addEventListener('click', (e) => {
      if (!e.target || typeof e.target.closest !== 'function' || !e.target.closest('.luvra-select')) {
        closeAllThemedSelects(null);
      }
    });

    if (typeof global.MutationObserver === 'function' && document.body) {
      const obs = new global.MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            m.addedNodes.forEach((node) => {
              if (node && node.nodeType === 1) {
                if (node.tagName === 'SELECT') {
                  Luvra.enhanceThemedSelects(node.parentNode || document);
                } else if (typeof node.querySelector === 'function' && node.querySelector('select')) {
                  Luvra.enhanceThemedSelects(node);
                }
              }
            });
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
  };
})(window);
