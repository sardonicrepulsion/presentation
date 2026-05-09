# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
