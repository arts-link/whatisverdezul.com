---
name: cms-config
description: Decap CMS setup, collection definitions, field mappings, and GitHub OAuth auth
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, cms, decap, oauth, admin]
  related: [engineering/content-model.md, engineering/architecture.md]
---

## Use this when

Working on the CMS admin interface, adding new editable fields, debugging auth, or explaining how the client edits content.

---

## How it works

Decap CMS is a React app served from `/admin`. When the client visits `whatisverdezul.com/admin`, they authenticate via GitHub OAuth, then edit content through a web UI. Every save creates a git commit to `main`. Vercel detects the push and redeploys the site in ~30 seconds.

---

## Files

| File | Purpose |
|------|---------|
| `static/admin/index.html` | CMS entry point — loads Decap from CDN |
| `static/admin/config.yml` | Defines all editable collections and fields |
| `api/oauth/` | Vercel serverless function — GitHub OAuth handshake proxy |

---

## Auth setup

Decap CMS requires a GitHub OAuth app. The `api/oauth/` proxy handles the OAuth handshake server-side so the GitHub client secret isn't exposed in the browser.

**GitHub OAuth App settings:**
- Authorization callback URL: `https://whatisverdezul.com/api/oauth/callback`
- Homepage URL: `https://whatisverdezul.com`

**Vercel env vars required:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

If Decap CMS auth proves fussy, drop in **Sveltia CMS** (same `config.yml` schema, cleaner GitHub OAuth, no proxy needed).

---

## Collection overview

| Collection | Type | File edited |
|-----------|------|------------|
| Band Info | single file | `data/band.json` |
| Social Links | single file | `data/social.json` |
| Tour Dates | list in file | `data/tour.json` |
| Press Quotes | list in file | `data/press.json` |
| Releases | list in file | `data/releases.json` |
| Shop / Merch | list in file | `data/merch.json` |
| Pages | single files | `content/_index.md`, `content/about/_index.md`, `content/contact/_index.md` |

---

## `static/admin/config.yml` (full reference)

```yaml
backend:
  name: github
  repo: arts-link/whatisverdezul.com
  branch: main
  base_url: https://whatisverdezul.com

media_folder: images/uploads
public_folder: /images/uploads

collections:

  - name: site-config
    label: Site Config
    files:
      - name: band
        label: Band Info
        file: data/band.json
        format: json
        fields:
          - { name: name, label: Band Name, widget: string }
          - { name: email, label: Contact Email, widget: string }
          - { name: location, label: City, widget: string }
          - { name: bio, label: Short Bio, widget: text }
      - name: social
        label: Social Links
        file: data/social.json
        format: json
        fields:
          - { name: instagram, label: Instagram URL, widget: string, required: false }
          - { name: tiktok, label: TikTok URL, widget: string, required: false }
          - { name: youtube, label: YouTube URL, widget: string, required: false }
          - { name: spotify, label: Spotify URL, widget: string, required: false }
          - { name: apple_music, label: Apple Music URL, widget: string, required: false }

  - name: tour
    label: Tour Dates
    file: data/tour.json
    format: json
    label_singular: Tour Date
    widget: list
    fields:
      - { name: date, label: Date, widget: datetime, format: "YYYY-MM-DD" }
      - { name: venue, label: Venue, widget: string }
      - { name: city, label: City, widget: string }
      - { name: description, label: Description, widget: text, required: false }
      - { name: ticket_url, label: Ticket URL, widget: string, required: false }
      - { name: sold_out, label: Sold Out, widget: boolean, default: false }

  - name: press
    label: Press Quotes
    file: data/press.json
    format: json
    label_singular: Press Quote
    widget: list
    fields:
      - { name: quote, label: Quote, widget: text }
      - { name: source, label: Source, widget: string }
      - { name: url, label: URL, widget: string, required: false }
      - { name: date, label: Date, widget: string, hint: "e.g. 2026-01" }

  - name: releases
    label: Releases
    file: data/releases.json
    format: json
    label_singular: Release
    widget: list
    fields:
      - { name: title, label: Title, widget: string }
      - { name: type, label: Type, widget: select, options: [album, ep, single] }
      - { name: year, label: Year, widget: number }
      - { name: description, label: Description, widget: text, required: false }
      - { name: spotify_url, label: Spotify URL, widget: string, required: false }
      - { name: apple_music_url, label: Apple Music URL, widget: string, required: false }
      - { name: cover_image, label: Cover Image, widget: image, required: false }
      - { name: featured, label: Featured on Home, widget: boolean, default: false }

  - name: merch
    label: Shop / Merch
    file: data/merch.json
    format: json
    label_singular: Item
    widget: list
    fields:
      - { name: name, label: Item Name, widget: string }
      - { name: price, label: Price (USD), widget: number }
      - { name: description, label: Description, widget: text, required: false }
      - { name: image, label: Image, widget: image }
      - { name: checkout_url, label: Checkout URL, widget: string }
      - { name: sold_out, label: Sold Out, widget: boolean, default: false }

  - name: pages
    label: Page Content
    files:
      - name: home
        label: Home Page
        file: content/_index.md
        fields:
          - { name: title, label: Title, widget: string }
          - { name: description, label: Meta Description, widget: text }
          - { name: hero_headline, label: Hero Headline, widget: string, required: false }
          - { name: hero_subline, label: Hero Subline, widget: string, required: false }
          - { name: body, label: Body, widget: markdown, required: false }
      - name: about
        label: About Page
        file: content/about/_index.md
        fields:
          - { name: title, label: Title, widget: string }
          - { name: description, label: Meta Description, widget: text }
          - { name: body, label: Body, widget: markdown }
      - name: contact
        label: Contact Page
        file: content/contact/_index.md
        fields:
          - { name: title, label: Title, widget: string }
          - { name: description, label: Meta Description, widget: text }
          - { name: body, label: Body, widget: markdown, required: false }
```

---

## Adding a new editable field

1. Add the field to the appropriate JSON in `data/`
2. Add the corresponding widget entry in `config.yml`
3. Update the Hugo template that consumes the data
4. Update [[content-model]] with the new field definition

## Related knowledge

- [[content-model]] — the data shapes that CMS collections write to
- [[architecture]] — where these files live
