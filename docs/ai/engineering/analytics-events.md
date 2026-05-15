---
name: analytics-events
description: PostHog analytics setup and all defined event names for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, analytics, posthog, events, tracking]
  related: [engineering/architecture.md, strategy/site-goals.md]
---

## Use this when

Adding new tracking, reviewing existing events, or checking whether a user interaction is being captured.

---

## Setup

PostHog is initialized by Ryder's built-in analytics partial. Set in `hugo.toml`:

```toml
[params]
  analytics_provider = "posthog"
  posthog_key = "{{ getenv "POSTHOG_KEY" }}"
```

`POSTHOG_KEY` is a Vercel environment variable. Do not hardcode it.

Ryder calls `posthog.init()` once globally — do not call it again in custom templates.

---

## Event tracking pattern

Use `data-track` attributes on HTML elements. PostHog's autocapture picks these up, or wire them to `posthog.capture()` calls in Alpine.js `@click` handlers:

```html
<!-- Declarative (Alpine + PostHog) -->
<a href="{{ .ticket_url }}"
   @click="posthog.capture('ticket_link_click', { venue: '{{ .venue }}', date: '{{ .date }}' })"
   data-track="ticket_link_click">
  Get Tickets
</a>
```

---

## Defined events

| Event name | Trigger | Key properties |
|-----------|---------|----------------|
| `ticket_link_click` | Tour page ticket CTA | `venue`, `date`, `city` |
| `spotify_play_click` | Spotify embed / release card link | `release_title` |
| `youtube_play_click` | YouTube embed / video link | `video_title`, `video_id` |
| `music_video_click` | Home page featured video CTA | `video_title` |
| `merch_click` | Shop item checkout link | `item_name`, `price` |
| `contact_form_submit` | Contact form submission | (none — just conversion signal) |
| `email_signup_submit` | Email collector form submit | (none — Buttondown handles subscriber data) |
| `email_signup_success` | Buttondown API returns 201 | (none) |
| `social_follow_click` | Any social icon in header/footer | `platform` (instagram, tiktok, youtube, spotify) |

---

## What not to track

- Internal page navigation (PostHog pageview autocapture handles this)
- Form field interactions (too granular, not actionable)
- Hover events

---

## Keystone metrics (map to [[site-goals]])

| Goal | Event to watch |
|------|---------------|
| Booking | `contact_form_submit` |
| Fan growth | `email_signup_success`, `social_follow_click` |
| Music discovery | `spotify_play_click`, `youtube_play_click` |
| Merch revenue | `merch_click` (outbound proxy for PayPal conversion) |

## Related knowledge

- [[site-goals]] — why we track what we track
- [[architecture]] — where event tracking code lives in templates
