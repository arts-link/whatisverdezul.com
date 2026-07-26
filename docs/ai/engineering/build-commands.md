---
name: build-commands
description: All build, dev, and deploy commands for the Verdèzul Hugo project
metadata:
  type: reference
  status: active
  updated: 2026-07-25
  tags: [engineering, build, commands, npm, hugo, vercel]
  related: [engineering/architecture.md, specs/ryder-v0.3-spec.md]
---

## Use this when

Running the project locally, building for production, or debugging the build pipeline.

---

## Local development

```bash
hugo server
```

One terminal. That's it — `http://localhost:1313` with live reload.

**TailwindCSS is compiled by Hugo, not by a separate watcher.** Ryder's
`layouts/partials/head/css.html` pipes `css/main.css` plus everything matching
`css/extended/*.css` through `css.PostCSS`, which picks up this project's
root-level `postcss.config.js` and `tailwind.config.js`. Editing a template or
`assets/css/extended/verdezul.css` rebuilds CSS on the next reload.

Two caveats:

- **Restart the server after editing `tailwind.config.js` or `postcss.config.js`.**
  Neither this site nor Ryder configures `[build] writeStats` or
  `[[build.cachebusters]]`, so Hugo does not know to invalidate the CSS when those
  files change. See item 1.8 in [[ryder-v0.3-spec]].
- **Root `node_modules` is required.** Hugo resolves both the PostCSS pipeline and
  `js.Build`'s imports (Alpine, Font Awesome, Leaflet) from the project root, so
  `npm install` must have run here — not in `themes/ryder/`.

---

## Production build

```bash
hugo --minify
```

Output goes to `public/`. This is what Vercel runs.

---

## npm scripts

| Command | What it does |
|---------|-------------|
| `npm install` | Installs the PostCSS/Tailwind toolchain and the JS packages `js.Build` imports. Required before any build. |
| `npm run build-tw` | **Vestigial — do not use.** See below. |
| `npm run watch-tw` | Vestigial. |
| `npm run deploy-tw` | Vestigial. |

The three `*-tw` scripts run the Tailwind CLI to write `assets/css/tw-built.css`.
**Nothing reads that file** — no template resolves it, and it is gitignored. Hugo's
own `css.PostCSS` step does the real compilation. The scripts are inherited from
Ryder, where they are equally dead; item 3.3 of [[ryder-v0.3-spec]] removes them
upstream, and they should be deleted here at the same time.

---

## Vercel build config (`vercel.json`)

```json
{
  "framework": "hugo",
  "buildCommand": "[ -n \"$VERCEL_URL\" ] && hugo --minify --baseURL \"https://$VERCEL_URL\" || hugo --minify",
  "outputDirectory": "public",
  "installCommand": "git submodule update --init --recursive && npm install"
}
```

The `buildCommand` branch gives preview deploys a working `baseURL` while
production uses the `baseURL` from `hugo.toml`. The submodule init is explicit in
`installCommand` — Vercel does not do it automatically, and the build fails without
it because the theme directory would be empty.

`vercel.json` also carries the non-www → www permanent redirect that makes www
canonical, and a `/admin` → `/admin/` redirect for Decap.

---

## Environment variables

| Variable | Used by | How to set |
|----------|---------|-----------|
| `PUBLIC_POSTHOG_KEY` | PostHog project key | `vercel env add PUBLIC_POSTHOG_KEY` |
| `PUBLIC_POSTHOG_HOST` | PostHog ingestion host | `vercel env add PUBLIC_POSTHOG_HOST` |
| `GITHUB_CLIENT_ID` | Decap CMS OAuth | `vercel env add GITHUB_CLIENT_ID` |
| `GITHUB_CLIENT_SECRET` | Decap CMS OAuth | `vercel env add GITHUB_CLIENT_SECRET` |

The contact form and email signup need no env var — both POST directly to Formspree from the browser (`/f/xojgerbg` and `/f/mlgqjvro`). Recipient addresses are configured in the Formspree dashboard, not in code.

Pull env vars for local dev:
```bash
vercel env pull .env.local
```

---

## When to run what

| Situation | Command |
|-----------|---------|
| Starting local dev | `hugo server` |
| After editing `tailwind.config.js` / `postcss.config.js` | restart `hugo server` |
| Before committing CSS changes | nothing — Hugo compiles it |
| Full production check locally | `hugo --minify && cd public && python3 -m http.server 8080` |
| Fresh clone | `git submodule update --init --recursive && npm install` |
| After pulling new Ryder changes | `git submodule update --remote themes/ryder` then `npm install` — and read the Migration path section of [[ryder-v0.3-spec]] first |

## Related knowledge

- [[architecture]] — how the build output maps to the directory structure
- [[ryder-v0.3-spec]] — why the `*-tw` scripts are dead, and what changes when the theme is upgraded
