// QA crawl — jackpotstreamers.com — member site (logged-out + logged-in member)
// Auto-discovers EVERY internal page via recursive BFS. One manual reCAPTCHA login, session reused across all devices.
const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');

const BASE = 'https://jackpotstreamers.com';
const HOST = 'jackpotstreamers.com';
const CREDS = { email: 'member@sexystreamers.com', password: 'myteam22' };
const MAX_DISCOVER = 120;
const STATE = '/tmp/qa_state.json';
const SIGNAL = '/tmp/qa_continue';   // Claude touches this when the user says login is done
const ABORT = '/tmp/qa_abort';       // touch to skip the login wait entirely

const DEVICES = [
  { name: 'iPhone 14 Pro', viewport: { width: 393, height: 852 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', isMobile: true, hasTouch: true, browserType: 'webkit' },
  { name: 'Samsung Galaxy S23', viewport: { width: 360, height: 780 }, userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', isMobile: true, hasTouch: true, browserType: 'chromium' },
  { name: 'iPad', viewport: { width: 820, height: 1180 }, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', isMobile: false, hasTouch: true, browserType: 'webkit' },
  { name: 'Desktop Chrome', viewport: { width: 1440, height: 900 }, userAgent: '', isMobile: false, hasTouch: false, browserType: 'chromium' },
  { name: 'Desktop Firefox', viewport: { width: 1440, height: 900 }, userAgent: '', isMobile: false, hasTouch: false, browserType: 'firefox' },
  { name: 'Desktop Safari', viewport: { width: 1440, height: 900 }, userAgent: '', isMobile: false, hasTouch: false, browserType: 'webkit' },
];

const SEED_LOGGED_OUT = ['/', '/performers', '/register', '/login', '/password/reset', '/terms', '/privacy', '/contact', '/support', '/become-a-model', '/kyc'];
const SEED_MEMBER = ['/dashboard', '/performers', '/messages', '/tokens', '/tokens/purchase', '/account', '/support'];

const IMG_RE = /\.(png|jpg|jpeg|gif|svg|webp|ico)(\?|$)/i;
const SKIP_RE = /\.(pdf|zip|dmg|exe|mp4|mp3|csv|xlsx?)($|\?)/i;
const results = [];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForSignal() {
  process.stdout.write('   >>> Paused. Waiting for Claude to release (touch ' + SIGNAL + ') …\n');
  while (!fs.existsSync(SIGNAL) && !fs.existsSync(ABORT)) await sleep(1500);
  const aborted = fs.existsSync(ABORT);
  try { fs.existsSync(SIGNAL) && fs.unlinkSync(SIGNAL); } catch (e) {}
  return !aborted;
}

function normalizeHref(h) {
  if (!h) return null;
  if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript')) return null;
  if (h.startsWith('http')) { if (!h.includes(HOST)) return null; h = h.replace(/^https?:\/\/[^/]+/, ''); }
  if (!h.startsWith('/')) return null;
  h = h.split('#')[0].replace(/\/$/, '') || '/';
  if (SKIP_RE.test(h)) return null;
  return h;
}

async function crawlSite(context, seeds, label) {
  const found = new Set(); const queue = [];
  for (const s of seeds) { const n = normalizeHref(s) || s; if (!found.has(n)) { found.add(n); queue.push(n); } }
  const visited = new Set();
  while (queue.length && visited.size < MAX_DISCOVER) {
    const path = queue.shift(); if (visited.has(path)) continue; visited.add(path);
    const page = await context.newPage();
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const hrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')));
      for (const raw of hrefs) { const n = normalizeHref(raw); if (n && !found.has(n)) { found.add(n); queue.push(n); } }
    } catch (e) {}
    await page.close();
  }
  const list = Array.from(found).sort();
  console.log(`  [discover:${label}] ${list.length} pages${visited.size >= MAX_DISCOVER ? ' (hit cap)' : ''}`);
  return list;
}

async function visitPage(context, path, label, dev) {
  const url = path.startsWith('http') ? path : BASE + path;
  const page = await context.newPage();
  const consoleErrors = [], failedImages = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', (r) => { if (IMG_RE.test(r.url())) failedImages.push(r.url()); });
  page.on('response', (r) => { if (IMG_RE.test(r.url()) && r.status() >= 400) failedImages.push(`${r.status()} ${r.url()}`); });

  const findings = []; let httpStatus = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    httpStatus = resp ? resp.status() : null;
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  } catch (e) { findings.push({ severity: 'HIGH', type: 'Navigation Error', detail: e.message.slice(0, 160) }); }

  const is404 = httpStatus === 404 || await page.evaluate(() => /404|not found|page.{0,3}not.{0,3}exist/i.test(document.body ? document.body.innerText.slice(0, 400) : '')).catch(() => false);
  const redirectedToLogin = /\/login/.test(page.url()) && !/\/login/.test(url);

  let hasOverflow = false, smallTargets = [];
  try {
    hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    if (dev.isMobile || dev.hasTouch) {
      smallTargets = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll('a, button, input, select, textarea, [role="button"]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) out.push({ tag: el.tagName, text: (el.innerText || el.value || el.placeholder || '').slice(0, 40), width: Math.round(r.width), height: Math.round(r.height) });
        });
        return out.slice(0, 20);
      });
    }
  } catch (e) {}

  if (consoleErrors.length) findings.push({ severity: 'HIGH', type: 'JS Error', detail: consoleErrors.slice(0, 5).join(' | ').slice(0, 300) });
  if (failedImages.length) findings.push({ severity: 'MEDIUM', type: 'Broken Images', detail: `${failedImages.length} failed: ${failedImages.slice(0, 3).join(', ').slice(0, 240)}` });
  if (hasOverflow) findings.push({ severity: 'MEDIUM', type: 'Horizontal Overflow', detail: 'Page scrolls horizontally' });
  if (redirectedToLogin) findings.push({ severity: 'INFO', type: 'Redirected to login', detail: 'Session not recognized on this device' });
  if (smallTargets.length) findings.push({ severity: 'LOW', type: 'Small Tap Targets', detail: `${smallTargets.length} < 44px: ${smallTargets.slice(0, 3).map((t) => `${t.tag} "${t.text}" (${t.width}x${t.height})`).join(', ')}` });

  results.push({ device: dev.name, label, path, url, httpStatus, is404, findings });
  console.log(`    [${dev.name}] ${label} (${httpStatus ?? '—'}) → ${is404 ? '404' : (findings.length ? findings.map((f) => f.type).join('+') : 'ok')}`);
  await page.close();
}

