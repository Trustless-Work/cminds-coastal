"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "../services/profile.service";

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => getPublicProfile(userId),
    enabled: Boolean(userId),
  });
}
