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

Add band-specific structured data through
`layouts/partials/head/schema-extra.html`. This is Ryder's additive hook: its
core `head/schema.html` still renders first, and the site-level extra partial
adds Verdèzul-specific entities without editing the theme submodule.

### Organization / MusicGroup (homepage)

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "MusicGroup"],
  "@id": "https://www.whatisverdezul.com/#organization",
  "name": "Verdèzul",
  "url": "https://www.whatisverdezul.com/",
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
    "https://open.spotify.com/artist/1zf7vVM2XaoaTD3hXWR1If",
    "https://music.apple.com/us/artist/verd%C3%A8zul/1692039373",
    "https://tidal.com/artist/40000977",
    "https://music.youtube.com/@Verdezul"
  ]
}
```

`Organization` is explicit because Google supports it in the Rich Results Test.
JSON-LD permits one entity to have multiple types, so `MusicGroup` retains the
more precise Schema.org meaning without creating a duplicate band entity. The
`sameAs` array is built from every non-empty value in `data/social.json`; the same
sorted array is also used by each `MusicEvent` performer.

### WebSite (homepage)

The homepage also emits a `WebSite` entity with `name`, `url`, and `inLanguage`.
Its `publisher` and `about` fields reference the organization through the stable
`https://www.whatisverdezul.com/#organization` ID. Google uses `WebSite` for its
site-name system, but does not report site-name markup in the Rich Results Test;
validate it with Schema.org Validator and Search Console URL Inspection instead.

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
  "name": "Earthtones & Shades of Blue and Green",
  "byArtist": { "@id": "https://www.whatisverdezul.com/#organization" },
  "datePublished": "2025",
  "numTracks": 6,
  "url": "https://open.spotify.com/album/41MixYv9THV7OBZcxUv1Qj"
}
```

---

## robots.txt

Generated from **`layouts/home.robots.txt`**. Two things about that are easy to get wrong:

1. **`enableRobotsTXT = true` is not sufficient on its own.** `"ROBOTS"` must also appear in `[outputs] home` — an explicit `[outputs]` block replaces Hugo's defaults instead of merging with them, the same trap that requires `LLMSTxt` to be named by hand (documented at length in `themes/ryder/hugo.toml`).
2. **The filename is `home.robots.txt`, not `robots.txt`.** Under Hugo's template system (0.146+) a root-level `layouts/robots.txt` is *not* picked up, and the lookup instead falls through to the theme's `_default/home.llmstxt.txt` — which silently writes the **llms.txt content into robots.txt**. Verified by hitting exactly that. If `public/robots.txt` ever comes out looking like a site summary, this is why.

The file's real payload is the `Sitemap:` line, built with `absURL` so it carries the canonical `www` host.

### Preview deploys serve a different robots.txt

The template branches on `getenv "VERCEL_ENV"`. An explicitly non-production value emits `User-agent: * / Disallow: /`, so branch and PR deployments can't be indexed and compete with the live domain. Preview URLs are unguessable, but they leak through pull request links and chat unfurls, which is enough.

**Polarity is deliberate: unset means permissive.** A local `hugo` has no `VERCEL_ENV` and must keep producing exactly what production does, otherwise the file can't be checked locally. Only an explicit non-production value flips it.

This needs `'^VERCEL_'` in `[security.funcs] getenv` in `hugo.toml`. **Removing it does not degrade gracefully** — every build fails with `access denied: "VERCEL_ENV" is not whitelisted in policy "security.funcs.getenv"`. That is the desired direction: a robots.txt silently reverting to permissive on previews would be worse than a red build.

**Don't reach for `hugo --environment preview` instead.** It looks tidier, but `themes/ryder/layouts/partials/head/css.html` gates minification, fingerprinting and SRI on `hugo.Environment == "production"` — previews would stop resembling production, which is the entire point of having them.

Vercel may also send `X-Robots-Tag: noindex` on preview deployments. If it does, this is belt and braces; the template keeps the intent visible in the repo rather than resting on undocumented platform behaviour.

**`/admin/` is deliberately not disallowed.** It already serves `<meta name="robots" content="noindex">`. Blocking the path in robots.txt would stop crawlers fetching it, so they would never read that noindex — and a robots-blocked URL can still be indexed URL-only from an external link, with nothing left to suppress it. Allowing the crawl is what makes the noindex enforceable. Don't "fix" this.

**AI crawlers are unblocked on purpose**, to match the GEO goal above and the `llms.txt` the site already ships. No per-bot rules: the `User-agent: *` wildcard covers them and a list of redundant `Allow:` blocks would only go stale.

Related: `disableKinds = ["taxonomy", "term"]` in `hugo.toml`. The band uses neither, and leaving them on put empty `/categories/` and `/tags/` pages in the sitemap.

---

## Page meta descriptions

Every page's `content/<section>/_index.md` must have a `description` field (100–160 characters). This feeds both the HTML meta description and OG description via Ryder.

---

## GEO / LLMs.txt

Ryder configures the `LLMSTxt` output format in `hugo.toml`. The site enables it
as a home output:

```toml
[outputs]
  home = ["HTML", "RSS", "LLMSTxt", "ROBOTS"]
```

This generates `/llms.txt` at the root. Verdèzul overrides Ryder's generic page
index at `layouts/_default/home.llmstxt.txt` so the file contains substantive,
CMS-driven facts: the band bio, releases, videos, shows, contact details, official
links, and any populated press or merchandise. It also retains a short page index.
Keep those facts sourced from `data/*.json` so CMS edits automatically reach both
the human-facing pages and `llms.txt`.

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
