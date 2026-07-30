# Your Website: Everything You Need to Run It

No technical background needed.

This is the reference doc for whatisverdezul.com — what you own, how to change things,
what you can't change yourself, and who to call when something looks wrong. Keep it
somewhere you'll find it again.

Two companion guides cover their topics in more depth:
[inviting-bandmates.md](inviting-bandmates.md) (adding editors) and
[email-list-and-newsletter.md](email-list-and-newsletter.md) (sending to your list).

---

## 1. What you own, and what runs on someone else's account

Your site is held together by seven accounts. Some are yours, some are Arts-Link's. This
is the part people skip and regret later, so here it is up front.

| What | Whose account | What it does | If it goes away |
|---|---|---|---|
| **Domain** (whatisverdezul.com) | **Yours** | The address itself | Site goes dark. See §11 |
| **Vercel** | Arts-Link | Publishes the site | Site goes dark |
| **GitHub org** (`arts-link`) | Arts-Link | Stores the site's files and your editor accounts | Nobody can edit |
| **GitHub OAuth app** | Arts-Link | What makes the `/admin` login work | Nobody can log in to edit |
| **Formspree** (paid) | Arts-Link | Runs your contact form **and** newsletter signup | Both forms stop working |
| **Google Sheet** | Arts-Link | Holds your mailing list | You lose the list |
| **PostHog** | Arts-Link | Website statistics | You lose the stats history |
| **Google Search Console** | Arts-Link | Shows what people searched to find you | You lose search reporting; the site itself is fine |

**Read that table again, because the short version is blunt:** the only thing on it in
your name today is the domain. Everything else runs on Arts-Link accounts. That's a
normal way to start, and none of it is a problem right now — but it's the reason to keep
Ben's number, and it's worth revisiting as the band grows.

**Three of those are worth saying out loud.**

Your site's design lives in a private component owned by the `arts-link` GitHub
organization, and it gets pulled in fresh every single time the site republishes. If
that access ever went away, the site would stop being able to publish — not because of
anything you did to your content.

Formspree runs *both* your forms on Arts-Link's paid account. If that account ever
lapsed, your contact form and your newsletter signup would both stop silently — no
error message, no bounce, they'd just quietly stop arriving.

The **`/admin` login** can't simply be moved to your name. It's a GitHub app that has to
be owned by the `arts-link` organization — that's the only configuration GitHub's
security settings allow here, and getting it wrong is what stopped the editor from
saving at all during the build.

**Two of these are already planned to change.** Ben will set the band up with your own
**PostHog** account, so the site statistics become yours. And the **mailing list**, which
is the one asset you'd least want to be renting, is worth moving into your own hands
early — [email-list-and-newsletter.md](email-list-and-newsletter.md) covers how.

---

## 2. Logging in to edit

Go to **whatisverdezul.com/admin** and click **Login with GitHub**.

Everyone edits with their own free GitHub account — there's no shared site password.
Adding or removing a bandmate is covered step-by-step in
[inviting-bandmates.md](inviting-bandmates.md).

If the login is refused, it's almost always an unaccepted GitHub invitation. Check
your email for a message from GitHub, accept it, then try again.

---

## 3. What "Publish" actually does — read this one

When you hit **Publish**, your change is saved and the site rebuilds itself. It's live
on the internet **about a minute later.**

That means:

- **There's no draft mode.** Nothing waits for review.
- **There's no preview.** You see it once it's live.
- **Nobody approves it.** Whatever you typed is what the world gets.
- **There's no undo button.** There's no trash can to fish something out of.

That last one has an asterisk, and it's a good one: **every version of every change is
kept forever.** So nothing is genuinely lost — but rolling back is something Ben does,
not something there's a button for. If you publish something you didn't mean to, don't
try to fix it by hand in a panic. Email Ben and say what it looked like before.

The practical habit: **read it once before you hit Publish.** That's the whole safety
net, and it's enough.

---

## 4. Editing each part of the site

Everything below is in the editor at `/admin`. Each section names the one thing that
trips people up.

### Shows

Add, edit, and remove tour dates.

Use the **date picker** — don't type dates by hand. The site sorts by date and moves
shows into a "Past Shows" section on its own once they've happened, and a hand-typed
date can land a show in the wrong section or stop the site publishing entirely.

**Past shows are never deleted.** They pile up under Past Shows forever. That's
deliberate — it reads as history — but delete them yourself if the list gets long.

**A show with no ticket link shows no button at all.** Not "Tickets TBA" — nothing. If
tickets aren't on sale yet, either leave the show off until they are, or say so in the
Description field.

### Releases

Your albums, EPs and singles on the Music page.

**Type** must be album, EP, or single — pick from the dropdown, don't invent new ones.

Heads up: **every release is currently missing its Apple Music link**, so no Apple
links show anywhere on the site. Fill in the Apple Music URL field on each release when
you have a spare ten minutes — it's free reach you're leaving on the table.

### Streaming (videos and Spotify)

Add and remove the YouTube videos on the Streaming page, and swap the Spotify player.

