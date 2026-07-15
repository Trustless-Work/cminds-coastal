"use client";

import { fetchCommunities } from "@repo/features/escrow/services/communities.service";
import { useQuery } from "@tanstack/react-query";

export function useCommunities() {
  return useQuery({
    queryKey: ["communities", "active"],
    queryFn: fetchCommunities,
    staleTime: 60_000,
  });
}
