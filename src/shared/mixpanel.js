// Mixpanel SDK removed in the local build.
//
// Upstream bundled the full Mixpanel browser SDK here and analytics.js injected
// it at runtime to ship usage events off-device. The local build sends no
// telemetry, so this file is intentionally empty. It is kept (rather than
// deleted) only so any stale reference resolves to a harmless no-op.
