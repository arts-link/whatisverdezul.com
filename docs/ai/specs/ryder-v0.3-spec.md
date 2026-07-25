---
name: ryder-v0.3-spec
description: Upstream change spec for the Ryder Hugo theme, derived from the overrides and workarounds this site was forced into
metadata:
  type: spec
  status: proposed
  updated: 2026-07-25
  tags: [ryder, theme, upstream, spec, csp, schema, tailwind]
  related: [engineering/architecture.md, engineering/analytics-events.md, engineering/seo-and-schema.md, engineering/build-commands.md]
---

## Use this when

You are working on the **Ryder theme itself** (`arts-link/ryder`), not on this
site. This document is the change spec for Ryder **v0.2.4 → v0.3.0**, written from
evidence collected on `whatisverdezul.com` — the theme's first real consumer as a
git submodule.

If you are working on this site, you almost certainly want
[[architecture]] instead. The override rule still stands: **never edit
`themes/ryder/`.** This spec exists so those overrides can eventually be deleted
upstream rather than accumulated here.

---

## Why this spec exists

`hugo.toml` disables three theme features. `layouts/` holds 23 files. The ones
that matter are not restyled theme partials — they are wholesale replacements,
written because the theme partial had no seam to extend or was outright broken.
**Six of this site's seven top-level pages fork the same theme template**
(`_default/list.html`), all for the same reason.

Five theme-caused failures reached production — commits `e7bbfe1`, `d52b9cc`,
`3d620e9`, `f71237c`, and submodule bump `70f6dcb`. Every one was **silent**: no
build error, no console warning, correct-looking HTML.

That pattern — silence — is the through-line of this spec. Most items below are
not missing features. They are cases where Ryder fails without saying so.

### How findings were verified

Read against the theme at its pinned commit `a95ed03` (`v0.2.3`), upstream
`arts-link/ryder`, cloned separately because `themes/ryder/` is not always checked
out. Every item cites theme file and line. Where a claim was not directly
verifiable it is marked **PLAUSIBLE**.

### Release shape

Ships in three pieces so the non-breaking majority does not wait on the
breaking minority.

| Release | Contents | Breaking |
|---|---|---|
| v0.2.4 | Tier 1 (1.1–1.8) | no |
| v0.2.5 | Tier 2 except 2.2; Tier 4 except 4.3; Tier 5 | no |
| v0.3.0 | 2.2, Tier 3, 4.3 | yes — needs a migration guide |

---

## Tier 1 — Silent failures and defects

Wrong for every Ryder site, not just this one. None breaking.

### 1.1 The `[security.funcs] getenv` requirement is undocumented, so PostHog silently emits nothing

`posthog.html:3,7,11` and `csp.html:52` read `PUBLIC_POSTHOG_KEY`,
`PUBLIC_POSTHOG_HOST`, and `PUBLIC_POSTHOG_UI_HOST` via `getenv`. Hugo's default
allowlist is `^HUGO_` and `^CI$` only.

Without an explicit `[security.funcs] getenv` entry, those calls return empty,
`posthog.html:17` (`if and $key $apiHost`) is false, and **no analytics render at
all** — no error, no warning. `csp.html:51-58` then also omits the PostHog host
from `script-src` and `connect-src`, so even a hand-added snippet would be
CSP-blocked.

The theme README documents the three env vars and never mentions the `[security]`
block. `exampleSite` has no `[security]` block either. This site works only
because `hugo.toml:24-26` happens to set it.

**Fix.** Add the required snippet to the README's PostHog section and to
`exampleSite`:

```toml
[security]
  [security.funcs]
    getenv = ['^HUGO_', '^CI$', '^PUBLIC_']
```

Lead the docs with the allowlist-free `posthog_key` / `posthog_host` params
instead, and treat env vars as the secondary path.

### 1.2 Invalid JSON-LD — all structured data is silently discarded

`head/schema.html` emits JavaScript comments *inside*
`<script type="application/ld+json">`:

- line 5 — `// homepage`
- line 45 — `// schema for posts`
- line 105 — `//breadcrumb schema`

