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

export async function fetchTasks(): Promise<TaskRecord[]> {
  const { data } = await http.get<TaskRecord[]>("/tasks");
  return data;
}
