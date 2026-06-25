// Telemetry disabled in the local build.
//
// Upstream loaded the Mixpanel SDK here and sent usage events to
// api-js.mixpanel.com. This local build ships no analytics: recordEvent is a
// no-op so every existing call site keeps working without any network traffic.
function recordEvent(_name, _props = {}) {
  // intentionally empty — no tracking in the local build
}
