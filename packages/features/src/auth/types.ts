export type SyncableUserRole =
  | "COMMUNITY_IMPLEMENTER"
  | "CMINDS_OPERATOR"
  | "FUNDER";

export type UserRole = SyncableUserRole | "RELEASE_SIGNER";

export type AuthProvider = "EMAIL" | "GOOGLE";

export type SyncUserPayload = {
  email: string;
  display_name?: string;
  avatar_url?: string;
  wallet_address: string;
  pollar_wallet_id?: string;
  role: SyncableUserRole;
  auth_providers?: AuthProvider[];
};

export type UserWallet = {
  wallet_id: string;
  user_id: string;
  pollar_wallet_id: string | null;
  address: string;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  user_id: string;
  pollar_user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_providers: AuthProvider[];
  roles: UserRole[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  wallets: UserWallet[];
};
