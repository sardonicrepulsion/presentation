# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1] - 2026-05-13

### Fixed
- **forward_auth redirect loop (#721 follow-up).** Live deploy of 0.10.0
  redirected anonymous visitors to
  `https://login.sardonicrepulsion.com/login?redirect=https://login.sardonicrepulsion.com:443/`,
  i.e. the post-login redirect was pointing back at the login domain
  instead of the presentation host. Caddy's `forward_auth` lifecycle
  rewrites the outbound `Host` header to the upstream's hostname before
  it sets `X-Forwarded-Host`, so the login `/verify` endpoint saw the
  upstream's host. Caddyfile now explicitly sets
  `header_up X-Forwarded-Host {http.request.host}` (plus the matching
  `X-Forwarded-Uri` and `X-Forwarded-Proto`) so verify composes the
  correct return URL.

## [0.10.0] - 2026-05-13

### Added
- **SSO gate for access=internal (SRcore #721).** Presentation is
  classified `access=internal` in `core_projects` (the SRcore source of
  truth) but its host has been returning `200 OK` to anonymous visitors
  since first deploy — a public leak of an internal deck. Caddyfile now
  performs `forward_auth login.sardonicrepulsion.com:443 /verify` on
  the catch-all `handle` block; unauthenticated requests get a
  `302 → login.sardonicrepulsion.com/login?redirect=…`. `/health`,
  `/healthz`, `/version`, `/robots.txt`, `/sitemap.xml` remain public
  so health-monitor and version-monitor probes keep working unchanged.

## [0.9.1] - 2026-05-11

### Changed
- **Slide content fixes from audit (#645).** Three factual inaccuracies
  flagged during the post-deploy audit, fixed per content owner's
  direction (Telegram, 2026-05-11):
  - Slide 2 (Dashboard) bullet 1: was "Summary cards pre open,
    in-progress, done, blocked a total"; now "Summary cards pre tokens,
    tasks, projects, times…" (matches actual dashboard composition:
    summary cards + tokens widget + tasks/projects counts + time
    tracking).
  - Slide 8 (Katalógy) bullet 2: was "role user, admin alebo auditor";
    now "role user, agent, admin alebo auditor" (matches
    `core_users.role` enum).
  - Slide 10 (Bezpečnosť) bullet 1: was "verejné sú len health, version
    a GitHub webhook"; now "verejné sú len health, version, GitHub
    webhook a sanitizované /api/public/projects" (matches Portal
    integration, memory: Portal ↔ SRcore #00626).

## [0.9.0] - 2026-05-11

### Changed
- **CSP hardening — inline JS+CSS extracted (task #644).** The v2 deck inline
  `<style>` (545 lines) and inline `<script>` (442 lines) are extracted to
  `/v2/styles.css` and `/v2/deck.js` respectively. `index.v2.html` now links
  them as external resources.
- Caddyfile CSP restored to strict `script-src 'self'` / `style-src 'self'`
  (drop `'unsafe-inline'` allowance added in 0.8.0).
- Trusted Types directive intentionally NOT re-added: v2 `deck.js` uses
  `innerHTML` for slide rendering without a TT policy. Followup task will
  refactor to safe DOM APIs (`textContent` + `replaceChildren`) before
  re-adding `require-trusted-types-for 'script'`.
- Dockerfile copies `v2/` into `/srv/v2/`.

### Added
- `v2/styles.css` — v2 deck stylesheet (extracted).
- `v2/deck.js` — v2 deck logic (extracted, `defer`-loaded).

## [0.8.0] - 2026-05-11

### Changed
- **Root deck replaced with v2 single-file SRcore presentation.** New deck
  delivered as a final HTML+CSS+JS bundle by the content owner (10 screen
  captures + dedicated content slides). Old deck (0.7.x) remains served under
  `/old/` via the existing snapshot mechanism (#00485). Dockerfile copies
  `index.v2.html` over `/srv/index.html` and adds `/srv/screens/` after the
  snapshot step.
- Caddyfile CSP temporarily allows `'unsafe-inline'` for `script-src` and
  `style-src` and drops the Trusted Types directive — v2 bundle has inline
  `<script>` + `<style>` blocks and no Trusted Types policy. Followup task
  #644 extracts inline assets and restores strict CSP + Trusted Types.

### Added
- `index.v2.html` — single-file v2 deck (39KB, inline CSS + inline JS, deck
  navigation, dots, fullscreen, touch swipe).
- `screens/` — 10 PNG screen captures referenced by v2 deck slides
  (dashboard, tasks, task-detail, task-edit, projects, project-detail,
  categories, models, settings, more).

### SRcore tasks
- #640 nasadiť v2 deck (this PR)
- #641 Caddyfile inline allowance (this PR)
- #642 version bump 0.7.1 → 0.8.0 (this PR)
- #643 deploy + smoke (this PR + post-merge verify)
- #644 CSP hardening — extract inline JS+CSS (followup, READY)
- #645 audit slide content vs reálne SRcore funkcie (followup, READY)

## [0.7.1] - 2026-05-11

### Added
- **`/old/` SEO hygiene.** `robots.txt` now `Disallow: /old/` so the snapshot is not indexed. Dockerfile snapshot step also injects `<meta name="robots" content="noindex,nofollow">` into `/srv/old/index.html` for crawlers that ignore robots.txt. Static test asserts both pieces of the Dockerfile pipeline.

## [0.7.0] - 2026-05-11

### Added
- **`/old/` snapshot route.** Dockerfile build now duplicates the current deck (index.html + css + js + data + assets + manifest) under `/srv/old/` and rewrites the absolute asset paths to `/old/...`. The next presentation can replace the root slot without breaking the historical copy. Static test guards the Dockerfile snapshot step.

## [0.6.1] - 2026-05-10

### Fixed
- `Dockerfile` `COPY` line missed `robots.txt` and `sitemap.xml`, so the v0.6.0 deploy returned 404 for both files even though the Caddyfile handlers were in place. Added both to the static-asset copy line.

## [0.6.0] - 2026-05-10

Single batch PR for six presentation polish/feature tasks (#00454 / #00455 / #00456 / #00457 / #00458 / #00459). #00460 (HSTS preload + COOP/CORP via dokku caddy:labels:add) lands as a separate runtime config + docs commit since it does not require a code change to the app — labels are applied on the host. Bundled per the new "no parallel PRs on the same project" + "crisis batch mode" rules.

### Added
- **#00454 — Slide transitions.** `js/app.js` `render()` now toggles a one-frame `is-fading` class on the active slide so it briefly fades + nudges 6px on slide change. CSS adds `transition: opacity 220ms, transform 220ms` on `.slide` + a reduce-motion override that disables both. `paintSlide()` is exposed as a fast path used by reduce-motion + by Playwright assertions that don't want to wait on the animation.
- **#00455 — Keyboard help overlay.** `<dialog id="help">` markup with the full shortcut list. `?` toggles, `Esc` closes (native `<dialog>` behaviour). Header `?` button mirrors the keyboard shortcut for mouse users. CSS styles the dialog + backdrop.
- **#00456 — Speaker notes mode.** `slides[i].notes` (string) is rendered into a bottom panel toggled by `S`. State persists in `localStorage[presentation.notesOpen]` so mode survives reload. Empty notes show a grey "No notes for this slide." placeholder. Panel re-paints on every slide change.
- **#00457 — Overview grid mode.** `O` toggles a fullscreen grid of every slide rendered as a clickable tile (`<button>` with `data-action="overview-jump"`). Click jumps to the slide and closes the grid. `Esc` also closes. Active tile highlights via `is-active` class + `aria-current="true"`.
- **#00458 — Print stylesheet.** `@media print` block renders one slide per A4 landscape page, hides controls / progress / overlays / hint, swaps to a light theme so the deck handouts print cleanly. `Ctrl+P` is the trigger; no JS plumbing.
- **#00459 — SEO + PWA pack.** `index.html` adds canonical link, OG + Twitter card meta, and inline JSON-LD `WebApplication` schema. `robots.txt` + `sitemap.xml` published from the repo root with explicit Caddy handlers (correct `Content-Type` + 1h cache). New `/assets/img/og-image.svg` rendered as the social preview.
- `index.html` head now points the title at `Presentation — SRcore`, the description copy reflects the new keyboard / notes / overview / print features.
- Help (`?`) button mounted in the bottom controls bar between `next` and `fullscreen`.

### Tests
- `tests/e2e/smoke.spec.mjs` — existing slide / counter / Home-End / CSP assertions stay green. Reduce-motion path for #00454 is covered indirectly by the existing `arrow keys + nav buttons advance counter` test (the test uses `toHaveText` which retries past the fade frame, but the JS exposes `paintSlide()` as a synchronous path).
- `tests/presentation-static.test.mjs` — sweep stays green; new HTML / JS markers asserted by the existing template-shape checks remain valid (no removed selectors).

### Notes
- CSP unchanged — new code keeps the existing `textContent` + `replaceChildren` discipline so `require-trusted-types-for 'script'` remains compatible. `<dialog>` + `setAttribute` paths do not require a Trusted Types policy.
- Caddy gains explicit `/robots.txt` + `/sitemap.xml` handlers so the static fallback returns the right `Content-Type` (default `file_server` works but the explicit handlers also pin a 1h cache and are easier to grep for).
- #00460 (HSTS preload + COOP/CORP) is delivered via `docs/HEADERS.md` + `dokku caddy:labels:add` runtime config, which do not require an app rebuild.

## [0.5.0] - 2026-05-09

### Added
- 5 more custom SVG diagrams (every non-screenshot slide now has its own diagram instead of a placeholder): `slide-problem.svg` (3 broken systems triptych), `slide-vision.svg` (funnel: many inputs → SRcore → outputs), `slide-doneguard.svg` (SQL block + BLOCKED stamp + error code), `slide-models.svg` (real-data bar chart 326/268/201/47), `slide-orchestrator.svg` (manager → 3 subagents → 3 reviewers/testers org chart), `slide-v2sweep.svg` (8-project before/after ratings), `slide-roadmap.svg` (Q3 / Q4 / Q1'27 timeline + Otázky)

### Changed
- Re-captured 4 SRcore screenshots at 1920×1200 with `deviceScaleFactor: 1.5` so dashboard hero shows time-tracking + per-project breakdown rows (not just totals)
- Every slide now has a unique image (no more 3-SVG cycle)

## [0.4.0] - 2026-05-09

### Added
- Real SRcore screenshots for demo slides: `srcore-dashboard.png`, `srcore-tasks.png`, `srcore-task-detail.png`, `srcore-audit.png` (1440×900, captured against live `srcore.sardonicrepulsion.com`)
- Custom SVG diagrams: `slide-title.svg` (SRcore branding + key numbers), `slide-architecture.svg` (Caddy → PHP → MySQL + side channels), `slide-lifecycle.svg` (8-state machine with stale-watcher branches)
- Deck content expanded from 12 → 14 slides: demo split into 3 dedicated slides (tasks list / task detail / audit log) with screenshots; live numbers slide now uses the real dashboard hero

### Changed
- Slide bullets sharpened across the deck: title slide leads with throughput numbers; done-guard slide adds the DB-level error code; demo slides describe what the screenshot shows rather than abstract features

## [0.3.1] - 2026-05-09

### Fixed
- `package.json` version bump (was stuck at 0.2.0 while other markers were 0.3.0); deployer precheck blocked merge of v0.3.0 — this hotfix syncs all version markers and unblocks live deploy

## [0.3.0] - 2026-05-09

### Added
- First real SRcore deck content (12 slides, SK)

## [0.2.0] - 2026-05-09

### Added
- Playwright smoke E2E (`tests/e2e/smoke.spec.mjs`): initial render + counter `1/N`, ArrowRight/Prev/Next nav, Home/End jumps, strict CSP header assertions + `/healthz` + `/version` JSON shape
- `playwright.config.mjs` (chromium project, baseURL `http://localhost:18080`)
- `playwright-smoke` GitHub Actions job on dedicated `sardonic-arm64-presentation` runner (Playwright pre-installed at `/opt/playwright-browsers`); uploads `playwright-report` artifact on failure
- `@playwright/test` ^1.48.0 dev dependency + `npm run test:e2e` script
- `.gitignore` entries for `playwright-report/`, `test-results/`, `.cache/`

## [0.1.0] - 2026-05-09

### Added
- Initial V2 baseline: slide deck viewer (image-left, bullets-right)
- Keyboard navigation: ←/→/Home/End/F/Esc + touch swipe
- Progress bar + slide counter (`n / N`)
- Slide content driven by `data/slides.json` (editable, no rebuild)
- Strict CSP from start (`script-src 'self'`, `style-src 'self'`, Trusted Types `presentation-template`)
- Security headers: X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Health endpoints `/health`, `/healthz`, `/version`
- 404 page, PWA manifest, theme-color, skip-link, `<main>` landmark
- Caddyfile + Dockerfile (caddy:2-alpine), `app.json` healthchecks
- Domain `presentation.sardonicrepulsion.com`, Dokku app `presentation`, deployer webhook
- Static test gate (CSP, no inline `<style>`/`<script>`, version consistency, slide schema)
