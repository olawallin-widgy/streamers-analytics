# Analytics Master — Update Protocol

**File:** `analytics-master.html`  
**Amplitude project:** 100043044 (Sexy Streamers) — EU endpoint  
**Live URL:** https://olawallin-widgy.github.io/streamers-analytics/analytics-master.html  

---

## When Ola says "update the analytics doc"

Follow these steps in order. Never skip step 1.

---

## Step 1 — Verify in Amplitude before touching the HTML

Before changing any status badge, always confirm the current state live in Amplitude using the MCP tools.

### For each event being reviewed:

| Check | Tool | What to look for |
|---|---|---|
| Does the event exist and fire? | `get_events` or `query_chart` | Volume in last 30 days — if 0 or missing, it's ❌ Missing |
| Are the expected properties present? | `get_properties` on the event | Each property must exist and have the correct type |
| Are property values populated correctly? | `query_dataset` with a sample | Check for nulls, wrong types (string vs number), bad values |
| Is the volume plausible? | `query_chart` | Cross-check against known numbers in the doc |

### Property type rules (verified facts — do not guess):
- `amount` on Tip Sent → **number** ✓
- `token_amount` and `price_usd` on all Token Purchase events → **string** ⚠️ (bug — should be number)
- `streamer_id` on most events → **number** ✓
- `user_id` on Registration/Login Completed → **NOT SET** (gp: prefix bug)

---

## Step 2 — Status badge rules

Every Business Questions item and every Implementation table row must use exactly one status. Never guess — only assign based on what is verified in Amplitude.

### Business Questions (`.qdot` + `.qtag`)

| Status | CSS | Meaning | When to use |
|---|---|---|---|
| Yes | `.qdot.yes` / `.qtag.yes` | Answerable right now in Amplitude | Event fires, all required properties present and correct type |
| Partial | `.qdot.part` / `.qtag.part` | Some data exists but incomplete | Event fires but a property is missing, wrong type, or requires workaround |
| Gap | `.qdot.no` / `.qtag.no` | Not tracked at all | Event missing OR required property missing that blocks the question entirely |
| Future | `.qdot.future` / `.qtag.future` | Feature not built yet | The product feature itself doesn't exist yet |

### Implementation table (`.badge`)

| Badge | CSS | When to use |
|---|---|---|
| In Plan | `.badge.ok` | Event in Amplitude schema, fires correctly |
| Issue | `.badge.warn` | Event fires but has a schema problem (wrong type, missing property, naming bug) |
| Missing | `.badge.miss` | Event not in Amplitude at all |
| Undocumented | `.badge.pend` | Event fires but is not in the tracking plan schema |
| Remove | `.badge.dep` | Deprecated event that should be removed from code |
| ⏳ Pending | `.badge.pend` | Planned but not yet implemented (e.g. KYC, Finance) |

### Property badges (`.prop`)

| Badge | CSS | When to use |
|---|---|---|
| Blue-grey | `.prop.ok` | Property exists and is correct |
| Red | `.prop.miss` | Property missing — always show as `property_name ❌` |
| Amber | `.prop.warn` | Property exists but wrong type or value — show as `property_name (description) ⚠` |
| Light grey | `.prop.extra` | Undocumented extra property — show as `property_name +` |

---

## Step 3 — HTML structure rules (never break these)

### Panel structure — every panel must follow this exact pattern:
```html
<div class="panel" id="p-[name]">
  <div class="toggle-row">
    <div><div class="panel-title">...</div><div class="panel-sub">...</div></div>
    <div class="toggle-pills">
      <button class="tpill on" onclick="tgl(this,'[bq-id]','[impl-id]')">Business Questions</button>
      <button class="tpill" onclick="tgl(this,'[impl-id]','[bq-id]')">Implementation</button>
    </div>
  </div>                          ← MUST close toggle-row here
  <div id="[bq-id]">             ← Business Questions div (no display:none)
    ...
  </div>                          ← MUST close BQ div here
  <div id="[impl-id]" style="display:none">  ← Implementation div
    ...
  </div>
</div>                            ← closes panel
```

**Critical:** If toggle-row is not closed before the BQ div, the BQ div nests inside the flex container and all other tabs break. Always count opening/closing `<div>` tags when editing.

### BQ sections must match Implementation sections

Every `<div class="sec">` in the BQ tab must have a matching `<div class="ev-sec">` in the Implementation tab with the same heading. If a BQ section has 3 headings, Implementation must also have 3 headings.

### Implementation table — always 5 columns, always in this order:
```
Event | 30d | Status | Properties | Action needed
```
CSS: `table-layout: fixed` with widths: 24% / 6% / 11% / 32% / 27%

Never use 4-column tables. If a section has nothing to put in Action needed, use `—`.

### Missing properties go IN the events table row — never in a separate section:
```html
<span class="prop miss">property_name ❌</span>
```

