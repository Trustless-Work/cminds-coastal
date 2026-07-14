# CMinds Design System

> Source of truth for visual language across **all** frontend apps: `cminds-dashboard`, `community-dashboard`, `funding-dashboard`, `public-viewer`, and shared packages (`@repo/ui`, `@repo/shared`, `@repo/features`, `@repo/tw-blocks`).

**Theme: light mode only.** Do not add a dark theme, system preference sync, or theme toggle.

---

## 1. Personality

This system conveys:

| Trait | Meaning in product UI |
| --- | --- |
| **Premium** | Disciplined proportions, no visual noise |
| **Minimalist** | Few colors, few weights, few radii |
| **Editorial** | Clear hierarchy; typography leads when photography is absent |
| **Airy** | Generous negative space; nothing feels cramped |
| **Highly visual** | Imagery (escrow covers, evidence, landscapes) carries personality |
| **Low noise** | No competing accents, heavy shadows, or decorative chrome |

Inspired by the discipline of **Apple**, **Airbnb**, **Linear**, **Framer**, **Notion** (spacing), and **Stripe** (hierarchy) — adapted for CMinds coastal escrow dashboards.

### Core rule

> The UI never competes with the imagery.  
> Photography (or high-quality visual content) is the protagonist.  
> The interface only organizes content.

When a screen has no image, whitespace + typography create the same calm hierarchy.

---

## 2. Principles

### 2.1 Generous negative space

Whitespace is a first-class design element. Elements are never flush against each other.

**Vertical rhythm (reference — landing / marketing surfaces):**

```
Navbar
  ↓  48–64px
Hero / primary banner
  ↓  48px
Primary interaction (e.g. search / CTA strip)
  ↓  72px
Section (e.g. trending / escrow list)
```

**App shells (dashboards):** keep the same breathing room — section gaps `48–72px`, card grids `24–32px`, form stacks `16–24px`.

### 2.2 Very few colors

Personality comes from imagery and typography, not brand-colored chrome.

Approximate palette only:

| Role | Color |
| --- | --- |
| Background | White |
| Text | Black |
| Secondary text | Gray |
| Borders | Very light gray |
| Photography | Full color (the voice of the product) |

### 2.3 Soft corners everywhere

No hard corners. Large, repeated radii make the product feel friendly and premium.

### 2.4 Light mode only

- Fixed light theme across all apps
- No `ModeToggle`, no system theme, no `.dark` product path
- Prefer deleting dark-mode branches over maintaining unused alternate tokens

---

## 3. Color system

### 3.1 Background

| Token | Hex | Usage |
| --- | --- | --- |
| `--background` / Primary | `#FFFFFF` | Page canvas |
| `--background-secondary` | `#F8F8F8` | Subtle section wash, table headers |
| `--background-tertiary` | `#F3F3F3` | Hover fills, skeleton base, muted chips |

### 3.2 Text

| Token | Hex | Usage |
| --- | --- | --- |
| `--foreground` / Primary | `#111111` | Headings, primary labels, body |
| `--muted-foreground` / Secondary | `#666666` | Metadata, captions, helper text |
| `--text-disabled` | `#B3B3B3` | Disabled labels and placeholders |

### 3.3 Border

| Token | Hex | Usage |
| --- | --- | --- |
| `--border` | `#ECECEC` or `#E8E8E8` | Dividers, card outlines, inputs |

Extremely subtle. Borders structure layout; they do not shout.

### 3.4 Accent

| Token | Hex | Usage |
| --- | --- | --- |
| `--primary` / Accent | `#000000` | Primary CTA, icon buttons (search), Sign up–style actions |
| `--primary-foreground` | `#FFFFFF` | Text on accent |

**Never** introduce a strong brand hue (purple, teal gradients, etc.) for chrome. Semantic colors (success / warning / destructive) may exist for status only — keep them quiet and never dominant on marketing or list heroes.

### 3.5 Status (product — use sparingly)

Map escrow / milestone statuses with muted fills + clear labels. Prefer text + small badges over saturated banners.

| Intent | Approach |
| --- | --- |
| Success / Approved / Released | Soft green tint or neutral + green caption |
| Warning / Ready for review | Soft amber tint |
| Danger / Disputed / Cancelled | Soft red tint (`destructive`) |
| Neutral / Pending | Gray caption |

