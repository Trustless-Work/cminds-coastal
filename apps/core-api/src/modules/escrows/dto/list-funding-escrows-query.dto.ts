import { Transform } from 'class-transformer';
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
import { EscrowStatus } from '../../../generated/prisma/enums';

export const PUBLIC_FUNDING_STATUSES = [
  EscrowStatus.INITIALIZED,
  EscrowStatus.FUNDED,
  EscrowStatus.IN_PROGRESS,
  EscrowStatus.PAUSED,
  EscrowStatus.COMPLETED,
] as const;

function toOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN;
}

export class ListFundingEscrowsQueryDto {
  @ApiPropertyOptional({
    description: 'Page size',
    default: 12,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toOptionalInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Opaque cursor from the previous page nextCursor',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  cursor?: string;

  @ApiPropertyOptional({
    enum: PUBLIC_FUNDING_STATUSES,
    description: 'Exact status filter (public-visible statuses only)',
  })
  @IsOptional()
  @IsIn(PUBLIC_FUNDING_STATUSES)
  status?: (typeof PUBLIC_FUNDING_STATUSES)[number];

  @ApiPropertyOptional({
    description: 'Exact community_name match',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  community?: string;

  @ApiPropertyOptional({
    description:
      'Case-insensitive search across title, community, area, description, escrow_id',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  q?: string;
}
