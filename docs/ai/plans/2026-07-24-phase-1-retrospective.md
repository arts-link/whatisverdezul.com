---
name: phase-1-retrospective
description: Retrospective at the close of Phase 1 (launch) of the Verdèzul website, with the remaining backlog to finish
metadata:
  type: retrospective
  status: active
  updated: 2026-07-24
  tags: [retrospective, phase-1, launch, backlog]
  related: [TODO.md, plans/2026-05-15-initial-site-plan.md, AGENT_START.md]
---

# Phase 1 Retrospective — Verdèzul Website Launch

Phase 1 ran from the initial plan (2026-05-15) through launch hardening
(last commit 2026-07-21). The site is live at whatisverdezul.com, deployed
from `main` on Vercel.

---

## What shipped

- **Full site**: Home (custom hero — tiled logo background, neon green
  statement box), About, Music, Shows, Shop, Contact; Press built but hidden
  until `data/press.json` has items.
- **Stack as planned**: Hugo + Ryder theme (submodule, never edited —
  everything customized via `layouts/` overrides, `-verdezul` partial
  variants, and `assets/css/extended/verdezul.css`), TailwindCSS, Alpine.js
  (CSP build), Vercel auto-deploy.
- **Git-based CMS**: Decap CMS at `/admin` with GitHub OAuth through Vercel
  serverless proxy; all client content in `data/*.json` file collections
  with `items` arrays.
- **Forms**: contact form and email signup both on Formspree — the planned
  Resend contact function and Buttondown signup proxy were replaced,
  shrinking the serverless footprint to the OAuth proxy alone. Signups
  collect into a Google Sheet; newsletter platform deliberately deferred.
- **Analytics**: PostHog wired through Ryder's provider param with full
  custom event coverage (ticket, merch, streaming, social, form events);
  dead click handlers fixed post-launch.
- **SEO/GEO**: OG images, MusicGroup/MusicEvent/MusicAlbum JSON-LD
  (Hugo dictionaries + `jsonify`), llms.txt output.
- **Docs**: `docs/ai/` knowledge base built before code and kept current
  through launch; band-facing email-list guide in `docs/for-the-band/`.

## What went well

- **Docs-first paid off** — every session (human or AI) started from the
  same context; conventions like the Verdèzul accent rule and the
  override-never-fork rule held across ~90 commits with no drift into the
  theme submodule.
- **Owning the theme** made deep customization cheap: the entire visual
  identity was achieved through Ryder's variant-partial params and Hugo's
  lookup order.
- **The data-file content model** mapped cleanly from the onboarding
  checklist to `data/*.json` to CMS collections — one shape end to end.
- **Willingness to pivot**: dropping Buttondown and Resend for Formspree
  simplified the architecture mid-build instead of after launch.
- Small, reviewable design-dial commits kept client feedback loops fast.

## What was harder than expected

- **CSP friction**: the Alpine CSP build's restrictions (no `fetch()` or
  arrow functions inline) forced forms into registered `Alpine.data`
  components; YouTube/Spotify iframes, inline JSON-LD, and Formspree each
  needed explicit CSP allowances.
- **Submodule + Vercel**: the theme URL had to be public HTTPS, and the
  build needed explicit submodule init plus the Hugo framework declared in
  `vercel.json` before deploys were reliable.
- **Decap OAuth around DNS cutover**: GitHub OAuth Apps allow one callback
  URL each, which required a temporary dev OAuth app pointed at the
  `.vercel.app` domain (see backlog item 1).
- Hugo 0.146 layout resolution (home override must live at
  `layouts/_default/home.html`) and section list templates caused a round
  of blank-page fixes.

---

## Still to be finished (Phase 2 backlog)

### 1. Wrap up the CMS  *(P1)*

The CMS works, but is still running on temporary auth wiring from the DNS
cutover window:

- Swap Vercel Production `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` from the
  dev GitHub OAuth App (callback on `whatisverdezul-com.vercel.app`) back to
  the production OAuth App (callback `https://whatisverdezul.com/api/oauth/callback`).
- Revert `static/admin/config.yml` `backend.base_url` to
  `https://whatisverdezul.com` (origin only — Decap's popup handshake does a
  strict `===` check), leaving `auth_endpoint: api/oauth/auth` unchanged.
- Verify the full loop on the production domain: log in at `/admin`, edit a
  show, confirm the commit lands on `main` and the site redeploys.
- Walk the band through the admin UI once auth is final (hand-off session).

### 2. Launch the merch store  *(P1)*

- `data/merch.json` is currently an **empty `items` array** — sample merch
  was removed before launch, so the Shop page has no products.
- Needed from/with the client: real product list, product photos, pricing,
  and external checkout links (PayPal / MerchTable / Bandcamp or similar per
  the onboarding checklist), plus limited/preorder/ongoing status per item.
- Populate via the CMS (Shop collection already defined; checkout field
  normalized to `checkout_url`), confirm merch PostHog events fire on real
  checkout links, and review the Shop layout with a full product grid.

### 3. Carry-over engineering cleanup  *(P3 — from TODO.md)*

- Deduplicate `images/` vs `static/images/` and settle the Hugo-processed
  vs static asset strategy.
- Move repeated inline styles into `verdezul.css`; reuse partials for
  social icons and embeds.
- Optimize oversized images (including `logo-white-trans.png`) once the
  asset directory strategy is decided.

### 4. Deferred by design (revisit when ready)

- Newsletter/sending platform selection once the band has a real list
  (signups currently accumulate in a Google Sheet via Formspree).
- Press section content — layout ships enabled the moment
  `data/press.json.items` gets its first entry.
- Sveltia CMS remains the fallback if Decap auth misbehaves long-term.

---

*Statuses live in `docs/ai/TODO.md` — keep that file current as Phase 2
items land; this retrospective is a point-in-time snapshot at Phase 1 close.*
