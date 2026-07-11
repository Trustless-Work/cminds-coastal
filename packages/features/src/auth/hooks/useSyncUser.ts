"use client";

import { usePollar } from "@pollar/react";
import { ApiError, setAuthToken } from "@repo/config";
import { useEffect, useRef, useState } from "react";
import { syncUser } from "../services/users.service";
import type { SyncableUserRole, UserProfile } from "../types";

type UseSyncUserOptions = {
  role: SyncableUserRole;
  enabled?: boolean;
};

type UseSyncUserResult = {
  profile: UserProfile | null;
  syncing: boolean;
  error: string | null;
  isReady: boolean;
};

type PollarClientLike = {
  getAuthState: () => {
    step: string;
    verified?: boolean;
    session?: { token: { accessToken: string } };
  };
  getUserProfile: () => {
    mail: string;
    first_name: string;
    last_name: string;
    avatar: string;
  } | null;
};

export function useSyncUser({
  role,
  enabled = true,
}: UseSyncUserOptions): UseSyncUserResult {
  const { isAuthenticated, verified, wallet, getClient } = usePollar();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !verified || !wallet?.address) {
      setIsReady(false);
      return;
    }

    if (inFlight.current || profile) {
      if (profile) {
        setIsReady(true);
      }
      return;
    }

    const client = getClient() as PollarClientLike;
    const state = client.getAuthState();
    const accessToken =
      state.step === "authenticated"
        ? state.session?.token.accessToken
        : undefined;
    if (!accessToken) {
      setIsReady(false);
      return;
    }

    const userProfile = client.getUserProfile();
    const email = userProfile?.mail?.trim();
    if (!email) {
      setError("Pollar profile email is unavailable");
      return;
    }

    const displayName = [userProfile?.first_name, userProfile?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    inFlight.current = true;
    setSyncing(true);
    setError(null);
    setAuthToken(accessToken);

    void syncUser({
      email,
      display_name: displayName || undefined,
      avatar_url: userProfile?.avatar || undefined,
      wallet_address: wallet.address,
      role,
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

  return { profile, syncing, error, isReady };
}
