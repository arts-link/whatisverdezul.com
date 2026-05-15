---
name: media-embed-rules
description: Rules for embedding YouTube, Spotify, and other media on the Verdèzul site
metadata:
  type: reference
  status: active
  updated: 2026-05-15
  tags: [content, media, embeds, youtube, spotify]
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

## Photo gallery

Ryder includes a `photo-gallery` layout and shortcode with lightbox support. Use it for the Media page photo section.

Gallery images go in `images/gallery/`. The shortcode pulls from a directory or a list of image paths defined in frontmatter.

---

## Embed sizing

All embeds should be responsive. Wrap in a container with `position: relative; padding-bottom: 56.25%` for 16:9 ratio (YouTube). Spotify embeds use a fixed height of `152px` (compact) or `352px` (standard player).

---

## CSP considerations

Ryder sets a Content Security Policy. Allowed embed sources are configured in `themes/ryder/layouts/partials/head/csp.html`. If a new embed domain causes CSP errors, add it there — but do so in a site-level override, not by editing the theme file directly.

Allowed embed domains already in Ryder:
- `www.youtube-nocookie.com`
- `open.spotify.com`
- `soundcloud.com` (not used but available)

## Related knowledge

- [[architecture]] — shortcode locations, override rules
- [[analytics-events]] — PostHog events for media interactions
