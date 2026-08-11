---
name: posthog-dashboard
description: Build sheet for the "Verdèzul — Site Performance" PostHog dashboard, with every tile defined and mapped to a site goal
metadata:
  type: reference
  status: proposed
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

**Proposed, not built.** The dashboard has not been created in PostHog yet. See
[[#Prerequisites]] for what is needed to build it.

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

Two ways to build:

1. **PostHog connector in Claude** — connect PostHog at claude.ai, then an agent
   can create the dashboard and all tiles directly.
2. **API** — `POST /api/projects/:id/dashboards/` to create the dashboard, then
   `POST /api/projects/:id/insights/` per tile with `dashboards: [<id>]`.

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

Tile 2 is the one that answers "is the site actually producing bookings" — it
separates *nobody reaches contact* from *people reach contact and don't submit*.

### 2. Fan growth (priority 2)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 4 | Email signups | Trend, weekly | `email_signup_success`, total count |
| 5 | Signup health | Trend, weekly | `email_signup_submit` and `email_signup_success` on one chart |
| 6 | Social follows by platform | Trend, weekly | `social_follow_click`, breakdown by `platform` |

Tile 5 is a diagnostic, not a vanity metric: `email_signup_submit` fires on
click, `email_signup_success` only on a Formspree 200. A widening gap between
the two lines means Formspree is rejecting or failing submissions — that is
silent on the front end otherwise.

### 3. Music discovery (priority 3)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 7 | Play clicks | Trend, weekly | `spotify_play_click` and `youtube_play_click` on one chart |
| 8 | Top releases | Trend, weekly, bar | `spotify_play_click`, breakdown by `release_title` |
| 9 | Top videos | Trend, weekly, bar | `youtube_play_click`, breakdown by `video_title` |

### 4. Shows and merch (priorities 1 and 4)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 10 | Ticket clicks by show | Trend, weekly, bar | `ticket_link_click`, breakdown by `venue` |
| 11 | Merch clicks by item | Trend, weekly, bar | `merch_click`, breakdown by `item_name` |

`merch_click` is an outbound proxy — it counts intent to check out, not
completed PayPal purchases. Read it as a ranking of interest between items, not
as revenue.

### 5. Traffic context

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 12 | Unique visitors | Trend, weekly | `$pageview`, unique users |
| 13 | Top pages | Trend, table | `$pageview`, breakdown by `$current_url`, unique users |
| 14 | Top referrers | Trend, table | `$pageview`, breakdown by `$referring_domain`, unique users |

Without these, every conversion tile above is unreadable — a flat booking line
means something very different at 50 visitors/week than at 5,000.

### 6. Press (priority 5)

| # | Tile | Type | Definition |
|---|------|------|-----------|
| 15 | Press link clicks | Trend, weekly | `press_link_click`, breakdown by `source` |

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
