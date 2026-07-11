import type { ModuleInterface } from "@creit.tech/stellar-wallets-kit/types";
import { networkConfig } from "@repo/config";

type SdkModule = typeof import("@creit.tech/stellar-wallets-kit/sdk");
type TypesModule = typeof import("@creit.tech/stellar-wallets-kit/types");
type ModulesUtilsModule =
  typeof import("@creit.tech/stellar-wallets-kit/modules/utils");
type FreighterModuleType =
  typeof import("@creit.tech/stellar-wallets-kit/modules/freighter");
type StellarWalletsKitStatic = SdkModule["StellarWalletsKit"];
type NetworksEnum = TypesModule["Networks"];

/**
 * Stellar Wallet Kit helpers — Freighter-first for the CMinds pilot.
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
      const [sdk, types, modules, freighter] = await Promise.all([
        import("@creit.tech/stellar-wallets-kit/sdk") as Promise<SdkModule>,
        import("@creit.tech/stellar-wallets-kit/types") as Promise<TypesModule>,
        import(
          "@creit.tech/stellar-wallets-kit/modules/utils"
        ) as Promise<ModulesUtilsModule>,
        import(
          "@creit.tech/stellar-wallets-kit/modules/freighter"
        ) as Promise<FreighterModuleType>,
      ]);

      const { StellarWalletsKit } = sdk;
      const { Networks } = types;
      const { defaultModules } = modules;
      const { FreighterModule, FREIGHTER_ID } = freighter;

      const freighterModule = new FreighterModule();
      const modulesList = defaultModules();
      const freighterFirst = [
        freighterModule,
        ...modulesList.filter((m) => m.productId !== FREIGHTER_ID),
      ];

      StellarWalletsKit.init({
        network: getNetwork(Networks),
        modules: freighterFirst,
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
