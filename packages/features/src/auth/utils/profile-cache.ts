import type { SyncableUserRole, UserProfile } from "../types";

const CACHE_PREFIX = "cminds:user-profile:";

function cacheKey(walletAddress: string, role: SyncableUserRole): string {
  return `${CACHE_PREFIX}${walletAddress.toLowerCase()}:${role}`;
}

export function readCachedUserProfile(
  walletAddress: string,
  role: SyncableUserRole,
): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(cacheKey(walletAddress, role));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function writeCachedUserProfile(
  walletAddress: string,
  role: SyncableUserRole,
  profile: UserProfile,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      cacheKey(walletAddress, role),
      JSON.stringify(profile),
    );
  } catch {
    // Quota / private mode — ignore
  }
}

export function clearCachedUserProfiles(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
    for (const key of keys) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
