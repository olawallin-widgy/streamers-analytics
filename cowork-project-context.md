# Streamers Analytics — Project Context for Claude Cowork

## Who I am
Ola Wallin. I work on growth and analytics for two streaming platforms: **sexystreamers.com** and **jackpotstreamers.com** (both same codebase, separate Amplitude projects). I use Claude to build Amplitude dashboards, plan analytics, and manage growth work.

---

## The team
- **Ramon** — CEO, very hands-on operationally. Runs live stream sessions himself (including 3am). Currently data-blind during live events — no viewer counts, no banner CTR, no deposit visibility. Analytics is a top-tier priority for him.
- **Jamie** — Developer / technical lead. Built the Attio CRM integration.
- **Justin** — Developer. Currently overwhelmed.
- **Stefan, Angela, Terrance** — Streamer recruiters at conferences.
- **Björn** — Leadership/partner. Asks operational questions like "how many members deposited today."

---

## Amplitude setup
- **Project in use:** Sexy Streamers — project ID `100043044`, EU endpoint
- **Two sites, two Amplitude projects** (one per site — no platform property needed)
- **Critical blocker:** `user_id` is not yet implemented by devs. Expected fix: ~2026-05-05. This blocks all member-level funnels and retention analysis.
- **Amplitude URL base:** `https://app.eu.amplitude.com/analytics/streamingsystems-288712/`

---

## What we've built so far (as of 2026-05-01)

### Analytics Master HTML (`/Apps/streamers/analytics-master.html`)
A local analytics plan and tracking reference dashboard. **All 13 tabs verified and complete.**
- Tab structure: Overview · Members AARRR (Auth, Retention, Performer Discovery, Token Purchase, Stream Engagement, Stream Monetization) · Streamers AARRR (Auth, Engagement, Performance, Finance)
- Contains a Stakeholder Input panel for Ramon/Björn questions
- Shows every event, tracking status, missing properties, and implementation gaps
- Design: Outfit font, business-questions-only goals, red property badges inline in event rows

### Amplitude Dashboards built

| Dashboard | Amplitude ID | Status |
|---|---|---|
| Business Dashboard | `e-f2z9qgrv` | Built, unpublished |
| Members — ① Acquisition | `e-v58197wl` | Built, unpublished |
| Members — ② Activation | `e-m2uy91lh` | Built, unpublished |
| Members — ③ Revenue | — | Planned, not built |
| Members — ④ Retention | — | Not started |
| Streamers AARRR | — | Not started |

### Business Dashboard structure
13 rows: Numbers (Sessions, Members, Streamers, Joins, Active Streams) → Revenue (Token Purchases, Tips, Casino Outclicks, FTDs) → Members Conversion Rates → Streamers Conversion Rates. Several slots are rich-text placeholders blocked on dev fixes.

---

## How we work on dashboards

**The HTML file is the source of truth.** Before building any dashboard, read `analytics-master.html` to understand what questions each tab covers, what events exist, and what's blocked. Dashboard sections and order must match the HTML tab structure exactly.

### Always 3 steps

1. **Pre-build plan** — present a `Question → Chart → Type` table grouped by section, matching HTML file order. Placeholders inline with blocking reason in the Type column. Wait for Ola's confirmation before building anything.
2. **Build** — use `get_events` to verify real event names first (never guess). Create all charts, then create the dashboard and add all rows (section headers, live charts, placeholders) in one shot.
3. **Post-build summary** — present the same Question → Chart → Type table again as a record of what was actually built. This is what Ola reviews to verify the dashboard without opening Amplitude mid-session.

### Table format

| Question | Chart | Type |
|---|---|---|
| Business question the chart answers | `ACQ — Chart Title` | Chart type + key config |
| Blocked question | Placeholder | Blocked: `property_name` on `Event Name` |

### Chart naming
Prefix with AARRR step: `ACQ —`, `ACT —`, `REV —`, `RET —`

### Chart type rules
- **AARRR dashboards:** trends, not cumulative
- **Business Dashboard KPI cards only:** cumulative
- **Funnels:** `OVER_TIME` weekly, trendline default (not KPI view)

### Chart reuse
Before creating a chart that already exists elsewhere (e.g. casino funnel charts from Business Dashboard), reuse the existing chartId — don't recreate.

### Placeholder format (exact markdown for rich text cards)
```
**⏳ Chart title**

*Placeholder — blocked*

Business question this would answer?

Needs `property_name` on `Event Name`. Brief reason.

→ Dev fix expected: YYYY-MM-DD
```

### After every build — manual UI steps required (can't be done via API)
- KPI cards: toggle **cumulative on** in Amplitude UI
- Funnel charts: switch to **trendline view** in Amplitude UI (default is KPI view)

### Layout rules
- All rows: 375px height
- Section headers: full-width (w12) rich text rows
- Placeholders: same width and slot position as the live chart would occupy

---

## Key technical patterns (Amplitude API)

- **Sessions:** use `event_type: "_all"` + `countGroup: "Session"` — NOT `[Amplitude] Session Start` (doesn't exist in this project)
- **User properties in groupBy:** `gp:initial_utm_source` (needs the `gp:` prefix), `country`, `device_type`, `device`
- **Device split:** use segments, not groupBy — Mobile (Android + iPhone), Tablet (iPad), Desktop (Mac OS X + Windows + Linux)
- **groupBy format:** `{"type": "user", "value": "<definition>"}` for user properties

---

## Outstanding dev fixes (expected ~2026-05-05)

| Fix | What it unlocks |
|---|---|
| `user_id` on reg/login events | All member funnels show real %; Registered→Paying and Payers Who Return placeholders → real charts |
| `utm_source` event prop on Reg Completed | Per-channel conversion rate placeholder → real chart |
| `referrer_streamer_id` on Reg Completed | Streamer referral attribution → real chart |
| `amount_usd` on Tip Sent | Tip Revenue USD card |
| `price_usd` type fix (string → number) | Token Revenue USD card |
| `streamer_id` on FTD Completed | FTD Revenue USD card |
| `Withdrawal Requested/Completed` events built | Withdrawal placeholder cards → real charts |

### Other missing events (no fix date yet)
Email Verified, Spin Wheel events, KYC events (KYROS integration)

---

## Next dashboards to build (in order)
1. **Members — ③ Revenue** — Tokens section (funnel, packages, source, country) + Tips & Casino section
2. **Members — ④ Retention**
3. **Streamers AARRR**

---

## Stakeholder panel workflow (for the HTML file)
When adding Ramon/Björn questions to `analytics-master.html`: update the **Stakeholder panel first** → wait for Ola approval → only then propagate to the content tabs and implementation tables.

---

## Verified event volumes (30d, reference baseline 2026-04-27)
Registration Started: 540 · Registration Completed: 145 · Login Completed: 261
Stream Joined: 1,020 · Stream Started: 40 · Stream Ended: 51
Tip Panel Opened: 431 · Tip Sent: 111 · Casino Outclick: 169 · FTD Completed: 2
Token Purchase Started: 24 · Token Purchase Completed: 7
Streamer Registration Started: 52 · Streamer Registration Completed: 15
Go Live Clicked: 34 · StreamSpecial Triggered: 52 · Performer Followed: 118

---

## Other project context
- Growth roadmap: Jira JPD project STR (29 items, STR-1–STR-29)
- CRM: Attio (conference recruiter form → Attio, built by Jamie)
- QA: Playwright crawls, reports saved to `/Apps/streamers/qa-reports/`
- Token packages: 70/$10 · 175/$25 · 350/$50 · 700/$100 · 1050/$150 · 1400/$200
