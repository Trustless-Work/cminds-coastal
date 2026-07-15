"use client";

import {
  createTask,
  fetchAdminTasks,
  softDeleteTask,
  updateTask,
  type CreateTaskPayload,
  type TaskRecord,
  type UpdateTaskPayload,
} from "@repo/features/escrow/services/tasks.service";
import { ApiError } from "@repo/config";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const ADMIN_TASKS_KEY = ["admin", "tasks"] as const;

export function useAdminTasks() {
  return useQuery({
    queryKey: ADMIN_TASKS_KEY,
    queryFn: fetchAdminTasks,
  });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_TASKS_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Task created", "The task is available in the menu.");
    },
    onError: (error: unknown) => {
      toastError(
        "Create failed",
        error instanceof ApiError ? error.message : "Unable to create task.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTaskPayload;
    }) => updateTask(id, payload),
    onSuccess: async () => {
      await invalidate();
      toastSuccess("Task updated", "Changes were saved.");
    },
    onError: (error: unknown) => {
      toastError(
        "Update failed",
        error instanceof ApiError ? error.message : "Unable to update task.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => softDeleteTask(id),
    onSuccess: async () => {
      await invalidate();
      toastSuccess(
        "Task deactivated",
        "It will no longer appear when creating escrows.",
      );
    },
    onError: (error: unknown) => {
      toastError(
        "Deactivate failed",
        error instanceof ApiError ? error.message : "Unable to deactivate task.",
      );
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}

export type { TaskRecord };
