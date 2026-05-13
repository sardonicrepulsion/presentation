import { test, expect } from '@playwright/test';

// v2 deck has a ~380ms animation gate (goToSlide bails when state.isAnimating
// is true). Tests that click rapidly will be eaten by the gate — give the
// animation a chance to finish before issuing the next interaction.
const ANIM_SETTLE_MS = 450;

test('deck loads, first slide renders + counter shows N/M', async ({ page }) => {
  const cspViolations = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && /Content Security Policy|Refused/.test(msg.text())) {
      cspViolations.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/SRcore/);
  await expect(page.locator('#slideTitle')).not.toHaveText('');
  await expect(page.locator('#slideBullets li').first()).toBeVisible();

  const counter = page.locator('#counter');
  await expect(counter).toHaveText(/^\d+\s*\/\s*\d+$/);

  expect(cspViolations, 'no CSP violations on initial load').toEqual([]);
});

test('keyboard navigation advances slide content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#counter')).toHaveText(/^1\s*\/\s*\d+$/);

  const firstTitle = await page.locator('#slideTitle').textContent();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#counter')).toHaveText(/^2\s*\/\s*\d+$/);
  const secondTitle = await page.locator('#slideTitle').textContent();
  expect(secondTitle).not.toBe(firstTitle);

  // Wait for the fade animation to settle so the next interaction is not
  // dropped by the goToSlide isAnimating guard.
  await page.waitForTimeout(ANIM_SETTLE_MS);

  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#counter')).toHaveText(/^1\s*\/\s*\d+$/);
});

test('End jumps to last slide', async ({ page }) => {
  await page.goto('/');
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(/^1\s*\/\s*(\d+)$/);
  const total = Number((await counter.textContent()).split('/')[1].trim());
  expect(total).toBeGreaterThan(0);

  await page.keyboard.press('End');
  await expect(counter).toHaveText(new RegExp(`^${total}\\s*/\\s*${total}$`));
});

test('CSP header is present + healthz/version JSON', async ({ request }) => {
  const r = await request.get('/');
  const csp = r.headers()['content-security-policy'] || '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  // v0.8.0 — v2 single-file deck needs inline; followup #644 restores strict CSP.
  expect(csp).not.toContain("'unsafe-eval'");

  const h = await request.get('/healthz');
  expect(h.status()).toBe(200);
  expect(await h.json()).toMatchObject({ status: 'ok' });

  const v = await request.get('/version');
  expect(v.status()).toBe(200);
  const vj = await v.json();
  expect(vj).toMatchObject({ app: 'presentation' });
  expect(vj.version).toMatch(/^\d+\.\d+\.\d+$/);
});

test('/old/ snapshot still serves previous deck', async ({ request, page }) => {
  const r = await request.get('/old/');
  expect(r.status()).toBe(200);
  const body = await r.text();
  expect(body).toMatch(/noindex,nofollow/);

  await page.goto('/old/');
  await expect(page.locator('#slide-title')).not.toHaveText('');
});

test('/screens/dashboard.png served', async ({ request }) => {
  const r = await request.get('/screens/dashboard.png');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-type']).toMatch(/image\/png/);
});
