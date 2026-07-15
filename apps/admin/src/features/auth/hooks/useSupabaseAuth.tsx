"use client";

import { clearAuthToken, setAuthTokenProvider } from "@repo/config";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "../services/supabase-browser";
import {
  getVerifiedTotpFactor,
  parseAal,
  type AalLevel,
} from "../utils/aal";

type AuthStatus = "loading" | "ready" | "unconfigured";

type AuthSnapshot = {
  status: AuthStatus;
  session: Session | null;
  aal: AalLevel | null;
  hasVerifiedTotp: boolean;
};

type SupabaseAuthContextValue = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  accessToken: string | null;
  aal: AalLevel | null;
  hasVerifiedTotp: boolean;
  refreshAuthState: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(
  null,
);

function initialSnapshot(configured: boolean): AuthSnapshot {
  return {
    status: configured ? "loading" : "unconfigured",
    session: null,
    aal: null,
    hasVerifiedTotp: false,
  };
}

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(() =>
    initialSnapshot(configured),
  );
  const resolvedTokenRef = useRef<string | null>(null);
  const syncChainRef = useRef<Promise<void>>(Promise.resolve());

  const applySession = useCallback(async (nextSession: Session | null) => {
    const nextToken = nextSession?.access_token ?? null;

    if (!nextSession || !nextToken) {
      resolvedTokenRef.current = null;
      clearAuthToken();
      setSnapshot({
        status: "ready",
        session: null,
        aal: null,
        hasVerifiedTotp: false,
      });
      return;
    }

    setAuthTokenProvider(() => nextSession.access_token);

    if (resolvedTokenRef.current === nextToken) {
      setSnapshot((prev) => ({
        ...prev,
        status: "ready",
        session: nextSession,
      }));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const [{ data: aalData }, { data: factorsData }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);

    resolvedTokenRef.current = nextToken;
    setSnapshot({
      status: "ready",
      session: nextSession,
      aal: parseAal(aalData?.currentLevel),
      hasVerifiedTotp: Boolean(
        getVerifiedTotpFactor(factorsData?.totp ?? factorsData?.all),
      ),
    });
  }, []);

  const enqueueSync = useCallback(
    (nextSession: Session | null) => {
      syncChainRef.current = syncChainRef.current
        .catch(() => undefined)
        .then(() => applySession(nextSession));
      return syncChainRef.current;
    },
    [applySession],
  );

  const refreshAuthState = useCallback(async () => {
    if (!configured) {
      setSnapshot(initialSnapshot(false));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      await enqueueSync(null);
      return;
    }

    // Force MFA re-read on explicit refresh.
    resolvedTokenRef.current = null;
    await enqueueSync(data.session);
  }, [configured, enqueueSync]);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void enqueueSync(nextSession);
    });

    return () => {
      subscription.unsubscribe();
      clearAuthToken();
    };
  }, [configured, enqueueSync]);

  const signOut = useCallback(async () => {
    if (!configured) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    resolvedTokenRef.current = null;
    await enqueueSync(null);
  }, [configured, enqueueSync]);

  const value = useMemo<SupabaseAuthContextValue>(
    () => ({
      status: snapshot.status,
      session: snapshot.session,
      user: snapshot.session?.user ?? null,
      accessToken: snapshot.session?.access_token ?? null,
      aal: snapshot.aal,
      hasVerifiedTotp: snapshot.hasVerifiedTotp,
      refreshAuthState,
      signOut,
    }),
    [snapshot, refreshAuthState, signOut],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthContextValue {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return ctx;
}
