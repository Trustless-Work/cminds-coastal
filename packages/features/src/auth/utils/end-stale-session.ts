import { clearAuthToken } from "@repo/config";

import { clearCachedUserProfiles } from "./profile-cache";

/**
 * Clears local auth artifacts and ends the Pollar session.
 * Used when the SDK still looks signed-in but the session is unusable
 * (expired token, missing profile email after long idle, etc.).
 */
export async function endStalePollarSession(
  logout: () => void | Promise<void>,
): Promise<void> {
  clearAuthToken();
  clearCachedUserProfiles();
  try {
    await Promise.resolve(logout());
  } catch {
    // Still redirect to login even if Pollar logout fails.
  }
}
