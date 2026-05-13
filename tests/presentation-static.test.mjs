import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const caddy = readFileSync('Caddyfile', 'utf8');
const indexHtml = readFileSync('index.html', 'utf8');
const errorHtml = readFileSync('404.html', 'utf8');
const versionTxt = readFileSync('VERSION', 'utf8').trim();
const versionJson = JSON.parse(readFileSync('version.json', 'utf8'));
const appJson = JSON.parse(readFileSync('app.json', 'utf8'));
const manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
const slides = JSON.parse(readFileSync('data/slides.json', 'utf8'));
const css = readFileSync('css/app.css', 'utf8');
const js = readFileSync('js/app.js', 'utf8');
const changelog = readFileSync('CHANGELOG.md', 'utf8');

test('version consistency', () => {
  assert.match(versionTxt, /^\d+\.\d+\.\d+$/, 'VERSION must be SemVer');
  assert.equal(versionJson.version, versionTxt, 'version.json matches VERSION');
  assert.ok(caddy.includes(`"version":"${versionTxt}"`), 'Caddyfile /version handler matches VERSION');
  assert.ok(changelog.includes(`[${versionTxt}]`), 'CHANGELOG has entry for current version');
  // Deployer also gates on package.json — keep it in lockstep so version-consistency CI matches
  // the deploy-time check (mismatch caused 0.6.1 deploy block on 2026-05-10).
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.version, versionTxt, 'package.json matches VERSION');
});

test('version.json shape', () => {
  assert.equal(versionJson.app, 'presentation');
  assert.match(versionJson.classification, /^[a-z]+\/[a-z]+\/[a-z]+$/);
});

// v0.9.0 — strict CSP restored after #644 extraction of inline JS+CSS.
// 'unsafe-inline' must not appear in script-src or style-src. Trusted Types
// is still off pending a deck refactor away from innerHTML.
test('Caddyfile has strict CSP (script-src/style-src self only)', () => {
  assert.ok(caddy.includes('Content-Security-Policy'), 'CSP header present');
  assert.doesNotMatch(caddy, /'unsafe-eval'/, "CSP must not allow 'unsafe-eval'");
  assert.doesNotMatch(caddy, /script-src[^;]*'unsafe-inline'/, "script-src must not allow 'unsafe-inline'");
  assert.doesNotMatch(caddy, /style-src[^;]*'unsafe-inline'/, "style-src must not allow 'unsafe-inline'");
  assert.doesNotMatch(caddy, /script-src[^;]*\bhttps:[^a-z]/, 'script-src must not have https: wildcard');
  assert.doesNotMatch(caddy, /img-src[^;]*\bhttps:[^a-z]/, 'img-src must not have https: wildcard');
  assert.ok(caddy.includes("script-src 'self'"), "script-src 'self'");
  assert.ok(caddy.includes("style-src 'self'"), "style-src 'self'");
  assert.ok(caddy.includes("frame-ancestors 'none'"), 'frame-ancestors none');
  assert.ok(caddy.includes("object-src 'none'"), 'object-src none');
  assert.ok(caddy.includes("default-src 'self'"), "default-src 'self'");
});

test('Caddyfile has security headers', () => {
  for (const h of ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(caddy.includes(h), `${h} present`);
  }
});

test('Caddyfile has health and version handlers', () => {
  assert.ok(caddy.includes('handle /healthz'));
  assert.ok(caddy.includes('handle /health'));
  assert.ok(caddy.includes('handle /version'));
});

