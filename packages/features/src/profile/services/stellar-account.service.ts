import { networkConfig } from "@repo/config";
import { Horizon, StrKey } from "@stellar/stellar-sdk";

export type DestinationCheckStatus =
  | "invalid_format"
  | "not_activated"
  | "no_trustline"
  | "ok";

export type DestinationCheck = {
  status: DestinationCheckStatus;
};

/**
 * Verifies a withdrawal destination on-chain via Horizon:
 * the account must be activated (exists) and hold a USDC trustline,
 * otherwise a USDC payment to it would fail / funds would not arrive.
 */
export async function checkUsdcDestination(
  address: string,
): Promise<DestinationCheck> {
  const trimmed = address.trim();

  if (!StrKey.isValidEd25519PublicKey(trimmed)) {
    return { status: "invalid_format" };
  }

  const server = new Horizon.Server(networkConfig.horizonUrl);
  const usdcIssuer = networkConfig.usdcIssuer;

  try {
    const account = await server.loadAccount(trimmed);
    const hasUsdcTrustline = account.balances.some(
      (balance) =>
        "asset_code" in balance &&
        balance.asset_code === "USDC" &&
        "asset_issuer" in balance &&
        balance.asset_issuer === usdcIssuer,
    );
    return { status: hasUsdcTrustline ? "ok" : "no_trustline" };
  } catch (error) {
    const httpStatus = (error as { response?: { status?: number } })?.response
      ?.status;
    if (httpStatus === 404) {
      return { status: "not_activated" };
    }
    throw error;
  }
}
