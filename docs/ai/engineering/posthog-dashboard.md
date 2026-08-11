---
name: posthog-dashboard
description: Build sheet for the "Verdèzul — Site Performance" PostHog dashboard, with every tile defined and mapped to a site goal
metadata:
  type: reference
  status: active
  updated: 2026-08-11
  tags: [engineering, analytics, posthog, dashboard, metrics]
  related: [engineering/analytics-events.md, strategy/site-goals.md]
---

## Use this when

Building, rebuilding, or auditing the PostHog dashboard. Every tile below is
defined precisely enough to create by hand in the PostHog UI or via the API —
no interpretation needed.

---

## Status

**Built and live**, 2026-08-11. All 17 tiles exist.

- Project **whatisverdezul.com**, id `517301`, org `arts-link clients`
- Dashboard id `1983853` — <https://us.posthog.com/project/517301/dashboard/1983853>
- Pinned, tagged `verdezul` / `arts-link`

`scripts/posthog-dashboard.mjs` mirrors the live tiles and is the reproducible
definition — see [[#Building it]].

---

## Prerequisites

Building this requires PostHog credentials that do not live in the repo or the
build environment:

| Need | Where it comes from |
|------|--------------------|
| Personal API key, scopes `insight:write` + `dashboard:write` | PostHog → Settings → Personal API keys |
| Project ID | PostHog → Settings → Project → Project ID |
| Region host | `https://us.posthog.com` or `https://eu.posthog.com` — must match `PUBLIC_POSTHOG_HOST` |

`PUBLIC_POSTHOG_KEY` (the public ingest key set in Vercel) is **write-only for
events** — it cannot read data or create dashboards. It is not a substitute.

## Building it

`scripts/posthog-dashboard.mjs` creates the dashboard and all 17 tiles over the
REST API. No dependencies — Node 18+ for global `fetch`.

```bash
node scripts/posthog-dashboard.mjs --dry-run    # print every payload, call nothing

POSTHOG_API_KEY=phx_... \
POSTHOG_PROJECT_ID=12345 \
POSTHOG_HOST=https://us.posthog.com \
  node scripts/posthog-dashboard.mjs
```

Re-running is safe. The dashboard is matched by name and each insight is matched
by name among that dashboard's tiles, so a second run updates in place instead of
duplicating. That makes the script the repeatable definition of the dashboard —
edit `TILES` and re-run rather than hand-editing insights in the PostHog UI, or
the two drift.

The tiles were originally created through the PostHog connector in Claude, not by
this script. The script's `TILES` were then reconciled against the live tiles so
the two match — keep them in sync when either changes.

The script itself has **not** been executed against the project (the Claude Code
sandbox blocks egress to `us.posthog.com`), so run `--dry-run` first and expect to
verify the first real run. The connector path remains the easier option: it
creates and edits tiles directly with no key in the shell.

---

## Dashboard: Verdèzul — Site Performance

Default date range **Last 90 days**, weekly granularity. Tile order follows the
priority order in [[site-goals]] — booking first, press last.

### 1. Booking (priority 1)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 1 | Booking inquiries | Trend, weekly | `contact_form_submit`, total count |
| 2 | Booking funnel | Funnel, 1-day window | `$pageview` (any) → `$pageview` where `$current_url` contains `/contact/` → `contact_form_submit` |
| 3 | Contact page reach | Trend, weekly | `$pageview` where `$current_url` contains `/contact/`, unique users |
| 4 | Booking conversion rate | HogQL table | Weekly submits over unique contact-page visitors — see [[#HogQL for the tiles that need it]] |

Tile 2 is the one that answers "is the site actually producing bookings" — it
separates *nobody reaches contact* from *people reach contact and don't submit*.

### 2. Fan growth (priority 2)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 5 | Email signups | Trend, weekly | `email_signup_success`, total count |
| 6 | Signup health | Trend, weekly | `email_signup_submit` and `email_signup_success` on one chart |
| 7 | Signup drop-off | HogQL table | Weekly count of signups that never returned a 200 — see [[#HogQL for the tiles that need it]] |
| 8 | Social follows by platform | Trend, weekly | `social_follow_click`, breakdown by `platform` |

Tile 6 is a diagnostic, not a vanity metric: `email_signup_submit` fires on
click, `email_signup_success` only on a Formspree 200. A widening gap between
the two lines means Formspree is rejecting or failing submissions — that is
silent on the front end otherwise.

### 3. Music discovery (priority 3)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 9 | Play clicks | Trend, weekly | `spotify_play_click` and `youtube_play_click` on one chart |
| 10 | Top releases | Trend, weekly, bar | `spotify_play_click`, breakdown by `release_title` |
| 11 | Top videos | Trend, weekly, bar | `youtube_play_click`, breakdown by `video_title` |

### 4. Shows and merch (priorities 1 and 4)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 12 | Ticket clicks by show | Trend, weekly, bar | `ticket_link_click`, breakdown by `venue` |
| 13 | Merch clicks by item | Trend, weekly, bar | `merch_click`, breakdown by `item_name` |

`merch_click` is an outbound proxy — it counts intent to check out, not
completed PayPal purchases. Read it as a ranking of interest between items, not
as revenue.

### 5. Traffic context

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 14 | Unique visitors | Trend, weekly | `$pageview`, unique users |
| 15 | Top pages | Trend, table | `$pageview`, breakdown by `$current_url`, unique users |
| 16 | Top referrers | Trend, table | `$pageview`, breakdown by `$referring_domain`, unique users |

Without these, every conversion tile above is unreadable — a flat booking line
means something very different at 50 visitors/week than at 5,000.

### 6. Press (priority 5)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 17 | Press link clicks | Trend, weekly | `press_link_click`, breakdown by `source` |

Will read zero until `data/press.json.items` is non-empty and the press nav
un-hides. Build it anyway so it is already collecting when press lands.

---

## HogQL for the tiles that need it

Most tiles are plain trends and can be built in the UI. These two are worth
pinning as HogQL so they do not drift:

**Booking conversion rate, weekly**

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  countIf(event = 'contact_form_submit') AS submits,
  uniqIf(person_id, event = '$pageview'
    AND properties.$current_url LIKE '%/contact/%') AS contact_visitors,
  round(submits / nullif(contact_visitors, 0) * 100, 1) AS conversion_pct
FROM events
WHERE timestamp >= now() - INTERVAL 90 DAY
  AND event IN ('contact_form_submit', '$pageview')
GROUP BY week
ORDER BY week
```

**Signup drop-off (Formspree failures)**

```sql
SELECT
  toStartOfWeek(timestamp) AS week,
  countIf(event = 'email_signup_submit') AS submitted,
  countIf(event = 'email_signup_success') AS succeeded,
  countIf(event = 'email_signup_submit') - countIf(event = 'email_signup_success') AS failed
FROM events
WHERE timestamp >= now() - INTERVAL 90 DAY
  AND event IN ('email_signup_submit', 'email_signup_success')
GROUP BY week
ORDER BY week
```

---

## What the data showed on build day (2026-08-11)

Collection starts **2026-07-17**. Volume is small — 72 unique visitors and 445
pageviews across the whole window — so read every conversion tile as directional,
not statistical.

Events confirmed live: `$pageview`, `email_signup_submit`, `youtube_play_click`,
`social_follow_click`, `hero_about_click`, `spotify_play_click`,
`contact_form_submit`, `email_signup_success`, `ticket_link_click`.

Events PostHog has **never** received: `merch_click`, `press_link_click`,
`music_video_click`. The first two are expected — `data/merch.json` and
`data/press.json` both have zero items, so neither CTA renders. The third is a
real gap, see below.

### Email signups are failing

The signup-health tile earned its place immediately:

| Week | Submitted | Succeeded |
|------|----------:|----------:|
| 2026-07-12 | 1 | 1 |
| 2026-07-19 | 1 | 1 |
| 2026-08-02 | 6 | 0 |
| 2026-08-09 | 6 | 0 |

**12 signups lost since 2026-08-02.** `email_signup_submit` fires on click;
`email_signup_success` only when Formspree returns a 200. Clean 1:1 through July,
then successes stop dead while submits continue. The site JS is not at fault —
`subscribeForm` in `assets/js/extended.js` is correctly ordered. Suspect the
Formspree side (form `/f/mlgqjvro`: quota, plan state, or the form being
disabled). No `$csp_violation` or `$exception` events were recorded, which argues
against a CSP or JS-error cause.

### The contact form cannot report this

`contactForm` captures `contact_form_submit` **only** inside `if (r.ok ...)` —
there is no attempt-side event. So for the site's number-one goal, a Formspree
failure is indistinguishable from nobody filling the form in: both read zero.
The contact form posts to a different Formspree form (`/f/xojgerbg`) on the same
account, and its last success was 2026-07-26 — before the signup breakage began.

Fixing this means capturing an attempt event before the `fetch`, mirroring
`subscribeForm`:

```js
if (window.posthog) window.posthog.capture('contact_form_attempt');
```

Then add a `contact_form_attempt` row to [[analytics-events]] and a booking
equivalent of the signup-health tile.

## Known gap in event coverage

`music_video_click` is listed in [[analytics-events]] as the home page featured
video CTA event, but **no template or script emits it** — the only references
are in that doc and the original site plan. The home page featured video is
covered by `youtube_play_click` from the embed partial instead.

Either wire up `music_video_click` or drop it from the event table before
building tiles that depend on it. No tile above uses it.

---

## Related knowledge

- [[analytics-events]] — event names, properties, and the `vzTrack` pattern
- [[site-goals]] — the priority order this dashboard is arranged around
