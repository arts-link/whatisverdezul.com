---
name: todo
description: Open engineering cleanup backlog from the Verdèzul code audit
metadata:
  type: backlog
  status: active
  updated: 2026-05-20
  tags: [todo, audit, cleanup, engineering]
  related: [AGENT_START.md, AI_INDEX.md, checklists/coding-agent-checklist.md]
---

# Verdèzul Engineering TODO

Use this as the running backlog for audit follow-up work. Keep statuses current when work lands.

| Status | Priority | Item | Notes |
|---|---:|---|---|
| Open | P1 | Fix shop checkout contract | Active shop template uses PayPal hosted button fields, while CMS/docs describe `checkout_url`; current data has `PLACEHOLDER_*` button IDs. Also check CSP `form-action` before enabling PayPal posts. |
| Open | P1 | Configure or guard PostHog initialization | Ryder expects `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` or matching params. Confirm Vercel env names and avoid runtime failures when analytics is unavailable. |
| Open | P1 | Verify Decap OAuth route | Docs mention `/api/oauth/callback`, but the function is `api/oauth/index.js`. Align GitHub OAuth app settings, Decap `base_url`, and Vercel function routing. |
| Open | P2 | Complete analytics event coverage | Ensure active CTAs emit documented events: `ticket_link_click`, `merch_click`, `email_signup_submit`, `email_signup_success`, `spotify_play_click`, `youtube_play_click`, and `social_follow_click`. |
| Open | P2 | Reconcile CMS, data, and content model | Resolve drift around `tour` vs `shows`, `media` vs `music`, release `type` casing, `song_count`, and merch checkout fields. Update `docs/ai/engineering/*` and `static/admin/config.yml` together. |
| Open | P2 | Normalize docs to active routes | Update architecture/routes docs to reflect `/shows/` and `/music/` as the canonical public routes, or add redirects if old routes need to survive. |
| Open | P3 | Reduce static asset duplication | `images/` and `static/images/` contain many duplicate binaries. Decide whether assets should be Hugo-processed or served directly, then remove the redundant copy. |
| Open | P3 | Simplify CSS/layout structure | Move repeated inline styles into `assets/css/extended/verdezul.css`, reuse partials for social icons and embeds, and keep active layouts small. |
| Open | P3 | Review image optimization | Several logos/images are large for their rendered size. Add optimized variants only after deciding the source asset directory strategy. |

## Recently Completed

- Fixed Shows `MusicEvent` schema to emit on `/shows/`.
- Converted site-specific JSON-LD to Hugo dictionaries plus `jsonify`.
- Removed duplicate/dead `single.html` section templates that drifted from active `_index.md` list templates while keeping the required home override.
- Hardened active template JS event payloads with `jsonify` for CMS/data-derived values.
