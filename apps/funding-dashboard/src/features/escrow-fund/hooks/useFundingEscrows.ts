"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFundingEscrows } from "@repo/features/escrow/services/escrows.service";

export function useFundingEscrows() {
  return useQuery({
    queryKey: ["escrows", "funding"],
    queryFn: fetchFundingEscrows,
  });
}
