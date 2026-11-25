(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  function escapeHtml(str) {
    return Luvra.escapeHtml ? Luvra.escapeHtml(str) : String(str);
  }

  function formatMoney(amount) {
    return Luvra.formatMoney ? Luvra.formatMoney(amount) : `$${Number(amount || 0).toFixed(2)}`;
  }

  const POLICY_LINKS = [
    { mode: 'privacy', href: 'privacy.html', label: 'Privacy Policy' },
    { mode: 'terms', href: 'terms.html', label: 'Terms & Conditions' },
    { mode: 'shipping', href: 'shipping.html', label: 'Discreet Shipping' },
    { mode: 'returns', href: 'returns.html', label: 'Returns & Exchanges' },
    { mode: 'help', href: 'help.html', label: 'Help Center' },
  ];

  Luvra.initPolicyPage = function initPolicyPage(pageMode) {
    const rootEl = document.getElementById('policy-page-root');
    if (!rootEl) return;

    const commerce = Luvra.CATALOG.commerce;
    const priv = Luvra.CATALOG.siteConfig.privacyDefaults;

    const pages = {
      privacy: {
        kicker: 'Legal & Discretion',
        title: 'Privacy <em>Policy</em>',
        lead: 'Factual overview of what information is used on this site and how discreet billing and storage work.',
        body: `
          <div class="policy-section">
            <h2>Information Collected for Orders</h2>
            <p>When checking out, Luvra collects only the information needed to prepare and fulfill your order: your email address, shipping address, billing address, and delivery preference. Account creation is optional—guest checkout is available on every order.</p>
          </div>
          <div class="policy-section">
            <h2>Payment &amp; Card Security</h2>
            <p>Card numbers and security codes are intended to be processed exclusively through a hosted or tokenized payment provider (such as Stripe). Raw card numbers and CVV codes are never stored in browser storage or application logs.</p>
          </div>
          <div class="policy-section">
            <h2>Billing Descriptor</h2>
            <p>Configurable billing descriptor standard: ${escapeHtml(priv.billingDescriptor)}</p>
          </div>
          <div class="policy-section">
            <h2>Browser Storage</h2>
            <p>This storefront stores your shopping bag, saved favorites, age-confirmation preference, and optional preview account settings locally in your browser via <code>localStorage</code> so your selections persist across refreshes.</p>
          </div>
        `,
      },
      terms: {
        kicker: 'Storefront Terms',
        title: 'Terms &amp; <em>Conditions</em>',
        lead: 'Guidelines governing use of the Luvra storefront and product orders.',
        body: `
          <div class="policy-section">
            <h2>Adult Eligibility</h2>
            <p>Luvra products are intended exclusively for adults aged ${Luvra.CATALOG.siteConfig.ageGate.minimumAge} and older. By confirming your age and continuing onto product pages, you attest that you meet this requirement in your jurisdiction.</p>
          </div>
          <div class="policy-section">
            <h2>Demo Checkout Notice</h2>
            <p>When live payment processor credentials are not configured, checkout runs in Demo Mode. Demo Mode orders do not process real charges or initiate physical fulfillment.</p>
          </div>
          <div class="policy-section">
            <h2>Pricing &amp; Availability</h2>
            <p>All listed prices are in USD before applicable tax and shipping estimates. Items marked as Waitlist cannot be added to an active order until restocked.</p>
          </div>
        `,
      },
      shipping: {
        kicker: 'Fulfillment',
        title: 'Discreet <em>Shipping</em>',
        lead: 'Clear shipping rates, delivery windows, and configurable unmarked packaging details.',
        body: `
          <div class="policy-section">
            <h2>Packaging Exterior</h2>
            <p>${escapeHtml(priv.packageExterior)}</p>
            <div class="policy-callout">
              Note: Packaging and sender-label wording remain configurable per regional fulfillment carrier requirements.
            </div>
          </div>
          <div class="policy-section">
            <h2>Shipping Options &amp; Rates</h2>
            <ul>
              <li><strong>Standard Discreet (3–5 business days):</strong> Complimentary on eligible orders of ${formatMoney(commerce.freeShippingThreshold)} or more; ${formatMoney(commerce.standardShippingRate)} under ${formatMoney(commerce.freeShippingThreshold)}.</li>
              <li><strong>Express Discreet (1–2 business days):</strong> Flat ${formatMoney(commerce.expressShippingRate)} priority handling.</li>
            </ul>
          </div>
          <div class="policy-section">
            <h2>Discreet Billing</h2>
            <p>${escapeHtml(priv.billingDescriptor)}</p>
          </div>
        `,
      },
      returns: {
        kicker: 'Aftercare & Policy',
        title: 'Returns &amp; <em>Exchanges</em>',
        lead: 'Straightforward return eligibility and studio warranty support.',
        body: `
          <div class="policy-section">
            <h2>${priv.returnWindowDays}-Day Unopened Returns</h2>
            <p>For hygiene and quality reasons, unopened items in their original sealed packaging may be returned within ${priv.returnWindowDays} days of delivery.</p>
          </div>
          <div class="policy-section">
            <h2>Hardware Warranty Support</h2>
            <p>Rechargeable Luvra hardware carries a 2-year Luvra Studio limited warranty covering manufacturing defects under normal personal use. Botanical oils and mists carry a 30-day transit-damage replacement guarantee.</p>
          </div>
          <div class="policy-section">
            <h2>Starting a Return</h2>
            <p>Email <a href="mailto:${escapeHtml(priv.supportEmail)}" style="color: var(--gold);">${escapeHtml(priv.supportEmail)}</a> with your order reference number for discreet return instructions.</p>
          </div>
        `,
      },
      help: {
        kicker: 'Concierge & FAQ',
        title: 'Help <em>Center</em>',
        lead: 'Answers on discreet delivery, billing privacy, guest checkout, and product care.',
        body: `
          <div class="policy-section">
            <h2>Frequently Asked Questions</h2>
            <div class="pdp-accordions" style="margin-top: 0.75rem;">
              <details class="pdp-accordion" open>
                <summary><span>How do packages look on arrival?</span><span class="pdp-accordion__icon">+</span></summary>
                <div class="pdp-accordion__body"><p>${escapeHtml(priv.packageExterior)}</p></div>
              </details>
              <details class="pdp-accordion">
                <summary><span>How will a charge appear on my statement?</span><span class="pdp-accordion__icon">+</span></summary>
                <div class="pdp-accordion__body"><p>${escapeHtml(priv.billingDescriptor)}</p></div>
              </details>
              <details class="pdp-accordion">
                <summary><span>Do I need an account to place an order?</span><span class="pdp-accordion__icon">+</span></summary>
                <div class="pdp-accordion__body"><p>No. Guest checkout is available on every order, and saving favorites or managing your bag works without creating an account.</p></div>
              </details>
              <details class="pdp-accordion">
                <summary><span>How do I clean and store my piece?</span><span class="pdp-accordion__icon">+</span></summary>
                <div class="pdp-accordion__body"><p>Wash silicone pieces with lukewarm water and mild, unscented soap before and after use, pat dry with a lint-free cloth, and store away from direct heat.</p></div>
              </details>
            </div>
          </div>
          <div class="policy-section">
            <h2>Contact Concierge</h2>
            <ul>
              <li>Email: <a href="mailto:${escapeHtml(priv.supportEmail)}" style="color: var(--gold);">${escapeHtml(priv.supportEmail)}</a></li>
              <li>Phone: ${escapeHtml(priv.supportPhone)}</li>
              <li>Hours: ${escapeHtml(priv.supportHours)}</li>
              <li>Studio: ${escapeHtml(priv.studioAddress)}</li>
            </ul>
          </div>
        `,
      },
    };

    const page = pages[pageMode] || pages.help;

    rootEl.innerHTML = `
      <div class="subpage-header">
        <span class="kicker">${page.kicker}</span>
        <h1 class="subpage-title">${page.title}</h1>
        <p class="subpage-lead">${page.lead}</p>
      </div>
      <div class="policy-layout">
        <nav class="account-nav" aria-label="Support and legal pages">
          ${POLICY_LINKS.map(
            (link) => `
            <a href="${link.href}" class="account-nav__link ${link.mode === pageMode ? 'is-active' : ''}">
              <span>${escapeHtml(link.label)}</span>
              <span aria-hidden="true">→</span>
            </a>
          `
          ).join('')}
        </nav>
        <article class="policy-content">${page.body}</article>
      </div>
    `;
  };
})(window);