---

## 4. Border radius

Consistent scale. Prefer these values only:

| Token | px | Usage |
| --- | --- | --- |
| `--radius-xs` | `8` | Compact inputs |
| `--radius-sm` | `12` | Badges |
| `--radius-md` | `16` | Cards, image thumbs |
| `--radius-lg` | `24` | Large cards, featured blocks |
| `--radius-xl` | `32` | Hero containers, large media frames |
| `--radius-full` | `9999` | Buttons, pills, search bar |

**CSS aliases (implementation):**

```css
--radius-xs: 8px;
--radius-sm: 12px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-xl: 32px;
--radius-full: 9999px;
```

---

## 5. Spacing

8pt-based scale. Only use:

```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 96
```

Never invent one-off values (`13px`, `22px`, `37px`).

| Context | Typical gap |
| --- | --- |
| Icon → label | `8–12` |
| Label → value | `4` |
| Card image → title | `12–16` |
| Title → metadata | `4–8` |
| Section → section | `48–72` |
| Page horizontal padding | `40` (desktop), `16–24` (mobile) |

---

## 6. Grid & layout

| Property | Value |
| --- | --- |
| Columns (desktop) | 12 |
| Max container | `1280–1320px` (`max-w-7xl` ≈ 1280) |
| Horizontal padding | `40px` desktop · `16–24px` mobile |
| Navbar height | `80–96px` |
| Hero / media banner | ~`600px` height (marketing); dashboards may use shorter heroes (`320–480`) |
| Search / action strip | ~`100px` |
| Image cards (reference) | ~`380 × 320` visual weight |

### Layout components (conceptual)

- **Page container** — centered, max-width, horizontal padding
- **Section** — vertical rhythm `48–72`
- **Stack** — vertical spacing from the scale
- **Inline** — horizontal spacing from the scale
- **Grid** — card grids with `gap-6` / `gap-8` (`24` / `32`)

---

## 7. Typography

### 7.1 Family

Single sans family across the product. Preferred options (pick one and keep it everywhere):

1. **Inter**
2. **SF Pro** (system on Apple)
3. **General Sans**

Implementation today may use the monorepo font (e.g. Geist) until swapped — but hierarchy, sizes, and weights below are mandatory.

### 7.2 Scale

| Role | Size (px) | Weight | Usage |
| --- | --- | --- | --- |
| Display / Hero | `72–96` | Bold `700` | Marketing hero overlay only |
| H1 | `56` | Bold `700` | Page titles (rare, marketing) |
| H2 | `48` | Bold `700` | Section titles (“Trending”, major lists) |
| H3 | `30` | SemiBold `600` | Card titles, escrow names |
| Body Large | `18` | Regular `400` | Lead paragraphs |
| Body | `16` | Regular `400` | Default UI copy |
| Caption | `14` | Regular `400` | Metadata, gray secondary |

Dashboard density may step one level down (e.g. section `H2` at `32–40` where space is tight) **without** inventing new weights.

### 7.3 Weights allowed

| Weight | Value |
| --- | --- |
| Regular | `400` |
| Medium | `500` |
| SemiBold | `600` |
| Bold | `700` |

**Never** use Black (`900`) or Ultra.

### 7.4 Hero overlay type

- Very large, white, bold
- Slightly positive letter-spacing
- Centered over photography
- Does not fight UI chrome (search / CTA sits below or floating at the media edge)

---

## 8. Elevation & shadows

Very little elevation. Prefer borders + space over depth.

| Token | Value | Usage |
| --- | --- | --- |
| Soft float | `0 10px 30px rgba(0, 0, 0, 0.05)` | Floating search bar, light popovers |
| Card hover (optional) | Soft shadow-md equivalent | On hover only |

No multi-layer dramatic shadows. No glow effects.

---

## 9. Layout — canonical page pattern

Reusable Adventura-style structure for marketing / list surfaces (e.g. **Funding dashboard**):

```
Page
├── Navbar (Logo | Nav links | Actions) — independent section above the hero
├── Hero (relative)
│   ├── Background image (container, radius 32)
│   ├── Overlay (optional darken)
│   ├── Giant headline (separate layer — never baked into the image)
│   └── Floating filter / action card (absolute, bottom overhang ~50%)
└── Section(s)
    ├── Header (Title | secondary link e.g. See more)
    └── Grid of Image Cards (Thumbnail → Title → Metadata)
```

