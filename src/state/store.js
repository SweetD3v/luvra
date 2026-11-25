(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});
  const CART_KEY = 'luvra_bag_v1';
  const PROMO_KEY = 'luvra_promo_v1';
  const SHIPPING_KEY = 'luvra_shipping_v1';
  const FAVORITES_KEY = 'luvra_favorites_v1';
  const RECENTLY_VIEWED_KEY = 'luvra_recently_viewed_v1';
  const CHECKOUT_DRAFT_KEY = 'luvra_checkout_draft_v1';
  const LAST_ORDER_KEY = 'luvra_last_order_v1';
  const ORDERS_KEY = 'luvra_orders_v1';
  const AGE_VERIFIED_KEY = 'luvra_age_verified_v1';
  const ACCOUNT_SESSION_KEY = 'luvra_account_session_v1';
  const ACCOUNT_USERS_KEY = 'luvra_account_users_v1';
  const ADDRESSES_KEY = 'luvra_addresses_v1';

  function demoDigest(str) {
    let h = 5381;
    const s = String(str || '');
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return `d_${(h >>> 0).toString(16)}`;
  }

  function loadJsonObject(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : fallback;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function loadJson(key, fallback) {
    try {
      const raw = global.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : fallback;
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function loadString(key, fallback) {
    try {
      const val = global.localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch {
      return fallback;
    }
  }

  function saveValue(key, value) {
    try {
      if (value === null || value === undefined || value === '') {
        global.localStorage.removeItem(key);
      } else if (typeof value === 'string') {
        global.localStorage.setItem(key, value);
      } else {
        global.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Ignore storage errors in restricted browsing modes
    }
  }

  function round2(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  const state = {
    cart: loadJson(CART_KEY, []),
    promoCode: loadString(PROMO_KEY, ''),
    shippingMethod: loadString(SHIPPING_KEY, 'standard'),
    favorites: loadJson(FAVORITES_KEY, []),
    recentlyViewed: loadJson(RECENTLY_VIEWED_KEY, []),
    selectedVariants: {},
    activeCategory: 'all',
    showAllCollection: false,
    featuredOffset: 0,
  };

  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn(state));
  }

  function makeCartKey(productId, variantLabel) {
    return variantLabel ? `${productId}::${variantLabel}` : productId;
  }

  function getCommerceConfig() {
    return (
      (Luvra.CATALOG && Luvra.CATALOG.commerce) || {
        freeShippingThreshold: 75,
        standardShippingRate: 12,
        expressShippingRate: 24,
        estimatedTaxRate: 0.08,
        promoCodes: [],
      }
    );
  }

  Luvra.formatMoney = function formatMoney(amount) {
    const val = round2(Number(amount) || 0);
    return `$${val.toFixed(2)}`;
  };

  Luvra.store = {
    getState() {
      return state;
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    getProductById(id) {
      return Luvra.CATALOG.products.find((item) => item.id === id) || null;
    },

    getSelectedVariant(productId) {
      if (state.selectedVariants[productId]) {
        return state.selectedVariants[productId];
      }
      const product = this.getProductById(productId);
      if (product && Array.isArray(product.variants) && product.variants.length) {
        return product.variants[0].label;
      }
      return '';
    },

    setSelectedVariant(productId, variantLabel) {
      state.selectedVariants[productId] = variantLabel;
      notify();
    },

    isFavorite(productId) {
      return state.favorites.includes(productId);
    },

    toggleFavorite(productId) {
      if (state.favorites.includes(productId)) {
        state.favorites = state.favorites.filter((id) => id !== productId);
      } else {
        state.favorites = [...state.favorites, productId];
      }
      saveValue(FAVORITES_KEY, state.favorites);
      notify();
      return state.favorites.includes(productId);
    },

    recordRecentlyViewed(productId) {
      if (!this.getProductById(productId)) return;
      state.recentlyViewed = [
        productId,
        ...state.recentlyViewed.filter((id) => id !== productId),
      ].slice(0, 8);
      saveValue(RECENTLY_VIEWED_KEY, state.recentlyViewed);
    },

    getRecentlyViewed(excludeId, limit = 4) {
      return state.recentlyViewed
        .filter((id) => id !== excludeId)
        .map((id) => this.getProductById(id))
        .filter(Boolean)
        .slice(0, limit);
    },

    addToCart(productId, explicitVariant, quantity = 1) {
      const product = this.getProductById(productId);
      const qty = Number(quantity);
      if (!product || product.availability === 'waitlist' || !Number.isFinite(qty) || qty < 1) {
        return false;
      }

      const variant = explicitVariant || this.getSelectedVariant(productId) || '';
      const key = makeCartKey(productId, variant);
      const existing = state.cart.find(
        (item) => makeCartKey(item.id, item.variant || '') === key
      );

      if (existing) {
        existing.qty = Math.min(20, existing.qty + qty);
      } else {
        state.cart.push({ id: productId, variant, qty: Math.min(20, qty) });
      }
      saveValue(CART_KEY, state.cart);
      notify();
      return true;
    },

    updateQty(cartKey, delta) {
      const idx = state.cart.findIndex(
        (item) => makeCartKey(item.id, item.variant || '') === cartKey
      );
      if (idx === -1) return;
      const entry = state.cart[idx];
      const product = this.getProductById(entry.id);
      if (delta > 0 && (!product || product.availability === 'waitlist')) {
        return;
      }

      entry.qty += delta;
      if (entry.qty <= 0) {
        state.cart.splice(idx, 1);
      } else if (entry.qty > 20) {
        entry.qty = 20;
      }
      saveValue(CART_KEY, state.cart);
      notify();
    },

    removeFromCart(cartKey) {
      state.cart = state.cart.filter(
        (item) => makeCartKey(item.id, item.variant || '') !== cartKey
      );
      saveValue(CART_KEY, state.cart);
      notify();
    },

    clearUnavailableItems() {
      state.cart = state.cart.filter((item) => {
        const product = this.getProductById(item.id);
        return Boolean(product && product.availability !== 'waitlist');
      });
      saveValue(CART_KEY, state.cart);
      notify();
    },

    setShippingMethod(method) {
      state.shippingMethod = method === 'express' ? 'express' : 'standard';
      saveValue(SHIPPING_KEY, state.shippingMethod);
      notify();
    },

    applyPromoCode(rawCode) {
      const code = String(rawCode || '').trim().toUpperCase();
      if (!code) {
        return { ok: false, error: 'Please enter a promo code.' };
      }

      const { promoCodes } = getCommerceConfig();
      const promo = promoCodes.find((p) => p.code === code);
      if (!promo) {
        return {
          ok: false,
          error: `Promo code "${code}" is not recognized.`,
        };
      }

      const { subtotal } = this.getCartSummary();
      if (subtotal === 0) {
        return {
          ok: false,
          error: 'Add an available item to your bag before applying a promo code.',
        };
      }

      if (subtotal < promo.minSubtotal) {
        return {
          ok: false,
          error: `${promo.code} requires an eligible subtotal of at least ${Luvra.formatMoney(promo.minSubtotal)}.`,
        };
      }

      state.promoCode = promo.code;
      saveValue(PROMO_KEY, state.promoCode);
      notify();
      return { ok: true, promo };
    },

    removePromoCode() {
      state.promoCode = '';
      saveValue(PROMO_KEY, '');
      notify();
    },

    getCartLineItems() {
      return state.cart.map((entry) => {
        const product = this.getProductById(entry.id);
        const available = Boolean(product && product.availability !== 'waitlist');
        const unitPrice = product ? product.price : 0;
        return {
          key: makeCartKey(entry.id, entry.variant || ''),
          id: entry.id,
          variant: entry.variant || '',
          qty: entry.qty,
          product,
          available,
          unitPrice,
          lineTotal: available ? round2(unitPrice * entry.qty) : 0,
        };
      });
    },

    getCartSummary() {
      const commerce = getCommerceConfig();
      const items = this.getCartLineItems();
      const availableItems = items.filter((item) => item.available);
      const unavailableItems = items.filter((item) => !item.available);

      const subtotal = round2(
        availableItems.reduce((sum, item) => sum + item.lineTotal, 0)
      );
      const itemCount = availableItems.reduce((sum, item) => sum + item.qty, 0);

      let appliedPromo = null;
      let discount = 0;
      let promoNotice = '';

      if (state.promoCode) {
        const candidate = commerce.promoCodes.find((p) => p.code === state.promoCode);
        if (candidate && subtotal > 0 && subtotal >= candidate.minSubtotal) {
          appliedPromo = candidate;
          discount =
            candidate.type === 'percent'
              ? round2(subtotal * (candidate.value / 100))
              : Math.min(subtotal, candidate.value);
        } else if (candidate && subtotal > 0 && subtotal < candidate.minSubtotal) {
          promoNotice = `${candidate.code} requires ${Luvra.formatMoney(candidate.minSubtotal)} subtotal and is currently paused.`;
        }
      }

      const discountedSubtotal = round2(Math.max(0, subtotal - discount));
      const shippingMethod = state.shippingMethod === 'express' ? 'express' : 'standard';

      let shippingEstimate = 0;
      if (discountedSubtotal > 0) {
        if (shippingMethod === 'express') {
          shippingEstimate = commerce.expressShippingRate;
        } else {
          shippingEstimate =
            discountedSubtotal >= commerce.freeShippingThreshold
              ? 0
              : commerce.standardShippingRate;
        }
      }

      const amountToFreeShipping = round2(
        Math.max(0, commerce.freeShippingThreshold - discountedSubtotal)
      );
      const taxEstimate = round2(discountedSubtotal * commerce.estimatedTaxRate);
      const total = round2(discountedSubtotal + shippingEstimate + taxEstimate);

      return {
        items,
        availableItems,
        unavailableItems,
        itemCount,
        totalCount: items.reduce((sum, item) => sum + item.qty, 0),
        subtotal,
        appliedPromo,
        promoNotice,
        discount,
        discountedSubtotal,
        shippingMethod,
        shippingEstimate,
        freeShippingThreshold: commerce.freeShippingThreshold,
        amountToFreeShipping,
        taxEstimate,
        total,
      };
    },

    getCartKey: makeCartKey,

    getCartCount() {
      return state.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    getCartSubtotal() {
      return this.getCartSummary().subtotal;
    },

    setCategory(category) {
      state.activeCategory = category;
      if (category !== 'all') {
        state.showAllCollection = true;
      }
      notify();
    },

    toggleShowAllCollection() {
      state.showAllCollection = !state.showAllCollection;
      notify();
    },

    shiftFeatured(direction) {
      const total = Luvra.CATALOG.featuredEdit.length;
      state.featuredOffset = (state.featuredOffset + direction + total) % total;
      notify();
    },

    getCheckoutDraft() {
      return loadJsonObject(CHECKOUT_DRAFT_KEY, {
        step: 0,
        contact: {
          email: '',
          createAccount: false,
        },
        shippingAddress: {
          fullName: '',
          line1: '',
          line2: '',
          city: '',
          region: '',
          postalCode: '',
          country: 'United States',
        },
        billingSameAsShipping: true,
        billingAddress: {
          fullName: '',
          line1: '',
          line2: '',
          city: '',
          region: '',
          postalCode: '',
          country: 'United States',
        },
        paymentToken: null,
      });
    },

    saveCheckoutDraft(draft) {
      // Never persist passwords, raw card numbers, or security codes
      const sanitized = {
        step: Number(draft.step) || 0,
        contact: {
          email: String((draft.contact && draft.contact.email) || ''),
          createAccount: Boolean(draft.contact && draft.contact.createAccount),
        },
        shippingAddress: { ...(draft.shippingAddress || {}) },
        billingSameAsShipping: draft.billingSameAsShipping !== false,
        billingAddress: { ...(draft.billingAddress || {}) },
        paymentToken: draft.paymentToken
          ? {
              provider: draft.paymentToken.provider,
              tokenId: draft.paymentToken.tokenId,
              label: draft.paymentToken.label,
              mode: draft.paymentToken.mode,
            }
          : null,
      };
      saveValue(CHECKOUT_DRAFT_KEY, sanitized);
      return sanitized;
    },

    clearCheckoutDraft() {
      saveValue(CHECKOUT_DRAFT_KEY, '');
    },

    createConfirmedOrder({ draft, summary, paymentResult }) {
      // Enforce rule: create an order only after confirmed payment
      if (!paymentResult || paymentResult.status !== 'succeeded') {
        return null;
      }
      if (!summary || !Array.isArray(summary.availableItems) || summary.availableItems.length === 0) {
        return null;
      }

      const orderId = `LUV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const billingAddress = draft.billingSameAsShipping
        ? { ...draft.shippingAddress }
        : { ...draft.billingAddress };

      const order = {
        orderId,
        createdAt: new Date().toISOString(),
        isDemo: Boolean(paymentResult.isDemo),
        paymentStatus: paymentResult.status,
        paymentReference: paymentResult.paymentIntentId,
        paymentLabel: paymentResult.paymentLabel,
        guestCheckout: !(draft.contact && draft.contact.createAccount),
        contactEmail: draft.contact ? draft.contact.email : '',
        shippingAddress: { ...draft.shippingAddress },
        billingAddress,
        shippingMethod: summary.shippingMethod,
        items: summary.availableItems.map((item) => ({
          id: item.id,
          name: item.product ? item.product.name : item.id,
          variant: item.variant,
          qty: item.qty,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: summary.subtotal,
        appliedPromo: summary.appliedPromo ? summary.appliedPromo.code : null,
        discount: summary.discount,
        shippingEstimate: summary.shippingEstimate,
        taxEstimate: summary.taxEstimate,
        total: summary.total,
      };

      saveValue(LAST_ORDER_KEY, order);
      const existingOrders = loadJson(ORDERS_KEY, []);
      saveValue(ORDERS_KEY, [order, ...existingOrders].slice(0, 20));

      // Keep only unavailable items if any were excluded; remove purchased items & promo
      state.cart = state.cart.filter((entry) => {
        const product = this.getProductById(entry.id);
        return !product || product.availability === 'waitlist';
      });
      state.promoCode = '';
      saveValue(CART_KEY, state.cart);
      saveValue(PROMO_KEY, '');
      saveValue(CHECKOUT_DRAFT_KEY, '');
      notify();

      return order;
    },

    getLastConfirmedOrder() {
      return loadJsonObject(LAST_ORDER_KEY, null);
    },

    getOrderHistory() {
      const orders = loadJson(ORDERS_KEY, []);
      const session = this.getCurrentAccount();
      if (!session) return orders;
      const matching = orders.filter(
        (o) => String(o.contactEmail || '').toLowerCase() === session.email.toLowerCase()
      );
      return matching.length ? matching : orders;
    },

    /* Configurable Age Confirmation */
    isAgeConfirmed() {
      const cfg =
        (Luvra.CATALOG && Luvra.CATALOG.siteConfig && Luvra.CATALOG.siteConfig.ageGate) || {
          enabled: true,
          rememberDays: 30,
        };
      if (!cfg.enabled) return true;
      const record = loadJsonObject(AGE_VERIFIED_KEY, null);
      if (!record || !record.confirmed || !record.timestamp) return false;
      const maxAgeMs = (Number(cfg.rememberDays) || 30) * 24 * 60 * 60 * 1000;
      return Date.now() - Number(record.timestamp) < maxAgeMs;
    },

    confirmAge() {
      saveValue(AGE_VERIFIED_KEY, { confirmed: true, timestamp: Date.now() });
      notify();
    },

    /* Optional Demo Account & Saved Addresses (guests never blocked) */
    getCurrentAccount() {
      return loadJsonObject(ACCOUNT_SESSION_KEY, null);
    },

    registerDemoAccount({ email, password, name }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }
      if (String(password || '').trim().length < 8) {
        return { ok: false, error: 'Password must be at least 8 characters.' };
      }
      const users = loadJson(ACCOUNT_USERS_KEY, []);
      if (users.some((u) => u.email === cleanEmail)) {
        return { ok: false, error: 'An account for this email already exists in this browser.' };
      }
      const user = {
        email: cleanEmail,
        name: String(name || '').trim() || cleanEmail.split('@')[0],
        digest: demoDigest(password),
        createdAt: new Date().toISOString(),
      };
      saveValue(ACCOUNT_USERS_KEY, [...users, user]);
      const session = { email: user.email, name: user.name, signedInAt: new Date().toISOString() };
      saveValue(ACCOUNT_SESSION_KEY, session);
      notify();
      return { ok: true, account: session };
    },

    signInDemo({ email, password }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }
      if (!String(password || '').trim()) {
        return { ok: false, error: 'Please enter your password.' };
      }
      const users = loadJson(ACCOUNT_USERS_KEY, []);
      const existing = users.find((u) => u.email === cleanEmail);
      if (!existing) {
        return {
          ok: false,
          error: 'No local demo account found for that email. Create one below or continue as a guest.',
        };
      }
      if (existing.digest !== demoDigest(password)) {
        return { ok: false, error: 'Incorrect password for this demo account.' };
      }
      const session = { email: existing.email, name: existing.name, signedInAt: new Date().toISOString() };
      saveValue(ACCOUNT_SESSION_KEY, session);
      notify();
      return { ok: true, account: session };
    },

    resetDemoPassword({ email, newPassword }) {
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { ok: false, error: 'Please enter a valid email address.' };
      }
      const users = loadJson(ACCOUNT_USERS_KEY, []);
      const idx = users.findIndex((u) => u.email === cleanEmail);
      if (newPassword !== undefined) {
        if (String(newPassword || '').trim().length < 8) {
          return { ok: false, error: 'New password must be at least 8 characters.' };
        }
        if (idx !== -1) {
          users[idx].digest = demoDigest(newPassword);
          saveValue(ACCOUNT_USERS_KEY, users);
        }
      }
      return {
        ok: true,
        foundLocalAccount: idx !== -1,
        message:
          idx !== -1
            ? `Demo password updated for ${cleanEmail}. You can now sign in.`
            : `If an account exists for ${cleanEmail}, password reset instructions would be sent (demo mode).`,
      };
    },

    signOutDemo() {
      saveValue(ACCOUNT_SESSION_KEY, '');
      notify();
    },

    getSavedAddresses() {
      return loadJson(ADDRESSES_KEY, []);
    },

    saveAddress(addr) {
      const list = loadJson(ADDRESSES_KEY, []);
      const id = addr.id || `addr_${Date.now().toString(36)}`;
      const isDefault = Boolean(addr.isDefault) || list.length === 0;
      const entry = {
        id,
        label: String(addr.label || 'Home').trim(),
        fullName: String(addr.fullName || '').trim(),
        line1: String(addr.line1 || '').trim(),
        line2: String(addr.line2 || '').trim(),
        city: String(addr.city || '').trim(),
        region: String(addr.region || '').trim(),
        postalCode: String(addr.postalCode || '').trim(),
        country: String(addr.country || 'United States').trim(),
        isDefault,
      };
      let next = list.filter((a) => a.id !== id);
      if (isDefault) {
        next = next.map((a) => ({ ...a, isDefault: false }));
      }
      next.unshift(entry);
      saveValue(ADDRESSES_KEY, next);
      notify();
      return entry;
    },

    setDefaultAddress(id) {
      const next = loadJson(ADDRESSES_KEY, []).map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      saveValue(ADDRESSES_KEY, next);
      notify();
    },

    deleteAddress(id) {
      const next = loadJson(ADDRESSES_KEY, []).filter((a) => a.id !== id);
      if (next.length && !next.some((a) => a.isDefault)) {
        next[0].isDefault = true;
      }
      saveValue(ADDRESSES_KEY, next);
      notify();
    },
  };
})(window);
