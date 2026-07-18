"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCommunities } from "../../escrow/services/communities.service";

/** Communities feeding the profile picker — only fetched when `enabled`. */
export function useProfileCommunities(enabled: boolean) {
  return useQuery({
    queryKey: ["profile", "communities"],
    queryFn: fetchCommunities,
    enabled,
    staleTime: 5 * 60_000,
  });
}
