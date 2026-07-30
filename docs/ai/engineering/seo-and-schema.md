---
name: seo-and-schema
description: OG tags, JSON-LD schema types, canonical URLs, and GEO/LLMsTxt setup for Verdèzul
metadata:
  type: reference
  status: active
  updated: 2026-07-17
  tags: [engineering, seo, schema, og, jsonld, geo]
  related: [engineering/architecture.md, engineering/routes-and-menus.md]
---

## Use this when

Adding meta tags, implementing structured data, verifying OG previews, or setting up AI/GEO discoverability.

---

## What Ryder handles automatically

Ryder's `layouts/partials/head/` already provides:
- `<title>` tag from page frontmatter
- `og:title`, `og:description`, `og:url`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`
- Canonical URL
- Robots meta

These work out of the box from page `title` and `description` frontmatter. No manual wiring needed.

---

## Schema JSON-LD (site-specific)

Override `layouts/partials/head/schema.html` to inject band-specific structured data.

### MusicGroup (all pages)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "Verdèzul",
  "url": "https://whatisverdezul.com",
  "email": "verdezulofficial@gmail.com",
  "genre": ["Hip-Hop", "Rap"],
  "foundingLocation": {
    "@type": "Place",
    "name": "Los Angeles, CA"
  },
  "sameAs": [
    "https://www.instagram.com/bluepill.greenpill",
    "https://www.tiktok.com/@bluepill.greenpill",
    "https://www.youtube.com/@Verdezul",
    "https://open.spotify.com/artist/1zf7vVM2XaoaTD3hXWR1If"
  ]
}
```

### MusicEvent (Shows page, per show)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  "name": "Verdèzul at {{ .venue }}",
  "startDate": "{{ .date }}",
  "location": {
    "@type": "Place",
    "name": "{{ .venue }}",
    "address": "{{ .city }}"
  },
  "performer": { "@type": "MusicGroup", "name": "Verdèzul" },
  "url": "{{ .ticket_url }}"
}
```

Emitted from `layouts/partials/head/schema-extra.html`, one `<script>` block per show, gated on `eq .RelPermalink "/shows/"`.

**Upcoming shows only.** The partial reuses the same build-time split as `layouts/shows/list.html` (`where $shows "date" "ge" $today`). Past shows stay visible on the page as history but are deliberately not marked up — they can't be acted on, and emitting them would park a permanent set of expired events in front of crawlers. When every show is in the past the block correctly emits nothing, which is the current state of `data/shows.json`.

Field behavior worth preserving if this is ever rewritten:

- `location.name` falls back to `city` when `venue` is empty; `city` is split on `", "` into `addressLocality` + `addressRegion`, and a city with no comma yields locality only.
- No `addressCountry`. It's recommended by Google, but asserting `"US"` would be silently wrong the first time they play abroad.
- `offers` is emitted **only** when `ticket_url` is set, with `availability` switching to `https://schema.org/SoldOut` on `sold_out`. With no ticket link there's no button on the page either, so `url` falls back to the shows page.
- `startDate` is date-only because the CMS has no time field. Valid ISO 8601; Google prefers a time but accepts it.

### MusicAlbum (Music/Home release cards)

```json
{
  "@context": "https://schema.org",
  "@type": "MusicAlbum",
  "name": "ETASOBAG",
  "byArtist": { "@type": "MusicGroup", "name": "Verdèzul" },
  "datePublished": "2025",
  "url": "https://open.spotify.com/artist/1zf7vVM2XaoaTD3hXWR1If"
}
```

---

## Page meta descriptions

Every page's `content/<section>/_index.md` must have a `description` field (100–160 characters). This feeds both the HTML meta description and OG description via Ryder.

---

## GEO / LLMs.txt

Ryder already configures the `LLMSTxt` output format in `hugo.toml`. Add it to outputs:

```toml
[outputs]
  home = ["HTML", "RSS", "LLMSTxt"]
```

This generates `/llms.txt` at the root — a plain-text summary of the site for AI crawlers, improving inclusion in AI-generated search responses.

---

## Open Graph image

Ryder generates OG images. Ensure each page has a meaningful `title` and `description` in frontmatter. If a page needs a custom OG image, add `og_image: /images/...` to the frontmatter.

---

## Verification commands

```bash
# Check OG tags on any page
curl -s https://whatisverdezul.com | grep -E 'og:|twitter:'

# Validate JSON-LD
# → https://search.google.com/test/rich-results
# → https://validator.schema.org

# Check OG preview
# → https://www.opengraph.xyz
```

## Related knowledge

- [[architecture]] — where schema.html lives in the override structure
- [[analytics-events]] — PostHog events for tracking engagement
