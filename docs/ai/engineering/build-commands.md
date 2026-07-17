---
name: build-commands
description: All build, dev, and deploy commands for the Verdèzul Hugo project
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [engineering, build, commands, npm, hugo, vercel]
  related: [engineering/architecture.md]
---

## Use this when

Running the project locally, building for production, or debugging the build pipeline.

---

## Local development

```bash
# Terminal 1 — watch and compile TailwindCSS
npm run watch-tw

# Terminal 2 — Hugo dev server
hugo server
```

Hugo's dev server runs at `http://localhost:1313` with live reload. TailwindCSS must be compiled separately — `hugo server` alone won't rebuild CSS.

---

## Production build

```bash
npm run build-tw && hugo --minify
```

Output goes to `public/`. This is what Vercel runs.

---

## All npm scripts (from Ryder's `package.json`)

| Command | What it does |
|---------|-------------|
| `npm run build-tw` | Compile TailwindCSS → `themes/ryder/assets/css/style.css` |
| `npm run watch-tw` | Watch and recompile TailwindCSS on changes |
| `npm run deploy-tw` | Build + minify TailwindCSS for production |
| `npm test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Vercel build config (`vercel.json`)

```json
{
  "buildCommand": "npm run build-tw && hugo --minify",
  "outputDirectory": "public",
  "installCommand": "npm install"
}
```

Vercel also runs `git submodule update --init --recursive` automatically before the build.

---

## Environment variables

| Variable | Used by | How to set |
|----------|---------|-----------|
| `POSTHOG_KEY` | PostHog analytics | `vercel env add POSTHOG_KEY` |
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
| Starting local dev | `npm run watch-tw` + `hugo server` |
| Before committing CSS changes | `npm run build-tw` |
| Full production check locally | `npm run build-tw && hugo --minify && cd public && python3 -m http.server 8080` |
| After pulling new Ryder changes | `git submodule update --remote themes/ryder` then `npm install` |

## Related knowledge

- [[architecture]] — how the build output maps to the directory structure
