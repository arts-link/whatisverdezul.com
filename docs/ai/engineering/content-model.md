---
name: content-model
description: All data file shapes, frontmatter schemas, and content type definitions for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-07-17
  tags: [engineering, data, content, schema, cms]
  related: [engineering/cms-config.md, engineering/architecture.md]
---

## Use this when

Adding or editing data files, writing Hugo templates that consume data, or configuring Decap CMS fields.

---

## Data files (`data/*.json`)

All client-editable content lives here. Hugo templates access site data via `.Site.Data.<filename>`.

List-backed editor files use an object wrapper with an `items` array. This keeps Decap file collections valid and gives templates a consistent empty-state check:

```go-html-template
{{ $press := .Site.Data.press.items | default slice }}
{{ if gt (len $press) 0 }}
  ...
{{ end }}
```

### `data/band.json`

```json
{
  "name": "Verdèzul",
  "email": "verdezulofficial@gmail.com",
  "location": "Los Angeles, CA",
  "bio": "Short bio text for the about page and meta descriptions."
}
```

### `data/social.json`

An ordered `items` list, **not** a flat map of fixed platform keys. It became a
list so the band can add a platform from `/admin` without a code change, and so
they control the footer icon order by dragging. **List order is footer order** —
no consumer may sort or re-group it.

```json
{
  "items": [
    { "platform": "instagram", "url": "https://www.instagram.com/bluepill.greenpill" },
    { "platform": "soundcloud", "url": "https://soundcloud.com/verdezul" },
    { "platform": "other", "label": "Verdèzul Newsletter", "url": "https://example.com/news" }
  ]
}
```

Fields:
- `platform` — selects the brand icon from `layouts/partials/social-icon.html`. Known values: `instagram`, `tiktok`, `youtube`, `spotify`, `apple_music`, `tidal`, `youtube_music`, `soundcloud`, `bandcamp`, `audiomack`, `amazon_music`, `facebook`, `x`, `threads`, `patreon`, `discord`, `other`.
- `label` — only meaningful when `platform` is `other`; supplies the screen-reader name. Ignored otherwise, because `social-name.html` owns the display name for every known platform.
- `url` — full link. An item with a blank `url` renders nothing, so a half-filled CMS row can never emit a dead link.

**Adding a new platform with a real icon** means adding a path to
`social-icon.html`, a display name to `social-name.html`, and the key to the
`platform` options in `static/admin/config.yml`. Skipping any of the three is
survivable — an unknown platform falls back to the neutral `other` link glyph
rather than rendering nothing — but the icon will be generic until all three
are done.

Four consumers read this file, and all four must stay in step:
`layouts/partials/footer-verdezul.html`, `layouts/contact/list.html`,
`layouts/partials/head/schema-extra.html` (the JSON-LD `sameAs` array), and
`layouts/_default/home.llmstxt.txt`.

The footer and the contact page render the **same list in the same order** —
neither filters by platform. A link that showed up in one place but not the
other would be indistinguishable from a broken save, so keep them identical.
Both rows are `flex-wrap: wrap`, because the list is band-editable and has no
upper bound; at 375px the contact row has 263px and already wraps at eight
20px icons.

### `data/shows.json`

Shows are the canonical name for public performance dates and the `/shows/` route.

```json
{
  "items": [
    {
      "title": "Soulstice Sounds",
      "date": "2026-07-21",
      "city": "Los Angeles, CA",
      "venue": "the slipper clutch",
      "description": "",
      "ticket_url": "",
      "sold_out": false
    }
  ]
}
```

Fields:
- `title` — event name; the card header on `/shows/`
- `date` — ISO 8601 string `YYYY-MM-DD`, used for sorting, display, and the upcoming/past split
- `city` — city and state displayed directly below the date in the same type style; defaults to `Los Angeles, CA` for new CMS entries
- `venue` — optional venue name; rendered as "@ venue" next to the date when non-empty
- `description` — optional short description
- `ticket_url` — optional external ticket link; when empty (and not sold out) no button renders at all — there is no "Tickets TBA" fallback
- `sold_out` — boolean; renders "Sold Out" instead of a ticket link

The template (`layouts/shows/list.html`) splits items into an **Upcoming** section (`date >= today`, soonest first) and a **Past Shows** section (`date < today`, newest first), comparing ISO date strings against `now` at build time. Because the site is static and deploys can be far apart, an inline script in the same template re-partitions on page load against the visitor's local date: each card carries `data-date`, the section is hidden via `.vz-shows-cloak` until the script finishes (a `<noscript>` style reveals the build-time split for no-JS visitors), and any upcoming card whose date has passed is moved to the top of the past list. For QA, `?vz-today=YYYY-MM-DD` overrides the client-side "today". Each card is rendered by `layouts/partials/show-card.html`, with the city directly below the formatted date.

### `data/releases.json`

```json
{
  "items": [
    {
      "title": "Earthtones & Shades of Blue and Green",
      "type": "ep",
      "year": 2025,
      "song_count": 6,
      "description": "Debut EP.",
      "spotify_url": "https://open.spotify.com/...",
      "apple_music_url": "",
      "cover_image": "/images/album-ETASOBAG.jpg",
      "featured": true
    }
  ]
}
```

