"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ApiError } from "@repo/config";
import { updateEscrowStatus } from "@repo/features/escrow/services/escrows.service";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { toastError, toastSuccess } from "@repo/ui/lib/toast";

type CancelEscrowButtonProps = {
  escrowId: string;
  status: string;
};

export const CancelEscrowButton = ({
  escrowId,
  status,
}: CancelEscrowButtonProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") {
    return null;
  }

  const isCancelled = normalized === "CANCELLED";

  async function handleConfirm(): Promise<void> {
    try {
      setIsSubmitting(true);
      if (isCancelled) {
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
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : isCancelled
              ? "Could not restore escrow."
              : "Could not cancel escrow.";
      toastError(isCancelled ? "Restore Failed" : "Cancel Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isCancelled ? (
          <Button type="button" variant="outline" className="w-full">
            Restore
          </Button>
        ) : (
          <Button
            type="button"
            variant="destructive"
            className="w-full border border-destructive/30"
          >
            Cancel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCancelled ? "Restore Escrow" : "Cancel Escrow"}
          </DialogTitle>
          <DialogDescription>
            {isCancelled
              ? "This sets the off-chain status back to Initialized. It does not modify the on-chain contract. Continue?"
              : "This updates the off-chain status to Cancelled. It does not modify the on-chain contract. Continue?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setOpen(false)}
          >
            {isCancelled ? "Keep Cancelled" : "Keep Escrow"}
          </Button>
          <Button
            type="button"
            variant={isCancelled ? "default" : "destructive"}
            disabled={isSubmitting}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {isCancelled ? "Restoring…" : "Cancelling…"}
              </span>
            ) : isCancelled ? (
              "Restore Escrow"
            ) : (
              "Cancel Escrow"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
