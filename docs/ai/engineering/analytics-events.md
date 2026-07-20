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
```

Ryder reads `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` from the build environment. Set both in Vercel for Production and Preview, then redeploy. Do not hardcode them in `hugo.toml`.

The site uses PostHog's current web defaults, including automatic pageviews and autocapture, with person profiles limited to identified visitors. Session replay is controlled in the PostHog project settings; it is not required for the conversion dashboards defined here.

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
| `hero_about_click` | Home hero "What is Verdèzul?" box → About page | (none) |
| `merch_click` | Shop item checkout link | `item_name`, `price` |
| `contact_form_submit` | Contact form submission | (none — just conversion signal) |
| `email_signup_submit` | "Stay in the loop" form submit | (none — signup data goes to Formspree) |
| `email_signup_success` | Formspree returns 200 for the signup | (none) |
| `social_follow_click` | Any social icon in contact/footer | `platform` (instagram, tiktok, youtube, spotify, apple_music, tidal, youtube_music) |
| `press_link_click` | Press coverage source link | `source` |

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
