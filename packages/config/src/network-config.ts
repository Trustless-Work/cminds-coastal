import { ClientEnv, clientEnv } from "./client-env";

export type StellarNetworkId = "testnet" | "mainnet";

export type WalletKitNetworkKey = "PUBLIC" | "TESTNET";

export interface NetworkAsset {
  symbol: string;
  address: string;
  network: StellarNetworkId;
}

export interface TrustlineOption {
  value: string;
  label: string;
}

const STELLAR_ASSETS: ReadonlyArray<NetworkAsset> = [
  {
    symbol: "USDC",
    address: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    network: "testnet",
  },
  {
    symbol: "EURC",
    address: "GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO",
    network: "testnet",
  },
  {
    symbol: "USDC",
    address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    network: "mainnet",
  },
  {
    symbol: "EURC",
    address: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2",
    network: "mainnet",
  },
];

/**
 * Derived Stellar / Trustless Work / Pollar network settings.
 * Driven by `NEXT_PUBLIC_USE_MAINNET` via ClientEnv — do not hardcode networks elsewhere.
 */
export class NetworkConfig {
  constructor(private readonly env: ClientEnv = clientEnv) {}

  get isMainnet(): boolean {
    return this.env.useMainnet;
  }

  get id(): StellarNetworkId {
    return this.isMainnet ? "mainnet" : "testnet";
  }

  get label(): "Mainnet" | "Testnet" {
    return this.isMainnet ? "Mainnet" : "Testnet";
  }

  /** Pollar `stellarNetwork` prop */
  get pollarNetwork(): StellarNetworkId {
    return this.id;
  }

  /** Key into Stellar Wallets Kit `Networks.PUBLIC` | `Networks.TESTNET` */
  get walletKitNetwork(): WalletKitNetworkKey {
    return this.isMainnet ? "PUBLIC" : "TESTNET";
  }

  /** Horizon REST endpoint for the active network. */
  get horizonUrl(): string {
    return this.isMainnet
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org";
  }

  /** Trustless Work Escrow Viewer (read-only dApp). */
  getEscrowViewerUrl(contractId: string): string {
    return `https://viewer.trustlesswork.com/${encodeURIComponent(contractId)}`;
  }

  get usdcIssuer(): string {
    return this.requireAssetIssuer("USDC");
  }

  get eurcIssuer(): string {
    return this.requireAssetIssuer("EURC");
  }

  getAssets(): ReadonlyArray<{ symbol: string; address: string }> {
    return STELLAR_ASSETS.filter((asset) => asset.network === this.id).map(
      ({ symbol, address }) => ({ symbol, address }),
    );
  }

  getTrustlineOptions(): ReadonlyArray<TrustlineOption> {
    return Array.from(
      new Map(
        this.getAssets().map((asset) => [
          asset.address,
          { value: asset.address, label: asset.symbol },
        ]),
      ).values(),
    );
  }

  private requireAssetIssuer(symbol: string): string {
    const asset = STELLAR_ASSETS.find(
      (entry) => entry.symbol === symbol && entry.network === this.id,
    );
    if (!asset) {
      throw new Error(
        `No ${symbol} issuer configured for network "${this.id}"`,
      );
    }
    return asset.address;
  }
}

export const networkConfig = new NetworkConfig();
