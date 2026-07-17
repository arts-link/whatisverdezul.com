---
name: site-goals
description: Priority order of what the Verdèzul site is optimizing for, and what success looks like
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [strategy, goals, metrics, priorities]
  related: [strategy/band-context.md, engineering/analytics-events.md]
---

## Use this when

Making decisions about page hierarchy, CTA placement, content emphasis, or feature priority. Always resolve trade-offs by consulting this priority order.

---

## Priority order

1. **Booking shows** — the primary goal. Every page should make it easy to contact for booking.
2. **Growing fans** — email list, social follows, discovery
3. **Promoting music** — streams, video views, new listener conversion
4. **Selling merch** — secondary revenue, fan identity
5. **Press credibility** — hidden until there is press to show; surfaces when populated

---

## What success looks like

| Signal | How we measure it |
|--------|------------------|
| Booking inquiries | Contact form submissions (PostHog: `contact_form_submit`) |
| Fan growth | Email signups (Formspree submissions, `email_signup_success`) + social follows |
| Music discovery | Spotify streams, YouTube views, `spotify_play_click` + `youtube_play_click` events |
| Merch revenue | PayPal checkout completions (tracked via `merch_click` outbound event) |
| Press | Eventually: press mentions, booking agent contact rate |

---

## Design implications

- The contact email / booking CTA should appear on every page (footer at minimum)
- The email collector form is on the home page and in the footer globally
- Tour dates should be prominent on the home page (next 3 shows)
- Featured release (ETASOBAG) gets above-the-fold placement on home
- Press page is nav-hidden until `data/press.json.items` is non-empty — do not show an empty press page

---

## What not to optimize for

- Page views or session duration for their own sake
- SEO keyword volume (this is a brand site, not a content marketing play)
- Social share counts

## Related knowledge

- [[band-context]] — who the band is and what they want
- [[analytics-events]] — PostHog event definitions that map to these goals
