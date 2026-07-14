import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { UserRole } from '../../../generated/prisma/enums';

export const SEARCHABLE_USER_ROLES = [
  UserRole.CMINDS_OPERATOR,
  UserRole.COMMUNITY_IMPLEMENTER,
] as const;

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    enum: SEARCHABLE_USER_ROLES,
    description:
      'Optional role filter. Omit to search all active users with wallets.',
  })
  @IsOptional()
  @IsIn(SEARCHABLE_USER_ROLES)
  role?: (typeof SEARCHABLE_USER_ROLES)[number];

  @ApiPropertyOptional({ description: 'Email prefix / substring search' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  q?: string;
}
