"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  searchUsers,
  type SearchableUserRole,
  type UserSearchResult,
} from "../services/users-search.service";

export function useUserEmailSearch(
  role: SearchableUserRole | undefined,
  q: string,
) {
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  return useQuery<UserSearchResult[]>({
    queryKey: ["users", "search", role ?? "all", debouncedQ],
    queryFn: () =>
      searchUsers({
        ...(role ? { role } : {}),
        q: debouncedQ || undefined,
      }),
    enabled: debouncedQ.length >= 1,
    staleTime: 30_000,
  });
}