These are plain template text, not Hugo comments (`{{/* … */}}`), so they reach
the output. JSON has no comment syntax, so **every affected block fails to
parse** and the page's structured data is discarded wholesale.

**Fix.** Remove them. Item 2.2 rewrites this file and eliminates the class of
bug structurally.

### 1.3 Nil-pointer build crash in the OG image resolver

`common-partials/opengraph/get-featured-image.html:6-8`:

```go-html-template
{{ $customImage := .Param "og_image_default" | default "/common-partials/opengraph/opengraph-base.png" }}
{{ $featured = resources.Get $customImage }}
{{ $featured = $featured.Resize "1200x" }}
```

`resources.Get` returns nil for any path not under `assets/`. Two things make that
the likely case: the theme's own default value carries a **leading slash** while
the README and `exampleSite` both document the param *without* one
(`og_image_default = 'images/ryder-theme-og.webp'`), and nothing normalizes
either form. `.Resize` on nil then aborts the build with
`nil pointer evaluating resource.Resource.Resize` — with no indication of which
param is at fault.

This site burned two commits on it: `ef5071e` put the OG images in `static/`,
`fe6e32b` moved them to `assets/` and added `strings.TrimPrefix "/"`. The commit
message records the lesson the theme should have stated: *"static/ files are not
accessible via resources.Get — images must live in assets/"*.

**Fix.** Normalize the leading slash, wrap the lookup in `with`, and `errorf`
naming the offending param. `header.html:22-26` already does this normalization
correctly — reuse that pattern:

```go-html-template
{{- with resources.Get $backgroundPath -}}{{- $backgroundPath = .RelPermalink -}}
{{- else -}}{{- $backgroundPath = $backgroundPath | absURL -}}{{- end -}}
```

Also document `og_image_default` as `assets/`-only, since `logo_png` is documented
as working from either `static/` or `assets/` and the inconsistency is a trap.

### 1.4 `footer.html` reads an unguarded nested param

`footer.html:9`:

```go-html-template
{{- if or .Site.Params.footer.tagCloud $showMiddleColumn }}
```

No `with`, no `default`. The theme's own `hugo.toml` declares no `[params]` at
all, and only `exampleSite` sets `[params.footer]`. Any site that omits that block
gets `can't evaluate field tagCloud in type interface {}`.

It stays hidden on this site only because the footer is forked.

**Fix.** Use `.Param "footer.tagCloud"`, or guard with `with`.

### 1.5 Dark mode is applied to sites that turned it off

`themeBoot.js:2-5` adds `dark` to `<html>` whenever `prefers-color-scheme: dark`
matches — unconditionally. It never reads `showDarkToggle`:

```js
if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}
```

`head.html:4-14` loads it unconditionally. Meanwhile `showDarkToggle = false`
reaches only `head/js.html:3`, which gates `themeSwitcher.js` — **not**
`themeBoot.js`, and **not** `baseof.html:6`'s hardcoded
`dark:bg-neutral-900 dark:text-neutral-100` on `<body>`.

Result: an OS-dark visitor to this deliberately light band site gets a `#171717`
body under light-designed content, with no toggle available to escape it. The
workaround is the only `!important` in 1,569 lines of site CSS
(`assets/css/extended/verdezul.css:836-839`):

```css
body {
  background-color: #f5f5f5 !important;
  color: #0a0a0a !important;
}
```

And it is *required*: `darkMode: 'class'` compiles to `.dark .dark\:bg-neutral-900`
at specificity (0,2,0), which beats bare `body` at (0,0,1).

**Fix.** Add `params.darkMode` with values `"toggle"` / `"system"` / `"off"`,
defaulting from the existing `showDarkToggle` for back-compat. When `"off"`, skip
`themeBoot.js` entirely and emit the body classes without `dark:` variants.

**Also fix the docs.** The README says `showDarkToggle = true # Dark mode toggle`
and `exampleSite` comments "defaults to true", while `head/js.html:3` defaults it
**false**. Code and docs disagree.

### 1.6 The theme's own embed shortcodes are blocked by the theme's own CSP

