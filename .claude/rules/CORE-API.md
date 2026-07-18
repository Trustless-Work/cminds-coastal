---
description: Core backend conventions for the NestJS core-api
alwaysApply: true
---

# Backend Core — core-api

You are a Senior Backend Engineer working on the **CMinds Escrow Pilot** — a **NestJS API** (`apps/core-api`) with **Prisma** and **Supabase PostgreSQL**.

Off-chain API supports four frontends: `community-dashboard`, `cminds-dashboard`, `funding-dashboard`, `public-viewer`. On-chain escrow logic uses **Trustless Work** on **Stellar** (integrated from frontends or a dedicated service layer).

Product context: `docs/CMINDS_CONTEXT.md`

## Architecture

- **Clean Architecture**: Controllers → Services → PrismaService → Database
- All business logic lives in **Services**, never in Controllers
- Controllers only handle HTTP concerns (params, auth, delegation to service, response)
- Database access is exclusively through **PrismaService** (global module)

## Project Structure

```
apps/core-api/src/modules/{feature}/
├── {feature}.module.ts
├── {feature}.controller.ts
├── {feature}.service.ts
├── {feature}.controller.spec.ts
├── {feature}.service.spec.ts
└── dto/
    ├── create-{feature}.dto.ts
    └── update-{feature}.dto.ts
```

Planned feature modules: `escrows`, `milestones`, `tasks`, `evidence`, `funders`.

## TypeScript Standards

- **Strict TypeScript** — never use `any` (use `unknown` + type narrowing instead)
- Explicitly type all function parameters and return types
- No unused variables, imports, or functions
- No unnecessary comments — code should be self-documenting

## NestJS Conventions

- Use `class-validator` + `class-transformer` for DTOs
- Use `@ApiTags`, `@ApiOperation` on all controllers (Swagger)
- Use custom `@Public()` decorator for unauthenticated endpoints (`public-viewer`)
- Use `@CurrentUser()` decorator to get the authenticated user
- Errors must use NestJS exceptions: `NotFoundException`, `ForbiddenException`, `BadRequestException`, etc.
- Use `EventEmitter2` for cross-module communication (audit logs, notifications)

## Error Handling

- External API errors (Stellar horizon, Trustless Work): log WARN + return graceful messages, never expose raw stack traces to clients
- Business validation failures: throw specific NestJS HTTP exceptions
- Database errors: let Prisma exceptions propagate (handled by global filter)

## Commands

From `apps/core-api/`:

```bash
pnpm start:dev          # Dev server
pnpm test               # Unit tests
pnpm test:cov           # Coverage
pnpm run prisma:generate
pnpm run prisma:migrate
```

From monorepo root: `pnpm exec turbo build --filter=core-api`

## Documentation

- `docs/CMINDS_CONTEXT.md` — product requirements, roles, flows
- `BACKEND-ARCHITECTURE.mdc` — module layout and API mapping
- `UNIT-TESTS.mdc` — testing patterns
- `DATABASE.mdc` / `PRISMA.mdc` — database setup and schema conventions
