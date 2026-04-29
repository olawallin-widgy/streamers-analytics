# Session Notes — 2026-04-29 (Verification)

## What we did

Full end-to-end Amplitude verification of every implementation table row across all tabs in analytics-master.html. Every custom event property queried live against Amplitude project 100043044. All 10 active tabs now marked verified (green ✓).

---

## Verification method

Used `mcp__Amplitude__get_properties` to query every custom event in every implementation tab. Compared Amplitude's live schema against what the doc claimed. Applied corrections where wrong.

---

## Corrections applied

### Password Reset Completed (Member Auth)
- Doc claimed `user_id ✓` — Amplitude returns `totalCount: 0` (no custom properties at all)
- Fixed: removed `user_id`, changed to `—`

### Conversation Opened (Stream Engagement)
- Missing from doc: `performer_name` — in Amplitude schema (isInSchema: true)
- Fixed: added `performer_name +` (.prop.extra)

### Message Sent (Stream Engagement)
- Missing from doc: `performer_name` — in Amplitude schema
- Fixed: added `performer_name +` (.prop.extra)

### Tip Panel Opened (Tips & Casino + Streamer Performance)
- Missing from doc: `streamer_name` — in Amplitude schema
- Fixed: added `streamer_name +` (.prop.extra) in both occurrences

### StreamSpecial Triggered (Stream Engagement + Tips & Casino)
- Missing from doc: `streamer_name` — in Amplitude schema
- Fixed: added `streamer_name +` (.prop.extra) in both occurrences

### Casino Outclick (Tips & Casino)
- `partner` was shown as `.prop.extra` (undocumented) — it IS planned, just wrong name. Changed to `.prop.warn`
- Missing: `bonus_offer` — in Amplitude schema, not planned. Added as `.prop.extra`
- Added `operator_id ❌` missing property

### Casino Outclick (Streamer Performance)
- `partner` was `.prop.extra` — changed to `.prop.warn`
- Added `operator_id ❌` missing property

### Casino Outclick (Streamer Retention)
- Added `operator_id ❌` missing property

### Tip Sent (Streamer Retention)
- `tip_type`, `remaining_balance`, `context` were all marked `.prop.extra` (undocumented) — all three ARE in Amplitude schema as planned properties
- Fixed: changed all three to `.prop.ok`

### Tip Sent (Streamer Performance)
- `context` was missing entirely — it IS in the Amplitude schema
- `streamer_name` was missing — in schema as extra
- Fixed: added `context ✓` (.prop.ok) and `streamer_name +` (.prop.extra)

### Gap legend dot
- The auto-injected JavaScript legend rendered "Gap" with a grey dot (hardcoded `#e5e7eb`)
- The `.qdot.no` CSS was already red (#ef4444) but the legend bypassed it
- Fixed: updated inline style in JS legend builder to `#ef4444`

---

## New properties discovered in Amplitude (not previously in doc)

| Property | Event | Status |
|---|---|---|
| `performer_name` | Conversation Opened | isInSchema: true |
| `performer_name` | Message Sent | isInSchema: true |
| `streamer_name` | Tip Panel Opened | isInSchema: true |
| `streamer_name` | Tip Sent | isInSchema: true |
| `streamer_name` | StreamSpecial Triggered | isInSchema: true |
| `bonus_offer` | Casino Outclick | isInSchema: true |

---

## Events confirmed with 0 custom properties (Amplitude returns empty)

- Password Reset Completed — no custom properties
- Streamer Registration Started — no custom properties
- Streamer Registration Submitted — no custom properties
- Streamer Login Submitted — no custom properties

These are all correctly shown as `—` in the doc.

---

## Tab verification status (final)

| Tab | Status |
|---|---|
| Traffic | ✅ Amplitude native only — no custom events to verify |
| Member Auth | ✅ Verified |
| Performer Discovery | ✅ Verified |
| Stream Engagement | ✅ Verified |
| Token Purchase | ✅ Verified |
| Tips & Casino | ✅ Verified |
| Member Retention | ✅ Verified |
| Streamer Registration | ✅ Verified |
| Streamer Engagement | ✅ Verified |
| Streamer Performance | ✅ Verified |
| Streamer Retention | ✅ Verified |
| Streamer Finance | ✅ All events pending — nothing to verify |

---

## Outstanding issues for dev (complete list)

### Type / naming fixes
1. Token Purchase Completed — `token_amount` + `price_usd` as strings (should be numbers)
2. Token Package Selected — `token_amount` + `price_usd` as strings
3. Token Purchase Submitted — `token_amount` + `price_usd` as strings
4. Casino Outclick — `partner` must be renamed to `operator_id`
5. Streamer Login Completed — `token_balance` must be renamed to `total_balance`

### Missing properties to add
6. Registration Completed — `user_id`, `utm_source`, `referrer_streamer_id`
7. Login Completed — `user_id`
8. Performer Followed — `stream_id`
9. Conversation Opened — `stream_id`
10. Message Sent — `stream_id`
11. StreamSpecial Triggered — `stream_id` (confirm event meaning with dev first)
12. Stream Joined — `orientation` (horizontal/vertical at join time)
13. Token Purchase Started — `stream_id` (when source = liveshow)
14. Tip Panel Opened — `stream_id`
15. Tip Sent — `stream_id`, `amount_usd`
16. Casino Outclick — `stream_id`, `operator_id` (after rename)
17. FTD Completed — `user_id`, `streamer_id`, `stream_id`, `transaction_id`, `source`
18. Stream Ended — add `unique_viewer_count` to schema (fires but isInSchema: false, type: any); add `total_tips_usd`
19. Streamer Registration Completed — `streamer_id`
20. Streamer Registration Failed — replace generic `error_type` with specific values
21. Streamer Login Completed — `streamer_id`
22. Streamer Profile Updated — `profile_completeness_pct`
23. Gallery Media Uploaded — `total_media_count`

### Missing events to implement
24. Email Verified (member)
25. Streamer Signup Page Viewed
26. Streamer Email Verified
27. Registration Step Completed — personal_data (streamer wizard step)
28. Show Deleted
29. Tip Template Deleted
30. Chat Disabled
31. Referral Link Copied
32. Withdrawal Failed (not in plan — needs adding)
33. Spin Wheel Enabled
34. Spin Wheel Action Triggered

### Pending events (awaiting integrations)
35–38. KYC Started / Step Completed / Completed / Failed (KYROS integration)
39. Withdrawal Requested
40. Withdrawal Completed
41. Bank Details Saved

---

## Next step

Stakeholder feedback from Ramon and Björn — layer on top of this verified base.