`csp.html:99-102` emits `frame-src` only when `params.csp.frameSrc` is set, so by
default `default-src 'self'` blocks every iframe. But the theme ships two
shortcodes that emit iframes — `shortcodes/soundcloud.html:14` and
`shortcodes/openstreetmap.html:25` — as do Hugo's built-in `youtube` and `vimeo`.

`exampleSite/config/_default/hugo.toml:61` patches around it:

```toml
frameSrc  = "https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://w.soundcloud.com"
```

It **omits `https://umap.openstreetmap.fr`**, so the theme's own demo of its own
`openstreetmap` shortcode is broken in its own exampleSite. And the README never
mentions `frameSrc` at all.

**Fix.** Three parts:

1. Have each embed shortcode register its host on `.Store`, and have `csp.html`
   fold registered hosts into `frame-src` automatically.
2. Add a preset for hosts the theme cannot detect:
   `params.csp.embeds = ["youtube", "vimeo", "soundcloud", "spotify", "umap"]`.
   This site currently hand-writes `open.spotify.com` and
   `www.youtube-nocookie.com` at `hugo.toml:19`.
3. Add the missing uMap host to `exampleSite`, and document `frameSrc` in the
   README.

### 1.7 The theme's runtime JS dependencies are not declared

`assets/js/main.js` imports `@alpinejs/csp`, `@alpinejs/focus`,
`@fortawesome/fontawesome-svg-core`, all three `@fortawesome/free-*-svg-icons`
packages, and `leaflet`. **None appear in the theme's `package.json`** — they are
declared only in `exampleSite/package.json`.

A consuming site's `js.Build` therefore fails until the site reverse-engineers
the import list out of `main.js`. That is exactly why this repo carries all six in
its own `devDependencies` *plus*:

```json
"postinstall": "cd themes/ryder && npm install"
```

**Fix.** Move them into the theme `package.json` `dependencies`. Document that a
consuming site must install them **at its own project root** — Hugo's `js.Build`
resolves modules from the project root, not from the theme directory — and drop
the nested-install recipe from the README.

### 1.8 `[build] writeStats` and cachebusters live only in `exampleSite`

The theme's `tailwind.config.js:6` globs `./hugo_stats.json`, and the theme's
`AGENTS.md` states that `exampleSite/hugo_stats.json` is *"intentionally tracked
because Tailwind clean builds depend on it"* — so the theme knows the file
matters. But `writeStats = true` and the three `[[build.cachebusters]]` rules
appear only at `exampleSite/config/_default/hugo.toml:132-142`. The theme's own
`hugo.toml` has just `[module]`, `[outputFormats]`, and `[outputs]`.

Consequences for every consumer:

- `hugo_stats.json` is never generated, so that `content` entry is inert. Class
  discovery falls back to the `layouts/**/*.html` globs — which happens to cover
  this site, but any class assembled dynamically in a template is silently purged.
- With no cachebusters, `hugo server` serves stale CSS/JS after edits to
  `tailwind.config.js` or to assets.

**Fix.** Move `[build] writeStats` and the cachebuster rules into the theme's own
`hugo.toml`. Hugo merges theme config into the site's, so consumers inherit them.

---

## Tier 2 — Missing extension points

Each of these forced a full-file fork in this site's `layouts/`.

### 2.1 No data-backed, feed-less list layout — the biggest structural gap

`_default/list.html` is hardwired to `.Paginate` over `.Pages`: title, `.Content`,
paginated card grid. `listCardType` swaps the *card* but not the surrounding
pagination shell. There is no `listSource` param and no way to suppress the feed.

Every page on this site is a data-driven singleton with zero child pages, sourced
from `data/*.json`. So **six of seven fork the same template**:

| Site file | Shadows |
|---|---|
| `layouts/about/list.html` | `_default/list.html` |
| `layouts/music/list.html` | `_default/list.html` |
| `layouts/shows/list.html` | `_default/list.html` |
| `layouts/press/list.html` | `_default/list.html` |
| `layouts/shop/list.html` | `_default/list.html` |
| `layouts/contact/list.html` | `_default/list.html` |
| `layouts/music/streaming.html` | no counterpart at all |

None shares a line with the theme.

**Fix.** Ship `_default/list-plain.html` — title + `.Content`, no feed —
selectable via `listType` or `listCardType = "none"`. That alone lets `about`,
`contact`, and `press` drop their forks. Additive, not breaking.

