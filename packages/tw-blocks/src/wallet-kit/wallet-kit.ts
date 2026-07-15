import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";
import { clientEnv, networkConfig } from "@repo/config";

type SdkModule = typeof import("@creit.tech/stellar-wallets-kit/sdk");
type TypesModule = typeof import("@creit.tech/stellar-wallets-kit/types");
type FreighterModuleType =
  typeof import("@creit.tech/stellar-wallets-kit/modules/freighter");
type AlbedoModuleType =
  typeof import("@creit.tech/stellar-wallets-kit/modules/albedo");
type StellarWalletsKitStatic = SdkModule["StellarWalletsKit"];
type NetworksEnum = TypesModule["Networks"];

/**
 * Stellar Wallet Kit — Freighter, Albedo, and WalletConnect only.
 * Loaded only on the client, in response to effects or user actions.
 */
let walletKitPromise: Promise<{
  StellarWalletsKit: StellarWalletsKitStatic;
  Networks: NetworksEnum;
}> | null = null;

function getNetwork(Networks: NetworksEnum) {
  return Networks[networkConfig.walletKitNetwork];
}

const loadWalletKit = async () => {
  if (typeof window === "undefined") {
    throw new Error("StellarWalletsKit is only available in the browser");
  }

  if (!walletKitPromise) {
    walletKitPromise = (async () => {
      const [sdk, types, freighter, albedo, walletConnect] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit/sdk") as Promise<SdkModule>,
        import("@creit.tech/stellar-wallets-kit/types") as Promise<TypesModule>,
        import(
          "@creit.tech/stellar-wallets-kit/modules/freighter"
        ) as Promise<FreighterModuleType>,
        import(
          "@creit.tech/stellar-wallets-kit/modules/albedo"
        ) as Promise<AlbedoModuleType>,
        import("@creit.tech/stellar-wallets-kit/modules/wallet-connect"),
      ]);

      const { StellarWalletsKit } = sdk;
      const { Networks } = types;
      const { FreighterModule } = freighter;
      const { AlbedoModule } = albedo;
      const { WalletConnectModule, WalletConnectTargetChain } = walletConnect;

      const modules: ModuleInterface[] = [
        new FreighterModule(),
        new AlbedoModule(),
      ];

      const projectId = clientEnv.walletConnectProjectId;
      if (projectId) {
        const origin = window.location.origin;
        modules.push(
          new WalletConnectModule({
            projectId,
            metadata: {
              name: "CMinds Funding",
              description:
                "Fund coastal conservation escrows with USDC on Stellar",
              url: origin,
              icons: [`${origin}/favicon.ico`],
            },
            allowedChains: [
              networkConfig.isMainnet
                ? WalletConnectTargetChain.PUBLIC
                : WalletConnectTargetChain.TESTNET,
            ],
          }),
        );
      } else {
        console.warn(
          "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set — WalletConnect will not appear in the wallet modal.",
        );
      }

      StellarWalletsKit.init({
        network: getNetwork(Networks),
        modules,
      });

      return { StellarWalletsKit, Networks };
    })();
  }

  return walletKitPromise;
};

interface SignTransactionParams {
  unsignedTransaction: string;
  address: string;
}

export const openAuthModal = async (): Promise<{ address: string }> => {
  const { StellarWalletsKit } = await loadWalletKit();
  return StellarWalletsKit.authModal();
};

export const getSelectedWallet = async (): Promise<ModuleInterface> => {
  const { StellarWalletsKit } = await loadWalletKit();
  return StellarWalletsKit.selectedModule;
};

export const disconnectWalletKit = async (): Promise<void> => {
  const { StellarWalletsKit } = await loadWalletKit();
  return StellarWalletsKit.disconnect();
};

export const signTransaction = async ({
  unsignedTransaction,
  address,
}: SignTransactionParams): Promise<string> => {
  const { StellarWalletsKit, Networks } = await loadWalletKit();

  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    unsignedTransaction,
    {
      address,
      networkPassphrase: getNetwork(Networks),
    },
  );

  return signedTxXdr;
};
