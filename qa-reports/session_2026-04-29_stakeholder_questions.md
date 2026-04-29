# Session Notes — 2026-04-29 (Stakeholder Questions)

## What we did

Worked through all Ramon (★ R) and Fredrik (F) stakeholder questions in `analytics-master.html`. Reviewed, rewrote, and propagated every question from the Stakeholder panel into the relevant AARRR tabs and implementation tables. All questions now marked ✓ Done in the Stakeholder panel.

---

## Workflow

Two-step process enforced throughout:
1. Discuss questions and align on rewrites/status in the Stakeholder panel first
2. Only after approval — propagate to the dashboard tabs and implementation tables

---

## Members — sections completed

### ① Acquisition
- 1 question (Fredrik): traffic countries — Existing, ✓ Done, Yes

### ② Activation
- 5 questions total
- Most followers (★ R, New, Yes)
- Countries prefer streamer type (F, New, Gap) → Streams tab
- VIP comparison merged from 2 → 1 (★ R, New, Future) → Streams tab
- Gamification merged from 2 → 1 (★ R, New, Gap) → Streams tab

### ③ Revenue
- 5 questions total
- Countries/revenue (F, Tokens, Partial)
- In-stream CTA (★ R, Tips & Casino, Partial)
- FTDs per streamer (★ R, Tips & Casino, Existing, Partial)
- StreamSpecial pricing (F, Tips & Casino, Partial)
- Casino banner type (F, Tips & Casino, Gap)

### ④ Retention
- 1 question (F): emails/social — Future (needs email integration)

---

## Streamers — sections completed

### ② Activation — Registration
- 7 questions total
- Exit rate by field (★ R, Existing, Partial)
- Drop-off by stage (★ R, Existing, Partial)
- Hours/days of registrations (★ R, New, Yes)
- Demographics by country (★ R, New, Yes)
- Mobile vs desktop (★ R, New, Yes)
- Device/browser/webcam (★ R, New, Partial) — `webcam_model ❌` on Stream Started
- KYC rejection ratio by country (★ R, New, Gap) — changed from Future to Gap

### ② Activation — Engagement
- 3 questions total
- Profile photos count + click types (★ R, New, Gap) — needs Profile Photo Clicked event
- No-show rate for scheduled streams (★ R, New, Partial)
- Photo count correlation with tips/views (★ R, New, Partial)
- Added Profile Photo Clicked as missing event in Engagement implementation

### ③ Revenue — Performance
- 4 questions total
- Time-to-Live: account approval → first stream (★ R, New, Partial)
- FPS/Bitrate quality per session (★ R, New, Gap) — `avg_fps ❌` + `avg_bitrate ❌` on Stream Ended
- VIP after Lounge sequence (★ R, New, Future) — `stream_type ❌` on Stream Started
- FTDs per streamer session (★ R, Existing, Partial)

### ③ Revenue — Finance
- 1 question: full revenue breakdown by type (★ R)
- Marked Existing — tips + casino partially covered in Performance tab
- Added explicit revenue breakdown question to Performance tab covering all 4 types (tips, referral, guaranteed, casino rev share)
- Referral commissions (10%) and guaranteed stream fees: no tracking events yet

### ④ Retention
- 3 questions total
- How many streamers inactive 14+ days, and who? (★ R, New, Partial)
- Average lifetime revenue of churned streamers (★ R, New, Gap)
- Technical failure rate before inactivity (★ R, New, Gap) — depends on avg_fps/bitrate

---

## New questions added to tabs

### Streams tab
- "Which countries prefer which type of streamers?" (F, Gap)
- "How do VIP streams compare to Lounge streams?" — merged, Future
- "Which gamification feature drives the most token spend?" — merged, Gap
- VIP + gamification implementation rows added

### Tokens tab
- "Which countries have the highest revenue per user?" (F, Partial)

### Tips & Casino tab
- "Which in-stream CTA drives the most outclicks?" (★ R, Partial) — `cta_type ❌`, `banner_type ❌` on Casino Outclick
- "What StreamSpecial token price drives the most triggers?" (F, Partial)
- "Which casino banner type generates the most outclicks?" (F, Gap)

### Registration tab (Streamers)
- New "Demographics & Device" section with 5 questions
- `webcam_model ❌` on Stream Started in implementation

### Engagement tab (Streamers)
- New profile photo questions in Profile & Gallery section
- No-show rate in Shows & Tip Templates section
- Profile Photo Clicked added as missing event in implementation

### Performance tab (Streamers)
- Time-to-Live question (Partial)
- VIP after Lounge question (Future)
- New "Stream Quality" section with FPS/Bitrate question (Gap)
- Full revenue breakdown question (Gap)
- `stream_type ❌` on Stream Started, `avg_fps ❌` + `avg_bitrate ❌` on Stream Ended

### Retention tab (Streamers)
- 14-day inactivity question in Stickiness & Churn (Partial)
- Average lifetime revenue of churned streamers in Earner Retention (Gap)
- Technical failure rate before inactivity in Stickiness & Churn (Gap)
- Stream Ended row added to implementation with `avg_fps ❌` + `avg_bitrate ❌`

---

## New CSS classes / changes

- `.fredrik` — green badge for Fredrik questions (added earlier in session)
- `#p-stakeholder .q .tab-lbl` — Tab column moved to far right of Stakeholder rows (order: 6), muted grey, no background
- `#sh-btn` — Stakeholder Input nav button moved to far right of nav bar (margin-left: auto)

---

## New implementation properties documented

| Event | Property | Status |
|---|---|---|
| Stream Started | stream_type | ❌ Missing (needed for VIP tracking) |
| Stream Started | webcam_model | ❌ Missing |
| Stream Ended | avg_fps | ❌ Missing |
| Stream Ended | avg_bitrate | ❌ Missing |
| Casino Outclick | cta_type | ❌ Missing |
| Casino Outclick | banner_type | ❌ Missing |
| StreamSpecial Triggered | token_price | ❌ Missing |
| StreamSpecial Triggered | special_type | ❌ Missing |
| Stream Joined | category | ❌ Missing |
| StreamSpecial Triggered | stream_id | ❌ Missing |

---

## Next step

All stakeholder questions reviewed, aligned, and propagated. Ready to build Amplitude dashboards A/B/C/D based on verified + stakeholder-enriched analytics-master.html.
