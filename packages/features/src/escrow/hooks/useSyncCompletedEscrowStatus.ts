"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  areAllMilestonesSettled,
  type SettledMilestoneLike,
} from "@repo/helpers";

import { updateEscrowStatus } from "../services/escrows.service";

type UseSyncCompletedEscrowStatusParams = {
  escrowId: string | undefined;
  offchainStatus: string | undefined;
  milestones: SettledMilestoneLike[] | undefined;
};

/**
 * One-shot reconcile: if on-chain milestones are all settled and off-chain
 * status is not yet COMPLETED/CANCELLED, PATCH COMPLETED.
 */
export function useSyncCompletedEscrowStatus({
  escrowId,
  offchainStatus,
  milestones,
}: UseSyncCompletedEscrowStatusParams): void {
  const queryClient = useQueryClient();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!escrowId || !milestones?.length) return;

    const normalized = offchainStatus?.toUpperCase() ?? "";
    if (normalized === "COMPLETED" || normalized === "CANCELLED") return;
    if (!areAllMilestonesSettled(milestones)) return;
    if (syncedRef.current === escrowId) return;

    syncedRef.current = escrowId;

    void updateEscrowStatus(escrowId, "COMPLETED")
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: ["escrows"] });
      })
      .catch(() => {
        syncedRef.current = null;
      });
  }, [escrowId, offchainStatus, milestones, queryClient]);
}
