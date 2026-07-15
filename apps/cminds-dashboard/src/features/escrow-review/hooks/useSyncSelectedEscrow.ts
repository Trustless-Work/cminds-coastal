"use client";

import { useEffect } from "react";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import type { GetEscrowsFromIndexerResponse as Escrow } from "@trustless-work/escrow/types";

export function useSyncSelectedEscrow(escrow: Escrow | null | undefined): void {
  const { setSelectedEscrow } = useEscrowContext();

  useEffect(() => {
    if (!escrow) return;
    setSelectedEscrow(escrow);
  }, [escrow, setSelectedEscrow]);
}
