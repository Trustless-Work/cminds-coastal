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

const ADMIN_COMMUNITIES_KEY = ["admin", "communities"] as const;

export function useAdminCommunities() {
  return useQuery({
    queryKey: ADMIN_COMMUNITIES_KEY,
    queryFn: fetchAdminCommunities,
  });
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
