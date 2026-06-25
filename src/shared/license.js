// License module — local build.
//
// Upstream this module talked to server.lawrencehook.com to verify a paid
// license (JWT), open Stripe checkout, and open the billing portal. The local
// build has no server and no payment: every feature is simply unlocked. The
// public API is preserved so existing call sites (settings-menu.js,
// options/main.js, etc.) keep working, but nothing here makes a network call.

const License = {
  // Premium is always on locally.
  async checkLicense(_forceRefresh = false) {
    return { isPremium: true, source: 'local', cached: true };
  },

  async isPremium() {
    return true;
  },

  isPremiumSync(_token) {
    return true;
  },

  getTierSync(_licenseToken, _sessionToken) {
    return TIER.PREMIUM;
  },

  // Payment flows are disabled in the local build — there is nothing to buy.
  async createCheckoutSession(_plan) {
    throw new Error('Checkout is disabled in the local build (premium is already unlocked).');
  },

  async createBillingPortalSession() {
    throw new Error('Billing portal is disabled in the local build.');
  },
};
