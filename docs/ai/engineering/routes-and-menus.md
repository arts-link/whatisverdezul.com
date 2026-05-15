---
name: routes-and-menus
description: Hugo menu config, URL structure, section organization, and nav conditional logic
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, routes, menus, navigation, hugo]
  related: [engineering/architecture.md, engineering/content-model.md]
---

## Use this when

Adding a new page, changing nav items, or understanding how URLs map to content and layouts.

---

## URL structure

| URL | Content file | Layout file |
|-----|-------------|-------------|
| `/` | `content/_index.md` | `layouts/index.html` |
| `/about/` | `content/about/_index.md` | `layouts/about/single.html` |
| `/tour/` | `content/tour/_index.md` | `layouts/tour/single.html` |
| `/press/` | `content/press/_index.md` | `layouts/press/single.html` |
| `/media/` | `content/media/_index.md` | `layouts/media/single.html` |
| `/shop/` | `content/shop/_index.md` | `layouts/shop/single.html` |
| `/contact/` | `content/contact/_index.md` | `layouts/contact/single.html` |
| `/admin/` | `static/admin/index.html` | (Decap CMS, not Hugo) |

---

## Menu config in `hugo.toml`

```toml
[[menus.main]]
  name = "About"
  url = "/about/"
  weight = 10

[[menus.main]]
  name = "Tour"
  url = "/tour/"
  weight = 20

[[menus.main]]
  name = "Media"
  url = "/media/"
  weight = 30

[[menus.main]]
  name = "Shop"
  url = "/shop/"
  weight = 40

[[menus.main]]
  name = "Contact"
  url = "/contact/"
  weight = 50
```

**Press is NOT in the static menu config.** It is rendered conditionally in `layouts/partials/menu-verdezul.html`:

```html
{{ if gt (len .Site.Data.press) 0 }}
  <li><a href="/press/">Press</a></li>
{{ end }}
```

---

## Adding a new page

1. Create `content/<section>/_index.md` with `title` and `description` frontmatter
2. Create `layouts/<section>/single.html` (or `list.html` if it has sub-content)
3. Add to `hugo.toml` menus if it should appear in nav
4. Add to `static/admin/config.yml` if it should be CMS-editable
5. Run [[page-publish-checklist]] before considering it done

---

## Section vs single layouts

Hugo uses `_index.md` for section list pages and individual `.md` files for single posts. For this site, every page is treated as a standalone section with `_index.md` — there are no blog-style content collections.

## Related knowledge

- [[architecture]] — full directory structure
- [[cms-config]] — which pages are CMS-editable
- [[page-publish-checklist]] — gate before a new page is considered done
