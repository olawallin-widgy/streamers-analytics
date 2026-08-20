// Brand-leak scan — find leftover "Jackpot" branding (rebrand to feist.tv).
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'https://jackpotstreamers.com';
const STATE = '/tmp/qa_state.json';
const OLD_RE = /jackpot\s*streamers|jackpotstreamers|jackpot/i;

// Union of discovered logged-out + member pages.
const PAGES = Array.from(new Set([
  '/', '/affiliate-responsible-gaming', '/anti-slavery-policy', '/become-a-model', '/casino-offers',
  '/contact', '/copyright_dmca_policy', '/demo-games', '/dmca_notice', '/gdpr-privacy-policy', '/kyc',
  '/login', '/password/reset', '/performer/chaser', '/performer/silvermoon', '/performer/tdog',
  '/performers', '/privacy', '/privacy_cookie_policy', '/refund_policy', '/register', '/streamers',
  '/support', '/terms', '/terms-of-service',
  '/account', '/dashboard', '/messages', '/settings', '/tokens', '/tokens/purchase',
]));

function snippets(text, re) {
  const out = []; const low = text.toLowerCase(); let i = 0;
  while ((i = low.indexOf('jackpot', i)) !== -1 && out.length < 8) {
    out.push(text.slice(Math.max(0, i - 30), i + 40).replace(/\s+/g, ' ').trim());
    i += 7;
  }
  return out;
}

(async () => {
  const haveState = fs.existsSync(STATE);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext(haveState ? { storageState: STATE } : {});
  const results = [];
  for (const p of PAGES) {
    const page = await ctx.newPage();
    let hit = null;
    try {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      const data = await page.evaluate(() => ({
        title: document.title || '',
        text: document.body ? document.body.innerText : '',
        metas: Array.from(document.querySelectorAll('meta[content]')).map((m) => (m.getAttribute('name') || m.getAttribute('property') || '') + '=' + m.getAttribute('content')).join(' | '),
        imgAlts: Array.from(document.querySelectorAll('img[alt]')).map((im) => im.getAttribute('alt')).join(' | '),
      }));
      const inTitle = OLD_RE.test(data.title);
      const inText = OLD_RE.test(data.text);
      const inMeta = OLD_RE.test(data.metas);
      const inAlt = OLD_RE.test(data.imgAlts);
      const feistPresent = /feist/i.test(data.title + ' ' + data.text + ' ' + data.metas);
      if (inTitle || inText || inMeta || inAlt) {
        hit = { path: p, title: data.title.slice(0, 80), inTitle, inText, inMeta, inAlt, feistPresent, samples: snippets(data.text) };
      }
    } catch (e) { hit = { path: p, error: e.message.slice(0, 100) }; }
    if (hit) results.push(hit);
    console.log(`[brand] ${p} → ${hit ? (hit.error ? 'ERR ' + hit.error : 'JACKPOT FOUND' + (hit.inTitle ? ' (title)' : '') + (hit.inMeta ? ' (meta)' : '')) : 'clean'}`);
    await page.close();
  }
  fs.writeFileSync('/tmp/qa/brand_results.json', JSON.stringify(results, null, 2));
  console.log(`\nBRAND SCAN DONE. ${results.length} pages still reference "Jackpot". → /tmp/qa/brand_results.json`);
  await ctx.close(); await browser.close();
})();
