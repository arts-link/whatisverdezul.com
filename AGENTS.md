# Verdèzul Website

Official site for the band Verdèzul — built by Arts-Link.

## AI docs

All project context lives in `docs/ai/`. Start every session with:
- `docs/ai/AGENT_START.md` — minimum context, stack overview, key constraints
- `docs/ai/AI_INDEX.md` — task routing table

## Quick reference

**Band name:** Verdèzul (accent on è — always)
**Repo:** arts-link/whatisverdezul.com
**Stack:** Hugo + Ryder theme (submodule) + Decap CMS + PostHog + Formspree + Vercel

## Build

```bash
hugo server         # local dev at localhost:1313 — compiles Tailwind too
hugo --minify       # production build → public/
```

Hugo compiles TailwindCSS via `css.PostCSS`; the `*-tw` npm scripts are vestigial.

## Key rules

- **Never edit `themes/ryder/`** — override via `layouts/`, `assets/css/extended/verdezul.css`, `hugo.toml`
- **All editable content is in `data/*.json`** — list files use an `items` array, templates read from there, Decap CMS writes there
- **Press nav is hidden when `data/press.json.items` is empty**
- Run `docs/ai/checklists/coding-agent-checklist.md` before marking any task done
