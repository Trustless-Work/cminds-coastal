export type BuildEscrowTrustline = {
  address: string;
  symbol: string;
};

export type BuildEscrowSelectedTask = {
  code: string;
  name: string;
  amount: number;
  receiverWalletAddress: string;
  customDescription?: string;
};

export type BuildEscrowInput = {
  title: string;
  description: string;
  engagementId: string;
  signerAddress: string;
  cmindsWalletAddress: string;
  releaseSignerWalletAddress: string;
  selectedTasks: BuildEscrowSelectedTask[];
  platformFee?: number;
  trustline: BuildEscrowTrustline;
};

export type BuildEscrowMilestone = {
  description: string;
  amount: number;
  receiver: string;
};

export type BuildEscrowPayload = {
  signer: string;
  engagementId: string;
  title: string;
  description: string;
  platformFee: number;
  trustline: BuildEscrowTrustline;
  roles: {
    approver: string;
    serviceProvider: string;
    platformAddress: string;
    releaseSigner: string;
    disputeResolver: string;
  };
  milestones: BuildEscrowMilestone[];
};

const DEFAULT_PLATFORM_FEE = 0;

/**
 * Maps community create-form inputs into a multi-release Trustless Work
 * initialize payload. Hides static/derived roles and trustline wiring.
 */
export function buildEscrow(input: BuildEscrowInput): BuildEscrowPayload {
  if (!input.selectedTasks.length) {
    throw new Error("At least one task is required");
  }

  const cminds = input.cmindsWalletAddress.trim();
  const releaseSigner = input.releaseSignerWalletAddress.trim();
  const signer = input.signerAddress.trim();

  if (!cminds || !releaseSigner || !signer) {
    throw new Error("Signer, CMinds, and release signer wallets are required");
  }

  return {
    signer,
    engagementId: input.engagementId.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    platformFee: input.platformFee ?? DEFAULT_PLATFORM_FEE,
    trustline: {
      address: input.trustline.address,
      symbol: input.trustline.symbol,
    },
    roles: {
      approver: cminds,
      serviceProvider: signer,
      platformAddress: cminds,
      releaseSigner,
      disputeResolver: cminds,
    },
    milestones: input.selectedTasks.map((task) => {
      const base = `[${task.code}] ${task.name}`;
      const description = task.customDescription?.trim()
        ? `${base}: ${task.customDescription.trim()}`
        : base;
      const receiver = task.receiverWalletAddress.trim();
      if (!receiver) {
        throw new Error(`Receiver wallet is required for task ${task.code}`);
      }

      return {
        description,
        amount: task.amount,
        receiver,
      };
    }),
  };
}
