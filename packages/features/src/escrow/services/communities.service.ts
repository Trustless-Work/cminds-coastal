import { http } from "@repo/config";

export type CommunityRecord = {
  community_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateCommunityPayload = {
  name: string;
  description?: string;
};

export type UpdateCommunityPayload = {
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export async function fetchCommunities(): Promise<CommunityRecord[]> {
  const { data } = await http.get<CommunityRecord[]>("/communities");
  return data;
}

export async function fetchAdminCommunities(): Promise<CommunityRecord[]> {
  const { data } = await http.get<CommunityRecord[]>("/communities/admin");
  return data;
}

export async function createCommunity(
  payload: CreateCommunityPayload,
): Promise<CommunityRecord> {
  const { data } = await http.post<CommunityRecord>("/communities", payload);
  return data;
}

export async function updateCommunity(
  communityId: string,
  payload: UpdateCommunityPayload,
): Promise<CommunityRecord> {
  const { data } = await http.patch<CommunityRecord>(
    `/communities/${encodeURIComponent(communityId)}`,
    payload,
  );
  return data;
}

export async function softDeleteCommunity(
  communityId: string,
): Promise<CommunityRecord> {
  const { data } = await http.delete<CommunityRecord>(
    `/communities/${encodeURIComponent(communityId)}`,
  );
  return data;
}