Fields:
- `type` — one of `album`, `ep`, or `single`; templates humanize it for display
- `song_count` — positive integer, shown on music cards
- `featured` — boolean; featured releases appear in music schema and any featured modules

### `data/streaming.json`

Drives `/music/streaming/`. **One ordered `items` list holding every embed,
whatever the platform** — there is no per-platform grouping and no separate
scalar field. The band drags embeds into any order in `/admin` and the page
follows exactly, so a SoundCloud player can sit between two videos.

```json
{
  "items": [
    { "platform": "youtube", "title": "Taxes Finnah Hit", "youtube_id": "Op1oF2qy_ek",
      "thumbnail": "/images/uploads/custom-art.jpg" },
    { "platform": "spotify", "title": "Verdèzul on Spotify",
      "spotify_embed_url": "https://open.spotify.com/embed/artist/1zf7vVM2XaoaTD3hXWR1If?utm_source=generator" },
    { "platform": "soundcloud", "title": "Verdèzul on SoundCloud",
      "soundcloud_url": "https://soundcloud.com/verdezul", "player_size": "large" }
  ]
}
```

`platform` is required on every item and is the discriminator: it is Decap's
`typeKey` for the variable-type list, and the branch key in
`layouts/music/streaming.html`. An item with an unrecognised `platform` renders
nothing rather than breaking the build.

Per-platform fields:
- **`youtube`** — `youtube_id` is the bare 11-character video ID, **not** a full URL. The CMS enforces `^[A-Za-z0-9_-]{11}$`, because pasting a watch URL is the predictable failure. `title` is the caption, the `alt` text, and the PostHog `youtube_play_click` `video_title` property. `thumbnail` is an optional override; omit it and `youtube-thumb.html` falls back to `https://img.youtube.com/vi/<id>/maxresdefault.jpg`. That image only exists for videos uploaded at 720p+; YouTube serves a grey placeholder rather than a 404 for the rest, so it cannot be detected in CSS and an inline `onerror` fallback would be blocked by the CSP. The override is the escape hatch.
- **`spotify`** — `spotify_embed_url` must be an `open.spotify.com/embed/…` link (CMS-enforced), not a normal share link. Works for artist, album, or playlist embeds. Fixed 352px tall.
- **`soundcloud`** — `soundcloud_url` is the ordinary `soundcloud.com/…` page link, straight from the address bar; the template URL-encodes it into the `w.soundcloud.com/player/` embed, so the band never handles embed code. `player_size` is `large` (450px, shows a scrolling track list — right for a profile or playlist) or `compact` (166px, right for one track).

On both players `title` is not printed on the page; it supplies the iframe's
accessible name and the PostHog event property.

Layout: every item is a child of one `.vz-video-grid`. YouTube thumbs take one
column each; players carry `.vz-embed-wide`, which is `grid-column: 1 / -1` and
so breaks the row full-width. **Never add `grid-auto-flow: dense` to that grid**
— it would reorder items to backfill gaps and destroy the ordering guarantee.

`layouts/music/streaming.html` passes each YouTube item to the partial as a dict, so `youtube-thumb.html` keeps its existing `id` / `title` / `thumbnail` contract while the CMS field stays the client-legible `youtube_id`.

### `data/press.json`

Starts as an empty list wrapper. When `items` is empty, Press nav and page content stay hidden/empty.

```json
{
  "items": [
    {
      "quote": "...",
      "source": "LA Weekly",
      "url": "https://...",
      "date": "2026-01"
    }
  ]
}
```

### `data/merch.json`

```json
{
  "items": [
    {
      "name": "Verdèzul Tee",
      "price": 35,
      "description": "Classic heavyweight tee in black with the Verdèzul logo.",
      "image": "/images/merch/tee-black.jpg",
      "checkout_url": "https://...",
      "sold_out": false
    }
  ]
}
```

Fields:
- `price` — numeric USD value
- `checkout_url` — optional external checkout URL; if empty and not sold out, the shop renders "Coming Soon"
- `sold_out` — boolean; renders "Sold Out" instead of a buy link

---

## Page content frontmatter

Each section's `_index.md` carries SEO frontmatter:

```yaml
---
title: "Page Title"
description: "Meta description for SEO — 100–160 characters."
---
```

The home page `content/_index.md` may also carry:

```yaml
---
title: "Verdèzul"
description: "Official site for Verdèzul — Los Angeles-based hip-hop duo. Music, shows, merch."
hero_headline: "We reflect the World"
hero_subline: "Los Angeles"
---
```

## Conditional rendering pattern

Any section driven by an `items` list should be hidden or show an intentional empty state when that list is empty:

```go-html-template
{{ $shows := .Site.Data.shows.items | default slice }}
{{ if gt (len $shows) 0 }}
  ... show content ...
{{ end }}
```

Apply this to: press page content, press nav item, shows, merch, and any home page module that pulls from editable list data.

## Related knowledge

- [[cms-config]] — how Decap CMS maps to these fields
- [[architecture]] — where these files live and how templates access them
