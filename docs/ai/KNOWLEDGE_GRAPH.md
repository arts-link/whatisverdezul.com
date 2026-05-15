---
name: knowledge-graph
description: Dependency chains showing how docs relate — use to find upstream context when something needs deeper explanation
metadata:
  type: index
  status: active
  updated: 2026-05-15
  tags: [index, dependencies, graph]
  related: [AI_INDEX.md, AGENT_START.md]
---

## Use this when

A concept in one doc points to another and you need to understand the full chain of dependencies before making a decision.

---

## Core chain

```
AGENT_START
  └── band-context          ← single source of truth for who Verdèzul is
        ├── visual-direction ← how the identity translates to design
        └── site-goals       ← what the site is optimizing for
              └── analytics-events ← how goals map to tracking
```

## Engineering chain

```
architecture               ← stack, file structure, override rules
  ├── content-model        ← data shapes that templates consume
  │     └── cms-config     ← how Decap CMS maps to those shapes
  ├── routes-and-menus     ← URL structure, Hugo menu config
  ├── seo-and-schema       ← meta tags, JSON-LD, GEO
  └── build-commands       ← how to compile and deploy
```

## Content work chain

```
writing-guide              ← voice and copy rules
  └── band-context         ← identity context that informs the voice

media-embed-rules          ← YouTube, Spotify, gallery
  └── analytics-events     ← tracking events for embeds
```

## Publishing chain

```
page-publish-checklist     ← gate before a new page is done
  ├── writing-guide        ← copy check
  ├── seo-and-schema       ← meta and schema check
  ├── analytics-events     ← tracking check
  └── coding-agent-checklist ← engineering check
```

## CMS / data chain

```
cms-config                 ← Decap CMS field definitions
  └── content-model        ← the data shapes those fields write to
        └── architecture   ← where the files live, how templates access them
```

---

## Key invariants

These rules appear across multiple docs. If they ever conflict with each other, the doc listed first wins.

1. **Name rule** (band-context → all docs): Always "Verdèzul" with accent, never hyphenated
2. **Override rule** (architecture → coding-agent-checklist): Never edit `themes/ryder/`, always override in `layouts/`
3. **Press conditional** (content-model → routes-and-menus → coding-agent-checklist): Press nav/page hidden when `data/press.json` is empty
4. **No hardcoded secrets** (build-commands → coding-agent-checklist): All env vars via `process.env` / Vercel env
