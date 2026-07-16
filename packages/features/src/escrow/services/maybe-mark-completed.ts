import {
  areAllMilestonesSettled,
  type SettledMilestoneLike,
} from "@repo/helpers";
import {
  updateEscrowStatus,
  type EscrowRecord,
} from "../services/escrows.service";

/**
 * Persist COMPLETED off-chain when all on-chain milestones are settled.
 * Returns the updated record, or null when no write was needed / failed soft.
 */
export async function maybeMarkEscrowCompleted(
  escrowId: string,
  milestones: SettledMilestoneLike[],
): Promise<EscrowRecord | null> {
  if (!areAllMilestonesSettled(milestones)) {
    return null;
  }

  try {
    return await updateEscrowStatus(escrowId, "COMPLETED");
  } catch {
    return null;
  }
}
