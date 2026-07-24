# Arts-Link Launch Article — Technical Brief + Writing-Agent Prompt

Source document for a case-study post on the Arts-Link blog about building
whatisverdezul.com. **Part A** is the factual outline of the technical work.
**Part B** is a self-contained prompt to give to the article-writing agent in
the arts-link.com repo (Part A travels with it as the source of truth).

---

## Part A — Technical outline of the project

### 1. The client process: structured onboarding

- The project started with a **12-section onboarding checklist** shared as a
  Google Doc, covering: band basics, brand direction and vision, photography
  and visuals, brand assets, music and media links, tour/events, press,
  shop/merch, social links, contact and fan actions, domain/technical, and
  SEO/launch extras.
- The checklist did double duty: it forced the design conversation early
  (the band supplied visual reference sites — awge.com, txdxe.com,
  golfwang.com, travisscott.com — plus a brand palette of green, blue, black,
  white, with occasional red and brown, and a guiding line: *"We're in the
  world, not of the world, but we reflect the world around us"*), and its
  answers mapped almost one-to-one onto the site's data model.
- Checklist answers became `data/*.json` files (band info, socials, releases,
  shows, merch, press) and a band-identity reference doc that every later
  work session — human or AI — reads first.
- The site's priorities came straight from the client's ranking in that doc:
  booking shows, growing fans, promoting music, selling merch, press
  credibility.
- **Article note:** describe the *process*, not the raw answers. Do not
  reprint the client's contact details or private responses.

### 2. Docs-first, AI-assisted build

- Phase 1 of the build — before any code — was writing a `docs/ai/`
  knowledge base: an agent operating brief (`AGENT_START.md`), a task routing
  table (`AI_INDEX.md`), strategy docs (band context, site goals, visual
  direction), engineering docs (architecture, content model, CMS config,
  routes, SEO/schema, analytics events, build commands), content docs
  (writing guide, media embed rules), and finish-line checklists.
- Every subsequent session, human- or AI-driven, starts from the same
  context. Decisions (like "the band name is always Verdèzul, accent on the
  è") are encoded once and enforced everywhere.
- This is a distinctive Arts-Link working method and a strong angle for the
  article: the docs are the durable asset; the site is the output.

### 3. Framework decision: Hugo + the in-house Ryder theme

- **Hugo** was chosen over Astro for three reasons:
  1. Arts-Link authored the **Ryder theme** — full ownership, all conventions
     known, so heavily customizing a theme we wrote is faster than starting
     from scratch elsewhere.
  2. Band sites are content-heavy and layout-stable; Hugo's data files and
     millisecond rebuilds fit that shape exactly.
  3. Hugo + Decap CMS is the canonical git-based-CMS pairing — mature, well
     documented, and clean `data/` integration.
- Ryder is included as a **git submodule** at `themes/ryder/`, never edited
  directly, so upstream theme improvements can be pulled in cleanly.

### 4. Ryder: what was reused vs. overridden

**Reused from the theme as-is:**
- The TailwindCSS build pipeline (theme npm scripts compile theme CSS plus
  anything the site drops into `assets/css/extended/`).
- The bundled Alpine.js (CSP build) for interactivity.
- Analytics bootstrapping via a single param: `analytics_provider = "posthog"`.
- Base templates, head/meta handling, and — crucially — Ryder's
  **variant-partial system**: `headerType`, `footerType`, and `menuType`
  params append a suffix to the partial name, so setting them all to
  `"-verdezul"` makes the theme load the site's own header, footer, and nav
  partials without touching a single theme file.

**Overridden in the site (Hugo's lookup order: site `layouts/` beats theme):**
- `layouts/partials/header-verdezul.html`, `footer-verdezul.html`,
  `menu-verdezul.html` — the band's nav, footer, and header treatments.
- `layouts/_default/home.html` — a fully custom hero: tiled-logo background
  with a neon-green statement box, gradient stripe, and glowing scroll cue.
- Per-section layouts for About, Music, Shows, Press, Shop, and Contact.
- `assets/css/extended/verdezul.css` — all site-specific styling on top of
  the theme's Tailwind base.
- Shortcodes/partials for YouTube and Spotify embeds (including a CSP-safe
  YouTube lightbox), and a JSON-LD schema partial emitting `MusicGroup`,
  `MusicEvent`, and `MusicAlbum` structured data.
- The rule throughout: **override, never fork** — the theme submodule stayed
  pristine for the entire project.

### 5. Open-source toolchain

- **Hugo** — static site generator; production builds in milliseconds.
- **TailwindCSS** — utility CSS, compiled by the theme's build scripts.
- **Alpine.js (CSP build)** — lightweight interactivity under a strict
  Content-Security-Policy. The CSP build disallows `fetch()` and arrow
  functions in inline expressions, so both forms are proper components
  registered via `Alpine.data(...)` in a site JS file — a real-world
  constraint worth a paragraph.
- **Decap CMS** — open-source, git-backed admin UI.
- **PostHog** — product analytics (open-source core), wired through the
  theme's provider param plus custom click events in templates.
- Pragmatic hosted glue where a service beats self-rolling: **Vercel**
  (hosting, auto-deploy from `main`, and two ~30-line serverless functions
  that proxy GitHub OAuth for the CMS) and **Formspree** (contact form and
  email signup — no server code on our side at all).

### 6. Maintaining the site with a git-based CMS

- Every piece of client-editable content lives in `data/*.json`; list-backed
  content (shows, releases, press quotes, merch) uses a uniform `items`
  array shape that templates iterate over.
- **Decap CMS** is served at `/admin`. The band logs in with GitHub OAuth
  (proxied through a Vercel serverless function so no secret ever reaches
  the browser), edits shows/releases/merch/press/pages in a friendly form
  UI, and hits save.
- Each save is a **git commit to `main`**; Vercel sees the commit and
  redeploys the static site in about a minute. No database, no server to
  maintain, full edit history, and any mistake is one `git revert` away.
- Empty-state pattern: sections with no data disappear entirely — e.g. the
  Press nav item is hidden until `press.json` has at least one item, so the
  site never shows scaffolding while the band collects press.

### 7. Honest iteration notes (what shipping actually looked like)

- **Email signup pivoted twice**: an initial Buttondown API proxy (serverless
  function holding the API key) was replaced with Formspree posting straight
  from the browser — signups collect into a Google Sheet, and picking a
  newsletter platform is deliberately deferred until the band has a real
  list and owns its own account. The contact form similarly moved from a
  Resend-backed function to Formspree. Net result: the site's serverless
  footprint shrank to just the CMS OAuth proxy.
- **CSP was a recurring character**: allowing YouTube/Spotify iframes via
  `frame-src`, inline JSON-LD scripts, Formspree in `connect-src`, and
  building a lightbox that works under the Alpine CSP build.
- **Submodule + Vercel gotchas**: the theme submodule URL had to be public
  HTTPS (not a local SSH alias), and the build needed explicit submodule
  init and the Hugo framework declared in `vercel.json`.
- **Analytics as a feature**: PostHog events cover ticket clicks, merch
  clicks, streaming/play clicks, social follows, and form submissions — so
  the band can see which calls-to-action actually work.
- **SEO/GEO**: pre-generated OG images, `MusicGroup`/`MusicEvent`/
  `MusicAlbum` JSON-LD, and an `llms.txt` output for AI crawlers.
- The commit history is full of tiny design-dial commits (hero tile size,
  neon-box padding, purple background tuning) — evidence of a fast
  feedback loop with the client rather than a big-bang reveal.

---

## Part B — Prompt for the article-writing agent (paste verbatim)

```
You are writing a blog post for the Arts-Link blog (this repo powers
arts-link.com). The post is a launch case study about building
whatisverdezul.com, the official website for the band Verdèzul.

STEP 1 — CALIBRATE STYLE BEFORE WRITING ANYTHING.
Find the blog content directory in this repo and read several existing
posts. Match their voice, tone, person, formatting conventions, typical
length, front matter schema, file-naming pattern, and image handling. The
blog hasn't had a post in a while — this post should feel like it belongs
next to the existing ones, not like a reboot. Follow this repo's own
conventions for creating a new post (archetypes, taxonomies, etc.).

STEP 2 — WRITE THE POST.
Audience: musicians/creatives who might hire Arts-Link, and fellow
builders curious about the approach. It is a story about how we work, not
a tutorial. Write as Arts-Link in the first person.

Story beats to cover, in roughly this order:
1. The client process — a structured 12-section onboarding checklist
   (band basics, brand direction with visual reference sites, photos,
   assets, music links, shows, press, merch, socials, contact, domain,
   SEO extras) whose answers mapped directly onto the site's data model
   and a docs-first knowledge base that every later work session reads.
2. The stack decision — Hugo plus Ryder, the Hugo theme Arts-Link
   authored. Why owning your own theme changes the math, and how the
   site customized everything through Hugo's override system (custom
   header/footer/nav partials, a fully custom homepage hero, per-section
   layouts, a site CSS layer) while the theme itself — a git submodule —
   was never edited. "Override, never fork."
3. The open-source toolchain — Hugo, TailwindCSS, Alpine.js (CSP build),
   Decap CMS, PostHog — plus pragmatic hosted services where they beat
   self-rolling: Vercel for hosting/deploys and two tiny OAuth proxy
   functions, Formspree for the contact form and email signup.
4. How the band maintains the site — a git-based CMS: Decap CMS at
   /admin, GitHub OAuth, friendly forms editing JSON data files; every
   save is a git commit that auto-deploys in about a minute. No
   database, full history, mistakes are one revert away. Sections with
   no content (like Press) hide themselves until there's something to
   show.
Optionally weave in one or two honest iteration notes from the source
material (the email-signup pivot to Formspree, wrestling with a strict
Content-Security-Policy) — real details make it credible.

FACTS. Use the "Part A — Technical outline" section of the brief that
accompanies this prompt as your single source of truth. Do not invent
features, metrics, dates, or client quotes that are not in it.

HARD CONSTRAINTS.
- The band name is always "Verdèzul" — with the accent on the è. Never
  "Verdezul", never "verde-azul", never hyphenated.
- Link to https://whatisverdezul.com at least once.
- Do not publish the client's personal or contact details, private
  onboarding answers, credentials, or internal identifiers of any kind.
- Do not name the fee, the SOW terms, or anything contractual.
- End the post the way other posts on this blog end (match convention).

DELIVERABLE. A ready-to-publish post file in this repo's blog content
directory, following its conventions, plus anything the repo requires
for a post to build cleanly (verify with the site's build command).
```

---

*Prepared 2026-07-24 for the Arts-Link launch article. Hand the whole file
(Parts A + B) to the writing agent in the arts-link.com repo; Part B is the
instruction, Part A is its source material.*
