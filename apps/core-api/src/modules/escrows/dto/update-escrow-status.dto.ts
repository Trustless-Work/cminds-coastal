import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EscrowStatus } from '../../../generated/prisma/enums';

export const UPDATABLE_ESCROW_STATUSES = [
  EscrowStatus.CANCELLED,
  EscrowStatus.COMPLETED,
  EscrowStatus.INITIALIZED,
] as const;

export type UpdatableEscrowStatus = (typeof UPDATABLE_ESCROW_STATUSES)[number];

export class UpdateEscrowStatusDto {
  @ApiProperty({
    enum: UPDATABLE_ESCROW_STATUSES,
    description:
      'Target off-chain escrow status (CANCELLED, COMPLETED, or INITIALIZED to restore a cancelled escrow)',
  })
  @IsIn(UPDATABLE_ESCROW_STATUSES)
  status!: UpdatableEscrowStatus;
}
