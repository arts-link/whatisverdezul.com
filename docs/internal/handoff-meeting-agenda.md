---
name: handoff-meeting-agenda
description: Arts-Link run-sheet for the Verdèzul client handoff meeting
metadata:
  type: reference
  status: active
  updated: 2026-07-30
  tags: [handoff, client, meeting, internal]
  related: [for-the-band/site-handoff.md]
---

# Verdèzul Handoff — Run Sheet

**Internal. Not for the band.** The band's copy is
[`docs/for-the-band/site-handoff.md`](../for-the-band/site-handoff.md).

Format: **~30 minutes, Ben demos.** That's tight for this surface area — the doc carries
the detail, the meeting carries the four things that don't survive being read.

---

## Before the meeting

Verification first. Several of these were unknowns as of handoff prep; results noted
where already checked.

| Check | Status |
|---|---|
| OG images resolve on live pages | ✅ Confirmed — Ryder pipes them from `assets/`, `/images/og/og-*.png` build correctly |
| `/llms.txt` and `/sitemap.xml` render | ✅ Confirmed in build output |
| `/privacy/` is live and linked in the footer | ✅ Shipped, in sitemap |
| `MusicEvent` JSON-LD on `/shows/` | ✅ Fixed in PR #18. Was genuinely absent despite `TODO.md` claiming otherwise. **Note:** it emits for *upcoming* shows only, and every show in `data/shows.json` is currently in the past — so it correctly outputs nothing until a future date is added. Don't check the live page and conclude it's broken |
| `robots.txt` | ✅ Added in PR #18, with the `Sitemap:` reference that was the actual gap. Empty `/categories/` and `/tags/` pages dropped from the sitemap at the same time |
| Contact form end-to-end — submit, confirm the band receives it | ☐ |
| Confirm the Formspree recipient address is the one they want | ☐ |
| Newsletter signup end-to-end — submit, confirm the row lands in the Sheet | ☐ |
| Domain auto-renew is ON; note the expiry date | ☐ |
| **Every bandmate's GitHub invite is accepted** — not just sent | ☐ |
| **Share the mailing-list Google Sheet** with the band's Google account | ☐ — of everything on the Arts-Link side this is the one they'd most reasonably expect to hold, and sharing it costs nothing |
| Live `sitemap.xml` and `robots.txt` show `www.whatisverdezul.com`, **not** a `*.vercel.app` host | ☐ — production was building with the deploy URL as its baseURL until the `vercel.json` fix; verify after it deploys |
| **Re-submit the sitemap in GSC** once the above checks out | ☐ — the version submitted before the fix was full of `*.vercel.app` URLs, which GSC rejects as outside the property |
| A real save through `/admin` since the CMS config changed (dead fields removed, Streaming collection added) | ☐ |

That last one matters: the Decap admin UI couldn't be exercised in the build
environment (its bundle loads from a CDN the sandbox blocks), so the new Streaming
collection and its validation messages have been verified structurally but never
clicked through. Do one real save first.

### Credential handover — stage this before the call

Transferring to the band: **domain/DNS**. That's the whole list.

Staying with Arts-Link: **Vercel**, the **`arts-link` GitHub org**, the **GitHub OAuth
app**, **Formspree** (paid), the **mailing-list Google Sheet**, **PostHog**, **Search
Console**.

So this is a two-minute item, not the fifteen it looks like. Move the domain credentials
through a password manager or in person — **not over email or Slack**.

**Be straight about the asymmetry rather than letting them notice it later.** The domain
is the only thing in their name, and §1 of their doc now says so plainly. Two of the
Arts-Link items are already earmarked to move — PostHog, and the mailing list — and
saying that unprompted is what keeps this from reading as lock-in.

---

## The 30 minutes

| Time | Item |
|---|---|
| **0–3** | Why we're here. Hand over the doc. **Ask who the point person is** — one named owner on the band's side, or nobody owns it |
| **3–8** | **Everyone opens `/admin` and logs in, right now, on the call.** The one hands-on block. A dead invite found in the room costs two minutes; found in three weeks it's a support ticket and a bad first impression of the whole thing |
| **8–18** | Live demo, screen shared. Add a show → Publish → refresh → it's live. Then: a press quote (watch Press appear in the nav), a merch item with an image, a YouTube video (**say the ID-not-URL rule out loud**), and a meta description edit |
| **18–23** | Where things land: contact form → inbox, signups → the Sheet, stats → PostHog. Walk the ownership table in §1 — who holds what |
| **23–27** | Getting found: the three off-site things only they can do — Bandsintown, Spotify for Artists, same bio everywhere. Plus the accent |
| **27–30** | Costs, domain auto-renew, what to do when something breaks. Support terms — **$100/hr, 30-min minimum, replies within 2 business days, site-down same day** — and that broken-things-we-built are free. Questions |

If you're running long, cut the 23–27 block — it's the one that survives being read
later. Never cut 3–8.

---

## Say these out loud

Four things that don't land in writing:

1. **Publish is instant, public, and there's no undo button.** Every version is kept, so
   nothing is truly lost — but rolling back is a phone call, not a button. This is the
   single most important thing in the meeting.
2. **Domain auto-renew.** $24/year, and letting it lapse takes the whole site down —
   music domains get sniped fast. Ask them to check it on the call.
3. **Formspree is on Arts-Link's paid account** — and it runs *both* forms. If it lapsed,
   both would fail silently. Not hidden, not a problem today, but they should know.
4. **The theme is a private component of the `arts-link` org**, pulled fresh on every
   publish. Losing that access stops the site publishing regardless of their content.

---

## After

- Send the recording and the doc the same day
- Transfer the four agreed credentials
- Offer to pull a Search Console report once there's a month of data — it's on the
  Arts-Link account, so they can't self-serve it
- Log anything from the parking lot that they actually want

---

## Parking lot

Known open items. Mention if asked, don't volunteer mid-demo.

- **No upcoming shows at all.** All 15 entries in `data/shows.json` are in the past, so
  `/shows/` currently reads "No shows scheduled" and the new event schema has nothing to
  emit. Not a bug, but it is the single highest-value thing they could fix in the CMS —
  and it's worth asking on the call whether dates exist that nobody has entered
- **Move PostHog to a band-owned account.** Promised in their doc with no date, so it
  needs an actual one. Check first whether PostHog can transfer a project between
  organisations or whether the history stays behind — if history doesn't follow, do it
  now while there's barely any to strand, not in a year
- **Apple Music links empty on all six releases** — pure content, they can fix it
  themselves in ten minutes, and it's free reach. Good first CMS homework
- **Bandsintown means double entry** for shows. Be straight about it rather than letting
  them discover it. The payoff justifies it; the surprise doesn't
- **No cookie banner** — deliberate, reasoning is in the privacy commit and §10
- **Duplicate image binaries** in `images/` vs `static/images/` — filed P3, invisible to
  them
- **Decap CMS's long-term maintenance status** is worth watching. Not urgent, but it's
  the piece most likely to force work in a couple of years. Don't raise this unless
  someone asks what could go wrong long-term
