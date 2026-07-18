---
description: Loading skeleton conventions for CMinds frontend apps
globs: apps/cminds-dashboard/**/*.{tsx,ts},apps/community-dashboard/**/*.{tsx,ts},apps/funding-dashboard/**/*.{tsx,ts},apps/public-viewer/**/*.{tsx,ts},packages/**/*.{tsx,ts}
alwaysApply: false
---

# Loading skeletons

When building or refactoring loading UI in CMinds frontend apps, prefer **layout-faithful skeletons** over generic spinners.

## Principles

- Mirror the **real loaded layout** (same sections, columns, card/table structure, aside panels).
- Use `@repo/ui` `Skeleton` — do not invent custom shimmer blocks unless the design system requires it.
- Put feature skeletons under `features/<feature>/components/skeletons/` (or colocated `*Skeleton.tsx` next to the view).
- Mark the root with `role="status"` and a short `aria-label` (e.g. `"Loading escrows"`, `"Loading milestone details"`).

## Page / route skeletons

- Prefer **one skeleton per distinct page shape** (escrow list, escrow detail, funding page, public transparency view) — do not reuse a mismatched skeleton.
- Wallet-connect / auth-wait screens should show the skeleton of the **destination page**, not a spinner-only state.
- Compose large page skeletons from smaller section skeletons (header, milestone list, funding aside) instead of one monolithic block.

## Lists and tables

- **Mobile / small viewports:** card-list skeleton (`md:hidden`) — e.g. escrow cards, milestone review cards.
- **`md+`:** table-row skeleton (`hidden md:block`) — e.g. CMinds milestone queue, funding history.
- Both must reflect the same data density as the real list (status badges, USDC amounts, wallet addresses, actions).

## Aside / stats

- Sidebar and KPI blocks (total funded, milestones released, escrow status) need their own skeleton matching label + value + icon layout.
- Do not leave asides empty or spinner-only while the main column has a skeleton.

## Anti-patterns

- ❌ Single centered spinner for a multi-section escrow detail page
- ❌ One generic list skeleton for every route
- ❌ Table-only skeleton on mobile for multi-column escrow/milestone tables
- ❌ Skeleton that does not match final spacing / section order
