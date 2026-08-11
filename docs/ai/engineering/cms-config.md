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

### `branch` is absolute — previews edit `main` too

`backend.branch: main` has nothing to do with which deployment served the admin
UI. **Every** `/admin` — production and every Vercel preview — reads and writes
`main`. Loading the admin from a preview URL does not point it at that preview's
branch.

That matters during a schema migration, because a preview serves the **new**
`config.yml` against `main`'s **old** data. Decap then renders honest mismatch
errors that look like a broken config but are not:

| Symptom in the admin | What it actually means |
|---|---|
| A list shows `0 items` | The field was renamed or newly added; `main`'s data has no such key yet |
| `Error: item has no '<key>' property` | A variable-type list's `typeKey` is missing from `main`'s existing rows |

Both self-resolve on merge. This happened for real on
`claude/footer-streaming-admin-b1el31`: the preview admin showed "0 social links"
and three `item has no 'platform' property` rows, purely because `data/social.json`
was still the flat object and `data/streaming.json` had no `platform` keys on `main`.

> **Never save from a preview admin while those errors are showing.** An empty
> list widget commits `{"items": []}`, which *deletes the live data on `main`*.
> In the case above, one save on the Social Links collection would have wiped all
> seven social links from the production footer, the JSON-LD `sameAs` array, and
> `llms.txt`. Nothing in the UI warns you — an empty list looks like an empty list.
> Decap's "CHANGES SAVED" header is its local draft autosave, not a commit, so
> closing the tab without saving is safe.

Two rules follow:

1. **Ship the migrated `data/*.json` and the `config.yml` change in the same commit.** Then the merge is atomic and there is never a window where `main` holds one without the other.
2. **A CMS schema change cannot be validated before it reaches `main`.** Review it by reading the diff; the admin UI is only trustworthy post-merge. If a genuine pre-merge click-through is ever needed, the fix is to generate `config.yml` at build time with `branch` from `VERCEL_GIT_COMMIT_REF` — considered and declined as not worth the risk, but that is the route.

Right after merging, expect the same mismatch **inverted** for a minute or two:
production still serves the previous build's old `config.yml` against the new
data until Vercel finishes redeploying. Reload once the deploy completes before
concluding anything is wrong.

---

## Collection overview

| Collection | Type | File edited |
|-----------|------|-------------|
| Band Info | single file | `data/band.json` |
| Social Links | file with `items` list | `data/social.json` |
| Shows | file with `items` list | `data/shows.json` |
| Streaming Page | file with variable-type `items` list | `data/streaming.json` |
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
- `items[].featured` — boolean. **Must stay configured here**: `schema-extra.html` reads it to emit the MusicAlbum JSON-LD, and Decap silently drops any key with no widget the moment an editor saves the collection.

### Social Links

`data/social.json` — a list, so the band can add platforms and reorder the
footer icons without a developer:
- `items[].platform` — select. Picks the brand icon; `other` falls back to a neutral link glyph.
- `items[].label` — optional string, only meaningful when `platform` is `other`.
- `items[].url` — string, `pattern: ^https?://`

Adding a platform to the dropdown means adding the same key to
`layouts/partials/social-icon.html` (the path) and
`layouts/partials/social-name.html` (the display name), or it will render with
the generic `other` icon.

### Streaming Page

`data/streaming.json` — the only collection using a **variable-type list**
(`widget: list` with `types:` and `typeKey: platform`). That is what makes
"Add Embed" a dropdown of YouTube / Spotify / SoundCloud within a single
drag-reorderable list, so embeds do not have to be grouped by platform. The
scalar `spotify_embed_url` that used to sit beside the list is gone — Spotify is
now just another item type.

- `items[]` type `youtube` — `title`; `youtube_id` string, `pattern: ^[A-Za-z0-9_-]{11}$`; `thumbnail` optional image override, falls back to YouTube's `maxresdefault.jpg`
- `items[]` type `spotify` — `title`; `spotify_embed_url` string, `pattern: ^https://open\.spotify\.com/embed/`
- `items[]` type `soundcloud` — `title`; `soundcloud_url` string, `pattern: ^https://soundcloud\.com/`; `player_size` select (`compact` 166px / `large` 450px)

All three `pattern` rules exist because the predictable editor mistake is pasting a full URL where an ID or embed link belongs — or, for SoundCloud, pasting the whole `<iframe>` embed code instead of the address-bar link. Decap rejects it in the form with the second array element as the message, instead of shipping a broken page. Keep that behavior if these fields are ever restructured.

`typeKey: platform` is deliberate rather than Decap's default `type`: the Hugo
templates branch on `.platform`, and reusing that key keeps the CMS shape and
the data shape identical.

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
