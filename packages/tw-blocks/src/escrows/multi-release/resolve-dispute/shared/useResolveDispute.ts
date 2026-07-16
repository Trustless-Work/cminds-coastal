import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resolveDisputeSchema, type ResolveDisputeValues } from "./schema";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import {
  MultiReleaseResolveDisputePayload,
  MultiReleaseMilestone,
} from "@trustless-work/escrow";
import { useEscrowContext } from "@repo/providers/EscrowProvider";
import { useEscrowsMutations } from "../../../../tanstack/useEscrowsMutations";
import { ErrorResponse, handleError } from "../../../../handle-errors/handle";
import { useWalletContext } from "@repo/providers/WalletProvider";

type DistributionInput = { address: string; amount: string | number };

export function useResolveDispute({
  onSuccess,
}: {
  onSuccess?: (milestones: MultiReleaseMilestone[]) => void;
} = {}) {
  const { resolveDispute } = useEscrowsMutations();
  const { selectedEscrow, updateEscrow } = useEscrowContext();
  const { walletAddress } = useWalletContext();

  const form = useForm<ResolveDisputeValues>({
    resolver: zodResolver(resolveDisputeSchema),
    defaultValues: {
      distributions: [{ address: "", amount: "" }],
      milestoneIndex: "0",
    },
    mode: "onChange",
  });

  const totalAmount = React.useMemo(() => {
    if (selectedEscrow?.type !== "multi-release") return 0;
    const milestones = selectedEscrow.milestones as MultiReleaseMilestone[];
    return milestones.reduce(
      (acc, milestone) => acc + Number(milestone.amount),
      0,
    );
  }, [selectedEscrow]);

  const milestoneIndexWatch = form.watch("milestoneIndex");

  const allowedAmount = React.useMemo(() => {
    if (selectedEscrow?.type !== "multi-release") return 0;
    const idx = Number(milestoneIndexWatch);
    const milestones = selectedEscrow.milestones as MultiReleaseMilestone[];
    const m = milestones?.[idx];
    const amount = m?.amount;
    // Handle both string and number types
    if (amount === undefined || amount === null) return 0;
    const numAmount =
      typeof amount === "string" ? Number(amount) : Number(amount);
    return isNaN(numAmount) ? 0 : numAmount;
  }, [selectedEscrow, milestoneIndexWatch]);

  const distributions = form.watch("distributions") as DistributionInput[];

  const distributedSum = React.useMemo(() => {
    return (distributions || []).reduce((acc, d) => {
      const n = Number(d?.amount ?? 0);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }, [distributions]);

  const isExactMatch = React.useMemo(() => {
    const allowed = Number(allowedAmount);
    const distributed = Number(distributedSum);
    // Use epsilon comparison for floating point numbers
    // Round to 2 decimal places to avoid precision issues
    const roundedAllowed = Math.round(allowed * 100) / 100;
    const roundedDistributed = Math.round(distributed * 100) / 100;
    return Math.abs(roundedAllowed - roundedDistributed) < 0.01;
  }, [allowedAmount, distributedSum]);

  const difference = React.useMemo(() => {
    const allowed = Number(allowedAmount);
    const distributed = Number(distributedSum);
    // Round to 2 decimal places to avoid precision issues
    const roundedAllowed = Math.round(allowed * 100) / 100;
    const roundedDistributed = Math.round(distributed * 100) / 100;
    return Math.abs(roundedAllowed - roundedDistributed);
  }, [allowedAmount, distributedSum]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDistributionAddressChange = (index: number, value: string) => {
    const updated = [...distributions];
    const current = updated[index] ?? { address: "", amount: "" };
    updated[index] = { ...current, address: value };
    form.setValue("distributions", updated);
  };

  const handleDistributionAmountChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let rawValue = e.target.value;
    rawValue = rawValue.replace(/[^0-9.]/g, "");
    if (rawValue.split(".").length > 2) {
      rawValue = rawValue.slice(0, -1);
    }
    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
      if (parts[1] && parts[1].length > 2) {
        rawValue = parts[0] + "." + parts[1].slice(0, 2);
      }
    }
    const updated = [...distributions];
    const current = updated[index] ?? { address: "", amount: "" };
    updated[index] = { ...current, amount: rawValue };
    form.setValue("distributions", updated);
  };

  const handleAddDistribution = () => {
    const updated = [...distributions, { address: "", amount: "" }];
    form.setValue("distributions", updated);
  };

  const handleRemoveDistribution = (index: number) => {
    if (distributions.length <= 1) return;
    const updated = distributions.filter((_, i) => i !== index);
    form.setValue("distributions", updated);
  };

  const isAnyDistributionEmpty = React.useMemo(() => {
    if (!distributions.length) return true;
    const last = distributions[distributions.length - 1];
    if (!last) return true;
    return (last.address || "").trim() === "" || (last.amount ?? "") === "";
  }, [distributions]);

  const handleSubmit = form.handleSubmit(async (payload) => {
    try {
      setIsSubmitting(true);

      if (!isExactMatch) {
        toastError(
          "Invalid Distributions",
          "The total distributions must equal the task amount.",
        );
        return;
      }

      const finalPayload: MultiReleaseResolveDisputePayload = {
        contractId: selectedEscrow?.contractId || "",
        disputeResolver: walletAddress || "",
        milestoneIndex: String(payload.milestoneIndex),
        distributions: payload.distributions.map((d) => ({
          address: d.address,
          amount: Number(d.amount || 0),
        })) as [{ address: string; amount: number }],
      };

      await resolveDispute.mutateAsync({
        payload: finalPayload,
        type: "multi-release",
        address: walletAddress || "",
      });

      toastSuccess(
        "Dispute Resolved",
        "Funds were distributed according to your resolution.",
      );

      const sumDistributed = payload.distributions.reduce((acc, d) => {
        const n = Number(d.amount || 0);
        return acc + (isNaN(n) ? 0 : n);
      }, 0);

      const nextMilestones = (selectedEscrow?.milestones ?? []).map(
        (milestone, index) => {
          if (index === Number(payload.milestoneIndex)) {
            return {
              ...milestone,
              flags: {
                ...(milestone as MultiReleaseMilestone).flags,
                disputed: false,
                resolved: true,
              },
            };
          }
          return milestone;
        },
      ) as MultiReleaseMilestone[];

      updateEscrow({
        ...selectedEscrow,
        milestones: nextMilestones,
        balance: (selectedEscrow?.balance || 0) - sumDistributed || 0,
      });

      onSuccess?.(nextMilestones);
    } catch (error) {
      toastError(
        "Resolve Dispute Failed",
        handleError(error as ErrorResponse).message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  });

  return {
    form,
    handleSubmit,
    isSubmitting,
    totalAmount,
    distributions,
    handleAddDistribution,
    handleRemoveDistribution,
    handleDistributionAddressChange,
    handleDistributionAmountChange,
    isAnyDistributionEmpty,
    allowedAmount,
    distributedSum,
    isExactMatch,
    difference,
  };
}
