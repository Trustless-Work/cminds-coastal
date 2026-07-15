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

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminListQuery = {
  page: number;
  pageSize: number;
};

export async function fetchCommunities(): Promise<CommunityRecord[]> {
  const { data } = await http.get<CommunityRecord[]>("/communities");
  return data;
}

export async function fetchAdminCommunities(
  params: AdminListQuery,
): Promise<PaginatedResult<CommunityRecord>> {
  const { data } = await http.get<PaginatedResult<CommunityRecord>>(
    "/communities/admin",
    {
      params: {
        page: params.page,
        pageSize: params.pageSize,
      },
    },
  );
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
