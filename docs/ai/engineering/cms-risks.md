---
name: cms-risks
description: Decap CMS risk register — what the current setup exposes, what it costs, and the mitigation for each
metadata:
  type: reference
  status: active
  updated: 2026-07-31
  tags: [engineering, cms, decap, oauth, security, risk]
  related: [engineering/cms-config.md, engineering/architecture.md, TODO.md]
---

## Use this when

Deciding whether a CMS change is safe, hardening the `/admin` stack, onboarding a new
editor, or answering "what could go wrong with the CMS?"

[[cms-config]] describes how the CMS works. This doc describes what it exposes. Read that
one first if you only need the mechanics.

Severity here is **blast radius × likelihood**, not theoretical neatness. Several entries
resolve to "accepted trade-off, written down" rather than "fix this" — those are marked.

---

## Register

| # | Severity | Risk | Status |
|---|---|---|---|
| S1 | **High** | Unpinned CDN script shares a page with a repo-scoped token | Open |
| S2 | **High** | OAuth requests `repo` scope on a public repository | Open |
| S3 | Medium | Callback posts the token to an unverified opener origin | Open |
| S4 | Medium | Every save is an unreviewed direct commit to `main` | Accepted trade-off |
| S5 | Medium | No validation gate between a bad edit and a failed build | Open |
| S6 | Medium | Media uploads bypass Hugo and are permanent | Open |
| S7 | Low | URL field validation is thin outside Streaming | Open |
| S8 | Low | Project-health and exit risk | Accepted, mitigated by design |
| S9 | Low | `cms-config.md` had drifted from the code | **Fixed 2026-07-31** |
| S10 | Low | No editor-access inventory | Open |

---

## S1 — High — Unpinned CDN script shares a page with a repo-scoped token

**Where:** `static/admin/index.html:11`

```html
<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
```

Three things stack here:

1. `^3.0.0` is a **semver range resolved fresh on every page load**. Whatever unpkg
   decides is the newest 3.x is what runs. Nobody reviews it.
2. No `integrity` hash and no `crossorigin` — there is nothing to detect a substituted
   bundle.
3. **No CSP applies to this page.** The theme emits CSP from `[params.csp]` in `hugo.toml`
   into `<head>` on Hugo-rendered pages. `/admin/index.html` lives in `static/`, which Hugo
   copies byte-for-byte without touching, and `vercel.json` sets no response headers at
   all. So the admin page is the one page on the site with no script restrictions.

Decap stores the editor's GitHub access token in `localStorage` on that same origin.

**What it costs:** a compromised or hijacked unpkg publish executes arbitrary JS with
access to every editor's token. Chained with [S2](#s2--high--oauth-requests-repo-scope-on-a-public-repository)
that is write access to every private Arts-Link repo those editors can reach — not just a
defaced band site. Separately and more mundanely: unpkg being down means nobody can log in
to edit.

**Mitigation:**
- Pin an exact version (`decap-cms@3.x.y`), add the `integrity` SRI hash and
  `crossorigin="anonymous"`. Cheapest fix, removes the silent-update path.
- Better: self-host the bundle as an npm dependency copied into `static/admin/`. Also
  removes unpkg as an availability dependency.
- Add a `headers` block to `vercel.json` scoping a CSP to `/admin/*`. Decap needs
  `unsafe-inline`/`unsafe-eval`, so this is defence in depth, not a wall — but it can still
  lock `connect-src` down to GitHub and pin `script-src` to the chosen origin.

---

## S2 — High — OAuth requests `repo` scope on a public repository

**Where:** `api/oauth/auth.js:13`

```js
authUrl.searchParams.set('scope', 'repo');
```

`repo` is GitHub's **full** repository scope: read/write on every private repository the
authorising user can reach, in every org — not just this one.

`arts-link/whatisverdezul.com` is **public** (confirmed against the GitHub API:
`"visibility": "public"`). `public_repo` is sufficient for everything the CMS does.

[[cms-config]] currently justifies the wider scope with "The repo is private, so OAuth
keeps `scope=repo`" — the premise is wrong, and it is the only stated reason. See [S9](#s9--low--cms-configmd-has-drifted-from-the-code).

**What it costs:** every band member who logs in to `/admin` mints a token that can write
to `arts-link/ryder` (the private theme this site builds against) and any other private
repo they can see. This is the multiplier that turns S1 from a website problem into an
organisation problem.

**Mitigation:** change `scope` to `public_repo` and re-test one login and one publish
end to end. Decap's GitHub backend works with `public_repo` against a public repo. Fix the
justification in [[cms-config]] at the same time so the next person doesn't widen it back.

**Caveat to verify before changing:** existing editors' tokens carry the old scope until
they re-authorise. Revoking the OAuth app's existing grants forces everyone through a fresh
consent — worth doing deliberately rather than leaving a mix of scopes in circulation.

