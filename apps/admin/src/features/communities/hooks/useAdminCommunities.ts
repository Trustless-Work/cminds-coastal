"use client";

import {
  createCommunity,
  fetchAdminCommunities,
  softDeleteCommunity,
  updateCommunity,
  type CommunityRecord,
  type CreateCommunityPayload,
  type UpdateCommunityPayload,
} from "@repo/features/escrow/services/communities.service";
import { ApiError } from "@repo/config";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import type {
  AdminPaginationMeta,
  AdminPaginationState,
} from "@/features/data-table/types";

const ADMIN_COMMUNITIES_KEY = ["admin", "communities"] as const;

export function useAdminCommunities() {
  const [pagination, setPagination] = useState<AdminPaginationState>({
    page: 1,
    pageSize: 10,
  });

  const query = useQuery({
    queryKey: [...ADMIN_COMMUNITIES_KEY, pagination] as const,
    queryFn: () => fetchAdminCommunities(pagination),
  });

  useEffect(() => {
    const totalPages = query.data?.totalPages ?? 0;
    if (
      totalPages > 0 &&
      pagination.page > totalPages &&
      !query.isFetching
    ) {
      setPagination((current) => ({ ...current, page: totalPages }));
    }
  }, [pagination.page, query.data?.totalPages, query.isFetching]);

  const items = query.data?.items ?? [];
  const meta: AdminPaginationMeta = {
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
  };

  return {
    items,
    meta,
    pagination,
    setPagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  };
}

export function useCommunityMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_COMMUNITIES_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommunityPayload) => createCommunity(payload),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Community created", "The community is ready to use.");
    },
    onError: (error: unknown) => {
      toastError(
        "Create failed",
        error instanceof ApiError ? error.message : "Unable to create community.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCommunityPayload;
    }) => updateCommunity(id, payload),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Community updated", "Changes were saved.");
    },
    onError: (error: unknown) => {
      toastError(
        "Update failed",
        error instanceof ApiError ? error.message : "Unable to update community.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => softDeleteCommunity(id),
    onSuccess: async () => {
      await invalidate();
      toastSuccess(
        "Community deactivated",
        "It will no longer appear in create-escrow pickers.",
      );
    },
    onError: (error: unknown) => {
      toastError(
        "Deactivate failed",
        error instanceof ApiError
          ? error.message
          : "Unable to deactivate community.",
      );
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}

export type { CommunityRecord };
