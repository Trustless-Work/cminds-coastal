---
description: Unit test patterns, conventions and commands for core-api
globs: apps/core-api/src/**/*.spec.ts
alwaysApply: false
---

# Unit Test Conventions — CMinds core-api

Tests use **Jest** with **@nestjs/testing**. Co-located next to their source files.

## Useful Commands

Run all commands from `apps/core-api/`:

```bash
# Run ALL unit tests
pnpm test

# Run tests for a specific module
pnpm test -- --testPathPatterns escrows
pnpm test -- --testPathPatterns milestones
pnpm test -- --testPathPatterns auth/guards

# Run a single test file
pnpm test -- --testPathPatterns escrows.service.spec

# Run tests in watch mode (re-run on file changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:cov

# Run coverage for a single module
pnpm test:cov -- --testPathPatterns milestones

# Run tests matching a specific test name
pnpm test -- -t "should throw NotFoundException"
```

Or from the monorepo root:

```bash
pnpm exec turbo test --filter=core-api
pnpm exec turbo test:cov --filter=core-api
```

## Coverage Configuration

Configured in `package.json` under `jest`:

- **Thresholds**: 75% statements, 75% lines, 75% functions, 70% branches (when enabled)
- **Collected from**: `*.service.ts`, `*.controller.ts`, `*.guard.ts`, `*.interceptor.ts`, `*.pipe.ts`, `*.filter.ts`
- **Excluded**: `*.spec.ts`, `*.e2e-spec.ts`, external SDK adapters (Supabase strategy, Stellar/Trustless Work clients)

When adding a new module, ensure tests meet the global thresholds before pushing.

## File Location & Naming

Tests live **next to** the file they test:

```
modules/escrows/
├── escrows.service.ts
├── escrows.service.spec.ts
├── escrows.controller.ts
├── escrows.controller.spec.ts
```

## Test Structure

```typescript
describe('EscrowsService', () => {
  let service: EscrowsService;

  const mockPrismaService = {
    escrow: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  };
  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EscrowsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<EscrowsService>(EscrowsService);
  });

  afterEach(() => jest.clearAllMocks());
});
```

## Controller Tests vs Service Tests

- **Controller tests**: verify delegation to service, correct param passing, no business logic duplication. Mock the entire service.
- **Service tests**: verify full business logic — happy path + every exception path. Mock Prisma and EventEmitter.

## Key Patterns

- Mock ALL dependencies — never use real DB or external services
- Test every exception: `NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`
- Verify `eventEmitter.emit` calls with correct event name and payload (e.g. `milestone.approved`, `escrow.initialized`)
- Verify Prisma methods called with correct `where`/`data`/`include`
- Use `mockResolvedValue` / `mockRejectedValue` for async mocks
- Test idempotency where applicable (e.g. duplicate funding records)
- Use `expect.any(Array)` or `expect.objectContaining()` for flexible assertions

## Naming Convention

```typescript
it('should throw NotFoundException when escrow does not exist', ...)
it('should create milestone with PENDING_REVIEW status', ...)
it('should emit milestone.approved event after CMinds approval', ...)
it('should return 403 when non-operator tries to dispute milestone', ...)
```
