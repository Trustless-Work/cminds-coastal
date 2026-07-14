import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEscrowMilestoneDto {
  @ApiProperty()
  @IsUUID()
  task_id!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  milestone_index!: number;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  custom_description?: string;
}

export class CreateEscrowDto {
  @ApiProperty({
    description: 'Stellar contract ID (C-address); used as escrow primary key',
  })
  @IsString()
  @Matches(/^C[A-Z0-9]{55}$/, {
    message: 'escrow_id must be a valid Stellar C-address',
  })
  escrow_id!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  community_name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  geographic_area?: string;

  @ApiPropertyOptional({
    description: 'Public URL of the escrow cover image in Supabase Storage',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  image_url?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  engagement_id!: string;

  @ApiProperty()
  @IsUUID()
  approver_user_id!: string;

  @ApiProperty()
  @IsUUID()
  release_signer_user_id!: string;

  @ApiProperty({ type: [CreateEscrowMilestoneDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEscrowMilestoneDto)
  milestones!: CreateEscrowMilestoneDto[];
}
