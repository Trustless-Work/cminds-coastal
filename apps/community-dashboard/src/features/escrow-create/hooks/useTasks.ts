"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTasks, type TaskRecord } from "@repo/features/escrow/services/tasks.service";

export function useTasks() {
  return useQuery<TaskRecord[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
    staleTime: 60_000,
  });
}
