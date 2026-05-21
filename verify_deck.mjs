// Visual sanity check — log every 404 with the URL.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'https://presentation.sardonicrepulsion.com';
const OUT = '/tmp/deck-screens';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();

const requests404 = [];
page.on('response', r => {
  if (r.status() === 404) requests404.push(`${r.status()} ${r.url()}`);
});

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('#counter');
const total = Number((await page.locator('#counter').textContent()).split('/')[1].trim());
console.log(`total slides: ${total}`);

for (let i = 0; i < total; i++) {
  await page.waitForTimeout(400);
  const buf = await page.screenshot({ fullPage: false });
  writeFileSync(`${OUT}/slide-${String(i + 1).padStart(2, '0')}.png`, buf);
  console.log(`slide ${i + 1}: ${await page.locator('#slide-title').textContent()}`);
  if (i < total - 1) await page.keyboard.press('ArrowRight');
}

console.log(`\n404s: ${requests404.length}`);
requests404.forEach(u => console.log('  ' + u));
await browser.close();
