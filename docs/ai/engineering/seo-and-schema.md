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

Rendered inside `{{ range (.Site.Data.shows.items | default slice) }}` in the shows page schema partial.
The event location includes `city` as its address even when the optional venue is empty.

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
