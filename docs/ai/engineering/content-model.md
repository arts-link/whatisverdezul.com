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

```json
{
  "instagram": "https://www.instagram.com/bluepill.greenpill",
  "tiktok": "https://www.tiktok.com/@bluepill.greenpill",
  "youtube": "https://www.youtube.com/@Verdezul",
  "spotify": "https://open.spotify.com/artist/1zf7vVM2XaoaTD3hXWR1If",
  "apple_music": "https://music.apple.com/us/artist/verd%C3%A8zul/1692039373",
  "tidal": "https://tidal.com/artist/40000977",
  "youtube_music": "https://music.youtube.com/@Verdezul"
}
```

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
