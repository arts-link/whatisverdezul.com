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
| A real save through `/admin` since the CMS config changed (dead fields removed, Streaming collection added) | ☐ |

That last one matters: the Decap admin UI couldn't be exercised in the build
environment (its bundle loads from a CDN the sandbox blocks), so the new Streaming
collection and its validation messages have been verified structurally but never
clicked through. Do one real save first.

### Credential handover — stage this before the call

Transferring to the band: **domain/DNS**, the **Google Sheet**, **PostHog**, the
**GitHub OAuth app**.

Staying with Arts-Link: **Vercel**, the **`arts-link` GitHub org**, **Formspree** (paid).

Move them through a password manager or in person. **Not over email or Slack.** Have the
list written out before the call so this doesn't become fifteen unplanned minutes.

---

## The 30 minutes

| Time | Item |
|---|---|
| **0–3** | Why we're here. Hand over the doc. **Ask who the point person is** — one named owner on the band's side, or nobody owns it |
| **3–8** | **Everyone opens `/admin` and logs in, right now, on the call.** The one hands-on block. A dead invite found in the room costs two minutes; found in three weeks it's a support ticket and a bad first impression of the whole thing |
| **8–18** | Live demo, screen shared. Add a show → Publish → refresh → it's live. Then: a press quote (watch Press appear in the nav), a merch item with an image, a YouTube video (**say the ID-not-URL rule out loud**), and a meta description edit |
| **18–23** | Where things land: contact form → inbox, signups → the Sheet, stats → PostHog. Walk the ownership table in §1 — who holds what |
| **23–27** | Getting found: the three off-site things only they can do — Bandsintown, Spotify for Artists, same bio everywhere. Plus the accent |
| **27–30** | Costs, domain auto-renew, what to do when something breaks, support terms. Questions |

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
- Confirm Search Console is set up on the **www** property, not the apex
- Fill in the `$[RATE]` / `[MINIMUM]` / `[N] business days` placeholders in §13 of the
  band's doc before sending it — it ships with them unfilled
- Log anything from the parking lot that they actually want

---

## Parking lot

Known open items. Mention if asked, don't volunteer mid-demo.

- **No upcoming shows at all.** All 15 entries in `data/shows.json` are in the past, so
  `/shows/` currently reads "No shows scheduled" and the new event schema has nothing to
  emit. Not a bug, but it is the single highest-value thing they could fix in the CMS —
  and it's worth asking on the call whether dates exist that nobody has entered
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
