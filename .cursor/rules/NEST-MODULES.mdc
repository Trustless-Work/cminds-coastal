---
description: NestJS module, controller, and service patterns for core-api
globs: apps/core-api/src/modules/**/*.ts
alwaysApply: false
---

# NestJS Module Patterns

## Controllers

- Thin layer: validate input, delegate to service, return response
- Always decorate with `@ApiTags('feature')` and `@ApiOperation()`
- Use DTOs for request validation (never raw `body: any`)
- Enforce role boundaries: only `CMINDS_OPERATOR` can approve/dispute milestones; only `COMMUNITY_IMPLEMENTER` can submit evidence for their escrow

```typescript
@ApiTags('milestones')
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post(':id/approve')
  @Roles(UserRole.CMINDS_OPERATOR)
  @ApiOperation({ summary: 'Approve milestone after evidence review' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.milestonesService.approve(id, user.id);
  }
}
```

## Services

- All business logic, validations, and Prisma queries live here
- Validate existence before operations (`findUnique` → `NotFoundException`)
- Validate permissions before mutations (`ForbiddenException`) — e.g. community user cannot approve own milestone
- Use transactions for multi-step writes: `this.prisma.$transaction(async (tx) => { ... })`
- Emit events for cross-module side effects: `this.eventEmitter.emit('milestone.approved', payload)`

## DTOs

- Use `class-validator` decorators: `@IsString()`, `@IsUUID()`, `@IsUrl()`, `@IsOptional()`, etc.
- Use `class-transformer`: `@Transform()`, `@Type()`
- Export types from DTOs, never define inline types in controllers
- Follow naming: `Create{Feature}Dto`, `Update{Feature}Dto`, `{Feature}ResponseDto`
- Wallet fields: validate Stellar address format where applicable

## Module Registration

- `DatabaseModule` is global — no need to import in each module
- Export services that other modules need
- Use `forwardRef()` only when circular deps are unavoidable

## Domain-specific rules

- **Escrow status transitions** must be explicit and validated in the service (e.g. cannot approve milestone on `PAUSED` escrow)
- **Evidence** is link-based in v1 — store URLs, not file blobs
- **Funding records** are append-only; never mutate historical deposit amounts
- **Public endpoints** for `public-viewer` return only data safe for transparency (shortened wallet addresses)
