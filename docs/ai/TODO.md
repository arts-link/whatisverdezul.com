---
name: todo
description: Open engineering cleanup backlog from the Verdèzul code audit
metadata:
  type: backlog
  status: active
  updated: 2026-06-05
  tags: [todo, audit, cleanup, engineering]
  related: [AGENT_START.md, AI_INDEX.md, checklists/coding-agent-checklist.md]
---

# Verdèzul Engineering TODO

Use this as the running backlog for audit follow-up work. Keep statuses current when work lands.

| Status | Priority | Item | Notes |
|---|---:|---|---|
| Open | P1 | Swap Decap OAuth env vars back to the production GitHub OAuth App after DNS cutover | `api/oauth/auth.js` and `callback.js` now derive `redirect_uri` from the request host, so the code works on any domain automatically. But GitHub OAuth Apps only support one registered callback URL each, so the Vercel Production env vars `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` are temporarily set to a dev GitHub OAuth App (callback `https://whatisverdezul-com.vercel.app/api/oauth/callback`) for testing before DNS is live. Once DNS resolves, reset Production env vars to the original GitHub OAuth App's credentials (callback `https://whatisverdezul.com/api/oauth/callback`). `static/admin/config.yml`'s `backend.base_url` was also temporarily pointed at `https://whatisverdezul-com.vercel.app/api/oauth` — revert it to `https://whatisverdezul.com/api/oauth` at the same time. |
| Open | P1 | Configure or guard PostHog initialization | Ryder expects `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` or matching params. Confirm Vercel env names and avoid runtime failures when analytics is unavailable. |
| Open | P2 | Complete analytics event coverage | Ensure active CTAs emit documented events: `ticket_link_click`, `merch_click`, `email_signup_submit`, `email_signup_success`, `spotify_play_click`, `youtube_play_click`, and `social_follow_click`. |
| Open | P3 | Reduce static asset duplication | `images/` and `static/images/` contain many duplicate binaries. Decide whether assets should be Hugo-processed or served directly, then remove the redundant copy. |
| Open | P3 | Simplify CSS/layout structure | Move repeated inline styles into `assets/css/extended/verdezul.css`, reuse partials for social icons and embeds, and keep active layouts small. |
| Open | P3 | Review image optimization | Several logos/images are large for their rendered size. Add optimized variants only after deciding the source asset directory strategy. |

## Recently Completed

- Hardened Decap CMS list-backed collections using file collections with `items` arrays.
- Canonicalized Shows around `/shows/` and `data/shows.json`.
- Fixed Decap OAuth routing with `/api/oauth/auth` and `/api/oauth/callback`.
- Normalized merch checkout to `checkout_url` and release fields to lowercase `type` plus `song_count`.
- Updated core AI engineering docs to match active routes and CMS data shape.
- Fixed Shows `MusicEvent` schema to emit on `/shows/`.
- Converted site-specific JSON-LD to Hugo dictionaries plus `jsonify`.
- Removed duplicate/dead `single.html` section templates that drifted from active `_index.md` list templates while keeping the required home override.
- Hardened active template JS event payloads with `jsonify` for CMS/data-derived values.
