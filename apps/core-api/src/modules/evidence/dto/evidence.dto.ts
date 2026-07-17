import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RegisterEvidenceUrlDto {
  @ApiProperty({ example: 'https://drive.google.com/file/d/abc/view' })
  @IsUrl(
    { require_protocol: true },
    { message: 'A valid https URL is required' },
  )
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  escrow_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  milestone_index?: number;
}

export class ResolveEvidenceQueryDto {
  @ApiProperty({
    description: 'Comma-separated evidence ref ids',
    example: 'a1b2c3d4e5f67890,u9z8y7x6w5v4u3',
  })
  @IsString()
  ids!: string;
}
