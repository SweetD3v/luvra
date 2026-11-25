(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  function formatMoney(amount) {
    return Luvra.formatMoney ? Luvra.formatMoney(amount) : `$${Number(amount || 0).toFixed(2)}`;
  }

  const STEP_LABELS = ['Contact', 'Delivery', 'Payment', 'Review', 'Confirmation'];

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function validateAddress(addr, prefix) {
    const errors = {};
    if (!String(addr.fullName || '').trim()) {
      errors[`${prefix}FullName`] = 'Full name is required.';
    }
    if (!String(addr.line1 || '').trim()) {
      errors[`${prefix}Line1`] = 'Street address is required.';
    }
    if (!String(addr.city || '').trim()) {
      errors[`${prefix}City`] = 'City is required.';
    }
    if (!String(addr.region || '').trim()) {
      errors[`${prefix}Region`] = 'State or province is required.';
    }
    if (!String(addr.postalCode || '').trim() || String(addr.postalCode).trim().length < 3) {
      errors[`${prefix}PostalCode`] = 'Valid postal code is required.';
    }
    if (!String(addr.country || '').trim()) {
      errors[`${prefix}Country`] = 'Country is required.';
    }
    return errors;
  }

  Luvra.initCheckoutPage = function initCheckoutPage() {
    const rootEl = document.getElementById('checkout-root');
    if (!rootEl) return;

    const draft = Luvra.store.getCheckoutDraft();
    let maxUnlockedStep = Math.max(0, Math.min(3, Number(draft.step) || 0));
    let currentStep = maxUnlockedStep;
    let transientPassword = ''; // Never saved to storage
    let simulatedOutcome = 'succeeded';
    let paymentAlert = null; // { status, message }
    let isProcessing = false;
    let promoError = '';
    let confirmedOrder = null;

    function persistDraft() {
      draft.step = currentStep;
      Luvra.store.saveCheckoutDraft(draft);
    }

    function renderStepper() {
      return `
        <nav class="checkout-stepper" aria-label="Checkout progress">
          ${STEP_LABELS.map((label, idx) => {
            const isCurrent = idx === currentStep;
            const isDone = idx < currentStep || (idx <= maxUnlockedStep && currentStep < 4);
            const canClick = currentStep < 4 && idx < currentStep;
            return `
              <button
                type="button"
                class="checkout-step-btn ${isCurrent ? 'is-current' : isDone ? 'is-done' : ''}"
                ${canClick ? `data-goto-step="${idx}"` : 'disabled'}
                aria-current="${isCurrent ? 'step' : 'false'}"
              >
                <span class="checkout-step-btn__num">${idx < currentStep ? '✓' : idx + 1}</span>
                <span>${escapeHtml(label)}</span>
              </button>
            `;
          }).join('')}
        </nav>
      `;
    }

    function renderSidebarSummary(summary) {
      const commerce = Luvra.CATALOG.commerce;
      const promoHint = (commerce.promoCodes || []).map((p) => p.code).join(', ');
      return `
        <aside class="cart-summary-panel" aria-label="Order summary">
          <h2 class="cart-summary-panel__title">Order Summary (${summary.itemCount})</h2>

          <div class="checkout-mini-items">
            ${summary.availableItems
              .map(
                (item) => `
              <div class="checkout-mini-item">
                <div class="checkout-mini-item__left">
                  <img src="${escapeHtml(item.product.image)}" alt="${escapeHtml(item.product.name)}" />
                  <div>
                    <div class="checkout-mini-item__name">${escapeHtml(item.product.name)}</div>
                    <div class="checkout-mini-item__meta">
                      Qty ${item.qty}${item.variant ? ` · ${escapeHtml(item.variant)}` : ''}
                    </div>
                  </div>
                </div>
                <span>${formatMoney(item.lineTotal)}</span>
              </div>
            `
              )
              .join('')}
          </div>

          <div class="cart-promo-section">
            <form class="drawer-promo-form" id="checkout-promo-form" novalidate>
              <div class="drawer-promo-field">
                <input
                  type="text"
                  id="checkout-promo-input"
                  class="drawer-promo-input"
                  placeholder="Promo code"
                  aria-label="Promo code"
                  autocomplete="off"
                />
              </div>
              <button type="submit" class="drawer-promo-btn">Apply</button>
            </form>
            <p class="drawer-promo-feedback" role="alert">${escapeHtml(promoError)}</p>
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
            <p class="cart-promo-hint">Sample codes: ${escapeHtml(promoHint)}</p>
          </div>

          <div class="cart-summary-rows">
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
              <span>Delivery (${summary.shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
              <span>${summary.shippingEstimate === 0 ? 'Complimentary' : formatMoney(summary.shippingEstimate)}</span>
            </div>
            <div class="cart-summary-row">
              <span>Estimated Tax (${Math.round(commerce.estimatedTaxRate * 100)}%)</span>
              <span>${formatMoney(summary.taxEstimate)}</span>
            </div>
            <div class="cart-summary-divider">
              <div class="cart-subtotal">
                <span class="cart-subtotal__label">Total</span>
                <span class="cart-subtotal__value">${formatMoney(summary.total)}</span>
              </div>
            </div>
          </div>

          <p class="cart-note" style="margin-bottom: 0;">
            Plain matte outer packaging · Billing descriptor: "LUVRA WELLNESS"
          </p>
        </aside>
      `;
    }

    function renderContactStep(errors = {}) {
      const c = draft.contact;
      return `
        <div class="checkout-panel">
          <div class="checkout-panel__head">
            <h2 class="checkout-panel__title">1. Contact Information</h2>
            <span class="demo-badge">Guest Checkout Enabled</span>
          </div>

          <form id="checkout-step-form" novalidate>
            <div class="checkout-form-grid">
              <div class="form-field form-field--full">
                <label for="contact-email">Email Address *</label>
                <input
                  type="email"
                  id="contact-email"
                  value="${escapeHtml(c.email)}"
                  placeholder="you@example.com"
                  autocomplete="email"
                  aria-invalid="${errors.email ? 'true' : 'false'}"
                  required
                />
                <span class="field-error">${escapeHtml(errors.email || '')}</span>
              </div>
            </div>

            <label class="checkout-checkbox">
              <input type="checkbox" id="contact-create-account" ${c.createAccount ? 'checked' : ''} />
              <span>
                <strong>Optional: Create a Luvra account</strong>
                Leave unchecked to continue smoothly as a guest. Only your email is needed for order updates.
              </span>
            </label>

            <div id="optional-password-wrap" ${c.createAccount ? '' : 'hidden'} style="margin-top: 1rem;">
              <div class="form-field">
                <label for="contact-password">Create Password (8+ characters) *</label>
                <input
                  type="password"
                  id="contact-password"
                  value="${escapeHtml(transientPassword)}"
                  placeholder="Minimum 8 characters"
                  autocomplete="new-password"
                  aria-invalid="${errors.password ? 'true' : 'false'}"
                />
                <span class="field-error">${escapeHtml(errors.password || '')}</span>
              </div>
            </div>

            <div class="checkout-actions">
              <a href="cart.html" class="quiz-btn-ghost">← Back to Bag</a>
              <button type="submit" class="btn btn--primary">Continue to Delivery →</button>
            </div>
          </form>
        </div>
      `;
    }

    function renderAddressFields(addr, prefix, errors) {
      return `
        <div class="checkout-form-grid">
          <div class="form-field form-field--full">
            <label for="${prefix}-full-name">Full Name *</label>
            <input
              type="text"
              id="${prefix}-full-name"
              value="${escapeHtml(addr.fullName)}"
              autocomplete="${prefix === 'ship' ? 'shipping name' : 'billing name'}"
              aria-invalid="${errors[`${prefix}FullName`] ? 'true' : 'false'}"
            />
            <span class="field-error">${escapeHtml(errors[`${prefix}FullName`] || '')}</span>
          </div>

          <div class="form-field form-field--full">
            <label for="${prefix}-line1">Street Address *</label>
            <input
              type="text"
              id="${prefix}-line1"
              value="${escapeHtml(addr.line1)}"
              autocomplete="${prefix === 'ship' ? 'shipping address-line1' : 'billing address-line1'}"
              aria-invalid="${errors[`${prefix}Line1`] ? 'true' : 'false'}"
            />
            <span class="field-error">${escapeHtml(errors[`${prefix}Line1`] || '')}</span>
          </div>

          <div class="form-field form-field--full">
            <label for="${prefix}-line2">Apartment / Suite (Optional)</label>
            <input
              type="text"
              id="${prefix}-line2"
              value="${escapeHtml(addr.line2 || '')}"
              autocomplete="${prefix === 'ship' ? 'shipping address-line2' : 'billing address-line2'}"
            />
          </div>

          <div class="form-field">
            <label for="${prefix}-city">City *</label>
            <input
              type="text"
              id="${prefix}-city"
              value="${escapeHtml(addr.city)}"
              autocomplete="${prefix === 'ship' ? 'shipping address-level2' : 'billing address-level2'}"
              aria-invalid="${errors[`${prefix}City`] ? 'true' : 'false'}"
            />
            <span class="field-error">${escapeHtml(errors[`${prefix}City`] || '')}</span>
          </div>

          <div class="form-field">
            <label for="${prefix}-region">State / Province *</label>
            <input
              type="text"
              id="${prefix}-region"
              value="${escapeHtml(addr.region)}"
              autocomplete="${prefix === 'ship' ? 'shipping address-level1' : 'billing address-level1'}"
              aria-invalid="${errors[`${prefix}Region`] ? 'true' : 'false'}"
            />
            <span class="field-error">${escapeHtml(errors[`${prefix}Region`] || '')}</span>
          </div>

          <div class="form-field">
            <label for="${prefix}-postal">Postal Code *</label>
            <input
              type="text"
              id="${prefix}-postal"
              value="${escapeHtml(addr.postalCode)}"
              autocomplete="${prefix === 'ship' ? 'shipping postal-code' : 'billing postal-code'}"
              aria-invalid="${errors[`${prefix}PostalCode`] ? 'true' : 'false'}"
            />
            <span class="field-error">${escapeHtml(errors[`${prefix}PostalCode`] || '')}</span>
          </div>

          <div class="form-field">
            <label for="${prefix}-country">Country *</label>
            <select id="${prefix}-country">
              ${['United States', 'Canada', 'United Kingdom', 'Australia']
                .map(
                  (cty) =>
                    `<option value="${cty}" ${addr.country === cty ? 'selected' : ''}>${cty}</option>`
                )
                .join('')}
            </select>
            <span class="field-error">${escapeHtml(errors[`${prefix}Country`] || '')}</span>
          </div>
        </div>
      `;
    }

    function renderDeliveryStep(summary, errors = {}) {
      const commerce = Luvra.CATALOG.commerce;
      const standardText =
        summary.discountedSubtotal >= commerce.freeShippingThreshold
          ? 'Complimentary'
          : formatMoney(commerce.standardShippingRate);

      return `
        <div class="checkout-panel">
          <div class="checkout-panel__head">
            <h2 class="checkout-panel__title">2. Delivery &amp; Addresses</h2>
            <span class="demo-badge">Unmarked Packaging</span>
          </div>

          <form id="checkout-step-form" novalidate>
            <h3 class="checkout-subsection__title">Shipping Address</h3>
            ${renderAddressFields(draft.shippingAddress, 'ship', errors)}

            <div class="checkout-subsection">
              <h3 class="checkout-subsection__title">Delivery Choice</h3>
              <div class="cart-shipping-methods" role="radiogroup" aria-label="Delivery method">
                <label class="cart-shipping-option ${summary.shippingMethod === 'standard' ? 'is-selected' : ''}">
                  <span class="cart-shipping-option__left">
                    <input type="radio" name="checkout-delivery-method" value="standard" ${summary.shippingMethod === 'standard' ? 'checked' : ''} />
                    <span>
                      Standard Discreet
                      <span class="cart-shipping-option__sub">3–5 business days · Plain matte exterior</span>
                    </span>
                  </span>
                  <span>${standardText}</span>
                </label>

                <label class="cart-shipping-option ${summary.shippingMethod === 'express' ? 'is-selected' : ''}">
                  <span class="cart-shipping-option__left">
                    <input type="radio" name="checkout-delivery-method" value="express" ${summary.shippingMethod === 'express' ? 'checked' : ''} />
                    <span>
                      Express Discreet
                      <span class="cart-shipping-option__sub">1–2 business days · Priority unmarked parcel</span>
                    </span>
                  </span>
                  <span>${formatMoney(commerce.expressShippingRate)}</span>
                </label>
              </div>
            </div>

            <div class="checkout-subsection">
              <h3 class="checkout-subsection__title">Billing Address</h3>
              <label class="checkout-checkbox" style="margin-top: 0;">
                <input type="checkbox" id="billing-same-checkbox" ${draft.billingSameAsShipping ? 'checked' : ''} />
                <span>
                  <strong>Billing address same as shipping address</strong>
                </span>
              </label>

              <div id="billing-address-fields" ${draft.billingSameAsShipping ? 'hidden' : ''} style="margin-top: 1rem;">
                ${renderAddressFields(draft.billingAddress, 'bill', errors)}
              </div>
            </div>

            <div class="checkout-actions">
              <button type="button" class="quiz-btn-ghost" data-goto-step="0">← Back to Contact</button>
              <button type="submit" class="btn btn--primary">Continue to Payment →</button>
            </div>
          </form>
        </div>
      `;
    }

    function renderPaymentStep(errors = {}) {
      const isDemo = Luvra.paymentProvider.isDemoMode();
      const options = Luvra.paymentProvider.getTokenizedOptions();
      const selectedId = draft.paymentToken ? draft.paymentToken.tokenId : '';

      return `
        <div class="checkout-panel">
          <div class="checkout-panel__head">
            <h2 class="checkout-panel__title">3. Tokenized Payment</h2>
            <span class="demo-badge">${isDemo ? 'Demo Mode Active' : 'Stripe Hosted'}</span>
          </div>

          <form id="checkout-step-form" novalidate>
            <div class="hosted-payment-box" id="stripe-payment-element">
              <div class="hosted-payment-notice">
                ${
                  isDemo
                    ? '<strong>Demo Mode:</strong> Live Stripe credentials are not configured in this preview. No raw card numbers or security codes are collected, stored, or logged, and no real payment will be made.'
                    : '<strong>Hosted Payment:</strong> Tokenized session prepared through Stripe.'
                }
              </div>

              <div role="radiogroup" aria-label="Tokenized payment methods">
                ${options
                  .map(
                    (opt) => `
                  <label class="token-option ${selectedId === opt.id ? 'is-selected' : ''}">
                    <span class="token-option__left">
                      <input type="radio" name="payment-token-option" value="${escapeHtml(opt.id)}" ${selectedId === opt.id ? 'checked' : ''} />
                      <span>
                        <span class="token-option__title">${escapeHtml(opt.label)}</span>
                        <span class="token-option__sub">${escapeHtml(opt.note)}</span>
                      </span>
                    </span>
                    <span class="demo-badge">Tokenized</span>
                  </label>
                `
                  )
                  .join('')}
              </div>
              <span class="field-error">${escapeHtml(errors.paymentToken || '')}</span>

              <div class="demo-outcome-box">
                <div class="form-field">
                  <label for="demo-outcome-select">Demo Mode Authorization Outcome</label>
                  <select id="demo-outcome-select">
                    <option value="succeeded" ${simulatedOutcome === 'succeeded' ? 'selected' : ''}>Confirm Demo Payment (Success)</option>
                    <option value="pending" ${simulatedOutcome === 'pending' ? 'selected' : ''}>Simulate Pending Verification</option>
                    <option value="failed" ${simulatedOutcome === 'failed' ? 'selected' : ''}>Simulate Declined / Failed Payment</option>
                    <option value="cancelled" ${simulatedOutcome === 'cancelled' ? 'selected' : ''}>Simulate Cancelled Session</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="checkout-actions">
              <button type="button" class="quiz-btn-ghost" data-goto-step="1">← Back to Delivery</button>
              <button type="submit" class="btn btn--primary">Continue to Review →</button>
            </div>
          </form>
        </div>
      `;
    }

    function formatAddrText(addr) {
      return [
        addr.fullName,
        addr.line1 + (addr.line2 ? `, ${addr.line2}` : ''),
        `${addr.city}, ${addr.region} ${addr.postalCode}`,
        addr.country,
      ]
        .filter(Boolean)
        .map(escapeHtml)
        .join('<br/>');
    }

    function renderReviewStep(summary) {
      const isDemo = Luvra.paymentProvider.isDemoMode();
      const billingAddr = draft.billingSameAsShipping ? draft.shippingAddress : draft.billingAddress;

      return `
        <div class="checkout-panel" ${isProcessing ? 'aria-busy="true"' : ''}>
          <div class="checkout-panel__head">
            <h2 class="checkout-panel__title">4. Final Review</h2>
            <span class="demo-badge">${isDemo ? 'Demo Mode' : 'Ready to Authorize'}</span>
          </div>

          ${
            paymentAlert
              ? `<div class="payment-status-card ${paymentAlert.status === 'pending' ? 'is-pending' : ''}" role="alert">
                  <h3 class="payment-status-card__title">
                    ${
                      paymentAlert.status === 'pending'
                        ? 'Payment Pending Verification'
                        : paymentAlert.status === 'cancelled'
                          ? 'Payment Session Cancelled'
                          : 'Payment Authorization Failed'
                    }
                  </h3>
                  <p class="payment-status-card__text">${escapeHtml(paymentAlert.message)}</p>
                  <div class="payment-status-card__actions">
                    <button type="button" class="btn btn--primary" id="checkout-retry-btn">
                      ${paymentAlert.status === 'pending' ? 'Complete Demo Verification →' : 'Retry Payment →'}
                    </button>
                    <button type="button" class="quiz-btn-ghost" data-goto-step="2">
                      Change Payment Method
                    </button>
                  </div>
                </div>`
              : ''
          }

          <div class="review-grid">
            <div class="review-box">
              <div class="review-box__head">
                <span class="review-box__label">Contact</span>
                <button type="button" class="review-box__edit" data-goto-step="0">Edit</button>
              </div>
              <p class="review-box__body">
                ${escapeHtml(draft.contact.email)}<br/>
                ${draft.contact.createAccount ? 'Account creation requested' : 'Checking out as Guest'}
              </p>
            </div>

            <div class="review-box">
              <div class="review-box__head">
                <span class="review-box__label">Delivery &amp; Payment</span>
                <button type="button" class="review-box__edit" data-goto-step="2">Edit</button>
              </div>
              <p class="review-box__body">
                ${summary.shippingMethod === 'express' ? 'Express Discreet (1–2 days)' : 'Standard Discreet (3–5 days)'}<br/>
                ${escapeHtml(draft.paymentToken ? draft.paymentToken.label : 'Demo Token')}
              </p>
            </div>

            <div class="review-box">
              <div class="review-box__head">
                <span class="review-box__label">Shipping Address</span>
                <button type="button" class="review-box__edit" data-goto-step="1">Edit</button>
              </div>
              <p class="review-box__body">${formatAddrText(draft.shippingAddress)}</p>
            </div>

            <div class="review-box">
              <div class="review-box__head">
                <span class="review-box__label">Billing Address</span>
                <button type="button" class="review-box__edit" data-goto-step="1">Edit</button>
              </div>
              <p class="review-box__body">
                ${draft.billingSameAsShipping ? 'Same as shipping address<br/>' : ''}
                ${formatAddrText(billingAddr)}
              </p>
            </div>
          </div>

          <div class="hosted-payment-notice" style="margin-bottom: 0;">
            ${
              isDemo
                ? '<strong>Demo Mode Notice:</strong> Submitting below runs a simulated authorization. No real payment will be made, and an order record is created only after confirmed demo payment.'
                : 'Your order is confirmed only upon authorized payment.'
            }
          </div>

          <div class="checkout-actions">
            <button type="button" class="quiz-btn-ghost" data-goto-step="2" ${isProcessing ? 'disabled' : ''}>
              ← Back to Payment
            </button>
            <button type="button" class="btn btn--primary" id="checkout-place-order-btn" ${isProcessing ? 'disabled' : ''}>
              ${
                isProcessing
                  ? 'Authorizing Demo Payment...'
                  : `${isDemo ? 'Place Demo Order' : 'Place Order'} — ${formatMoney(summary.total)}`
              }
            </button>
          </div>
        </div>
      `;
    }

    function renderConfirmationStep(order) {
      return `
        <div class="confirmation-card">
          <span class="demo-badge">${order.isDemo ? 'Demo Mode Receipt · No Real Payment Made' : 'Order Confirmed'}</span>
          <h2 class="checkout-title" style="margin-top: 0.9rem;">
            Thank You — Order <em>Confirmed</em>
          </h2>
          <p class="confirmation-order-id">
            Order #${escapeHtml(order.orderId)} · Payment Ref ${escapeHtml(order.paymentReference)}
          </p>
          <p class="section-subtitle" style="margin-bottom: 1.5rem;">
            ${
              order.isDemo
                ? 'This confirmation reflects a completed demo checkout. No real card was charged and no physical shipment will be dispatched.'
                : `A discreet confirmation note has been prepared for ${escapeHtml(order.contactEmail)}.`
            }
          </p>

          <div class="review-grid">
            <div class="review-box">
              <span class="review-box__label">Contact &amp; Account</span>
              <p class="review-box__body" style="margin-top: 0.35rem;">
                ${escapeHtml(order.contactEmail)}<br/>
                ${order.guestCheckout ? 'Guest Checkout' : 'Optional account requested'}
              </p>
            </div>
            <div class="review-box">
              <span class="review-box__label">Payment &amp; Delivery</span>
              <p class="review-box__body" style="margin-top: 0.35rem;">
                ${escapeHtml(order.paymentLabel)}<br/>
                ${order.shippingMethod === 'express' ? 'Express Discreet' : 'Standard Discreet'}
              </p>
            </div>
            <div class="review-box">
              <span class="review-box__label">Shipping Address</span>
              <p class="review-box__body" style="margin-top: 0.35rem;">${formatAddrText(order.shippingAddress)}</p>
            </div>
            <div class="review-box">
              <span class="review-box__label">Billing Address</span>
              <p class="review-box__body" style="margin-top: 0.35rem;">${formatAddrText(order.billingAddress)}</p>
            </div>
          </div>

          <div class="review-box" style="margin-bottom: 1.5rem;">
            <span class="review-box__label">Items &amp; Totals</span>
            <div class="cart-summary-rows" style="margin-top: 0.75rem; margin-bottom: 0;">
              ${order.items
                .map(
                  (item) => `
                <div class="cart-summary-row">
                  <span>${item.qty} × ${escapeHtml(item.name)}${item.variant ? ` (${escapeHtml(item.variant)})` : ''}</span>
                  <span>${formatMoney(item.lineTotal)}</span>
                </div>
              `
                )
                .join('')}
              <div class="cart-summary-divider">
                <div class="cart-summary-row"><span>Subtotal</span><span>${formatMoney(order.subtotal)}</span></div>
                ${
                  order.discount > 0
                    ? `<div class="cart-summary-row is-discount"><span>Promo (${escapeHtml(order.appliedPromo)})</span><span>−${formatMoney(order.discount)}</span></div>`
                    : ''
                }
                <div class="cart-summary-row"><span>Shipping</span><span>${order.shippingEstimate === 0 ? 'Complimentary' : formatMoney(order.shippingEstimate)}</span></div>
                <div class="cart-summary-row"><span>Tax</span><span>${formatMoney(order.taxEstimate)}</span></div>
                <div class="cart-subtotal" style="margin-top: 0.5rem;">
                  <span class="cart-subtotal__label">Total (${order.isDemo ? 'Demo' : 'Paid'})</span>
                  <span class="cart-subtotal__value">${formatMoney(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.85rem; flex-wrap: wrap;">
            <a href="shop.html" class="btn btn--primary">Continue Shopping →</a>
            <a href="index.html" class="quiz-btn-ghost">Return Home</a>
          </div>
        </div>
      `;
    }

    function executePayment(overrideOutcome) {
      const summary = Luvra.store.getCartSummary();
      const outcomeToUse = overrideOutcome || simulatedOutcome;
      isProcessing = true;
      paymentAlert = null;
      renderCheckout();

      global.setTimeout(() => {
        isProcessing = false;
        const result = Luvra.paymentProvider.confirmPayment({
          token: draft.paymentToken,
          amount: summary.total,
          simulatedOutcome: outcomeToUse,
        });

        if (result.status === 'succeeded') {
          confirmedOrder = Luvra.store.createConfirmedOrder({
            draft,
            summary,
            paymentResult: result,
          });
          if (confirmedOrder) {
            currentStep = 4;
            maxUnlockedStep = 4;
            renderCheckout();
            return;
          }
        }

        paymentAlert = {
          status: result.status,
          message: result.message,
        };
        renderCheckout();
      }, 220);
    }

    function bindStepEvents(summary) {
      rootEl.querySelectorAll('[data-goto-step]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = Number(btn.getAttribute('data-goto-step'));
          if (target >= 0 && target <= 3) {
            currentStep = target;
            paymentAlert = null;
            persistDraft();
            renderCheckout();
          }
        });
      });

      const promoForm = document.getElementById('checkout-promo-form');
      const promoInput = document.getElementById('checkout-promo-input');
      if (promoForm && promoInput) {
        promoForm.addEventListener('submit', (e) => {
          e.preventDefault();
          promoError = '';
          const res = Luvra.store.applyPromoCode(promoInput.value);
          if (!res.ok) {
            promoError = res.error;
          }
          renderCheckout();
        });
      }

      if (currentStep === 0) {
        const emailEl = document.getElementById('contact-email');
        const createAccEl = document.getElementById('contact-create-account');
        const pwWrap = document.getElementById('optional-password-wrap');
        const pwEl = document.getElementById('contact-password');

        if (emailEl) {
          emailEl.addEventListener('input', (e) => {
            draft.contact.email = e.target.value;
            persistDraft();
          });
        }
        if (createAccEl) {
          createAccEl.addEventListener('change', (e) => {
            draft.contact.createAccount = e.target.checked;
            if (pwWrap) pwWrap.hidden = !e.target.checked;
            persistDraft();
          });
        }
        if (pwEl) {
          pwEl.addEventListener('input', (e) => {
            transientPassword = e.target.value;
          });
        }

        const form = document.getElementById('checkout-step-form');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            const errors = {};
            if (!validateEmail(draft.contact.email)) {
              errors.email = 'Please enter a valid email address for order confirmation.';
            }
            if (draft.contact.createAccount && transientPassword.trim().length < 8) {
              errors.password = 'Password must be at least 8 characters to create an account.';
            }
            if (Object.keys(errors).length) {
              renderCheckout(errors);
              return;
            }
            currentStep = 1;
            maxUnlockedStep = Math.max(maxUnlockedStep, 1);
            persistDraft();
            renderCheckout();
          });
        }
      } else if (currentStep === 1) {
        const bindAddr = (prefix, targetObj) => {
          const map = [
            ['full-name', 'fullName'],
            ['line1', 'line1'],
            ['line2', 'line2'],
            ['city', 'city'],
            ['region', 'region'],
            ['postal', 'postalCode'],
            ['country', 'country'],
          ];
          map.forEach(([suffix, prop]) => {
            const el = document.getElementById(`${prefix}-${suffix}`);
            if (el) {
              el.addEventListener(suffix === 'country' ? 'change' : 'input', (e) => {
                targetObj[prop] = e.target.value;
                persistDraft();
              });
            }
          });
        };

        bindAddr('ship', draft.shippingAddress);
        bindAddr('bill', draft.billingAddress);

        const sameCheck = document.getElementById('billing-same-checkbox');
        const billFields = document.getElementById('billing-address-fields');
        if (sameCheck) {
          sameCheck.addEventListener('change', (e) => {
            draft.billingSameAsShipping = e.target.checked;
            if (billFields) billFields.hidden = e.target.checked;
            persistDraft();
          });
        }

        rootEl.querySelectorAll('input[name="checkout-delivery-method"]').forEach((radio) => {
          radio.addEventListener('change', (e) => {
            Luvra.store.setShippingMethod(e.target.value);
          });
        });

        const form = document.getElementById('checkout-step-form');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            let errors = validateAddress(draft.shippingAddress, 'ship');
            if (!draft.billingSameAsShipping) {
              errors = { ...errors, ...validateAddress(draft.billingAddress, 'bill') };
            }
            if (Object.keys(errors).length) {
              renderCheckout(errors);
              return;
            }
            currentStep = 2;
            maxUnlockedStep = Math.max(maxUnlockedStep, 2);
            persistDraft();
            renderCheckout();
          });
        }
      } else if (currentStep === 2) {
        rootEl.querySelectorAll('input[name="payment-token-option"]').forEach((radio) => {
          radio.addEventListener('change', (e) => {
            draft.paymentToken = Luvra.paymentProvider.createPaymentToken(e.target.value);
            persistDraft();
            renderCheckout();
          });
        });

        const outcomeSel = document.getElementById('demo-outcome-select');
        if (outcomeSel) {
          outcomeSel.addEventListener('change', (e) => {
            simulatedOutcome = e.target.value;
          });
        }

        const form = document.getElementById('checkout-step-form');
        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!draft.paymentToken || !draft.paymentToken.tokenId) {
              renderCheckout({
                paymentToken: 'Please choose a tokenized payment method to continue.',
              });
              return;
            }
            currentStep = 3;
            maxUnlockedStep = Math.max(maxUnlockedStep, 3);
            paymentAlert = null;
            persistDraft();
            renderCheckout();
          });
        }
      } else if (currentStep === 3) {
        const placeBtn = document.getElementById('checkout-place-order-btn');
        if (placeBtn) {
          placeBtn.addEventListener('click', () => executePayment());
        }

        const retryBtn = document.getElementById('checkout-retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            // If retrying from pending/declined/cancelled in demo mode, recover cleanly to succeeded
            simulatedOutcome = 'succeeded';
            executePayment('succeeded');
          });
        }
      }
    }

    function renderCheckout(errors = {}) {
      if (currentStep === 4 && confirmedOrder) {
        rootEl.innerHTML = `
          <div class="checkout-header">
            <div>
              <span class="kicker">Luvra Checkout</span>
              <h1 class="checkout-title">Order <em>Confirmation</em></h1>
            </div>
          </div>
          ${renderStepper()}
          ${renderConfirmationStep(confirmedOrder)}
        `;
        return;
      }

      const summary = Luvra.store.getCartSummary();
      if (!summary.availableItems.length) {
        rootEl.innerHTML = `
          <div class="cart-empty-page">
            <span class="kicker">Checkout</span>
            <h1 class="cart-empty-page__title">No Available Items in Your Bag</h1>
            <p class="cart-empty-page__copy">
              Add an available piece to your bag before starting checkout.
            </p>
            <div class="cart-empty-page__actions">
              <a href="shop.html" class="btn btn--primary">Explore Shop →</a>
              <a href="cart.html" class="quiz-btn-ghost">Return to Bag</a>
            </div>
          </div>
        `;
        return;
      }

      const stepHtml =
        currentStep === 0
          ? renderContactStep(errors)
          : currentStep === 1
            ? renderDeliveryStep(summary, errors)
            : currentStep === 2
              ? renderPaymentStep(errors)
              : renderReviewStep(summary);

      rootEl.innerHTML = `
        <div class="checkout-header">
          <div>
            <span class="kicker">Discreet Checkout</span>
            <h1 class="checkout-title">Complete Your <em>Order</em></h1>
          </div>
          ${
            Luvra.paymentProvider.isDemoMode()
              ? '<span class="demo-badge">Demo Mode · No Real Charges</span>'
              : ''
          }
        </div>
        ${renderStepper()}
        <div class="checkout-grid">
          ${stepHtml}
          ${renderSidebarSummary(summary)}
        </div>
      `;

      bindStepEvents(summary);
    }

    Luvra.store.subscribe(() => {
      if (currentStep < 4 && !isProcessing) {
        renderCheckout();
      }
    });

    renderCheckout();
  };
})(window);
