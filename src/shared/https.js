// HTTP helpers — local build.
//
// Upstream this fetched the donor list from lawrencehook.com and provided a
// generic XHR helper used by the (now removed) premium server calls. The local
// build makes no automatic network requests: sendGetDonorsRequest resolves to
// an empty JSON array so the Donors page renders cleanly with no traffic.

function sendGetDonorsRequest() {
  return Promise.resolve('[]');
}
