/**
 * Pollar keeps `_dpopNonce` only in memory. On reload the first authed call
 * (`GET /auth/session/resume`) goes out without a nonce → DevTools shows
 * `401 SDK_AUTH_DPOP_USE_NONCE / reason: no-nonce` every time.
 *
 * Bind each client so the last server `DPoP-Nonce` survives reloads and is
 * restored before resume runs.
 */

const STORAGE_PREFIX = "pollar:dpop-nonce:";

type DpopClient = {
  apiKey: string;
  _dpopNonce: string | null;
};

const boundClients = new WeakSet<object>();

function storageKey(apiKey: string): string {
  return `${STORAGE_PREFIX}${apiKey}`;
}

function readNonce(apiKey: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return (
      sessionStorage.getItem(storageKey(apiKey)) ??
      localStorage.getItem(storageKey(apiKey))
    );
  } catch {
    return null;
  }
}

function writeNonce(apiKey: string, nonce: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(storageKey(apiKey), nonce);
    localStorage.setItem(storageKey(apiKey), nonce);
  } catch {
    // Private mode / quota — ignore
  }
}

/**
 * Call synchronously right after `new PollarClient(...)`.
 * Must run before the client's first `await` resumes (`keyManager.init`).
 */
export function bindPollarDpopNonce(client: object, apiKey: string): void {
  if (typeof window === "undefined" || boundClients.has(client)) {
    return;
  }
  boundClients.add(client);

  const target = client as DpopClient;
  let current: string | null = readNonce(apiKey);

  Object.defineProperty(target, "_dpopNonce", {
    configurable: true,
    enumerable: true,
    get(): string | null {
      return current;
    },
    set(value: string | null): void {
      current = value;
      // Persist every non-empty nonce. Do not clear storage on `null` —
      // `_clearSession` nulls the field and we still need it on the next cold start.
      if (typeof value === "string" && value.length > 0) {
        writeNonce(apiKey, value);
      }
    },
  });

  if (current) {
    // Trigger setter path so both the in-memory value and storage stay aligned.
    target._dpopNonce = current;
  }
}

/** @deprecated Use {@link bindPollarDpopNonce} — kept so existing imports keep working. */
export function installPollarDpopNoncePersistence(): void {
  // No-op: binding is per-client in getSharedPollarClient.
}
