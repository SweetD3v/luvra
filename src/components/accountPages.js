(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  function formatMoney(amount) {
    return Luvra.formatMoney ? Luvra.formatMoney(amount) : `$${Number(amount || 0).toFixed(2)}`;
  }

  const ACCOUNT_NAV_ITEMS = [
    { mode: 'account', href: 'account.html', label: 'Account & Sign In' },
    { mode: 'favorites', href: 'favorites.html', label: 'Saved Favorites' },
    { mode: 'orders', href: 'orders.html', label: 'Order History' },
    { mode: 'addresses', href: 'addresses.html', label: 'Saved Addresses' },
    { mode: 'reset-password', href: 'reset-password.html', label: 'Reset Password' },
  ];

  function renderAccountNav(activeMode) {
    return `
      <nav class="account-nav" aria-label="Account sections">
        ${ACCOUNT_NAV_ITEMS.map(
          (item) => `
          <a href="${item.href}" class="account-nav__link ${activeMode === item.mode ? 'is-active' : ''}">
            <span>${escapeHtml(item.label)}</span>
            <span aria-hidden="true">→</span>
          </a>
        `
        ).join('')}
      </nav>
    `;
  }

  Luvra.initAccountPage = function initAccountPage(pageMode) {
    const rootEl = document.getElementById('account-page-root');
    if (!rootEl) return;

    function renderAccountSignInView() {
      const account = Luvra.store.getCurrentAccount();

      if (account) {
        const ordersCount = Luvra.store.getOrderHistory().length;
        const addrCount = Luvra.store.getSavedAddresses().length;
        const favCount = Luvra.store.getState().favorites.length;

        return `
          <div class="account-card">
            <div class="checkout-panel__head">
              <div>
                <span class="kicker">Member Profile</span>
                <h2 class="account-subcard__title" style="font-size: 1.7rem;">Welcome, ${escapeHtml(account.name)}</h2>
                <p class="section-subtitle" style="margin-top: 0.25rem;">${escapeHtml(account.email)} · Local browser preview account</p>
              </div>
              <button type="button" class="quiz-btn-ghost" id="account-signout-btn">Sign Out</button>
            </div>

            <div class="account-split">
              <div class="account-subcard">
                <h3 class="account-subcard__title">Order History</h3>
                <p class="section-subtitle">${ordersCount} ${ordersCount === 1 ? 'order' : 'orders'} recorded in this browser.</p>
                <a href="orders.html" class="text-link" style="margin-top: 0.85rem;">View Orders →</a>
              </div>
              <div class="account-subcard">
                <h3 class="account-subcard__title">Saved Favorites</h3>
                <p class="section-subtitle">${favCount} ${favCount === 1 ? 'piece' : 'pieces'} saved to your shortlist.</p>
                <a href="favorites.html" class="text-link" style="margin-top: 0.85rem;">View Favorites →</a>
              </div>
              <div class="account-subcard">
                <h3 class="account-subcard__title">Saved Addresses</h3>
                <p class="section-subtitle">${addrCount} saved shipping ${addrCount === 1 ? 'address' : 'addresses'}.</p>
                <a href="addresses.html" class="text-link" style="margin-top: 0.85rem;">Manage Addresses →</a>
              </div>
              <div class="account-subcard">
                <h3 class="account-subcard__title">Password &amp; Security</h3>
                <p class="section-subtitle">Update your local preview account password anytime.</p>
                <a href="reset-password.html" class="text-link" style="margin-top: 0.85rem;">Reset Password →</a>
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="account-card">
          <div class="checkout-panel__head">
            <div>
              <h2 class="account-subcard__title" style="font-size: 1.65rem;">Optional Member Access</h2>
              <p class="section-subtitle" style="margin-top: 0.2rem;">
                Accounts are optional—you can browse, favorite, and check out as a guest anytime.
              </p>
            </div>
            <a href="shop.html" class="text-link">Continue as Guest →</a>
          </div>

          <div class="account-split">
            <div class="account-subcard">
              <h3 class="account-subcard__title">Sign In</h3>
              <p class="product-card__desc">Access your local demo account, order history, and addresses.</p>
              <form class="account-form" id="signin-form" novalidate>
                <div class="form-field">
                  <label for="signin-email">Email</label>
                  <input type="email" id="signin-email" required autocomplete="email" placeholder="you@example.com" />
                </div>
                <div class="form-field">
                  <label for="signin-password">Password</label>
                  <input type="password" id="signin-password" required autocomplete="current-password" placeholder="Enter password" />
                </div>
                <button type="submit" class="btn btn--primary">Sign In</button>
              </form>
              <p class="account-error-msg" id="signin-error" role="alert"></p>
              <a href="reset-password.html" class="text-link" style="margin-top: 0.75rem;">Forgot password? →</a>
            </div>

            <div class="account-subcard">
              <h3 class="account-subcard__title">Create Account</h3>
              <p class="product-card__desc">Creates a private demo account stored locally in this browser.</p>
              <form class="account-form" id="register-form" novalidate>
                <div class="form-field">
                  <label for="reg-name">Name (Optional)</label>
                  <input type="text" id="reg-name" autocomplete="name" placeholder="Preferred name" />
                </div>
                <div class="form-field">
                  <label for="reg-email">Email *</label>
                  <input type="email" id="reg-email" required autocomplete="email" placeholder="you@example.com" />
                </div>
                <div class="form-field">
                  <label for="reg-password">Password (8+ characters) *</label>
                  <input type="password" id="reg-password" required autocomplete="new-password" placeholder="Minimum 8 characters" />
                </div>
                <button type="submit" class="btn btn--outline">Create Demo Account</button>
              </form>
              <p class="account-error-msg" id="register-error" role="alert"></p>
            </div>
          </div>
        </div>
      `;
    }

    function renderResetView() {
      return `
        <div class="account-card">
          <h2 class="account-subcard__title" style="font-size: 1.65rem;">Reset Password</h2>
          <p class="section-subtitle">
            Enter your account email and a new password to update your local preview account.
          </p>

          <form class="account-form" id="reset-password-form" style="max-width: 440px;" novalidate>
            <div class="form-field">
              <label for="reset-email">Account Email *</label>
              <input type="email" id="reset-email" required autocomplete="email" placeholder="you@example.com" />
            </div>
            <div class="form-field">
              <label for="reset-new-password">New Password (8+ characters) *</label>
              <input type="password" id="reset-new-password" required autocomplete="new-password" placeholder="Minimum 8 characters" />
            </div>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button type="submit" class="btn btn--primary">Update Password</button>
              <a href="account.html" class="quiz-btn-ghost">Back to Sign In</a>
            </div>
          </form>
          <p class="account-error-msg" id="reset-error" role="alert"></p>
          <p class="account-status-msg" id="reset-status" role="status"></p>
        </div>
      `;
    }

    function renderOrdersView() {
      const orders = Luvra.store.getOrderHistory();
      if (!orders.length) {
        return `
          <div class="account-card">
            <h2 class="account-subcard__title" style="font-size: 1.65rem;">Order History</h2>
            <p class="section-subtitle" style="margin-bottom: 1.25rem;">
              No orders have been completed in this browser yet. Guest and member orders completed
              through Checkout appear here automatically.
            </p>
            <a href="shop.html" class="btn btn--primary">Explore Shop →</a>
          </div>
        `;
      }

      return `
        <div class="account-card">
          <div class="checkout-panel__head">
            <h2 class="account-subcard__title" style="font-size: 1.65rem;">Order History (${orders.length})</h2>
            <a href="shop.html" class="text-link">Shop Collection →</a>
          </div>
          <div class="order-list">
            ${orders
              .map(
                (ord) => `
              <article class="order-card">
                <div class="order-card__head">
                  <div>
                    <span class="order-card__id">Order #${escapeHtml(ord.orderId)}</span>
                    <span class="product-card__category" style="display: block;">
                      ${escapeHtml(new Date(ord.createdAt).toLocaleDateString())} · ${escapeHtml(ord.contactEmail)}
                    </span>
                  </div>
                  <div style="text-align: right;">
                    <span class="demo-badge">${ord.isDemo ? 'Demo Order' : 'Confirmed'}</span>
                    <div style="color: var(--gold); margin-top: 0.35rem; font-size: 0.95rem;">
                      ${formatMoney(ord.total)}
                    </div>
                  </div>
                </div>
                <div class="cart-summary-rows" style="margin-bottom: 0;">
                  ${(ord.items || [])
                    .map(
                      (item) => `
                    <div class="cart-summary-row">
                      <span>${item.qty} × ${escapeHtml(item.name)}${item.variant ? ` (${escapeHtml(item.variant)})` : ''}</span>
                      <span>${formatMoney(item.lineTotal)}</span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    function renderAddressesView() {
      const addresses = Luvra.store.getSavedAddresses();
      return `
        <div class="account-card">
          <div class="checkout-panel__head">
            <div>
              <h2 class="account-subcard__title" style="font-size: 1.65rem;">Saved Addresses</h2>
              <p class="section-subtitle">Manage discreet delivery addresses stored in this browser.</p>
            </div>
          </div>

          ${
            addresses.length
              ? `<div class="address-grid" style="margin-bottom: 1.5rem;">
                  ${addresses
                    .map(
                      (addr) => `
                    <article class="address-card">
                      <div class="address-card__head">
                        <strong>${escapeHtml(addr.label)}</strong>
                        ${addr.isDefault ? '<span class="demo-badge">Default</span>' : ''}
                      </div>
                      <p class="review-box__body">
                        ${escapeHtml(addr.fullName)}<br/>
                        ${escapeHtml(addr.line1)}${addr.line2 ? `, ${escapeHtml(addr.line2)}` : ''}<br/>
                        ${escapeHtml(addr.city)}, ${escapeHtml(addr.region)} ${escapeHtml(addr.postalCode)}<br/>
                        ${escapeHtml(addr.country)}
                      </p>
                      <div class="address-card__actions">
                        ${
                          !addr.isDefault
                            ? `<button type="button" class="review-box__edit" data-addr-default="${escapeHtml(addr.id)}">Set Default</button>`
                            : ''
                        }
                        <button type="button" class="cart-item__remove" data-addr-delete="${escapeHtml(addr.id)}">Delete</button>
                      </div>
                    </article>
                  `
                    )
                    .join('')}
                </div>`
              : '<p class="section-subtitle" style="margin-bottom: 1.25rem;">No saved addresses yet. Add one below or enter an address as a guest at checkout.</p>'
          }

          <div class="account-subcard">
            <h3 class="account-subcard__title">Add Address</h3>
            <form class="checkout-form-grid" id="address-add-form" style="margin-top: 0.9rem;" novalidate>
              <div class="form-field">
                <label for="addr-label">Label (e.g. Home)</label>
                <input type="text" id="addr-label" placeholder="Home" />
              </div>
              <div class="form-field">
                <label for="addr-full-name">Full Name *</label>
                <input type="text" id="addr-full-name" required />
              </div>
              <div class="form-field form-field--full">
                <label for="addr-line1">Street Address *</label>
                <input type="text" id="addr-line1" required />
              </div>
              <div class="form-field">
                <label for="addr-city">City *</label>
                <input type="text" id="addr-city" required />
              </div>
              <div class="form-field">
                <label for="addr-region">State / Province *</label>
                <input type="text" id="addr-region" required />
              </div>
              <div class="form-field">
                <label for="addr-postal">Postal Code *</label>
                <input type="text" id="addr-postal" required />
              </div>
              <div class="form-field">
                <label for="addr-country">Country</label>
                <select id="addr-country">
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div class="form-field form-field--full">
                <button type="submit" class="btn btn--primary" style="width: fit-content;">Save Address</button>
              </div>
            </form>
            <p class="account-error-msg" id="address-error" role="alert"></p>
          </div>
        </div>
      `;
    }

    function renderFavoritesView() {
      const favIds = Luvra.store.getState().favorites;
      const favProducts = favIds.map((id) => Luvra.store.getProductById(id)).filter(Boolean);

      if (!favProducts.length) {
        return `
          <div class="account-card">
            <h2 class="account-subcard__title" style="font-size: 1.65rem;">Saved Favorites</h2>
            <p class="section-subtitle" style="margin-bottom: 1.25rem;">
              Tap the heart icon on any product card to save pieces privately in this browser—no account required.
            </p>
            <a href="shop.html" class="btn btn--primary">Browse Shop →</a>
          </div>
        `;
      }

      return `
        <div class="account-card">
          <div class="checkout-panel__head">
            <h2 class="account-subcard__title" style="font-size: 1.65rem;">Saved Favorites (${favProducts.length})</h2>
            <a href="shop.html" class="text-link">Explore More →</a>
          </div>
          <div class="shop-grid">
            ${favProducts.map((p) => Luvra.renderProductCard(p, { variant: 'shop' })).join('')}
          </div>
        </div>
      `;
    }

    function render() {
      const titles = {
        account: { kicker: 'Luvra Membership', title: 'Your <em>Account</em>', lead: 'Optional member tools alongside seamless guest checkout.' },
        'reset-password': { kicker: 'Account Recovery', title: 'Reset <em>Password</em>', lead: 'Update your local preview account password.' },
        orders: { kicker: 'Purchase Archive', title: 'Order <em>History</em>', lead: 'Review orders completed in this browser.' },
        addresses: { kicker: 'Delivery Book', title: 'Saved <em>Addresses</em>', lead: 'Keep discreet shipping destinations ready.' },
        favorites: { kicker: 'Private Shortlist', title: 'Saved <em>Favorites</em>', lead: 'Pieces you have bookmarked while browsing.' },
      };
      const meta = titles[pageMode] || titles.account;

      let contentHtml = '';
      if (pageMode === 'reset-password') contentHtml = renderResetView();
      else if (pageMode === 'orders') contentHtml = renderOrdersView();
      else if (pageMode === 'addresses') contentHtml = renderAddressesView();
      else if (pageMode === 'favorites') contentHtml = renderFavoritesView();
      else contentHtml = renderAccountSignInView();

      rootEl.innerHTML = `
        <div class="subpage-header">
          <span class="kicker">${meta.kicker}</span>
          <h1 class="subpage-title">${meta.title}</h1>
          <p class="subpage-lead">${meta.lead}</p>
        </div>
        <div class="account-layout">
          ${renderAccountNav(pageMode)}
          <div>${contentHtml}</div>
        </div>
      `;

      bindEvents();
    }

    function bindEvents() {
      const signInForm = document.getElementById('signin-form');
      if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const res = Luvra.store.signInDemo({
            email: document.getElementById('signin-email').value,
            password: document.getElementById('signin-password').value,
          });
          if (!res.ok) {
            document.getElementById('signin-error').textContent = res.error;
          }
        });
      }

      const regForm = document.getElementById('register-form');
      if (regForm) {
        regForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const res = Luvra.store.registerDemoAccount({
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
          });
          if (!res.ok) {
            document.getElementById('register-error').textContent = res.error;
          }
        });
      }

      const signOutBtn = document.getElementById('account-signout-btn');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', () => Luvra.store.signOutDemo());
      }

      const resetForm = document.getElementById('reset-password-form');
      if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const errEl = document.getElementById('reset-error');
          const statusEl = document.getElementById('reset-status');
          errEl.textContent = '';
          statusEl.textContent = '';
          const res = Luvra.store.resetDemoPassword({
            email: document.getElementById('reset-email').value,
            newPassword: document.getElementById('reset-new-password').value,
          });
          if (!res.ok) errEl.textContent = res.error;
          else statusEl.textContent = res.message;
        });
      }

      const addrForm = document.getElementById('address-add-form');
      if (addrForm) {
        addrForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const fullName = document.getElementById('addr-full-name').value.trim();
          const line1 = document.getElementById('addr-line1').value.trim();
          const city = document.getElementById('addr-city').value.trim();
          const region = document.getElementById('addr-region').value.trim();
          const postalCode = document.getElementById('addr-postal').value.trim();
          if (!fullName || !line1 || !city || !region || !postalCode) {
            document.getElementById('address-error').textContent =
              'Please complete all required address fields.';
            return;
          }
          Luvra.store.saveAddress({
            label: document.getElementById('addr-label').value || 'Home',
            fullName,
            line1,
            city,
            region,
            postalCode,
            country: document.getElementById('addr-country').value,
          });
        });
      }

      rootEl.querySelectorAll('[data-addr-default]').forEach((btn) => {
        btn.addEventListener('click', () =>
          Luvra.store.setDefaultAddress(btn.getAttribute('data-addr-default'))
        );
      });

      rootEl.querySelectorAll('[data-addr-delete]').forEach((btn) => {
        btn.addEventListener('click', () =>
          Luvra.store.deleteAddress(btn.getAttribute('data-addr-delete'))
        );
      });
    }

    Luvra.store.subscribe(render);
    render();
  };
})(window);
