---
name: build-commands
description: All build, dev, and deploy commands for the Verdèzul Hugo project
metadata:
  type: reference
  status: active
  updated: 2026-07-29
  tags: [engineering, build, commands, npm, hugo, vercel]
  related: [engineering/architecture.md]
---

## Use this when

Running the project locally, building for production, or debugging the build pipeline.

---

## Local development

```bash
npm install     # once, and after any dependency change
hugo server
```

Hugo's dev server runs at `http://localhost:1313` with live reload. There is no
separate CSS step: Ryder's `head/css.html` pipes the stylesheets through
`css.PostCSS`, so Hugo compiles TailwindCSS itself on every build and rebuild,
using the root `postcss.config.js` and `tailwind.config.js`.

`npm install` is still required — Hugo resolves `tailwindcss`, `postcss`,
`@alpinejs/*` and the Font Awesome packages from the project root's
`node_modules/`.

---

## Production build

```bash
hugo --minify
```

Output goes to `public/`. This is what Vercel runs.

---

## npm scripts

There are none, by design. Ryder v0.3.0 deleted `build-tw`, `watch-tw` and
`deploy-tw`, and deleted `assets/css/style.css` along with them; CSS is a Hugo
pipeline concern now. `package.json` carries dependencies only.

---

## Vercel build config (`vercel.json`)

```json
{
  "framework": "hugo",
  "buildCommand": "if [ \"$VERCEL_ENV\" = \"production\" ]; then hugo --minify; else hugo --minify --baseURL \"https://$VERCEL_URL\"; fi",
  "outputDirectory": "public",
  "installCommand": "git submodule update --init --recursive && npm install"
}
```

The `buildCommand` overrides `baseURL` on preview deploys so preview URLs resolve
against themselves instead of the production domain. Production falls through to
`hugo.toml`'s `baseURL`, which stays the single source of truth for the canonical host.
The `installCommand` checks out the Ryder submodule before installing.

**Two traps this shape exists to avoid — both were live bugs.**

**Branch on `VERCEL_ENV`, never on `VERCEL_URL`.** Vercel sets `VERCEL_URL` on *every*
deployment, production included, and it is always the deployment-specific
`*.vercel.app` hostname — never the custom domain. An earlier `[ -n "$VERCEL_URL" ]`
guard was therefore always true, so **production built with a `*.vercel.app` baseURL**:
canonical tags, `sitemap.xml`, the `Sitemap:` line in `robots.txt`, `og:url`, `og:image`,
the JSON-LD URLs, `llms.txt` and RSS were all wrong on the live site. `VERCEL_ENV`
(`production` | `preview` | `development`) is the distinction actually wanted.

**Use `if/else`, not `A && B || C`.** In the old shape a *failing* preview build fell
through to the `||` fallback, which succeeded — so a broken build deployed green, with
the wrong baseURL. `if/else` lets a failure stay a failure.

Neither bug is reproducible locally, because a bare `hugo` reads `hugo.toml` and looks
correct. To test a change here, run the exact command string with the variable set:

```bash
# Should print the www host
VERCEL_ENV=production VERCEL_URL=deploy-abc.vercel.app sh -c "$(python3 -c "import json;print(json.load(open('vercel.json'))['buildCommand'])")"
grep -o '<loc>[^<]*</loc>' public/sitemap.xml | head -1

# Should print the preview host
VERCEL_ENV=preview VERCEL_URL=deploy-abc.vercel.app sh -c "$(python3 -c "import json;print(json.load(open('vercel.json'))['buildCommand'])")"
grep -o '<loc>[^<]*</loc>' public/sitemap.xml | head -1
```

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
| Before committing CSS changes | nothing extra — `hugo server` recompiles CSS on save |
| Full production check locally | `hugo --minify && cd public && python3 -m http.server 8080` |
| After pulling new Ryder changes | `git submodule update --remote themes/ryder` then `npm install` |

## Related knowledge

- [[architecture]] — how the build output maps to the directory structure
