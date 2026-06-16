---
name: ai-index
description: Task-based routing table — find which docs to read for any task on this project
metadata:
  type: index
  status: active
  updated: 2026-06-05
  tags: [index, routing, navigation]
  related: [AGENT_START.md, KNOWLEDGE_GRAPH.md]
---

## Use this when

You know the task but aren't sure which docs apply. Use this as a routing table to find the right starting point.

---

## Task routing

### Starting any task
→ [[AGENT_START]] (always read this first)
→ [[band-context]] (name spelling, links, identity)

### Writing or editing content (bio, CTAs, meta descriptions)
→ [[writing-guide]]
→ [[band-context]]

### Adding or editing a page layout
→ [[architecture]] (override rules, file locations)
→ [[routes-and-menus]] (URL structure, menu config)
→ [[page-publish-checklist]] (gate before done)

### Working with data files (shows, merch, releases, press)
→ [[content-model]] (data shapes, field definitions)
→ [[cms-config]] (CMS collection mappings)

### CMS changes (Decap CMS collections, fields, auth)
→ [[cms-config]]
→ [[content-model]]

### Adding media embeds (YouTube, Spotify, gallery)
→ [[media-embed-rules]]
→ [[analytics-events]] (tracking events for embeds)

### SEO, schema, or OG tags
→ [[seo-and-schema]]

### Analytics or PostHog event tracking
→ [[analytics-events]]
→ [[site-goals]] (why we track what we track)

### Build, deploy, or environment variables
→ [[build-commands]]

### Design decisions (layout, color, imagery)
→ [[visual-direction]]
→ [[band-context]] (color palette)

### Finishing any coding task
→ [[coding-agent-checklist]]

### Publishing a new page
→ [[page-publish-checklist]]

---

## All docs

### Root
- [[AGENT_START]] — minimum context to start any task
- [[KNOWLEDGE_GRAPH]] — dependency chains between docs

### Strategy
- [[band-context]] — name, links, colors, SOW summary
- [[site-goals]] — priority order, success metrics
- [[visual-direction]] — aesthetic rules, references, do/don't

### Engineering
- [[architecture]] — stack, file structure, override rules
- [[content-model]] — data file shapes, frontmatter schemas
- [[cms-config]] — Decap CMS collections and auth
- [[routes-and-menus]] — URL structure, Hugo menu config
- [[seo-and-schema]] — OG, JSON-LD, GEO/LLMsTxt
- [[analytics-events]] — PostHog event definitions
- [[build-commands]] — npm, Hugo, Vercel commands

### Content
- [[writing-guide]] — voice, tone, copy rules
- [[media-embed-rules]] — YouTube, Spotify, gallery embeds

### Checklists
- [[page-publish-checklist]] — gate before publishing a page
- [[coding-agent-checklist]] — engineering finish gate

### Plans
- [[2026-05-15-initial-site-plan]] — original implementation plan