**Rules:**
- Navbar is **not** overlaid on the hero image.
- Headline is an independent DOM node above the photo.
- Floating card sits between hero and content (`bottom` overhang).
- After the floating card: large margin, then content sections.
- Cards: image on top (radius 16), title + gray metadata below — no heavy chrome.

Reference implementation: `apps/funding-dashboard` (`FundingHero`, `FundingFilterCard`, `EscrowImageCard`).

---

## 10. Iconography

| Rule | Value |
| --- | --- |
| Library | **Lucide** (current monorepo standard) |
| Stroke | `2px` |
| Color | Black / `#111111` (or muted gray for secondary) |
| Style | Simple outline glyphs |

Icon buttons for primary actions (e.g. search): **circular**, black fill, white icon, diameter ~`56–72px` depending on context.

---

## 10. Motion

Subtle, premium, purposeful.

| Interaction | Behavior |
| --- | --- |
| Card hover | `translateY(-4px)` · optional `scale(1.02)` · `250ms` · `ease-out` |
| Button hover | Slight brightness / opacity · `scale(1.02)` |
| Press | Minimal (opacity / `translateY(1px)`) |
| Page | Optional staggered reveal on card grids |

Avoid bounce, springy overshoot, or long decorative animations.

---

## 11. Components

### 11.1 Navbar

- Height `80–88px` (up to `96` with brand lockups)
- Structure: **Logo / title** → **links** (optional) → **auth / actions**
- Lots of space between clusters
- No theme toggle
- Light background (`#FFFFFF`), optional subtle bottom border (`#ECECEC`) or blur only if it stays quiet

### 11.2 Buttons

**Primary**

- Background `#000000`, text `#FFFFFF`
- Radius full (`9999`)
- Padding ~`16 × 28`
- No shadow

**Secondary / Ghost**

- Text only or quiet outline
- No heavy fills

**Icon**

- Circular, often accent black
- Search-style diameter ~`72px` on marketing surfaces; smaller (`40–48`) in dense dashboards

### 11.3 Cards (Image Card)

```
Card
 └── Image (radius 16)
 └── Title (H3 / SemiBold)
 └── Metadata (Caption · Secondary gray)
```

Rules:

- No strong shadows by default
- Optional 1px border `#ECECEC`
- No giant badges, no footer button rows unless the card **is** the action
- Image ≈ majority of visual weight

### 11.4 Hero / Media Banner

Most important marketing / landing component:

1. Full-bleed-in-container image (`radius` `32`)
2. Large white overlay text
3. Optional floating search / CTA strip overlapping the bottom edge

Photography should carry ~**70%** of visual weight on such pages.

### 11.5 Search / selector strip (pattern)

White container · radius full · padding ~`24` · soft shadow.

Internal field pattern (not a classic outlined input):

```
Icon
 └─ Label (bold / medium)
 └─ Value (secondary gray)
```

Fields separated by `1px` light gray dividers. Primary action = black circular icon button.

Reuse this pattern for any “composed filter” UI (not only travel search).

### 11.6 Inputs (forms)

Still support classic forms for escrow create / auth, but keep radius soft (`8–12`), borders subtle, and labels calm. Prefer the icon → label → value selector look when the control is a picker.

### 11.7 Divider

`1px` · `#ECECEC` · never thick or colored.

### 11.8 Badge / Chip

Radius `12` · compact · muted fills. Prefer small status chips over large colored pills.

### 11.9 Modal / Drawer / Tooltip / Tabs / Pagination / Skeleton / Empty state

- Same colors, radii, and spacing
- Skeletons use tertiary background (`#F3F3F3`)
- Empty states: short copy + secondary text + optional quiet primary CTA — no illustrations that add noise unless photography-led

---

## 12. Images

| Rule | Detail |
| --- | --- |
| Quality | High resolution |
| Role | Carry product personality (~70% visual weight on visual-led surfaces) |
| Framing | Soft radius (`16` cards · `32` heroes) |
| Subject | Landscapes, coastal / field context when available; escrow cover images preferred |
| Contrast | Enough contrast for white overlay type when used |

