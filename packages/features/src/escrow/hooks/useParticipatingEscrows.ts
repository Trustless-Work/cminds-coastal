"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchParticipatingEscrows,
  type EscrowRecord,
  type ParticipatingRole,
} from "../services/escrows.service";

export function useParticipatingEscrows(as: ParticipatingRole) {
  return useQuery({
    queryKey: ["escrows", "participating", as] as const,
    queryFn: () => fetchParticipatingEscrows(as),
  });
}

/**
 * Union of escrows where the user participates in any of the given roles,
 * keyed by escrow_id (first role wins for duplicates).
 */
export function useParticipatingEscrowsUnion(roles: ParticipatingRole[]) {
  const queries = useQueries({
    queries: roles.map((as) => ({
      queryKey: ["escrows", "participating", as] as const,
      queryFn: () => fetchParticipatingEscrows(as),
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const isError = queries.some((query) => query.isError);
  const error = queries.find((query) => query.error)?.error ?? null;

  const data: EscrowRecord[] = (() => {
    const byId = new Map<string, EscrowRecord>();
    for (const query of queries) {
      for (const escrow of query.data ?? []) {
        if (!byId.has(escrow.escrow_id)) {
          byId.set(escrow.escrow_id, escrow);
        }
      }
    }
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  })();

  const refetch = async () => {
    await Promise.all(queries.map((query) => query.refetch()));
  };

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
