import { http } from "@repo/config";
import type { SyncUserPayload, UserProfile } from "../types";

export async function syncUser(
  payload: SyncUserPayload,
): Promise<UserProfile> {
  const { data } = await http.post<UserProfile>("/users/sync", payload);
  return data;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await http.get<UserProfile>("/users/me");
  return data;
}