// v0.10.0 — access=internal gate. Catch-all handle must forward_auth via
// login.sardonicrepulsion.com:443/verify; /health /healthz /version remain
// outside the gated handle so monitors can still probe the app anonymously.
test('Caddyfile has forward_auth gate on catch-all handle (#721)', () => {
  assert.match(caddy, /forward_auth\s+login\.sardonicrepulsion\.com:443/, 'forward_auth directive points at login service');
  // v0.10.2 — uri MUST carry original host/uri/scheme as query-string args
  // (?h=, ?u=, ?p=) so the login service can compose the post-login redirect.
  // X-Forwarded-* alone is unreliable: host-side Caddy strips client-set
  // X-Forwarded-* because the in-container proxy is not on its trusted_proxies
  // list — header overrides got silently overwritten in v0.10.1.
  assert.match(caddy, /uri\s+\/verify\?h=\{http\.request\.host\}&u=\{http\.request\.uri\.path\}&p=\{http\.request\.scheme\}/,
    'forward_auth uri must encode original host/uri/scheme as query args (login v1.3.0+ reads them)');
  assert.match(caddy, /tls_server_name\s+login\.sardonicrepulsion\.com/, 'TLS SNI is set so cert is validated');
  // Find the directive line itself (start-of-line + indent + 'forward_auth'),
  // not the explanatory comment in the top `header { }` block.
  const healthBlock = caddy.indexOf('handle /health');
  const gateMatch = caddy.match(/^\s*forward_auth\s+login\.sardonicrepulsion/m);
  const gateBlock = gateMatch ? caddy.indexOf(gateMatch[0]) : -1;
  assert.ok(healthBlock !== -1 && gateBlock !== -1 && healthBlock < gateBlock,
    '/health /healthz /version blocks must precede the gated catch-all so monitors stay public');
});

// v0.10.0 — Caddyfile.smoke is the CI variant (no forward_auth) so the docker
// and playwright smoke jobs can hit / without an SSO cookie. Production
// Caddyfile MUST keep the gate; smoke variant MUST NOT have it. Version
// literals must stay in lockstep with the production file so a half-bump
// can't silently drift.
test('Caddyfile.smoke variant has no forward_auth and matches version (#721)', () => {
  assert.ok(existsSync('Caddyfile.smoke'), 'Caddyfile.smoke present');
  const smoke = readFileSync('Caddyfile.smoke', 'utf8');
  assert.doesNotMatch(smoke, /forward_auth/, 'smoke variant must NOT contain forward_auth (CI has no JWT)');
  assert.ok(smoke.includes(`"version":"${versionTxt}"`), 'Caddyfile.smoke /version handler matches VERSION');
  // Smoke variant must still respond to the public endpoints unchanged.
  for (const h of ['handle /health', 'handle /healthz', 'handle /version']) {
    assert.ok(smoke.includes(h), `Caddyfile.smoke retains ${h}`);
  }
  // Defensive: production must KEEP the gate.
  assert.match(caddy, /forward_auth/, 'production Caddyfile must contain forward_auth');
});

test('app.json has healthcheck', () => {
  assert.ok(Array.isArray(appJson.healthchecks?.web));
  assert.ok(appJson.healthchecks.web.length >= 1);
});

