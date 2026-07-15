"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  searchUsers,
  type SearchableUserRole,
  type UserSearchPage,
  type UserSearchResult,
} from "../services/users-search.service";

const PAGE_SIZE = 20;

export function useUserEmailSearch(
  role: SearchableUserRole | undefined,
  q: string,
  enabled = true,
) {
  const [debouncedQ, setDebouncedQ] = useState(q.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(q.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [q]);

  const query = useInfiniteQuery<UserSearchPage>({
    queryKey: ["users", "search", role ?? "all", debouncedQ, PAGE_SIZE],
    queryFn: ({ pageParam }) =>
      searchUsers({
        ...(role ? { role } : {}),
        q: debouncedQ || undefined,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled,
    staleTime: 30_000,
  });

  const users: UserSearchResult[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    users,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    isPending: query.isPending,
  };
}
