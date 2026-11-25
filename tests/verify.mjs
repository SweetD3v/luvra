import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const storage = {};
function makeMockEl() {
  return {
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    style: {},
    hidden: false,
    disabled: false,
    dataset: {},
    classList: { add() {}, remove() {}, toggle() { return false; }, contains() { return false; } },
    setAttribute() {},
    getAttribute() { return ''; },
    removeAttribute() {},
    hasAttribute() { return false; },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    contains() { return false; },
    appendChild() {},
    focus() {},
  };
}

const elements = {};
const sandbox = {
  console,
  Date,
  Math,
  Number,
  String,
  Boolean,
  Array,
  Object,
  JSON,
  Set,
  encodeURIComponent,
  decodeURIComponent,
  setTimeout: () => {},
  URLSearchParams,
  localStorage: {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
  },
  location: { pathname: '/shop.html', search: '' },
  history: { replaceState: () => {} },
  matchMedia: () => ({ matches: false }),
  requestAnimationFrame: () => {},
  document: {
    title: '',
    body: { style: {}, dataset: { page: 'shop' }, appendChild() {} },
    addEventListener() {},
    createElement: () => makeMockEl(),
    getElementById: (id) => (elements[id] = elements[id] || makeMockEl()),
    querySelector: () => makeMockEl(),
    querySelectorAll: () => [],
  },
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);
for (const relPath of [
  'src/data/catalog.js',
  'src/state/store.js',
  'src/services/paymentAdapter.js',
  'src/components/productCard.js',
  'src/components/productQuiz.js',
]) {
  const code = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
  vm.runInContext(code, context, { filename: relPath });
}

const { Luvra } = context;

// 1. Catalog & images exist
assert.equal(Luvra.CATALOG.products.length, 10);
for (const p of Luvra.CATALOG.products) {
  assert.ok(fs.existsSync(path.join(rootDir, p.image)), `Missing image: ${p.image}`);
}

// 2. Cart math, promo codes & unavailable exclusion
Luvra.store.addToCart('crimson-silk-elixir', '100 ml', 1);
let summary = Luvra.store.getCartSummary();
assert.equal(summary.subtotal, 64);
assert.equal(summary.shippingEstimate, 12);
assert.equal(summary.taxEstimate, 5.12);
assert.equal(summary.total, 81.12);

assert.equal(Luvra.store.applyPromoCode('INVALID').ok, false);
assert.equal(Luvra.store.applyPromoCode('WELCOME15').ok, false);
assert.equal(Luvra.store.applyPromoCode('LUVRA10').ok, true);
assert.equal(Luvra.store.addToCart('solstice-mist'), false);

// 3. Payment adapter Demo Mode & order creation rule
assert.equal(Luvra.paymentProvider.isDemoMode(), true);
const token = Luvra.paymentProvider.createPaymentToken('tok_demo_card_4242');
for (const badOutcome of ['failed', 'cancelled', 'pending']) {
  const res = Luvra.paymentProvider.confirmPayment({
    token,
    amount: Luvra.store.getCartSummary().total,
    simulatedOutcome: badOutcome,
  });
  assert.equal(
    Luvra.store.createConfirmedOrder({
      draft: Luvra.store.getCheckoutDraft(),
      summary: Luvra.store.getCartSummary(),
      paymentResult: res,
    }),
    null,
  );
}

const okPay = Luvra.paymentProvider.confirmPayment({
  token,
  amount: Luvra.store.getCartSummary().total,
  simulatedOutcome: 'succeeded',
});
const draft = Luvra.store.getCheckoutDraft();
draft.contact.email = 'guest@example.com';
draft.shippingAddress = {
  fullName: 'Guest User',
  line1: '418 Crosby St',
  city: 'New York',
  region: 'NY',
  postalCode: '10012',
  country: 'United States',
};
const order = Luvra.store.createConfirmedOrder({
  draft,
  summary: Luvra.store.getCartSummary(),
  paymentResult: okPay,
});
assert.ok(order && order.isDemo);
assert.equal(Luvra.store.getCartCount(), 0);

// 4. Quiz scoring
const quizMatches = Luvra.scoreQuizMatches(
  { category: 'couples', material: 'Brushed Alloy', features: ['Dual Motor'], price: 'over-150' },
  3,
);
assert.equal(quizMatches[0].product.id, 'aurelia-duo');

console.log('verify.mjs passed all assertions.');
