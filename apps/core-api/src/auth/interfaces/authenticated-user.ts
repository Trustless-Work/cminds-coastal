export type AuthenticatorAssuranceLevel = "aal1" | "aal2";

export type AuthenticatedUser = {
  /** Present when the Bearer token is a Pollar access token. */
  pollarUserId?: string;
  /** Present when the Bearer token is a Supabase Auth access token. */
  supabaseUserId?: string;
  email?: string;
  accessToken: string;
  /** Supabase JWT `aal` claim when authenticated via Supabase Auth. */
  aal?: AuthenticatorAssuranceLevel;
};
