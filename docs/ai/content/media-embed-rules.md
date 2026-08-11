---
name: media-embed-rules
description: Rules for embedding YouTube, Spotify, SoundCloud, and other media on the Verdèzul site
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [content, media, embeds, youtube, spotify, soundcloud]
  related: [engineering/architecture.md, engineering/seo-and-schema.md]
---

## Use this when

Adding a YouTube video, Spotify player, or any external media embed to any page.

---

## YouTube

Use the `youtube-embed` shortcode in content, or the `layouts/shortcodes/youtube-embed.html` partial directly in templates.

**Safe embed URL format:**
```
https://www.youtube-nocookie.com/embed/<VIDEO_ID>
```

Use `youtube-nocookie.com` to reduce tracking cookies and improve privacy compliance.

**Featured videos:**
- "Taxes Finnah Hit" — ID: `Op1oF2qy_ek`
- "I Tell Ya" — ID: `VcY5WYEnxH8`

**In Markdown content:**
```
{{< youtube-embed id="Op1oF2qy_ek" title="Taxes Finnah Hit" >}}
```

**PostHog tracking:** Fire `youtube_play_click` on the embed container click. Use Alpine.js `@click` on the wrapper div.

---

## Spotify

Use the Spotify embed player. The embed URL format:
```
https://open.spotify.com/embed/artist/1zf7vVM2XaoaTD3hXWR1If?utm_source=generator
```

For albums or tracks, swap `artist` for `album` or `track` and update the ID.

**PostHog tracking:** Fire `spotify_play_click` on the embed container.

---

## SoundCloud

The band pastes the **ordinary `soundcloud.com` link from the address bar** —
a track, playlist, or profile. Templates URL-encode it into the player host:

```
https://w.soundcloud.com/player/?url=<urlencoded soundcloud.com link>&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_teaser=false
```

`w.soundcloud.com` is the iframe host; `soundcloud.com` is only where the link
is copied from. That distinction is the whole CSP story below — get it wrong
and the player fails silently as a blank box.

Heights are fixed, not responsive: **450px** shows a scrolling track list (right
for a profile or playlist) and **166px** suits a single track. Both are exposed
in the CMS as `player_size: large | compact`.

**PostHog tracking:** Fire `soundcloud_play_click` on the embed container.

Ryder also ships a `soundcloud` shortcode for use in markdown content
(`themes/ryder/layouts/shortcodes/soundcloud.html`). It self-registers its host
with the CSP partial via `.Page.Store`, which only works from a shortcode — a
layout template cannot use that route, because `head/csp.html` renders before
the `main` block. Data-driven pages therefore declare the host in `hugo.toml`.

---

## Photo gallery

Ryder includes a `photo-gallery` layout and shortcode with lightbox support. **Nothing on this site uses it** — there is no Media page and no `images/gallery/` directory. It is noted here only as an available option if a photo section is ever added; the shortcode pulls from a directory or a list of image paths defined in frontmatter.

For the embed grid on `/music/streaming/`, see `layouts/music/streaming.html` and `data/streaming.json` — one ordered list mixing all three platforms, using the site's own `vzLightbox` component rather than Ryder's gallery.

---

## Embed sizing

All embeds should be responsive. Wrap in a container with `position: relative; padding-bottom: 56.25%` for 16:9 ratio (YouTube). Spotify embeds use a fixed height of `152px` (compact) or `352px` (standard player).

---

## CSP considerations

Ryder builds the policy in `themes/ryder/layouts/partials/head/csp.html`, but
the hosts this site actually allows are declared in `hugo.toml` under
`[params.csp]` — never by editing the theme file.

`frame-src` currently allows exactly:
- `https://www.youtube-nocookie.com`
- `https://open.spotify.com`
- `https://w.soundcloud.com`

Anything not on that list is blocked, and a blocked iframe renders as an empty
box with only a console warning — there is no visible error. Verify a new embed
host in the browser console, not by eye.

Ryder also offers `[params.csp] embeds = ["youtube", "vimeo", "soundcloud",
"spotify", "umap"]`, a preset-name shorthand that expands to the same hosts.
This site lists hosts verbatim in `frameSrc` instead; either works, and they are
deduped together, but keep to one style per site.

## Related knowledge

- [[architecture]] — shortcode locations, override rules
- [[analytics-events]] — PostHog events for media interactions
