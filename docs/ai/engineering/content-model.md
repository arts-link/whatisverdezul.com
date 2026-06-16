---
name: content-model
description: All data file shapes, frontmatter schemas, and content type definitions for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-06-05
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
      "date": "2026-06-14",
      "venue": "The Roxy",
      "city": "Los Angeles, CA",
      "description": "Headline show with special guests.",
      "ticket_url": "https://...",
      "sold_out": false
    }
  ]
}
```

Fields:
- `date` — ISO 8601 string `YYYY-MM-DD`, used for sorting and display
- `venue` — venue name
- `city` — city, state
- `description` — optional short description
- `ticket_url` — optional external ticket link; empty string if unavailable
- `sold_out` — boolean; renders "Sold Out" instead of a ticket link

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
