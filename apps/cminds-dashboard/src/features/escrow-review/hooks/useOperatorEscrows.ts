"use client";

import { useMemo } from "react";
import { useWalletContext } from "@repo/providers/WalletProvider";
import { useEscrowsByRoleQuery } from "@repo/tw-blocks/tanstack/useEscrowsByRoleQuery";

import { buildReviewQueue, computeOperatorStats } from "../utils";

export function useOperatorEscrows() {
  const { walletAddress } = useWalletContext();

  const query = useEscrowsByRoleQuery({
    role: "approver",
    roleAddress: walletAddress ?? "",
    enabled: Boolean(walletAddress),
    type: "multi-release",
    orderBy: "updatedAt",
    orderDirection: "desc",
  });

  const escrows = useMemo(() => query.data ?? [], [query.data]);
  const reviewQueue = useMemo(() => buildReviewQueue(escrows), [escrows]);
  const stats = useMemo(() => computeOperatorStats(escrows), [escrows]);

  return {
    walletAddress,
    escrows,
    reviewQueue,
    stats,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
