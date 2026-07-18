import { http } from "@repo/config";
import type { UserProfile } from "../../auth/types";
import type { PublicUserProfile, UpdateProfilePayload } from "../types";

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const { data } = await http.patch<UserProfile>("/users/me", payload);
  return data;
}

export async function getPublicProfile(
  userId: string,
): Promise<PublicUserProfile> {
  const { data } = await http.get<PublicUserProfile>(
    `/users/${encodeURIComponent(userId)}/public`,
  );
  return data;
}
