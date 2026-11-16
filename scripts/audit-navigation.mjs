import { chromium } from 'playwright';

const base = process.env.WANDERWRAP_AUDIT_URL || 'http://127.0.0.1:3000';
const routes = ['/', '/gift-finder', '/teams', '/account', '/wishlist', '/connections', '/dashboard', '/simulator', '/sign-in', '/privacy', '/cookies', '/terms', '/gift-ideas/birthdays'];
const viewports = [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }];
const browser = await chromium.launch({ headless: true });
const failures = [];
const discoveredLinks = new Set();
for (const viewport of viewports) {
  const page = await browser.newPage({ viewportSize: viewport });
  page.on('pageerror', error => failures.push(`${viewport.name}: browser error: ${error.message}`));
  for (const route of routes) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    const reject = page.getByRole('button', { name: 'Reject optional' });
    if (await reject.isVisible().catch(() => false)) await reject.click();
    if (!response || response.status() >= 400) failures.push(`${viewport.name}: ${route} returned ${response?.status() || 'no response'}`);
    const audit = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, brand: document.querySelector('.siteWordmark')?.textContent?.trim(), giftFinder: document.querySelector('a[href="/gift-finder"]') !== null, accountMenu: document.querySelector('.accountMenuButton') !== null }));
    if (audit.overflow > 1) failures.push(`${viewport.name}: ${route} overflows by ${audit.overflow}px`);
    if (audit.brand !== 'WanderWrap') failures.push(`${viewport.name}: ${route} is missing the shared WanderWrap brand`);
    if (!audit.giftFinder || !audit.accountMenu) failures.push(`${viewport.name}: ${route} is missing primary navigation`);
    if (viewport.name === 'desktop') for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(anchor => anchor.getAttribute('href')))) if (href?.startsWith('/') && !href.startsWith('/api/') && !href.startsWith('//')) discoveredLinks.add(href.split('#')[0]);
  }
  await page.goto(`${base}/gift-finder`, { waitUntil: 'networkidle' });
  await page.route('**/api/auth/session', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authenticated: true, user: { displayName: 'Navigation Tester', handle: 'navigation-tester#test' } }) }));
  await page.reload({ waitUntil: 'networkidle' });
  if ((await page.locator('.accountNameLink').getAttribute('href')) !== '/account') failures.push(`${viewport.name}: signed-in name does not link to the account page`);
  await page.locator('.accountMenuButton').click();
  if (!(await page.locator('#wanderwrap-menu').isVisible())) failures.push(`${viewport.name}: account menu did not open`);
  if ((await page.locator('.drawerIdentity').getAttribute('href')) !== '/account') failures.push(`${viewport.name}: drawer identity does not link to the account page`);
  await page.keyboard.press('Escape');
  if (await page.locator('#wanderwrap-menu').isVisible().catch(() => false)) failures.push(`${viewport.name}: account menu did not close with Escape`);
  await page.close();
}
await browser.close();
for (const href of discoveredLinks) {
  const response = await fetch(new URL(href, base), { redirect: 'manual' });
  if (response.status >= 400) failures.push(`internal link ${href} returned ${response.status}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Navigation audit passed for ${routes.length} routes at desktop and mobile widths and ${discoveredLinks.size} internal links.`);
