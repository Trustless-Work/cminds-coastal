---
description: database
alwaysApply: true
---

# Database Setup Guide

This guide explains how to set up and use Prisma with Supabase in `apps/core-api` for the CMinds Escrow Pilot.

Product context: `docs/CMINDS_CONTEXT.md`

## Prerequisites

- Supabase account and project
- Node.js >= 18
- pnpm 9 (`pnpm install` from monorepo root)

## Initial Setup

### 1. Get Supabase Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings > Database**
3. Copy the connection strings:
   - **Connection pooling** (for `DATABASE_URL`)
   - **Direct connection** (for `DIRECT_URL`)

### 2. Configure Environment Variables

Create a `.env` file in `apps/core-api/`:

```bash
cp .env.example .env
```

Then add your Supabase credentials:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.com:5432/postgres"
```

### 3. Update Prisma Schema

Edit `apps/core-api/prisma/schema.prisma` with CMinds domain models (`Escrow`, `Milestone`, `Task`, `Evidence`, `Funder`, `User`). See `PRISMA.mdc` for naming conventions.

### 4. Generate Prisma Client

```bash
cd apps/core-api
pnpm run prisma:generate
```

### 5. Push Schema to Database

For development (no migration files):

```bash
pnpm run prisma:push
```

Or create a migration (recommended for production):

```bash
pnpm run prisma:migrate
```

## Available Commands

Run from `apps/core-api/`:

| Command | Description |
| --- | --- |
| `pnpm run prisma:generate` | Generate Prisma Client |
| `pnpm run prisma:migrate` | Create and apply migrations |
| `pnpm run prisma:push` | Push schema changes (dev only) |
| `pnpm run prisma:studio` | Open Prisma Studio (GUI) |
| `pnpm run prisma:seed` | Seed task menu and test data |

## Architecture

```
apps/core-api/src/
├── database/
│   ├── database.module.ts
│   ├── prisma.service.ts
│   └── index.ts
├── modules/
│   ├── escrows/
│   ├── milestones/
│   ├── tasks/
│   ├── evidence/
│   └── funders/
└── app.module.ts
```

### Using Prisma in Services

`PrismaService` is globally available:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database";

@Injectable()
export class EscrowsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.escrow.findMany({
      include: { milestones: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.escrow.findUnique({
      where: { id },
      include: { milestones: true, funders: true },
    });
  }
}
```

## Prisma Studio

```bash
cd apps/core-api && pnpm run prisma:studio
```

Opens at `http://localhost:5555`

## Seeding

1. Edit `prisma/seed.ts` — task menu catalog, sample escrows for dev
2. Run: `pnpm run prisma:seed`

## Migrations Workflow

### Development

```bash
# Edit schema.prisma, then:
pnpm run prisma:migrate
```

### Production

```bash
pnpm exec prisma migrate deploy
```

## Best Practices

1. **Use transactions** for multi-step escrow/milestone writes
2. **Connection pooling** via `DATABASE_URL` (pgbouncer)
3. **Direct connection** via `DIRECT_URL` only for migrations
4. **Never commit** `.env` files
5. **Validate with DTOs** before database operations
6. **Index** `contract_address`, `escrow_id`, `status` fields
7. **Append-only** funding records — never mutate historical deposits

## Row Level Security (RLS)

RLS can be enabled in Supabase for defense in depth. The Core API uses Prisma with a role that typically bypasses RLS; **authorization is enforced in NestJS guards** (`CMINDS_OPERATOR`, `COMMUNITY_IMPLEMENTER`, etc.).

When RLS policies are added:

- User-scoped tables: users see only their own rows
- Public transparency data: read-only policies for `public-viewer` via anon key (if using Supabase client directly)
- Backend-only tables: RLS on with no policies — only Prisma/service role access

## Security Notes

- Never expose database credentials
- Use environment variables for all sensitive data
- Wallet addresses are public on-chain but treat PII carefully in user profiles
- Product requirements: `docs/CMINDS_CONTEXT.md`

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Prisma Integration](https://docs.nestjs.com/recipes/prisma)
