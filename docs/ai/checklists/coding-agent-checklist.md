---
name: coding-agent-checklist
description: Engineering finish gate — run before marking any coding task complete
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [checklist, engineering, coding, finish]
  related: [engineering/architecture.md, engineering/build-commands.md]
---

## Use this when

Finishing any coding task — new feature, layout change, data file update, CMS config change, or serverless function.

---

## Checklist

### Theme override rule
- [ ] No files inside `themes/ryder/` were edited
- [ ] All overrides are in `layouts/`, `assets/css/verdezul.css`, or `hugo.toml` params

### Band name
- [ ] "Verdèzul" is spelled with the accent everywhere in new/changed code and content
- [ ] "verde-azul", "verdezul" (no accent), or any hyphenated form does not appear in output

### Data files
- [ ] Any new data field is documented in [[content-model]]
- [ ] Any new data field has a corresponding Decap CMS widget in [[cms-config]] / `static/admin/config.yml`
- [ ] Empty data arrays (`[]`) still render without errors — tested locally

### Navigation
- [ ] Press nav item is still conditionally hidden when `data/press.json` is empty
- [ ] Any new nav item has correct `weight` ordering in `hugo.toml`

### Analytics
- [ ] Any new user-facing CTA fires the appropriate PostHog event per [[analytics-events]]
- [ ] No existing `data-track` attributes or PostHog calls were accidentally removed

### Build
- [ ] `npm run build-tw && hugo --minify` passes with no errors
- [ ] `hugo server` shows no template errors or warnings in the console
- [ ] `public/` output looks correct for changed pages

### Serverless functions (`api/`)
- [ ] No API keys or secrets are hardcoded — all use `process.env.VARIABLE_NAME`
- [ ] New env vars are documented in [[build-commands]] and added to `vercel.json` or Vercel dashboard

### Responsive
- [ ] Changed templates render correctly at 375px (mobile) width

## Related knowledge

- [[architecture]] — override rules, directory structure
- [[page-publish-checklist]] — additional gate for new pages
- [[build-commands]] — build and test commands
