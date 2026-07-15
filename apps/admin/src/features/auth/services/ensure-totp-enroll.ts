import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getUnverifiedTotpFactors,
  getVerifiedTotpFactor,
} from "../utils/aal";

export type TotpEnrollPayload = {
  factorId: string;
  qrCode: string;
  secret: string;
  uri: string;
};

const enrollInFlight = new Map<string, Promise<TotpEnrollPayload>>();

/**
 * Starts (or restarts) TOTP enrollment once per user.
 * Unenrolls leftover unverified factors so friendly-name conflicts cannot loop.
 */
export function ensureTotpEnroll(
  supabase: SupabaseClient,
  userId: string,
): Promise<TotpEnrollPayload> {
  const existing = enrollInFlight.get(userId);
  if (existing) {
    return existing;
  }

  let settle!: (value: TotpEnrollPayload | PromiseLike<TotpEnrollPayload>) => void;
  let fail!: (reason?: unknown) => void;
  const gate = new Promise<TotpEnrollPayload>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });
  enrollInFlight.set(userId, gate);

  void (async () => {
    try {
      const { data: factorsData, error: listError } =
        await supabase.auth.mfa.listFactors();
      if (listError) {
        throw listError;
      }

      const factors = factorsData?.all ?? factorsData?.totp ?? [];
      if (getVerifiedTotpFactor(factors)) {
        throw new Error("TOTP_ALREADY_VERIFIED");
      }

      for (const factor of getUnverifiedTotpFactors(factors)) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
        issuer: "CMinds Admin",
      });

      if (enrollError || !data) {
        throw enrollError ?? new Error("Unable to start TOTP enrollment");
      }

      settle({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      });
    } catch (error) {
      fail(error);
    } finally {
      enrollInFlight.delete(userId);
    }
  })();

  return gate;
}
