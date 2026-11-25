(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  function renderStars(rating) {
    const rounded = Math.max(1, Math.min(5, Math.round(rating)));
    return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
  }

  Luvra.initProductDetailPage = function initProductDetailPage() {
    const params = new URLSearchParams(global.location.search);
    const requestedId = params.get('id') || Luvra.CATALOG.products[0].id;
    const product = Luvra.store.getProductById(requestedId);

    const rootEl = document.getElementById('pdp-root');
    if (!rootEl) return;

    rootEl.setAttribute('aria-busy', 'true');
    rootEl.innerHTML = `
      <div class="container pdp-section" role="status">
        <div class="pdp-grid">
          <div class="cart-skeleton-row" style="height: 360px;"></div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="cart-skeleton-row" style="height: 60px;"></div>
            <div class="cart-skeleton-row" style="height: 160px;"></div>
            <div class="cart-skeleton-row" style="height: 90px;"></div>
          </div>
        </div>
        <p class="cart-loading-label" style="margin-top: 1rem;">Loading piece details...</p>
      </div>
    `;

    global.setTimeout(() => {
      rootEl.removeAttribute('aria-busy');
      renderProductDetail();
    }, 80);

    function renderProductDetail() {
    if (!product) {
      rootEl.innerHTML = `
        <div class="container pdp-not-found">
          <span class="kicker">Luvra Archive</span>
          <h1 class="section-title" style="margin-bottom: 0.75rem;">Piece Not Found</h1>
          <p class="section-subtitle" style="margin-inline: auto; margin-bottom: 1.5rem;">
            The piece you requested is no longer listed or the link may be incomplete.
          </p>
          <a href="shop.html" class="btn btn--primary">Return to Shop →</a>
        </div>
      `;
      return;
    }

    document.title = `${product.name} — Luvra`;
    Luvra.store.recordRecentlyViewed(product.id);

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const gallery =
      Array.isArray(product.gallery) && product.gallery.length
        ? product.gallery
        : [{ src: product.image, alt: product.name, label: 'Studio View' }];

    const isWaitlist = product.availability === 'waitlist';
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    // Require explicit selection when multiple variants exist; pre-select if single option
    let selectedVariant = variants.length === 1 ? variants[0].label : null;
    let activeImageIdx = 0;

    const accordionDefinitions = [
      { key: 'materials', title: 'Materials', open: true },
      { key: 'dimensions', title: 'Dimensions', open: false },
      { key: 'care', title: 'Care', open: false },
      { key: 'power', title: 'Charging & Power', open: false },
      { key: 'warranty', title: 'Warranty', open: false },
      { key: 'shipping', title: 'Shipping', open: false },
      { key: 'returns', title: 'Returns', open: false },
    ].filter((item) => product.details && product.details[item.key]);

    const relatedProducts = Luvra.CATALOG.products
      .filter((p) => p.id !== product.id)
      .sort((a, b) => {
        const aSame = a.category === product.category ? 1 : 0;
        const bSame = b.category === product.category ? 1 : 0;
        if (bSame !== aSame) return bSame - aSame;
        return (b.popularity || 0) - (a.popularity || 0);
      })
      .slice(0, 4);

    const recentlyViewed = Luvra.store.getRecentlyViewed(product.id, 4);

    rootEl.innerHTML = `
      <section class="pdp-section">
        <div class="container">
          <nav class="pdp-breadcrumb" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span class="pdp-breadcrumb__sep" aria-hidden="true">/</span>
            <a href="shop.html">Shop</a>
            <span class="pdp-breadcrumb__sep" aria-hidden="true">/</span>
            <a href="collection.html?category=${escapeHtml(product.category)}">${escapeHtml(product.categoryLabel)}</a>
            <span class="pdp-breadcrumb__sep" aria-hidden="true">/</span>
            <span class="pdp-breadcrumb__current" aria-current="page">${escapeHtml(product.name)}</span>
          </nav>

          <div class="pdp-grid">
            <!-- Image Gallery -->
            <div class="pdp-gallery">
              <div class="pdp-gallery__main">
                <img
                  id="pdp-main-img"
                  src="${escapeHtml(gallery[0].src)}"
                  alt="${escapeHtml(gallery[0].alt)}"
                />
                <span class="pdp-gallery__caption" id="pdp-gallery-caption">
                  ${escapeHtml(gallery[0].label)}
                </span>
              </div>

              ${
                gallery.length > 1
                  ? `<div class="pdp-gallery__thumbs" role="group" aria-label="Product image angles">
                      ${gallery
                        .map(
                          (item, idx) => `
                        <button
                          type="button"
                          class="pdp-thumb ${idx === 0 ? 'is-active' : ''}"
                          data-gallery-idx="${idx}"
                          aria-label="Show ${escapeHtml(item.label)}"
                          aria-current="${idx === 0 ? 'true' : 'false'}"
                        >
                          <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" />
                        </button>
                      `
                        )
                        .join('')}
                    </div>`
                  : ''
              }
            </div>

            <!-- Details & Purchase Form -->
            <div>
              <div class="pdp-info__top">
                <span class="kicker" style="margin-bottom: 0;">${escapeHtml(product.categoryLabel)}</span>
                <span class="pdp-availability ${isWaitlist ? 'pdp-availability--waitlist' : 'pdp-availability--in-stock'}">
                  ${isWaitlist ? 'Waitlist · Restocking' : 'In Stock · Ships Discreetly'}
                </span>
              </div>

              <h1 class="pdp-title">${escapeHtml(product.name)}</h1>

              <div class="pdp-price-row">
                <span class="pdp-price">$${product.price}</span>
                <a href="#pdp-reviews" class="pdp-rating-link">
                  <span class="pdp-stars" aria-hidden="true">${renderStars(Number(avgRating))}</span>
                  <span>${avgRating} (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})</span>
                </a>
              </div>

              <p class="pdp-desc">${escapeHtml(product.fullDesc)}</p>

              <div class="pdp-highlights">
                ${(product.specs || [])
                  .map((spec) => `<span class="quickview-spec">${escapeHtml(spec)}</span>`)
                  .join('')}
              </div>

              <form class="pdp-form" id="pdp-purchase-form" novalidate>
                ${
                  variants.length
                    ? `<div class="pdp-field">
                        <div class="pdp-field__head">
                          <label class="pdp-field__label">
                            Finish / Option <span aria-hidden="true">*</span>
                          </label>
                          <span class="pdp-field__selected" id="pdp-selected-variant-label">
                            ${selectedVariant ? escapeHtml(selectedVariant) : 'Select an option'}
                          </span>
                        </div>
                        <div class="pdp-variant-group" id="pdp-variant-group" role="group" aria-label="Select finish or option">
                          ${variants
                            .map((v) => {
                              const isSel = selectedVariant === v.label;
                              return `
                                <button
                                  type="button"
                                  class="pdp-variant-btn ${isSel ? 'is-selected' : ''}"
                                  data-pdp-variant="${escapeHtml(v.label)}"
                                  aria-pressed="${isSel}"
                                >
                                  ${v.swatch ? `<span class="pdp-variant-btn__dot" style="background-color: ${escapeHtml(v.swatch)}"></span>` : ''}
                                  <span>${escapeHtml(v.label)}</span>
                                </button>
                              `;
                            })
                            .join('')}
                        </div>
                      </div>`
                    : ''
                }

                <div class="pdp-field">
                  <div class="pdp-field__head">
                    <label class="pdp-field__label" for="pdp-qty-input">Quantity</label>
                  </div>
                  <div class="pdp-purchase-row">
                    <div class="pdp-qty">
                      <button type="button" id="pdp-qty-dec" aria-label="Decrease quantity">−</button>
                      <input
                        type="number"
                        id="pdp-qty-input"
                        min="1"
                        max="10"
                        value="1"
                        aria-label="Quantity"
                      />
                      <button type="button" id="pdp-qty-inc" aria-label="Increase quantity">+</button>
                    </div>

                    ${
                      isWaitlist
                        ? `<button type="button" class="btn btn--outline pdp-add-btn" disabled>
                            Currently Restocking
                          </button>`
                        : `<button type="submit" class="btn btn--primary pdp-add-btn" id="pdp-add-btn">
                            Add to Bag — $${product.price}
                          </button>`
                    }

                    <button
                      type="button"
                      class="btn--icon-circle pdp-fav-btn ${Luvra.store.isFavorite(product.id) ? 'is-favorited' : ''}"
                      id="pdp-fav-btn"
                      data-toggle-favorite="${escapeHtml(product.id)}"
                      aria-label="Save to favorites"
                      aria-pressed="${Luvra.store.isFavorite(product.id)}"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="${Luvra.store.isFavorite(product.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
                        <path d="M12 20.5s-7.5-4.7-9.4-9.2C1.2 7.9 3.5 4.5 7 4.5c2 0 3.7 1 5 2.6 1.3-1.6 3-2.6 5-2.6 3.5 0 5.8 3.4 4.4 6.8-1.9 4.5-9.4 9.2-9.4 9.2Z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <p class="pdp-error" id="pdp-error" role="alert"></p>

                <div class="pdp-confirmation" id="pdp-confirmation" role="status" aria-live="polite" hidden>
                  <span id="pdp-confirmation-text"></span>
                  <button type="button" class="text-link" id="pdp-view-bag-btn" style="color: var(--gold-soft);">
                    View Bag →
                  </button>
                </div>
              </form>

              <!-- Expandable Detail Accordions -->
              <div class="pdp-accordions" aria-label="Product specifications and policies">
                ${accordionDefinitions
                  .map(
                    (acc) => `
                  <details class="pdp-accordion" ${acc.open ? 'open' : ''}>
                    <summary>
                      <span>${escapeHtml(acc.title)}</span>
                      <span class="pdp-accordion__icon" aria-hidden="true">+</span>
                    </summary>
                    <div class="pdp-accordion__body">
                      <p>${escapeHtml(product.details[acc.key])}</p>
                    </div>
                  </details>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Client Reviews -->
      <section class="section pdp-reviews-section" id="pdp-reviews" aria-labelledby="pdp-reviews-heading">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="kicker">Client Notes</span>
              <h2 class="section-title" id="pdp-reviews-heading">
                Verified <em>Reviews</em>
              </h2>
              <div class="pdp-reviews-summary">
                <span class="pdp-stars" aria-hidden="true">${renderStars(Number(avgRating))}</span>
                <span class="section-subtitle" style="margin-top: 0;">
                  ${avgRating} out of 5 · Based on ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>
            <span class="testimonials-note">Discreet Verified Purchases</span>
          </div>

          <div class="pdp-reviews-grid">
            ${
              reviews.length
                ? reviews
                    .map(
                      (rev) => `
                  <article class="review-card">
                    <div>
                      <div class="review-card__top">
                        <span class="pdp-stars" aria-label="${rev.rating} out of 5 stars">${renderStars(rev.rating)}</span>
                        ${rev.variant ? `<span class="review-card__variant">${escapeHtml(rev.variant)}</span>` : ''}
                      </div>
                      <p class="review-card__text" style="margin-top: 0.75rem;">“${escapeHtml(rev.comment)}”</p>
                    </div>
                    <footer class="review-card__footer">
                      <span>${escapeHtml(rev.author)}</span>
                      <span>${escapeHtml(rev.date)}</span>
                    </footer>
                  </article>
                `
                    )
                    .join('')
                : '<p class="section-subtitle">Reviews for this piece are being curated.</p>'
            }
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section class="section pdp-shelf-section" aria-labelledby="related-heading">
        <div class="container">
          <div class="section-header">
            <div>
              <span class="kicker">Complementary Pieces</span>
              <h2 class="section-title" id="related-heading">Related <em>Pairings</em></h2>
            </div>
            <a href="shop.html" class="text-link">Explore Full Shop →</a>
          </div>
          <div class="pdp-shelf-grid" id="pdp-related-grid"></div>
        </div>
      </section>

      <!-- Recently Viewed Products -->
      <section
        class="section pdp-shelf-section"
        id="pdp-recent-section"
        aria-labelledby="recent-heading"
        ${recentlyViewed.length ? '' : 'hidden'}
      >
        <div class="container">
          <div class="section-header">
            <div>
              <span class="kicker">Your Archive History</span>
              <h2 class="section-title" id="recent-heading">Recently <em>Viewed</em></h2>
            </div>
          </div>
          <div class="pdp-shelf-grid" id="pdp-recent-grid"></div>
        </div>
      </section>
    `;

    // Bind gallery thumbnails
    const mainImg = document.getElementById('pdp-main-img');
    const captionEl = document.getElementById('pdp-gallery-caption');
    rootEl.querySelectorAll('[data-gallery-idx]').forEach((thumbBtn) => {
      thumbBtn.addEventListener('click', () => {
        const idx = Number(thumbBtn.getAttribute('data-gallery-idx'));
        if (!gallery[idx]) return;
        activeImageIdx = idx;
        mainImg.src = gallery[idx].src;
        mainImg.alt = gallery[idx].alt;
        captionEl.textContent = gallery[idx].label;
        rootEl.querySelectorAll('[data-gallery-idx]').forEach((btn, i) => {
          btn.classList.toggle('is-active', i === activeImageIdx);
          btn.setAttribute('aria-current', String(i === activeImageIdx));
        });
      });
    });

    // Bind variant selection
    const variantGroupEl = document.getElementById('pdp-variant-group');
    const selectedLabelEl = document.getElementById('pdp-selected-variant-label');
    const errorEl = document.getElementById('pdp-error');
    const confirmEl = document.getElementById('pdp-confirmation');
    const confirmTextEl = document.getElementById('pdp-confirmation-text');

    rootEl.querySelectorAll('[data-pdp-variant]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedVariant = btn.getAttribute('data-pdp-variant');
        if (selectedLabelEl) selectedLabelEl.textContent = selectedVariant;
        if (variantGroupEl) variantGroupEl.classList.remove('has-error');
        if (errorEl) errorEl.textContent = '';

        rootEl.querySelectorAll('[data-pdp-variant]').forEach((b) => {
          const isSel = b.getAttribute('data-pdp-variant') === selectedVariant;
          b.classList.toggle('is-selected', isSel);
          b.setAttribute('aria-pressed', String(isSel));
        });
      });
    });

    // Bind quantity stepper
    const qtyInput = document.getElementById('pdp-qty-input');
    const qtyDec = document.getElementById('pdp-qty-dec');
    const qtyInc = document.getElementById('pdp-qty-inc');

    if (qtyDec && qtyInput) {
      qtyDec.addEventListener('click', () => {
        const current = parseInt(qtyInput.value, 10) || 1;
        qtyInput.value = String(Math.max(1, current - 1));
        if (errorEl) errorEl.textContent = '';
      });
    }
    if (qtyInc && qtyInput) {
      qtyInc.addEventListener('click', () => {
        const current = parseInt(qtyInput.value, 10) || 1;
        qtyInput.value = String(Math.min(10, current + 1));
        if (errorEl) errorEl.textContent = '';
      });
    }

    // Bind Purchase Form with Validation
    const form = document.getElementById('pdp-purchase-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (confirmEl) confirmEl.hidden = true;

        if (isWaitlist) {
          if (errorEl) errorEl.textContent = 'This piece is currently restocking and unavailable to add.';
          return;
        }

        if (variants.length > 0 && !selectedVariant) {
          if (variantGroupEl) variantGroupEl.classList.add('has-error');
          if (errorEl) {
            errorEl.textContent = 'Please select a finish or option before adding to your bag.';
          }
          const firstBtn = variantGroupEl && variantGroupEl.querySelector('button');
          if (firstBtn) firstBtn.focus();
          return;
        }

        const qty = Number(qtyInput ? qtyInput.value : 1);
        if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
          if (errorEl) errorEl.textContent = 'Please choose a quantity between 1 and 10.';
          if (qtyInput) qtyInput.focus();
          return;
        }

        if (errorEl) errorEl.textContent = '';
        const added = Luvra.store.addToCart(product.id, selectedVariant || '', qty);
        if (added && confirmEl && confirmTextEl) {
          const variantText = selectedVariant ? ` (${selectedVariant})` : '';
          confirmTextEl.textContent = `Added ${qty} × ${product.name}${variantText} to your bag.`;
          confirmEl.hidden = false;
        }
      });
    }

    const viewBagBtn = document.getElementById('pdp-view-bag-btn');
    if (viewBagBtn) {
      viewBagBtn.addEventListener('click', () => {
        const cartBtn = document.getElementById('cart-open-btn');
        if (cartBtn) cartBtn.click();
      });
    }

    function renderShelves() {
      const relatedGrid = document.getElementById('pdp-related-grid');
      if (relatedGrid) {
        relatedGrid.innerHTML = relatedProducts
          .map((item) => Luvra.renderProductCard(item, { variant: 'shop' }))
          .join('');
      }

      const recentGrid = document.getElementById('pdp-recent-grid');
      if (recentGrid && recentlyViewed.length) {
        recentGrid.innerHTML = recentlyViewed
          .map((item) => Luvra.renderProductCard(item, { variant: 'shop' }))
          .join('');
      }

      const favBtn = document.getElementById('pdp-fav-btn');
      if (favBtn) {
        const isFav = Luvra.store.isFavorite(product.id);
        favBtn.classList.toggle('is-favorited', isFav);
        favBtn.setAttribute('aria-pressed', String(isFav));
        const pathSvg = favBtn.querySelector('svg');
        if (pathSvg) pathSvg.setAttribute('fill', isFav ? 'currentColor' : 'none');
      }
    }

    Luvra.store.subscribe(renderShelves);
    renderShelves();
    }
  };
})(window);