// One-time manual login → save storage state for reuse across all devices.
async function loginOnce() {
  console.log('\n=== MANUAL LOGIN (one time) ===');
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.fill('input[type="email"], input[name="email"], input[autocomplete="username"], input[name="username"]', CREDS.email, { timeout: 8000 }).catch(() => {});
  await page.fill('input[type="password"], input[name="password"]', CREDS.password, { timeout: 8000 }).catch(() => {});
  console.log('   A Chrome window is open with credentials pre-filled on the login page.');
  console.log('   → Solve the reCAPTCHA, click Login, and wait until you see the member dashboard.');
  const proceed = await waitForSignal();
  let ok = false;
  if (proceed) {
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    ok = !/\/login/.test(page.url());
    if (ok) { await ctx.storageState({ path: STATE }); console.log('   ✅ Logged in — session saved (' + page.url() + ')'); }
    else console.log('   ⚠️  Still on /login — login not completed. Proceeding logged-out only.');
  } else console.log('   ⏭  Login skipped by request. Proceeding logged-out only.');
  await ctx.close(); await browser.close();
  return ok;
}

async function runDevice(dev, loggedOutPages, memberPages, haveSession) {
  const launcher = dev.browserType === 'firefox' ? firefox : dev.browserType === 'webkit' ? webkit : chromium;
  const browser = await launcher.launch({ headless: true });
  const base = { viewport: dev.viewport, hasTouch: dev.hasTouch, isMobile: dev.browserType === 'chromium' ? dev.isMobile : false };
  if (dev.userAgent) base.userAgent = dev.userAgent;

  console.log(`\n=== ${dev.name} (${dev.browserType}) ===`);
  const outCtx = await browser.newContext(base);
  console.log(`  -- logged-out (${loggedOutPages.length} pages) --`);
  for (const p of loggedOutPages) await visitPage(outCtx, p, p === '/' ? 'Homepage' : p, dev);
  await outCtx.close();

  if (haveSession && memberPages.length) {
    const inCtx = await browser.newContext({ ...base, storageState: STATE });
    console.log(`  -- logged-in member (${memberPages.length} pages) --`);
    for (const p of memberPages) await visitPage(inCtx, p, 'Member: ' + p, dev);
    await inCtx.close();
  }
  await browser.close();
}

(async () => {
  for (const f of [SIGNAL, ABORT]) { try { fs.existsSync(f) && fs.unlinkSync(f); } catch (e) {} }
  console.log('QA crawl — jackpotstreamers.com');

  console.log('\nStep 1/4 — discover logged-out pages (recursive crawl)…');
  const db = await chromium.launch({ headless: true });
  const dctx = await db.newContext();
  const loggedOutPages = await crawlSite(dctx, SEED_LOGGED_OUT, 'logged-out');
  await dctx.close(); await db.close();
  console.log('Logged-out pages:\n  ' + loggedOutPages.join('\n  '));

  console.log('\nStep 2/4 — one-time manual login…');
  const haveSession = await loginOnce();

  let memberPages = [];
  if (haveSession) {
    console.log('\nStep 3/4 — discover logged-in member pages…');
    const mb = await chromium.launch({ headless: true });
    const mctx = await mb.newContext({ storageState: STATE });
    memberPages = await crawlSite(mctx, SEED_MEMBER, 'member');
    await mctx.close(); await mb.close();
    console.log('Member pages:\n  ' + memberPages.join('\n  '));
  }

  console.log('\nStep 4/4 — crawl all 6 devices…');
  for (const dev of DEVICES) {
    try { await runDevice(dev, loggedOutPages, memberPages, haveSession); } catch (e) { console.log(`Device ${dev.name} crashed: ${e.message}`); }
  }

  fs.writeFileSync('/tmp/qa_results.json', JSON.stringify(results, null, 2));
  const total = results.reduce((n, r) => n + r.findings.length, 0);
  console.log(`\nDONE. ${results.length} page-visits, ${total} findings. Results → /tmp/qa_results.json`);
})();
