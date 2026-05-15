---
name: architecture
description: Hugo + Ryder stack, full file structure, path conventions, and override rules
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, stack, structure, hugo, ryder]
  related: [engineering/build-commands.md, engineering/routes-and-menus.md]
---

## Use this when

Understanding the project structure, deciding where a new file belongs, or figuring out how to override a Ryder theme component without editing the theme.

---

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| SSG | Hugo 0.146.0+ | Static site generator |
| Theme | Ryder (git submodule) | `themes/ryder/` — do not edit directly |
| CSS | TailwindCSS v3 | Built via `npm run build-tw`; output at `themes/ryder/assets/css/style.css` |
| JS | Alpine.js | Bundled in Ryder's `assets/js/main.js` |
| CMS | Decap CMS | `static/admin/` — git-backed, GitHub OAuth |
| Analytics | PostHog | Init via Ryder param, custom events in templates |
| Email | Buttondown | Via `api/subscribe.js` Vercel function |
| Hosting | Vercel | Auto-deploy from `main`; Hugo build via `vercel.json` |
| Functions | Vercel (Node.js) | `api/oauth/`, `api/contact.js`, `api/subscribe.js` |

---

## Directory structure

```
whatisverdezul.com/
├── api/                          # Vercel serverless functions
│   ├── oauth/                    # Decap CMS GitHub OAuth proxy
│   ├── contact.js                # Contact form → email
│   └── subscribe.js              # Email collector → Buttondown
├── assets/
│   └── css/
│       └── verdezul.css          # Site-specific CSS (loaded after Ryder's styles)
├── content/
│   ├── _index.md                 # Home page content/frontmatter
│   ├── about/_index.md
│   ├── tour/_index.md
│   ├── press/_index.md
│   ├── media/_index.md
│   ├── shop/_index.md
│   └── contact/_index.md
├── data/
│   ├── band.json                 # Name, email, bio, location
│   ├── social.json               # Social platform URLs
│   ├── tour.json                 # Tour dates (CMS-editable)
│   ├── releases.json             # Discography (CMS-editable)
│   ├── press.json                # Press quotes (CMS-editable, empty = hidden)
│   └── merch.json                # Shop items (CMS-editable)
├── docs/
│   └── ai/                       # AI context docs (this directory)
├── images/                       # Static images (not in static/ — Hugo processes these)
│   └── logo-white-trans.png      # Client logo (oversized, optimize later)
├── layouts/                      # Hugo layout overrides (safe to edit)
│   ├── index.html                # Home page layout
│   ├── _default/
│   │   └── baseof.html           # Base template override if needed
│   ├── about/single.html
│   ├── tour/single.html
│   ├── press/single.html
│   ├── media/single.html
│   ├── shop/single.html
│   ├── contact/single.html
│   ├── partials/
│   │   ├── header-verdezul.html  # Overrides Ryder header (set by headerType param)
│   │   ├── footer-verdezul.html  # Overrides Ryder footer
│   │   ├── menu-verdezul.html    # Overrides Ryder nav
│   │   ├── head/
│   │   │   └── schema.html       # MusicGroup / MusicEvent / MusicAlbum JSON-LD
│   │   ├── tour-list.html
│   │   ├── press-quotes.html
│   │   ├── merch-grid.html
│   │   ├── release-cards.html
│   │   └── social-icons.html
│   └── shortcodes/
│       ├── spotify-embed.html
│       └── youtube-embed.html
├── static/
│   └── admin/
│       ├── index.html            # Decap CMS entry point
│       └── config.yml            # CMS collection definitions
├── themes/
│   └── ryder/                    # Git submodule — NEVER EDIT DIRECTLY
├── hugo.toml                     # Site config + Ryder params
├── package.json                  # npm scripts (TailwindCSS build)
├── vercel.json                   # Vercel build config
└── CLAUDE.md                     # Project AI instructions → points here
```

---

## The override rule

Hugo's lookup order: `layouts/` in the site root takes precedence over `themes/ryder/layouts/`. This means:

- To override any Ryder template: copy it to the same relative path under `layouts/`
- To override a partial: create `layouts/partials/<same-name>.html`
- To add site-specific CSS: write to `assets/css/verdezul.css` (loaded separately, not in Ryder's pipeline)
- **Never edit files inside `themes/ryder/`** — those changes would conflict with submodule updates

---

## Custom partial wiring

Ryder's `headerType`, `footerType`, and `menuType` params control which partial variant loads:

```toml
# hugo.toml
[params]
  headerType = "-verdezul"   # loads layouts/partials/header-verdezul.html
  footerType = "-verdezul"   # loads layouts/partials/footer-verdezul.html
  menuType   = "-verdezul"   # loads layouts/partials/menu-verdezul.html
```

The `-verdezul` suffix is appended to the base partial name inside Ryder's `baseof.html`.

---

## Data access in templates

All `data/*.json` files are available as `.Site.Data.<filename>` (without extension):

```
{{ .Site.Data.band.name }}         → "Verdèzul"
{{ .Site.Data.social.instagram }}  → Instagram URL
{{ range .Site.Data.tour }}        → iterate tour dates
{{ range .Site.Data.releases }}    → iterate releases
```

Conditional rendering when data is empty:
```
{{ if gt (len .Site.Data.press) 0 }}
  ... show press content ...
{{ end }}
```

## Related knowledge

- [[build-commands]] — how to build and run locally
- [[routes-and-menus]] — Hugo menu config and URL structure
- [[content-model]] — data file schemas
