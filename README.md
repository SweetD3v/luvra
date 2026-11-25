# Luvra — Sculpted Intimate Wellness Storefront

A dark-editorial static storefront for **Luvra**, featuring near-black and charcoal surfaces, warm ivory typography, champagne-gold accents, and muted burgundy controls.

## Features
- **Storefront & Discovery**: [index.html](index.html), [shop.html](shop.html), [collection.html](collection.html), [search.html](search.html), [product.html](product.html), and an optional 4-step [quiz.html](quiz.html).
- **Slide-Out Bag & Cart Page**: Persistent `localStorage` cart across navigation and refreshes with variant tracking, quantity steppers, promo codes (`LUVRA10`, `WELCOME15`), shipping estimates, tax estimates, and unavailable-item handling ([cart.html](cart.html)).
- **5-Step Checkout (Demo Mode)**: `Contact → Delivery → Payment → Review → Confirmation` supporting guest checkout, optional account creation, shipping/billing addresses, and a Stripe-compatible tokenized payment adapter ([checkout.html](checkout.html)).
- **Age Gate & Policies**: Configurable 18+ age confirmation gate, optional browser-local member pages ([account.html](account.html), [orders.html](orders.html), [addresses.html](addresses.html), [favorites.html](favorites.html), [reset-password.html](reset-password.html)), and policy/help pages ([privacy.html](privacy.html), [terms.html](terms.html), [shipping.html](shipping.html), [returns.html](returns.html), [help.html](help.html)).

> **Demo Mode Notice:** Live payment processor credentials and backend auth/email APIs are not configured in this static build. Checkout payment authorization and account pages run in browser-local Demo Mode and do not process real charges.

## Local Preview
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## CI/CD
GitHub Actions ([.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)) runs HTML, CSS contrast, accessibility, and JavaScript module checks (`tests/verify.py` and `tests/verify.mjs`) on every push and pull request, and deploys `main` to GitHub Pages on passing builds.
