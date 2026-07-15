"use client";

import type { AuthState } from "@pollar/core";
import { usePollar } from "@pollar/react";
import { useEffect, useState } from "react";

const RESUME_SETTLE_TIMEOUT_MS = 10_000;

type PollarBootstrapClient = {
  ready: () => Promise<void>;
  getAuthState: () => AuthState;
  onAuthStateChange: (cb: (state: AuthState) => void) => () => void;
};

function isResumeSettled(state: AuthState): boolean {
  if (state.step === "idle") {
    return true;
  }
  if (state.step === "authenticated") {
    return state.verified;
  }
  return state.step === "error";
}

/**
 * Waits for Pollar cold-start restore (`client.ready()`) and for session resume
 * to settle (`verified` or logged-out). Until then, treat auth as unknown —
 * do not redirect to login.
 */
export function usePollarBootstrap(): { bootstrapped: boolean } {
  const { getClient } = usePollar();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function finish(): void {
      if (!cancelled) {
        setBootstrapped(true);
      }
    }

    void (async () => {
      const client = getClient() as PollarBootstrapClient;
      try {
        await client.ready();
      } catch {
        finish();
        return;
      }

      if (cancelled) {
        return;
      }

      const current = client.getAuthState();
      if (isResumeSettled(current)) {
        finish();
        return;
      }

      unsubscribe = client.onAuthStateChange((state) => {
        if (isResumeSettled(state)) {
          unsubscribe?.();
          unsubscribe = undefined;
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
          finish();
        }
      });

      timeoutId = setTimeout(() => {
        unsubscribe?.();
        unsubscribe = undefined;
        finish();
      }, RESUME_SETTLE_TIMEOUT_MS);
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [getClient]);

  return { bootstrapped };
}