test('index.html has no inline style/script', () => {
  assert.doesNotMatch(indexHtml, /<style[^>]*>/, 'no inline <style>');
  assert.doesNotMatch(indexHtml, /\sstyle="/, 'no inline style="" attribute');
  assert.doesNotMatch(indexHtml, /\son\w+=["']/, 'no inline on*= handlers');
  // #00459 — `<script type="application/ld+json">` is JSON data, not executable code; CSP does not run it.
  // The "no inline executable script" rule still applies — guard against any script that is neither
  // src-loaded nor explicitly typed as JSON-LD.
  assert.doesNotMatch(indexHtml, /<script(?![^>]*\bsrc=)(?![^>]*type=["']application\/ld\+json["'])[^>]*>[\s\S]+?<\/script>/, 'no inline executable <script> body');
  assert.doesNotMatch(indexHtml, /javascript:/, 'no javascript: URL');
});

test('index.html has accessibility primitives', () => {
  assert.match(indexHtml, /class="skip-link"/, 'skip-link present');
  assert.match(indexHtml, /<main\b[^>]*id="main"/, '<main id="main"> landmark');
  assert.match(indexHtml, /name="theme-color"/, 'theme-color meta present');
  assert.match(indexHtml, /rel="manifest"/, 'manifest link present');
});

test('404 page references stylesheet', () => {
  assert.match(errorHtml, /href="\/css\/app\.css"/);
});

test('css/app.css and js/app.js exist and non-empty', () => {
  assert.ok(css.length > 100, 'css/app.css non-empty');
  assert.ok(js.length > 100, 'js/app.js non-empty');
});

test('js does not inject inline style elements', () => {
  assert.doesNotMatch(js, /createElement\(\s*['"]style['"]\s*\)/, 'no createElement("style")');
});

test('manifest shape', () => {
  assert.match(manifest.name, /Presentation/i, 'manifest name mentions Presentation');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.theme_color, '#0b1020');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
});

test('slides.json shape', () => {
  assert.ok(Array.isArray(slides.slides) && slides.slides.length >= 1);
  for (const s of slides.slides) {
    assert.equal(typeof s.title, 'string');
    assert.ok(Array.isArray(s.bullets));
    if (s.image) assert.equal(typeof s.image, 'string');
    // #00456 — speaker notes are an optional string per slide.
    if (s.notes !== undefined) assert.equal(typeof s.notes, 'string');
  }
});

// #00454 — slide fade transition driven by the `is-fading` class. JS toggles it on slide change;
// CSS transitions opacity + transform; the reduce-motion media query disables both.
test('slide transition + reduced-motion', () => {
  assert.match(js, /is-fading/, 'JS toggles the is-fading class on slide change (#00454)');
  assert.match(css, /\.slide\s*\{[^}]*transition\s*:[^}]*opacity[^}]*\}/, 'CSS transitions .slide opacity (#00454)');
  assert.match(css, /\.slide\.is-fading\s*\{[^}]*opacity:\s*0/, 'is-fading collapses opacity (#00454)');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.slide\s*\{[^}]*transition:\s*none/, 'reduce-motion disables slide transition (#00454)');
});

// #00455 — keyboard help overlay; ? toggles the dialog, Esc closes (native dialog behaviour).
test('keyboard help dialog', () => {
  assert.match(indexHtml, /<dialog id="help"/, 'help dialog markup present (#00455)');
  assert.match(indexHtml, /data-action="toggle-help"/, 'toggle-help control wired (#00455)');
  assert.match(js, /toggleHelp\s*\(/, 'JS exposes toggleHelp (#00455)');
  assert.match(js, /case '\?':/, '? key opens the help dialog (#00455)');
  assert.match(css, /\.help::backdrop/, 'help dialog has a styled backdrop (#00455)');
});

// #00456 — speaker notes panel; S toggles the bottom panel; preference persists in localStorage.
test('speaker notes mode', () => {
  assert.match(indexHtml, /<aside id="notes"/, 'notes panel markup present (#00456)');
  assert.match(indexHtml, /id="notes-body"/, 'notes body mount present (#00456)');
  assert.match(js, /case 's':[\s\S]*?case 'S':[\s\S]*?toggleNotes/, 'S key toggles notes (#00456)');
  assert.match(js, /presentation\.notesOpen/, 'localStorage key persists notes preference (#00456)');
  assert.match(css, /\.notes\s*\{/, 'notes panel CSS present (#00456)');
});

// #00457 — overview grid; O toggles a fullscreen tile grid; click jumps to a slide.
test('overview grid mode', () => {
  assert.match(indexHtml, /<section id="overview"/, 'overview container markup present (#00457)');
  assert.match(js, /case 'o':[\s\S]*?case 'O':[\s\S]*?toggleOverview/, 'O key toggles overview (#00457)');
  assert.match(js, /buildOverview\s*\(/, 'buildOverview helper present (#00457)');
  assert.match(js, /data-action="overview-jump"|dataset\.action = 'overview-jump'|btn\.dataset\.action = 'overview-jump'/, 'overview tile click action wired (#00457)');
  assert.match(css, /\.overview-grid\s*\{[^}]*display:\s*grid/, 'overview grid CSS present (#00457)');
});

// #00458 — print stylesheet: each slide on its own A4 landscape page; controls/overlays hidden.
test('print stylesheet', () => {
  assert.match(css, /@media print\s*\{[\s\S]*?@page\s*\{[^}]*size:\s*A4 landscape/, '@media print sets A4 landscape (#00458)');
  assert.match(css, /@media print\s*\{[\s\S]*?\.slide\s*\{[^}]*page-break-after:\s*always/, '@media print forces one slide per page (#00458)');
  assert.match(css, /@media print\s*\{[\s\S]*?\.controls[^}]*display:\s*none\s*!important/, '@media print hides controls bar (#00458)');
});

// #00459 — SEO + PWA pack: robots, sitemap, JSON-LD, OG meta, manifest categories.
test('SEO + PWA pack', () => {
  assert.ok(existsSync('robots.txt'), 'robots.txt published (#00459)');
  assert.ok(existsSync('sitemap.xml'), 'sitemap.xml published (#00459)');
  assert.ok(existsSync('assets/img/og-image.svg'), 'og-image SVG published (#00459)');
  assert.match(indexHtml, /<script type="application\/ld\+json">/, 'JSON-LD WebApplication present (#00459)');
  assert.match(indexHtml, /property="og:image"/, 'og:image meta present (#00459)');
  assert.match(indexHtml, /rel="canonical"/, 'canonical link present (#00459)');
  assert.match(caddy, /handle \/robots\.txt/, 'Caddyfile has explicit /robots.txt handler (#00459)');
  assert.match(caddy, /handle \/sitemap\.xml/, 'Caddyfile has explicit /sitemap.xml handler (#00459)');
  assert.ok(Array.isArray(manifest.categories) && manifest.categories.length >= 1, 'manifest carries categories (#00459)');
});

// #00460 — host-Caddy security headers documented in docs/HEADERS.md (delivered via dokku labels at runtime).
test('host-Caddy headers docs', () => {
  assert.ok(existsSync('docs/HEADERS.md'), 'docs/HEADERS.md present (#00460)');
  const headersDoc = readFileSync('docs/HEADERS.md', 'utf8');
  assert.match(headersDoc, /Strict-Transport-Security/, 'docs cover HSTS (#00460)');
  assert.match(headersDoc, /Cross-Origin-Opener-Policy/, 'docs cover COOP (#00460)');
  assert.match(headersDoc, /Cross-Origin-Resource-Policy/, 'docs cover CORP (#00460)');
  assert.match(headersDoc, /dokku caddy:labels:add/, 'docs include the dokku label commands (#00460)');
});

test('slide image assets exist', () => {
  for (const s of slides.slides) {
    if (!s.image) continue;
    const path = s.image.replace(/^\//, '');
    assert.ok(existsSync(path), `slide image ${path} exists`);
  }
});

test('manifest icon assets exist', () => {
  for (const icon of manifest.icons) {
    const path = icon.src.replace(/^\//, '');
    assert.ok(existsSync(path), `icon ${path} exists`);
  }
});

// #00485 — Dockerfile snapshots the deck under /srv/old with absolute paths rewritten
// to /old/* so the root slot can be replaced by the next deck without breaking history.
test('Dockerfile builds self-contained /old snapshot', () => {
  const df = readFileSync('Dockerfile', 'utf8');
  assert.match(df, /mkdir -p \/srv\/old/, 'creates /srv/old');
  assert.match(df, /\/old\/assets\//, 'rewrites /assets/ → /old/assets/');
  assert.match(df, /\/old\/css\//, 'rewrites /css/ → /old/css/');
  assert.match(df, /\/old\/js\//, 'rewrites /js/ → /old/js/');
  assert.match(df, /\/old\/data\//, 'rewrites /data/ → /old/data/');
  assert.match(df, /\/old\/manifest\.webmanifest/, 'rewrites /manifest.webmanifest → /old/manifest.webmanifest');
  assert.match(df, /\/old\/data\/slides\.json/, 'rewrites fetch path in js/app.js to /old/data/slides.json');
});

// #00490 — /old/ SEO hygiene: robots.txt Disallow + noindex meta in snapshot index.html.
test('/old/ SEO hygiene — robots Disallow + Dockerfile noindex inject', () => {
  const robots = readFileSync('robots.txt', 'utf8');
  assert.match(robots, /Disallow:\s*\/old\//, 'robots.txt disallows /old/');
  const df = readFileSync('Dockerfile', 'utf8');
  assert.match(df, /name="robots" content="noindex,nofollow"/, 'Dockerfile injects noindex meta into /srv/old/index.html');
  assert.match(df, /\/srv\/old\/index\.html/, 'Dockerfile noindex inject targets /srv/old/index.html');
});

// v0.9.0 — v2 deck links external /v2/styles.css + /v2/deck.js (strict CSP).
test('v0.9.0 — v2 deck file links external /v2/* assets, no inline JS+CSS', () => {
  assert.ok(existsSync('index.v2.html'), 'index.v2.html present');
  const v2 = readFileSync('index.v2.html', 'utf8');
  assert.match(v2, /<html\b[^>]*lang="sk"/, 'v2 lang="sk"');
  assert.match(v2, /<title>[^<]*SRcore[^<]*<\/title>/, 'v2 title mentions SRcore');
  assert.match(v2, /<link\s+rel="stylesheet"\s+href="\/v2\/styles\.css">/, 'v2 links /v2/styles.css');
  assert.match(v2, /<script\s+src="\/v2\/deck\.js"\s+defer><\/script>/, 'v2 loads /v2/deck.js with defer');
  assert.doesNotMatch(v2, /<style[^>]*>[\s\S]*?<\/style>/, 'no inline <style> block');
  assert.doesNotMatch(v2, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]+?<\/script>/, 'no inline executable <script> body');
  assert.doesNotMatch(v2, /\sstyle="/, 'no inline style="" attribute');
  assert.doesNotMatch(v2, /\son\w+=["']/, 'no inline on*= handler');
  assert.doesNotMatch(v2, /javascript:/, 'no javascript: URL');

  assert.ok(existsSync('v2/styles.css'), 'v2/styles.css present');
  assert.ok(existsSync('v2/deck.js'), 'v2/deck.js present');
  const v2css = readFileSync('v2/styles.css', 'utf8');
  const v2js = readFileSync('v2/deck.js', 'utf8');
  assert.ok(v2css.length > 1000, 'v2/styles.css non-trivial');
  assert.ok(v2js.length > 1000, 'v2/deck.js non-trivial');
  assert.doesNotMatch(v2js, /createElement\(\s*['"]style['"]\s*\)/, 'v2/deck.js does not inject inline <style>');

  const df = readFileSync('Dockerfile', 'utf8');
  assert.match(df, /COPY index\.v2\.html \/srv\/index\.html/, 'Dockerfile copies v2 over /srv/index.html');
  assert.match(df, /COPY screens\/ \/srv\/screens\//, 'Dockerfile copies screens/');
  assert.match(df, /COPY v2\/ \/srv\/v2\//, 'Dockerfile copies v2/');
});

// v0.8.0 — 10 PNG screen captures referenced by v2 slides.
test('v0.8.0 — screens/*.png present', () => {
  const required = [
    'screens/dashboard.png',
    'screens/tasks.png',
    'screens/task-detail.png',
    'screens/task-edit.png',
    'screens/projects.png',
    'screens/project-detail.png',
    'screens/categories.png',
    'screens/models.png',
    'screens/settings.png',
    'screens/more.png',
  ];
  for (const p of required) {
    assert.ok(existsSync(p), `${p} exists`);
  }
});
