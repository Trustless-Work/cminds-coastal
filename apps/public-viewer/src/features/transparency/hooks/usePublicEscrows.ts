"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFundingEscrows } from "@repo/features/escrow/services/escrows.service";

export function usePublicEscrows() {
  return useQuery({
    queryKey: ["escrows", "public", "funding"],
    queryFn: fetchFundingEscrows,
  });
}
