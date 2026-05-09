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
});

test('version.json shape', () => {
  assert.equal(versionJson.app, 'presentation');
  assert.match(versionJson.classification, /^[a-z]+\/[a-z]+\/[a-z]+$/);
});

test('Caddyfile has strict CSP', () => {
  assert.ok(caddy.includes('Content-Security-Policy'), 'CSP header present');
  assert.doesNotMatch(caddy, /'unsafe-inline'/, "CSP must not allow 'unsafe-inline'");
  assert.doesNotMatch(caddy, /'unsafe-eval'/, "CSP must not allow 'unsafe-eval'");
  assert.doesNotMatch(caddy, /script-src[^;]*\bhttps:[^a-z]/, 'script-src must not have https: wildcard');
  assert.doesNotMatch(caddy, /img-src[^;]*\bhttps:[^a-z]/, 'img-src must not have https: wildcard');
  assert.ok(caddy.includes("require-trusted-types-for 'script'"), 'Trusted Types required');
  assert.ok(caddy.includes('trusted-types presentation-template'), 'Trusted Types policy named');
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

test('app.json has healthcheck', () => {
  assert.ok(Array.isArray(appJson.healthchecks?.web));
  assert.ok(appJson.healthchecks.web.length >= 1);
});

test('index.html has no inline style/script', () => {
  assert.doesNotMatch(indexHtml, /<style[^>]*>/, 'no inline <style>');
  assert.doesNotMatch(indexHtml, /\sstyle="/, 'no inline style="" attribute');
  assert.doesNotMatch(indexHtml, /\son\w+=["']/, 'no inline on*= handlers');
  assert.doesNotMatch(indexHtml, /<script(?![^>]*\bsrc=)[^>]*>[\s\S]+?<\/script>/, 'no inline <script> body');
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
  assert.equal(manifest.name, 'Presentation');
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
  }
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
