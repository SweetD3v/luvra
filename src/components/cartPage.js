(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  function formatMoney(amount) {
    return Luvra.formatMoney ? Luvra.formatMoney(amount) : `$${Number(amount || 0).toFixed(2)}`;
  }

  Luvra.initCartPage = function initCartPage() {
    const rootEl = document.getElementById('cart-page-root');
    if (!rootEl) return;

    let isLoading = true;
    let promoError = '';

    function renderLoading() {
      rootEl.setAttribute('aria-busy', 'true');
      rootEl.innerHTML = `
        <div class="cart-page__grid" role="status">
          <div class="cart-page__items">
            <div class="cart-skeleton-row" style="height: 132px;"></div>
            <div class="cart-skeleton-row" style="height: 132px;"></div>
          </div>
          <div class="cart-summary-panel">
            <div class="cart-skeleton-row" style="height: 220px;"></div>
            <p class="cart-loading-label" style="margin-top: 0.75rem;">Loading bag estimates...</p>
          </div>
        </div>
      `;
    }

    function renderCartPage() {
      if (isLoading) {
        renderLoading();
        return;
      }

      rootEl.removeAttribute('aria-busy');
      const summary = Luvra.store.getCartSummary();
      const commerce = Luvra.CATALOG.commerce;

      if (!summary.items.length) {
        const flagshipPieces = Luvra.CATALOG.products.filter((p) => p.flagship).slice(0, 4);
        rootEl.innerHTML = `
          <div class="cart-empty-page">
            <span class="kicker">Private Bag</span>
            <h1 class="cart-empty-page__title">Your Bag Is Empty</h1>
            <p class="cart-empty-page__copy">
              Explore our curated silhouettes and botanical elixirs—every order ships in plain,
              unmarked matte packaging.
            </p>
            <div class="cart-empty-page__actions">
              <a href="shop.html" class="btn btn--primary">Explore Shop →</a>
              <a href="quiz.html" class="btn btn--outline" style="width: auto; padding-inline: 1.4rem;">
                Product Finder Quiz
              </a>
            </div>
          </div>

          <section class="section" style="padding-bottom: 0;">
            <div class="section-header">
              <div>
                <span class="kicker">Signature Archive</span>
                <h2 class="section-title">Popular <em>Pieces</em></h2>
              </div>
              <a href="shop.html" class="text-link">View All →</a>
            </div>
            <div class="collection-grid">
              ${flagshipPieces.map((p) => Luvra.renderProductCard(p, { variant: 'shop' })).join('')}
            </div>
          </section>
        `;
        return;
      }

      const promoHintCodes = (commerce.promoCodes || [])
        .map((p) => `${p.code} (${p.description})`)
        .join(' · ');

      const standardPriceText =
        summary.discountedSubtotal >= commerce.freeShippingThreshold || summary.discountedSubtotal === 0
          ? 'Complimentary'
          : formatMoney(commerce.standardShippingRate);

      rootEl.innerHTML = `
        <div class="cart-page__header">
          <div>
            <span class="kicker">Private Checkout Preview</span>
            <h1 class="cart-page__title">Your <em>Bag</em> (${summary.totalCount})</h1>
          </div>
          <a href="shop.html" class="text-link">Continue Shopping →</a>
        </div>

        ${
          summary.unavailableItems.length
            ? `<div class="cart-alert" role="status">
                <span>${summary.unavailableItems.length} ${summary.unavailableItems.length === 1 ? 'item in your bag is' : 'items in your bag are'} currently unavailable and excluded from your order estimate.</span>
                <button type="button" class="cart-alert__action" data-clear-unavailable>Remove Unavailable</button>
              </div>`
            : ''
        }

        <div class="cart-page__grid">
          <div class="cart-page__items">
            ${
              summary.discountedSubtotal > 0 && summary.shippingMethod === 'standard'
                ? summary.amountToFreeShipping === 0
                  ? '<p class="cart-shipping-note is-unlocked">Complimentary discreet standard shipping unlocked on this order.</p>'
                  : `<p class="cart-shipping-note">Add ${formatMoney(summary.amountToFreeShipping)} more for complimentary discreet standard shipping.</p>`
                : ''
            }

            ${summary.items
              .map((item) => {
                if (!item.product) {
                  return `
                    <article class="cart-line-card is-unavailable">
                      <div class="cart-item__placeholder" style="width: 108px; height: 108px;" aria-hidden="true">—</div>
                      <div class="cart-line-card__body">
                        <div class="cart-line-card__top">
                          <div>
                            <h2 class="cart-line-card__title">Unavailable Piece</h2>
                            <p class="cart-line-card__meta">This item is no longer listed in the catalog.</p>
                          </div>
                          <span class="cart-line-card__price">—</span>
                        </div>
                        <div class="cart-line-card__bottom">
                          <span class="cart-item__status">Unavailable</span>
                          <button type="button" class="cart-item__remove" data-cart-remove="${escapeHtml(item.key)}">Remove</button>
                        </div>
                      </div>
                    </article>
                  `;
                }

                const detailHref = `product.html?id=${encodeURIComponent(item.id)}`;
                const variantLine = item.variant ? `Option: ${escapeHtml(item.variant)}` : 'Standard finish';
                return `
                  <article class="cart-line-card ${!item.available ? 'is-unavailable' : ''}">
                    <a href="${detailHref}">
                      <img class="cart-line-card__img" src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}" />
                    </a>
                    <div class="cart-line-card__body">
                      <div class="cart-line-card__top">
                        <div>
                          <h2 class="cart-line-card__title">
                            <a href="${detailHref}">${escapeHtml(item.product.name)}</a>
                          </h2>
                          <p class="cart-line-card__meta">${escapeHtml(item.product.categoryLabel)} · ${variantLine}</p>
                          ${!item.available ? '<span class="cart-item__status">Currently Unavailable / Restocking</span>' : ''}
                        </div>
                        <span class="cart-line-card__price">
                          ${item.available ? formatMoney(item.lineTotal) : 'Excluded'}
                        </span>
                      </div>

                      <div class="cart-line-card__bottom">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                          <div class="qty-stepper" aria-label="Quantity for ${escapeHtml(item.product.name)}">
                            <button type="button" data-cart-dec="${escapeHtml(item.key)}" aria-label="Decrease quantity">−</button>
                            <span>${item.qty}</span>
                            <button type="button" data-cart-inc="${escapeHtml(item.key)}" aria-label="Increase quantity" ${!item.available ? 'disabled' : ''}>+</button>
                          </div>
                          <span class="cart-line-card__unit">${formatMoney(item.unitPrice)} each</span>
                        </div>

                        <button type="button" class="cart-item__remove" data-cart-remove="${escapeHtml(item.key)}">
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                `;
              })
              .join('')}
          </div>

          <aside class="cart-summary-panel" aria-label="Order estimate summary">
            <h2 class="cart-summary-panel__title">Order Summary</h2>

            <div class="cart-shipping-methods" role="radiogroup" aria-label="Shipping method">
              <label class="cart-shipping-option ${summary.shippingMethod === 'standard' ? 'is-selected' : ''}">
                <span class="cart-shipping-option__left">
                  <input
                    type="radio"
                    name="cart-shipping-method"
                    value="standard"
                    ${summary.shippingMethod === 'standard' ? 'checked' : ''}
                  />
                  <span>
                    Standard Discreet
                    <span class="cart-shipping-option__sub">3–5 business days · Free at ${formatMoney(commerce.freeShippingThreshold)}+</span>
                  </span>
                </span>
                <span>${standardPriceText}</span>
              </label>

              <label class="cart-shipping-option ${summary.shippingMethod === 'express' ? 'is-selected' : ''}">
                <span class="cart-shipping-option__left">
                  <input
                    type="radio"
                    name="cart-shipping-method"
                    value="express"
                    ${summary.shippingMethod === 'express' ? 'checked' : ''}
                  />
                  <span>
                    Express Discreet
                    <span class="cart-shipping-option__sub">1–2 business days · Priority unmarked parcel</span>
                  </span>
                </span>
                <span>${formatMoney(commerce.expressShippingRate)}</span>
              </label>
            </div>

            <div class="cart-promo-section">
              <form class="drawer-promo-form" id="cart-page-promo-form" novalidate>
                <div class="drawer-promo-field">
                  <input
                    type="text"
                    id="cart-page-promo-input"
                    class="drawer-promo-input"
                    placeholder="Enter promo code"
                    aria-label="Promo code"
                    autocomplete="off"
                  />
                </div>
                <button type="submit" class="drawer-promo-btn">Apply</button>
              </form>
              <p class="drawer-promo-feedback" id="cart-page-promo-error" role="alert">${escapeHtml(promoError)}</p>
              ${
                summary.appliedPromo
                  ? `<div class="promo-applied-pill" style="margin-top: 0.45rem; margin-bottom: 0;">
                      <span>${escapeHtml(summary.appliedPromo.code)} · ${escapeHtml(summary.appliedPromo.description)}</span>
                      <button type="button" data-remove-promo aria-label="Remove promo code">×</button>
                    </div>`
                  : summary.promoNotice
                    ? `<p class="drawer-promo-feedback">${escapeHtml(summary.promoNotice)}</p>`
                    : ''
              }
              <p class="cart-promo-hint">Available sample codes: ${escapeHtml(promoHintCodes)}</p>
            </div>

            <div class="cart-summary-rows">
              <div class="cart-summary-row">
                <span>Subtotal (${summary.itemCount} available ${summary.itemCount === 1 ? 'item' : 'items'})</span>
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
                <span>Tax Estimate (${Math.round(commerce.estimatedTaxRate * 100)}%)</span>
                <span>${formatMoney(summary.taxEstimate)}</span>
              </div>

              <div class="cart-summary-divider">
                <div class="cart-subtotal">
                  <span class="cart-subtotal__label">Estimated Total</span>
                  <span class="cart-subtotal__value">${formatMoney(summary.total)}</span>
                </div>
              </div>
            </div>

            <p class="cart-note">
              Every order ships in unmarked matte packaging. Statements appear as "LUVRA WELLNESS".
            </p>

            ${
              summary.availableItems.length
                ? `<a href="checkout.html" class="btn btn--primary" style="width: 100%;">
                    Proceed to Checkout →
                  </a>`
                : `<button type="button" class="btn btn--outline" disabled>
                    Add an Available Item to Checkout
                  </button>`
            }
          </aside>
        </div>
      `;

      const promoForm = document.getElementById('cart-page-promo-form');
      const promoInput = document.getElementById('cart-page-promo-input');
      if (promoForm && promoInput) {
        promoForm.addEventListener('submit', (e) => {
          e.preventDefault();
          promoError = '';
          const code = promoInput.value;
          isLoading = true;
          renderCartPage();

          global.setTimeout(() => {
            isLoading = false;
            const res = Luvra.store.applyPromoCode(code);
            if (!res.ok) {
              promoError = res.error;
            }
            renderCartPage();
          }, 180);
        });
      }

      rootEl.querySelectorAll('input[name="cart-shipping-method"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
          Luvra.store.setShippingMethod(e.target.value);
        });
      });
    }

    Luvra.store.subscribe(() => {
      if (!isLoading) {
        renderCartPage();
      }
    });

    // Initial loading hydration state
    renderCartPage();
    global.setTimeout(() => {
      isLoading = false;
      renderCartPage();
    }, 120);
  };
})(window);
