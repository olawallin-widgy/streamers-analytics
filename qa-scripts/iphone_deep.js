// iPhone 14 Pro (WebKit) deep-dive — full-page screenshots + detailed diagnostics.
const { webkit } = require('playwright');
const fs = require('fs');

const BASE = 'https://jackpotstreamers.com';
const STATE = '/tmp/qa_state.json';
const OUT = '/tmp/qa/iphone_shots';
fs.mkdirSync(OUT, { recursive: true });

const DEV = {
  viewport: { width: 393, height: 852 },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  isMobile: true, hasTouch: true, deviceScaleFactor: 3,
};

// [path, needsAuth]
const PAGES = [
  ['/', false], ['/login', false], ['/register', false], ['/become-a-model', false],
  ['/casino-offers', false], ['/demo-games', false], ['/streamers', false], ['/contact', false], ['/support', false],
  ['/dashboard', true], ['/performers', true], ['/performer/silvermoon', true],
  ['/messages', true], ['/tokens', true], ['/tokens/purchase', true], ['/account', true], ['/settings', true],
];

function slug(p) { return p === '/' ? 'home' : p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''); }

async function diag(page, path, authed) {
  const consoleErrors = []; const failed = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText || 'fail'} ${r.url().slice(0, 90)}`));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`HTTP ${r.status()} ${r.url().slice(0, 90)}`); });

  let status = null;
  try { const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30000 }); status = res && res.status(); await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {}); }
  catch (e) { consoleErrors.push('NAV: ' + e.message.slice(0, 120)); }

  const info = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const overflowEls = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > docW + 2) overflowEls.push({ tag: el.tagName, cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 40), right: Math.round(r.right), text: (el.innerText || '').slice(0, 30) });
    });
    const small = [];
    document.querySelectorAll('a, button, input, select, textarea, [role="button"]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) small.push({ tag: el.tagName, text: (el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || '').slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
    });
    return {
      title: document.title,
      scrollW: document.documentElement.scrollWidth, clientW: docW,
      bodyText: (document.body ? document.body.innerText : '').replace(/\s+/g, ' ').slice(0, 160),
      overflowEls: overflowEls.slice(0, 8),
      smallCount: small.length, smallSample: small.slice(0, 8),
    };
  }).catch((e) => ({ error: e.message }));

  const file = `${OUT}/${slug(path)}${authed ? '_auth' : ''}.png`;
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  return { path, authed, status, consoleErrors: consoleErrors.slice(0, 6), failed: [...new Set(failed)].slice(0, 8), overflow: info.scrollW > info.clientW + 2, ...info, file };
}

(async () => {
  const haveState = fs.existsSync(STATE);
  const browser = await webkit.launch({ headless: true });
  const results = [];
  for (const [path, needsAuth] of PAGES) {
    const ctx = await browser.newContext(needsAuth && haveState ? { ...DEV, storageState: STATE } : DEV);
    const page = await ctx.newPage();
    const r = await diag(page, path, needsAuth && haveState);
    results.push(r);
    console.log(`[${r.status}] ${path}${r.authed ? ' (auth)' : ''} | overflow=${r.overflow} scrollW=${r.scrollW} | small=${r.smallCount} | jsErr=${r.consoleErrors.length} | failed=${r.failed.length}`);
    if (r.consoleErrors.length) console.log('      JS: ' + r.consoleErrors[0].slice(0, 150));
    if (r.overflow && r.overflowEls && r.overflowEls.length) console.log('      OVERFLOW culprit: ' + JSON.stringify(r.overflowEls[0]));
    await ctx.close();
  }
  fs.writeFileSync('/tmp/qa/iphone_results.json', JSON.stringify(results, null, 2));
  console.log('\nSaved screenshots → ' + OUT + '  | data → /tmp/qa/iphone_results.json');
  await browser.close();
})();
