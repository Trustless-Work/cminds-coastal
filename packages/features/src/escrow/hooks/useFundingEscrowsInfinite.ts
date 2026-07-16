"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchFundingEscrowFacets,
  fetchFundingEscrowsPage,
  type FundingEscrowFacets,
  type FundingEscrowsPage,
} from "../services/escrows.service";

export type EscrowListFilters = {
  status: string;
  community: string;
  query: string;
};

export const EMPTY_ESCROW_LIST_FILTERS: EscrowListFilters = {
  status: "",
  community: "",
  query: "",
};

const DEFAULT_PAGE_SIZE = 12;

function parseFilters(searchParams: URLSearchParams): EscrowListFilters {
  return {
    status: searchParams.get("status") ?? "",
    community:
      searchParams.get("community_id") ?? searchParams.get("community") ?? "",
    query: searchParams.get("q") ?? "",
  };
}

function filtersToSearchParams(filters: EscrowListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.community) params.set("community_id", filters.community);
  const trimmedQuery = filters.query.trim();
  if (trimmedQuery) params.set("q", trimmedQuery);
  return params.toString();
}

export function useEscrowListSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const appliedFilters = useMemo(
    () => parseFilters(searchParams),
    [searchParams],
  );

  const [draftFilters, setDraftFilters] =
    useState<EscrowListFilters>(appliedFilters);

  useEffect(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const applyFilters = useCallback(() => {
    const qs = filtersToSearchParams(draftFilters);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [draftFilters, pathname, router]);

  const clearFilters = useCallback(() => {
    setDraftFilters(EMPTY_ESCROW_LIST_FILTERS);
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = Boolean(
    appliedFilters.status ||
      appliedFilters.community ||
      appliedFilters.query.trim(),
  );

  return {
    draftFilters,
    setDraftFilters,
    appliedFilters,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  };
}

export function useFundingEscrowsInfinite(filters: EscrowListFilters) {
  return useInfiniteQuery<
    FundingEscrowsPage,
    Error,
    { pages: FundingEscrowsPage[]; pageParams: (string | undefined)[] },
    readonly unknown[],
    string | undefined
  >({
    queryKey: ["escrows", "funding", filters],
    queryFn: ({ pageParam }) =>
      fetchFundingEscrowsPage({
        limit: DEFAULT_PAGE_SIZE,
        cursor: pageParam,
        status: filters.status || undefined,
        community_id: filters.community || undefined,
        q: filters.query.trim() || undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useFundingEscrowFacets() {
  return useQuery<FundingEscrowFacets>({
    queryKey: ["escrows", "funding", "facets"],
    queryFn: fetchFundingEscrowFacets,
    staleTime: 60_000,
  });
}

export function useLoadMoreOnIntersect(
  onLoadMore: () => void,
  enabled: boolean,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, enabled]);

  return ref;
}
