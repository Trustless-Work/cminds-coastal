import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { UserRole } from "../../../generated/prisma/enums";

export const SYNCABLE_ROLES = [
  UserRole.COMMUNITY_IMPLEMENTER,
  UserRole.CMINDS_OPERATOR,
  UserRole.FUNDER,
] as const;

export type SyncableRole = (typeof SYNCABLE_ROLES)[number];

export class SyncUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: "Ada Lovelace" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  display_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar_url?: string;

  @ApiProperty({
    example: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^G[A-Z2-7]{55}$/, {
    message: "wallet_address must be a valid Stellar G-address",
  })
  wallet_address!: string;

  @ApiPropertyOptional({ example: "wal_abc123" })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  pollar_wallet_id?: string;

  @ApiProperty({
    enum: SYNCABLE_ROLES,
    example: UserRole.COMMUNITY_IMPLEMENTER,
  })
  @IsIn(SYNCABLE_ROLES)
  role!: SyncableRole;
}
