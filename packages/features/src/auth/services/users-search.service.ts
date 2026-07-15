import { http } from "@repo/config";

export type SearchableUserRole = "CMINDS_OPERATOR" | "COMMUNITY_IMPLEMENTER";

export type UserSearchResult = {
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  wallet_address: string;
};

export type UserSearchPage = {
  items: UserSearchResult[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

export async function searchUsers(params: {
  role?: SearchableUserRole;
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<UserSearchPage> {
  const { data } = await http.get<UserSearchPage>("/users/search", {
    params: {
      ...(params.role ? { role: params.role } : {}),
      ...(params.q ? { q: params.q } : {}),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
  return data;
}