### Missing events get a table row with `.en.miss` class:
```html
<tr><td class="en miss">Event Name</td><td class="vol z">—</td><td><span class="badge miss">Missing</span></td>...
```

---

## Step 4 — What to update when event volumes change

When 30-day volumes change (e.g. a new month of data), update:
1. The volume in every `<td class="vol">` in the Implementation tables
2. Any `qnote` text that quotes a specific number (e.g. "540 started → 145 completed")
3. The conversion rates in Casino & FTD qnotes (viewers→outclicks %, etc.)

Do NOT update volumes without re-verifying them in Amplitude first.

---

## Step 5 — What to update when dev ships a fix

When a dev fix is confirmed shipped (e.g. user_id fixed, property type corrected):

1. Change the `.prop.miss` or `.prop.warn` badge to `.prop.ok` on the relevant event rows
2. Update the BQ status: if the fix unblocks a Gap question, change `.qdot.no` → `.qdot.yes` or `.qdot.part`
3. Remove the action note from the Action needed column if nothing remains to fix
4. Change the table row badge from `.badge.warn` to `.badge.ok` if all issues on that event are resolved
5. Re-verify in Amplitude that the fix is actually live before making any of the above changes

---

## Step 6 — Adding a new event

1. First confirm the event fires in Amplitude (`get_events` or `query_chart`)
2. Add a row to the correct Implementation section table
3. Verify all properties live in Amplitude — add `.prop.ok` for confirmed, `.prop.miss` for missing
4. Add or update the corresponding BQ question(s) with the correct status
5. If the event answers a question that was Gap, change it to Yes or Partial

---

## Client vs Server events

Every event row in the HTML shows a small badge — `client` (blue) or `server` (green).

### Server-side events (fired from backend, not the browser):
| Event | Why server-side |
|---|---|
| FTD Completed | Postback from casino affiliate network |
| KYC Started / Step Completed / Completed / Failed | KYROS webhook integration |
| Identity Verified | Server confirmation from KYC provider |
| Withdrawal Requested / Completed | Finance backend |
| Bank Details Saved | Finance backend |

### Everything else is client-side (fired from browser JavaScript).

When dev ships a new event, ask: *does the trigger happen in the browser (button click, page load, user action) or on the server (webhook, database write, external callback)?* Server events must use the Amplitude HTTP API or a server-side SDK, not the browser SDK.

---

## Amplitude-verified facts (do not re-verify unless told otherwise)

These were confirmed live from Amplitude on 2026-04-27/28 and are ground truth:

### Event volumes (30 days):
Registration Started: 540 · Registration Completed: 145 · Registration Failed: 174  
Login Submitted: 337 · Login Completed: 261 · Login Failed: 95  
Stream Joined: 1,020 · Stream Left: 568 · Stream Started: 40 · Stream Ended: 51  
Token Purchase Started: 24 · Token Package Selected: 104 · Token Purchase Completed: 7 · Token Purchase Failed: 6  
Tip Panel Opened: 431 · Tip Sent: 111  
Casino Outclick: 169 · FTD Completed: 2  
Performer Filter Applied: 3,387 · Performer Profile Viewed: 936  
StreamSpecial Triggered: 52 (undocumented) · Screen Orientation Changed: 52 (undocumented)  
Streamer Registration Started: 52 · Streamer Login Completed: 70  

### Confirmed missing events (not in Amplitude at all):
Email Verified · Streamer Email Verified · Show Deleted · Tip Template Deleted · Referral Link Copied · Chat Disabled

### Confirmed property issues (dev fixes pending):
- `token_amount` and `price_usd` on Token Purchase events → strings, should be numbers
- `user_id` on Registration/Login Completed → not set (gp: prefix bug)
- `streamer_id` on Streamer Login Completed → missing
- `partner` on Casino Outclick → should be renamed to `operator_id`
- StreamSpecial Triggered → naming bug (missing space), meaning unconfirmed

---

## Panel IDs and BQ/Impl div pairs

| Panel | Panel ID | BQ div | Impl div |
|---|---|---|---|
| Overview | p-overview | — | — |
| Traffic | p-traffic | tq | ti |
| Member Auth | p-auth | aq | ai |
| Performer Discovery | p-discovery | dq | di |
| Stream Engagement | p-streams | stq | sti |
| Token Purchase | p-tokens | tkq | tki |
| Tips & Casino | p-tips | tipq | tipi |
| Retention | p-retention | rq | ri |
| Streamer Auth | p-s-auth | saq | sai |
| KYC | p-s-kyc | kyq | kyi |
| Account Setup | p-s-account | acq2 | aci2 |
| Stream Prep | p-s-shows | shq | shi |
| Streamer Performance | p-s-perf | spq | spi |
| Streamer Finance | p-s-finance | sfq | sfi |
