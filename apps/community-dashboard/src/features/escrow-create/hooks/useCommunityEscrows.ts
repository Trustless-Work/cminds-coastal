"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchMyEscrows,
  type EscrowRecord,
} from "@repo/features/escrow/services/escrows.service";

export function useCommunityEscrows() {
  return useQuery<EscrowRecord[]>({
    queryKey: ["escrows", "mine"],
    queryFn: fetchMyEscrows,
  });
}
