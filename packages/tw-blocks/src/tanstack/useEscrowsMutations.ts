import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePollarSignTransaction } from "@repo/providers/usePollarSignTransaction";
import {
  EscrowType,
  FundEscrowPayload,
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload,
  UpdateMultiReleaseEscrowPayload,
  UpdateSingleReleaseEscrowPayload,
  useFundEscrow,
  useInitializeEscrow,
  useUpdateEscrow,
  ChangeMilestoneStatusPayload,
  useChangeMilestoneStatus,
  ApproveMilestonePayload,
  useApproveMilestone,
  useSendTransaction,
  useStartDispute,
  useReleaseFunds,
  useResolveDispute,
  MultiReleaseStartDisputePayload,
  SingleReleaseStartDisputePayload,
  MultiReleaseReleaseFundsPayload,
  SingleReleaseReleaseFundsPayload,
  MultiReleaseResolveDisputePayload,
  SingleReleaseResolveDisputePayload,
  WithdrawRemainingFundsPayload,
  useWithdrawRemainingFunds,
} from "@trustless-work/escrow";

/**
 * Use the mutations to interact with the escrows
 *
 * Flow: TW builds unsigned XDR → Pollar signs → TW sends
 *
 * - Deploy Escrow
 * - Update Escrow
 * - Fund Escrow
 * - Change Milestone Status
 * - Approve Milestone
 * - Start Dispute
 * - Release Funds
 * - Resolve Dispute
 */
export const useEscrowsMutations = () => {
  const queryClient = useQueryClient();
  const { signTransaction } = usePollarSignTransaction();
  const { deployEscrow } = useInitializeEscrow();
  const { updateEscrow } = useUpdateEscrow();
  const { fundEscrow } = useFundEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { approveMilestone } = useApproveMilestone();
  const { sendTransaction } = useSendTransaction();
  const { startDispute } = useStartDispute();
  const { releaseFunds } = useReleaseFunds();
  const { resolveDispute } = useResolveDispute();
  const { withdrawRemainingFunds } = useWithdrawRemainingFunds();

  async function signAndSend(unsignedTransaction: string) {
    const signedTxXdr = await signTransaction(unsignedTransaction);

    if (!signedTxXdr) {
      throw new Error("Signed transaction is missing.");
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== "SUCCESS") {
      throw new Error("Transaction failed to send");
    }

    return response;
  }

  /**
   * Deploy Escrow
   */
  const deployEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload:
        | InitializeSingleReleaseEscrowPayload
        | InitializeMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await deployEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from deployEscrow response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Update Escrow
   */
  const updateEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload:
        | UpdateSingleReleaseEscrowPayload
        | UpdateMultiReleaseEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await updateEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from updateEscrow response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Fund Escrow
   */
  const fundEscrowMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload: FundEscrowPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await fundEscrow(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from fundEscrow response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Approve Milestone
   */
  const approveMilestoneMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload: ApproveMilestonePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await approveMilestone(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from approveMilestone response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Change Milestone Status
   */
  const changeMilestoneStatusMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload: ChangeMilestoneStatusPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await changeMilestoneStatus(
        payload,
        type
      );

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from changeMilestoneStatus response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Start Dispute
   */
  const startDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload:
        | MultiReleaseStartDisputePayload
        | SingleReleaseStartDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await startDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from startDispute response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Release Funds
   */
  const releaseFundsMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload:
        | MultiReleaseReleaseFundsPayload
        | SingleReleaseReleaseFundsPayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await releaseFunds(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from releaseFunds response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Resolve Dispute
   */
  const resolveDisputeMutation = useMutation({
    mutationFn: async ({
      payload,
      type,
    }: {
      payload:
        | MultiReleaseResolveDisputePayload
        | SingleReleaseResolveDisputePayload;
      type: EscrowType;
      address: string;
    }) => {
      const { unsignedTransaction } = await resolveDispute(payload, type);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from resolveDispute response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  /**
   * Withdraw Remaining Funds
   */
  const withdrawRemainingFundsMutation = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: WithdrawRemainingFundsPayload;
      address: string;
    }) => {
      const { unsignedTransaction } = await withdrawRemainingFunds(payload);

      if (!unsignedTransaction) {
        throw new Error(
          "Unsigned transaction is missing from withdrawRemainingFunds response."
        );
      }

      return signAndSend(unsignedTransaction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrows"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    deployEscrow: deployEscrowMutation,
    updateEscrow: updateEscrowMutation,
    fundEscrow: fundEscrowMutation,
    changeMilestoneStatus: changeMilestoneStatusMutation,
    approveMilestone: approveMilestoneMutation,
    startDispute: startDisputeMutation,
    releaseFunds: releaseFundsMutation,
    resolveDispute: resolveDisputeMutation,
    withdrawRemainingFunds: withdrawRemainingFundsMutation,
  };
};
