"use client";

import { useMemo } from "react";
import { useParticipatingEscrows } from "@repo/features/escrow/hooks/useParticipatingEscrows";
import type { EscrowRecord } from "@repo/features/escrow/services/escrows.service";
import { useEscrowsByContractIdsQuery } from "@repo/tw-blocks/tanstack/useEscrowsByContractIdsQuery";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

import type { EnrichedOperatorEscrow, OperatorEscrowStats } from "../types";
import { buildReviewQueue, getMilestoneReviewStatus } from "../utils";

export function useOperatorEscrows() {
  const coreQuery = useParticipatingEscrows("approver");
  const records = useMemo(
    () => coreQuery.data ?? [],
    [coreQuery.data],
  );

  const contractIds = useMemo(
    () => records.map((record) => record.escrow_id),
    [records],
  );

  const chainQuery = useEscrowsByContractIdsQuery({
    contractIds,
  });

  const chainByContractId = useMemo(() => {
    const map = new Map<string, Escrow>();
    for (const escrow of chainQuery.data ?? []) {
      if (escrow.contractId) {
        map.set(escrow.contractId, escrow);
      }
    }
    return map;
  }, [chainQuery.data]);

  const metadataByContractId = useMemo(() => {
    const map = new Map<string, EscrowRecord | null>();
    for (const record of records) {
      map.set(record.escrow_id, record);
    }
    return map;
  }, [records]);

  const chainEscrows = useMemo(
    () =>
      contractIds
        .map((id) => chainByContractId.get(id))
        .filter((escrow): escrow is Escrow => Boolean(escrow)),
    [contractIds, chainByContractId],
  );

  const reviewQueue = useMemo(
    () => buildReviewQueue(chainEscrows, metadataByContractId),
    [chainEscrows, metadataByContractId],
  );

  const enrichedEscrows = useMemo((): EnrichedOperatorEscrow[] => {
    return records.map((metadata) => {
      const chain = chainByContractId.get(metadata.escrow_id);
      let pendingReviewCount = 0;
      let disputedCount = 0;

      if (chain) {
        for (const milestone of chain.milestones) {
          const status = getMilestoneReviewStatus(milestone);
          if (status === "ready_for_review") pendingReviewCount += 1;
          if (status === "disputed") disputedCount += 1;
        }
      }

      return {
        metadata,
        chain,
        pendingReviewCount,
        disputedCount,
      };
    });
  }, [records, chainByContractId]);

  const stats = useMemo((): OperatorEscrowStats => {
    let pendingReview = 0;
    let disputed = 0;
    let approved = 0;
    let completed = 0;

    for (const record of records) {
      if (record.status.toUpperCase() === "COMPLETED") {
        completed += 1;
      }
    }

    for (const escrow of chainEscrows) {
      for (const milestone of escrow.milestones) {
        const status = getMilestoneReviewStatus(milestone);
        if (status === "ready_for_review") pendingReview += 1;
        if (status === "disputed") disputed += 1;
        if (status === "approved" || status === "released") approved += 1;
      }
    }

    return {
      totalEscrows: records.length,
      pendingReview,
      disputed,
      approved,
      completed,
    };
  }, [chainEscrows, records]);

  return {
    records,
    enrichedEscrows,
    reviewQueue,
    stats,
    chainByContractId,
    isLoading: coreQuery.isLoading,
    isChainLoading: chainQuery.isLoading,
    isFetching: coreQuery.isFetching || chainQuery.isFetching,
    isError: coreQuery.isError,
    error: coreQuery.error,
    refetch: async () => {
      await Promise.all([coreQuery.refetch(), chainQuery.refetch()]);
    },
  };
}
