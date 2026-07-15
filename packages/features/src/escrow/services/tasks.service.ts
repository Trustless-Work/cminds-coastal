import { http } from "@repo/config";

export type TaskRecord = {
  task_id: string;
  code: string;
  category: string;
  name: string;
  expected_deliverable: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTaskPayload = {
  code: string;
  category: string;
  name: string;
  expected_deliverable: string;
};

export type UpdateTaskPayload = {
  code?: string;
  category?: string;
  name?: string;
  expected_deliverable?: string;
  is_active?: boolean;
};

export async function fetchTasks(): Promise<TaskRecord[]> {
  const { data } = await http.get<TaskRecord[]>("/tasks");
  return data;
}

export async function fetchAdminTasks(): Promise<TaskRecord[]> {
  const { data } = await http.get<TaskRecord[]>("/tasks/admin");
  return data;
}

export async function createTask(
  payload: CreateTaskPayload,
): Promise<TaskRecord> {
  const { data } = await http.post<TaskRecord>("/tasks", payload);
  return data;
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<TaskRecord> {
  const { data } = await http.patch<TaskRecord>(
    `/tasks/${encodeURIComponent(taskId)}`,
    payload,
  );
  return data;
}

export async function softDeleteTask(taskId: string): Promise<TaskRecord> {
  const { data } = await http.delete<TaskRecord>(
    `/tasks/${encodeURIComponent(taskId)}`,
  );
  return data;
}
