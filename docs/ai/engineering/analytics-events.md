---
name: analytics-events
description: PostHog analytics setup and all defined event names for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-07-21
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

**Use the `vzTrack` Alpine component — never inline `posthog.capture()` in an `@click`.**

This site loads the **CSP-safe Alpine build** (`@alpinejs/csp`), which cannot
evaluate arbitrary JS in inline directive expressions. An attribute like
`@click="posthog.capture(...)"` silently does nothing — it parses but never
fires. (It also requires an enclosing `x-data` scope to bind at all, which the
footer/contact social blocks did not have.) Both failure modes are invisible:
the HTML renders fine and no console error appears.

Instead, put the element inside an `x-data="vzTrack"` scope and drive it with
data attributes. The `vzTrack` component lives in `assets/js/extended.js`:

```html
<a href="{{ .ticket_url }}" x-data="vzTrack"
   @click="track"
   data-track-event="ticket_link_click"
   data-track-props="{{ (dict "venue" .venue "date" .date) | jsonify }}">
  Get Tickets
</a>
```

`data-track-props` must be a JSON object (use Hugo's `jsonify`); `vzTrack`
`JSON.parse`s it and passes it as the event properties. A single `x-data="vzTrack"`
on a parent container also works for many child links (see the footer socials).

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