Never crop imagery into tiny decorative thumbnails that fight the layout.

---

## 13. Responsive behavior

- **Mobile:** preserve air — reduce type one step, keep radius scale, stack search fields vertically if needed
- **Lists / tables:** follow monorepo rule — card list on mobile, table from `md+` (`DAPP.mdc`)
- **Never** let dense tables be the only mobile layout

---

## 14. What *not* to do

| Avoid | Why |
| --- | --- |
| Dark mode / theme toggle | Product is light-only |
| Strong brand accent colors on chrome | Competes with imagery |
| Hard corners | Breaks the soft premium feel |
| Heavy multi-layer shadows | Adds noise |
| Purple gradients, glow, glassmorphism | Generic AI look |
| Black (`900`) font weight | Too heavy for this system |
| Odd spacing values | Breaks rhythm |
| Crowded first viewports on marketing pages | Violates negative-space principle |
| Cards everywhere | Cards only when they hold interaction or a clear content unit |

---

## 15. CSS tokens (implementation map)

Map design tokens → `packages/ui/src/styles/globals.css` (and Tailwind `@theme`).

```css
:root {
  /* Background */
  --background: #ffffff;
  --background-secondary: #f8f8f8;
  --background-tertiary: #f3f3f3;

  /* Text */
  --foreground: #111111;
  --muted-foreground: #666666;
  --text-disabled: #b3b3b3;

  /* Border */
  --border: #ececec;

  /* Accent */
  --primary: #000000;
  --primary-foreground: #ffffff;

  /* Radius */
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.05);
}
```

Semantic shadcn roles (`card`, `muted`, `accent`, `ring`, `destructive`, sidebar, charts) should derive from this light palette — not from a parallel dark theme.

---

## 16. Suggested component library surface (`@repo/ui`)

### Foundations

- Color tokens · Typography scale · Spacing scale · Radius scale · Shadows · Grid · Breakpoints · Motion tokens · Icon sizing

### Core

Button (Primary, Secondary, Ghost, Icon) · Navbar · Container · Section · Card · Image Card · Hero Banner · Search Bar / Search Field · Input · Select · Date Picker · Avatar · Badge · Divider · Chip · Tooltip · Modal · Drawer · Tabs · Pagination · Skeleton · Empty State

### Layout

App Shell · Page Container · Grid · Stack · Inline · Spacer · (optional) Carousel · Feature Section · Gallery

### Motion

Hover / press / loading · staggered card animations · optional scroll reveal

---

## 17. App application guide

| App | How the system shows up |
| --- | --- |
| `community-dashboard` | Airy forms, image-led escrow cards, soft heroes on create/list |
| `cminds-dashboard` | Review queues as calm cards/tables; photography when escrow has cover image |
| `funding-dashboard` | Clear hierarchy: escrow media → amount → fund CTA (black pill) |
| `public-viewer` | Most “editorial”: transparency narrative led by imagery and large type |

Shared chrome (`@repo/shared` Navbar, `@repo/providers`) must stay light-only and free of theme controls.

---

## 18. Checklist for new UI

- [ ] Light mode only (no dark classes product path)
- [ ] Spacing from the `4…96` scale
- [ ] Radius from `8 / 12 / 16 / 24 / 32 / full`
- [ ] Colors limited to white / black / grays (+ quiet semantic status)
- [ ] Imagery prioritized when available
- [ ] Primary CTA is black pill, not a colored brand button
- [ ] No theme toggle
- [ ] Hierarchy readable with type alone (size + weight + gray)
- [ ] Soft shadow only for floating controls
- [ ] Mobile: cards for dense data; desktop: tables OK

---

## 19. Why this feels premium

Consistency of proportions — one type family, few weights, 8px spacing, repeated large radii (`16` / `24` / `32`), white–black–gray only, soft elevation, photography as hero — matters more than any single effect. The hierarchy is always clear: dominant media (when present), one primary interaction, then quiet supporting cards. That discipline is the product’s polish.

---

## Related docs

- Product requirements: [`docs/CMINDS_CONTEXT.md`](./CMINDS_CONTEXT.md)
- Monorepo UI conventions: `.cursor/rules/DAPP.mdc`
- Form layering: `.cursor/rules/FORMS.mdc`
