# RYS — Remove YouTube Suggestions (local, air-gapped build)

Hide YouTube's recommendations, related videos, comments, shorts, and other
engagement bait, and customize the interface so you use YouTube on your own
terms.

This is a **privacy-hardened fork** of
[`lawrencehook/remove-youtube-suggestions`](https://github.com/lawrencehook/remove-youtube-suggestions)
that runs as a **locally loaded (unpacked) extension** instead of being installed
from a web store. The code you load is exactly the code in this folder, and it
makes **no automatic network connections** — nothing is sent anywhere while you
use it.

All credit for the extension itself goes to its author, Lawrence Hook. This fork
only changes the network/telemetry behavior and the install method.

---

## What's different from upstream

This build is air-gapped: it phones home to no one, and every paid feature is
unlocked locally.

- **No telemetry.** The bundled Mixpanel SDK is removed and the event tracker is
  a no-op. Upstream sent usage events to `api-js.mixpanel.com` (opt-in, but the
  SDK still loaded). Here, nothing.
- **No license/account server.** Sign-in, license checks, and Stripe
  checkout/billing calls to `server.lawrencehook.com` are stubbed out. There is
  no account and nothing to buy.
- **All features unlocked.** Premium-only toggles (Schedule, Password, etc.) work
  with no sign-in.
- **No donor-list fetch.** The Donors page renders locally with no request.
- **No install/uninstall pings.** Upstream registered an uninstall URL and opened
  a welcome page on `lawrencehook.com`; both are removed.

- **Zero external URLs.** Every baked-in external link is removed too — the
  homepage, feedback form/Discord/GitHub links, per-feature "learn more" docs,
  store-review pages, PayPal donate links, and the manifest `homepage_url`. They
  are replaced with inert `#` anchors (the UI elements still render but go
  nowhere). The only `http(s)` URLs left in the build point to `youtube.com`
  (the site the extension operates on) and SVG `xmlns` namespace identifiers
  (which are never fetched).

Net result, verifiable in DevTools → Network: zero requests to any non-YouTube
host during normal use, and no third-party URLs anywhere in the bundle.

---

## Build it

No build is needed for the logic; a small script just copies `src/` into a
loadable folder with the right manifest.

```bash
cd remove-youtube-suggestions
./dev.sh chrome      # rsyncs src/ → dist/chrome/ and drops in the Chrome manifest
```

This produces `dist/chrome/` — the folder you load into the browser. (Requires
`rsync`, which ships with macOS and most Linux distros. No `npm`/`web-ext`
needed for the Chrome/Brave path.)

---

## Load it in Chrome

1. Run `./dev.sh chrome` (creates `dist/chrome/`).
2. Open `chrome://extensions` (paste it into the address bar).
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked** (top-left).
5. Select the **`dist/chrome/`** folder inside this repo, then click **Select**.
6. RYS appears in your toolbar. Click it to open the settings popup, or right-click
   the icon → **Options** for the full-page settings.
7. Go to `youtube.com` and confirm recommendations are hidden. Premium toggles
   (Schedule, Password) work immediately — no sign-in.

## Load it in Brave

Brave is Chromium-based, so the steps are identical — only the settings URL
differs:

1. Run `./dev.sh chrome` (the same `dist/chrome/` build works in Brave).
2. Open `brave://extensions`.
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked** (top-left).
5. Select the **`dist/chrome/`** folder, then **Select**.
6. Pin RYS from the puzzle-piece menu if you want it visible in the toolbar.
7. Open `youtube.com` and confirm it's working.

> Brave's own shield blocks some YouTube elements too; RYS handles the
> recommendation/UI removal regardless of shield settings.

---

## After editing the code

The loaded extension is a **copy** in `dist/chrome/`, not a live link to `src/`
(Chromium refuses to run content scripts whose real path is outside the
extension folder). So after changing anything in `src/`:

1. Re-run `./dev.sh chrome`.
2. On `chrome://extensions` (or `brave://extensions`), click the **reload** ⟳ icon
   on the RYS card.
3. Reload your YouTube tab.

---

## Verify it stays air-gapped

After any change, confirm two things:

1. **No automatic calls in code** (should return only comments):
   ```bash
   grep -rnE "fetch\(|XMLHttpRequest|sendBeacon|mixpanel\.|\.track\(|setUninstallURL" src --include='*.js'
   ```
2. **No external URLs in the bundle** (should print nothing — only `youtube.com`
   and SVG `xmlns` are allowed):
   ```bash
   grep -rnoE "https?://[^\"'\` )<>]+" src | grep -vE "youtube\.com|w3\.org/2000/svg"
   ```
3. **No external requests at runtime.** Open DevTools → Network on the popup and
   on a YouTube tab, use the extension, and confirm nothing hits any host other
   than `youtube.com`.

---

## Layout

- `src/` — source of truth. Edit here.
- `dist/chrome/` — generated, loadable build. Never edit directly.
- `CLAUDE.md` — architecture notes and the full list of what was changed.

Original project and full credit:
[`lawrencehook/remove-youtube-suggestions`](https://github.com/lawrencehook/remove-youtube-suggestions)
(MIT/GPL per `LICENSE`).