---

## S3 — Medium — Callback posts the token to an unverified opener origin

**Where:** `api/oauth/callback.js:41-48`

```js
const receiveMessage = (e) => {
  window.opener.postMessage(<the token>, e.origin);
  ...
};
window.addEventListener("message", receiveMessage, false);
window.opener.postMessage("authorizing:github", "*");
```

The handshake is broadcast to `"*"`, and the **access token** is then sent to `e.origin` —
whatever origin happened to reply. There is no allowlist check on either side. This is the
widely-copied `netlify-cms-oauth-provider` pattern, and this is the sloppy part of it.

Two related weaknesses in the same pair of files:

- `redirect_uri` is derived from `req.headers.host` (`auth.js:9`, `callback.js:10`) rather
  than an allowlist. GitHub validates the callback against the registered URL, which limits
  the damage, but trusting the Host header is not a property worth relying on.
- The `state` parameter is passed through by `auth.js:16-18` and **never validated** by the
  callback — no CSRF check on the flow.

**What it costs:** the exploit path is narrow (an attacker needs to control the opener
window), but the payload is the full token, so the downside is the same as S1's.

**Mitigation:** hardcode the expected origin (`https://www.whatisverdezul.com`), send the
handshake to it rather than `"*"`, and refuse to post the token unless `e.origin` matches.
Pin the host used for `redirect_uri` to a small allowlist. Validate `state` round-trip.

---

## S4 — Medium — Every save is an unreviewed direct commit to `main`

**Accepted trade-off — do not change silently.**

`static/admin/config.yml` has no `publish_mode: editorial_workflow`, `main` has no branch
protection and no required checks. Publish writes straight to `main`, Vercel rebuilds, live
in about a minute. The commit history confirms it (`Update Shows "shows"`,
`Update Page Content "home"` sitting directly on `main`).

This is exactly what `docs/for-the-band/site-handoff.md` §3 promises the band, in those
words: no draft mode, no preview, no approval, no undo button. It was a deliberate choice.

**What compounds it:** the Band team holds repo **Write**
(`docs/for-the-band/inviting-bandmates.md`, Part 1 step 3) — broader than the CMS needs. A
Write member can edit `api/oauth/*`, `static/admin/config.yml`, templates and workflows
through the GitHub web UI. The band-facing reassurance "You can't break the design" is true
of the *editor* but not of the *access it grants*.

**Options, in order of disruption:**
1. **Leave it.** The current answer. Content mistakes are recoverable from git history;
   the audience is four people who were told to read before publishing.
2. Add branch protection that still permits the CMS's direct pushes — catches accidental
   force-pushes and history rewrites without changing the editor experience.
3. Turn on `publish_mode: editorial_workflow`. Decap then opens a PR per change. **This
   costs the band one-click publish**, contradicts §3 of the handoff doc, and needs that doc
   rewritten first. Do not enable it as a side effect of some other task.

Changing the publish model is a client decision, not an engineering cleanup.

---

## S5 — Medium — No validation gate between a bad edit and a failed build

`.github/workflows/` does not exist. Vercel builds on push; nothing checks `data/*.json`
first.

Decap writes well-formed JSON, so syntax breaks are unlikely. Semantic ones are not: a
`shows[].date` that lands outside the expected format, a required field emptied out, a
template that assumes a key that is now missing.

**What it actually costs — worth stating plainly, because the band-facing doc oversells
it:** Vercel keeps the last successful production deployment serving. A failed build means
**"the edit doesn't show up,"** not "the site goes down." `site-handoff.md` §12 currently
reads as though publishing failure takes the site with it. It doesn't.

The real cost is silence: the editor sees a successful save, the site never changes, and
nobody finds out until someone looks.

**Mitigation:** a GitHub Action on push to `main` running
`git submodule update --init --recursive && npm install && hugo --minify` — the same
sequence `vercel.json` uses. A red check is a visible signal that a publish didn't land.
Optionally add a light shape assertion over `data/*.json`.

---

## S6 — Medium — Media uploads bypass Hugo and are permanent

**Where:** `static/admin/config.yml:8-9`

```yaml
media_folder: static/images/uploads
public_folder: /images/uploads
```

Hugo does **not** process anything under `static/` — files are copied byte-for-byte. No
resize, no WebP, no `srcset`. Whatever an editor uploads is exactly what every visitor
downloads, which is why `site-handoff.md` §5 has to push compression onto the band by hand
("keep the file under about 500 KB", "the site does not resize your images").

Every upload is also a binary committed to git forever. Deleting an image in the CMS
removes it from the working tree, not from history.

**Timing note:** `.git` is already 16 MB, and `static/images/uploads` **does not exist
yet** — zero CMS uploads to date. This is the cheapest moment this change will ever be.
Once the band starts loading merch photos, the history is set.

