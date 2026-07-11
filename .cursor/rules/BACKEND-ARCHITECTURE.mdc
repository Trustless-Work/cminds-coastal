---
description: Core API architecture and project structure for CMinds escrow pilot
globs: apps/core-api/**
alwaysApply: false
---

# Core API Architecture — CMinds Escrow Pilot

## Architecture Overview

NestJS + Prisma + **Pollar Auth** (Google social login / social wallet), organized by **feature modules** with global guards. Supabase is used as **PostgreSQL** only — not as the auth provider.

```
Request → Helmet / CORS → ThrottlerGuard → PollarAuthGuard → RolesGuard → Controller → Service → Prisma → PostgreSQL
```

On-chain state (escrow contract, milestones, releases) is managed via **Trustless Work** on Stellar; `core-api` persists metadata, evidence URLs, audit logs, and indexes for the four frontends.

- **Auth is global**: `PollarAuthGuard` and `RolesGuard` registered as `APP_GUARD`. No need for `@UseGuards()` on controllers.
- **Public endpoints**: Use `@Public()` decorator (e.g. transparency data for `public-viewer`).
- **Optional auth**: Use `@OptionalAuth()` to enrich response when token is present.
- **Role-based access**: Use `@Roles(UserRole.CMINDS_OPERATOR)`, `@Roles(UserRole.COMMUNITY_IMPLEMENTER)`, etc.
- **User sync**: Frontends call `POST /users/sync` after Pollar login to upsert `User` + `Wallet` and attach the app role.
- **Events for decoupling**: Use `EventEmitter2` to emit events instead of importing other feature modules directly.

## Project Structure

```
apps/core-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── main.ts                          # Bootstrap: Helmet, CORS, ValidationPipe, Swagger
│   ├── app.module.ts                    # Root module: Throttler, Auth, Users, guards
│   │
│   ├── auth/                            # Auth module (self-contained)
│   │   ├── auth.module.ts
│   │   ├── services/pollar-token.service.ts
│   │   ├── guards/
│   │   │   ├── pollar-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   └── decorators/
│   │       ├── public.decorator.ts
│   │       ├── roles.decorator.ts
│   │       ├── current-user.decorator.ts
│   │       └── optional-auth.decorator.ts
│   │
│   ├── database/                        # Global database module
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   │
│   └── modules/                         # Feature modules
│       ├── users/
│       ├── escrows/
│       ├── milestones/
│       ├── tasks/
│       ├── evidence/
│       ├── funders/
│       └── ...
│
├── test/
├── .env.example
└── package.json
```

## Domain modules (v1)

| Module | Serves | Key responsibilities |
| --- | --- | --- |
| `users` | All authenticated dashboards | Sync Pollar identity, roles, wallets |
| `escrows` | `community-dashboard`, `cminds-dashboard`, `funding-dashboard`, `public-viewer` | Escrow metadata, contract address, status, initializer wallet |
| `milestones` | All dashboards | Task-linked milestones, amounts, deadlines, approval state |
| `tasks` | `community-dashboard` | Fixed conservation task menu |
| `evidence` | `community-dashboard`, `cminds-dashboard` | Evidence link storage and review |
| `funders` | `funding-dashboard`, `public-viewer` | Funding records, deposit tracking |

## Key Conventions

### Feature Module Pattern
Each module is self-contained: `module.ts`, `controller.ts`, `service.ts`, `dto/`, `*.spec.ts`.
Register every new module in `app.module.ts` imports.

### Controller Rules
- Thin controllers: validate access, delegate to service, return result.
- Use `@CurrentUser()` with `AuthenticatedUser` type (never `any`).
- Use `ForbiddenException` for access control, `BadRequestException` for validation.
- All endpoints must have `@ApiOperation`, `@ApiResponse`, `@ApiParam`/`@ApiQuery` for Swagger.

### Service Rules
- All business logic lives in services.
- Throw HTTP exceptions directly (`NotFoundException`, `ConflictException`, etc.).
- Use `EventEmitter2` for side effects (notifications, audit logs).
- Never import other feature modules — use events for cross-module communication.

### DTO Rules
- Use `class-validator` decorators on every field.
- Use `@ApiProperty` / `@ApiPropertyOptional` for Swagger docs.
- Use `@Transform()` for normalization (trim, lowercase wallet addresses, etc.).

### Imports
```typescript
// Auth decorators/interfaces — always from barrel
import { CurrentUser, Roles, Public, OptionalAuth } from '../../auth';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user';

// Prisma — from database module
import { PrismaService } from '../../database';

// Prisma enums — from generated client enums
import { UserRole } from '../../generated/prisma/enums';
```

## Frontend ↔ API mapping

| Frontend package | Typical API consumers |
| --- | --- |
| `community-dashboard` | `users`, `escrows`, `milestones`, `evidence`, `tasks` |
| `cminds-dashboard` | `users`, `escrows`, `milestones`, `evidence` (approve/dispute) |
| `funding-dashboard` | `users`, `escrows`, `funders` |
| `public-viewer` | `escrows`, `milestones`, `funders` (read-only, `@Public`) |

Product requirements: `docs/CMINDS_CONTEXT.md`
