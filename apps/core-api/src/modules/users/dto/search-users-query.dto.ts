import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../generated/prisma/enums';

export const SEARCHABLE_USER_ROLES = [
  UserRole.CMINDS_OPERATOR,
  UserRole.COMMUNITY_IMPLEMENTER,
] as const;

function toOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN;
}

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    enum: SEARCHABLE_USER_ROLES,
    description:
      'Optional role filter. Omit to search all active users with wallets.',
  })
  @IsOptional()
  @IsIn(SEARCHABLE_USER_ROLES)
  role?: (typeof SEARCHABLE_USER_ROLES)[number];

  @ApiPropertyOptional({
    description:
      'Optional email substring filter. Omit to list users for browse + scroll.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  q?: string;

  @ApiPropertyOptional({
    description: '1-based page',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;
}
