import { http } from "@repo/config";

export type SearchableUserRole = "CMINDS_OPERATOR" | "COMMUNITY_IMPLEMENTER";

export type UserSearchResult = {
  user_id: string;
  email: string;
  display_name: string | null;
  wallet_address: string;
};

export async function searchUsers(params: {
  role?: SearchableUserRole;
  q?: string;
}): Promise<UserSearchResult[]> {
  const { data } = await http.get<UserSearchResult[]>("/users/search", {
    params: {
      ...(params.role ? { role: params.role } : {}),
      ...(params.q ? { q: params.q } : {}),
    },
  });
  return data;
}
