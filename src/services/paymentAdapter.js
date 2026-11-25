(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  /**
   * Payment Integration Adapter (Stripe-compatible interface)
   * ---------------------------------------------------------
   * Expects hosted/tokenized payment elements (e.g. Stripe PaymentElement).
   * Never collects, logs, or persists raw card numbers or security codes.
   * When live Stripe credentials (`window.LUVRA_STRIPE_PUBLIC_KEY`) are absent,
   * runs explicitly in Demo Mode so no real charge is ever claimed.
   */
  Luvra.paymentProvider = {
    getMode() {
      const hasLiveKey =
        typeof global.LUVRA_STRIPE_PUBLIC_KEY === 'string' &&
        global.LUVRA_STRIPE_PUBLIC_KEY.startsWith('pk_live_');
      return hasLiveKey ? 'live' : 'demo';
    },

    isDemoMode() {
      return this.getMode() === 'demo';
    },

    getTokenizedOptions() {
      return [
        {
          id: 'tok_demo_card_4242',
          provider: 'stripe-hosted-demo',
          label: 'Tokenized Card · Demo Vault',
          note: 'Simulated hosted card token (no real card data collected)',
        },
        {
          id: 'tok_demo_wallet_express',
          provider: 'stripe-hosted-demo',
          label: 'Tokenized Wallet · Demo Pass',
          note: 'Simulated express wallet token (no real payment processed)',
        },
      ];
    },

    createPaymentToken(optionId) {
      const options = this.getTokenizedOptions();
      const chosen = options.find((opt) => opt.id === optionId) || options[0];
      return {
        provider: chosen.provider,
        tokenId: chosen.id,
        label: chosen.label,
        mode: this.getMode(),
      };
    },

    confirmPayment({ token, amount, simulatedOutcome = 'succeeded' }) {
      const isDemo = this.isDemoMode();

      if (!token || !token.tokenId) {
        return {
          status: 'failed',
          isDemo,
          message: 'A tokenized payment method must be selected before authorization.',
        };
      }

      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return {
          status: 'failed',
          isDemo,
          message: 'Payment amount must be greater than $0.00.',
        };
      }

      const refId = `pi_${isDemo ? 'demo' : 'live'}_${Date.now().toString(36)}`;

      switch (simulatedOutcome) {
        case 'failed':
          return {
            status: 'failed',
            isDemo,
            paymentIntentId: refId,
            paymentLabel: token.label,
            message:
              'Demo payment authorization was declined. No real charge was attempted and no order was created.',
          };
        case 'cancelled':
          return {
            status: 'cancelled',
            isDemo,
            paymentIntentId: refId,
            paymentLabel: token.label,
            message:
              'Hosted payment session was cancelled before confirmation. Your bag and entered details are preserved.',
          };
        case 'pending':
          return {
            status: 'pending',
            isDemo,
            paymentIntentId: refId,
            paymentLabel: token.label,
            message:
              'Demo payment authorization is pending verification. No order has been created yet.',
          };
        case 'succeeded':
        default:
          return {
            status: 'succeeded',
            isDemo,
            paymentIntentId: refId,
            paymentLabel: token.label,
            message: isDemo
              ? 'Demo payment authorized (no real charge was made).'
              : 'Payment authorized.',
          };
      }
    },
  };
})(window);
