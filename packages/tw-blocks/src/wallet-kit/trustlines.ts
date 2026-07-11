/**
 * Trustlines | Non-Native Tokens from Stellar
 *
 * Filtered by the active network via `@repo/config` networkConfig.
 */
import { networkConfig } from "@repo/config";

export const trustlines = networkConfig.getAssets().map((asset) => ({
  ...asset,
  network: networkConfig.id,
}));

export const trustlineOptions = networkConfig.getTrustlineOptions();
