# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
