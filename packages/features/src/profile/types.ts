import type {
  UserCommunitySummary,
  UserProfile,
  UserRole,
} from "../auth/types";

export type { UserCommunitySummary, UserProfile, UserRole };

/** Payload sent to PATCH /users/me. `null` detaches an optional field. */
export type UpdateProfilePayload = {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  country?: string | null;
  city?: string | null;
  bio?: string | null;
  community_id?: string | null;
};

/** Read-only profile others can see — full profile except the wallet balance. */
export type PublicUserProfile = {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string;
  phone_number: string | null;
  country: string | null;
  city: string | null;
  bio: string | null;
  roles: UserRole[];
  community: UserCommunitySummary | null;
  wallet_address: string | null;
  created_at: string;
};
