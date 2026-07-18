---
description: Always read and follow docs/DESIGN_SYSTEM.md for all UI — light mode, Adventura-style premium layout
alwaysApply: true
---

# Design System — always follow

**Before any UI, styling, layout, or visual change**, read and obey:

➡️ **`docs/DESIGN_SYSTEM.md`**

That file is the single source of truth for all frontends (`cminds-dashboard`, `community-dashboard`, `funding-dashboard`, `public-viewer`) and shared UI packages.

## Agent behavior (mandatory)

1. **Read** `docs/DESIGN_SYSTEM.md` before implementing or changing UI.
2. **Match** the Adventura-style structure when building marketing/list surfaces: Navbar → Hero (image + overlay + headline) → Floating filter/action card → Content sections → Image cards.
3. **Do not** invent competing aesthetics (dark mode, strong brand hues, heavy shadows, hard corners, purple gradients).
4. If a request conflicts with the design system, **prefer the design system** and say so briefly.

## Hard rules (summary)

| Rule | Value |
| --- | --- |
| Theme | **Light mode only** — no toggle, no system theme, no product `dark:` path |
| Chrome palette | `#FFFFFF` · `#F8F8F8` · `#F3F3F3` · `#111111` · `#666666` · `#B3B3B3` · `#ECECEC` |
| Accent / CTA | `#000000` (black pills only) |
| Radius | `8` · `12` · `16` · `24` · `32` · `9999` |
| Spacing | `4` · `8` · `12` · `16` · `24` · `32` · `48` · `64` · `80` · `96` |
| Imagery | Photography leads; UI only organizes |
| Elevation | Soft float `0 10px 30px rgba(0,0,0,.05)` max |
| Type weights | `400` · `500` · `600` · `700` only |

## Canonical page pattern

```
Page
├── Navbar (Logo | Nav | Actions) — independent, above hero
├── Hero (relative)
│   ├── Background image
│   ├── Overlay
│   ├── Giant headline (separate layer, not baked into image)
│   └── Floating filter / action card (absolute, bottom overhang)
└── Section(s)
    ├── Header (Title | secondary link)
    └── Grid of Image Cards (Thumbnail → Title → Metadata)
```

Tokens: `packages/ui/src/styles/globals.css`.  
Shared chrome: `@repo/shared` Navbar — no ModeToggle.
