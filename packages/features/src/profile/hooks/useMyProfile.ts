"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/services/users.service";

export const MY_PROFILE_QUERY_KEY = ["me", "profile"] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    queryFn: getMe,
    staleTime: 30_000,
  });
}
