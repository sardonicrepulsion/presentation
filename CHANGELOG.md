# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
