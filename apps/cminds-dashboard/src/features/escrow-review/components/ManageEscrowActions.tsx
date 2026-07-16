"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  RotateCcw,
  Wallet,
  XCircle,
} from "lucide-react";
import { ApiError } from "@repo/config";
import { updateEscrowStatus } from "@repo/features/escrow/services/escrows.service";
import { areAllMilestonesSettled } from "@repo/helpers";
import { UpdateEscrowDialog } from "@repo/tw-blocks/escrows/multi-release/update-escrow/dialog/UpdateEscrow";
import { WithdrawRemainingFundsDialog } from "@repo/tw-blocks/escrows/multi-release/withdraw-remaining-funds/dialog/WithdrawRemainingFunds";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { IconActionButton } from "@repo/ui/components/icon-action-button";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";
import type { MultiReleaseMilestone } from "@trustless-work/escrow/types";

type ManageEscrowActionsProps = {
  escrowId: string;
  status: string;
  showUpdate: boolean;
  milestones?: MultiReleaseMilestone[];
  /** Precomputed settle check from the same milestone source as task badges. */
  milestonesSettled?: boolean;
  balance?: number;
};

type ConfirmAction = "complete" | "cancel" | "restore" | null;

export const ManageEscrowActions = ({
  escrowId,
  status,
  showUpdate,
  milestones,
  milestonesSettled: milestonesSettledProp,
  balance,
}: ManageEscrowActionsProps) => {
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalized = status.toUpperCase();
  const isCompleted = normalized === "COMPLETED";
  const isCancelled = normalized === "CANCELLED";
  const milestonesSettled =
    milestonesSettledProp ?? areAllMilestonesSettled(milestones ?? []);
  const remainingBalance = Number(balance ?? 0);
  const hasRemainingBalance =
    Number.isFinite(remainingBalance) && remainingBalance > 0;
  /**
   * Complete is available when every milestone is released or resolved.
   * Shown even if already COMPLETED (disabled) so the action stays visible.
   */
  const showComplete = !isCancelled && milestonesSettled;
  const canComplete = showComplete && !isCompleted;
  /** TW: all milestones released/resolved + non-zero remaining balance. */
  const canWithdraw = !isCancelled && milestonesSettled && hasRemainingBalance;
  /** Cancel is unavailable after all milestones are settled. */
  const showCancel = !isCompleted && !isCancelled && !milestonesSettled;
  const showRestore = isCancelled;
  const hasActions =
    showUpdate || showComplete || canWithdraw || showCancel || showRestore;

  if (!hasActions) {
    return null;
  }

  async function handleConfirm(): Promise<void> {
    if (!confirmAction) return;

    try {
      setIsSubmitting(true);

      if (confirmAction === "complete") {
        await updateEscrowStatus(escrowId, "COMPLETED");
        toastSuccess(
          "Escrow Completed",
          "Off-chain status is now Completed.",
        );
      } else if (confirmAction === "restore") {
        await updateEscrowStatus(escrowId, "INITIALIZED");
        toastSuccess(
          "Escrow Restored",
          "Off-chain status is back to Initialized.",
        );
      } else {
        await updateEscrowStatus(escrowId, "CANCELLED");
        toastSuccess("Escrow Cancelled", "Off-chain status is now Cancelled.");
      }

      void queryClient.invalidateQueries({ queryKey: ["escrows"] });
      setConfirmAction(null);
    } catch (error) {
      const fallback =
        confirmAction === "complete"
          ? "Could not complete escrow."
          : confirmAction === "restore"
            ? "Could not restore escrow."
            : "Could not cancel escrow.";
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : fallback;
      const title =
        confirmAction === "complete"
          ? "Complete Failed"
          : confirmAction === "restore"
            ? "Restore Failed"
            : "Cancel Failed";
      toastError(title, message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const confirmCopy =
    confirmAction === "complete"
      ? {
          title: "Complete Escrow",
          description:
            "This updates the off-chain status to Completed. It does not modify the on-chain contract. Continue?",
          dismiss: "Keep Escrow",
          confirm: "Complete Escrow",
          pending: "Completing…",
          variant: "default" as const,
        }
      : confirmAction === "restore"
        ? {
            title: "Restore Escrow",
            description:
              "This sets the off-chain status back to Initialized. It does not modify the on-chain contract. Continue?",
            dismiss: "Keep Cancelled",
            confirm: "Restore Escrow",
            pending: "Restoring…",
            variant: "default" as const,
          }
        : {
            title: "Cancel Escrow",
            description:
              "This updates the off-chain status to Cancelled. It does not modify the on-chain contract. Continue?",
            dismiss: "Keep Escrow",
            confirm: "Cancel Escrow",
            pending: "Cancelling…",
            variant: "destructive" as const,
          };

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-sm font-medium text-foreground">Manage Escrow</p>

      <TooltipProvider delay={200}>
        <div className="flex flex-wrap items-center gap-2">
          {showUpdate ? (
            <UpdateEscrowDialog
              renderTrigger={(open) => (
                <IconActionButton
                  label="Update"
                  icon={<Pencil className="size-4" />}
                  onClick={open}
                />
              )}
            />
          ) : null}

          {showComplete ? (
            <IconActionButton
              label={canComplete ? "Complete" : "Already completed"}
              icon={<CheckCircle2 className="size-4" />}
              disabled={!canComplete}
              onClick={() => setConfirmAction("complete")}
            />
          ) : null}

          {canWithdraw ? (
            <WithdrawRemainingFundsDialog
              renderTrigger={(open) => (
                <IconActionButton
                  label="Withdraw Remaining Funds"
                  icon={<Wallet className="size-4" />}
                  onClick={open}
                />
              )}
            />
          ) : null}

          {showCancel ? (
            <IconActionButton
              label="Cancel"
              icon={<XCircle className="size-4" />}
              variant="destructive"
              onClick={() => setConfirmAction("cancel")}
            />
          ) : null}

          {showRestore ? (
            <IconActionButton
              label="Restore"
              icon={<RotateCcw className="size-4" />}
              onClick={() => setConfirmAction("restore")}
            />
          ) : null}
        </div>
      </TooltipProvider>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setConfirmAction(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmCopy.title}</DialogTitle>
            <DialogDescription>{confirmCopy.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmAction(null)}
            >
              {confirmCopy.dismiss}
            </Button>
            <Button
              type="button"
              variant={confirmCopy.variant}
              disabled={isSubmitting}
              onClick={() => {
                void handleConfirm();
              }}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  {confirmCopy.pending}
                </span>
              ) : (
                confirmCopy.confirm
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
