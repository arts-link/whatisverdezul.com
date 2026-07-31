---
name: todo
description: Open engineering cleanup backlog from the Verdèzul code audit
metadata:
  type: backlog
  status: active
  updated: 2026-07-31
  tags: [todo, audit, cleanup, engineering]
  related: [AGENT_START.md, AI_INDEX.md, engineering/cms-risks.md, checklists/coding-agent-checklist.md]
---

# Verdèzul Engineering TODO

Use this as the running backlog for audit follow-up work. Keep statuses current when work lands.

| Status | Priority | Item | Notes |
|---|---:|---|---|
| Done | P1 | Finish www production cutover for Decap OAuth | **Resolved 2026-07-30.** Decap commits land on `main` (the `Update Shows "shows"` / `Update Page Content "home"` runs), which proves OAuth, the org restriction and the www cutover all work end to end. For reference, the working configuration: `static/admin/config.yml` `backend.base_url` = `https://www.whatisverdezul.com` (origin only — Decap's popup handshake does a strict `===` check against `base_url`, so no path) with `auth_endpoint: api/oauth/auth`; `hugo.toml` `baseURL` plus the `vercel.json` non-www→www redirect make **www canonical everywhere**; `api/oauth/auth.js` and `callback.js` derive `redirect_uri` from the request host. The GitHub OAuth App is owned by the `arts-link` org (org-owned apps bypass the "Access restricted" third-party policy that was blocking saves) with callback URL exactly `https://www.whatisverdezul.com/api/oauth/callback`. The `whatisverdezul-com.vercel.app` dev OAuth App was only for pre-DNS testing and can be retired. |
| Open | P1 | Pin or self-host the Decap CMS bundle | [[cms-risks]] S1. `static/admin/index.html:11` loads `decap-cms@^3.0.0` from unpkg — a semver range resolved at page load, no SRI, no `crossorigin`, and no CSP (a `static/` file, so the theme's `[params.csp]` never reaches it and `vercel.json` sets no headers). Decap holds each editor's GitHub token in `localStorage` on that origin. Pin an exact version + `integrity` + `crossorigin`, or self-host from npm. Add a `headers` block in `vercel.json` scoping a CSP to `/admin/*`. |
| Open | P1 | Narrow the OAuth scope to `public_repo` | [[cms-risks]] S2. `api/oauth/auth.js:13` requests `scope=repo` — full write on every private repo the editor can reach, including `arts-link/ryder`. The repo is **public**, so `public_repo` suffices. Fix the wrong "repo is private" justification in [[cms-config]] at the same time, and revoke existing OAuth grants so nobody keeps a wide token. |
| Open | P2 | Verify the OAuth callback's postMessage origin | [[cms-risks]] S3. `api/oauth/callback.js:41-48` broadcasts to `"*"` and posts the access token to `e.origin` unchecked. Compare against `https://www.whatisverdezul.com` before sending, target the handshake at that origin, pin the `redirect_uri` host allowlist (`auth.js:9`, `callback.js:10`), and validate the `state` round-trip. |
| Done | P2 | Correct the drifted statements in `cms-config.md` | **Resolved 2026-07-31.** [[cms-risks]] S9. Three errors fixed: the claim that the repo is private (it is public — that sentence is what made S2's wide OAuth scope look justified), the apex OAuth callback URL where `www` is canonical, and a `featured` field listed on Releases that never existed in `static/admin/config.yml`. |
| Open | P3 | Add a build-verification workflow | [[cms-risks]] S5. No `.github/workflows/` exists, so a publish that breaks the build fails silently — the editor sees a successful save and the site simply never changes. Run the `vercel.json` sequence (submodule init → `npm install` → `hugo --minify`) on push to `main`. Note the failure mode is "the edit doesn't appear", not "the site goes down" — Vercel keeps serving the last good deploy. |
| Open | P3 | Decide the image strategy, then move CMS media into it | [[cms-risks]] S6. Supersedes the former "static asset duplication" and "image optimization" rows — all three are the same decision. `media_folder: static/images/uploads` bypasses Hugo entirely (nothing under `static/` is processed), so uploads ship at full size forever and land in git history permanently. `images/` and `static/images/` also hold duplicate binaries. Move media to `assets/images/uploads` and render via `resources.Get` → `.Resize` in the merch, release-cover and thumbnail partials. **Do this before the band uploads anything** — `static/images/uploads` does not exist yet. |
| Open | P3 | Add `pattern` validation to the remaining URL fields | [[cms-risks]] S7. Only `spotify_embed_url` and `youtube_id` are validated. `ticket_url`, `checkout_url`, `press[].url` and the seven social URLs are free strings. Not an XSS issue — Hugo autoescapes `href` and `jsonify` handles the JSON-LD — but wrong-platform and malformed URLs reach the live site, and unescaped values mangle `layouts/_default/home.llmstxt.txt`. Follow the two existing Streaming patterns for message style. |
| Open | P3 | Simplify CSS/layout structure | Move repeated inline styles into `assets/css/extended/verdezul.css`, reuse partials for social icons and embeds, and keep active layouts small. |

## Accepted trade-offs

Not work items. Recorded so they are re-decided deliberately rather than drifted into.

- **Direct publish to `main`, no review** ([[cms-risks]] S4). Deliberate, and exactly what
  `docs/for-the-band/site-handoff.md` §3 promises the band. Enabling
  `publish_mode: editorial_workflow` would cost them one-click publishing and requires
  rewriting that section first — it is a client decision, never a side effect of another
  task. The Band team's repo **Write** grant is broader than the CMS needs; worth revisiting
  alongside any change here.
- **Decap as the CMS** ([[cms-risks]] S8). Maintenance cadence is slow and Sveltia CMS is
  the named fallback, which stays cheap only while the config avoids Decap-only features.
  Content is plain JSON and Markdown in git, so losing the CMS is an inconvenience, not
  data loss.

## Recently Completed

- Configured Ryder's PostHog integration with `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST`, guarded optional capture calls, and documented the active settings.
- Completed analytics event coverage for active CTAs and normalized merch, social, and press event names and properties.
- Hardened Decap CMS list-backed collections using file collections with `items` arrays.
- Canonicalized Shows around `/shows/` and `data/shows.json`.
- Fixed Decap OAuth routing with `/api/oauth/auth` and `/api/oauth/callback`.
- Normalized merch checkout to `checkout_url` and release fields to lowercase `type` plus `song_count`.
- Updated core AI engineering docs to match active routes and CMS data shape.
- Emitted `MusicEvent` JSON-LD per upcoming show on `/shows/` from `head/schema-extra.html` (PR #18). **An earlier version of this list claimed this was already done while the built output emitted no `MusicEvent` at all** — verify entries here against `public/`, not against this file.
- Added `robots.txt` (`layouts/home.robots.txt`) with a `Sitemap:` reference, and disabled the unused `taxonomy`/`term` kinds so empty `/categories/` and `/tags/` pages left the sitemap.
- Converted site-specific JSON-LD to Hugo dictionaries plus `jsonify`.
- Removed duplicate/dead `single.html` section templates that drifted from active `_index.md` list templates while keeping the required home override.
- Hardened active template JS event payloads with `jsonify` for CMS/data-derived values.
