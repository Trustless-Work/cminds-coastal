import type { Factor } from "@supabase/supabase-js";

export type AalLevel = "aal1" | "aal2";

export function parseAal(level: string | null | undefined): AalLevel | null {
  if (level === "aal1" || level === "aal2") {
    return level;
  }
  return null;
}

export function getVerifiedTotpFactor(
  factors: Factor[] | undefined,
): Factor | null {
  if (!factors) {
    return null;
  }
  return (
    factors.find(
      (factor) =>
        factor.factor_type === "totp" && factor.status === "verified",
    ) ?? null
  );
}

export function getUnverifiedTotpFactors(
  factors: Factor[] | undefined,
): Factor[] {
  if (!factors) {
    return [];
  }
  return factors.filter(
    (factor) =>
      factor.factor_type === "totp" && factor.status === "unverified",
  );
}
