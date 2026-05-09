import { test, expect } from '@playwright/test';

test('deck loads, first slide renders + counter shows 1/N', async ({ page }) => {
  const cspViolations = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && /Content Security Policy|Trusted Types|Refused/.test(msg.text())) {
      cspViolations.push(msg.text());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/Presentation/);
  await expect(page.locator('#slide-title')).not.toHaveText(/Loading/);
  await expect(page.locator('#slide-title')).not.toHaveText('');
  await expect(page.locator('#slide-bullets li').first()).toBeVisible();

  const counter = page.locator('#counter');
  await expect(counter).toHaveText(/^1\s*\/\s*\d+$/);

  expect(cspViolations, 'no CSP/Trusted Types violations on initial load').toEqual([]);
});

test('arrow keys + nav buttons advance counter + slide content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#counter')).toHaveText(/^1\s*\/\s*\d+$/);

  const firstTitle = await page.locator('#slide-title').textContent();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#counter')).toHaveText(/^2\s*\/\s*\d+$/);
  const secondTitle = await page.locator('#slide-title').textContent();
  expect(secondTitle).not.toBe(firstTitle);

  await page.locator('#prev').click();
  await expect(page.locator('#counter')).toHaveText(/^1\s*\/\s*\d+$/);
  await expect(page.locator('#slide-title')).toHaveText(firstTitle);

  await page.locator('#next').click();
  await expect(page.locator('#counter')).toHaveText(/^2\s*\/\s*\d+$/);
});

test('Home / End jump to first / last slide', async ({ page }) => {
  await page.goto('/');
  const counter = page.locator('#counter');
  await expect(counter).toHaveText(/^1\s*\/\s*(\d+)$/);
  const total = Number((await counter.textContent()).split('/')[1].trim());
  expect(total).toBeGreaterThan(0);

  await page.keyboard.press('End');
  await expect(counter).toHaveText(new RegExp(`^${total}\\s*/\\s*${total}$`));

  await page.keyboard.press('Home');
  await expect(counter).toHaveText(new RegExp(`^1\\s*/\\s*${total}$`));
});

test('CSP header is strict + healthz/version JSON', async ({ request }) => {
  const r = await request.get('/');
  const csp = r.headers()['content-security-policy'] || '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("style-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("require-trusted-types-for 'script'");
  expect(csp).toContain('trusted-types presentation-template');
  expect(csp).not.toContain("'unsafe-inline'");
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
