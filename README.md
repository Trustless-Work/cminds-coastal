# CMinds Monorepo

Turborepo + pnpm monorepo for the Coastal Communities Escrow Pilot.

## Apps

| App | Package | Dev port | Description |
| --- | --- | --- | --- |
| CMinds Dashboard | `cminds-dashboard` | 3000 | Review and approve milestones |
| Community Dashboard | `community-dashboard` | 3001 | Create escrows and submit evidence |
| Funding Dashboard | `funding-dashboard` | 3002 | Fund escrows with USDC |
| Public Viewer | `public-viewer` | 3003 | Public transparency page |

## Packages

| Package | Description |
| --- | --- |
| `@repo/ui` | Shared React components |
| `@repo/eslint-config` | Shared ESLint configuration |
| `@repo/typescript-config` | Shared TypeScript configuration |

## Prerequisites

- Node.js >= 18
- pnpm 9 (`corepack enable` recommended)

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

## Workspace structure

```
cminds/
├── apps/
│   ├── cminds-dashboard/
│   ├── community-dashboard/
│   ├── funding-dashboard/
│   └── public-viewer/
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
├── pnpm-workspace.yaml   # workspace + version catalog
├── turbo.json
└── package.json
```

Dependency versions are centralized in the `catalog` section of `pnpm-workspace.yaml`. Workspace packages are linked with `workspace:*`.

## Documentation

See [docs/CMINDS_CONTEXT.md](./docs/CMINDS_CONTEXT.md) for product requirements and architecture context.