**Related.** The empty-data idiom is hand-rolled **seven times** across this
site's `layouts/`, e.g. `layouts/press/list.html:2-3`:

```go-html-template
{{ $press := .Site.Data.press.items | default slice }}
{{ if gt (len $press) 0 }}
```

Ship `partials/utils/data-items.html` as a returning partial so it is written
once.

### 2.2 `head/schema.html` is monolithic with no seam

**Breaking — v0.3.0.**

The theme's `head/schema.html` (163 lines) emits, per page: `WebPage` (home) or
`BlogPosting`, plus `Organization` on home, plus one or two `BreadcrumbList`
blocks. It is called from `common-partials/head-seo.html:9`, whose only
extensibility is a single hardcoded branch to `schema-recipe.html`.

To emit `MusicGroup` / `MusicEvent` / `MusicAlbum`, this site replaced the file
outright — and thereby **silently dropped `WebPage`, `Organization`, and
`BreadcrumbList` entirely**. That is a pure loss forced by the missing hook. The
theme README still advertises those types, and this site's
[[seo-and-schema]] still believes it receives them.

Worth noting: `partials/extend_head.html` is an empty, sanctioned head-injection
hook. This site could have added its MusicGroup block there and kept the theme's
schema — but nothing documents that, so the one seam that *did* exist went unused.

**Fix.** Four parts:

1. Rewrite the theme partial to build Hugo `dict`s and `jsonify` them instead of
   hand-writing JSON strings. This site's `layouts/partials/head/schema.html:9-20`
   is the reference implementation — use it. This eliminates 1.2 structurally
   rather than by vigilance.
2. Add a no-op `head/schema-extra.html`, called from `head-seo.html`, mirroring
   the `extend_head.html` pattern.
3. Add `params.schema.type` (default `"Organization"`) so the site-wide entity can
   be `MusicGroup`, `Person`, or `LocalBusiness` without overriding anything.
4. Fix in passing: `eq .Title .Site.Title` (lines 3, 103) as the homepage test
   instead of `.IsHome` — any page sharing the site's title gets homepage schema;
   line 84 inlining the entire page body into `articleBody`, inflating every page;
   line 98's comma-dependent `"email"` emission.

Then document `extend_head.html` in the README.

**Migration note.** JSON-LD output changes shape. Sites should revalidate at
Google's Rich Results Test after upgrading. Practical risk is low — per 1.2, the
current output never parsed.

### 2.3 No per-page OG image

`get-featured-image.html` resolves only page-bundle resources matching
`*feature*`, `*cover*`, or `*thumbnail*`, then falls through to the *generated*
text-on-image card. There is no front-matter escape hatch.

This site's pages are all bundle-less `_index.md` sections, so every page would
have received a generated card. It wanted seven hand-designed 1200×630 PNGs, so it
discarded the resolver — 47 lines down to 4 — taking the theme's entire OG
generator (`ogImageText.x/y/fontColor/fontName`, the Special Elite and Titillium
fonts, `opengraph-base.png`) out of service as collateral.

**Fix.** Resolve in order: `og_image` (front matter) → `og_image_default` (site) →
page-bundle resources → generator. Strictly widens the chain; not breaking.

### 2.4 No conditional or data-driven menu entries

`menu.html` walks `site.Menus` only. "Show Press in nav only when
`data/press.json` has items" is a documented invariant of this site
([[AGENT_START]]) that `[[menus.main]]` cannot express. So the site forked the
entire nav to append five lines — and now repeats them across **four** files
(`menu-verdezul.html:20-22`, `header-dark.html`, `header-home.html`,
`header-nowhite.html`):

```go-html-template
{{ if gt (len ($.Site.Data.press.items | default slice)) 0 }}
<li><a href="/press/" {{ if eq $.RelPermalink "/press/" }}aria-current="page"{{ end }}>Press</a></li>
{{ end }}
```

**Fix.** Support a `showIf` / `hideIfEmptyData` key in `[menus.main.params]`
naming a `data/*.json` file whose `items` array must be non-empty for the entry to
render; honor it in `menu.html`. Not breaking.