**Paste the video ID, not the whole link.** A YouTube URL looks like
`youtube.com/watch?v=Op1oF2qy_ek` — the part you want is just `Op1oF2qy_ek`, the
11 characters after `v=`. The editor will stop you if you paste the whole thing.

If a video's thumbnail looks grey or blank, that video was uploaded to YouTube in low
resolution and YouTube has no good image for it. Upload your own image in the
**Thumbnail** field to fix it.

For Spotify, use **Share → Embed** and copy that link — a normal share link won't work,
and the editor will tell you so.

### Merch

**There's no shopping cart and no payments here.** Each item links out to wherever
you're actually selling. The site is a display case, not a store.

An item with no checkout link shows a **"Coming Soon"** badge instead of a buy button —
useful for teasing a drop. Every item needs an image.

### Press

Quotes and coverage.

**Adding your first press quote makes "Press" appear in the site's menu.** Delete them
all and it disappears again. That's intentional — an empty Press page looks worse than
no Press page.

**Don't type your own quote marks.** The design adds them. Typing your own gives you
double quotes.

### Page Content

The wording on the Home, About and Contact pages. Only those three.

The **Meta Description** field on each is your main lever on how the page looks in
Google results — it's often the sentence people read before deciding whether to click.
Aim for one clear sentence, 100–160 characters, describing what's actually on the page.

### Band Info and Social Links

Your contact email and every social icon on the site come from here. **Blank out a
social URL and that icon disappears** from the footer — which is the clean way to drop
a platform you've stopped using.

---

## 5. Images

Three rules, and they matter more than you'd think:

1. **Square, for merch and release covers.** They get cropped to a square automatically,
   from the center. A wide photo will lose its edges; a tall one will lose heads.
2. **Around 1000×1000 pixels** is the sweet spot.
3. **Keep the file under about 500 KB.**

That third one is the important one: **the site does not resize your images.** Whatever
you upload is exactly what visitors download. Drop a 6 MB photo straight off your phone
and every visitor on mobile data downloads 6 MB to see it. Run it through any free image
compressor first.

---

## 6. What you can't change yourself

Email Ben for any of these:

- The About page's photos and the pull-quote across the top
- The Home page's headline and the big album image
- The menu itself — adding, removing or renaming a page
- Page titles and meta descriptions for Shows, Music, Press and Shop (Home, About and
  Contact you *can* edit — see §4)
- Anything about the design: colors, fonts, layout, spacing

None of these are hard. They're just not safe to expose in a form.

---

## 7. Your forms, and where the mail goes

**Contact form** → a service called Formspree → the band's inbox. The subject line
tells you which category the sender picked (Booking, General, or Press).

**Newsletter signup** (the "Stay in the loop" box in the footer) → Formspree → a private
**Google Sheet**. That sheet is your mailing list. It fills up on its own; you don't
have to do anything to keep it running. When you're ready to actually send something,
[email-list-and-newsletter.md](email-list-and-newsletter.md) walks through it.

Both forms have basic spam protection built in.

**Both run on Arts-Link's paid Formspree account** (see §1). So changing *where* the
contact form delivers, or exporting your form submissions, goes through Ben. Worth
knowing before the day you need it.

---

## 8. Your website statistics

Your site uses **PostHog**. It records pageviews and a specific set of actions that map
to things you actually care about:

| What you want to know | What to look at |
|---|---|
| Are people trying to book us? | `contact_form_submit` |
| Is the fanbase growing? | `email_signup_success`, `social_follow_click` |
| Is anyone listening? | `spotify_play_click`, `youtube_play_click` |
| Is merch working? | `merch_click` |
| Are people buying tickets? | `ticket_link_click` |

The free tier is generous — a band site won't come close to the limit.

**It's running on Arts-Link's PostHog account for now**, so ask Ben when you want to see
the numbers. Collecting the data is the part that had to start early — statistics only
exist from the day they're switched on, so it's already building up a history. Ben will
set you up with your own account.

The most useful habit isn't watching a dashboard. It's checking, after a show
announcement or a drop, whether ticket and merch clicks actually moved. That tells you
whether the announcement worked.

---

## 9. Getting found — search engines and AI

Your site is already built correctly for search. The work that's left is mostly *off*
your site, and only you can do it.

### Already handled

Structured data telling Google you're a band, preview images for when links get shared,
a sitemap, an `llms.txt` file for AI crawlers, and proper page descriptions. You don't
need to maintain any of it.

### Search Console — already done

**Google Search Console is set up.** It's the free tool that shows what people actually
typed into Google to find you, which pages they landed on, and warns you if something
breaks. It's set up as a *domain* property, so it covers the whole site — every page,
with or without the `www`.

It lives on Arts-Link's Google account (see §1), so **ask Ben when you want to see the
search numbers.** He can pull a report or walk you through it.

The one thing still worth doing, free and about twenty minutes: add the site to **Bing
Webmaster Tools** as well. Bing is a smaller slice of traffic, but it also feeds
ChatGPT's web results — so it's worth more than its search share suggests.

