"use client";

import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useDestinationCheck } from "../hooks/useDestinationCheck";
import { useWithdraw } from "../hooks/useWithdraw";
import { RecommendedWallets } from "./RecommendedWallets";

type WithdrawDialogProps = {
  /** Spendable USDC balance (from Pollar). */
  available: string | null;
};

type DestinationState =
  | { tone: "muted" | "success" | "destructive"; message: string }
  | null;

export const WithdrawDialog = ({ available }: WithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [accepted, setAccepted] = useState(false);

  const { submit, isSubmitting } = useWithdraw({
    onSuccess: () => {
      setIsOpen(false);
      setDestination("");
      setAmount("");
      setAccepted(false);
    },
  });

  const check = useDestinationCheck(destination);
  const availableNumber = available ? Number(available) : 0;
  const amountNumber = Number(amount);
  const amountValid =
    amount.trim().length > 0 &&
    !Number.isNaN(amountNumber) &&
    amountNumber > 0 &&
    amountNumber <= availableNumber;

  const destinationValid = check.data?.status === "ok" && check.settled;

  const canConfirm =
    destinationValid && amountValid && accepted && !isSubmitting;

  const destinationState = resolveDestinationState({
    hasInput: destination.trim().length > 0,
    settled: check.settled,
    isFetching: check.isFetching,
    isError: check.isError,
    status: check.data?.status,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next);
        if (!next) {
          setAccepted(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <ArrowUpRight className="size-4" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-6 p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw USDC</DialogTitle>
          <DialogDescription>
            Send USDC from your Pollar wallet to any Stellar address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="withdraw-destination">Destination wallet</Label>
            <Input
              id="withdraw-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="G… Stellar public key"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
            />
            {destinationState ? (
              <p
                className={cn(
                  "flex items-start gap-1.5 text-xs leading-relaxed",
                  destinationState.tone === "success" && "text-emerald-600",
                  destinationState.tone === "destructive" && "text-destructive",
                  destinationState.tone === "muted" && "text-muted-foreground",
                )}
              >
                {destinationState.tone === "success" ? (
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                ) : destinationState.tone === "destructive" ? (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                ) : check.isFetching ? (
                  <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" />
                ) : null}
                {destinationState.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="withdraw-amount">Amount (USDC)</Label>
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() =>
                  setAmount(availableNumber > 0 ? String(availableNumber) : "")
                }
              >
                Max: {availableNumber}
              </button>
            </div>
            <Input
              id="withdraw-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
            {amount.trim().length > 0 && !amountValid ? (
              <p className="text-xs text-destructive">
                Enter an amount between 0 and your available balance.
              </p>
            ) : null}
          </div>

          <RecommendedWallets />

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background-secondary p-4">
            <Checkbox
              checked={accepted}
              onCheckedChange={(value) => setAccepted(value === true)}
              className="mt-0.5"
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              I understand that CMinds is not responsible for any loss of funds
              if the destination wallet is not activated, lacks a USDC
              trustline, or otherwise does not meet the requirements.
            </span>
          </label>

          <Button
            type="button"
            className="w-full"
            disabled={!canConfirm}
            onClick={() => void submit({ destination, amount })}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Withdrawing…
              </>
            ) : (
              "Confirm Withdrawal"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function resolveDestinationState({
  hasInput,
  settled,
  isFetching,
  isError,
  status,
}: {
  hasInput: boolean;
  settled: boolean;
  isFetching: boolean;
  isError: boolean;
  status: string | undefined;
}): DestinationState {
  if (!hasInput) {
    return null;
  }
  if (!settled || isFetching) {
    return { tone: "muted", message: "Checking destination on-chain…" };
  }
  if (isError) {
    return {
      tone: "destructive",
      message: "Could not verify the destination. Check your connection.",
    };
  }
  switch (status) {
    case "ok":
      return {
        tone: "success",
        message: "Destination verified — activated with a USDC trustline.",
      };
    case "invalid_format":
      return {
        tone: "destructive",
        message: "Enter a valid Stellar address (starts with G).",
      };
    case "not_activated":
      return {
        tone: "destructive",
        message:
          "This wallet is not activated on the network. Funds sent here would be lost.",
      };
    case "no_trustline":
      return {
        tone: "destructive",
        message:
          "This wallet has no USDC trustline. Funds would not arrive — add a USDC trustline first.",
      };
    default:
      return null;
  }
}
