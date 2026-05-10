# Presentation host-Caddy security headers (#00460)

The inner Caddy in this app emits the static-content-only headers (CSP, Permissions-Policy, X-Frame-Options, Referrer-Policy, X-Content-Type-Options, X-Permitted-Cross-Domain-Policies). HSTS, COOP, CORP and HTTPS-only Permissions-Policy fragments are intentionally **delegated to the host Caddy proxy** so they are emitted only on real public HTTPS traffic — not on inner-container HTTP smoke tests.

## Apply once per environment

The runtime-only labels are stored on the Dokku app object and do not require an app rebuild:

```bash
dokku caddy:labels:add presentation caddy.header.Strict-Transport-Security '"max-age=31536000; includeSubDomains; preload"'
dokku caddy:labels:add presentation caddy.header.Cross-Origin-Opener-Policy 'same-origin'
dokku caddy:labels:add presentation caddy.header.Cross-Origin-Resource-Policy 'same-origin'
```

> **Note about quoting** — Dokku strips single quotes when propagating labels into Docker. For values that contain spaces / semicolons (HSTS), wrap the value in double quotes inside single quotes so the inner double quotes survive (`'"max-age=…; preload"'`). This matches the `drums` and `evolver` apps already in production and the `feedback_dokku_caddy_csp_bug.md` postmortem.

## Verify

After applying, restart Caddy if it doesn't pick up labels live, then:

```bash
curl -sI https://presentation.sardonicrepulsion.com/ | grep -iE 'strict-transport-security|cross-origin-(opener|resource)-policy'
```

Expected output:

```
strict-transport-security: max-age=31536000; includeSubDomains; preload
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
```

## Why these three

- **HSTS preload** — once the public domain is on the Chromium HSTS preload list, browsers refuse to downgrade to HTTP for any subdomain of `sardonicrepulsion.com` even on first visit. The `includeSubDomains` flag widens that to every sibling deck / staging app.
- **COOP `same-origin`** — gives the deck its own browsing-context group so cross-origin popups can't reach back into `window.opener` (defence-in-depth on top of `frame-ancestors 'none'`).
- **CORP `same-origin`** — opts the deck's responses out of being embedded by other origins. With CSP `frame-ancestors 'none'` already covering `<iframe>`, CORP closes the residual `<img>` / `<script>` cross-origin-isolation gap.

## How to use the deployed deck

- **Browse:** https://presentation.sardonicrepulsion.com/
- **Direct slide link:** append `#slide-N`, e.g. `…/#slide-7`.
- **Keyboard shortcuts:** `←` / `→` / `PageUp` / `PageDown` / `Space` / `Home` / `End` to navigate. `F` fullscreen, `S` speaker notes, `O` overview grid, `?` help, `Esc` close overlays / exit fullscreen.
- **Speaker notes:** add a `notes` string to any entry in `data/slides.json` (multiple paragraphs separate with a blank line). Press `S` during the talk.
- **Print handouts:** open the deck in Chrome / Firefox, `Ctrl+P`, choose A4 landscape — the print stylesheet renders one slide per page with controls / overlays hidden.
- **Direct overview:** press `O` to see every slide as a thumbnail tile; click to jump.

## Rollback

If a header needs to be cleared:

```bash
dokku caddy:labels:remove presentation caddy.header.Strict-Transport-Security
```

…and so on. App container is unaffected.
