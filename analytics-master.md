# Analytics Master Overview — Sexy Streamers
*Last updated: 2026-04-27 | Source: ClickUp spec + Amplitude audit*

**Legend**
- ✅ Confirmed working
- ❌ Missing / not implemented
- ⚠️ Issue (naming bug, schema missing, partial)
- 🔲 Not verified yet
- — Not applicable

**Columns**
- **In Amplitude** = event exists and has fired in last 30 days (or confirmed in event list)
- **Properties** = key properties the event should carry (from spec)
- **Props verified** = have we confirmed the properties are actually populated correctly
- **In Admin** = visible in site admin panel *(to be filled)*
- **Should be in Admin** = our assessment *(to be filled)*

---

## USER PROPERTIES (set on every logged-in session)

| Property | Specified | Verified in Amplitude | Notes |
|---|---|---|---|
| user_id | ✅ | ❌ NOT SET | **Blocker** — without this, Marketing/Product dashboard filters don't work and device breakdown is unreliable |
| user_type | ✅ | 🔲 | "member" or "streamer" |
| username | ✅ | 🔲 | |
| device_type | ✅ | 🔲 | "mobile" or "desktop" — Ramon needs this |
| token_balance | ✅ | 🔲 | Members only |

---

## MEMBER AUTH

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Registration Started | — | ✅ | — | 🔲 | | | |
| Registration Field Completed | — | ✅ | field: username/email/password | 🔲 | | | |
| Age Verification Checked | — | ✅ | — | 🔲 | | | |
| Registration Submitted | — | ✅ | — | 🔲 | | | |
| Registration Completed | 144 | ✅ | user_id, username | 🔲 | | | user_id likely not populated (see above) |
| Registration Failed | — | ✅ | error_type | 🔲 | | | |
| Email Verification Resent | — | ✅ | — | 🔲 | | | |
| Login Submitted | — | ✅ | — | 🔲 | | | |
| Login Completed | 257 | ✅ | user_id, username, token_balance | 🔲 | | | user_id likely not populated |
| Login Failed | — | ✅ | error_type: "invalid_credentials" | 🔲 | | | |
| Password Reset Requested | — | ✅ | — | 🔲 | | | |
| Password Reset Completed | — | ⚠️ | user_id | 🔲 | | | Not added to schema |
| Logout | — | ✅ | — | 🔲 | | | |
| ~~User LoggedIn~~ | — | ⚠️ | — | — | | | **Old duplicate event — should be hidden/removed. Conflicts with Login Completed** |

---

## STREAMER AUTH

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Streamer Registration Started | — | ✅ | — | 🔲 | | | |
| Streamer Registration Submitted | — | ✅ | — | 🔲 | | | |
| Streamer Registration Completed | — | ✅ | streamer_id, username | 🔲 | | | |
| Streamer Registration Failed | — | ✅ | error_type | 🔲 | | | |
| Streamer Email Verification Resent | — | ✅ | — | 🔲 | | | |
| Streamer Login Submitted | — | ✅ | — | 🔲 | | | |
| Streamer Login Completed | — | ✅ | streamer_id, username, total_balance | 🔲 | | | |
| Streamer Login Failed | — | ✅ | error_type | 🔲 | | | |
| Streamer Logout | — | ✅ | — | 🔲 | | | |

---

## KYC — MEMBERS

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| KYC Started | — | ❌ | — | — | | | Pending KYROS integration |
| KYC Step Completed | — | ❌ | step_name, step_number | — | | | Pending KYROS integration |
| KYC Completed | — | ❌ | user_id | — | | | Pending KYROS integration |
| KYC Failed | — | ❌ | user_id, failure_reason | — | | | Pending KYROS integration |

---

## TOKEN PURCHASE — MEMBERS
*Ramon: "how many tried to deposit and failed"*

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Token Purchase Started | 24 | ✅ | source, current_balance | 🔲 | | | |
| Token Package Selected | — | ✅ | token_amount, price_usd | 🔲 | | | |
| Token Purchase Submitted | — | ✅ | token_amount, price_usd | 🔲 | | | |
| Token Purchase Completed | 7 | ⚠️ | token_amount, price_usd, new_balance | 🔲 | | | Not in schema. 24 started → only 13 outcomes (7 completed + 6 failed) = **11 missing** |
| Token Purchase Failed | 6 | ⚠️ | failure_reason | 🔲 | | | Not in schema |

---

## STREAM VIEWING — MEMBERS
*Ramon: "how many viewers per stream"*

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Stream Joined | 1,016 | ✅ | stream_id, streamer_name, streamer_id | 🔲 | | | Good volume — viewers are being tracked |
| Stream Left | — | ✅ | stream_id, streamer_name, streamer_id, duration_seconds | 🔲 | | | |
| Performer Followed | — | ✅ | streamer_name, streamer_id, action | 🔲 | | | |

---

## TIPPING — MEMBERS

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Tip Panel Opened | — | ✅ | context, streamer_name, streamer_id | 🔲 | | | |
| Tip Sent | 111 | ✅ | amount, tip_type, streamer_name, streamer_id, remaining_balance, context | 🔲 | | | |
| Stream Special Triggered | — | ⚠️ | special_name, cost, streamer_name, streamer_id | 🔲 | | | **Naming bug: saved as "StreamSpecial Triggered" (no space) — fix needed** |

---

## MEMBER MESSAGING

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Conversation Opened | — | ✅ | performer_name, streamer_id | 🔲 | | | |
| Message Sent | — | ✅ | performer_name, streamer_id, message_length | 🔲 | | | |

---

## PERFORMER DISCOVERY — MEMBERS

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Performer Filter Applied | — | ✅ | filter (all/favorites/live_now/upcoming/vip_room/new/trending) | 🔲 | | | |
| Performer Profile Viewed | — | ✅ | performer_name, streamer_id | 🔲 | | | |

