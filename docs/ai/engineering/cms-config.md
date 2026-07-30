---
name: cms-config
description: Decap CMS setup, collection definitions, field mappings, and GitHub OAuth auth
metadata:
  type: reference
  status: active
  updated: 2026-07-17
  tags: [engineering, cms, decap, oauth, admin]
  related: [engineering/content-model.md, engineering/architecture.md]
---

## Use this when

Working on the CMS admin interface, adding new editable fields, debugging auth, or explaining how the client edits content.

---

## How it works

Decap CMS is served from `/admin`. Editors authenticate with GitHub OAuth, edit content through a web UI, and each save commits to `main`. Vercel detects the commit and redeploys the site.

---

## Files

| File | Purpose |
|------|---------|
| `static/admin/index.html` | CMS entry point — loads Decap from CDN |
| `static/admin/config.yml` | Defines editable collections and fields |
| `api/oauth/auth.js` | Starts GitHub OAuth for Decap |
| `api/oauth/callback.js` | Exchanges the GitHub code for a token and returns it to Decap |

---

## Auth setup

Decap CMS uses a GitHub OAuth app through Vercel serverless functions so the GitHub client secret is never exposed in the browser.

**GitHub OAuth App settings:**
- Authorization callback URL: `https://whatisverdezul.com/api/oauth/callback`
- Homepage URL: `https://whatisverdezul.com`

**Vercel env vars required:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

**Decap backend settings:**

```yaml
backend:
  name: github
  repo: arts-link/whatisverdezul.com
  branch: main
  base_url: https://www.whatisverdezul.com
  auth_endpoint: api/oauth/auth
```

`base_url` is the **origin only, with no path** — Decap's popup handshake does a strict `===` comparison against it, so appending `/api/oauth` breaks login. The path goes in `auth_endpoint` instead. It is `www` because `www` is canonical (`hugo.toml` `baseURL` plus the apex→www redirect in `vercel.json`).

The repo is private, so OAuth keeps `scope=repo`.

If Decap CMS auth proves fussy after these routes are verified, consider Sveltia CMS as a later fallback. It can use the same data and collection model.

---

## Collection overview

| Collection | Type | File edited |
|-----------|------|-------------|
| Band Info | single file | `data/band.json` |
| Social Links | single file | `data/social.json` |
| Shows | file with `items` list | `data/shows.json` |
| Streaming Page | file with `items` list + one scalar | `data/streaming.json` |
| Press Quotes | file with `items` list | `data/press.json` |
| Releases | file with `items` list | `data/releases.json` |
| Shop / Merch | file with `items` list | `data/merch.json` |
| Pages | single files | `content/_index.md`, `content/about/_index.md`, `content/contact/_index.md` |

List-backed collections must be Decap file collections with a list field named `items`; do not configure them as top-level `file` + `widget: list` collections.

---

## Editable list fields

### Shows

`data/shows.json`:
- `items[].title` — event name
- `items[].date` — datetime widget, stored as `YYYY-MM-DD`
- `items[].city` — city and state; defaults to `Los Angeles, CA` for new entries
- `items[].venue` — optional
- `items[].description` — optional
- `items[].ticket_url` — optional
- `items[].sold_out` — boolean

### Releases

`data/releases.json`:
- `items[].title`
- `items[].type` — select: `album`, `ep`, `single`
- `items[].year` — integer
- `items[].song_count` — integer, minimum `1`
- `items[].description` — optional
- `items[].spotify_url` — optional
- `items[].apple_music_url` — optional
- `items[].cover_image` — optional image
- `items[].featured` — boolean

### Streaming Page

`data/streaming.json` — the only collection mixing a scalar field with an `items` list:
- `spotify_embed_url` — optional string, `pattern: ^https://open\.spotify\.com/embed/`. Blank hides the Listen section.
- `items[].title` — video title
- `items[].youtube_id` — string, `pattern: ^[A-Za-z0-9_-]{11}$`
- `items[].thumbnail` — optional image override; falls back to YouTube's `maxresdefault.jpg`

Both `pattern` rules exist because the predictable editor mistake is pasting a full URL where an ID or embed link belongs. Decap rejects it in the form with the second array element as the message, instead of shipping a broken page. Keep that behavior if these fields are ever restructured.

### Press

`data/press.json`:
- `items[].quote`
- `items[].source`
- `items[].url` — optional
- `items[].date` — string, e.g. `2026-01`

### Merch

`data/merch.json`:
- `items[].name`
- `items[].price` — number
- `items[].description` — optional
- `items[].image`
- `items[].checkout_url` — optional external checkout URL
- `items[].sold_out` — boolean

---

## Media uploads

```yaml
media_folder: static/images/uploads
public_folder: /images/uploads
```

Decap writes uploaded media into Hugo's `static/` tree, and templates reference the public URL under `/images/uploads`.

---

## Adding a new editable field

1. Add the field to the appropriate `data/*.json` file.
2. Add the corresponding widget in `static/admin/config.yml`.
3. Update the Hugo template that consumes the field.
4. Update [[content-model]] with the field definition.
5. Run [[coding-agent-checklist]] before marking the task complete.

## Related knowledge

- [[content-model]] — the data shapes that CMS collections write to
- [[architecture]] — where these files live
