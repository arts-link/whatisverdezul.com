---
name: agent-start
description: Minimum context needed to begin any task on the Verdèzul website project
metadata:
  type: reference
  status: active
  updated: 2026-06-05
  tags: [onboarding, overview, start-here]
  related: [strategy/band-context.md, engineering/architecture.md, AI_INDEX.md]
---

## Use this when

Starting any new task on this project — read this file first, every time.

---

## What this project is

The official website for **Verdèzul**, a Los Angeles-based hip-hop duo. Built and managed by Arts-Link.

- **Live domain:** whatisverdezul.com
- **Repo:** arts-link/whatisverdezul.com (GitHub, private)
- **Hosting:** Vercel, Arts-Link account, auto-deploys from `main`

---

## Stack

- **Hugo** 0.146.0+ — static site generator
- **Ryder theme** — git submodule at `themes/ryder/` (authored by Arts-Link, do not edit theme files directly)
- **TailwindCSS** — built via `npm run build-tw` (Ryder's npm scripts)
- **Alpine.js** — bundled in Ryder, minimal interactivity
- **Decap CMS** — git-based CMS at `/admin`, GitHub OAuth via Vercel serverless proxy
- **PostHog** — analytics, init handled by Ryder's `analytics_provider = "posthog"` param
- **Buttondown** — email subscribers via `api/subscribe.js` Vercel serverless function
- **Formspree** — contact form delivery; the `contactForm` component in `assets/js/extended.js` fetches `https://formspree.io/f/xojgerbg` (paid Arts-Link account). Needs `https://formspree.io` in CSP `connect-src`. No serverless function.
- **Vercel Functions** — `api/oauth/` (CMS auth), `api/subscribe.js` (email)

---

## Name rule

The band name is always **Verdèzul** — with the accent on the è. Never "verde-azul", never "verdezul" (without accent), never hyphenated. This applies everywhere: code comments, content, data files, docs.

---

## Key constraints

- **Never edit `themes/ryder/` directly.** Override via `layouts/`, `assets/css/extended/verdezul.css`, and `hugo.toml` params.
- **All client-editable content lives in `data/*.json`.** List-backed files use an `items` array; templates consume these; Decap CMS edits them.
- **Press nav is hidden when `data/press.json.items` is empty.** Same conditional pattern applies to any data-driven section with no entries.
- **Logo is `/images/logo-white-trans.png`** — oversized, flagged for future optimization.
- **Repo is `arts-link/whatisverdezul.com`** — not `benstraw/`.

---

## Most important docs by task

| Task | Read these first |
|------|-----------------|
| Any task | This file + [[band-context]] |
| Adding/editing content | [[content-model]], [[writing-guide]] |
| Changing layouts or templates | [[architecture]], [[routes-and-menus]] |
| CMS changes | [[cms-config]] |
| Adding a new page | [[routes-and-menus]], [[seo-and-schema]], then [[page-publish-checklist]] |
| Analytics / tracking | [[analytics-events]] |
| Build or deploy | [[build-commands]] |
| Media embeds | [[media-embed-rules]] |
| Finishing any coding task | [[coding-agent-checklist]] |

---

## Build commands (quick reference)

```bash
npm run build-tw          # compile TailwindCSS (run before hugo)
hugo server               # local dev (no Tailwind watch — run build-tw first or use watch-tw)
npm run watch-tw          # watch Tailwind in separate terminal during dev
hugo --minify             # production build → public/
npm run build-tw && hugo --minify   # full production build
```

## Related knowledge

- [[AI_INDEX]] — full task routing table
- [[band-context]] — complete band identity reference
- [[architecture]] — file structure, path conventions, override rules
