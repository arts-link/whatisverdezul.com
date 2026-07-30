---
name: todo
description: Open engineering cleanup backlog from the Verdèzul code audit
metadata:
  type: backlog
  status: active
  updated: 2026-07-30
  tags: [todo, audit, cleanup, engineering]
  related: [AGENT_START.md, AI_INDEX.md, checklists/coding-agent-checklist.md]
---

# Verdèzul Engineering TODO

Use this as the running backlog for audit follow-up work. Keep statuses current when work lands.

| Status | Priority | Item | Notes |
|---|---:|---|---|
| Open | P2 | Emit `MusicEvent` JSON-LD on `/shows/` | Listed under Recently Completed below, but a production build of `/shows/` emits only `WebPage`, `BlogPosting`, `BreadcrumbList`, `ListItem`, `Organization` and `Person` — no `MusicEvent`, and no site-wide `MusicGroup` despite `[params.schema] type = "MusicGroup"` in `hugo.toml`. `grep` finds no `ld+json` in `layouts/` beyond `schema-extra.html` (home-only `MusicAlbum`). Either it regressed or it never landed. This is the schema that puts shows into Google's event listings, so it matters for the band's booking goal — see `strategy/site-goals.md`. Verify against `public/shows/index.html`, not against this file. |
| Open | P3 | Decide on `robots.txt` | Hugo emits none (`enableRobotsTXT` is unset in `hugo.toml`), so there is no `public/robots.txt` and nothing points crawlers at `/sitemap.xml`. Absence is permissive, not blocking, but a one-line sitemap reference is the usual practice. |
| Done | P1 | Finish www production cutover for Decap OAuth | **Resolved 2026-07-30.** Decap commits land on `main` (the `Update Shows "shows"` / `Update Page Content "home"` runs), which proves OAuth, the org restriction and the www cutover all work end to end. For reference, the working configuration: `static/admin/config.yml` `backend.base_url` = `https://www.whatisverdezul.com` (origin only — Decap's popup handshake does a strict `===` check against `base_url`, so no path) with `auth_endpoint: api/oauth/auth`; `hugo.toml` `baseURL` plus the `vercel.json` non-www→www redirect make **www canonical everywhere**; `api/oauth/auth.js` and `callback.js` derive `redirect_uri` from the request host. The GitHub OAuth App is owned by the `arts-link` org (org-owned apps bypass the "Access restricted" third-party policy that was blocking saves) with callback URL exactly `https://www.whatisverdezul.com/api/oauth/callback`. The `whatisverdezul-com.vercel.app` dev OAuth App was only for pre-DNS testing and can be retired. |
| Open | P3 | Reduce static asset duplication | `images/` and `static/images/` contain many duplicate binaries. Decide whether assets should be Hugo-processed or served directly, then remove the redundant copy. |
| Open | P3 | Simplify CSS/layout structure | Move repeated inline styles into `assets/css/extended/verdezul.css`, reuse partials for social icons and embeds, and keep active layouts small. |
| Open | P3 | Review image optimization | Several logos/images are large for their rendered size. Add optimized variants only after deciding the source asset directory strategy. |

## Recently Completed

- Configured Ryder's PostHog integration with `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST`, guarded optional capture calls, and documented the active settings.
- Completed analytics event coverage for active CTAs and normalized merch, social, and press event names and properties.
- Hardened Decap CMS list-backed collections using file collections with `items` arrays.
- Canonicalized Shows around `/shows/` and `data/shows.json`.
- Fixed Decap OAuth routing with `/api/oauth/auth` and `/api/oauth/callback`.
- Normalized merch checkout to `checkout_url` and release fields to lowercase `type` plus `song_count`.
- Updated core AI engineering docs to match active routes and CMS data shape.
- ~~Fixed Shows `MusicEvent` schema to emit on `/shows/`.~~ **Not actually true** — reopened as a P2 above after checking the built output.
- Converted site-specific JSON-LD to Hugo dictionaries plus `jsonify`.
- Removed duplicate/dead `single.html` section templates that drifted from active `_index.md` list templates while keeping the required home override.
- Hardened active template JS event payloads with `jsonify` for CMS/data-derived values.
