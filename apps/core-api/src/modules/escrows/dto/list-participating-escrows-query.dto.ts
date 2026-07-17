import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const PARTICIPATING_ROLES = [
  'initializer',
  'approver',
  'release_signer',
  'dispute_resolver',
] as const;

export type ParticipatingRole = (typeof PARTICIPATING_ROLES)[number];

export class ListParticipatingEscrowsQueryDto {
  @ApiProperty({
    enum: PARTICIPATING_ROLES,
    description:
      'Which escrow participant column to filter by for the current user',
  })
  @IsIn(PARTICIPATING_ROLES)
  as!: ParticipatingRole;
}
