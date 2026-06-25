// Auth module — local build.
//
// Upstream this handled email magic-link sign-in against
// server.lawrencehook.com (send link, poll for verification, store a session
// token). The local build has no accounts and no server: premium is unlocked
// for everyone (see license.js). The public API is preserved so existing call
// sites keep working, but nothing here touches the network.
//
// isSignedIn() reports true so the options UI settles directly into the premium
// state; signOut() is a no-op so that state stays sticky across reloads.

const Auth = {
  async sendMagicLink(_email) {
    throw new Error('Sign-in is disabled in the local build (premium is already unlocked).');
  },

  async pollForVerification(_requestId, _onStatusUpdate, _options = {}) {
    throw new Error('Sign-in is disabled in the local build.');
  },

  async isSignedIn() {
    return true;
  },

  async getUserEmail() {
    return 'local';
  },

  async getSessionToken() {
    return null;
  },

  async signOut() {
    // no-op: there is no session to end in the local build
  },
};