**Mitigation:** move `media_folder` to `assets/images/uploads` so uploads enter Hugo's
asset pipeline, then render through image processing (`resources.Get` → `.Resize` /
`.Process`) in the merch, release-cover and video-thumbnail partials. Carries real template
work — this is not a config-only change.

Fold in the two existing `TODO.md` P3 rows on static-asset duplication and image
optimization. All three describe the same underlying decision: where do images live, and
does Hugo touch them.

---

## S7 — Low — URL field validation is thin outside Streaming

Only `spotify_embed_url` and `youtube_id` carry `pattern` rules
(`static/admin/config.yml:94`, `:105`). `ticket_url`, `checkout_url`, `press[].url` and all
seven social URLs are unvalidated free strings.

**XSS is not the exposure.** Recorded explicitly so it doesn't get re-raised:

- Hugo's contextual autoescaping neutralises `javascript:` in `href` position —
  `layouts/partials/show-card.html:23`, `layouts/shop/list.html:26`,
  `layouts/press/list.html:13` are all safe as written.
- JSON-LD goes out through `jsonify | safeJS`
  (`layouts/partials/head/schema-extra.html`), and `jsonify` escapes `<`, so `</script>`
  injection is closed.

**The real exposure** is duller: broken links, wrong-platform links (an Apple URL in the
Spotify field), and unescaped values flowing into `layouts/_default/home.llmstxt.txt` —
a plain-text template with no autoescaping, where a stray bracket in a title or description
mangles the markdown served to AI crawlers.

Also inconsistent: `press[].date` is a free string with a hint
(`static/admin/config.yml:128`) while `shows[].date` is a proper datetime widget.

**Mitigation:** add `pattern` rules (`^https://`, or platform-specific where it helps) with
editor-readable messages, following the two Streaming examples — those exist precisely
because the predictable editor mistake is pasting the wrong kind of URL, and they catch it
in the form instead of on the live site.

---

## S8 — Low — Project-health and exit risk

Decap's maintenance cadence has been slow, and [[cms-config]] already names Sveltia CMS as
the fallback. Sveltia reads Decap's `config.yml` for the feature set in use here, so the
exit stays cheap — **but only while the config avoids Decap-only features.** That
portability is the asset worth protecting when adding collections or widgets.

**The real insurance is already in place**, and it should be said out loud rather than
assumed: all content is plain JSON and Markdown in git (`data/*.json`,
`content/**/_index.md`). If Decap disappeared tomorrow, editing continues through GitHub
directly. This is an inconvenience risk, not a data-loss risk. The CMS is a convenience
layer over files that stand on their own.

---

## S9 — Low — `cms-config.md` had drifted from the code

**Fixed 2026-07-31, in the same change that created this register.** Kept here because the
failure mode matters more than the three typos did.

Three errors had accumulated in [[cms-config]]:

| Said | Actually |
|---|---|
| "The repo is private, so OAuth keeps `scope=repo`" | Repo is **public**. This was the sole justification for [S2](#s2--high--oauth-requests-repo-scope-on-a-public-repository) |
| OAuth callback and homepage at apex `whatisverdezul.com` | `www` is canonical; `TODO.md` records the working value as `https://www.whatisverdezul.com/api/oauth/callback` |
| Releases has an `items[].featured` field | No such field in `static/admin/config.yml` |

**Why this is in a risk register at all:** S2 survived this long because a wrong sentence in
the docs made an over-wide OAuth scope look deliberate. Nobody re-checked it, because it
read as already-decided. Doc drift on a security-relevant claim is a security risk with a
delay on it — that is the general lesson, and it is why every entry above cites `file:line`
rather than paraphrasing.

The corollary: **this register decays the same way.** Re-verify its references when
touching the CMS stack.

---

## S10 — Low — No editor-access inventory

Nothing records who currently holds Write on the repo, or which GitHub accounts have
authorised the OAuth app.

Removing someone from the `Band` team **does** revoke their access to this repo
immediately, so there is no lingering-access hole here — `inviting-bandmates.md` is correct
on that point. The residual is [S2](#s2--high--oauth-requests-repo-scope-on-a-public-repository):
their still-valid token retains `repo` scope against other private repos they can reach.
Narrowing the scope shrinks this entry to nothing.

**Mitigation:** narrow the scope (S2), and check the `Band` team membership list at each
handoff review.

---

## Related knowledge

- [[cms-config]] — how the CMS is wired: collections, fields, OAuth flow
- [[content-model]] — the data shapes CMS collections write to
- [[architecture]] — where these files live and the override rules
- [[build-commands]] — build sequence, env vars, deploy
- [[todo]] — the actionable items from this register, prioritised
