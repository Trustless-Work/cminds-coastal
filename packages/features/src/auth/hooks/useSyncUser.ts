"use client";

import { usePollar } from "@pollar/react";
import { ApiError, setAuthTokenProvider } from "@repo/config";
import { useEffect, useRef, useState } from "react";
import { syncUser } from "../services/users.service";
import type { AuthProvider, SyncableUserRole, UserProfile } from "../types";

type UseSyncUserOptions = {
  role: SyncableUserRole;
  enabled?: boolean;
};

type UseSyncUserResult = {
  profile: UserProfile | null;
  pollarAvatar: string | null;
  syncing: boolean;
  error: string | null;
  isReady: boolean;
};

type PollarProviders = {
  email: { address: string } | null;
  google: { id: string } | null;
  github: { id: string } | null;
  wallet: { address: string } | null;
};

type PollarUserProfileLike = {
  mail: string;
  first_name: string;
  last_name: string;
  avatar: string;
  providers: PollarProviders;
};

type PollarWalletLike = {
  custody: string;
  address: string;
  provider: string | null;
} | null;

type PollarClientLike = {
  getAuthState: () => {
    step: string;
    verified?: boolean;
    session?: { token: { accessToken: string } };
  };
  getUserProfile: () => PollarUserProfileLike | null;
  getWallet: () => PollarWalletLike;
};

function readAccessToken(client: PollarClientLike): string | undefined {
  const state = client.getAuthState();
  if (state.step !== "authenticated") {
    return undefined;
  }
  return state.session?.token.accessToken;
}

function deriveAuthProviders(
  profile: PollarUserProfileLike,
  wallet: PollarWalletLike,
): AuthProvider[] {
  const providers = new Set<AuthProvider>();

  if (profile.providers.email) {
    providers.add("EMAIL");
  }
  if (profile.providers.google) {
    providers.add("GOOGLE");
  }

  if (wallet?.custody === "internal") {
    if (wallet.provider === "email") {
      providers.add("EMAIL");
    }
    if (wallet.provider === "google") {
      providers.add("GOOGLE");
    }
  }

  return [...providers];
}

function readPollarAvatar(profile: PollarUserProfileLike | null): string | null {
  const avatar = profile?.avatar?.trim();
  return avatar || null;
}

export function useSyncUser({
  role,
  enabled = true,
}: UseSyncUserOptions): UseSyncUserResult {
  const { isAuthenticated, verified, wallet, getClient } = usePollar();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pollarAvatar, setPollarAvatar] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !verified || !wallet?.address) {
      setIsReady(false);
      return;
    }

    const client = getClient() as PollarClientLike;

    setAuthTokenProvider(() => readAccessToken(client));

    const userProfile = client.getUserProfile();
    setPollarAvatar(readPollarAvatar(userProfile));

    if (inFlight.current || profile) {
      if (profile) {
        setIsReady(true);
      }
      return;
    }

    const accessToken = readAccessToken(client);
    if (!accessToken) {
      setIsReady(false);
      return;
    }

    const email = userProfile?.mail?.trim();
    if (!email || !userProfile) {
      setError("Pollar profile email is unavailable");
      return;
    }

    const displayName = [userProfile.first_name, userProfile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    const avatarUrl = readPollarAvatar(userProfile);
    const authProviders = deriveAuthProviders(userProfile, client.getWallet());

    inFlight.current = true;
    setSyncing(true);
    setError(null);

    void syncUser({
      email,
      display_name: displayName || undefined,
      avatar_url: avatarUrl ?? undefined,
      wallet_address: wallet.address,
      role,
      auth_providers: authProviders.length > 0 ? authProviders : undefined,
    })
      .then((result) => {
        setProfile(result);
        setIsReady(true);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to sync user";
        setError(message);
        setIsReady(false);
      })
      .finally(() => {
        setSyncing(false);
        inFlight.current = false;
      });
  }, [
    enabled,
    getClient,
    isAuthenticated,
    profile,
    role,
    verified,
    wallet?.address,
  ]);

  return { profile, pollarAvatar, syncing, error, isReady };
}