### The part that actually moves the needle

For a band, being found — including getting mentioned by ChatGPT, Perplexity, and
Google's AI answers — depends less on your website than on **saying the same thing about
yourselves everywhere else.** These tools build a picture of who you are by cross-checking
sources. Consistency across those sources is the whole game.

In rough order of payoff:

1. **Bandsintown and/or Songkick.** Highest value on this list. These feed Google's
   event listings, Spotify's concert tab, and most "when is X playing near me" answers.
   It does mean entering shows twice — once here, once on your site. Worth it.
2. **Spotify for Artists** — claim it, fill in the bio and photos.
3. **MusicBrainz**, and eventually **Wikidata**. Unglamorous, free, and disproportionately
   influential on what AI tools believe about you.
4. **The same bio and the same band photo everywhere.** Instagram, Spotify, Bandcamp,
   YouTube, press kits. Different bios in different places make you look like different
   entities.

### The accent problem

Your name is **Verdèzul**. Your domain is `whatisverdezul.com`, no accent. People will
search all of it — "Verdèzul", "Verdezul", even "verde zul".

So: **always write it with the accent** in your copy and in every profile — that's the
brand. But make sure the plain spelling appears somewhere too, so both searches find you.
Your YouTube handle already uses the plain spelling, which helps.

### One gotcha when sharing links

Facebook, LinkedIn and iMessage **cache your link preview image for weeks.** If Ben
updates a preview image, you'll still see the old one when you paste the link, and assume
it's broken. It isn't. Facebook's "Sharing Debugger" and LinkedIn's "Post Inspector"
force a refresh.

---

## 10. Privacy and the law

Your site now has a **privacy policy** at whatisverdezul.com/privacy, linked in the
footer. It explains in plain language what your site collects — website statistics,
contact form messages, mailing list signups — and how someone asks to be removed.

There's no cookie banner, deliberately. Your site sets no advertising or tracking
cookies, so there's nothing of the kind to consent to. If you ever start selling
directly to fans in Europe, tell Ben and revisit it.

**Email has its own rules**, and they're the ones with actual fines attached — an
unsubscribe link and a real mailing address on every send.
[email-list-and-newsletter.md](email-list-and-newsletter.md) covers it. Read it *before*
your first send, not after.

---

## 11. What this costs, and the one renewal that matters

| Item | Cost |
|---|---|
| Domain name | **~$24/year — the only bill in your name** |
| Hosting (Vercel) | Free tier — on Arts-Link's account |
| GitHub | Free, unlimited editors |
| PostHog | Free tier — on Arts-Link's account |
| Formspree | Paid — on Arts-Link's account |

So the site costs you about **$24 a year** today. Formspree is the only paid piece, and
it sits on Arts-Link's account (§1).

**Turn on auto-renew for the domain, and make sure the card on file is one that won't
expire.** A lapsed domain takes your entire site down — and worse, an expired music
domain can get bought out from under you within days. It is the single cheapest, highest-
consequence thing on this list. Check it once a year.

---

## 12. If something looks broken

| What you see | Usually means | What to do |
|---|---|---|
| Whole site is down | Domain expired, or a publishing problem | Check the domain first. Then email Ben |
| Your edit isn't showing | Give it 2 minutes. Still nothing? Something in the saved data stopped the site publishing | Email Ben with what you edited |
| Contact form mail stopped | Forwarding or account issue at Formspree | Email Ben — you can't fix this end |
| An image is broken | Wrong file, or upload didn't finish | Re-upload it through the editor |
| A video thumbnail is grey | Low-resolution YouTube upload | Add a Thumbnail image (§4) |

**One rule: don't try to fix it in GitHub.** If an edit broke something, the fastest path
back is telling Ben what you changed. Editing raw files to undo it is how a small problem
becomes a big one.

---

## 13. Support after handoff

Arts-Link works **hourly and on request** from here. No retainer, nothing running in the
background.

**Free — just tell Ben:**

- Anything Arts-Link built that stops working the way it was supposed to
- The site being down or unable to publish
- Undoing a content change that went wrong

**Billed hourly, quoted first:**

- New features, new pages, design changes
- Content entry — writing your copy or loading in your shows
- Anything involving a third party you've chosen to add

Rate: **$100/hour**, with a **30-minute minimum** — so the smallest job comes to $50.
Anything larger gets quoted before work starts, so you'll never be surprised by an
invoice.

Response: **within 2 business days.** Site down or forms not arriving: **same day.**

Contact: **ben@benstrawbridge.com**

---

## Bottom line

- **Publish is instant and public. There's no undo button.** Read it once, then publish.
- **Turn on domain auto-renew.** It's $24 and it's the thing that takes the site down.
- **The mailing list is quietly filling up.** Don't send to it until you've read the
  newsletter guide.
- **The biggest search win isn't on your website** — it's Bandsintown, Spotify for
  Artists, and the same bio everywhere.
- **You can't break the design.** Worst case, you publish a typo and Ben rolls it back.

Questions? Reach out to ben@benstrawbridge.com.
