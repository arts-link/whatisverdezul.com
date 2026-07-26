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
| Open | P2 | Land the Ryder theme fixes upstream | [[ryder-v0.3-spec]] specs the changes to `arts-link/ryder` that this site's overrides and workarounds justify — 8 silent-failure defects, 7 missing extension points, and the CSP-safe Alpine primitives that three production outages (`e7bbfe1`, `d52b9cc`, `3d620e9`) all trace back to. Work happens in the theme repo, not here. When it lands, re-point the submodule and delete the override list in that spec's "real success metric" section — that deletion is the acceptance test. Also fixes the dead `hero_about_click` handler at `layouts/_default/home.html:6-8`, which reintroduced the pattern `e7bbfe1` removed. |
| Open | P3 | Retire the pre-DNS dev OAuth App | The `whatisverdezul-com.vercel.app` GitHub OAuth App existed only for testing before DNS pointed at the custom domain. Production now authenticates through the www app, so this one is unused credential surface — delete it in GitHub (Org → Settings → Developer settings → OAuth Apps) and confirm no Vercel environment still references its client ID/secret. Outside the repo; nothing here reads it. |
| Open | P3 | Reduce static asset duplication | `images/` and `static/images/` contain many duplicate binaries. Decide whether assets should be Hugo-processed or served directly, then remove the redundant copy. |
| Open | P3 | Simplify CSS/layout structure | Move repeated inline styles into `assets/css/extended/verdezul.css`, reuse partials for social icons and embeds, and keep active layouts small. |
| Open | P3 | Review image optimization | Several logos/images are large for their rendered size. Add optimized variants only after deciding the source asset directory strategy. |

## Recently Completed

- **Finished the www production cutover for Decap OAuth.** Verified by working CMS saves, not by inspection: `static/admin/config.yml` sets `base_url: https://www.whatisverdezul.com` with `auth_endpoint: api/oauth/auth`, and six commits on 2026-07-24 carry Decap's `Update Page Content "<slug>"` template against the `Page Content` collection's `home` and `about` files — authored via the GitHub API identity (`1317281+benstraw@users.noreply.github.com`) rather than the local git one. The first landed at 11:11, two minutes after PR #9 made www canonical, with a second batch an hour later. A successful save requires the OAuth handshake to complete against www, so this also confirms the production app's callback URL and — since the failure mode was `OAuth App access restrictions` — that the `arts-link` org restriction is resolved. Vercel's domain-primary setting wasn't directly verifiable, but the `vercel.json` non-www→www permanent redirect makes it moot.
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
