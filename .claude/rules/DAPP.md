---
description: CMinds frontend monorepo — apps, roles, and shared conventions
alwaysApply: true
---

# Global Development Context (CMinds Monorepo)

You are acting as a **Senior Fullstack Developer** on the **Coastal Communities Escrow Pilot** — a **pnpm + Turborepo** monorepo for CMinds × Trustless Work.

Product context: `docs/CMINDS_CONTEXT.md`

---

## Monorepo layout

### Frontend apps (Next.js 16)

| Package | Path | Dev port | Primary actor | Responsibility |
| --- | --- | --- | --- | --- |
| `cminds-dashboard` | `apps/cminds-dashboard` | 3001 | CMinds operator | Review evidence, approve/dispute milestones, admin pause/cancel |
| `community-dashboard` | `apps/community-dashboard` | 3002 | Community Implementer / Release Signer | Create escrows, select tasks, submit evidence, release funds |
| `funding-dashboard` | `apps/funding-dashboard` | 3003 | Funder / Depositor | View escrow detail, fund with USDC, copy escrow address |
| `public-viewer` | `apps/public-viewer` | 3004 | Observer / public | Transparency page — status, milestones, funding, evidence links |
| `admin` | `apps/admin` | 3005 | Platform admin | Administration console (scaffold) |

### Backend

| Package | Path | Dev port | Stack |
| --- | --- | --- | --- |
| `core-api` | `apps/core-api` | 3000 | NestJS API (Prisma + Supabase PostgreSQL) |

### Shared packages

| Package | Path | Purpose |
| --- | --- | --- |
| `@repo/ui` | `packages/ui` | Design system, shadcn / Magic UI components |
| `@repo/eslint-config` | `packages/eslint-config` | Shared ESLint |
| `@repo/typescript-config` | `packages/typescript-config` | Shared TypeScript configs |

Run from repo root: `pnpm dev`, `pnpm dev:api`, `pnpm dev:cminds`, `pnpm dev:community`, `pnpm dev:funding`, `pnpm dev:public`, `pnpm dev:admin`.

---

## Domain vocabulary (use consistently)

| Term | Meaning |
| --- | --- |
| **Escrow** | On-chain Trustless Work contract funding coastal conservation tasks |
| **Milestone** | A task from the fixed menu with an assigned USDC amount |
| **Task menu** | Predefined catalog of conservation tasks (code, category, deliverable) |
| **Evidence** | Links (photos, reports, etc.) submitted for milestone review |
| **Initializer** | Community user who creates the escrow (`community-dashboard`) |
| **Approver** | CMinds reviewer (`cminds-dashboard`) |
| **Release signer** | Community leader who signs release txs |
| **Funder** | Any wallet depositing USDC (`funding-dashboard`) |
| **Observer** | Public reader (`public-viewer`) |

Wallet: **Freighter** on **Stellar**. Asset: **USDC**. Infrastructure: **Trustless Work** escrow SDK.

---

## General principles

- **Strict TypeScript** (`strict: true`)
- **No usage of `any`**
- Everything must be **explicitly typed** (models, payloads, responses, hooks, state)
- **Never leave unused variables, imports, or functions**
- Always apply **Prettier formatting**
- Respect all **ESLint rules** from `@repo/eslint-config`
- **Strictly follow existing code patterns**
- Minimalist UI aligned with the design system
- Do not use unnecessary comments

---

## Architecture & componentization

- Highly **componentized** — small, focused, reusable components
- **UI components**: rendering only, minimal interaction logic
- **Complex logic** (state + effects): custom **hooks** in `src/features/<domain>/hooks/`
- Before creating a component, hook, or type → **search the repo** and reuse when possible
- Organize app code by domain under `src/features/` (see `FOLDER_LAYOUT.mdc`)

---

## Cross-app reusability

- Used by **two or more apps** → `packages/` (`@repo/ui`, future `@repo/contracts`, etc.)
- **shadcn / Magic UI / Aceternity** components → always in `packages/ui`
- App-specific logic stays inside its app (`apps/<app-name>/`)
- Applies to: components, hooks, types, utils, models, Stellar/Trustless Work helpers

---

## Components & functions

- **UI components**: arrow functions + named exports
  ```ts
  export const EscrowCard = () => {};
  ```
- **Non-UI helpers**: `function` keyword + named exports
  ```ts
  export function shortenStellarAddress(address: string) {}
  ```
- Prefer **shadcn UI** from `@repo/ui` — do not reinvent primitives

---

## Data fetching & rendering

- **TanStack Query** for client data fetching and mutations
- **Trustless Work SDK** + wallet hooks for on-chain reads/writes
- **`core-api`** for off-chain persistence (escrow metadata, evidence URLs, audit)
- Choose SSR vs CSR based on SEO (especially `public-viewer`), performance, and UX
- Avoid over-fetching and unnecessary re-renders

---

## Forms

Follow the layered form pattern in `FORMS.mdc`:

```
features/<domain>/
  ├── schemas/
  ├── hooks/
  ├── components/
  └── services/
```

Libraries: `react-hook-form`, `zod`, `@hookform/resolvers/zod`, form primitives from `@repo/ui`.

---

## UI / UX standards

- **100% responsive** — all Tailwind breakpoints
- **Light mode only** — see `docs/DESIGN_SYSTEM.md`; no theme toggle or dark product path
- Clean, minimal, consistent with the design system (airy, soft radii, photography-led)

### Responsive data tables (lists)

For escrow lists, milestone queues, funding history, or similar multi-column data:

- **Mobile** (`default`–`md`): **card list** using `@repo/ui` `Card` — primary field in header, secondary fields in a 2-column label grid (same pattern as **community escrow list** and **CMinds milestone review queue**).
- **Tablet/desktop** (`md+`): **table** with `overflow-x-auto` when needed.
- Two sibling blocks from the **same data**: cards `md:hidden`, table `hidden md:block`.
- **Loading**: card skeletons on mobile, table skeleton on `md+`.
- **DRY**: shared cell content (status badge, actions) between table row and card.
- Never ship a wide table as the only mobile layout.

---

## Senior engineering mindset

Prioritize scalability, maintainability, reusability, and readability. Prefer clear code over clever code. Keep the four frontends and `core-api` consistent with shared packages and domain vocabulary above.
