---
name: routes-and-menus
description: Hugo menu config, URL structure, section organization, and nav conditional logic
metadata:
  type: reference
  status: active
  updated: 2026-06-05
  tags: [engineering, routes, menus, navigation, hugo]
  related: [engineering/architecture.md, engineering/content-model.md]
---

## Use this when

Adding a new page, changing nav items, or understanding how URLs map to content and layouts.

---

## URL structure

| URL | Content file | Layout file |
|-----|--------------|-------------|
| `/` | `content/_index.md` | `layouts/_default/home.html` |
| `/about/` | `content/about/_index.md` | `layouts/about/list.html` |
| `/shows/` | `content/shows/_index.md` | `layouts/shows/list.html` |
| `/press/` | `content/press/_index.md` | `layouts/press/list.html` |
| `/music/` | `content/music/_index.md` | `layouts/music/list.html` |
| `/music/streaming/` | `content/music/streaming.md` | `layouts/music/streaming.html` |
| `/shop/` | `content/shop/_index.md` | `layouts/shop/list.html` |
| `/contact/` | `content/contact/_index.md` | `layouts/contact/list.html` |
| `/admin/` | `static/admin/index.html` | Decap CMS, not Hugo |

---

## Menu config in `hugo.toml`

```toml
[[menus.main]]
  name = "Music"
  url = "/music/"
  weight = 10

[[menus.main]]
  name = "Shows"
  url = "/shows/"
  weight = 20

[[menus.main]]
  name = "About"
  url = "/about/"
  weight = 30

[[menus.main]]
  name = "Contact"
  url = "/contact/"
  weight = 40

[[menus.main]]
  name = "Shop"
  url = "/shop/"
  weight = 50
```

**Press is not in the static menu config.** It is rendered conditionally in nav partials:

```go-html-template
{{ if gt (len (.Site.Data.press.items | default slice)) 0 }}
  <li><a href="/press/">Press</a></li>
{{ end }}
```

---

## Adding a new page

1. Create `content/<section>/_index.md` with `title` and `description` frontmatter.
2. Create `layouts/<section>/list.html` for section pages.
3. Add to `hugo.toml` menus if it should appear in nav.
4. Add to `static/admin/config.yml` if it should be CMS-editable.
5. Run [[page-publish-checklist]] before considering it done.

---

## Section vs single layouts

Hugo uses `_index.md` for section list pages and individual `.md` files for single pages. The top-level pages on this site are section list pages, so active section layouts use `list.html`.

## Related knowledge

- [[architecture]] — full directory structure
- [[cms-config]] — which pages are CMS-editable
- [[page-publish-checklist]] — gate before a new page is considered done
