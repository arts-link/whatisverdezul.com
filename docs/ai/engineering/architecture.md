---
name: architecture
description: Hugo + Ryder stack, full file structure, path conventions, and override rules
metadata:
  type: reference
  status: active
  updated: 2026-06-05
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
| CSS | TailwindCSS v3 + site CSS | Ryder compiles CSS from `themes/ryder/assets/css/main.css` and `assets/css/extended/*.css` |
| JS | Alpine.js (CSP build) | Ryder bundles `@alpinejs/csp`. **Inline `x-on`/`@submit` expressions cannot contain `fetch()`, arrow functions, or method calls** — anything beyond simple property access must be a component registered via `Alpine.data(...)` in `assets/js/extended.js` (loaded before `Alpine.start()`). |
| CMS | Decap CMS | `static/admin/` — git-backed, GitHub OAuth |
| Analytics | PostHog | Init via Ryder param, custom events in templates |
| Contact form | Formspree | `contactForm` Alpine component in `assets/js/extended.js` fetches `https://formspree.io/f/xojgerbg`. Requires `https://formspree.io` in CSP `connect-src` (`[params.csp] connectSrc` in `hugo.toml`). No server-side code or env var. |
| Email signup | Formspree | `subscribeForm` Alpine component in `assets/js/extended.js` fetches `https://formspree.io/f/mlgqjvro`. Same CSP requirement. Replaced the Buttondown `api/subscribe.js` proxy. |
| Hosting | Vercel | Auto-deploy from `main`; Hugo build via `vercel.json` |
| Functions | Vercel (Node.js) | `api/oauth/` (Decap CMS OAuth proxy) only |

---

## Directory structure

```
whatisverdezul.com/
├── api/                          # Vercel serverless functions
│   └── oauth/                    # Decap CMS GitHub OAuth proxy (`auth` + `callback`)
├── assets/
│   └── css/
│       └── extended/
│           └── verdezul.css      # Site-specific CSS loaded by Ryder
├── content/
│   ├── _index.md                 # Home page content/frontmatter
│   ├── about/_index.md
│   ├── shows/_index.md
│   ├── press/_index.md
│   ├── music/_index.md
│   ├── shop/_index.md
│   └── contact/_index.md
├── data/
│   ├── band.json                 # Name, email, bio, location
│   ├── social.json               # Social platform URLs
│   ├── shows.json                # Shows list wrapper with `items`
│   ├── releases.json             # Discography list wrapper with `items`
│   ├── press.json                # Press quotes list wrapper with `items`
│   └── merch.json                # Shop items list wrapper with `items`
├── docs/
│   └── ai/                       # AI context docs (this directory)
├── images/                       # Static images (not in static/ — Hugo processes these)
│   └── logo-white-trans.png      # Client logo (oversized, optimize later)
├── layouts/                      # Hugo layout overrides (safe to edit)
│   ├── index.html                # Home page layout
│   ├── _default/
│   │   └── baseof.html           # Base template override if needed
│   ├── about/single.html
│   ├── shows/list.html
│   ├── press/list.html
│   ├── music/list.html
│   ├── shop/list.html
│   ├── contact/list.html
│   ├── partials/
│   │   ├── header-verdezul.html  # Overrides Ryder header (set by headerType param)
│   │   ├── footer-verdezul.html  # Overrides Ryder footer
│   │   ├── menu-verdezul.html    # Overrides Ryder nav
│   │   ├── head/
│   │   │   └── schema.html       # MusicGroup / MusicEvent / MusicAlbum JSON-LD
│   │   └── youtube / menu / schema partials
│   └── shortcodes/
│       ├── spotify-embed.html
│       └── youtube-embed.html
├── static/
│   ├── admin/
│   │   ├── index.html            # Decap CMS entry point
│   │   └── config.yml            # CMS collection definitions
│   └── images/uploads/           # CMS media uploads
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
- To add site-specific CSS: write to `assets/css/extended/verdezul.css` (loaded by Ryder's CSS partial)
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
{{ range .Site.Data.shows.items }}    → iterate shows
{{ range .Site.Data.releases.items }} → iterate releases
```

Conditional rendering when data is empty:
```
{{ if gt (len (.Site.Data.press.items | default slice)) 0 }}
  ... show press content ...
{{ end }}
```

## Related knowledge

- [[build-commands]] — how to build and run locally
- [[routes-and-menus]] — Hugo menu config and URL structure
- [[content-model]] — data file schemas
