---
name: todo
description: Open engineering cleanup backlog from the Verdèzul code audit
metadata:
  type: backlog
  status: active
  updated: 2026-07-25
  tags: [todo, audit, cleanup, engineering]
  related: [AGENT_START.md, AI_INDEX.md, checklists/coding-agent-checklist.md, specs/ryder-v0.3-spec.md]
---

# Verdèzul Engineering TODO

Use this as the running backlog for audit follow-up work. Keep statuses current when work lands.

| Status | Priority | Item | Notes |
|---|---:|---|---|
| Open | P1 | Finish www production cutover for Decap OAuth (needs Vercel + GitHub actions) | Code side is done: `static/admin/config.yml` `backend.base_url` is now `https://www.whatisverdezul.com` (origin only — Decap's popup handshake does a strict `===` check against `base_url`, so no path) with `auth_endpoint: api/oauth/auth`; `hugo.toml` `baseURL` and a `vercel.json` non-www→www redirect make **www canonical everywhere**. `api/oauth/auth.js` + `callback.js` derive `redirect_uri` from the request host, so they work on www automatically. **Remaining (outside the repo):** (1) In Vercel, add both `whatisverdezul.com` and `www.whatisverdezul.com` to the project and set **www as primary**, then redeploy. (2) Set Production `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` to a GitHub OAuth App whose Authorization callback URL is exactly `https://www.whatisverdezul.com/api/oauth/callback`. (3) **Fix the org restriction** (saving currently fails with `OAuth App access restrictions`): the `arts-link` org has "Access restricted" and the CMS app isn't approved. Cleanest fix — create the OAuth App **under the arts-link org** (Org → Settings → Developer settings → OAuth Apps), since org-owned apps always have access and never need per-app approval. (Alternative: keep a personal app and Grant it on the org's third-party access policy page.) The `whatisverdezul-com.vercel.app` dev OAuth App was only for pre-DNS testing and can be retired. |
| Open | P2 | Land the Ryder theme fixes upstream | [[ryder-v0.3-spec]] specs the changes to `arts-link/ryder` that this site's overrides and workarounds justify — 8 silent-failure defects, 7 missing extension points, and the CSP-safe Alpine primitives that three production outages (`e7bbfe1`, `d52b9cc`, `3d620e9`) all trace back to. Work happens in the theme repo, not here. When it lands, re-point the submodule and delete the override list in that spec's "real success metric" section — that deletion is the acceptance test. Also fixes the dead `hero_about_click` handler at `layouts/_default/home.html:6-8`, which reintroduced the pattern `e7bbfe1` removed. |
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
- Fixed Shows `MusicEvent` schema to emit on `/shows/`.
- Converted site-specific JSON-LD to Hugo dictionaries plus `jsonify`.
- Removed duplicate/dead `single.html` section templates that drifted from active `_index.md` list templates while keeping the required home override.
- Hardened active template JS event payloads with `jsonify` for CMS/data-derived values.
