# Verdèzul Website — Implementation Plan

## Context

Arts-Link is building the official Verdèzul band website per the SOW. The site needs to be fast, mobile-friendly, visually distinctive (wilderness/earthtones aesthetic, Verdèzul identity), and easy for the client to update over time. The deliverable is a static site with a git-based CMS so tour dates, press quotes, merch, and other content can be edited via an admin UI without touching code. Hosting is on Vercel under the Arts-Link account, auto-deployed on git push.

---

## Framework Decision: Hugo + Ryder + Decap CMS

**Recommendation: Hugo** (not Astro), for these reasons:

1. **You wrote Ryder** — full ownership, no learning curve, all conventions are yours. Significant modification of a theme you authored is still faster than building from scratch in Astro.
2. **More total Hugo experience** — band sites are content-heavy and layout-stable; Hugo's template system shines here.
3. **Decap CMS + Hugo is the canonical git-CMS pairing** — more mature, more examples, cleaner `data/` file integration than TinaCMS+Hugo.
4. **Hugo data files are perfect for this use case** — tour dates, social links, press quotes, merch, config all live as JSON/YAML in `data/` and are trivially CMS-editable.
5. **Build speed** — Hugo rebuilds in milliseconds; important for a client-facing CMS where editors see a live preview.

**CMS: Decap CMS** with GitHub OAuth via a small Vercel serverless proxy function. This gives the client a clean `/admin` UI, all edits commit to `main`, and Vercel auto-deploys on commit. (Sveltia CMS is a drop-in replacement if Decap's auth proves fussy.)

**Stack:**
- Hugo 0.146.0+
- Ryder theme (as `themes/ryder/`, git subtree from `/Volumes/wanderer/dev/solo/ryder`)
- TailwindCSS (via Ryder's npm build)
- Alpine.js (bundled in Ryder)
- Decap CMS (static admin, GitHub OAuth)
- PostHog (analytics, using Ryder's existing `analytics_provider = "posthog"` param)
- Vercel (hosting, CI/CD from `main` branch)

---

## Phase 1: AI Docs (first thing built)

Mirrors the chill-dogs `docs/ai/` pattern. These docs are the persistent context layer for all future AI-assisted work on this project.

**File structure to create:**
```
docs/ai/
├── AI_INDEX.md              # Task-based routing table
├── AGENT_START.md           # Operating brief — minimum context to start any task
├── KNOWLEDGE_GRAPH.md       # Dependency chains between docs
├── strategy/
│   ├── band-context.md      # Core identity: name, bio, colors, links, SOW summary
│   ├── site-goals.md        # Primary goals (booking > fans > music > merch > press)
│   └── visual-direction.md  # Mood, references, color palette, aesthetic rules
├── engineering/
│   ├── architecture.md      # Hugo + Ryder stack, file layout, path conventions
│   ├── content-model.md     # All content types: frontmatter schemas, data file shapes
│   ├── cms-config.md        # Decap CMS collections, field definitions, auth setup
│   ├── routes-and-menus.md  # Hugo menu config, URL structure, section organization
│   ├── seo-and-schema.md    # OG tags, JSON-LD (MusicGroup, Event, etc.), canonical URLs
│   ├── analytics-events.md  # PostHog events (music plays, ticket clicks, merch clicks, etc.)
│   └── build-commands.md    # Hugo, npm, Vercel CLI commands
├── content/
│   ├── writing-guide.md     # Band voice, tone (wilderness, grounded, not over-produced)
│   └── media-embed-rules.md # YouTube, Spotify, SoundCloud embed rules
└── checklists/
    ├── page-publish-checklist.md     # Gate for new pages
    └── coding-agent-checklist.md     # Engineering finish gate
```

**Key content to capture in `band-context.md`:**
- Name: Verdèzul (exact spelling with accent)
- Email: verdezulofficial@gmail.com
- Location: Los Angeles, CA
- Vibe: "We are in the world, not of the world, but we reflect the world"
- Featured album: ETASOBAG (Earthtones and Shades of Blue and Green)
- Colors: Green, Blue, Black, White, Red (occasional), Brown (occasional)
- Aesthetic: wilderness, hunting/nature scenes, Verdèzul as globe/life
- Social handles: @bluepill.greenpill (IG + TikTok)
- Spotify: `1zf7vVM2XaoaTD3hXWR1If`
- YouTube: @Verdezul
- Featured videos: "Taxes Finnah Hit", "I Tell Ya"
- Visual references: awge.com, txdxe.com, golfwang.com, travisscott.com

---

## Phase 2: Project Scaffold

**Directory structure:**
```
whatisverdezul.com/
├── docs/ai/                 # Phase 1 (AI docs)
├── themes/ryder/            # Git subtree from ryder repo
├── content/
│   ├── _index.md            # Home
│   ├── about/_index.md
│   ├── tour/_index.md
│   ├── press/_index.md
│   ├── media/_index.md
│   ├── shop/_index.md
│   └── contact/_index.md
├── data/
│   ├── band.json            # Name, email, bio snippet, location
│   ├── social.json          # Social links (Ryder standard format)
│   ├── tour.json            # Tour dates array
│   ├── releases.json        # Discography / featured releases
│   ├── press.json           # Press quotes array
│   └── merch.json           # Shop items array
├── static/
│   └── admin/
│       ├── index.html       # Decap CMS entry point
│       └── config.yml       # CMS collections definition
├── layouts/
│   ├── index.html           # Home page override
│   ├── partials/
│   │   ├── tour-list.html   # Renders data/tour.json
│   │   ├── press-quotes.html
│   │   ├── merch-grid.html
│   │   ├── release-cards.html
│   │   └── social-icons.html
│   └── shortcodes/
│       ├── spotify-embed.html
│       └── youtube-embed.html
├── assets/css/
│   └── verdezul.css         # Site-specific styles (on top of Ryder)
├── hugo.toml                # Site config
├── package.json             # Inherits Ryder's npm scripts + adds site-level scripts
├── vercel.json              # Hugo build command, output dir
└── CLAUDE.md                # Project-level AI instructions (points to docs/ai/)
```

---

## Phase 3: Ryder Theme Integration

Ryder will be brought in as a **git submodule** — Hugo's conventional approach. Keeps the theme repo independent, allows `git submodule update --remote` to pull upstream changes, and Vercel supports submodules natively.

```bash
git submodule add https://github.com/arts-link/ryder themes/ryder
```

Vercel will automatically run `git submodule update --init --recursive` on deploy.

**Key `hugo.toml` params to configure:**
```toml
baseURL = "https://whatisverdezul.com/"
title = "Verdèzul"
theme = "ryder"

[params]
  analytics_provider = "posthog"
  posthog_key = "..."         # from Vercel env
  showDarkToggle = true
  logo_png = "/images/logo-white-trans.png"   # client logo — oversized for now, optimize later
  headerType = "-verdezul"    # custom header partial
  footerType = "-verdezul"    # custom footer partial
  menuType = "-verdezul"      # custom nav
```

**Custom partials** override Ryder's defaults without touching theme files:
- `layouts/partials/header-verdezul.html` — full-bleed hero treatment
- `layouts/partials/footer-verdezul.html` — social icons + email link
- `layouts/partials/menu-verdezul.html` — band nav (Home, About, Tour, Media, Press, Shop, Contact)

---

## Phase 4: Content Model + Data Files

All client-editable data lives in `data/` as JSON. Hugo templates consume these directly. Decap CMS edits these files through its UI.

**`data/tour.json` shape:**
```json
[
  {
    "date": "2026-06-14",
    "venue": "The Roxy",
    "city": "Los Angeles, CA",
    "description": "Headline show with special guests.",
    "ticket_url": "https://...",
    "sold_out": false
  }
]
```

**`data/press.json` shape:**
```json
[
  {
    "quote": "...",
    "source": "LA Weekly",
    "url": "https://...",
    "date": "2026-01"
  }
]
```

> **Press is hidden until populated.** The Press nav item and Press page content are conditionally rendered: `{{ if gt (len .Site.Data.press) 0 }}`. When `data/press.json` is an empty array `[]`, the nav item disappears and the page shows nothing. Same pattern applies to any section with no data yet.

**`data/releases.json` shape:**
```json
[
  {
    "title": "ETASOBAG",
    "type": "album",
    "year": 2025,
    "description": "Earthtones and Shades of Blue and Green — debut album.",
    "spotify_url": "https://open.spotify.com/...",
    "apple_music_url": "",
    "cover_image": "/images/releases/etasobag.jpg",
    "featured": true
  }
]
```

**`data/merch.json` shape:**
```json
[
  {
    "name": "Verdèzul Tee",
    "price": 35,
    "description": "Classic heavyweight tee in forest green with embroidered logo.",
    "image": "/images/merch/tee-green.jpg",
    "checkout_url": "https://paypal.com/...",
    "sold_out": false
  }
]
```

---

## Phase 5: Decap CMS Setup

**`static/admin/config.yml` collections:**

```yaml
backend:
  name: github
  repo: arts-link/whatisverdezul.com
  branch: main
  base_url: https://whatisverdezul.com   # OAuth proxy endpoint

media_folder: static/images/uploads
public_folder: /images/uploads

collections:
  # Site-wide config (single file)
  - name: config
    label: Site Config
    files:
      - name: band
        label: Band Info
        file: data/band.json
        fields:
          - { name: name, label: Band Name, widget: string }
          - { name: email, label: Contact Email, widget: string }
          - { name: location, label: City, widget: string }
          - { name: bio, label: Short Bio, widget: text }
      - name: social
        label: Social Links
        file: data/social.json
        fields: [instagram, tiktok, youtube, spotify, apple_music]

  # Tour dates (list)
  - name: tour
    label: Tour Dates
    file: data/tour.json
    label_singular: Tour Date
    widget: list
    fields: [date, venue, city, ticket_url, sold_out]

  # Press quotes (list)
  - name: press
    label: Press Quotes
    file: data/press.json
    label_singular: Quote
    widget: list
    fields: [quote, source, url, date]

  # Releases (list)
  - name: releases
    label: Releases
    file: data/releases.json
    label_singular: Release
    fields: [title, type, year, spotify_url, apple_music_url, cover_image, featured]

  # Merch (list)
  - name: merch
    label: Shop / Merch
    file: data/merch.json
    label_singular: Item
    fields: [name, price, image, checkout_url, sold_out]

  # Page content (markdown)
  - name: pages
    label: Pages
    files:
      - { name: home, label: Home Page, file: content/_index.md }
      - { name: about, label: About, file: content/about/_index.md }
      - { name: contact, label: Contact, file: content/contact/_index.md }
```

**Auth:** GitHub OAuth proxy via a small Vercel serverless function (`api/oauth/`) — handles the GitHub OAuth handshake so Decap can authenticate without Netlify. Standard pattern, ~30 lines of JS.

---

## Phase 6: Pages

All pages built as Hugo section layouts consuming `data/` files.

| Page | Layout file | Data consumed |
|------|------------|---------------|
| Home | `layouts/index.html` | releases.json (featured), tour.json (next 3), social.json |
| About | `layouts/about/single.html` | band.json, content body |
| Tour | `layouts/tour/single.html` | tour.json (all) |
| Press | `layouts/press/single.html` | press.json |
| Media | `layouts/media/single.html` | hardcoded YouTube/Spotify embeds + content |
| Shop | `layouts/shop/single.html` | merch.json |
| Contact | `layouts/contact/single.html` | band.json (email), contact form |

**Contact form:** Vercel's form handling via a small `api/contact.js` serverless function — receives POST, forwards to verdezulofficial@gmail.com via Resend or similar.

---

## Phase 7: SEO, GEO + Schema

- Hugo's built-in `baseof.html` → Ryder handles OG/Twitter meta already
- Override `layouts/partials/head/schema.html` to add:
  - `MusicGroup` JSON-LD on all pages
  - `MusicEvent` JSON-LD on Tour page (per event)
  - `MusicAlbum` JSON-LD on Media/Home release cards
- GEO: `llmstxt` output format (Hugo already configured in `hugo.toml` per Ryder's `LLMSTxt` output format)
- Each page gets descriptive meta description via frontmatter

---

## Phase 8: PostHog Analytics

Ryder's `analytics_provider = "posthog"` handles init. Track these events:

| Event | Trigger |
|-------|---------|
| `ticket_link_click` | Tour page ticket CTA |
| `spotify_play_click` | Spotify embed / release card |
| `youtube_play_click` | Media page video |
| `merch_click` | Shop item checkout link |
| `contact_form_submit` | Contact form submission |
| `social_follow_click` | Any social icon |
| `music_video_click` | Specific video CTAs on home |

---

## Phase 9: Email Collector

**Platform: Buttondown** (recommended). Reasons: indie-friendly, clean API, git-native workflow, no bloat. Mailchimp is overkill for a band newsletter at this stage and has worse deliverability pricing.

**Approach:** Simple HTML form → Vercel serverless function proxy → Buttondown API. The proxy is needed to keep the Buttondown API key server-side (not exposed in the static HTML).

```
api/subscribe.js   # POST handler: validates email, forwards to Buttondown
```

Buttondown API call:
```
POST https://api.buttondown.email/v1/subscribers
Authorization: Token <BUTTONDOWN_API_KEY>
{ "email": "...", "tags": ["verdezul-site"] }
```

**Form placement:**
- Home page — inline module (per SOW: "email collector" as a homepage element)
- Footer — compact single-field version on all pages except (optionally) shop item pages

**Form fields:** Email address only. Optional: first name (not required at launch).

**States to handle:** success message, already subscribed (409 from Buttondown → friendly message), invalid email (client-side validation).

**Environment variable:** `BUTTONDOWN_API_KEY` — added to Vercel env (preview + production).

**If client decides against Buttondown later:** the serverless proxy is the only thing that changes — the form HTML and UX stay identical. Mailchimp, ConvertKit, or any other provider slots in cleanly.

---

## Phase 10: Vercel Config

**`vercel.json`:**
```json
{
  "buildCommand": "npm run build-tw && hugo --minify",
  "outputDirectory": "public",
  "installCommand": "npm install"
}
```

Environment variables needed (set via `vercel env add`):
- `POSTHOG_KEY` — PostHog project API key
- `GITHUB_CLIENT_ID` — for Decap CMS OAuth proxy
- `GITHUB_CLIENT_SECRET` — for Decap CMS OAuth proxy
- `RESEND_API_KEY` — for contact form email delivery
- `BUTTONDOWN_API_KEY` — for email subscriber form

---

## Phase 11: CLAUDE.md

Root `CLAUDE.md` points to `docs/ai/` and summarizes the build commands, data file locations, and CMS schema. Mirrors the pattern from chill-dogs.

---

## Critical Files

| File | Purpose |
|------|---------|
| `docs/ai/AGENT_START.md` | Primary context for any future AI session |
| `docs/ai/strategy/band-context.md` | Single source of truth for band identity |
| `docs/ai/engineering/content-model.md` | Data file schemas + frontmatter specs |
| `docs/ai/engineering/cms-config.md` | Decap CMS field definitions |
| `data/*.json` | All CMS-editable content |
| `static/admin/config.yml` | CMS collection definitions |
| `hugo.toml` | Site config + Ryder params |
| `themes/ryder/` | Git subtree — do not edit directly |
| `layouts/partials/*-verdezul.html` | Custom overrides (safe to edit) |
| `assets/css/verdezul.css` | Site-specific styles |

---

## Implementation Order

0. Save this plan to `docs/ai/plans/2026-05-15-initial-site-plan.md` (copy of this file)
1. Create `docs/ai/` structure with all AI docs populated from SOW + band context
2. Initialize Hugo site (`hugo new site .`)
3. Add Ryder as git submodule (`git submodule add https://github.com/arts-link/ryder themes/ryder`)
4. Configure `hugo.toml` with Verdèzul params (logo_png, posthog, custom partials)
5. Create `data/` JSON files (empty arrays `[]` for press/tour/merch/releases; populated stubs for band + social)
6. Create `static/admin/` Decap CMS config (repo: `arts-link/whatisverdezul.com`)
7. Create Vercel OAuth proxy (`api/oauth/`)
8. Build all page layouts (consuming data files; press nav hidden when empty)
9. Add email subscriber form + `api/subscribe.js` Buttondown proxy
10. Add PostHog event tracking
11. Configure Vercel (`vercel.json` + env vars)
12. Wire up `CLAUDE.md` pointing to `docs/ai/`
13. Smoke test: local dev, CMS admin, Vercel preview deploy

---

## Verification

1. `hugo server` — all pages render locally, no template errors
2. `npm run build-tw && hugo --minify` — clean production build
3. `/admin` — Decap CMS loads, GitHub OAuth completes, can edit a tour date and see commit appear in git
4. Vercel preview deploy — all pages live at preview URL
5. PostHog dashboard — events fire on ticket click, Spotify click, contact form submit
6. OG/Twitter meta — test all pages via https://www.opengraph.xyz
7. JSON-LD — validate MusicGroup + MusicEvent schema via Google Rich Results Test
8. Mobile — test all pages on iOS Safari (primary client audience)
