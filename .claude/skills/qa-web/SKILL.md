---
name: qa-web
description: Standardized Playwright QA crawl for web apps — mobile (iPhone, Android), tablet, and desktop (Chrome, Firefox, Safari). Generates a Playwright test script, runs it across the full device matrix, checks every page for JS errors, broken images, horizontal overflow, and tap target sizes, then outputs a structured bug report ready to paste into ClickUp. Use this skill whenever the user asks to run a QA test, do a crawl, check a site on mobile/desktop, test a website, or run playwright tests against a live URL.
---

# QA Web Crawl Skill

Runs a consistent, repeatable QA crawl across a fixed device matrix. Always follow these steps in order.

---

## Step 1 — Ask Which Sites to Test

Before anything else, ask:

> "Which site(s) should I test this run?"
> - sexystreamers.com (member site + app.sexystreamers.com streamer app)
> - jackpotstreamers.com
> - Both

Also confirm credentials if not already provided. The known credentials are:
- sexystreamers member: member@sexystreamers.com / P@ssw0rd123
- sexystreamers streamer: performer@sexystreamers.com / berrysecur3p4ssw0rd123!xdlol
- jackpotstreamers member: member@sexystreamers.com / myteam22

If the user confirms to use the stored credentials, use them. If they want to use different ones, ask.

---

## Step 2 — Confirm Scope

Before writing any code, present this scope table to the user and ask them to confirm (or adjust):

**In scope:**

| Area | Pages |
|---|---|
| Logged-out (member site) | Homepage, Performer listing, Performer profile, Registration, Login, Password reset, Footer/static pages (Terms, Privacy, Contact, Support, Anti-slavery policy etc.), Streamer signup |
| Logged-in member | Dashboard, Performer filters (All · Favorites · Live Now · Upcoming · VIP Room · New · Trending), Performer profile (logged-in), Messaging UI, Token packages, Account settings, Support form, All nav links |
| Logged-in streamer (app subdomain, if applicable) | Login, Dashboard, Profile, Shows, Messaging, Clients, Finance, Account settings, All nav links |

**Permanently out of scope (impossible to automate):**
- Active livestream interactions (tipping panel, stream specials) — needs live stream
- Real payments / real transactions / withdrawals
- Email delivery verification
- Server-side events

