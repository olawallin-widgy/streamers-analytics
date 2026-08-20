# QA scripts — feist.tv (jackpotstreamers.com)

Playwright crawlers used for the QA runs. Reports land in `../qa-reports/`.

## Setup (once, per machine)
```bash
cd qa-scripts
npm init -y && npm install playwright@1.62.1
npx playwright install chromium firefox webkit
```

## Scripts
- **qa_crawl.js** — full 6-device matrix. Auto-discovers all pages (recursive BFS), logged-out + logged-in member. One manual reCAPTCHA login: it opens a headed Chrome with member creds pre-filled, then pauses waiting for the signal file `/tmp/qa_continue` (touch it once you've logged in). Session is saved to `/tmp/qa_state.json` and reused across all 6 devices. Writes `/tmp/qa_results.json`.
- **brand_scan.js** — scans every page for leftover "Jackpot" text (rebrand check). Writes `/tmp/qa/brand_results.json`.
- **iphone_deep.js** — iPhone 14 Pro (WebKit) deep-dive: full-page screenshots + detailed diagnostics (overflow culprits, failed requests, tap-target detail). Writes screenshots to `/tmp/qa/iphone_shots/`.

## Run
```bash
node qa_crawl.js > /tmp/qa/qa_run.log 2>&1   # then: touch /tmp/qa_continue after login
node brand_scan.js
node iphone_deep.js
```

## TODO for the next (comprehensive) run
- Extend for the **streamer app** (app subdomain) — login + dashboard/profile/shows/messaging/clients/finance/settings.
- Add a **live-stream member-UX** pass focused on **FTDs + outclicks** (no token buy/spend flow live yet).
- Diff results against `qa-reports/qa_report_2026-08-20.md` (baseline) → fixed / still-broken / new.
