# CMinds Monorepo

**Coastal Communities Escrow Pilot** — a role-based funding platform for community-led coastal conservation, built by [CMinds](https://cminds.org) and [Trustless Work](https://trustless.work).

## Overview

This repository contains the full-stack application for the CMinds × Trustless Work pilot: a lightweight escrow workflow where coastal communities request funding for predefined conservation tasks, funders deposit USDC on Stellar, CMinds reviews milestone evidence, and approved funds are released progressively to the community.

The pilot validates a transparent, auditable funding path — communities participate directly in the workflow while CMinds retains review, approval, and dispute-resolution authority. It is **not** a full grant management platform in v1; the goal is a demonstrable end-to-end flow that can be shown to coastal communities.

### How it works

```
Community creates escrow → Funders deposit USDC → Community submits evidence
        → CMinds approves milestone → Release signer releases funds → Public transparency
```

| Step | Actor | App |
| --- | --- | --- |
| Create escrow, select tasks, set milestone amounts | Community Implementer | `community-dashboard` |
| Review evidence, approve or dispute milestones | CMinds operator | `cminds-dashboard` |
| Fund escrow with USDC (direct or copy address) | Funder | `funding-dashboard` |
| View progress, funding, and evidence links | Observer / public | `public-viewer` |
| Off-chain metadata, evidence URLs, audit logs | Backend API | `core-api` |

### Tech stack

| Layer | Technology |
| --- | --- |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| Backend | NestJS, Prisma, Supabase PostgreSQL |
| Blockchain | Stellar, USDC, Freighter wallet, Trustless Work escrow SDK |
| Shared UI | `@repo/ui` (shadcn / design system) |

### Repository layout

```
cminds/
├── apps/
│   ├── cminds-dashboard/      # CMinds review & admin (port 3000)
│   ├── community-dashboard/   # Community escrow & evidence (port 3001)
│   ├── funding-dashboard/     # Escrow funding detail (port 3002)
│   ├── public-viewer/         # Public transparency page (port 3003)
│   └── core-api/              # NestJS API
├── packages/
│   ├── ui/                    # @repo/ui — shared components
│   ├── eslint-config/         # @repo/eslint-config
│   └── typescript-config/     # @repo/typescript-config
├── docs/
│   └── CMINDS_CONTEXT.md      # Product requirements & flows
├── pnpm-workspace.yaml        # workspaces + version catalog
└── turbo.json
```

---

## Apps

| App | Package | Dev port | Description |
| --- | --- | --- | --- |
| CMinds Dashboard | `cminds-dashboard` | 3000 | Review and approve milestones |
| Community Dashboard | `community-dashboard` | 3001 | Create escrows and submit evidence |
| Funding Dashboard | `funding-dashboard` | 3002 | Fund escrows with USDC |
| Public Viewer | `public-viewer` | 3003 | Public transparency page |
| Core API | `core-api` | — | NestJS backend for off-chain data |

## Packages

| Package | Description |
| --- | --- |
| `@repo/ui` | Shared React components |
| `@repo/eslint-config` | Shared ESLint configuration |
| `@repo/typescript-config` | Shared TypeScript configuration |

## Prerequisites

- Node.js >= 18
- pnpm 9.15+ (`corepack enable && corepack prepare pnpm@9.15.9 --activate`)

## Setup

```sh
pnpm install
```

## Development

Run all apps in parallel:

```sh
pnpm dev
```

Run a single app:

```sh
pnpm dev:cminds
pnpm dev:community
pnpm dev:funding
pnpm dev:public
```

Or with a Turbo filter:

```sh
pnpm exec turbo dev --filter=community-dashboard
```

## Other commands

```sh
pnpm build          # Build all apps and packages
pnpm lint           # Lint all workspaces
pnpm check-types    # Type-check all workspaces
pnpm format         # Format with Prettier
```

Dependency versions are centralized in the `catalog` section of `pnpm-workspace.yaml`. Workspace packages are linked with `workspace:*`.

## CI

GitHub Actions runs on pushes and PRs to `develop`, `staging-qa`, and `main`:

- **Lint** — all workspaces
- **Typecheck** — frontend apps + `@repo/ui`
- **Build** — all apps including `core-api`
- **Test** — `core-api` unit tests

## Documentation

- [docs/CMINDS_CONTEXT.md](./docs/CMINDS_CONTEXT.md) — product requirements, user roles, escrow flows, and v1 scope
- [.cursor/rules/](./.cursor/rules/) — development conventions for AI-assisted coding
