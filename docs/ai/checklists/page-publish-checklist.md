---
name: page-publish-checklist
description: Gate checklist before any new page on the Verdèzul site is considered done
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [checklist, publishing, pages, seo]
  related: [engineering/routes-and-menus.md, engineering/seo-and-schema.md]
---

## Use this when

You have built a new page or made significant changes to an existing page and are about to call it done.

---

## Checklist

### Content
- [ ] Page has a `title` in frontmatter
- [ ] Page has a `description` in frontmatter (100–160 characters)
- [ ] All text follows the [[writing-guide]] — no hype language, no fake urgency
- [ ] Band name spelled **Verdèzul** (with accent) everywhere it appears

### Data
- [ ] If page is data-driven: verify the relevant `data/*.json` file is correct
- [ ] If page has conditional rendering (e.g., press): verify hide/show logic works with both empty and populated data

### Navigation
- [ ] Page appears in the correct nav position (or is intentionally excluded)
- [ ] Press nav item is hidden when `data/press.json` is empty
- [ ] URL matches the expected route from [[routes-and-menus]]

### SEO
- [ ] OG preview tested (open `localhost:1313` page, check `<head>` or use OG preview tool)
- [ ] JSON-LD schema present (MusicGroup on all pages; MusicEvent on Tour; MusicAlbum on Media/Home)
- [ ] Canonical URL resolves correctly

### Analytics
- [ ] All CTAs on the page fire the correct PostHog event per [[analytics-events]]
- [ ] No duplicate event firing

### Layout / responsive
- [ ] Page renders correctly at mobile width (375px)
- [ ] Page renders correctly at tablet (768px) and desktop (1280px)
- [ ] No layout breaks when data arrays are empty

### Build
- [ ] `npm run build-tw && hugo --minify` completes without errors
- [ ] `hugo server` shows no template errors in console

## Related knowledge

- [[writing-guide]] — voice and copy rules
- [[seo-and-schema]] — schema and meta tag requirements
- [[analytics-events]] — event tracking requirements
- [[coding-agent-checklist]] — engineering finish gate