**Check each run — may now be built:**
- KYC flow — was 404 previously, attempt it and report whether it exists now
- Token purchase 3DS page — navigate to purchase flow and check if it renders (don't complete payment)
- Post-email-verification streamer onboarding — check if the flow is accessible after login
- Any other page that returned 404 last run — always retry, note "now available" or "still 404"

**Checks run on every page:**
- JS console errors
- Broken images / failed network requests
- Horizontal overflow (`scrollWidth > clientWidth`)
- Tap target size on mobile (interactive elements < 44px height or width flagged)
- Page loads without crash or redirect loop

Ask: "Does this scope look right, or anything to add/remove before I generate the script?"

---

## Step 2 — Device Matrix

Always use this exact matrix. Do not deviate unless the user explicitly asks.

```javascript
const DEVICES = [
  {
    name: 'iPhone 14 Pro',
    viewport: { width: 393, height: 852 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
    browserType: 'webkit',
  },
  {
    name: 'Samsung Galaxy S23',
    viewport: { width: 360, height: 780 },
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    isMobile: true,
    hasTouch: true,
    browserType: 'chromium',
  },
  {
    name: 'iPad',
    viewport: { width: 820, height: 1180 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: false,
    hasTouch: true,
    browserType: 'webkit',
  },
  {
    name: 'Desktop Chrome',
    viewport: { width: 1440, height: 900 },
    userAgent: '',
    isMobile: false,
    hasTouch: false,
    browserType: 'chromium',
  },
  {
    name: 'Desktop Firefox',
    viewport: { width: 1440, height: 900 },
    userAgent: '',
    isMobile: false,
    hasTouch: false,
    browserType: 'firefox',
  },
  {
    name: 'Desktop Safari',
    viewport: { width: 1440, height: 900 },
    userAgent: '',
    isMobile: false,
    hasTouch: false,
    browserType: 'webkit',
  },
];
```

---

## Step 3 — Confirm and Generate the Playwright Script

Write the script to `/tmp/qa_crawl.js`. Structure it as follows:

### Script architecture

```
1. Define DEVICES (above)
2. Define PAGES_LOGGED_OUT — array of { label, path }
3. Define PAGES_LOGGED_IN_MEMBER — array of { label, path }
4. Define PAGES_LOGGED_IN_STREAMER — array of { label, path } (if streamer app included)
5. Define helper: runChecks(page, deviceName, label, isMobile) → returns findings[]
6. Define helper: loginMember(page, credentials) — see login note below
7. Main loop: for each device → run logged-out pages → run logged-in pages
8. Write results to /tmp/qa_results.json
9. Print summary to stdout
```

### runChecks helper

Every page must run these checks and collect findings:

```javascript
async function runChecks(page, deviceName, label, isMobile) {
  const findings = [];

  // 1. JS console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 2. Broken images / failed requests
  const failedRequests = [];
  page.on('requestfailed', req => {
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)/.test(req.url())) {
      failedRequests.push(req.url());
    }
  });

  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  // 3. Horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  // 4. Tap targets (mobile only)
  let smallTargets = [];
  if (isMobile) {
    smallTargets = await page.evaluate(() => {
      const interactive = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
      const small = [];
      interactive.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
          small.push({
            tag: el.tagName,
            text: (el.innerText || el.value || el.placeholder || '').slice(0, 50),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      });
      return small.slice(0, 20); // cap at 20 to avoid noise
    });
  }

  // Compile findings
  if (consoleErrors.length > 0) {
    findings.push({ severity: 'HIGH', type: 'JS Error', detail: consoleErrors.slice(0, 5).join(' | ') });
  }
  if (failedRequests.length > 0) {
    findings.push({ severity: 'MEDIUM', type: 'Broken Images', detail: `${failedRequests.length} failed: ${failedRequests.slice(0, 3).join(', ')}` });
  }
  if (hasOverflow) {
    findings.push({ severity: 'MEDIUM', type: 'Horizontal Overflow', detail: 'Page scrolls horizontally' });
  }
  if (smallTargets.length > 0) {
    findings.push({ severity: 'LOW', type: 'Small Tap Targets', detail: `${smallTargets.length} elements below 44px: ${smallTargets.slice(0, 3).map(t => `${t.tag} "${t.text}" (${t.width}×${t.height}px)`).join(', ')}` });
  }

  return findings;
}
```

### Login note — reCAPTCHA

The login flow uses reCAPTCHA. The script should:
1. Navigate to the login page
2. Fill in email + password
3. **Pause and prompt the user** to solve the reCAPTCHA manually:
   ```javascript
   console.log('\n⏸  MANUAL ACTION REQUIRED: Solve reCAPTCHA in the browser window, then press Enter here...');
   await new Promise(resolve => process.stdin.once('data', resolve));
   ```
4. Then click submit and verify login succeeded

This matches the approach used in previous test sessions (Tailscale VNC).

---

## Step 4 — Run the Script

```bash
cd /tmp && node qa_crawl.js
```

If Playwright is not installed:
```bash
npm install -g playwright && npx playwright install
```

Run with `--headed` so the user can see the browser and handle reCAPTCHA:
```bash
PWHEADLESS=false node /tmp/qa_crawl.js
```

---

## Step 5 — Format Bug Report for ClickUp

After the run completes, read `/tmp/qa_results.json` and produce a bug report using this format for each unique issue found:

### Bug report format

For each bug, output a block the user can copy into ClickUp:

```
---
TITLE: [SEVERITY] [Page/Area] — [Short description]
TAGS: bug, playwright, [sexystreamers|jackpotstreamers], [frontend|backend|ux], [device names affected]
SEVERITY: HIGH / MEDIUM / LOW

DEVICES AFFECTED:
- [list devices where this was observed]

HOW TO REPRODUCE:
1. Open [URL] on [device]
2. [steps]
3. Observe: [what happens]

EXPECTED:
[what should happen]

ACTUAL:
[what actually happens]
---
```

### Deduplication rule

If the same issue appears on multiple devices, create **one bug** that lists all affected devices — do not create one bug per device. For example, "JS error on every page" is one bug with `DEVICES AFFECTED: all 6 devices`.

### Severity guide

| Severity | Criteria |
|---|---|
| HIGH | Crashes, JS errors on every page, broken core functionality, WebSocket failures |
| MEDIUM | Broken images, horizontal overflow, non-functional forms |
| LOW | Tap targets too small, minor visual issues, wrong brand content |

---

## Step 6 — Save Report

After generating the bug report, save a markdown copy to the project's qa-reports directory:

```
/Users/olawallin/Apps/streamers/qa-reports/qa_report_YYYY-MM-DD.md
```

Use today's date in the filename. The report should include all sections: summary table, full bug details, 404 status, fixed issues, and coverage notes. This creates a permanent record of every test run.

---

## Step 7 — Summary

End with a summary table:

```
TOTAL BUGS FOUND: X
  HIGH:   X
  MEDIUM: X
  LOW:    X

DEVICES TESTED: iPhone 14 Pro · Samsung Galaxy S23 · iPad · Desktop Chrome · Desktop Firefox · Desktop Safari
PAGES TESTED:   X logged-out · X logged-in member · X logged-in streamer
```

---

## Arguments / Options

The skill always asks which site(s) to test interactively. Optional overrides the user can specify upfront:
- `skip_streamer` — skip the streamer app (app subdomain) entirely
- `skip_logged_in` — run logged-out pages only (faster, no reCAPTCHA needed)
- `logged_in_only` — skip logged-out crawl, jump straight to logged-in flows

If credentials are not confirmed or provided, skip the corresponding logged-in flow and note it in the report.