This is the highest-leverage nav fix — it also lets this site delete three
orphaned nav partials.

### 2.5 Variant swap is all-or-nothing, so cosmetic variants need duplicate files

`headerType` is the only per-page hook, and it swaps the whole template. This site
has four near-identical nav files expressing *three background treatments*:

- `header-dark.html` is **byte-identical** to `menu-verdezul.html`
- `header-home.html` differs only in classes and a dropped logo
- `header-nowhite.html` is dead — no `headerType = "-nowhite"` anywhere

The theme's own `header.html:8-20` already accepts page-overridable
`twClasses.headerBackgroundFrameOuter`, `…Inner`, and `…headerBackgroundImage` —
exactly the right mechanism, but unreachable from a custom variant. Cost on
record: commit `148e980`, one visual change ("apply pill nav treatment to all
pages") applied to two files.

Forking also loses real theme features: two-level menus, `submenuTrigger`, and
`IsMenuCurrent` / `HasMenuCurrent`. This site reimplements active state less
correctly with `hasPrefix`, and duplicates the theme's `mobileMenu` Alpine
component as `vzNav`.

**Fix.** Honor a `navClass` / `headerClass` `.Param` in the base header, and
document the "one variant plus `.Param` for the skin" pattern. Not breaking.

### 2.6 Variant dispatch has no existence guard

`baseof.html:12` and `:25`:

```go-html-template
{{- partial (printf "header%s.html" $headerType) . }}
```

`header.html:50` does the same for `menuType`. A typo'd suffix is a cryptic Hugo
failure that never names the param responsible. The theme has already been bitten
by this class of bug — `REWRITE.md:45` records `footerType = "-fun"` pointing at a
partial that did not exist.

**Fix.** Guard with `templates.Exists`, `warnf` the param name and the resolved
partial, and fall back to the base variant. Not breaking.

### 2.7 Shell classes are unconfigurable and the wrapper has no hook

`baseof.html:6` hardcodes the `<body>` classes. `[params.twClasses]` covers header
and footer but **not the body** — which is the other half of why 1.5 needs
`!important`.

Worse, `baseof.html:10`'s `<div class="min-h-lvh flex w-full flex-col">` is
unclassed and unpositioned, so this site reaches into it from CSS
(`verdezul.css:1073`):

```css
body:has(.vz-nav--home) > div:not(.fixed) { position: relative; }
```

The `:not(.fixed)` exists solely to avoid also matching
`tw-size-indicator.html:2` — a **dev-only** debug partial that `baseof.html:7-9`
injects as a `<body>` sibling under `not hugo.IsProduction`. A production CSS rule
is coupled to a dev-only partial's position in the DOM. Either changing means a
silently broken homepage nav.

**Fix.** Add `twClasses.body`; give the wrapper a stable hook class
(e.g. `site-shell`) with `position: relative`; move `tw-size-indicator` inside the
wrapper so it is not a body sibling. Not breaking.

---

## Tier 3 — Packaging and build

All breaking. **v0.3.0.**

### 3.1 Ship a Tailwind preset

The theme's `tailwind.config.js` is a *site* config, not a theme config. Its
`content` array (lines 5-14) globs `./exampleSite/hugo_stats.json`,
`./exampleSite/content/**/*.md`, and — from inside the theme itself —
`"./themes/ryder/layouts/**/*.html"`. None of that resolves sensibly from a
consumer's project root, so every consumer rewrites `content` wholesale, as this
site does at `tailwind.config.js:5-11`.

**Fix.** Ship `tailwind.preset.js` carrying only `theme`, `darkMode`, and
`plugins` — no `content`. Keep `tailwind.config.js` as a thin wrapper for the
theme's own dev loop. Document the consumer pattern:

```js
module.exports = {
  presets: [require('./themes/ryder/tailwind.preset.js')],
  content: [
    './themes/ryder/layouts/**/*.html',
    './layouts/**/*.html',
    './content/**/*.md',
    './hugo_stats.json',
  ],
};
```

**Breaking** for anyone requiring the theme config directly.

### 3.2 Delete `assets/css/style.css`

A committed 125 KB Tailwind build artifact that no template reads.
`head/css.html:1` resolves `css/main.css` and pipes it through `css.PostCSS`;
grepping the theme for `style.css` returns zero references. It ships to every
consumer for nothing.

**Breaking** only for a site that resolves it by hand.

### 3.3 Retire the vestigial `*-tw` scripts

`package.json:7-9` runs the Tailwind CLI to produce 3.2's dead artifact. But
Tailwind already compiles **inside** the Hugo build, via `head/css.html:9`
(`css.PostCSS`) plus `postcss.config.js`. The scripts are dead weight.

The problem is that `README.md:470-471` presents them as *the* build workflow, and
that misdirection has propagated downstream into this repo:

- [[build-commands]] insists "`hugo server` alone won't rebuild CSS" and mandates
  a two-terminal dev loop that is not actually required
- [[build-commands]] also names the wrong output path
  (`themes/ryder/assets/css/style.css`)
- `vercel.json` runs `hugo --minify` alone, contradicting this site's own docs
- this site's `assets/css/tw-built.css` is written, gitignored, and never consumed

**Fix.** Delete `build-tw`, `watch-tw`, and `deploy-tw`. Replace the README
section with the real requirement: a consuming site needs `tailwindcss`,
`postcss`, `postcss-cli`, and `autoprefixer` at its project root plus a
`postcss.config.js` — and then `hugo server` alone suffices.

**Breaking** for anyone invoking the scripts.

### 3.4 Drop the redundant `[outputs]` guidance

The theme's `hugo.toml:13-14` already declares
`home = ["HTML", "RSS", "LLMSTxt"]` alongside the `LLMSTxt` output format, and
theme config merges into the site's. So this site's `hugo.toml:28-29` is a
duplicate, as is [[seo-and-schema]]'s instruction to add it.

**Fix.** Say so in the README. Not breaking.

---

## Tier 4 — CSP-safe Alpine

The largest source of production breakage on this site, and entirely a theme-level
gap.

`main.js:77` bundles `@alpinejs/csp`, whose expression evaluator **cannot evaluate
calls, arrow functions, or member calls in inline directives**. It does not throw.
The HTML renders, no console error appears, and the handler simply never fires.

Three separate silent outages, all in git history:

| Commit | What broke |
|---|---|
| `e7bbfe1` | Six PostHog click events (`social_follow_click`, `spotify_play_click`, `merch_click`, `ticket_link_click`, `press_link_click`, `youtube_play_click`) never reached PostHog. The commit also had to *correct this site's own docs*, which had been prescribing the broken pattern. |
| `d52b9cc` | The contact form "was never actually functional" — an entire Resend serverless endpoint was built against a handler that never ran. |
| `3d620e9` | The email signup "never worked", same cause. |

Neither the theme's `README.md` nor its `AGENTS.md` mentions the restriction. So
this site wrote `vzTrack`, `contactForm`, and `subscribeForm` in
`assets/js/extended.js`, and the workaround is now a comment copy-pasted into
**ten** templates:

```go-html-template
{{/* vzTrack: CSP-safe Alpine can't eval inline capture() — see extended.js */}}
```

Every one of those three components is theme-generic. None should have been
site code.

### 4.1 Ship `ryderTrack`

Register `Alpine.data('ryderTrack')` in `main.js`, reading `data-track-event` and
`data-track-props` off `event.currentTarget` and forwarding to whichever provider
`analytics_provider` selects. Port from `assets/js/extended.js:69-77`, generalized
past PostHog.

Usage becomes:

```html
<a x-data="ryderTrack" @click="track"
   data-track-event="ticket_link_click" data-track-props='{"venue":"…"}'>
```

This site's `vzTrack` and all ten comments then go away. Not breaking.

### 4.2 Ship `ryderForm`

Register `Alpine.data('ryderForm')` for the declarative case both site forms need:
POST JSON to `data-form-action`, expose `status` as `loading` / `success` /
`error`, honor a `_gotcha` honeypot, and fire an optional `data-track-event` on
success. Port from `extended.js:10-64`, which implements exactly this twice with
the endpoint hardcoded.

Pair with a README note that the action host needs `params.csp.connectSrc`. Not
breaking.

### 4.3 `params.csp.scriptSrcHashes`, and PostHog without `'unsafe-inline'`

**Breaking — v0.3.0.**

Two problems compound. `posthog.html:18-27` inlines the bootstrap snippet, so
`csp.html:55-56` appends `'unsafe-inline'` to `script-src` for **every** PostHog
site — giving away the CSP's most valuable directive by default. Separately,
because the policy ships as a `<meta http-equiv>` tag (`csp.html:135`), **nonces
are impossible**, so a site with any inline script of its own has no option but
blanket `'unsafe-inline'`.

This site needs it for both reasons — PostHog, *and* its own client-side date
re-partitioner at `layouts/shows/list.html:27-50` — which is why `hugo.toml:21`
sets `scriptSrc = "'unsafe-inline'"` manually. The CSP partial's whole purpose is
defeated for this site.

**Fix both.** Build the PostHog snippet with
`resources.FromString | js.Build | fingerprint` and load it via `src` +
`integrity`, then stop appending `'unsafe-inline'`. And add
`params.csp.scriptSrcHashes = ["sha256-…"]` so a site with one inline script does
not disable script CSP wholesale.

The hash pattern already exists in-house: `csp.html:43-44` does exactly this for
Plausible advanced mode. PostHog receiving `'unsafe-inline'` is an inconsistency,
not a constraint. Note also that `csp.html:70-71` already documents *why*
`style-src` must keep `'unsafe-inline'` (Alpine's `x-show` writes inline styles) —
`script-src` deserves the same explicit, documented treatment rather than a silent
widening.

**Migration note.** Sites relying on the widened policy must add their own hosts
or hashes.

### 4.4 Add a dev-only CSP-Alpine linter

New `assets/js/cspLint.js`, loaded by `head/js.html` only when
`hugo.Environment == "development"`. Query every `[x-on\:click]` / `[\@click]` and
the other directive attributes; `console.warn` when a value contains `(` or `=>`,
naming the element and pointing at the `Alpine.data` pattern.

Cheap, and it catches precisely the failure mode that stayed invisible through
three outages — including the live regression at this site's
`layouts/_default/home.html:6-8`, which reintroduced the exact pattern `e7bbfe1`
eradicated.

### 4.5 Document it

A README section stating the constraint plainly, both new primitives, and the
`assets/js/extended.js` escape hatch — the theme's sanctioned custom-JS hook (a
358-byte comment-only stub, imported by `main.js`'s final line), **currently
documented nowhere**.

That hook is the best-designed seam in the theme: it shadows cleanly via Hugo's
union asset filesystem, loads before `Alpine.start()`, and loses nothing when
overridden. The CSS and schema hooks should follow its model.

---

## Tier 5 — Missing primitives

Smaller, all additive. Ship alongside Tier 2.

| # | Gap | Evidence from this site |
|---|---|---|
| 5.1 | No `youtube` or `spotify` shortcode — despite `exampleSite`'s CSP already allowlisting `youtube-nocookie.com` and the theme bundling the `faSpotify` icon. The *CSP* anticipates YouTube; the shortcode does not exist. | Site wrote `shortcodes/youtube-embed.html` and `shortcodes/spotify-embed.html` |
| 5.2 | No video lightbox beside the image one. `main.js` ships `imageGallery` for images only. | Site wrote `youtube-thumb.html`, `youtube-modal.html`, and the `vzLightbox` component |
| 5.3 | `utils/socialslist.html:1` accepts only `data/social.json` shaped `{main:[{title,icon,link,weight}]}`. A flat name→URL map — the shape Decap CMS produces, and what this site has — yields nil, so the footer renders no socials at all. Compounding it, `main.js` tree-shakes only `faSpotify` and `faGithub` from the brand set, so Instagram, TikTok, Apple Music, and Tidal have no icon even with the right data shape. | 10 hand-rolled inline SVG `<path>` blocks across `footer-verdezul.html` and `contact/list.html`; already tracked in [[TODO]] |
| 5.4 | `logo.html:13` hardwires `bg-neutral-200 hover:bg-neutral-300 … p-3 sm:p-3` — a grey rounded box with padding, not optional. | Three site nav partials inline their own `<img>` rather than call the partial |
| 5.5 | `head/favicon.html` pins `/favicon.ico?v=4`. No param, no apple-touch-icon, no webmanifest. | Site overrides it — cheaply, since `head.html:17` uses `partialCached` |
| 5.6 | `showHomeFeed` is read only by `_default/home.html`, so it is a no-op for any site that overrides the home layout. Related: no non-blog home layout is reachable by param — `hidden-home/baseof.html` exists but is a *baseof*, not a `main` block, so it cannot be selected without changing `type` or `layout`. | `hugo.toml:14` is dead config; site forked `_default/home.html` (101 lines → 26, zero shared) |

For 5.3, prefer accepting **both** social data shapes and shipping inline SVGs for
the common music platforms, over expanding the tree-shaken Font Awesome brand set.

For 5.4, either add a `logo_wrapperClass` param or drop the wrapper chrome when
`logo_png` is set. Note also that the theme reads `.Param "logo_png"`
(page-overridable) while this site reads `.Site.Params.logo_png` (site-only) — a
divergent contract worth settling.

---

## Verification

Acceptance criteria to run in `arts-link/ryder`. Several of these fail today —
that is the point.

1. **Structured data.** Build `exampleSite`, pipe every `application/ld+json`
   block through `jq` — must parse. **Fails today** (1.2). Then run the home page
   and one post through Google's Rich Results Test.
2. **CSP.** Production build of `exampleSite`; load the leaflet-maps and
   media-embeds pages in Chromium; assert zero CSP violations in the console.
   **Fails today** on the uMap iframe (1.6). Add a case beside
   `tests/e2e/smoke.spec.js`.
3. **Analytics wiring.** Build `exampleSite` with `PUBLIC_POSTHOG_*` set but no
   `[security.funcs] getenv` — assert a build warning rather than silence (1.1).
4. **Alpine primitives.** Playwright: click a `ryderTrack` element with a
   `window.posthog` stub installed, assert `capture` received the right event name
   and props. This is the regression test the three outages never had (4.1).
5. **Dark mode.** Playwright with `colorScheme: 'dark'` against a site configured
   `darkMode = "off"` — assert `<html>` carries no `dark` class (1.5).
6. **Missing-param resilience.** Build a fixture site with no `[params.footer]`
   and no `[params.csp]` — must not error (1.4).
7. **OG resolver.** Fixture with `og_image_default = "/nope.png"` — assert a named
   `errorf`, not a nil-pointer panic (1.3).
8. **Packaging.** Clean clone of a consumer site; `npm install` at the project
   root only, no `cd themes/ryder`; then `hugo --minify` must succeed (1.7, 3.3).

### The real success metric

Re-point this site's submodule, run `hugo --minify`, and confirm it can **delete**
all of the following with rendered output unchanged:

- `layouts/partials/head/favicon.html` (5.5)
- `layouts/partials/common-partials/opengraph/get-featured-image.html` (2.3)
- the `body { … !important }` block (1.5)
- the `body:has(…) > div:not(.fixed)` hack (2.7)
- `vzTrack` and the ten workaround comments (4.1)
- `header-dark.html`, `header-home.html`, `header-nowhite.html` (2.4, 2.5)
- `scriptSrc = "'unsafe-inline'"` (4.3)
- the dead `showHomeFeed` and duplicate `[outputs]` config (5.6, 3.4)
- `assets/css/tw-built.css` and the three `*-tw` npm scripts (3.3)

That deletion list — not the feature list — is how to tell whether this spec
worked.

---

## Out of scope

Two things surfaced during this audit that belong to **this site**, not the theme:

- `layouts/_default/home.html:6-8` reintroduces the exact inline-`@click` pattern
  commit `e7bbfe1` eradicated, so the documented `hero_about_click` event is
  almost certainly dead. Item 4.4's linter would have caught it.
- Roughly six drifted passages in `docs/ai/` — the Tailwind output path, the
  Vercel build command, OAuth URLs, a layout tree that no longer exists, and the
  prescribed embed-click pattern. Worth a dedicated pass.