---

## STREAMER — GO LIVE
*Ramon: "how many viewers per stream" → unique_viewer_count on Stream Ended*

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Go Live Clicked | — | ✅ | streamer_id, streamer_name | 🔲 | | | |
| Stream Started | 40 | ✅ | streamer_id, streamer_name | 🔲 | | | |
| Stream Ended | 51 | ✅ | streamer_id, streamer_name, duration_seconds, total_tips_received, **unique_viewer_count** | 🔲 | | | Key for Ramon. 51 > 40 because some sessions started before 30d window |

---

## STREAMER — SHOWS

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Show Scheduled | — | ⚠️ | streamer_id, show_date | 🔲 | | | Not in schema |
| Show Cancelled | — | ⚠️ | streamer_id, show_id | 🔲 | | | Not in schema |
| Show Deleted | — | ❌ | streamer_id, show_id | — | | | Marked implemented in ClickUp — missing from Amplitude |
| Tip Template Created | — | ⚠️ | streamer_id, action_count | 🔲 | | | Not in schema |
| Tip Template Edited | — | ⚠️ | streamer_id | 🔲 | | | Not in schema |
| Tip Template Deleted | — | ❌ | streamer_id | — | | | Marked implemented in ClickUp — missing from Amplitude |

---

## STREAMER — FINANCE

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Withdrawal Requested | — | ❌ | streamer_id, amount, currency | — | | | Marked pending in ClickUp |
| Withdrawal Completed | — | ❌ | streamer_id, amount, currency | — | | | Marked pending in ClickUp |
| Bank Details Saved | — | ❌ | streamer_id, method (iban/paxum/cosmo) | — | | | Marked pending in ClickUp |
| VIP Room Price Set | — | ❌ | streamer_id, price_tokens, price_usd | — | | | Marked pending in ClickUp |

---

## STREAMER — ACCOUNT SETUP

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Identity Verification Submitted | — | ✅ | streamer_id | 🔲 | | | |
| Identity Verified | — | ✅ | streamer_id | 🔲 | | | |
| Consent Form Viewed | — | ✅ | streamer_id | 🔲 | | | |
| Terms Viewed | — | ⚠️ | streamer_id | 🔲 | | | Not in schema |
| Streamer Profile Updated | — | ✅ | streamer_id, fields_updated | 🔲 | | | |
| Gallery Media Uploaded | — | ⚠️ | streamer_id, media_type | 🔲 | | | Not in schema |
| Referral Link Copied | — | ❌ | streamer_id | — | | | Marked implemented in ClickUp — missing from Amplitude |

---

## STREAMER — MESSAGING

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Streamer Conversation Opened | — | ✅ | member_name, member_id | 🔲 | | | |
| Streamer Message Sent | — | ✅ | member_name, member_id, message_length | 🔲 | | | |
| Chat Disabled | — | ❌ | streamer_id, member_id | — | | | Marked implemented in ClickUp — missing from Amplitude |

---

## CASINO OUTCLICKS — MEMBERS
*Ramon: "how many clicked the banner and didn't go through" — partially answered here*

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| Casino Outclick | 169 | ⚠️ | casino_name, operator_id, affiliate_link, bonus_offer, cta_text, source, streamer_id | 🔲 | | | Was marked "pending" in ClickUp but IS firing. Not in schema. |

---

## FTD — SERVER-SIDE
*Ramon: "honest and test proof answer that post backs work"*

| Event | 30d Volume | In Amplitude | Properties (spec) | Props verified | In Admin | Should be in Admin | Notes |
|---|---|---|---|---|---|---|---|
| FTD Completed | 2 | ⚠️ | user_id, member_username, operator_name, operator_id, affiliate_link, amount, currency, transaction_id | 🔲 | | | Was marked "pending" in ClickUp but IS firing. Not in schema. Very low volume — verify these are real, not test events. |

---

## RAMON'S PAIN POINTS — SUMMARY

| Ramon's question | Where the answer lives | Status |
|---|---|---|
| How many viewers per stream | `Stream Ended` → unique_viewer_count | ✅ In Amplitude — **not verified properties are populated** |
| How many tried to deposit and failed | `Token Purchase Started` vs `Completed` + `Failed` | ⚠️ Partial — 11 purchases have no outcome event |
| Do postbacks work | `FTD Completed` | ⚠️ Fires (2 events) — verify these are real |
| How many clicked banner but didn't convert | `Casino Outclick` exists but doesn't tell us if they deposited after | ⚠️ Partial — needs FTD linkage |
| What device do users use | `device_type` user property | ❌ Blocked on user_id not being set |
| Broken links | QA issue — /tokens, /account 404 | ❌ Dev fix needed, not analytics |

---

## UNDOCUMENTED / CLEANUP NEEDED

| Event | Issue |
|---|---|
| `User LoggedIn` | Old event, duplicate of `Login Completed`. Should be hidden in Amplitude. |
| `StreamSpecial Triggered` | Naming mismatch — spec says `Stream Special Triggered` (with space). Inconsistent. |
| `Screen Orientation Changed` | Not in spec, undocumented. Assess whether to keep or remove. |
| 10 events not in schema | Token Purchase Completed/Failed, Casino Outclick, FTD Completed, Password Reset Completed, Show Scheduled/Cancelled, Tip Template Created/Edited, Gallery Media Uploaded, Terms Viewed, Gallery Media Uploaded |

---

## JACKPOT STREAMERS

| Status | Detail |
|---|---|
| Custom events | ❌ Zero — completely untracked |
| Auto-capture | ✅ Running (page views, clicks, sessions) |
| Action needed | All custom events from this spec need to be implemented for Jackpot too |
