---
name: content-model
description: All data file shapes, frontmatter schemas, and content type definitions for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, data, content, schema, cms]
  related: [engineering/cms-config.md, engineering/architecture.md]
---

## Use this when

Adding or editing data files, writing Hugo templates that consume data, or configuring Decap CMS fields.

---

## Data files (`data/*.json`)

All client-editable content lives here. Hugo templates access via `.Site.Data.<filename>`.

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
  "apple_music": ""
}
```

### `data/tour.json`

Empty array `[]` until shows are added. Each entry:

```json
[
  {
    "date": "2026-06-14",
    "venue": "The Roxy",
    "city": "Los Angeles, CA",
    "description": "Headline show with special guests.",
    "ticket_url": "https://...",
    "sold_out": false
  }
]
```

Fields:
- `date` — ISO 8601 string `YYYY-MM-DD`, used for sorting and display
- `venue` — venue name
- `city` — city, state
- `description` — optional short description of the show
- `ticket_url` — external link; empty string if no tickets yet
- `sold_out` — boolean; renders "Sold Out" badge instead of ticket link

### `data/releases.json`

```json
[
  {
    "title": "ETASOBAG",
    "type": "album",
    "year": 2025,
    "description": "Earthtones and Shades of Blue and Green — debut album.",
    "spotify_url": "https://open.spotify.com/artist/1zf7vVM2XaoaTD3hXWR1If",
    "apple_music_url": "",
    "cover_image": "/images/releases/etasobag.jpg",
    "featured": true
  }
]
```

Fields:
- `type` — `"album"`, `"ep"`, or `"single"`
- `featured` — boolean; featured releases appear on the home page

### `data/press.json`

Starts as empty array `[]`. When empty, Press nav item and page are hidden.

```json
[
  {
    "quote": "...",
    "source": "LA Weekly",
    "url": "https://...",
    "date": "2026-01"
  }
]
```

### `data/merch.json`

Empty array `[]` until items are added.

```json
[
  {
    "name": "Verdèzul Tee",
    "price": 35,
    "description": "Classic heavyweight tee in forest green with embroidered logo.",
    "image": "/images/merch/tee-green.jpg",
    "checkout_url": "https://paypal.com/...",
    "sold_out": false
  }
]
```

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
description: "Official site for Verdèzul — Los Angeles-based band. Music, tour dates, merch."
hero_headline: "We reflect the World"
hero_subline: "Los Angeles"
---
```

---

## Conditional rendering pattern

Any section driven by data should be hidden when its data array is empty:

```html
{{ if gt (len .Site.Data.press) 0 }}
  ... press content ...
{{ end }}
```

Apply this to: press page content, press nav item, and any home page module that pulls from an empty data source.

## Related knowledge

- [[cms-config]] — how Decap CMS maps to these fields
- [[architecture]] — where these files live and how templates access them
