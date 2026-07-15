import { PollarClient, type StellarNetwork } from "@pollar/core";

import { bindPollarDpopNonce } from "./pollar-dpop-nonce";

const clients = new Map<string, PollarClient>();

/**
 * One PollarClient per apiKey + network for the browser lifetime.
 * Avoids React Strict Mode / remount creating a second client that shares the
 * same refresh token and races DPoP resume.
 */
export function getSharedPollarClient(
  apiKey: string,
  stellarNetwork: StellarNetwork,
): PollarClient {
  const key = `${apiKey}:${stellarNetwork}`;
  const existing = clients.get(key);
  if (existing) {
    return existing;
  }

  const client = new PollarClient({ apiKey, stellarNetwork });
  // Must run in the same sync turn as construction — before keyManager.init()
  // continues and calls /auth/session/resume.
  bindPollarDpopNonce(client, apiKey);
  clients.set(key, client);
  return client;
}
