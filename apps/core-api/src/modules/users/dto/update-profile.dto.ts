import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

function trimToNull(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return value as undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Ada' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(80)
  first_name?: string | null;

  @ApiPropertyOptional({ example: 'Lovelace' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(80)
  last_name?: string | null;

  @ApiPropertyOptional({ example: '+1 555 123 4567' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(32)
  @Matches(/^[+\d][\d\s().-]{5,31}$/, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number?: string | null;

  @ApiPropertyOptional({ example: 'Costa Rica' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(60)
  country?: string | null;

  @ApiPropertyOptional({ example: 'Puntarenas' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @ApiPropertyOptional({
    example:
      'Coastal conservation lead working with local fishing communities.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => trimToNull(value))
  @IsString()
  @MaxLength(500)
  bio?: string | null;

  @ApiPropertyOptional({
    description:
      'Community the user belongs to. Only allowed for COMMUNITY_IMPLEMENTER users. Send null to detach.',
    format: 'uuid',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === '' ? null : value,
  )
  @IsUUID()
  community_id?: string | null;
}
