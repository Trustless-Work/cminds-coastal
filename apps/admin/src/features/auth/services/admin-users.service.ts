import { http, handleApiError, ApiError } from "@repo/config";

export type AdminUserProfile = {
  user_id: string;
  pollar_user_id: string | null;
  supabase_user_id: string | null;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  roles: string[];
  is_active: boolean;
};

export async function fetchAdminMe(): Promise<AdminUserProfile> {
  try {
    const { data } = await http.get<AdminUserProfile>("/users/admin/me");
    return data;
  } catch (error) {
    throw error instanceof ApiError ? error : handleApiError(error);
  }
}
