# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A fork of [`lawrencehook/remove-youtube-suggestions`](https://github.com/lawrencehook/remove-youtube-suggestions)
(RYS), a Chrome/Firefox extension that hides YouTube recommendations and
customizes the UI. This copy is converted to run as a **locally loaded
(unpacked) Chrome extension with no automatic network connections** — nothing is
installed from the Chrome Web Store, and the running code is exactly the code in
this directory.

The upstream code is otherwise intact. Keep edits minimal and in `src/` (the
source of truth); `dist/chrome/` is a generated build, never edit it directly.

## Architecture (upstream, unchanged)

Manifest V3. Two execution contexts share the `/shared/*.js` modules:

- **Content script** (`src/content-script/main.js` + `/shared/{main,config,https,utils,banners}.js`,
  injected at `document_start` on `*.youtube.com`): reads settings from
  `browser.storage.local`, mirrors each setting onto `<html>` as an attribute,
  and `src/content-script/main.css` hides/restyles the page via those attribute
  selectors. This is the actual recommendation-removal engine.
- **Popup / options page** (`src/options/`, also the `options_ui`): the settings
  UI. `main.js` renders toggles from the `SECTIONS`/`DEFAULT_SETTINGS` config in
  `shared/main.js`; `settings-menu.js` drives the header, schedule/password
  menus, and (upstream) the account/premium flow.
- **Background service worker** (`src/background/events.js`): swaps the toolbar
  icon when the extension is globally enabled/disabled.

Settings live entirely in `browser.storage.local`. There is no build step for the
logic — files are copied as-is into the bundle.

## What was changed for the local build

Goal: all features unlocked, zero automatic outbound network traffic. The premium
gate funnels through a few primitives, so the changes are small and centralized:

- `src/shared/license.js` — `getTierSync`/`isPremium*`/`checkLicense` always
  report **premium**; Stripe checkout/billing-portal calls throw. No fetches.
- `src/shared/auth.js` — magic-link sign-in stubbed out; `isSignedIn()` returns
  true and `signOut()` is a no-op so the UI settles into premium and stays there.
- `src/content-script/main.js` — `getTier()` always returns `TIER.PREMIUM`, so no
  feature is ever gated or cleared on the page.
- `src/shared/analytics.js` — `recordEvent()` is a no-op; the Mixpanel SDK
  (`src/shared/mixpanel.js`) is emptied. No telemetry.
- `src/shared/https.js` — `sendGetDonorsRequest()` resolves to `'[]'` locally
  (no fetch of `donors.json`).
- `src/shared/config.js` — `SERVER_URL` blanked so any stray call fails closed.
- `src/background/events.js` — removed the install/uninstall pings to
  `lawrencehook.com`.
- Removed the upstream `server/` directory (the Stripe/license backend), which is
  irrelevant to a local build.

This build is also **zero-external-URL**: every baked-in external link was
neutralized to an inert `#` anchor — the settings footer (homepage, feedback,
view-source, donate), the feedback page (GitHub/Form/Discord cards), the donors
page (PayPal), per-feature "learn more" links (`sectionNameToUrl` now returns
`'#'`, `HOST` is `''`), the store-review link in `donors.js`, the `DONATE_URL`
constant, the manifest `homepage_url`, and the URLs in the `tooltip.svg` / `md5.js`
attribution comments. Only `youtube.com` links (the operational site) and SVG
`xmlns` identifiers remain.

**Invariants to preserve:**

1. No automatic `fetch`/`XMLHttpRequest`/`sendBeacon`/analytics call. Guard:
   `grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|mixpanel\.|\.track\(" src --include='*.js'`
   (should return only comments).
2. No third-party URLs. Guard:
   `grep -rnoE "https?://[^\"'\` )<>]+" src | grep -vE "youtube\.com|w3\.org/2000/svg"`
   (should return nothing).

## Build & load

```bash
./dev.sh chrome   # rsyncs src/ → dist/chrome/ and drops in chrome_manifest.json
```

Then in `chrome://extensions`: enable **Developer mode** → **Load unpacked** →
select `dist/chrome/`. After editing anything in `src/`, re-run `./dev.sh chrome`
and click **reload** on the extension card.

Do not symlink `src/` into the bundle — Chrome silently refuses to run content
scripts whose realpath is outside the extension dir (see the note in `dev.sh`).
The Firefox path in `dev.sh`/`firefox.sh` is upstream and untouched; this fork
targets Chromium.

## Verifying

`tests/` holds the upstream test suite. There is no automated check that the
network-stripping holds, so after any change confirm two things manually:

1. Load `dist/chrome/`, open YouTube, confirm recommendations are hidden and
   premium toggles (Schedule, Password) are usable without signing in.
2. With DevTools → Network open on the popup and on a YouTube tab, confirm no
   requests go to `lawrencehook.com`, `mixpanel.com`, or `mxpnl.com`.
